const axios = require("axios");
const { BLOGS_API } = require("../config");

async function analyseBlogs() {
  const res = await axios.get(BLOGS_API, { timeout: 20000 });
  const raw = Array.isArray(res.data) ? res.data : [];

  return raw.map((b) => ({
    slug: b.slug || "",
    title: b.title || "",
    category: b.category || "",
    url: `https://www.futurisesolutions.com/blog/${b.slug}`,
  }));
}

module.exports = { analyseBlogs };
