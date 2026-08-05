import { existsSync, readFileSync } from "node:fs";

const path = "mms_design.html";
const html = existsSync(path) ? readFileSync(path, "utf8") : "";
const checks = [
  ["creates the MMS document", html.length > 0],
  ["marks the document as MMS-only", /<body\b[^>]*class=["'][^"']*\bmms-design\b/i.test(html)],
  ["keeps the intro section", /<section\b[^>]*id=["']intro-section["']/i.test(html)],
  ["keeps the profile section", /class=["'][^"']*\bprofile-section\b/i.test(html)],
  ["keeps the directions section", /class=["'][^"']*\bdirections\b/i.test(html)],
  ["keeps the account section", /class=["'][^"']*\baccount-section\b/i.test(html)],
  ["removes the Naver Map control", !/class=["'][^"']*\bmap-link\b/i.test(html)],
  ["removes the account-copy control", !/id=["']copy-account-number["']/i.test(html)],
  ["removes clipboard behavior", !/navigator\.clipboard|writeText\s*\(/i.test(html)],
  ["does not add a control placeholder", !/mms-(?:spacer|placeholder)|data-(?:spacer|placeholder)/i.test(html)],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}
process.exit(failed ? 1 : 0);
