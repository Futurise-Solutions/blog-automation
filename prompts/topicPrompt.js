const { YEAR } = require("../config");

function buildTopicPrompt({ existingBlogs, countries, services }) {
  const existingList = existingBlogs
    .map((b) => `- "${b.title}" → /${b.slug}`)
    .join("\n") || "  (no blogs yet)";

  const countriesList = countries
    .map((c) => `  ${c.code} = ${c.name} (${c.currency}, cities: ${c.cities.join(", ")})`)
    .join("\n");

  const servicesList = services
    .map((s) => `  ${s.key} = ${s.name}`)
    .join("\n");

  return `You are a senior SEO strategist and content planner for Futurise Solutions — a full-cycle digital product studio based in Wellington, New Zealand, serving global clients.

Your job: Pick the SINGLE BEST blog topic for ${YEAR} that will:
1. Rank on Google (high search intent, low-medium competition)
2. Attract real business leads from the target country
3. NOT duplicate any existing blog
4. Tap into a current or emerging trend in tech/digital
5. Build Futurise Solutions' authority and organic reach

━━━ EXISTING BLOGS (DO NOT duplicate these topics) ━━━
${existingList}

━━━ TARGET COUNTRIES (pick one) ━━━
${countriesList}

━━━ SERVICES (pick one) ━━━
${servicesList}

━━━ HOW TO PICK THE BEST TOPIC ━━━

Think like an SEO expert + business consultant:

1. TREND SIGNALS to consider for ${YEAR}:
   - AI agents & automation adoption is exploding globally
   - Vision 2030 driving Saudi digital transformation
   - NZ & AU startups heavily investing in SaaS & mobile apps
   - UK businesses migrating to cloud & cutting dev costs
   - Indian IT companies going global, need digital presence
   - USA SMBs adopting AI to compete with enterprise
   - South Africa fintech & mobile-first economy booming

2. KEYWORD STRATEGY — prefer:
   - "cost" / "pricing" / "how much" queries (high buyer intent)
   - "vs" / "comparison" queries
   - "guide" / "how to" for a specific country + service
   - Year-specific: "2026 guide", "in 2026"
   - Problem-specific: "without coding", "for startups", "for SMBs"
   - Niche angles: "for accountants", "for real estate", "for ecommerce"

3. GAP ANALYSIS — look at existing blogs and find:
   - Countries with zero or few blogs
   - Service + country combos not yet covered
   - Trending angles not yet written about

4. TITLE STYLE THAT RANKS WELL:
   - Include: service + country + year + value hook
   - Examples:
     * "How Saudi Businesses Are Using AI Agents to Cut Costs by 40% (2026)"
     * "React Native vs Flutter for Australian Startups: Complete Cost Guide 2026"
     * "SEO for South African eCommerce: The 2026 Growth Playbook"
     * "Custom AI Agents for UK Accounting Firms: ROI, Cost & Implementation"
     * "Why 73% of NZ Startups Fail at Digital Marketing (And How to Fix It)"

━━━ OUTPUT FORMAT ━━━

Return ONLY this JSON, no explanation, no markdown:
{
  "countryCode": "one of: nz / in / us / uk / au / sa / za",
  "countryName": "full country name",
  "serviceKey": "one of: web-development / app-development / ui-ux-design / ai-ml-solutions / blockchain-development / digital-marketing",
  "serviceName": "full service name",
  "category": "one of: Web Development / App Development / UI/UX Design / AI & ML / Blockchain / Digital Marketing",
  "title": "the exact H1 blog title (compelling, SEO-optimised, includes year)",
  "primaryKeyword": "main keyword phrase (3-5 words) people search for",
  "secondaryKeywords": ["6 to 8 related keyword phrases"],
  "angle": "1 sentence describing the unique angle of this blog",
  "targetAudience": "who will read this (e.g. 'NZ SaaS founders', 'Indian SMB owners')",
  "trendSignal": "why this topic is trending NOW in ${YEAR}",
  "contentDirection": "2-3 sentences on what to focus on, what unique data/angle to include, what makes this blog stand out from generic content",
  "whyThisTopic": "1 sentence — why this specific topic will rank and bring leads"
}`;
}

module.exports = { buildTopicPrompt };
