require("dotenv").config();

const BASE_URL = "https://www.futurisesolutions.com";
const API_BASE = process.env.BLOG_API_BASE || "https://api.futurisesolutions.com";

const COUNTRIES = [
  {
    code: "nz",
    name: "New Zealand",
    currency: "NZD",
    symbol: "NZ$",
    usdRate: "1 NZD ≈ 0.60 USD",
    cities: ["Wellington", "Auckland", "Christchurch"],
    context:
      "New Zealand has a thriving startup ecosystem and rapidly growing digital economy. Kiwi businesses are early adopters of technology and increasingly turning to custom software to compete globally.",
    complianceNote: "New Zealand Privacy Act 2020",
    marketSize: "NZ$4.2B digital economy",
  },
  {
    code: "in",
    name: "India",
    currency: "INR",
    symbol: "₹",
    usdRate: "1 USD ≈ ₹83",
    cities: ["Bangalore", "Mumbai", "Delhi", "Hyderabad"],
    context:
      "India is one of the fastest-growing digital markets in the world. With over 800 million internet users and a booming startup ecosystem, Indian businesses are investing heavily in digital transformation.",
    complianceNote: "Digital Personal Data Protection Act (DPDPA) 2023",
    marketSize: "$180B IT industry",
  },
  {
    code: "us",
    name: "USA",
    currency: "USD",
    symbol: "$",
    usdRate: "Native USD",
    cities: ["San Francisco", "New York", "Austin", "Seattle"],
    context:
      "The US remains the world's largest tech market. American startups and enterprises are leading AI adoption and expect world-class digital products that scale from day one.",
    complianceNote: "CCPA, SOC 2, HIPAA (where applicable)",
    marketSize: "$2.4T digital economy",
  },
  {
    code: "uk",
    name: "UK",
    currency: "GBP",
    symbol: "£",
    usdRate: "1 GBP ≈ 1.27 USD",
    cities: ["London", "Manchester", "Edinburgh", "Birmingham"],
    context:
      "The UK is Europe's largest tech hub. British businesses are under increasing pressure to digitise operations, adopt AI, and deliver seamless digital experiences post-Brexit.",
    complianceNote: "UK GDPR, ICO compliance",
    marketSize: "£150B tech sector",
  },
  {
    code: "au",
    name: "Australia",
    currency: "AUD",
    symbol: "A$",
    usdRate: "1 AUD ≈ 0.65 USD",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth"],
    context:
      "Australia's digital economy is growing rapidly. Australian businesses — from fintech to healthtech — are investing in custom software and AI solutions to stay competitive in the Asia-Pacific region.",
    complianceNote: "Australian Privacy Act 1988, APP compliance",
    marketSize: "A$167B digital economy",
  },
  {
    code: "sa",
    name: "Saudi Arabia",
    currency: "SAR",
    symbol: "SAR",
    usdRate: "1 USD ≈ 3.75 SAR",
    cities: ["Riyadh", "Jeddah", "NEOM"],
    context:
      "Saudi Arabia's Vision 2030 is driving unprecedented digital transformation. The Kingdom is actively investing in AI, fintech, smart cities, and digital infrastructure to diversify its economy.",
    complianceNote: "PDPL (Personal Data Protection Law) 2021",
    marketSize: "SAR 50B digital economy target",
  },
  {
    code: "za",
    name: "South Africa",
    currency: "ZAR",
    symbol: "R",
    usdRate: "1 USD ≈ R18.5",
    cities: ["Cape Town", "Johannesburg", "Durban"],
    context:
      "South Africa is Africa's most mature digital market. Cape Town's growing tech scene and Johannesburg's financial hub are driving demand for custom software, mobile apps, and AI solutions.",
    complianceNote: "POPIA (Protection of Personal Information Act)",
    marketSize: "R225B ICT sector",
  },
];

