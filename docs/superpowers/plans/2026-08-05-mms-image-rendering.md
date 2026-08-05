# MMS Invitation Image Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `mms_design.html` from the current invitation and replace the two MMS image pairs with 640-pixel-wide, natural-height captures that contain no Naver Map or account-copy controls and no gaps reserved for them.

**Architecture:** Keep the public `index.html` unchanged and make MMS-only markup and spacing adjustments in `mms_design.html`. Validate the static page contract with Node, validate computed layout and output geometry in a real browser, and use a Playwright CLI `run-code` renderer to capture the intro and detail regions as matching PNG/JPEG pairs.

**Tech Stack:** HTML/CSS, Node.js ES modules, Playwright CLI with Microsoft Edge/Chromium, PowerShell, Python static HTTP server

## Global Constraints

- Render at exactly 640 CSS pixels wide.
- Let each image height follow its reflowed content; do not force 1440 pixels.
- Replace `mms_img/mms_01_intro.{png,jpg}` and `mms_img/mms_02_details.{png,jpg}`.
- Do not modify `index.html`.
- Remove the Naver Map link, account-number copy button, and clipboard script from `mms_design.html`.
- Do not hide controls or replace their height with padding, margin, minimum height, empty markup, or another spacer.
- Keep unrelated workspace changes out of every commit.

---

## File structure

- Create `mms_design.html`: MMS-only copy of the current invitation.
- Create `scripts/validate-mms-design.mjs`: static contract check for preserved sections and removed interactive controls.
- Create `scripts/verify-mms-layout.playwright.js`: browser contract for zero control-slot gaps, 640-pixel geometry, and valid capture bounds.
- Create `scripts/render-mms-images.playwright.js`: browser renderer for the four output files.
- Create `scripts/verify-mms-output.playwright.js`: browser comparison of output pixel dimensions against the live capture bounds.
- Replace `mms_img/mms_01_intro.png`, `mms_img/mms_01_intro.jpg`, `mms_img/mms_02_details.png`, and `mms_img/mms_02_details.jpg`: final MMS artifacts.

### Task 1: MMS-only document contract

**Files:**
- Create: `scripts/validate-mms-design.mjs`
- Create: `mms_design.html`

**Interfaces:**
- Consumes: current `index.html`, `styles.css`, and existing `img/` assets.
- Produces: a complete `mms_design.html` with `body.mms-design`, all four invitation sections, no `.map-link`, no `#copy-account-number`, and no clipboard script.

- [ ] **Step 1: Write the failing document validator**

Create `scripts/validate-mms-design.mjs`:

```js
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
```

- [ ] **Step 2: Run the validator and verify RED**

Run:

```powershell
node scripts/validate-mms-design.mjs
```

Expected: exit code 1 with `FAIL creates the MMS document` because `mms_design.html` does not exist.

- [ ] **Step 3: Create the minimal MMS document**

Copy the current UTF-8 contents of `index.html` into `mms_design.html`, then make only these changes:

```html
<body class="mms-design">
```

Delete the complete Naver Map anchor:

```html
<a class="map-link" ...>네이버 지도에서 확인하기</a>
```

Delete the complete account-copy button:

```html
<button id="copy-account-number" type="button">계좌정보 복사</button>
```

Delete the final inline `<script>` block that selects `#copy-account-number` and calls `navigator.clipboard.writeText(...)`. Do not add spacing overrides yet; Task 2 proves and corrects the reflow behavior.

- [ ] **Step 4: Run the validator and verify GREEN**

Run:

```powershell
node scripts/validate-mms-design.mjs
```

Expected: all ten checks print `PASS` and the process exits 0.

- [ ] **Step 5: Verify that the public page is untouched**

Run:

```powershell
git diff --exit-code -- index.html
```

Expected: no output and exit code 0.

- [ ] **Step 6: Commit the document contract**

```powershell
git add -- mms_design.html scripts/validate-mms-design.mjs
git commit -m "feat: add MMS-only invitation document"
```

### Task 2: Natural reflow and capture geometry

**Files:**
- Create: `scripts/verify-mms-layout.playwright.js`
- Modify: `mms_design.html`

