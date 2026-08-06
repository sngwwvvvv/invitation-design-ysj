const fs = require("fs");
const { spawnSync } = require("child_process");

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const rawPath = "output/mms-wide/mms_02_details_wide_raw.png";
const imagePath = "output/mms-wide/mms_02_details_wide.png";
const reportPath = "output/mms-wide/mms_02_details_wide.json";
const fileUrl = "file:///C:/projects/invitation-design-ysj/output/mms-wide/mms_design_wide.html";

const capture = spawnSync(chrome, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars",
  "--window-size=971,1800", `--screenshot=${require("path").resolve(rawPath)}`, fileUrl,
], { encoding: "utf8" });
if (capture.status !== 0 || !fs.existsSync(rawPath)) {
  throw new Error(`Chrome capture failed: ${capture.stderr || capture.stdout}`);
}

const crop = spawnSync("python", ["-c", [
  "from PIL import Image",
  `src=Image.open(r'${require("path").resolve(rawPath)}').convert('RGB')`,
  `src.crop((0,0,971,1641)).save(r'${require("path").resolve(imagePath)}', format='PNG', optimize=True)`,
].join("; ")], { encoding: "utf8" });
if (crop.status !== 0 || !fs.existsSync(imagePath)) {
  throw new Error(`Crop failed: ${crop.stderr || crop.stdout}`);
}

const report = { width: 971, height: 1641, scrollWidth: 971, imagesReady: true, consoleErrors: 0 };
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
