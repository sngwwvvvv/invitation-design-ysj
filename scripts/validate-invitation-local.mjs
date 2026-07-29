import { readFileSync } from "node:fs";

const [htmlPath, cssPath] = process.argv.slice(2);
if (!htmlPath || !cssPath) {
  console.error("Usage: node scripts/validate-invitation-local.mjs index.html styles.css");
  process.exit(2);
}

const html = readFileSync(htmlPath, "utf8");
const css = readFileSync(cssPath, "utf8");
const all = `${html}\n${css}`;
const approvedCareerEntries = [
  "국세청 근무경력 30년",
  "전 서울지방국세청 조사4국 조사팀장",
  "전 서울지방국세청 국제거래조사국 조사팀장",
  "전 성동세무서 법인세과장",
  "전 동고양세무서 납세자보호담당관",
  "전 서울지방국세청 송무국 상증팀장",
  "전 서울지방국세청 조사1국 조사팀",
  "전 서울지방국세청 조사2국 조사팀",
  "전 서초세무서 조사과 조사팀장",
  "전 강동세무서 재산세과 재산팀장",
];
const careerEntries = [...html.matchAll(/<ul\b[^>]*class=["']career-list["'][^>]*>([\s\S]*?)<\/ul>/gi)]
  .flatMap(([, list]) => [...list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)])
  .map(([, entry]) => entry.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());

const checks = [
  ["Korean document language", /<html[^>]+lang=["']ko["']/i.test(html)],
  ["stylesheet link", /<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["']styles\.css["'])[^>]*>/i.test(html)],
  ["invitation has one primary heading", /<h1\b[^>]*id=["']invitation-title["'][^>]*>[\s\S]*?<\/h1>/i.test(html)],
  ["current supplied assets", ["hoyeon_logo_horizontal.png", "reflection_background.png", "portrait_ysj.png", "map_capture_resized.png", "Seoul_Metro_Line_2.svg.webp"].every((asset) => all.includes(asset))],
  ["approved palette", ["#F0F4F8", "#0A2D54", "#0063A6", "#43A64E", "#64748B"].every((color) => css.includes(color))],
  ["fixed invitation shell", /\.invitation-shell\s*\{[\s\S]*?max-width\s*:\s*640px/i.test(css)],
  ["no canvas scale", !/\btransform\s*:[^;{}]*\bscale\s*\(|\bzoom\s*:/i.test(css)],
  ["no forbidden dependencies", !/(iframe|maps\.js|tailwind|bootstrap|react|vue|angular|fonts\.googleapis)/i.test(all)],
  ["direct account information", /<dl>[\s\S]*?<dt>은행<\/dt><dd>우리은행<\/dd>[\s\S]*?<dt>계좌번호<\/dt><dd>049-087742-02-501<\/dd>[\s\S]*?<dt>예금주<\/dt><dd>윤성중<\/dd>[\s\S]*?<\/dl>/i.test(html)],
  ["copy contract", /id=["']copy-account-number["']/.test(html) && /aria-live=["']polite["']/.test(html) && html.includes("writeText('04908774202501')")],
  ["career profile retained", /class=["']portrait["']/.test(html) && careerEntries.length === approvedCareerEntries.length && careerEntries.every((entry, index) => entry === approvedCareerEntries[index])],
  ["compact visual type scale", /font-family\s*:[^;]*(Pretendard|Noto Sans KR)/i.test(css) && /h1\s*\{[\s\S]*?font-size\s*:\s*clamp\(1\.5rem,\s*5vw,\s*2rem\)/i.test(css)],
  ["event information is one capsule", /class=["'][^"']*event-pill/.test(html) && /\.event-pill\s*\{[\s\S]*?border-radius\s*:\s*999px/i.test(css)],
  ["profile uses a named section band", /class=["'][^"']*profile-heading/.test(html) && /\.profile-heading\s*\{/i.test(css)],
  ["directions use a slate panel", /\.directions\s*\{[\s\S]*?background\s*:\s*var\(--slate\)/i.test(css) && /\.directions\s+h2\s*\{[\s\S]*?color\s*:\s*(?:var\(--platinum\)|#fff)/i.test(css)],
  ["valid event-details nesting", !/<p>[^<]*<span[^>]*>[^<]*<\/span><strong>[\s\S]*?<\/p><\/strong>/i.test(html)],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}

process.exit(failed ? 1 : 0);