**Interfaces:**
- Consumes: `mms_design.html` from Task 1 at `http://127.0.0.1:8765/mms_design.html`.
- Produces: zero-pixel computed gaps between `.transit` and `.parking-notice`, zero bottom margin on `.account-info`, and capture bounds `{ intro, details }` at a 640-pixel viewport.

- [ ] **Step 1: Write the failing real-browser layout contract**

Create `scripts/verify-mms-layout.playwright.js`:

```js
async (page) => {
  await page.setViewportSize({ width: 640, height: 1800 });
  await page.reload({ waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.complete ? image.decode().catch(() => {}) : new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    })));
  });

  const result = await page.evaluate(() => {
    const intro = document.querySelector("#intro-section");
    const profile = document.querySelector(".profile-section");
    const transit = document.querySelector(".transit");
    const parking = document.querySelector(".parking-notice");
    const account = document.querySelector(".account-section");
    const accountInfo = document.querySelector(".account-info");
    if (![intro, profile, transit, parking, account, accountInfo].every(Boolean)) return { markup: false };

    const introBox = intro.getBoundingClientRect();
    const profileBox = profile.getBoundingClientRect();
    const transitBox = transit.getBoundingClientRect();
    const parkingBox = parking.getBoundingClientRect();
    const accountBox = account.getBoundingClientRect();
    const infoStyle = getComputedStyle(accountInfo);
    return {
      markup: true,
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      hasMapLink: Boolean(document.querySelector(".map-link")),
      hasCopyButton: Boolean(document.querySelector("#copy-account-number")),
      mapControlGap: parkingBox.top - transitBox.bottom,
      accountControlGap: Number.parseFloat(infoStyle.marginBottom),
      introHeight: Math.ceil(introBox.bottom) - Math.floor(introBox.top),
      detailsHeight: Math.ceil(accountBox.bottom) - Math.floor(profileBox.top),
    };
  });

  const passed = result.markup
    && result.viewportWidth === 640
    && result.documentWidth === 640
    && !result.hasMapLink
    && !result.hasCopyButton
    && Math.abs(result.mapControlGap) <= 0.5
    && result.accountControlGap === 0
    && result.introHeight > 0
    && result.detailsHeight > 0;
  console.log(`${passed ? "PASS" : "FAIL"} MMS layout ${JSON.stringify(result)}`);
  if (!passed) throw new Error("MMS layout contract failed.");
}
```

- [ ] **Step 2: Start the local server and verify RED**

Start a hidden, workspace-scoped server and retain its process object:

```powershell
$mmsServer = Start-Process python -ArgumentList '-m','http.server','8765','--bind','127.0.0.1' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru
npx --yes --package @playwright/cli playwright-cli -s=mms-layout-red open http://127.0.0.1:8765/mms_design.html --browser msedge
npx --yes --package @playwright/cli playwright-cli -s=mms-layout-red snapshot
npx --yes --package @playwright/cli playwright-cli -s=mms-layout-red run-code --filename scripts/verify-mms-layout.playwright.js
```

Expected: the browser contract fails because `mapControlGap` and `accountControlGap` still reflect the interactive-page margins.

- [ ] **Step 3: Add minimal MMS-only reflow styles**

Add this inline block after the `styles.css` link in `mms_design.html`:

```html
<style>
  .mms-design .transit { margin-bottom: 0; }
  .mms-design .parking-notice { margin-top: 0; }
  .mms-design .account-info { margin-bottom: 0; }
</style>
```

These rules remove only the adjacent gaps. Do not change section padding, card padding, minimum height, or any image dimensions.

- [ ] **Step 4: Re-run static and browser contracts and verify GREEN**

Run:

```powershell
node scripts/validate-mms-design.mjs
npx --yes --package @playwright/cli playwright-cli -s=mms-layout-red run-code --filename scripts/verify-mms-layout.playwright.js
npx --yes --package @playwright/cli playwright-cli -s=mms-layout-red console error
```

Expected: both validators pass and the error console is empty.

- [ ] **Step 5: Close the browser session and server**

```powershell
npx --yes --package @playwright/cli playwright-cli -s=mms-layout-red close
Stop-Process -Id $mmsServer.Id
```

- [ ] **Step 6: Commit the reflow contract**

