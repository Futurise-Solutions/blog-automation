const axios = require("axios");
const { BLOGS_API } = require("../config");

async function analyseBlogs() {
  try {
    const res = await axios.get(BLOGS_API, { timeout: 15000 });
    const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);

    return raw.map((b) => ({
      slug: b.slug || "",
      title: b.title || "",
      category: b.category || "",
      url: `https://www.futurisesolutions.com/blog/${b.slug}`,
    }));
  } catch (err) {
    console.warn(`  ⚠️  Warning: Failed to fetch existing blogs from ${BLOGS_API} (${err.message}). Continuing with empty blog list.`);
    return [];
  }
}

module.exports = { analyseBlogs };
