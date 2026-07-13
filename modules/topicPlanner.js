const { generate } = require("./aiClient");
const { buildTopicPrompt } = require("../prompts/topicPrompt");
const { COUNTRIES, SERVICES } = require("../config");

// Fallback: rule-based picker when --country or --service is forced via CLI
function pickForced(forcedCountry, forcedService) {
  let country = null;
  let service = null;

  if (forcedCountry) {
    country = COUNTRIES.find((c) => c.code === forcedCountry);
    if (!country) throw new Error(`Unknown --country="${forcedCountry}". Valid: ${COUNTRIES.map((c) => c.code).join(", ")}`);
  }
  if (forcedService) {
    service = SERVICES.find((s) => s.key === forcedService);
    if (!service) throw new Error(`Unknown --service="${forcedService}". Valid: ${SERVICES.map((s) => s.key).join(", ")}`);
  }

  // Fill missing with first available
  if (!country) country = COUNTRIES[0];
  if (!service) service = SERVICES[0];

  return {
    country,
    service,
    aiTopic: {
      title: null, // will be AI generated in contentGenerator
      primaryKeyword: `${service.name} ${country.name}`,
      secondaryKeywords: [],
      angle: `${service.name} guide for ${country.name} businesses`,
      targetAudience: `${country.name} businesses`,
      trendSignal: "Manually forced topic",
      contentDirection: `Write a comprehensive ${service.name} guide for ${country.name} businesses in ${new Date().getFullYear()}.`,
      whyThisTopic: "Manually selected",
    },
  };
}

// AI-powered topic planner — analyses existing blogs + trends to pick the best topic
async function planTopic(existingBlogs, forcedCountry = null, forcedService = null) {

  // If both forced — skip AI, go straight to content
  if (forcedCountry && forcedService) {
    console.log("  ⚡ Forced country + service — skipping AI topic planning");
    return pickForced(forcedCountry, forcedService);
  }

  console.log("  🧠 AI analysing trends + existing blogs to pick best topic...");
  const prompt = buildTopicPrompt({ existingBlogs, countries: COUNTRIES, services: SERVICES });
  const { text, provider } = await generate(prompt, { jsonMode: true, label: "topic planning" });

  let aiTopic;
  try {
    const cleaned = text.replace(/^```json\n?|^```\n?|\n?```$/gm, "").trim();
    aiTopic = JSON.parse(cleaned);
  } catch {
    console.warn("  ⚠️  AI topic JSON parse failed — falling back to rule-based picker");
    return pickForced(forcedCountry, forcedService);
  }

  // Override with CLI flags if only one is forced
  const countryCode = forcedCountry || aiTopic.countryCode;
  const serviceKey  = forcedService  || aiTopic.serviceKey;

  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  const service = SERVICES.find((s) => s.key === serviceKey)    || SERVICES[0];

  console.log(`  ✅ AI picked topic (via ${provider}):`);
  console.log(`     Type     : ${aiTopic.contentType}`);
  console.log(`     Country  : ${country.name}`);
  console.log(`     Category : ${aiTopic.category}`);
  console.log(`     Title    : ${aiTopic.title}`);
  console.log(`     Keyword  : ${aiTopic.primaryKeyword}`);
  console.log(`     Trend    : ${aiTopic.trendSignal}`);
  console.log(`     Why rank : ${aiTopic.whyThisWillRank}`);

  return { country, service, aiTopic };
}

module.exports = { planTopic };
