const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

let geminiClient = null;
let groqClient = null;

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

function isQuotaError(err) {
  if (!err) return false;
  if (err.status === 429) return true;
  const msg = (err.message || "").toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate limit") ||
    msg.includes("rate_limit_exceeded")
  );
}

async function generateWithGemini(prompt, jsonMode = false) {
  const client = getGemini();
  const config = {
    temperature: jsonMode ? 0.2 : 0.75,
    maxOutputTokens: jsonMode ? 1024 : 8192,
    thinkingConfig: { thinkingBudget: 0 },
  };
  if (jsonMode) config.responseMimeType = "application/json";

  const res = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config,
  });

  const text = (res.text || "").trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

async function generateWithGroq(prompt, jsonMode = false) {
  const client = getGroq();
  const options = {
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: jsonMode ? 0.2 : 0.75,
    max_tokens: jsonMode ? 1024 : 8192,
  };
  if (jsonMode) options.response_format = { type: "json_object" };

  const res = await client.chat.completions.create(options);
  const text = res.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq returned an empty response");
  return text;
}

// Main export — tries Gemini first, falls back to Groq on quota errors
async function generate(prompt, { jsonMode = false, label = "" } = {}) {
  try {
    const text = await generateWithGemini(prompt, jsonMode);
    return { text, provider: "gemini" };
  } catch (err) {
    if (isQuotaError(err)) {
      console.log(`  ⚠️  Gemini quota hit${label ? ` (${label})` : ""} — switching to Groq...`);
      const text = await generateWithGroq(prompt, jsonMode);
      return { text, provider: "groq" };
    }
    throw err;
  }
}

module.exports = { generate };
