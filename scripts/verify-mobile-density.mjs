import { readFileSync } from "node:fs";

const css = readFileSync(process.argv[2] ?? "styles.css", "utf8");
const mobileBlock = css.match(/@media\s*\(max-width:\s*639px\)\s*\{([\s\S]*)\}\s*$/);

const checks = [
  ["defines a below-640px override block", mobileBlock !== null],
  ["reduces invitation text by exactly 1.5px", /\.invitation-message\s*\{[^}]*font-size:\s*calc\(1rem\s*\+\s*\.5px\)/.test(mobileBlock?.[1] ?? "")],
  ["reduces career-list text by exactly 1.5px", /\.career-list\s*\{[^}]*font-size:\s*calc\(\.9375rem\s*\+\s*\.5px\)/.test(mobileBlock?.[1] ?? "")],
  ["compacts the account card padding", /\.account-card\s*\{[^}]*padding:\s*14px\s+16px/.test(mobileBlock?.[1] ?? "")],
  ["reduces the copy button height", /#copy-account-number\s*\{[^}]*min-height:\s*36px/.test(mobileBlock?.[1] ?? "")],
  ["hides empty copy feedback", /#copy-status:empty\s*\{[^}]*display:\s*none/.test(mobileBlock?.[1] ?? "")],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}

process.exit(failed ? 1 : 0);
