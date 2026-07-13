# PRD — Futurise Solutions Blog Automation System

**Version:** 1.0  
**Date:** 2026-07-13  
**Owner:** Futurise Solutions  
**Scope:** Backend automation script — `scripts/blogAutomation/`

---

## 1. What We Are Building

A Node.js CLI automation script that:

1. Reads all existing published blogs via the live GET API
2. Analyses titles + slugs to avoid duplicate topics
3. Picks a target country and service angle not yet covered
4. Generates a long-form, GEO+SEO-optimised blog post using Gemini AI (Groq as fallback)
5. Fetches or generates a relevant featured image
6. Uploads the image to Cloudinary via the existing upload API to get a CDN URL
7. Posts the finished blog to MongoDB via the existing POST API

The script runs on demand (`node scripts/blogAutomation/run.js`) or on a cron schedule (`npm run blog:auto`).

---

## 2. Goals

| Goal | Detail |
|------|--------|
| SEO growth | Target high-intent, low-competition keywords per country |
| GEO targeting | One blog per country per service cycle |
| No duplicate content | Always read existing slugs before picking a topic |
| Free-tier safe | Manage Gemini + Groq rate limits; never burn paid quota |
| Internal linking | Every blog links to service pages, case studies, and other blogs |
| Conversion | Every blog ends with a 15-min booking CTA and contact link |
| Automation | Minimal human input required per run |

---

## 3. Target Countries + Priority

| Priority | Country | Locale Signal to Include in Blog |
|----------|---------|----------------------------------|
| 1 | New Zealand | NZD pricing, NZ startups, Wellington/Auckland context |
| 2 | India | INR pricing, Indian SMBs, Bangalore/Mumbai context |
| 3 | USA | USD pricing, US startups, Silicon Valley + remote context |
| 4 | UK | GBP pricing, UK SaaS, London/Manchester context |
| 5 | Australia | AUD pricing, AU startups, Sydney/Melbourne context |
| 6 | Saudi Arabia | SAR pricing, Vision 2030, Riyadh context |
| 7 | South Africa | ZAR pricing, SA digital economy, Cape Town context |

The script cycles through countries automatically, picking the one with the fewest existing blogs targeting it.

---

## 4. Services to Blog About (maps to frontend routes)

| Service | Frontend Route | Blog Topic Angle |
|---------|---------------|------------------|
| UI/UX Design | `/service/ui-ux-design` | Cost guides, design process, agency comparison |
| Web Development | `/service/web-development` | Tech stack, cost, timeline, React/Next.js |
| App Development | `/service/app-development` | iOS + Android, React Native, cost per country |
| AI & ML Solutions | `/service/ai-ml-solutions` | AI agents, LLMs, NLP, automation ROI |
| Blockchain Development | `/service/blockchain-development` | DeFi, smart contracts, Web3 for businesses |
| Digital Marketing | `/service/digital-marketing` | SEO, PPC, CRO, growth marketing per country |

The script cycles: for each country, it covers all 6 services before repeating. This creates 42 unique geo+service blog combinations before any topic repeats.

---

## 5. System Architecture

```
run.js
  │
  ├── 1. BlogAnalyser        → GET /api/blogs → read all slugs + titles + categories
  │
  ├── 2. TopicPlanner        → Pick next country + service not yet covered
  │                            Generate topic title + keyword cluster
  │
  ├── 3. ContentGenerator    → Gemini 2.5 Flash (primary)
  │                            Groq llama3-70b (fallback on 429)
  │                            Returns full blog Markdown
  │
  ├── 4. ImageHandler        → Pexels API (primary free stock photo)
  │                            Sharp programmatic banner (fallback - no API needed)
  │                            Downloads image buffer
  │
  ├── 5. ImageUploader       → POST /api/upload (multipart/form-data)
  │                            Receives Cloudinary CDN URL
  │
  └── 6. BlogPublisher       → POST /api/blogs
                               Sends full blog payload (title, slug, content, meta, image, etc.)
```

---

## 6. File Structure

