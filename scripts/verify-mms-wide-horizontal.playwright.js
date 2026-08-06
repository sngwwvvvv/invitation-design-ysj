const fs = require("fs");
const path = require("path");

const reportPath = path.resolve("output/mms-wide/mms_02_details_wide.json");
if (!fs.existsSync(reportPath)) {
  throw new Error(`Missing renderer report: ${reportPath}`);
}

const result = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const passed = result.width === 971
  && result.height === 1641
  && result.scrollWidth === 971
  && result.imagesReady === true
  && result.consoleErrors === 0;

console.log(`${passed ? "PASS" : "FAIL"} wide MMS details ${JSON.stringify(result)}`);
if (!passed) throw new Error("Wide MMS details contract failed.");
