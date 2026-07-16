const { YEAR } = require("../config");

function buildTopicPrompt({ existingBlogs, countries, services }) {
  const existingList =
    existingBlogs.map((b) => `- "${b.title}"`).join("\n") || "  (no blogs yet)";

  const countriesList = countries
    .map((c) => `${c.code} = ${c.name}`)
    .join(", ");

  const servicesList = services.map((s) => s.name).join(", ");

  return `You are a senior SEO strategist and viral content planner for Futurise Solutions — a full-cycle digital product studio based in Wellington, New Zealand, serving global clients in tech, AI, web, mobile, blockchain, and digital marketing.

YOUR MISSION:
Pick the SINGLE BEST blog topic for ${YEAR} that will rank on Google, bring real traffic, and build Futurise Solutions' authority.

━━━ EXISTING BLOGS — DO NOT duplicate ━━━
${existingList}

━━━ CONTEXT ━━━
Company services: ${servicesList}
Target countries: ${countriesList}
Website: futurisesolutions.com

━━━ IMPORTANT: YOU ARE NOT LIMITED TO SERVICES ━━━

You can pick ANY of these blog content types — whatever will perform best on Google RIGHT NOW:

1. SERVICE GUIDE — "Web Development Cost in Australia (2026): Complete Pricing Guide"
2. CASE STUDY — "How We Built an AI Support Agent That Handles 80% of Queries Automatically"
3. TRENDING TOPIC — "Google's AI Overviews Are Killing Organic Traffic — Here's What to Do"
4. STRATEGY GUIDE — "The 90-Day SEO Strategy That Grew Our Client's Traffic by 340%"
5. TOOL COMPARISON — "Cursor vs GitHub Copilot for Full-Stack Developers (2026 Honest Review)"
6. INDUSTRY NEWS ANALYSIS — "OpenAI o3 vs Gemini 2.5: Which AI Model Should Your Business Use?"
7. HOW-TO TUTORIAL — "How to Build a RAG Chatbot for Your Business in 2026 (No PhD Required)"
8. LISTICLE — "11 AI Tools Every New Zealand Small Business Should Use in 2026"
9. OPINION / THOUGHT LEADERSHIP — "Why Most SaaS Products Fail at Onboarding (And What to Do Instead)"
10. MARKET REPORT — "State of Mobile App Development in India 2026: Costs, Trends & Predictions"
11. NICHE GEO GUIDE — "Vision 2030 Tech Stack: What Saudi Startups Are Building in 2026"
12. PROBLEM-SOLUTION — "Your Website Gets Traffic But No Leads? Here's the Real Reason"
13. BEGINNER GUIDE — "What is an AI Agent? A Plain-English Guide for Business Owners (2026)"
14. COST BREAKDOWN — "I Priced 12 Web Development Agencies in the UK — Here's What I Found"

━━━ HOW TO PICK THE WINNING TOPIC ━━━

Think about:

SEARCH INTENT (most important):
- Are people actively Googling this RIGHT NOW in ${YEAR}?
- Is it transactional (they want to hire/buy) or informational (they want to learn)?
- Does it match what Futurise Solutions can credibly write about?

TREND SIGNALS for ${YEAR}:
- AI agents & automation is the #1 topic in tech globally
- "Vibe coding" and no-code AI tools are exploding
- Google SGE / AI Overviews changing SEO landscape
- Vision 2030 Saudi Arabia driving massive tech investment
- NZ & AU startups cutting offshore dev costs, going lean
- India IT industry globalising rapidly
- UK businesses under budget pressure, seeking cost guides
- Blockchain/Web3 recovering — RWA tokenisation trending
- Mobile-first markets (India, SA) growing fast
- AI in fintech, healthtech, legal tech rising everywhere

COMPETITION CHECK:
- Prefer topics where big sites (Forbes, HubSpot) have GENERIC content
- Specific geo + niche topics have lower competition
- Year-specific content ranks faster (less competition)
- "Cost" and "pricing" keywords convert best

FUTURISE SOLUTIONS FIT:
- Must be a topic where Futurise Solutions has expertise
- Should naturally link to their services, case studies, or blog posts
- Should generate leads (CTAs make sense for the topic)

━━━ OUTPUT FORMAT ━━━

Return ONLY valid JSON, no explanation, no markdown, no code fences:
{
  "contentType": "one of: Service Guide / Case Study / Trending Topic / Strategy Guide / Tool Comparison / Industry News / How-To Tutorial / Listicle / Opinion / Market Report / Geo Guide / Problem-Solution / Beginner Guide / Cost Breakdown",
  "countryCode": "one of: nz / in / us / uk / au / sa / za / global (if not country-specific)",
  "countryName": "full country name or 'Global'",
  "serviceKey": "closest matching: web-development / app-development / ui-ux-design / ai-ml-solutions / blockchain-development / digital-marketing / general",
  "serviceName": "readable service name or topic area",
  "category": "one of: Web Development / App Development / UI/UX Design / AI & ML / Blockchain / Digital Marketing / Case Study / Strategy / Industry News / Tools & Resources",
  "title": "the exact blog title — compelling, click-worthy, SEO-optimised, includes year if relevant",
  "primaryKeyword": "the main keyword phrase (3-6 words) people search for",
  "secondaryKeywords": ["6 to 8 related keyword phrases that should appear naturally in the blog"],
  "angle": "1 sentence — what unique perspective or hook makes this blog different from generic content",
  "targetAudience": "specific description of who will read this (e.g. 'NZ SaaS CTOs', 'Indian freelance developers', 'UK marketing managers')",
  "trendSignal": "why this specific topic is HOT in ${YEAR} — be specific, not generic",
  "contentDirection": "3-4 sentences on exactly what to cover, what data/stats to include, what makes this blog genuinely useful and shareable",
  "whyThisWillRank": "1-2 sentences — specific reason this will rank on Google and bring Futurise Solutions leads",
  "pexelsQuery": "4-6 words for a Pexels stock photo search that visually matches this blog topic — be specific to the topic, not generic. Examples: 'saudi city skyline technology', 'no code app builder laptop', 'india startup team meeting', 'blockchain network data center'"
}`;
}

module.exports = { buildTopicPrompt };