```
scripts/
  blogAutomation/
    PRD.md                  ← this file
    run.js                  ← main entry point (CLI + cron)
    config.js               ← all constants, country list, service list, route URLs
    modules/
      blogAnalyser.js       ← GET existing blogs, extract topics
      topicPlanner.js       ← pick next country/service, generate topic + keywords
      contentGenerator.js   ← Gemini + Groq AI content generation
      imageHandler.js       ← Pexels fetch OR Sharp banner generation
      imageUploader.js      ← POST to /api/upload, return Cloudinary URL
      blogPublisher.js      ← POST to /api/blogs
      aiClient.js           ← Gemini + Groq client with fallback logic
      logger.js             ← coloured console output + run log file
    prompts/
      blogPrompt.js         ← master prompt template for blog generation
    logs/
      runs.jsonl            ← append-only log of every automation run
```

---

## 7. AI Strategy — Free Tier Management

### Gemini 2.5 Flash (Primary)
- Free tier: 15 RPM, 1,500 requests/day, 1,000,000 tokens/day
- Used for: full blog generation (~3,000–5,000 words = ~4,000–7,000 tokens output)
- One blog run uses ~1 Gemini call → well within daily limits

### Groq (Fallback)
- Free tier: 30 RPM, 14,400 requests/day (varies by model)
- Model: `llama-3.1-70b-versatile` (best quality on free tier) or `mixtral-8x7b-32768`
- Triggered only when Gemini returns 429 or RESOURCE_EXHAUSTED error

### Fallback Logic in `aiClient.js`

```
1. Call Gemini 2.5 Flash
2. If success → return response
3. If 429 / quota error:
   a. Log: "Gemini quota hit — switching to Groq"
   b. Call Groq llama3-70b
   c. If success → return response
   d. If Groq also fails → throw error, log to runs.jsonl, exit gracefully
4. All other Gemini errors → throw immediately (don't waste Groq quota)
```

### Rate Limit Safety
- Script adds a 2-second delay between any AI calls
- Blog runs are designed to be triggered manually or max 1-2x/day via cron
- Even at 2 runs/day, Gemini daily limit is never approached

---



## 8. Image Strategy — Free Tier Solution

### Option A — Pexels API (Primary, Free)
- Free plan: 200 requests/hour, unlimited downloads
- Requires: free account at pexels.com → API key (place in `.env`)
- Process:
  1. Search Pexels with keywords: `{service} {country} digital technology`
  2. Pick first landscape result (min 1280px wide)
  3. Download buffer via `https` module (no external lib needed)
  4. Pass buffer to `/api/upload` → Sharp compresses to WebP → Cloudinary URL

### Option B — Sharp Programmatic Banner (Fallback, 100% Free, No API)
- Uses only `sharp` (already installed) + Node.js built-ins
- Generates a 1280×720 gradient banner:
  - Background: dark gradient matching Futurise brand (`#08080D` → `#1a1025`)
  - Overlaid text: blog title (white, centered)
  - Subtle pattern/noise for visual texture
- Process:
  1. Create SVG text overlay with blog title
  2. Composite onto gradient background via Sharp
  3. Output PNG buffer → pass to `/api/upload`
- No API key needed, no rate limits, always available

### Recommended Approach
Use Pexels as primary (real photos look more professional), Sharp banner as automatic fallback if Pexels fails or API key is missing.

---

## 9. Blog Content Specification

### Length
- Minimum: 2,500 words
- Target: 3,500–5,000 words
- Matches the sample blog provided (UI/UX Cost NZ guide)

### Structure (based on sample blog)

