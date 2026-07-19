const axios = require("axios");
const { BLOGS_API } = require("../config");

async function publishBlog(payload) {
  try {
    console.log("\n========== BLOG PUBLISH ==========");
    console.log("URL:", BLOGS_API);
    console.log("Payload:");
    console.log(JSON.stringify(payload, null, 2));

    const res = await axios.post(BLOGS_API, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    console.log("Status:", res.status);
    console.log("Response:");
    console.log(JSON.stringify(res.data, null, 2));

    if (!res.data?._id && !res.data?.id) {
      throw new Error(
        `Blog API returned unexpected response: ${JSON.stringify(res.data)}`
      );
    }

    console.log("✅ Blog published successfully.");
    console.log("=================================\n");

    return res.data;
  } catch (err) {
    console.error("\n========== BLOG PUBLISH ERROR ==========");
    console.error("URL:", BLOGS_API);

    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Status Text:", err.response.statusText);
      console.error("Response Headers:");
      console.error(JSON.stringify(err.response.headers, null, 2));
      console.error("Response Body:");
      console.error(JSON.stringify(err.response.data, null, 2));
    } else if (err.request) {
      console.error("No response received from server.");
      console.error(err.request);
    } else {
      console.error("Request setup error:", err.message);
    }

    console.error("Payload:");
    console.error(JSON.stringify(payload, null, 2));

    console.error("Stack Trace:");
    console.error(err.stack);

    console.error("========================================\n");

    throw err;
  }
}

module.exports = { publishBlog };