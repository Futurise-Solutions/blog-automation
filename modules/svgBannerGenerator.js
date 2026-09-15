const { generate } = require("../modules/aiClient");
const sharp = require("sharp");

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text, maxCharsPerLine = 34, maxLines = 3) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines;
}

// Color palette themes tailored to services
const PALETTES = {
  ai: {
    primary: "#8B5CF6", // Violet
    secondary: "#6366F1", // Indigo
    accent: "#38BDF8", // Cyan
    bgStart: "#070814",
    bgMid: "#0f1126",
    bgEnd: "#05060d",
    badgeBg: "rgba(139, 92, 246, 0.2)",
    badgeBorder: "#8B5CF6",
    badgeText: "#DDD6FE",
  },
  web: {
    primary: "#3B82F6", // Blue
    secondary: "#06B6D4", // Cyan
    accent: "#10B981", // Emerald
    bgStart: "#060a16",
    bgMid: "#0c152a",
    bgEnd: "#040711",
    badgeBg: "rgba(59, 130, 246, 0.2)",
    badgeBorder: "#3B82F6",
    badgeText: "#BAE6FD",
  },
  app: {
    primary: "#EC4899", // Pink
    secondary: "#8B5CF6", // Violet
    accent: "#F59E0B", // Amber
    bgStart: "#0f0714",
    bgMid: "#1c0f26",
    bgEnd: "#08030b",
    badgeBg: "rgba(236, 72, 153, 0.2)",
    badgeBorder: "#EC4899",
    badgeText: "#FBCFE8",
  },
  design: {
    primary: "#F43F5E", // Rose
    secondary: "#FB923C", // Orange
    accent: "#A855F7", // Purple
    bgStart: "#12080a",
    bgMid: "#220e14",
    bgEnd: "#0a0305",
    badgeBg: "rgba(244, 63, 94, 0.2)",
    badgeBorder: "#F43F5E",
    badgeText: "#FECDD3",
  },
  blockchain: {
    primary: "#10B981", // Emerald
    secondary: "#06B6D4", // Cyan
    accent: "#6366F1", // Indigo
    bgStart: "#04120c",
    bgMid: "#082117",
    bgEnd: "#020906",
    badgeBg: "rgba(16, 185, 129, 0.2)",
    badgeBorder: "#10B981",
    badgeText: "#A7F3D0",
  },
  marketing: {
    primary: "#F59E0B", // Amber
    secondary: "#EF4444", // Red
    accent: "#8B5CF6", // Purple
    bgStart: "#140e06",
    bgMid: "#261a0b",
    bgEnd: "#0a0703",
    badgeBg: "rgba(245, 158, 11, 0.2)",
    badgeBorder: "#F59E0B",
    badgeText: "#FDE68A",
  },
};

function detectTheme(title, category) {
  const text = `${title} ${category || ""}`.toLowerCase();
  if (text.includes("ai") || text.includes("intelligence") || text.includes("machine learning") || text.includes("agent") || text.includes("llm")) return PALETTES.ai;
  if (text.includes("web") || text.includes("website") || text.includes("frontend") || text.includes("backend") || text.includes("full stack")) return PALETTES.web;
  if (text.includes("app") || text.includes("mobile") || text.includes("ios") || text.includes("android") || text.includes("flutter") || text.includes("react native")) return PALETTES.app;
  if (text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("figma") || text.includes("prototype")) return PALETTES.design;
  if (text.includes("blockchain") || text.includes("web3") || text.includes("crypto") || text.includes("smart contract") || text.includes("token")) return PALETTES.blockchain;
  if (text.includes("marketing") || text.includes("seo") || text.includes("growth") || text.includes("sales") || text.includes("traffic")) return PALETTES.marketing;
  return PALETTES.ai;
}

