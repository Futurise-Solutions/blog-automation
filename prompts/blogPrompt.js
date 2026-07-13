const { INTERNAL_LINKS, CTA_BLOCK, BASE_URL, YEAR } = require("../config");

function buildBlogPrompt({ country, service, existingBlogs, aiTopic = {} }) {
  // Pick 6 most-relevant related blogs for the "Related Articles" section
  const relatedBlogs = existingBlogs
    .slice(0, 10)
    .map((b) => `- [${b.title}](${b.url})`)
    .join("\n");

  const serviceLinksBlock = Object.entries(INTERNAL_LINKS.services)
    .map(([label, url]) => `  - [${label}](${url})`)
    .join("\n");

  const caseStudyLinksBlock = Object.entries(INTERNAL_LINKS.caseStudies)
    .map(([label, url]) => `  - [${label}](${url})`)
    .join("\n");

  // Pricing guide numbers for the country
  const pricingTable = buildPricingTable(service.key, country);

  // AI topic intelligence (if available)
  const topicTitle       = aiTopic.title           || null;
  const primaryKeyword   = aiTopic.primaryKeyword   || `${service.name} ${country.name}`;
  const secondaryKws     = (aiTopic.secondaryKeywords || []).join(", ") || "";
  const angle            = aiTopic.angle            || "";
  const targetAudience   = aiTopic.targetAudience   || `${country.name} businesses`;
  const trendSignal      = aiTopic.trendSignal      || "";
  const contentDirection = aiTopic.contentDirection || "";

  return `You are a senior SEO content strategist and copywriter for Futurise Solutions — a full-cycle digital product studio based in Wellington, New Zealand, that serves global clients including businesses in ${country.name}.

━━━ YOUR TASK ━━━
Write a long-form, GEO-targeted, SEO-optimised blog post about **${service.name}** for businesses in **${country.name}** in **${YEAR}**.

━━━ AI-SELECTED TOPIC INTELLIGENCE (use this to shape the blog) ━━━
${topicTitle        ? `Exact Title to Use  : ${topicTitle}` : `Title Pattern       : ${service.name} [angle] in ${country.name} (${YEAR})`}
Primary Keyword     : ${primaryKeyword}
Secondary Keywords  : ${secondaryKws}
Unique Angle        : ${angle}
Target Audience     : ${targetAudience}
${trendSignal       ? `Why Trending NOW    : ${trendSignal}` : ""}
${contentDirection  ? `Content Direction   : ${contentDirection}` : ""}

━━━ COUNTRY + MARKET CONTEXT ━━━
Country: ${country.name}
Year: ${YEAR}
Currency: ${country.currency} (${country.symbol})
Exchange rate: ${country.usdRate}
Key cities to mention: ${country.cities.join(", ")}
Market context: ${country.context}
Compliance note: ${country.complianceNote}
Market size: ${country.marketSize}

━━━ CONTENT STRUCTURE (follow exactly) ━━━

1. H1 TITLE — ${topicTitle ? `USE EXACTLY: "${topicTitle}"` : `include: primary keyword + country + year + value hook`}

2. INTRO (3–4 strong paragraphs)
   - Open with a bold claim or question that resonates with ${country.name} businesses
   - Establish the problem this service solves
   - Mention ${country.cities[0]} and ${country.cities[1]} naturally
   - Reference ${country.context} briefly
   - End with: "In this guide, we cover..."

3. TABLE OF CONTENTS
   List all H2 headings

4. BODY — minimum 8 H2 sections, each with 2–4 H3 subsections
   Required sections to include (adapt headings to fit naturally):
   - What is ${service.name}? (clear definition, what's included)
   - Why ${country.name} Businesses Need ${service.name} in ${YEAR}
   - Key Factors That Affect Cost / Scope / Timeline
   - Pricing in ${country.name} (${YEAR}) — include the pricing table below
   - Typical Process & Timeline — include a process table
   - Benefits & ROI for ${country.name} Businesses
   - Common Mistakes to Avoid
   - How to Choose the Right ${service.name} Partner in ${country.name}
   - FAQ Section (minimum 6 Q&As)
   - Why Choose Futurise Solutions?

5. PRICING TABLE (paste this into the relevant section):
${pricingTable}

6. INTERNAL LINKS — weave these naturally as hyperlinks with descriptive anchor text:

   Service Pages (use at least 4 relevant ones inline):
${serviceLinksBlock}

   Case Studies (link 1–2 inline with context):
${caseStudyLinksBlock}

   Core pages to link (use naturally):
   - [Portfolio](${INTERNAL_LINKS.core.Portfolio})
   - [About Futurise Solutions](${INTERNAL_LINKS.core.About})
   - [Contact Us](${INTERNAL_LINKS.core.Contact})
   - [Futurise Solutions Blog](${INTERNAL_LINKS.core.Blog})

7. CTA BLOCK — paste this EXACTLY after "Why Choose Futurise Solutions?":
${CTA_BLOCK}

8. RELATED ARTICLES — end the blog with this section:
---

# Related Articles

${relatedBlogs}

Browse more expert guides on the [Futurise Solutions Blog](${BASE_URL}/blog).

━━━ WRITING RULES ━━━
- Minimum 3,200 words of useful, non-padded content
- Tone: Professional but warm. Like a knowledgeable friend who's also an expert.
- Use "you" and "your business" throughout — make it personal
- Short paragraphs: maximum 3 sentences each
- Bold key terms and cost figures on first mention
- Use bullet lists for features/benefits (not prose lists)
- Use comparison tables where relevant (e.g. in-house vs agency vs offshore)
- Every H2 should target a specific search intent or keyword
- Include ${country.name}-specific market data, regulations, or business culture naturally
- Mention ${country.complianceNote} once where relevant
- Do NOT use generic filler phrases like "In today's fast-paced world" or "In conclusion"
- Do NOT mention any competitor company by name
- Do NOT mention Claude, ChatGPT, OpenAI, or any AI tool used to write this

━━━ OUTPUT RULES ━━━
- Output ONLY the raw Markdown blog content
- Start directly with the # H1 heading — no preamble
- Do NOT wrap in code fences
- Do NOT add "Here is the blog:" or any explanation before or after
- Just the blog. Nothing else.`;
}

