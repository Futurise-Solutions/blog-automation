require("dotenv").config();

const { analyseBlogs } = require("./modules/blogAnalyser");
const { planTopic } = require("./modules/topicPlanner");
const { generateContent } = require("./modules/contentGenerator");
const { getImage } = require("./modules/imageHandler");
const { uploadImage } = require("./modules/imageUploader");
const { publishBlog } = require("./modules/blogPublisher");
const { logRun, readRecentRuns } = require("./modules/logger");
const { BLOG_STATUS } = require("./config");

// ── Parse CLI flags ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE_COUNTRY = args.find((a) => a.startsWith("--country="))?.split("=")[1];
const FORCE_SERVICE = args.find((a) => a.startsWith("--service="))?.split("=")[1];
const STATUS_FLAG = args.find((a) => a.startsWith("--status="))?.split("=")[1];
const SHOW_LOGS = args.includes("--logs");
const STATUS = STATUS_FLAG || BLOG_STATUS;

// ── Show recent logs mode ──────────────────────────────────────────────
if (SHOW_LOGS) {
  const runs = readRecentRuns(10);
  if (!runs.length) { console.log("No runs logged yet."); process.exit(0); }
  console.log("\nRecent Runs:\n");
  for (const r of runs) {
    const icon = r.status === "success" ? "✅" : r.status === "dry_run" ? "🔍" : "❌";
    console.log(`${icon} [${r.ts}] ${r.country}/${r.service} — ${r.title || "(no title)"}`);
    if (r.slug) console.log(`   URL: https://www.futurisesolutions.com/blog/${r.slug}`);
    if (r.error) console.log(`   Error: ${r.error}`);
  }
  console.log();
  process.exit(0);
}

// ── Main automation run ────────────────────────────────────────────────
async function run() {
  banner();

  const logData = { country: null, service: null, title: null, status: "failed" };

  try {
    // ── 1. Analyse existing blogs ──────────────────────────────────────
    step(1, "Analysing existing published blogs...");
    const existingBlogs = await analyseBlogs();
    console.log(`     Found ${existingBlogs.length} published blog(s)\n`);

    // ── 2. Plan the next topic ─────────────────────────────────────────
    step(2, "Planning next topic...");
    const { country, service } = planTopic(existingBlogs, FORCE_COUNTRY, FORCE_SERVICE);
    console.log(`\n     ✅ Target: ${service.name} × ${country.name}\n`);
    logData.country = country.code;
    logData.service = service.key;

    // ── 3. Generate blog content + meta ───────────────────────────────
    step(3, "Generating blog content with AI...");
    const { content, title, meta, providers } = await generateContent({ country, service, existingBlogs });
    logData.title = title;
    logData.aiUsed = providers.content;
    console.log(`     Title: "${title}"\n`);

    // ── DRY RUN — print preview and exit ──────────────────────────────
    if (DRY_RUN) {
      console.log("━".repeat(60));
      console.log("DRY RUN PREVIEW\n");
      console.log(`TITLE:\n${title}\n`);
      console.log(`META TITLE: ${meta.metaTitle}`);
      console.log(`META DESCRIPTION: ${meta.metaDescription}`);
      console.log(`CATEGORY: ${meta.category}`);
      console.log(`TAGS: ${(meta.tags || []).join(", ")}\n`);
      console.log("CONTENT PREVIEW (first 600 chars):\n");
      console.log(content.slice(0, 600) + "\n...\n");
      console.log("━".repeat(60));
      console.log(`\n✅ Dry run complete — no DB writes, no uploads.\n`);
      logRun({ ...logData, status: "dry_run" });
      return;
    }

    // ── 4. Get featured image ─────────────────────────────────────────
    step(4, "Getting featured image...");
    const { buffer: imageBuffer, source: imageSource } = await getImage(service, country);
    console.log(`     Image ready (source: ${imageSource})\n`);
    logData.imageSource = imageSource;

    // ── 5. Upload image to Cloudinary ─────────────────────────────────
    step(5, "Uploading image to Cloudinary...");
    const imageUrl = await uploadImage(imageBuffer, `${service.key}-${country.code}-${Date.now()}.png`);
    console.log(`     Cloudinary URL: ${imageUrl}\n`);

    // ── 6. Publish blog ───────────────────────────────────────────────
    step(6, `Publishing blog (status: ${STATUS})...`);
    const payload = buildPayload({ title, content, imageUrl, meta, service, status: STATUS });
    const result = await publishBlog(payload);

    const blogUrl = `https://www.futurisesolutions.com/blog/${result.slug}`;
    console.log(`     ✅ Published! ID: ${result._id}`);
    console.log(`     Slug: ${result.slug}`);
    console.log(`     URL: ${blogUrl}\n`);

    logRun({ ...logData, slug: result.slug, blogId: result._id, blogUrl, status: "success" });
    done();

  } catch (err) {
    console.error(`\n❌ Failed: ${err.message}\n`);
    logRun({ ...logData, status: "failed", error: err.message });
    process.exit(1);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────
function buildPayload({ title, content, imageUrl, meta, service, status }) {
  return {
    title,
    shortDescription: meta.shortDescription,
    featuredImage: imageUrl,
    category: meta.category || service.category,
    tags: meta.tags || [],
    content,
    status,
    meta: {
      metaTitle: meta.metaTitle,
      metaDescription: meta.metaDescription,
      metaKeywords: meta.metaKeywords || [],
      ogType: "article",
      robots: "index,follow",
    },
  };
}

function banner() {
  console.log("\n" + "━".repeat(60));
  console.log("  Futurise Solutions — Blog Automation");
  console.log(`  Mode  : ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`  Status: ${DRY_RUN ? "—" : STATUS}`);
  if (FORCE_COUNTRY) console.log(`  Force country  : ${FORCE_COUNTRY}`);
  if (FORCE_SERVICE) console.log(`  Force service  : ${FORCE_SERVICE}`);
  console.log("━".repeat(60) + "\n");
}

function step(n, label) {
  console.log(`[${n}/6] ${label}`);
}

function done() {
  console.log("━".repeat(60));
  console.log("  ✅ Blog automation complete!");
  console.log("━".repeat(60) + "\n");
}

run();
