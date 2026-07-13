const { generate } = require("./aiClient");
const { buildBlogPrompt, buildMetaPrompt } = require("../prompts/blogPrompt");

async function generateContent({ country, service, existingBlogs, aiTopic = {} }) {
  // ── Step 1: Generate full blog content ───────────────────────────────
  console.log(`  📝 Generating blog content (this takes ~30–60s)...`);
  const blogPrompt = buildBlogPrompt({ country, service, existingBlogs, aiTopic });
  const { text: content, provider: contentProvider } = await generate(blogPrompt, { label: "blog content" });

  const wordCount = content.split(/\s+/).length;
  console.log(`  ✅ Content ready — ~${wordCount.toLocaleString()} words via ${contentProvider}`);

  // Extract H1 title from generated content
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/\*\*/g, "").trim() : `${service.name} in ${country.name} (${new Date().getFullYear()})`;

  // ── Step 2: Generate SEO meta fields ─────────────────────────────────
  console.log(`  🏷️  Generating SEO meta fields...`);
  const metaPrompt = buildMetaPrompt({ title, contentExcerpt: content.slice(0, 800), service, country });
  const { text: metaRaw, provider: metaProvider } = await generate(metaPrompt, { jsonMode: true, label: "meta fields" });

  let meta;
  try {
    const cleaned = metaRaw.replace(/^```json\n?|^```\n?|\n?```$/gm, "").trim();
    meta = JSON.parse(cleaned);
  } catch {
    console.warn("  ⚠️  Meta JSON parse failed — using auto-generated defaults");
    meta = buildDefaultMeta(title, service, country);
  }

  // Validate and clamp required meta fields
  meta = sanitizeMeta(meta, title, service, country);
  console.log(`  ✅ Meta ready via ${metaProvider}`);

  return { content, title, meta, providers: { content: contentProvider, meta: metaProvider } };
}

function buildDefaultMeta(title, service, country) {
  const year = new Date().getFullYear();
  return {
    metaTitle: `${service.name} in ${country.name} (${year}) | Futurise Solutions`.slice(0, 60),
    metaDescription: `Expert ${service.name.toLowerCase()} for ${country.name} businesses. Pricing, timelines, and process guide for ${year}.`.slice(0, 160),
    metaKeywords: [
      `${service.name.toLowerCase()} ${country.name.toLowerCase()}`,
      `${service.name.toLowerCase()} cost ${country.name.toLowerCase()}`,
      `${service.name.toLowerCase()} agency ${country.name.toLowerCase()}`,
      `${service.name.toLowerCase()} ${year}`,
      "futurise solutions",
    ],
    shortDescription: `A complete ${year} guide to ${service.name.toLowerCase()} for businesses in ${country.name} — covering pricing, timelines, and how to choose the right partner.`,
    tags: [service.name, country.name, `${service.name} ${country.name}`, `${service.name} Agency`, "Futurise Solutions"],
    category: service.category,
  };
}

function sanitizeMeta(meta, title, service, country) {
  const year = new Date().getFullYear();
  return {
    metaTitle: String(meta.metaTitle || title).slice(0, 60),
    metaDescription: String(meta.metaDescription || "").slice(0, 160),
    metaKeywords: Array.isArray(meta.metaKeywords) ? meta.metaKeywords.slice(0, 12) : [],
    shortDescription: String(meta.shortDescription || "").slice(0, 200),
    tags: Array.isArray(meta.tags) ? meta.tags.slice(0, 15) : [service.name, country.name],
    category: meta.category || aiTopic?.category || service.category,
  };
}

module.exports = { generateContent };
