const axios = require("axios");
const { BLOGS_API } = require("../config");

async function publishBlog(payload) {
  const res = await axios.post(BLOGS_API, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
  });

  if (!res.data?._id && !res.data?.id) {
    throw new Error(`Blog API returned unexpected response: ${JSON.stringify(res.data).slice(0, 200)}`);
  }

  return res.data;
}

module.exports = { publishBlog };
