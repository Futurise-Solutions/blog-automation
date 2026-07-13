# Futurise Solutions — Blog Automation

AI-powered blog automation that generates, optimises, and publishes SEO-targeted blog posts automatically — twice a day, every day.

---

## How It Works

```
10:00 AM & 6:00 PM IST (daily)
         ↓
GitHub Actions triggers run.js
         ↓
Step 1 → Read all existing blogs from API
Step 2 → AI picks the best trending topic (not just services)
Step 3 → AI writes 3000+ word blog (Gemini → Groq fallback)
Step 4 → Fetch featured image (Pexels → Sharp banner fallback)
Step 5 → Upload image to Cloudinary via /api/upload
Step 6 → Publish blog via POST /api/blogs
         ↓
   Live on futurisesolutions.com/blog
```

---

## Target Countries

| Country | Currency | Key Cities |
|---------|----------|------------|
| New Zealand | NZD | Wellington, Auckland, Christchurch |
| India | INR | Bangalore, Mumbai, Delhi |
| USA | USD | San Francisco, New York, Austin |
| UK | GBP | London, Manchester, Edinburgh |
| Australia | AUD | Sydney, Melbourne, Brisbane |
| Saudi Arabia | SAR | Riyadh, Jeddah, NEOM |
| South Africa | ZAR | Cape Town, Johannesburg, Durban |
| Canada | CAD | Toronto, Vancouver, Montreal |
| Dubai / UAE | AED | Dubai, Abu Dhabi, Sharjah |

---

## Blog Content Types AI Can Pick

AI is not restricted to service guides — it picks whatever topic will rank best on Google:

| Type | Example |
|------|---------|
| Service Guide | "Web Development Cost in Canada (2026): Complete Pricing Guide" |
| Case Study | "How We Built an AI Agent That Handles 80% of Support Queries" |
| Trending Topic | "Google AI Overviews Are Changing SEO — Here's What to Do Now" |
| Strategy Guide | "The 90-Day SEO Strategy That Grew Traffic by 340%" |
| Tool Comparison | "Cursor vs GitHub Copilot for Full-Stack Teams (2026 Review)" |
| Industry News | "OpenAI o3 vs Gemini 2.5: Which AI Should Your Business Use?" |
| How-To Tutorial | "How to Build a RAG Chatbot for Your Business (No PhD Required)" |
| Listicle | "11 AI Tools Every Dubai Startup Should Use in 2026" |
| Market Report | "State of App Development in India 2026: Costs, Trends & Data" |
| Cost Breakdown | "I Got Quotes from 10 UK Web Agencies — Here's What I Found" |

---

## AI Stack

| Role | Primary | Fallback |
|------|---------|----------|
| Topic Planning | Gemini 2.5 Flash | Groq llama-3.1-70b |
| Blog Content | Gemini 2.5 Flash | Groq llama-3.1-70b |
| SEO Meta Fields | Gemini 2.5 Flash | Groq llama-3.1-70b |

Groq activates automatically when Gemini hits its free quota limit.

---

## Image Strategy

| Source | When Used |
|--------|-----------|
| Pexels API | Primary — free stock photos, keyword-searched per topic |
| Sharp Banner | Fallback — generates a branded dark gradient banner with blog title |

---

## Project Structure

