import { execFileSync } from "node:child_process";

const draftId = process.argv[2];

if (!draftId) {
  console.error("Usage: node scripts/validate-invitation-draft.mjs [draft-id]");
  process.exit(2);
}

const raw = execFileSync(
  "npx",
  ["--yes", "@superdesign/cli@latest", "get-design", "--draft-id", draftId, "--json"],
  { encoding: "utf8", shell: true, stdio: ["ignore", "pipe", "inherit"] },
);

const parsed = JSON.parse(raw);
const html = String(parsed.htmlContent ?? "");
const upperHtml = html.toUpperCase();

const approvedColors = ["#0A2D54", "#0063A6", "#43A64E", "#F0F4F8", "#64748B"];
const oldPalette = ["#142755", "#A9AABC", "#35B84A", "#F6F4EF"];

const checks = [
  ["keeps the approved main heading", html.includes("?몄뿰?뚭퀎踰뺤씤?먯꽌???덈줈??異쒕컻???뚮젮?쒕┰?덈떎")],
  ["declares the five approved colors", approvedColors.every((color) => upperHtml.includes(color))],
  ["removes the former palette", !oldPalette.some((color) => upperHtml.includes(color))],
  ["uses one unified intro section", /id=["']intro-section["']/.test(html)],
  [
    "uses the reflection background at 40 percent opacity",
    html.includes("reflection_background.png") && /opacity\s*:\s*0\.4\b/i.test(html),
  ],
  [
    "uses the horizontal logo without image filters",
    html.includes("hoyeon_logo_horizontal.png") &&
      !/hoyeon_logo_horizontal[^>]{0,500}(?:filter|brightness|invert|grayscale|contrast)/i.test(html),
  ],
  ["removes the date and place label", !html.includes("[?쇱떆 諛??μ냼]")],
  ["uses a dedicated event details block", /id=["']event-details["']/.test(html)],
  ["removes the celebration heading", !html.includes("異뺥븯??留먯?")],
  [
    "shows the chosen account copy message",
    html.includes("異뺥븯??留덉쓬???꾪븯怨좎옄 ?섏떆??遺꾨뱾???꾪빐 怨꾩쥖 ?뺣낫瑜?議곗떖?ㅻ읇寃??덈궡?쒕┰?덈떎."),
  ],
  [
    "shows the inline account information",
    ["?곕━???", "049-087742-02-501", "?ㅼ꽦以?"].every((value) => html.includes(value)),
  ],
  ["removes modal behavior", !/(account-modal|openModal|closeModal|modal-backdrop)/i.test(html)],
  [
    "exposes the account copy button",
    /id=["']copy-account-number["']/.test(html) && html.includes("怨꾩쥖?뺣낫 蹂듭궗"),
  ],
  [
    "copies only the digits-only account number",
    /(?:writeText|clipboard)[\s\S]{0,240}04908774202501/.test(html),
  ],
  [
    "provides copy success and failure feedback",
    html.includes("怨꾩쥖踰덊샇媛 蹂듭궗?섏뿀?듬땲??") &&
      html.includes("怨꾩쥖踰덊샇瑜?湲멸쾶 ?뚮윭 蹂듭궗??二쇱꽭??") &&
      /aria-live=["']polite["']/.test(html),
  ],
  [
    "preserves map and profile content",
    [
      "?ㅼ꽦以?遺???",
      "援?꽭泥?洹쇰Т寃쎈젰 30??",
      "map_capture",
      "2?몄꽑 ?쇱꽦??5踰덉텧援ъ뿉???꾨낫 ??10遺?",
      "?ㅼ씠踰?吏?꾩뿉???뺤씤?섍린",
      "[二쇱감 ?덈궡媛 ?뺤젙?섎㈃ ?닿납???쒖떆?⑸땲??]",
    ].every((value) => html.includes(value)),
  ],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}

process.exit(failed ? 1 : 0);
