const axios = require("axios");
const FormData = require("form-data");
const { UPLOAD_API } = require("../config");

async function uploadImage(imageBuffer, filename = "blog-featured.png", fallbackUrl = null) {
  try {
    const form = new FormData();
    form.append("image", imageBuffer, {
      filename,
      contentType: "image/png",
    });

    const res = await axios.post(UPLOAD_API, form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 15000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (!res.data?.imageUrl) {
      throw new Error(`Upload API returned no imageUrl: ${JSON.stringify(res.data)}`);
    }

    return res.data.imageUrl;
  } catch (err) {
    if (fallbackUrl) {
      console.warn(`  ⚠️  Image upload to ${UPLOAD_API} failed (${err.message}). Using direct stock image URL.`);
      return fallbackUrl;
    }
    throw new Error(`Failed to upload image to ${UPLOAD_API} (${err.message}) and no fallback URL is available.`);
  }
}

module.exports = { uploadImage };
