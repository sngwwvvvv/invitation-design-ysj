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
const text = html
  .replace(/<br\b[^>]*>/gi, " ")
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const approvedColors = ["#0A2D54", "#0063A6", "#43A64E", "#F0F4F8", "#64748B"];
const oldPalette = ["#142755", "#A9AABC", "#35B84A", "#F6F4EF"];
const introIndex = html.indexOf('id="intro-section"');
const eventIndex = html.indexOf('id="event-details"');
const invitationHtmlIndex = html.indexOf("[초청 인사말이 이곳에 들어갑니다]");
const accountCardIndex = html.indexOf('id="account-card"');
const accountDividerIndex = html.indexOf('id="account-divider"');
const copyButtonIndex = html.indexOf('id="copy-account-number"');
const accountNotice = "축하의 마음을 전하고자 하시는 분들을 위해 계좌 정보를 조심스럽게 안내드립니다.";

const checks = [
  ["keeps the approved main heading", text.includes("호연회계법인에서의 새로운 출발을 알려드립니다")],
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
  ["removes the date and place label", !text.includes("[일시 및 장소]")],
  ["uses a dedicated event details block", /id=["']event-details["']/.test(html)],
  [
    "declares a 640px canonical scaled shell",
    /id=["']invitation-scale-frame["']/.test(html) &&
      /id=["']invitation-canvas["']/.test(html) &&
      /\.invitation-canvas\s*\{[\s\S]*?width\s*:\s*640px/i.test(html) &&
      /transform-origin\s*:\s*top\s+left/i.test(html) &&
      /syncInvitationScale/.test(html) &&
      /Math\.min\s*\(\s*1\s*,\s*window\.innerWidth\s*\/\s*640\s*\)/.test(html) &&
      /ResizeObserver\s*\(\s*syncInvitationScale\s*\)/.test(html),
  ],
  [
    "orders event details before the invitation message",
    introIndex >= 0 && eventIndex > introIndex && invitationHtmlIndex > eventIndex,
  ],
  [
    "keeps the intro background inside the scaled intro section",
    introIndex >= 0 &&
      /id=["']intro-section["'][\s\S]{0,1800}(?:intro-bg|reflection_background)/i.test(html),
  ],
  ["removes the celebration heading", !text.includes("축하의 말씀")],
  [
    "shows the chosen account copy message",
    text.includes("축하의 마음을 전하고자 하시는 분들을 위해 계좌 정보를 조심스럽게 안내드립니다."),
  ],
  [
    "shows the inline account information",
    ["우리은행", "049-087742-02-501", "윤성중"].every((value) => text.includes(value)),
  ],
  ["removes modal behavior", !/(account-modal|openModal|closeModal|modal-backdrop)/i.test(html)],
  [
    "places the notice and divider inside the account card",
    accountCardIndex > -1 &&
      text.includes(accountNotice) &&
      accountDividerIndex > accountCardIndex &&
      copyButtonIndex > accountDividerIndex,
  ],
  [
    "shows exact account labels and values",
    ["은행", "우리은행", "계좌번호", "049-087742-02-501", "예금주", "윤성중"].every((value) =>
      text.includes(value),
    ),
  ],
  [
    "exposes the account copy button",
    /id=["']copy-account-number["']/.test(html) && text.includes("계좌정보 복사"),
  ],
  [
    "copies only the digits-only account number",
    html.includes("navigator.clipboard.writeText('04908774202501')"),
  ],
  [
    "provides copy success and failure feedback",
    text.includes("계좌번호가 복사되었습니다.") &&
      text.includes("계좌번호를 길게 눌러 복사해 주세요.") &&
      /aria-live=["']polite["']/.test(html),
  ],
  [
    "preserves map and profile content",
    [
      "윤성중 부대표",
      "국세청 근무경력 30년",
      "2호선 삼성역 5번출구에서 도보 약 10분",
      "네이버 지도에서 확인하기",
      "[주차 안내가 확정되면 이곳에 표시됩니다]",
    ].every((value) => text.includes(value)) && html.includes("map_capture"),
  ],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}

process.exit(failed ? 1 : 0);
