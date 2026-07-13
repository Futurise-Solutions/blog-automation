const axios = require("axios");
const FormData = require("form-data");
const { UPLOAD_API } = require("../config");

async function uploadImage(imageBuffer, filename = "blog-featured.png") {
  const form = new FormData();
  form.append("image", imageBuffer, {
    filename,
    contentType: "image/png",
  });

  const res = await axios.post(UPLOAD_API, form, {
    headers: {
      ...form.getHeaders(),
    },
    timeout: 60000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  if (!res.data?.imageUrl) {
    throw new Error(`Upload API returned no imageUrl: ${JSON.stringify(res.data)}`);
  }

  return res.data.imageUrl;
}

module.exports = { uploadImage };