```markdown
# [Title with Year + Country + Keyword]

[Opening paragraph — establish the problem/opportunity for that country]

> [Pull quote highlighting the main insight]

---

# Table of Contents
[All H2 headings listed]

---

# Section 1: What is [Service]?
[Definition, explanation, what's included]

---

# Section 2: Why [Service] Matters for [Country] Businesses
[Country-specific stats, market context, local business pain points]

---

# Section 3: Key Factors Affecting Cost / Scope
[H3 subsections: Complexity, Timeline, Tech Stack, etc.]

---

# Section 4: [Service] Pricing in [Country] (2026)
[Pricing table in local currency + USD equivalent]

| Project Type | Estimated Cost ([Currency]) |
|---|---|
| ... | ... |

---

# Section 5: Timeline
[Phase table]

---

# Section 6: Benefits / ROI
[Business impact, numbered list]

---

# Section 7: Common Mistakes / What to Avoid
[Mistakes list]

---

# Section 8: Frequently Asked Questions
[5–7 Q&As targeting long-tail keywords]

---

# Why Choose Futurise Solutions?

[Company pitch with links to all relevant services]

- [UI/UX Design Services](https://www.futurisesolutions.com/service/ui-ux-design)
- [Web Development Services](https://www.futurisesolutions.com/service/web-development)
- [App Development Services](https://www.futurisesolutions.com/service/app-development)
- [AI & ML Solutions](https://www.futurisesolutions.com/service/ai-ml-solutions)
- [Blockchain Development](https://www.futurisesolutions.com/service/blockchain-development)
- [Digital Marketing Services](https://www.futurisesolutions.com/service/digital-marketing)

---

# 🚀 Ready to Get Started?

## 👉 [Book a Free 15-Minute Discovery Call](https://calendar.google.com/calendar/...)
[Contact link]
[Homepage link]

---

# Related Articles
[5–6 links to existing published blog posts from the analysed slugs]

Browse more on the [Futurise Solutions Blog](https://www.futurisesolutions.com/blog).
```

### Internal Links Required in Every Blog

**Service Pages (always include at least 3 relevant ones):**
- `https://www.futurisesolutions.com/service/ui-ux-design`
- `https://www.futurisesolutions.com/service/web-development`
- `https://www.futurisesolutions.com/service/app-development`
- `https://www.futurisesolutions.com/service/ai-ml-solutions`
- `https://www.futurisesolutions.com/service/blockchain-development`
- `https://www.futurisesolutions.com/service/digital-marketing`

**Case Studies (always include 1–2):**
- `https://www.futurisesolutions.com/case-studies/ai-support-agent`
- `https://www.futurisesolutions.com/case-studies/saas-platform-scale`
- `https://www.futurisesolutions.com/case-studies/real-estate-app`
- `https://www.futurisesolutions.com/case-studies/fintech-ux-redesign`
- `https://www.futurisesolutions.com/case-studies/defi-protocol-launch`
- `https://www.futurisesolutions.com/case-studies/saas-seo-growth`

**Core Pages:**
- `https://www.futurisesolutions.com/portfolio`
- `https://www.futurisesolutions.com/about`
- `https://www.futurisesolutions.com/contact`
- `https://www.futurisesolutions.com/blog`

**Related Blogs:** dynamically picked from existing published blog slugs (passed to AI from the analyser step)

### 15-Min CTA (Required in Every Blog)

```markdown
## 👉 [Book a Free 15-Minute Discovery Call](https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0aFyvaujrzkoyugDXtY1nJVN0uCQOT_6Ce_uqA58bOB_409ANHe4RwcBLoZ5BoLiubC-Cou1_4)

No obligation. 15 minutes. We'll map out your options and give you a clear path forward.

Need to discuss first? [Contact Futurise Solutions](https://www.futurisesolutions.com/contact)
```

---

## 10. SEO + GEO Requirements Per Blog

### Title Formula
`[Service] [Country-specific qualifier] ([Year]): [Value proposition]`

Examples:
- `Web Development Cost in New Zealand (2026): Pricing, Stack & Timeline Guide`
- `How AI Automation is Transforming Small Businesses in Saudi Arabia (2026)`
- `Mobile App Development Cost in Australia (2026): React Native vs Native Guide`
- `SEO Services for UK Startups (2026): Complete Growth Strategy Guide`

### Meta Fields
- `metaTitle`: ≤ 60 chars, includes primary keyword + country
- `metaDescription`: ≤ 160 chars, includes keyword + benefit + call-to-action hint
- `metaKeywords`: 8–12 keywords — mix of service, country, cost, comparison terms
- `ogType`: `"article"`
- `robots`: `"index,follow"`

