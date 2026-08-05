import { readFileSync } from "node:fs";

const html = readFileSync(process.argv[2] ?? "index.html", "utf8");
const css = readFileSync(process.argv[3] ?? "styles.css", "utf8");
const mobileBlock = css.match(/@media\s*\(max-width:\s*639px\)\s*\{([\s\S]*)\}\s*$/);
const accountCard = html.match(/<div\s+class=["']account-card["'][^>]*>([\s\S]*?)<\/div>\s*<\/section>/i)?.[1] ?? "";
const parkingNotice = html.match(/<div\s+class=["']parking-notice["'][^>]*>([\s\S]*?)<\/div>\s*<\/section>/i)?.[1] ?? "";

const checks = [
  ["defines a below-640px override block", mobileBlock !== null],
  ["allocates more width to career content at desktop sizes", /\.profile-grid\s*\{[^}]*grid-template-columns:\s*minmax\(120px,\s*\.75fr\)\s+minmax\(0,\s*1\.45fr\)/.test(css)],
  ["fits account guidance within mobile cards", /\.account-message\s*\{[^}]*font-size:\s*9\.5pt/.test(mobileBlock?.[1] ?? "")],
  ["increases career-list text by one point", /\.career-list\s*\{[^}]*font-size:\s*calc\(\.9375rem\s*\+\s*1pt\)/.test(mobileBlock?.[1] ?? "")],
  [
    "uses semantic account guidance line breaks",
    /<span\s+class=["']account-message-line account-message-phrase["']>따듯한 축하의 마음만으로도 충분히 감사드립니다\.<\/span>\s*<span\s+class=["']account-message-line["']><span\s+class=["']account-message-phrase["']>문의하시는 분들을 위해 계좌를 안내드리오니<\/span>\s+<span\s+class=["']account-message-phrase["']>부담은 갖지 않으셔도 됩니다\.<\/span><\/span>/.test(accountCard) &&
      !/<br\b/i.test(accountCard),
  ],
  ["shows account information in one paragraph", /<p\s+class=["']account-info["']>우리은행 \/ 049-087742-02-501 \/ 윤성중<\/p>/.test(accountCard) && !/<dl\b/i.test(accountCard)],
  ["removes copy feedback markup and styling", !/copy-status/.test(html) && !/copy-status/.test(css)],
  ["removes the parking notice heading", !/<h3\b/i.test(parkingNotice)],
  ["compacts the account card padding", /\.account-card\s*\{[^}]*padding:\s*12px\s+8px\s+6px/.test(mobileBlock?.[1] ?? "")],
  [
    "keeps mobile account width stable through 639px",
    /\.account-section\s*\{[^}]*padding-right:\s*24px;[^}]*padding-left:\s*24px/.test(mobileBlock?.[1] ?? "") &&
      /\.account-section::before\s*\{[^}]*right:\s*24px;[^}]*left:\s*24px/.test(mobileBlock?.[1] ?? ""),
  ],
  ["fits account guidance below 360px", /@media\s*\(max-width:\s*359px\)\s*\{[\s\S]*?\.account-message\s*\{[^}]*font-size:\s*8\.5pt/.test(css)],
  ["reduces the copy button height", /#copy-account-number\s*\{[^}]*min-height:\s*36px/.test(mobileBlock?.[1] ?? "")],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}

process.exit(failed ? 1 : 0);
