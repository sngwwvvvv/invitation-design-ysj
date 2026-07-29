import { readFileSync } from "node:fs";

const [htmlPath, cssPath] = process.argv.slice(2);
if (!htmlPath || !cssPath) {
  console.error("Usage: node scripts/validate-invitation-local.mjs index.html styles.css");
  process.exit(2);
}

const html = readFileSync(htmlPath, "utf8");
const css = readFileSync(cssPath, "utf8");
const all = `${html}\n${css}`;
const checks = [
  ["Korean document language", /<html[^>]+lang=["']ko["']/i.test(html)],
  ["stylesheet link", /href=["']styles\.css["']/i.test(html)],
  ["approved heading", html.includes("호연회계법인에서의 새로운 출발을 알려드립니다")],
  ["intro and event IDs", /id=["']intro-section["']/.test(html) && /id=["']event-details["']/.test(html)],
  ["five supplied assets", ["hoyeon_logo_horizontal.png", "reflection_background.png", "portrait_ysj.png", "map_capture.png", "Seoul_Metro_Line_2.svg.webp"].every((asset) => all.includes(asset))],
  ["approved palette", ["#F0F4F8", "#0A2D54", "#0063A6", "#43A64E", "#64748B"].every((color) => css.includes(color))],
  ["mobile-first shell", /width\s*:\s*100%/.test(css) && /max-width\s*:\s*640px/.test(css)],
  ["no canvas scale", !/transform\s*:\s*scale|\bzoom\s*:/.test(css)],
  ["no forbidden dependencies", !/(iframe|maps\.js|tailwind|bootstrap|react|vue|angular|fonts\.googleapis)/i.test(all)],
  ["inline account details", ["우리은행", "049-087742-02-501", "윤성중"].every((value) => html.includes(value))],
  ["copy contract", /id=["']copy-account-number["']/.test(html) && /aria-live=["']polite["']/.test(html) && html.includes("writeText('04908774202501')")],
  ["copy feedback", html.includes("계좌번호가 복사되었습니다.") && html.includes("계좌번호를 길게 눌러 복사해 주세요.")],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}

process.exit(failed ? 1 : 0);
