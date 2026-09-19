const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Known deprecated Groq models to ignore
const DEPRECATED_GROQ_MODELS = new Set([
  "llama-3.1-70b-versatile",
  "llama-3.3-70b-versatile",
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
]);

// Active Groq models in order of preference
const DEFAULT_GROQ_CANDIDATES = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
];

function getGroqCandidateModels() {
  const envModel = process.env.GROQ_MODEL?.trim();
  const list = [];
  if (envModel && !DEPRECATED_GROQ_MODELS.has(envModel)) {
    list.push(envModel);
  }
  for (const m of DEFAULT_GROQ_CANDIDATES) {
    if (!list.includes(m)) list.push(m);
  }
  return list;
}

let geminiClient = null;
let groqClient = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getGemini() {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set in .env");
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

function getGroq() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set in .env");
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// Returns true for any Gemini error where falling back or retrying makes sense:
// quota exhaustion (429), temporary overload (503), model unavailable, etc.
function isFallbackError(err) {
  if (!err) return false;
  if (err.status === 429 || err.status === 503 || err.code === 503 || err.code === 429) return true;
  const msg = (err.message || "").toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("quota") ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate limit") ||
    msg.includes("rate_limit_exceeded") ||
    msg.includes("overloaded") ||
    msg.includes("unavailable") ||
    msg.includes("high demand") ||
    msg.includes("spikes in demand") ||
    msg.includes("try again later")
  );
}

async function generateWithGemini(prompt, jsonMode = false, maxRetries = 2) {
  const client = getGemini();
  const config = {
    temperature: jsonMode ? 0.2 : 0.75,
    maxOutputTokens: jsonMode ? 1024 : 8192,
    thinkingConfig: { thinkingBudget: 0 },
  };
  if (jsonMode) config.responseMimeType = "application/json";

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const res = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config,
      });

      const text = (res.text || "").trim();
      if (!text) throw new Error("Gemini returned an empty response");
      return text;
    } catch (err) {
      if (attempt <= maxRetries && isFallbackError(err)) {
        const delay = attempt * 3000;
        console.warn(`  ⏳ Gemini transient issue (${err.status || err.code || "busy"}). Retrying in ${delay / 1000}s (attempt ${attempt}/${maxRetries})...`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
}

async function generateWithGroq(prompt, jsonMode = false) {
  const client = getGroq();
  const candidateModels = getGroqCandidateModels();
  let lastErr = null;

  for (const model of candidateModels) {
    try {
      const options = {
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: jsonMode ? 0.2 : 0.75,
        max_tokens: jsonMode ? 1024 : 8192,
      };
      if (jsonMode) options.response_format = { type: "json_object" };

      const res = await client.chat.completions.create(options);
      const text = res.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error(`Groq model ${model} returned an empty response`);
      return text;
    } catch (err) {
      lastErr = err;
      console.warn(`  ⚠️  Groq model (${model}) failed: ${err.message}`);
    }
  }

  throw lastErr || new Error("All Groq fallback models failed");
}

// Main export — tries Gemini first, falls back to Groq on errors
async function generate(prompt, { jsonMode = false, label = "" } = {}) {
  try {
    const text = await generateWithGemini(prompt, jsonMode);
    return { text, provider: "gemini" };
  } catch (err) {
    console.warn(`  ⚠️  Gemini error${label ? ` (${label})` : ""}: ${err.message}`);
    if (process.env.GROQ_API_KEY) {
      console.log(`  🔄 Switching to Groq fallback...`);
      try {
        const text = await generateWithGroq(prompt, jsonMode);
        return { text, provider: "groq" };
      } catch (groqErr) {
        console.error(`  ❌ Groq fallback also failed: ${groqErr.message}`);
        throw err;
      }
    }
    throw err;
  }
}

module.exports = { generate };