```powershell
git add -- mms_design.html scripts/verify-mms-layout.playwright.js
git commit -m "test: define MMS capture layout"
```

### Task 3: Deterministic PNG and JPEG rendering

**Files:**
- Create: `scripts/verify-mms-output.playwright.js`
- Create: `scripts/render-mms-images.playwright.js`
- Replace: `mms_img/mms_01_intro.png`
- Replace: `mms_img/mms_01_intro.jpg`
- Replace: `mms_img/mms_02_details.png`
- Replace: `mms_img/mms_02_details.jpg`

**Interfaces:**
- Consumes: the validated 640-pixel `mms_design.html` and its `#intro-section`, `.profile-section`, and `.account-section` bounding boxes.
- Produces: four images where `mms_01_intro` uses the intro bounds, `mms_02_details` uses the profile-to-account bounds, and each PNG/JPEG pair has identical pixel dimensions.

- [ ] **Step 1: Write the failing output geometry contract**

Create `scripts/verify-mms-output.playwright.js`:

```js
async (page) => {
  await page.setViewportSize({ width: 640, height: 1800 });
  await page.reload({ waitUntil: "load" });
  const result = await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
    const intro = document.querySelector("#intro-section").getBoundingClientRect();
    const profile = document.querySelector(".profile-section").getBoundingClientRect();
    const account = document.querySelector(".account-section").getBoundingClientRect();
    const expected = {
      intro: { width: 640, height: Math.ceil(intro.bottom) - Math.floor(intro.top) },
      details: { width: 640, height: Math.ceil(account.bottom) - Math.floor(profile.top) },
    };
    const loadSize = (src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => resolve(null);
      image.src = `${src}?qa=${Date.now()}-${Math.random()}`;
    });
    return {
      expected,
      introPng: await loadSize("mms_img/mms_01_intro.png"),
      introJpg: await loadSize("mms_img/mms_01_intro.jpg"),
      detailsPng: await loadSize("mms_img/mms_02_details.png"),
      detailsJpg: await loadSize("mms_img/mms_02_details.jpg"),
    };
  });

  const same = (left, right) => left && right && left.width === right.width && left.height === right.height;
  const passed = same(result.introPng, result.expected.intro)
    && same(result.introJpg, result.expected.intro)
    && same(result.detailsPng, result.expected.details)
    && same(result.detailsJpg, result.expected.details);
  console.log(`${passed ? "PASS" : "FAIL"} MMS output ${JSON.stringify(result)}`);
  if (!passed) throw new Error("MMS output geometry contract failed.");
}
```

- [ ] **Step 2: Verify RED against the stale committed images**

```powershell
$mmsServer = Start-Process python -ArgumentList '-m','http.server','8765','--bind','127.0.0.1' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru
npx --yes --package @playwright/cli playwright-cli -s=mms-render open http://127.0.0.1:8765/mms_design.html --browser msedge
npx --yes --package @playwright/cli playwright-cli -s=mms-render snapshot
npx --yes --package @playwright/cli playwright-cli -s=mms-render run-code --filename scripts/verify-mms-output.playwright.js
```

Expected: failure showing that at least one committed output height differs from the current content bounds.

- [ ] **Step 3: Write the minimal deterministic renderer**

Create `scripts/render-mms-images.playwright.js`:

```js
async (page) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 640,
    height: 1800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await page.reload({ waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });

  const boxes = await page.evaluate(() => {
    const intro = document.querySelector("#intro-section").getBoundingClientRect();
    const profile = document.querySelector(".profile-section").getBoundingClientRect();
    const account = document.querySelector(".account-section").getBoundingClientRect();
    return {
      intro: { x: 0, y: Math.floor(intro.top), width: 640, height: Math.ceil(intro.bottom) - Math.floor(intro.top) },
      details: { x: 0, y: Math.floor(profile.top), width: 640, height: Math.ceil(account.bottom) - Math.floor(profile.top) },
    };
  });

  const captures = [
    ["mms_img/mms_01_intro.png", "png", boxes.intro],
    ["mms_img/mms_01_intro.jpg", "jpeg", boxes.intro],
    ["mms_img/mms_02_details.png", "png", boxes.details],
    ["mms_img/mms_02_details.jpg", "jpeg", boxes.details],
  ];
  for (const [path, type, clip] of captures) {
    await page.screenshot({
      path,
      type,
      ...(type === "jpeg" ? { quality: 90 } : {}),
      clip,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    });
  }
  console.log(JSON.stringify(boxes));
}
```