const SERVICES = [
  {
    key: "web-development",
    name: "Web Development",
    route: "/service/web-development",
    category: "Web Development",
    keywords: ["web development", "website", "web app", "React", "Next.js", "custom website"],
    pexelsQuery: "web development coding technology office",
  },
  {
    key: "app-development",
    name: "App Development",
    route: "/service/app-development",
    category: "App Development",
    keywords: ["app development", "mobile app", "iOS", "Android", "React Native", "cross-platform"],
    pexelsQuery: "mobile app development smartphone technology",
  },
  {
    key: "ui-ux-design",
    name: "UI/UX Design",
    route: "/service/ui-ux-design",
    category: "UI/UX Design",
    keywords: ["UI UX design", "user interface", "user experience", "Figma", "product design"],
    pexelsQuery: "UI UX design interface wireframe digital",
  },
  {
    key: "ai-ml-solutions",
    name: "AI & ML Solutions",
    route: "/service/ai-ml-solutions",
    category: "AI & ML",
    keywords: ["AI solutions", "machine learning", "artificial intelligence", "AI agents", "LLM", "automation"],
    pexelsQuery: "artificial intelligence technology futuristic digital",
  },
  {
    key: "blockchain-development",
    name: "Blockchain Development",
    route: "/service/blockchain-development",
    category: "Blockchain",
    keywords: ["blockchain development", "smart contracts", "DeFi", "Web3", "crypto", "NFT"],
    pexelsQuery: "blockchain cryptocurrency technology digital network",
  },
  {
    key: "digital-marketing",
    name: "Digital Marketing",
    route: "/service/digital-marketing",
    category: "Digital Marketing",
    keywords: ["digital marketing", "SEO", "social media", "PPC", "growth marketing", "CRO"],
    pexelsQuery: "digital marketing social media analytics growth",
  },
];

const INTERNAL_LINKS = {
  services: {
    "UI/UX Design Services": `${BASE_URL}/service/ui-ux-design`,
    "Web Development Services": `${BASE_URL}/service/web-development`,
    "App Development Services": `${BASE_URL}/service/app-development`,
    "AI & ML Solutions": `${BASE_URL}/service/ai-ml-solutions`,
    "Blockchain Development Services": `${BASE_URL}/service/blockchain-development`,
    "Digital Marketing Services": `${BASE_URL}/service/digital-marketing`,
  },
  caseStudies: {
    "AI Support Agent Case Study": `${BASE_URL}/case-studies/ai-support-agent`,
    "SaaS Platform Scale Case Study": `${BASE_URL}/case-studies/saas-platform-scale`,
    "Real Estate App Case Study": `${BASE_URL}/case-studies/real-estate-app`,
    "FinTech UX Redesign Case Study": `${BASE_URL}/case-studies/fintech-ux-redesign`,
    "DeFi Protocol Launch Case Study": `${BASE_URL}/case-studies/defi-protocol-launch`,
    "SaaS SEO Growth Case Study": `${BASE_URL}/case-studies/saas-seo-growth`,
  },
  core: {
    Portfolio: `${BASE_URL}/portfolio`,
    About: `${BASE_URL}/about`,
    Contact: `${BASE_URL}/contact`,
    Blog: `${BASE_URL}/blog`,
    Home: `${BASE_URL}/`,
  },
};

const BOOKING_LINK =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0aFyvaujrzkoyugDXtY1nJVN0uCQOT_6Ce_uqA58bOB_409ANHe4RwcBLoZ5BoLiubC-Cou1_4";

const CTA_BLOCK = `---

## Ready to Get Started?

Great ${new Date().getFullYear()} digital products don't build themselves — but with the right partner, the path from idea to launch is clear and fast.

### 👉 [Book a Free 15-Minute Discovery Call](${BOOKING_LINK})

No obligation. No sales pitch. Just 15 focused minutes to understand your goals and show you exactly how we'd approach your project.

Need to discuss your project first? [Contact Futurise Solutions](${BASE_URL}/contact)

Or visit our [Homepage](${BASE_URL}/) to explore our complete range of services.`;

module.exports = {
  BASE_URL,
  API_BASE,
  COUNTRIES,
  SERVICES,
  INTERNAL_LINKS,
  CTA_BLOCK,
  BOOKING_LINK,
  BLOGS_API: `${API_BASE}/api/blogs`,
  UPLOAD_API: `${API_BASE}/api/upload`,
  BLOG_STATUS: process.env.BLOG_AUTO_STATUS || "published",
  YEAR: new Date().getFullYear(),
};
