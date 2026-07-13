const axios = require("axios");
const sharp = require("sharp");

// Fetch a relevant stock photo from Pexels free API
async function fetchFromPexels(query) {
  if (!process.env.PEXELS_API_KEY) throw new Error("PEXELS_API_KEY not set");

  const res = await axios.get("https://api.pexels.com/v1/search", {
    headers: { Authorization: process.env.PEXELS_API_KEY },
    params: { query, orientation: "landscape", per_page: 8, size: "large" },
    timeout: 15000,
  });

  const photos = res.data?.photos;
  if (!photos?.length) throw new Error(`No Pexels results for: "${query}"`);

  // Pick a photo with good dimensions (prefer landscape 16:9 ratio)
  const photo = photos.find((p) => p.width >= 1200) || photos[0];
  const imageUrl = photo.src.large2x || photo.src.large || photo.src.original;

  console.log(`  🖼️  Pexels photo: ${photo.url}`);

  const imgRes = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: 30000,
  });

  return Buffer.from(imgRes.data);
}

// Generate a branded dark gradient banner using Sharp (no API needed)
async function generateSharpBanner(title, serviceName, countryName) {
  const WIDTH = 1280;
  const HEIGHT = 720;

  // Truncate title for display
  const displayTitle = title.length > 55 ? title.substring(0, 52) + "..." : title;

  // Split into two lines if needed
  const words = displayTitle.split(" ");
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(" ");
  const line2 = words.slice(mid).join(" ");

  const svg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#08080D"/>
      <stop offset="45%" style="stop-color:#150d28"/>
      <stop offset="100%" style="stop-color:#0a0618"/>
    </linearGradient>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#7B6CFF"/>
      <stop offset="100%" style="stop-color:#B57BFF"/>
    </linearGradient>
    <linearGradient id="glow" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" style="stop-color:#7B6CFF;stop-opacity:0.25"/>
      <stop offset="100%" style="stop-color:#7B6CFF;stop-opacity:0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Center glow -->
  <ellipse cx="${WIDTH / 2}" cy="${HEIGHT / 2}" rx="480" ry="280" fill="url(#glow)"/>

  <!-- Subtle grid lines -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
    <line x1="0" y1="180" x2="${WIDTH}" y2="180"/>
    <line x1="0" y1="360" x2="${WIDTH}" y2="360"/>
    <line x1="0" y1="540" x2="${WIDTH}" y2="540"/>
    <line x1="320" y1="0" x2="320" y2="${HEIGHT}"/>
    <line x1="640" y1="0" x2="640" y2="${HEIGHT}"/>
    <line x1="960" y1="0" x2="960" y2="${HEIGHT}"/>
  </g>

  <!-- Brand accent bar bottom -->
  <rect x="0" y="${HEIGHT - 5}" width="${WIDTH}" height="5" fill="url(#brand)"/>

  <!-- Top label: service + country chip -->
  <rect x="60" y="50" width="220" height="36" rx="18" fill="#7B6CFF" fill-opacity="0.18" stroke="#7B6CFF" stroke-opacity="0.5" stroke-width="1"/>
  <text x="170" y="74" font-family="Arial, sans-serif" font-size="16" fill="#b4a0ff" text-anchor="middle" font-weight="600">${serviceName} · ${countryName}</text>

  <!-- Brand name top right -->
  <text x="${WIDTH - 60}" y="74" font-family="Arial, sans-serif" font-size="18" fill="#7B6CFF" text-anchor="end" font-weight="700" opacity="0.9">Futurise Solutions</text>

  <!-- Main title line 1 -->
  <text x="${WIDTH / 2}" y="${line2 ? HEIGHT / 2 - 28 : HEIGHT / 2 + 16}"
    font-family="Arial, sans-serif" font-size="46" fill="#f4f2ff"
    font-weight="800" text-anchor="middle" dominant-baseline="middle">${escapeXml(line1)}</text>

  ${line2 ? `<text x="${WIDTH / 2}" y="${HEIGHT / 2 + 40}"
    font-family="Arial, sans-serif" font-size="46" fill="#f4f2ff"
    font-weight="800" text-anchor="middle" dominant-baseline="middle">${escapeXml(line2)}</text>` : ""}

  <!-- Tagline -->
  <text x="${WIDTH / 2}" y="${HEIGHT - 48}" font-family="Arial, sans-serif" font-size="17" fill="#7d6ccc" text-anchor="middle" opacity="0.8">futurisesolutions.com</text>
</svg>`;

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function getImage(service, country) {
  // Try Pexels first
  try {
    if (process.env.PEXELS_API_KEY) {
      console.log(`  🔍 Searching Pexels for: "${service.pexelsQuery}"...`);
      const buf = await fetchFromPexels(service.pexelsQuery);
      return { buffer: buf, source: "pexels" };
    }
  } catch (err) {
    console.log(`  ⚠️  Pexels failed (${err.message}) — falling back to Sharp banner`);
  }

  // Fallback: generate branded banner
  console.log(`  🎨 Generating Sharp gradient banner...`);
  const buf = await generateSharpBanner(
    `${service.name} in ${country.name}`,
    service.name,
    country.name
  );
  return { buffer: buf, source: "sharp" };
}

module.exports = { getImage };
