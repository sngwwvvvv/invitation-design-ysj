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
  "전 서울지방국세청 송무국 상송팀장",
  "전 서울지방국세청 조사1국 조사팀",
  "전 서울지방국세청 조사2국 조사팀",
  "전 서초세무서 조사과 조사팀장",
  "전 강동세무서 재산세과 재산팀장",
];
const careerList = html.match(/<ul\b(?=[^>]*\bclass=["'](?:[^\s"']+\s+)*career-list(?:\s+[^\s"']+)*["'])[^>]*>([\s\S]*?)<\/ul>/i)?.[1];
const careerEntries = careerList
  ? [...careerList.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(([, entry]) => entry.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
  : [];
const hasApprovedCareerSequence =
  careerEntries.length === approvedCareerEntries.length && careerEntries.every((entry, index) => entry === approvedCareerEntries[index]);
const checks = [
  ["Korean document language", /<html[^>]+lang=["']ko["']/i.test(html)],
  ["stylesheet link", /<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["']styles\.css["'])[^>]*>/i.test(html)],
  ["approved heading", html.includes("호연회계법인에서의 새로운 출발을 알려드립니다")],
  ["intro and event IDs", /id=["']intro-section["']/.test(html) && /id=["']event-details["']/.test(html)],
  ["five supplied assets", ["hoyeon_logo_horizontal.png", "reflection_background.png", "portrait_ysj.png", "map_capture.png", "Seoul_Metro_Line_2.svg.webp"].every((asset) => all.includes(asset))],
  ["approved palette", ["#F0F4F8", "#0A2D54", "#0063A6", "#43A64E", "#64748B"].every((color) => css.includes(color))],
  ["mobile-first shell", /width\s*:\s*100%/.test(css) && /max-width\s*:\s*640px/.test(css)],
  ["no canvas scale", !/\btransform\s*:[^;{}]*\bscale\s*\(|\bzoom\s*:/i.test(css)],
  ["no forbidden dependencies", !/(iframe|maps\.js|tailwind|bootstrap|react|vue|angular|fonts\.googleapis)/i.test(all)],
  ["inline account details", ["우리은행", "049-087742-02-501", "윤성중"].every((value) => html.includes(value))],
  ["copy contract", /id=["']copy-account-number["']/.test(html) && /aria-live=["']polite["']/.test(html) && html.includes("writeText('04908774202501')")],
  ["copy feedback", html.includes("계좌번호가 복사되었습니다.") && html.includes("계좌번호를 길게 눌러 복사해 주세요.")],
  ["approved career sequence", hasApprovedCareerSequence],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}

process.exit(failed ? 1 : 0);