### GEO Signals to Include in Content
- Local currency pricing table
- Country-specific market context (1–2 paragraphs)
- Mention of 1–2 local cities relevant to the service
- Local business regulation/compliance context where relevant (e.g., Vision 2030 for Saudi, POPIA for South Africa, GDPR for UK)
- Local competitor landscape reference (generic, not naming specific competitors)

### Keyword Density
- Primary keyword: 3–5 mentions naturally woven in
- Secondary keywords: 1–2 mentions each
- LSI terms naturally included throughout

---

## 11. Blog Payload Format (POST /api/blogs)

```json
{
  "title": "string (H1 title)",
  "shortDescription": "string (1–2 sentence teaser, 120–160 chars)",
  "featuredImage": "https://res.cloudinary.com/... (from upload step)",
  "category": "one of: Web Development | App Development | UI/UX Design | AI & ML | Blockchain | Digital Marketing",
  "tags": ["tag1", "tag2", "...up to 15 tags"],
  "content": "# Full Markdown content ...",
  "status": "published",
  "meta": {
    "metaTitle": "string ≤60 chars",
    "metaDescription": "string ≤160 chars",
    "metaKeywords": ["keyword1", "keyword2", "..."],
    "ogType": "article",
    "robots": "index,follow"
  }
}
```

---

## 12. Environment Variables (add to backend `.env`)

```env
# Existing
MONGO_URI=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...

# New — Blog Automation
GROQ_API_KEY=...                              # free at console.groq.com
PEXELS_API_KEY=...                            # free at pexels.com/api
BLOG_API_BASE_URL=http://localhost:5000       # or production URL
BLOG_AUTO_STATUS=published                    # or "draft" to review before publishing
GROQ_MODEL=llama-3.1-70b-versatile           # best free Groq model
```

---

## 13. New npm Scripts (add to package.json)

```json
"blog:auto": "node scripts/blogAutomation/run.js",
"blog:dry": "node scripts/blogAutomation/run.js --dry-run",
"blog:force": "node scripts/blogAutomation/run.js --force --country=nz --service=web-development"
```

### CLI Flags

| Flag | Description |
|------|-------------|
| `--dry-run` | Generate topic + content, print to console — no DB write, no image upload |
| `--country=nz` | Force a specific country (nz, in, us, uk, au, sa, za) |
| `--service=web-development` | Force a specific service |
| `--status=draft` | Override to post as draft instead of published |
| `--no-image` | Skip image fetch/generation, use placeholder URL |

---

## 14. Error Handling + Logging

Every run appends one line to `scripts/blogAutomation/logs/runs.jsonl`:

```json
{
  "timestamp": "2026-07-13T10:00:00Z",
  "country": "nz",
  "service": "web-development",
  "title": "Web Development Cost in New Zealand (2026)...",
  "slug": "web-development-cost-in-new-zealand-2026...",
  "aiUsed": "gemini",
  "imageSource": "pexels",
  "status": "success",
  "blogId": "6a493940f970805228b33fef"
}
```

On failure:
```json
{
  "timestamp": "...",
  "country": "nz",
  "service": "web-development",
  "status": "failed",
  "stage": "contentGenerator",
  "error": "Both Gemini and Groq quota exceeded"
}
```

---

## 15. Implementation Phases

### Phase 1 — Core Blog Generation (build first)
- [ ] `config.js` — countries, services, routes, CTAs, all constants
- [ ] `modules/aiClient.js` — Gemini primary + Groq fallback
- [ ] `prompts/blogPrompt.js` — master prompt template
- [ ] `modules/blogAnalyser.js` — GET blogs, extract slugs + titles
- [ ] `modules/topicPlanner.js` — country/service picker, topic generator
- [ ] `modules/contentGenerator.js` — calls aiClient with prompt
- [ ] `run.js` — wires all modules, --dry-run first