```
blogAutomation/
├── run.js                        ← Main entry point
├── config.js                     ← Countries, services, API URLs, CTA links
│
├── modules/
│   ├── aiClient.js               ← Gemini + Groq with auto-fallback
│   ├── blogAnalyser.js           ← GET existing blogs from API
│   ├── topicPlanner.js           ← AI topic selection
│   ├── contentGenerator.js       ← Blog content + meta generation
│   ├── imageHandler.js           ← Pexels fetch + Sharp banner fallback
│   ├── imageUploader.js          ← POST image to /api/upload → Cloudinary URL
│   ├── blogPublisher.js          ← POST blog to /api/blogs
│   └── logger.js                 ← Append-only run log (logs/runs.jsonl)
│
├── prompts/
│   ├── topicPrompt.js            ← AI prompt for topic selection
│   └── blogPrompt.js             ← AI prompt for blog content generation
│
├── logs/
│   └── runs.jsonl                ← Auto-created, one JSON line per run
│
└── .github/
    └── workflows/
        └── blog-automation.yml   ← GitHub Actions — runs at 10 AM & 6 PM IST
```

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/Futurise-Solutions/blog-automation.git
cd blog-automation
npm install
```

### 2. Create `.env` file

```bash
cp .env.example .env
```

Fill in your keys:

```env
GEMINI_API_KEY=your_key      # aistudio.google.com/apikey
GROQ_API_KEY=your_key        # console.groq.com/keys
PEXELS_API_KEY=your_key      # pexels.com/api
BLOG_API_BASE=https://api.futurisesolutions.com
BLOG_AUTO_STATUS=published
```

### 3. Add GitHub Secrets & Variables

Go to: **GitHub repo → Settings → Secrets and variables → Actions**

**Secrets (encrypted):**

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | Gemini API key |
| `GROQ_API_KEY` | Groq API key |
| `PEXELS_API_KEY` | Pexels API key |

**Variables (plain text):**

| Name | Value |
|------|-------|
| `BLOG_API_BASE` | `https://api.futurisesolutions.com` |
| `BLOG_AUTO_STATUS` | `published` |

---

## Running Locally

```bash
# Dry run — no DB writes, just preview the topic + content
node run.js --dry-run

# Force a specific country + service
node run.js --country=ae --service=ai-ml-solutions

# Post as draft (review before publishing)
node run.js --status=draft

# Full auto run
node run.js

# View recent run history
node run.js --logs
```

### CLI Flags

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview only — no image upload, no DB write |
| `--country=xx` | Force country: `nz / in / us / uk / au / sa / za / ca / ae` |
| `--service=xx` | Force service: `web-development / app-development / ui-ux-design / ai-ml-solutions / blockchain-development / digital-marketing` |
| `--status=draft` | Publish as draft instead of live |
| `--logs` | Show last 10 run results |

---

## GitHub Actions Schedule

Runs automatically — no manual trigger needed.

| Time (IST) | Time (UTC) | Cron |
|------------|------------|------|
| 10:00 AM | 04:30 AM | `30 4 * * *` |
| 6:00 PM | 12:30 PM | `30 12 * * *` |

**Manual trigger:** GitHub → Actions → Daily Blog Automation → Run workflow

You can manually set country, service, and status when triggering manually.

---

## Run Logs

Every run is logged to `logs/runs.jsonl`:

```json
// Success
{ "ts": "2026-07-13T04:30:00Z", "country": "ae", "service": "ai-ml-solutions", "title": "How Dubai Businesses Are Using AI Agents...", "slug": "how-dubai-businesses...", "aiUsed": "gemini", "imageSource": "pexels", "status": "success" }

// Failed
{ "ts": "2026-07-13T12:30:00Z", "country": "ca", "service": "web-development", "status": "failed", "error": "Groq rate limit exceeded" }
```

Logs are also uploaded as artifacts in every GitHub Actions run (retained 30 days).

---

## Free Tier Limits

| Service | Free Limit | Usage per run |
|---------|-----------|---------------|
| Gemini 2.5 Flash | 1,500 req/day, 1M tokens/day | ~2 requests |
| Groq llama-3.1-70b | ~14,400 req/day | ~2 requests (fallback only) |
| Pexels | 200 req/hour | 1 request |
| GitHub Actions | 2,000 min/month (public repo = unlimited) | ~2–3 min per run |

At 2 runs/day — all free tier limits are comfortably within range.

---

## Output

Each run produces one blog post with:
- **3,000–5,000 words** of SEO-optimised content
- **H1 title** with primary keyword + year
- **Table of contents**
- **Pricing table** in local currency + USD
- **FAQ section** (6+ questions)
- **Internal links** to service pages, case studies, other blogs
- **15-minute discovery call CTA**
- **Related articles** section
- **Meta title, description, keywords** (auto-generated)
- **Featured image** from Pexels or branded Sharp banner
- **Hosted on Cloudinary CDN**
