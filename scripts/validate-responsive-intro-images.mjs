import { existsSync, readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const css = readFileSync("styles.css", "utf8");

function pngSize(path) {
  if (!existsSync(path)) return null;
  const bytes = readFileSync(path);
  if (bytes.length < 24 || bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const images = {
  360: pngSize("img/intro-section-360.png"),
  480: pngSize("img/intro-section-480.png"),
  640: pngSize("img/intro-section-640.png"),
};

const intro = html.match(/<section\b[^>]*id=["']intro-section["'][^>]*>[\s\S]*?<\/section>/i)?.[0] ?? "";
const expectedSources = [
  /<source\b(?=[^>]*media=["']\(max-width:\s*419px\)["'])(?=[^>]*srcset=["']img\/intro-section-360\.png["'])[^>]*>/i,
  /<source\b(?=[^>]*media=["']\(max-width:\s*559px\)["'])(?=[^>]*srcset=["']img\/intro-section-480\.png["'])[^>]*>/i,
  /<img\b(?=[^>]*class=["'][^"']*intro-section-image)(?=[^>]*src=["']img\/intro-section-640\.png["'])[^>]*>/i,
];

function pictureMarkup() {
  if (Object.values(images).some((size) => !size)) throw new Error("Render all three intro PNGs first.");
  return `<section id="intro-section" aria-label="호연회계법인 윤성중 부대표 개업 초대 인사말">
  <picture>
    <source media="(max-width: 419px)" srcset="img/intro-section-360.png" width="720" height="${images[360].height}">
    <source media="(max-width: 559px)" srcset="img/intro-section-480.png" width="960" height="${images[480].height}">
    <img class="intro-section-image" src="img/intro-section-640.png" width="1280" height="${images[640].height}" alt="호연회계법인 윤성중 부대표의 2026년 8월 26일 개업 초대 인사말" fetchpriority="high" decoding="async">
  </picture>
</section>`;
}

if (process.argv.includes("--print-markup")) {
  console.log(pictureMarkup());
  process.exit(0);
}

const checks = [
  ["has all three valid PNG assets", Object.values(images).every(Boolean)],
  ["uses 2x raster widths", images[360]?.width === 720 && images[480]?.width === 960 && images[640]?.width === 1280],
  ["uses portrait intro images", Object.values(images).every((size) => size && size.height > size.width)],
  ["maps the three picture sources", expectedSources.every((pattern) => pattern.test(intro))],
  ["records matching intrinsic dimensions", Object.entries(images).every(([designWidth, size]) => {
    if (!size) return false;
    const tag = designWidth === "640"
      ? intro.match(/<img\b[^>]*class=["'][^"']*intro-section-image[^>]*>/i)?.[0] ?? ""
      : intro.match(new RegExp(`<source\\b(?=[^>]*intro-section-${designWidth}\\.png)[^>]*>`, "i"))?.[0] ?? "";
    return new RegExp(`\\bwidth=["']${size.width}["']`, "i").test(tag) && new RegExp(`\\bheight=["']${size.height}["']`, "i").test(tag);
  })],
  ["keeps one responsive picture in intro", (intro.match(/<picture\b/gi) ?? []).length === 1],
  ["removes live intro children", !/(invitation-message|invitation-title|event-details|brand-logo)/i.test(intro)],
  ["labels the image purpose", /aria-label=["']호연회계법인 윤성중 부대표 개업 초대 인사말["']/i.test(intro)],
  ["provides concise image alt text", /alt=["']호연회계법인 윤성중 부대표의 2026년 8월 26일 개업 초대 인사말["']/i.test(intro)],
  ["prioritizes the intro image", /fetchpriority=["']high["']/i.test(intro) && /decoding=["']async["']/i.test(intro) && !/loading=["']lazy["']/i.test(intro)],
  ["sizes the responsive image", /\.intro-section-image\s*\{[^}]*width\s*:\s*100%[^}]*height\s*:\s*auto/i.test(css)],
  ["removes obsolete intro pseudo-elements", !/#intro-section::(?:before|after)/i.test(css)],
  ["retains downstream invitation sections", /class=["'][^"']*profile-section/.test(html) && /class=["'][^"']*directions/.test(html) && /class=["'][^"']*account-section/.test(html)],
  ["retains account copy behavior", html.includes("writeText('04908774202501')")],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}
process.exit(failed ? 1 : 0);
