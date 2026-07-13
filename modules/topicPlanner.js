const { COUNTRIES, SERVICES } = require("../config");

// Detect which country a blog targets by scanning its slug and title
function detectCountry(slug, title) {
  const text = `${slug} ${title}`.toLowerCase();
  const signals = {
    nz: ["new-zealand", "new zealand", "-nz-", " nz ", "kiwi", "wellington", "auckland", "christchurch"],
    in: ["india", "-india", "indian", "bangalore", "mumbai", "delhi", "hyderabad", "inr"],
    us: ["united-states", "united states", "-usa-", " usa", " us ", "american", "silicon-valley", "san-francisco"],
    uk: ["-uk-", " uk ", "united-kingdom", "united kingdom", "british", "london", "manchester", "£"],
    au: ["australia", "australian", "sydney", "melbourne", "brisbane", "aud"],
    sa: ["saudi", "saudi-arabia", "riyadh", "vision-2030", "jeddah", "neom"],
    za: ["south-africa", "south africa", "cape-town", "johannesburg", "durban", "popia"],
  };
  for (const [code, words] of Object.entries(signals)) {
    if (words.some((w) => text.includes(w))) return code;
  }
  return null;
}

// Detect which service a blog targets
function detectService(slug, title, category) {
  const text = `${slug} ${title} ${category}`.toLowerCase();
  const signals = {
    "web-development": ["web-development", "web development", "website", "web app", "react", "next.js", "node.js"],
    "app-development": ["app-development", "app development", "mobile app", "ios", "android", "react native"],
    "ui-ux-design": ["ui-ux", "ui/ux", "ux design", "ui design", "user interface", "user experience", "figma"],
    "ai-ml-solutions": ["ai-", "ai &", "ai and", "machine learning", "artificial intelligence", "llm", "nlp", "computer vision", "ai agent"],
    "blockchain-development": ["blockchain", "smart contract", "defi", "web3", "nft", "crypto"],
    "digital-marketing": ["digital-marketing", "digital marketing", "seo ", "-seo", "ppc", "social media marketing", "cro"],
  };
  for (const [key, words] of Object.entries(signals)) {
    if (words.some((w) => text.includes(w))) return key;
  }
  return null;
}

function planTopic(existingBlogs, forcedCountry = null, forcedService = null) {
  // Build coverage matrix: country → service → count
  const coverage = {};
  for (const c of COUNTRIES) {
    coverage[c.code] = {};
    for (const s of SERVICES) coverage[c.code][s.key] = 0;
  }

  for (const b of existingBlogs) {
    const c = detectCountry(b.slug, b.title);
    const s = detectService(b.slug, b.title, b.category);
    if (c && s && coverage[c] && coverage[c][s] !== undefined) {
      coverage[c][s]++;
    }
  }

  // Resolve target country
  let targetCountry;
  if (forcedCountry) {
    targetCountry = COUNTRIES.find((c) => c.code === forcedCountry);
    if (!targetCountry) throw new Error(`Unknown --country="${forcedCountry}". Valid: ${COUNTRIES.map((c) => c.code).join(", ")}`);
  } else {
    // Pick country with the lowest total blog count
    targetCountry = COUNTRIES.reduce((best, c) => {
      const total = Object.values(coverage[c.code]).reduce((a, n) => a + n, 0);
      const bestTotal = Object.values(coverage[best.code]).reduce((a, n) => a + n, 0);
      return total < bestTotal ? c : best;
    });
  }

  // Resolve target service
  let targetService;
  if (forcedService) {
    targetService = SERVICES.find((s) => s.key === forcedService);
    if (!targetService) throw new Error(`Unknown --service="${forcedService}". Valid: ${SERVICES.map((s) => s.key).join(", ")}`);
  } else {
    // For this country, pick the service with the fewest existing blogs
    targetService = SERVICES.reduce((best, s) => {
      return coverage[targetCountry.code][s.key] < coverage[targetCountry.code][best.key] ? s : best;
    });
  }

  // Log coverage snapshot
  console.log(`  Coverage for ${targetCountry.name}:`);
  for (const s of SERVICES) {
    const count = coverage[targetCountry.code][s.key];
    const marker = s.key === targetService.key ? " ← selected" : "";
    console.log(`    ${s.name}: ${count} blog(s)${marker}`);
  }

  return { country: targetCountry, service: targetService };
}

module.exports = { planTopic };