- [ ] **Step 4: Render and verify GREEN**

```powershell
npx --yes --package @playwright/cli playwright-cli -s=mms-render run-code --filename scripts/render-mms-images.playwright.js
npx --yes --package @playwright/cli playwright-cli -s=mms-render run-code --filename scripts/verify-mms-output.playwright.js
npx --yes --package @playwright/cli playwright-cli -s=mms-render console error
```

Expected: the renderer reports two positive natural-height clips, the output validator prints `PASS`, and the browser error console is empty.

- [ ] **Step 5: Inspect the final images and repository diff**

Open both PNGs with the local image viewer and confirm:

- `mms_01_intro.png` contains only the complete intro.
- `mms_02_details.png` starts with the profile and ends at the account card.
- Neither image contains the Naver Map or account-copy button.
- No blank slot remains where either button was removed.
- Text, map, portrait, borders, and section edges are not clipped.

Then run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; only the intended new scripts/page, four MMS assets, plan/spec commits, and pre-existing user changes appear.

- [ ] **Step 6: Close the session and server**

```powershell
npx --yes --package @playwright/cli playwright-cli -s=mms-render close
Stop-Process -Id $mmsServer.Id
```

- [ ] **Step 7: Commit the renderer and generated artifacts**

```powershell
git add -- scripts/render-mms-images.playwright.js scripts/verify-mms-output.playwright.js mms_img/mms_01_intro.png mms_img/mms_01_intro.jpg mms_img/mms_02_details.png mms_img/mms_02_details.jpg
git commit -m "assets: refresh MMS invitation images"
```

### Task 4: Final regression verification

**Files:**
- Verify: `index.html`
- Verify: `mms_design.html`
- Verify: `scripts/validate-mms-design.mjs`
- Verify: `scripts/verify-mms-layout.playwright.js`
- Verify: `scripts/verify-mms-output.playwright.js`
- Verify: `mms_img/mms_01_intro.{png,jpg}`
- Verify: `mms_img/mms_02_details.{png,jpg}`

**Interfaces:**
- Consumes: all deliverables from Tasks 1-3.
- Produces: evidence that static, browser-layout, output-geometry, and existing invitation validation all pass together.

- [ ] **Step 1: Run all Node validation scripts**

```powershell
node scripts/validate-mms-design.mjs
node scripts/validate-invitation-local.mjs
node scripts/validate-invitation-draft.mjs
```

Expected: every process exits 0.

- [ ] **Step 2: Run final browser contracts in one clean session**

```powershell
$mmsServer = Start-Process python -ArgumentList '-m','http.server','8765','--bind','127.0.0.1' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru
npx --yes --package @playwright/cli playwright-cli -s=mms-final open http://127.0.0.1:8765/mms_design.html --browser msedge
npx --yes --package @playwright/cli playwright-cli -s=mms-final snapshot
npx --yes --package @playwright/cli playwright-cli -s=mms-final run-code --filename scripts/verify-mms-layout.playwright.js
npx --yes --package @playwright/cli playwright-cli -s=mms-final run-code --filename scripts/verify-mms-output.playwright.js
npx --yes --package @playwright/cli playwright-cli -s=mms-final console error
npx --yes --package @playwright/cli playwright-cli -s=mms-final close
Stop-Process -Id $mmsServer.Id
```

Expected: both contracts pass and the error console is empty.

- [ ] **Step 3: Confirm the exact committed scope**

```powershell
git status --short
git log -4 --oneline --decorate
git diff HEAD~3..HEAD -- mms_design.html scripts/validate-mms-design.mjs scripts/verify-mms-layout.playwright.js scripts/render-mms-images.playwright.js scripts/verify-mms-output.playwright.js mms_img
```

Expected: the three implementation commits contain only the MMS page, validators, renderer, and four image assets. Pre-existing unrelated changes remain unstaged and uncommitted.