### Phase 2 — Image + Publish
- [ ] `modules/imageHandler.js` — Pexels fetch + Sharp fallback
- [ ] `modules/imageUploader.js` — POST /api/upload
- [ ] `modules/blogPublisher.js` — POST /api/blogs
- [ ] `modules/logger.js` — runs.jsonl append

### Phase 3 — Scheduling + Polish
- [ ] Add `node-cron` for scheduled runs (e.g., 9am daily)
- [ ] Add sitemap auto-update trigger after publish
- [ ] Add Slack/email notification on success (optional)

---

## 16. Master AI Prompt Design

The prompt sent to Gemini/Groq will include:

```
ROLE: You are an expert SEO content writer and digital marketing specialist 
for Futurise Solutions, a full-cycle digital product studio based in 
Wellington, New Zealand that serves clients in [COUNTRY] and worldwide.

TASK: Write a long-form, GEO-targeted, SEO-optimised blog post about 
[SERVICE] for businesses in [COUNTRY].

EXISTING BLOG SLUGS (do NOT duplicate these topics):
[list of current slug titles]

TARGET COUNTRY: [COUNTRY]
TARGET SERVICE: [SERVICE]
SUGGESTED TITLE: [generated title]
PRIMARY KEYWORD: [keyword]
SECONDARY KEYWORDS: [keyword list]

CONTENT REQUIREMENTS:
- Minimum 3,000 words
- Include a Table of Contents
- Include H2 and H3 headings
- Include at least one pricing table in local currency ([CURRENCY]) + USD
- Include a FAQ section with 5-7 questions targeting long-tail keywords
- Include GEO signals: mention [CITY1], [CITY2], local market context
- Write in English (professional, friendly, not robotic)
- Use second person ("you", "your business")

INTERNAL LINKS TO INCLUDE (use natural anchor text, not raw URLs):
[full list of service pages, case studies, existing blogs]

CTA TO INCLUDE (copy exactly):
[15-min booking CTA block]

RELATED ARTICLES SECTION:
Use these existing blog URLs at the end:
[5 relevant slugs from the analyser]

OUTPUT: Return ONLY the raw Markdown blog content. 
No explanation, no prefix, no code blocks — just the Markdown.
```

---

## 17. Topic Planning Logic

The `topicPlanner.js` module uses this decision tree:

```
1. Fetch all published blog slugs from GET /api/blogs
2. Count how many blogs exist per country (detect country from slug/content keywords)
3. Pick the country with FEWEST existing blogs
4. For that country, check which services have NOT been covered yet
5. Pick the first uncovered service
6. If all services covered for all countries → pick the rarest country+service combo
7. Generate title using pattern: {service} {country-qualifier} ({year}): {value-prop}
8. Generate 10 keyword variations for that title
9. Return: { country, service, title, primaryKeyword, secondaryKeywords, targetCurrency }
```

---

## 18. Constraints + Known Limitations

| Constraint | Impact | Mitigation |
|-----------|--------|------------|
| Gemini free: 15 RPM, 1.5K req/day | Fine for 1-2 blogs/day | Groq fallback |
| Groq free: rate limited by model | Occasional delays | Retry with 5s backoff |
| Pexels free: 200 req/hour | Fine for 1-2 images/day | Sharp fallback |
| No auth on POST /api/blogs | Script must run server-side | Run on same server or VPN |
| Blog images must be uploaded first | Two-step process | Image upload before content post |
| Slugs auto-generated from title | Changing title changes slug | Never update title after publish |

---

## 19. Success Metrics

After 4 weeks of running:
- 28+ new geo-targeted blog posts (1/day)
- Coverage: all 7 countries × at least 4 services each
- GSC impressions increase in NZ, IN, US, UK, AU
- Organic clicks from targeted country queries
- Zero duplicate slugs
- Zero failed runs due to unhandled errors

---

## 20. Quick Start (after implementation)

```bash
# 1. Add env vars to .env
# 2. Dry run first (safe — no DB writes)
npm run blog:dry

# 3. Force a specific combo to test end-to-end
npm run blog:force -- --country=nz --service=web-development --status=draft

# 4. Review the draft in admin panel
# 5. If good, run live
npm run blog:auto
```
