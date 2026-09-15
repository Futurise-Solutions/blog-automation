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
      timeout: 20000,
    });

    console.log("Status:", res.status);
    console.log("Response:");
    console.log(JSON.stringify(res.data, null, 2));

    const responseObj = res.data?.data || res.data;

    if (!responseObj?._id && !responseObj?.id) {
      throw new Error(
        `Blog API returned unexpected response: ${JSON.stringify(res.data)}`
      );
    }

    console.log("✅ Blog published successfully.");
    console.log("=================================\n");

    return responseObj;
  } catch (err) {
    console.error("\n========== BLOG PUBLISH ERROR ==========");
    console.error("URL:", BLOGS_API);

    if (err.response) {
      console.error("Status:", err.response.status, err.response.statusText);
      console.error("Response Body:", JSON.stringify(err.response.data, null, 2));
    } else if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
      console.error(`❌ Connection to backend API timed out at ${BLOGS_API}. Please ensure your backend server is online and accessible.`);
    } else if (err.request) {
      console.error(`❌ No response received from server at ${BLOGS_API} (${err.message}). Check if server is running or if BLOG_API_BASE is correct.`);
    } else {
      console.error("Request setup error:", err.message);
    }

    console.error("========================================\n");

    throw err;
  }
}

module.exports = { publishBlog };