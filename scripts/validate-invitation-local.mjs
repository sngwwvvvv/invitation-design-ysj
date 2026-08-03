import { readFileSync } from "node:fs";

const [htmlPath, cssPath] = process.argv.slice(2);
if (!htmlPath || !cssPath) {
  console.error("Usage: node scripts/validate-invitation-local.mjs index.html styles.css");
  process.exit(2);
}

const html = readFileSync(htmlPath, "utf8");
const css = readFileSync(cssPath, "utf8");
const all = `${html}\n${css}`;
const parkingSearchUrl = "https://map.naver.com/p/search/%EC%B9%B4%EC%9D%B4%EB%A7%88%EB%B9%8C%EB%94%A9%EC%A3%BC%EB%B3%80%EB%AF%BC%EC%98%81%EC%A3%BC%EC%B0%A8%EC%9E%A5";
const externalLinkTags = [...html.matchAll(/<a\b[^>]*>/gi)]
  .map(([tag]) => tag)
  .filter((tag) => /\bhref=["']https:\/\//i.test(tag));
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
  ["invitation message has a semantic id", /id=["']invitation-message["']/i.test(html)],
  ["removes invitation placeholder", !html.includes("[초청 인사말이 이곳에 들어갑니다]")],
  [
    "includes the approved invitation copy",
    [
      "안녕하세요.",
      "오랜 공직생활을 마치고",
      "호연회계법인에서 세무사로 새로운 출발을 하게 되었습니다.",
      "납세자에게 진정으로 도움이 되는 사람으로 하루하루 살아가려 합니다.",
      "2026년 8월",
      "호연회계법인 부대표",
      "세무사 윤성중 드림",
    ].every((value) => html.includes(value)),
  ],
  ["uses paragraph spacing instead of forced invitation line breaks", (html.match(/class=["']invitation-copy["'][\s\S]*?<\/div>/i)?.[0].match(/<br\b/gi) ?? []).length === 0],
  ["aligns invitation copy to the left", /\.invitation-copy\s*\{[^}]*text-align\s*:\s*left/i.test(css)],
  ["aligns invitation signature to the right", /\.invitation-signature\s*\{[^}]*text-align\s*:\s*right/i.test(css)],
  ["emphasizes invitation typography", /\.invitation-message\s*\{[^}]*font-weight\s*:\s*(?:600|700|bold)/i.test(css) && /\.invitation-message\s*\{[^}]*color\s*:/i.test(css)],
  ["removes invitation panel chrome", /\.invitation-message\s*\{[^}]*background\s*:\s*transparent/i.test(css) && /\.invitation-message\s*\{[^}]*border\s*:\s*0/i.test(css) && /\.invitation-message\s*\{[^}]*box-shadow\s*:\s*none/i.test(css)],
  ["lightens the intro background overlay", /#intro-section::before\s*\{[\s\S]*?rgba\(240, 244, 248, \.82\)/i.test(css)],
  ["brightens the intro background image", /#intro-section::before\s*\{[\s\S]*?filter\s*:\s*brightness\(1\.12\)\s+saturate\(\.78\)/i.test(css)],
  ["reduces account guidance text by one point", /\.account-message\s*\{[^}]*font-size\s*:\s*calc\(1\.1rem\s*\+\s*1px\)/i.test(css)],
  ["reduces account row text by one point", /\.account-card dl\s*\{[^}]*font-size\s*:\s*14px/i.test(css)],
  ["reduces account number emphasis by one point", /\.account-card dl > div:nth-child\(2\) dd\s*\{[^}]*font-size\s*:\s*calc\(1\.15rem\s*\+\s*1px\)/i.test(css)],
  ["Korean document language", /<html[^>]+lang=["']ko["']/i.test(html)],
  ["stylesheet link", /<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["']styles\.css["'])[^>]*>/i.test(html)],
  ["invitation has one primary heading", /<h1\b[^>]*id=["']invitation-title["'][^>]*>[\s\S]*?<\/h1>/i.test(html)],
  ["current supplied assets", ["hoyeon_logo_horizontal.png", "reflection_background.png", "portrait_ysj.png", "map_capture.png", "Seoul_Metro_Line_2.svg.webp"].every((asset) => all.includes(asset))],
  ["original map capture selected", /<img\b(?=[^>]*\bclass=["'][^"']*\bmap-image\b[^"']*["'])(?=[^>]*\bsrc=["']img\/map_capture\.png["'])[^>]*>/i.test(html) && !html.includes("map_capture_resized.png")],
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
  ["directions and account use platinum panels", /\.directions\s*\{[^}]*\bbackground\s*:\s*var\(--platinum\)/i.test(css) && /\.directions\s*\{[^}]*\bcolor\s*:\s*var\(--navy\)/i.test(css) && /\.directions\s+h2\s*\{[^}]*\bcolor\s*:\s*var\(--navy\)/i.test(css) && /\.account-section\s*\{[^}]*\bbackground\s*:\s*var\(--platinum\)/i.test(css) && /\.account-section\s*\{[^}]*\bcolor\s*:\s*var\(--navy\)/i.test(css) && /\.account-card\s*\{[^}]*\bbackground\s*:\s*var\(--platinum\)/i.test(css) && /\.map-link\s*\{[^}]*\bbackground\s*:\s*var\(--green\)/i.test(css) && /\.parking-notice\s*\{[^}]*\bbackground\s*:\s*var\(--navy\)/i.test(css) && /#copy-account-number\s*\{[^}]*\bbackground\s*:\s*var\(--navy\)/i.test(css)],
  [
    "static parking notice copy",
    html.includes("주차 안내") &&
      html.includes("본 건물에는 주차가 불가합니다.") &&
      html.includes("아래 인근 유료주차장을 이용해 주세요.") &&
      html.includes("※ 요금은 주차장 사정에 따라 변동될 수 있습니다.") &&
      !html.includes("[주차 안내가 확정되면 이곳에 표시됩니다]") &&
      !html.includes("인근 주차장 확인하기"),
  ],
  [
    "static parking names and rates",
    [
      ["투루파킹 삼성동빌딩점 주차장", "5,000원"],
      ["투루파킹 삼성역WeWork 주차장", "6,000원"],
      ["투루파킹 LG트윈텔2점 주차장", "6,000원"],
    ].every(([name, rate]) => html.includes(name) && html.includes(rate)) &&
      /class=["'][^"']*\bparking-list\b[^"']*["']/i.test(html),
  ],
  [
    "secure venue map link only",
    externalLinkTags.length === 1 &&
      externalLinkTags.every((tag) => /\btarget=["']_blank["']/i.test(tag) && /\brel=["']noopener["']/i.test(tag)) &&
      !html.includes(parkingSearchUrl),
  ],
  [
    "accessible static parking list styling",
    /\.map-link\s*,\s*#copy-account-number\s*\{[^}]*\bmin-height\s*:\s*44px/i.test(css) &&
      /\.parking-list\s*\{[^}]*\bmargin\s*:/i.test(css) &&
      /\.parking-list\s+dd\s*\{[^}]*\bwhite-space\s*:\s*nowrap/i.test(css),
  ],
  [
    "left aligned parking copy",
    /\.parking-warning\s*,\s*\.parking-detail\s*\{[^}]*\btext-align\s*:\s*left/i.test(css),
  ],
  [
    "white parking notice label",
    /\.parking-notice\s+h3\s*\{[^}]*\bbackground\s*:\s*var\(--platinum\)[^}]*\bcolor\s*:\s*var\(--navy\)/i.test(css),
  ],
  ["valid event-details nesting", !/<p>[^<]*<span[^>]*>[^<]*<\/span><strong>[\s\S]*?<\/p><\/strong>/i.test(html)],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}

process.exit(failed ? 1 : 0);