async function generateAiSvgBanner({ title, shortDescription, category, tags = [] }) {
  const theme = detectTheme(title, category);
  const WIDTH = 1280;
  const HEIGHT = 720;

  const lines = wrapText(title, 32, 3);
  const titleYStart = lines.length === 1 ? 330 : lines.length === 2 ? 285 : 245;
  const lineHeight = 58;

  const safeCategory = escapeXml((category || "Technology").toUpperCase());
  const safeTags = (tags || []).slice(0, 4).map((t) => escapeXml(t.replace(/^#/, "")));
  const safeDesc = escapeXml(
    shortDescription
      ? shortDescription.length > 95
        ? shortDescription.substring(0, 92) + "..."
        : shortDescription
      : "Next-generation engineering & strategic tech solutions for 2026."
  );

  const svg = `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.bgStart}"/>
        <stop offset="50%" stop-color="${theme.bgMid}"/>
        <stop offset="100%" stop-color="${theme.bgEnd}"/>
      </linearGradient>

      <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${theme.primary}"/>
        <stop offset="50%" stop-color="${theme.secondary}"/>
        <stop offset="100%" stop-color="${theme.accent}"/>
      </linearGradient>

      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.01"/>
      </linearGradient>

      <radialGradient id="glow1" cx="85%" cy="15%" r="45%">
        <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/>
      </radialGradient>

      <radialGradient id="glow2" cx="15%" cy="85%" r="45%">
        <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Background Base -->
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow1)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow2)"/>

    <!-- Subtle Tech Grid Lines -->
    <g stroke="#ffffff" stroke-opacity="0.035" stroke-width="1">
      <line x1="0" y1="120" x2="${WIDTH}" y2="120"/>
      <line x1="0" y1="240" x2="${WIDTH}" y2="240"/>
      <line x1="0" y1="360" x2="${WIDTH}" y2="360"/>
      <line x1="0" y1="480" x2="${WIDTH}" y2="480"/>
      <line x1="0" y1="600" x2="${WIDTH}" y2="600"/>
      <line x1="213" y1="0" x2="213" y2="${HEIGHT}"/>
      <line x1="426" y1="0" x2="426" y2="${HEIGHT}"/>
      <line x1="640" y1="0" x2="640" y2="${HEIGHT}"/>
      <line x1="853" y1="0" x2="853" y2="${HEIGHT}"/>
      <line x1="1066" y1="0" x2="1066" y2="${HEIGHT}"/>
    </g>

    <!-- Circuit Glowing Nodes -->
    <circle cx="213" cy="240" r="3.5" fill="${theme.primary}" fill-opacity="0.8"/>
    <circle cx="640" cy="480" r="3.5" fill="${theme.accent}" fill-opacity="0.8"/>
    <circle cx="853" cy="120" r="3.5" fill="${theme.secondary}" fill-opacity="0.8"/>
    <circle cx="1066" cy="360" r="3.5" fill="${theme.primary}" fill-opacity="0.8"/>

    <!-- Main Glass Card Container -->
    <rect x="70" y="60" width="1140" height="600" rx="28" fill="url(#cardBg)" stroke="#ffffff" stroke-opacity="0.10" stroke-width="1.5"/>

    <!-- Brand Header -->
    <g transform="translate(130, 125)">
      <!-- Category Pill -->
      <rect x="0" y="0" width="210" height="38" rx="19" fill="${theme.badgeBg}" stroke="${theme.badgeBorder}" stroke-opacity="0.6" stroke-width="1.2"/>
      <circle cx="22" cy="19" r="5" fill="${theme.primary}"/>
      <text x="40" y="24" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="700" fill="${theme.badgeText}" letter-spacing="0.5">${safeCategory}</text>

      <!-- Company Brand -->
      <text x="880" y="25" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="800" fill="url(#brand)" text-anchor="end" letter-spacing="1.5">FUTURISE SOLUTIONS</text>
    </g>

    <!-- Title Lines -->
    <g transform="translate(130, ${titleYStart})">
      ${lines
        .map(
          (l, i) =>
            `<text x="0" y="${i * lineHeight}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF" letter-spacing="-0.8">${escapeXml(l)}</text>`
        )
        .join("")}
    </g>

    <!-- Description Subtext -->
    <text x="130" y="${titleYStart + lines.length * lineHeight + 22}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">${safeDesc}</text>

    <!-- Footer Bar inside Card -->
    <g transform="translate(130, 595)">
      <!-- Tags -->
      ${safeTags
        .map(
          (tag, i) => `
        <g transform="translate(${i * 135}, 0)">
          <rect x="0" y="-22" width="120" height="30" rx="8" fill="#14142B" stroke="#2D2D4E" stroke-width="1"/>
          <text x="60" y="-3" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="600" fill="#CBD5E1" text-anchor="middle">#${tag}</text>
        </g>
      `
        )
        .join("")}

      <!-- Website URL -->
      <text x="880" y="-3" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="600" fill="#71719A" text-anchor="end">futurisesolutions.com</text>
    </g>

    <!-- Brand Accent Line at bottom of Card -->
    <rect x="100" y="658" width="1080" height="2" fill="url(#brand)" rx="1"/>
  </svg>`;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return buffer;
}

module.exports = { generateAiSvgBanner, detectTheme };