function buildMetaPrompt({ title, contentExcerpt, service, country }) {
  return `You are an SEO specialist. Generate structured meta fields for this blog post.

Blog Title: "${title}"
Service: ${service.name}
Country: ${country.name}
Content opening: ${contentExcerpt.slice(0, 600)}

Return ONLY valid JSON (no explanation, no markdown, no code fences):
{
  "metaTitle": "under 60 chars — primary keyword + country, compelling",
  "metaDescription": "under 160 chars — includes keyword + clear benefit + soft CTA",
  "metaKeywords": ["10 to 12 keywords", "mix of: service terms, country, cost/pricing, comparison terms, year"],
  "shortDescription": "1-2 sentence blog teaser between 120-160 chars for cards and previews",
  "tags": ["12 to 15 specific tags", "NO generic tags like 'technology' or 'business'"],
  "category": "MUST be one of exactly: Web Development | App Development | UI/UX Design | AI & ML | Blockchain | Digital Marketing"
}`;
}

function buildPricingTable(serviceKey, country) {
  const c = country.symbol;
  const tables = {
    "web-development": `| Project Type | Estimated Cost (${country.currency}) | USD Equivalent |
|---|---|---|
| Landing Page / Brochure Site | ${c}2,500–${c}6,000 | $1,500–$3,500 |
| Business Website (5–15 pages) | ${c}6,000–${c}15,000 | $3,500–$9,000 |
| eCommerce Website | ${c}12,000–${c}35,000 | $7,000–$21,000 |
| Web Application / SaaS MVP | ${c}20,000–${c}70,000 | $12,000–$42,000 |
| Enterprise Web Platform | ${c}70,000–${c}200,000+ | $42,000–$120,000+ |`,

    "app-development": `| App Type | Estimated Cost (${country.currency}) | USD Equivalent |
|---|---|---|
| Simple Utility App (iOS or Android) | ${c}8,000–${c}20,000 | $5,000–$12,000 |
| Cross-Platform App (React Native) | ${c}15,000–${c}45,000 | $9,000–$27,000 |
| Marketplace / Social App | ${c}35,000–${c}90,000 | $21,000–$54,000 |
| Enterprise Mobile App | ${c}80,000–${c}200,000+ | $48,000–$120,000+ |`,

    "ui-ux-design": `| Project Type | Estimated Cost (${country.currency}) | USD Equivalent |
|---|---|---|
| Landing Page Design | ${c}1,500–${c}4,500 | $900–$2,700 |
| Business Website Design | ${c}4,500–${c}12,000 | $2,700–$7,200 |
| Mobile App UI/UX | ${c}8,000–${c}30,000 | $4,800–$18,000 |
| SaaS Product Design | ${c}15,000–${c}55,000 | $9,000–$33,000 |
| Enterprise Product Design + Design System | ${c}50,000–${c}150,000+ | $30,000–$90,000+ |`,

    "ai-ml-solutions": `| Solution Type | Estimated Cost (${country.currency}) | USD Equivalent |
|---|---|---|
| AI Chatbot / Assistant | ${c}5,000–${c}15,000 | $3,000–$9,000 |
| Custom AI Agent (Single workflow) | ${c}10,000–${c}30,000 | $6,000–$18,000 |
| LLM Integration + RAG System | ${c}15,000–${c}50,000 | $9,000–$30,000 |
| NLP / Computer Vision Solution | ${c}25,000–${c}90,000 | $15,000–$54,000 |
| Enterprise AI Platform | ${c}80,000–${c}300,000+ | $48,000–$180,000+ |`,

    "blockchain-development": `| Project Type | Estimated Cost (${country.currency}) | USD Equivalent |
|---|---|---|
| Smart Contract (single, audited) | ${c}5,000–${c}15,000 | $3,000–$9,000 |
| Token / NFT Contract + Minting | ${c}10,000–${c}30,000 | $6,000–$18,000 |
| DeFi Protocol (AMM/Staking) | ${c}30,000–${c}100,000 | $18,000–$60,000 |
| Full dApp with Frontend | ${c}40,000–${c}150,000 | $24,000–$90,000 |
| Enterprise Blockchain Platform | ${c}100,000–${c}350,000+ | $60,000–$210,000+ |`,

    "digital-marketing": `| Service Package | Monthly Cost (${country.currency}) | USD Equivalent |
|---|---|---|
| SEO Foundation (audit + on-page) | ${c}1,500–${c}4,000/mo | $900–$2,400/mo |
| Content Marketing + SEO | ${c}3,000–${c}8,000/mo | $1,800–$4,800/mo |
| PPC / Paid Social Management | ${c}2,000–${c}6,000/mo + ad spend | $1,200–$3,600/mo |
| Full Growth Package (SEO+PPC+CRO) | ${c}6,000–${c}18,000/mo | $3,600–$10,800/mo |
| Enterprise Digital Marketing | ${c}15,000–${c}50,000+/mo | $9,000–$30,000+/mo |`,
  };

  return tables[serviceKey] || tables["web-development"];
}

module.exports = { buildBlogPrompt, buildMetaPrompt };
