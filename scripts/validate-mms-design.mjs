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

const introStage = existsSync("scripts/intro-section-stage.html")
  ? readFileSync("scripts/intro-section-stage.html", "utf8")
  : "";
checks.push(
  ["supports the 1080 intro stage", /\[360,\s*480,\s*640,\s*1080\]\.includes\(requestedWidth\)/.test(introStage)],
  ["sets the SENS intro canvas", /#intro-stage\[data-width=["']1080["']\][^{]*\{[^}]*width:\s*1080px;[^}]*height:\s*1440px;/s.test(introStage)],
  ["sets the SENS details canvas", /#mms-details\s*\{[^}]*height:\s*1440px;/s.test(html)],
  ["uses exact details tracks", /grid-template-rows:\s*456px\s+814px\s+170px/.test(html)],
);

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}
process.exit(failed ? 1 : 0);
