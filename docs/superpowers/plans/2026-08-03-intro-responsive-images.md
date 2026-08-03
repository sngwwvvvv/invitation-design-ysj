# Intro Responsive Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the live HTML intro with three approved, lossless responsive images whose deliberate line breaks remain readable from 360px through 640px.

**Architecture:** A development-only staging page owns the exact 360px, 480px, and 640px artboards. A small Playwright CLI render function captures each artboard at device scale 2 into `img`, while the production page uses `<picture>` media sources to switch at the midpoint breakpoints 420px and 560px. A focused Node validator checks image dimensions, markup source selection, image accessibility metadata, and the removal of obsolete intro-only CSS without depending on the repository's already-failing historical validator.

**Tech Stack:** Semantic HTML, CSS, Node.js built-ins, PNG, `@playwright/cli` with installed Microsoft Edge.

## Global Constraints

- Manage all final image assets under `img`.
- Use exactly `img/intro-section-360.png`, `img/intro-section-480.png`, and `img/intro-section-640.png`.
- Render the 360px, 480px, and 640px designs at device pixel ratio 2, producing raster widths of 720px, 960px, and 1280px.
- Select 360px for viewports through 419px, 480px for 420px through 559px, and 640px for 560px and above.
- Preserve the approved logo, heading, event date, full invitation copy, signature, palette, reflection background, spacing, and alignment.
- At 640px, render `납세자에게 진정으로 도움이 되는 사람으로` and `하루하루 살아가려 합니다.` on separate complete lines.
- Do not duplicate the full invitation as visually hidden HTML; provide concise `aria-label` and `alt` text.
- Do not lazy-load the above-the-fold intro image; use `fetchpriority="high"` and `decoding="async"`.
- Do not change the profile, directions, account information, map links, clipboard behavior, or their visible layout.
- Treat `.superpowers/brainstorm` files as design-session artifacts; do not add them to feature commits.

---

## File Structure

- Create `scripts/validate-responsive-intro-images.mjs`: focused static contract and PNG-dimension validator.
- Create `scripts/intro-section-stage.html`: development-only source for the three approved artboards.
- Create `scripts/render-intro-images.playwright.js`: function consumed by Playwright CLI to render the three PNGs.
- Create `scripts/intro-render.config.json`: Playwright CLI context configuration with Microsoft Edge and `deviceScaleFactor: 2`.
- Create `img/intro-section-360.png`: 720px-wide 2x capture of the 360px artboard.
- Create `img/intro-section-480.png`: 960px-wide 2x capture of the 480px artboard.
- Create `img/intro-section-640.png`: 1280px-wide 2x capture of the 640px artboard.
- Modify `index.html`: replace the visible intro children with the responsive `<picture>`.
- Modify `styles.css`: remove obsolete live intro typography/background rules and make the responsive image fill the shell.

### Task 1: Encode the Responsive Intro Contract

**Files:**
- Create: `scripts/validate-responsive-intro-images.mjs`
- Read: `docs/superpowers/specs/2026-08-03-intro-responsive-image-design.md`
- Test: `scripts/validate-responsive-intro-images.mjs`

**Interfaces:**
- Consumes: `index.html`, `styles.css`, and the three fixed PNG paths.
- Produces: a zero-dependency command that prints one `PASS` or `FAIL` line per responsive-intro contract and exits `0` only when every check passes.

- [ ] **Step 1: Write the focused validator**

Create the validator with this PNG reader and explicit checks:

```js
import { existsSync, readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const css = readFileSync("styles.css", "utf8");

function pngSize(path) {
  if (!existsSync(path)) return null;
  const bytes = readFileSync(path);
  const signature = "89504e470d0a1a0a";
  if (bytes.length < 24 || bytes.subarray(0, 8).toString("hex") !== signature) return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const images = {
  360: pngSize("img/intro-section-360.png"),
  480: pngSize("img/intro-section-480.png"),
  640: pngSize("img/intro-section-640.png"),
};

const intro = html.match(/<section\b[^>]*id=["']intro-section["'][^>]*>[\s\S]*?<\/section>/i)?.[0] ?? "";
const expectedSources = [
  /<source\b(?=[^>]*media=["']\(max-width:\s*419px\)["'])(?=[^>]*srcset=["']img\/intro-section-360\.png["'])[^>]*>/i,
  /<source\b(?=[^>]*media=["']\(max-width:\s*559px\)["'])(?=[^>]*srcset=["']img\/intro-section-480\.png["'])[^>]*>/i,
  /<img\b(?=[^>]*class=["'][^"']*intro-section-image)(?=[^>]*src=["']img\/intro-section-640\.png["'])[^>]*>/i,
];

function pictureMarkup() {
  if (Object.values(images).some((size) => !size)) throw new Error("Render all three intro PNGs first.");
  return `<section id="intro-section" aria-label="호연회계법인 윤성중 부대표 개업 초대 인사말">
  <picture>
    <source media="(max-width: 419px)" srcset="img/intro-section-360.png" width="720" height="${images[360].height}">
    <source media="(max-width: 559px)" srcset="img/intro-section-480.png" width="960" height="${images[480].height}">
    <img class="intro-section-image" src="img/intro-section-640.png" width="1280" height="${images[640].height}" alt="호연회계법인 윤성중 부대표의 2026년 8월 12일 개업 초대 인사말" fetchpriority="high" decoding="async">
  </picture>
</section>`;
}

if (process.argv.includes("--print-markup")) {
  console.log(pictureMarkup());
  process.exit(0);
}

const checks = [
  ["has all three valid PNG assets", Object.values(images).every(Boolean)],
  ["uses 2x raster widths", images[360]?.width === 720 && images[480]?.width === 960 && images[640]?.width === 1280],
  ["uses portrait intro images", Object.values(images).every((size) => size && size.height > size.width)],
  ["maps the three picture sources", expectedSources.every((pattern) => pattern.test(intro))],
  ["records matching intrinsic dimensions", Object.entries(images).every(([designWidth, size]) => {
    if (!size) return false;
    const tag = designWidth === "640"
      ? intro.match(/<img\b[^>]*class=["'][^"']*intro-section-image[^>]*>/i)?.[0] ?? ""
      : intro.match(new RegExp(`<source\\b(?=[^>]*intro-section-${designWidth}\\.png)[^>]*>`, "i"))?.[0] ?? "";
    return new RegExp(`\\bwidth=["']${size.width}["']`, "i").test(tag) && new RegExp(`\\bheight=["']${size.height}["']`, "i").test(tag);
  })],
  ["keeps one responsive picture in intro", (intro.match(/<picture\b/gi) ?? []).length === 1],
  ["removes live intro children", !/(invitation-message|invitation-title|event-details|brand-logo)/i.test(intro)],
  ["labels the image purpose", /aria-label=["']호연회계법인 윤성중 부대표 개업 초대 인사말["']/i.test(intro)],
  ["provides concise image alt text", /alt=["']호연회계법인 윤성중 부대표의 2026년 8월 12일 개업 초대 인사말["']/i.test(intro)],
  ["prioritizes the intro image", /fetchpriority=["']high["']/i.test(intro) && /decoding=["']async["']/i.test(intro) && !/loading=["']lazy["']/i.test(intro)],
  ["sizes the responsive image", /\.intro-section-image\s*\{[^}]*width\s*:\s*100%[^}]*height\s*:\s*auto/i.test(css)],
  ["removes obsolete intro pseudo-elements", !/#intro-section::(?:before|after)/i.test(css)],
  ["retains downstream invitation sections", /class=["'][^"']*profile-section/.test(html) && /class=["'][^"']*directions/.test(html) && /class=["'][^"']*account-section/.test(html)],
  ["retains account copy behavior", html.includes("writeText('04908774202501')")],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Run the validator to prove the old implementation fails the new contract**

Run:

```powershell
node scripts/validate-responsive-intro-images.mjs
```

Expected: exit code `1`; failures include `has all three valid PNG assets`, `maps the three picture sources`, and `removes live intro children`.

- [ ] **Step 3: Commit the contract test**

```powershell
git add -- scripts/validate-responsive-intro-images.mjs
git commit -m "test: define responsive intro image contract"
```

### Task 2: Build the Approved Artboards and PNG Assets

**Files:**
- Create: `scripts/intro-section-stage.html`
- Create: `scripts/render-intro-images.playwright.js`
- Create: `scripts/intro-render.config.json`
- Create: `img/intro-section-360.png`
- Create: `img/intro-section-480.png`
- Create: `img/intro-section-640.png`
- Read: `img/hoyeon_logo_horizontal.png`
- Read: `img/reflection_background.png`

**Interfaces:**
- Consumes: the three exact line-break definitions in the approved design spec.
- Produces: `#intro-stage` for each `?width=360|480|640` query and three lossless 2x PNG files consumed by Task 3.

- [ ] **Step 1: Create the staging page shell and exact artboard styles**

Create one standalone UTF-8 HTML document. Read `width` from `new URLSearchParams(location.search)` and reveal only the matching artboard. Use the approved dimensions below:

```css
:root { --platinum:#f0f4f8; --navy:#0a2d54; --green:#43a64e; --slate:#64748b; }
* { box-sizing:border-box; }
html, body { margin:0; width:max-content; min-width:0; background:transparent; }
#intro-stage { position:relative; overflow:hidden; background:var(--slate); font-family:"Pretendard","Noto Sans KR",system-ui,-apple-system,"Segoe UI",sans-serif; }
#intro-stage::before {
  position:absolute; inset:4px; content:"";
  background:linear-gradient(180deg,rgba(240,244,248,.82),rgba(240,244,248,.58)),url("../img/reflection_background.png") center/cover no-repeat;
  filter:brightness(1.12) saturate(.78);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.92),inset 0 -36px 60px rgba(10,45,84,.17),inset 12px 0 24px rgba(10,45,84,.06),0 6px 18px rgba(10,45,84,.32);
}
#intro-stage::after { position:absolute; inset:4px; z-index:1; border:1px solid rgba(10,45,84,.14); content:""; pointer-events:none; }
.intro-content { position:relative; z-index:2; text-align:center; }
.brand-logo { display:block; width:200px; max-width:70%; height:auto; margin:0 auto 28px; }
.intro-title { margin:0 0 26px; color:var(--navy); font-weight:800; letter-spacing:-.04em; line-height:1.45; }
.event-pill { display:inline-flex; align-items:center; gap:6px; margin:0 auto 26px; padding:8px 12px; border-radius:999px; background:var(--slate); color:var(--platinum); font-weight:700; letter-spacing:-.03em; line-height:1.4; white-space:nowrap; }
.event-icon { color:var(--green); }
.invitation-message { margin:0 auto; color:var(--navy); font-weight:700; letter-spacing:-.01em; line-height:2; text-align:left; text-shadow:0 1px 0 rgba(240,244,248,.5); }
.invitation-message p { margin:0 0 20px; }
.invitation-signature { margin-top:26px !important; font-size:15px; line-height:1.8; text-align:right; }
.invitation-signature span { display:block; }
#intro-stage[data-width="360"] { width:360px; padding:56px 24px 64px; }
#intro-stage[data-width="360"] .intro-title { font-size:24px; }
#intro-stage[data-width="360"] .event-pill { font-size:13px; }
#intro-stage[data-width="360"] .invitation-message { width:312px; font-size:16px; }
#intro-stage[data-width="480"] { width:480px; padding:64px 36px 70px; }
#intro-stage[data-width="480"] .intro-title { font-size:28px; }
#intro-stage[data-width="480"] .event-pill { font-size:14px; }
#intro-stage[data-width="480"] .invitation-message { width:408px; font-size:17px; }
#intro-stage[data-width="640"] { width:640px; padding:72px 48px 76px; }
#intro-stage[data-width="640"] .intro-title { font-size:32px; }
#intro-stage[data-width="640"] .event-pill { font-size:14px; }
#intro-stage[data-width="640"] .invitation-message { width:480px; font-size:18px; }
```

Use the exact heading, event text, paragraphs, signature, and per-width `<br>` positions from `docs/superpowers/specs/2026-08-03-intro-responsive-image-design.md`. For the corrected 640px paragraph, use this exact markup:

```html
<p>거창한 약속보다는, 제게 주어진 경험을 바탕으로<br>매 순간 솔직하고 치열하게 고민하며<br>납세자에게 진정으로 도움이 되는 사람으로<br>하루하루 살아가려 합니다.</p>
```

- [ ] **Step 2: Create the Playwright CLI render function**

Create `scripts/render-intro-images.playwright.js` as a single function expression accepted by `playwright-cli run-code --filename`:

```js
async (page) => {
  const base = new URL(page.url());
  base.search = "";
  const cdp = await page.context().newCDPSession(page);

  for (const width of [360, 480, 640]) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 2400,
      deviceScaleFactor: 2,
      mobile: false,
    });
    const url = new URL(base);
    url.searchParams.set("width", String(width));
    await page.goto(url.href);
    await page.locator("#intro-stage").screenshot({
      path: `img/intro-section-${width}.png`,
      animations: "disabled",
      scale: "device",
    });
  }
}
```

- [ ] **Step 3: Render the three PNGs using installed Edge**

Run from the repository root:

```powershell
$stageUrl = 'file:///' + ((Resolve-Path 'scripts/intro-section-stage.html').Path -replace '\\','/') + '?width=640'
npx --yes --package @playwright/cli playwright-cli -s=intro-image-render open $stageUrl --browser msedge
npx --yes --package @playwright/cli playwright-cli -s=intro-image-render run-code --filename scripts/render-intro-images.playwright.js
npx --yes --package @playwright/cli playwright-cli -s=intro-image-render close
```

Before the first command, create `.playwright/cli.config.json` from `scripts/intro-render.config.json`, or pass the same JSON through the CLI's `--config` option on `open`; the session must be created with `contextOptions.deviceScaleFactor` set to `2`. Subsequent commands reuse that session.

Expected: the three named PNG files appear under `img` with no navigation, image-load, or screenshot error.

- [ ] **Step 4: Verify the PNG headers and corrected 640px rendering**

Run:

```powershell
node scripts/validate-responsive-intro-images.mjs
```

Expected at this intermediate point: `PASS has all three valid PNG assets`, `PASS uses 2x raster widths`, and `PASS uses portrait intro images`; markup-related checks still fail.

Open `img/intro-section-640.png` and visually confirm the corrected lines are exactly:

```text
납세자에게 진정으로 도움이 되는 사람으로
하루하루 살아가려 합니다.
```

- [ ] **Step 5: Commit the reproducible stage and generated assets**

```powershell
git add -- scripts/intro-section-stage.html scripts/render-intro-images.playwright.js scripts/intro-render.config.json img/intro-section-360.png img/intro-section-480.png img/intro-section-640.png
git commit -m "feat: render responsive intro image assets"
```

### Task 3: Replace the Live Intro with `<picture>`

**Files:**
- Modify: `index.html:11-34`
- Modify: `styles.css:21-61`
- Modify: `styles.css:107-126`
- Test: `scripts/validate-responsive-intro-images.mjs`

**Interfaces:**
- Consumes: the three PNG files produced by Task 2.
- Produces: a production `#intro-section` whose selected `currentSrc` changes only at 420px and 560px.

- [ ] **Step 1: Replace the visible intro children with responsive image markup**

Print fully concrete production markup whose intrinsic heights come directly from the PNG headers:

```powershell
node scripts/validate-responsive-intro-images.mjs --print-markup
```

Expected: one complete `<section id="intro-section">` containing the 419px and 559px `<source>` elements plus the 640px fallback `<img>`. Its width attributes are `720`, `960`, and `1280`; every height attribute is an integer printed from its corresponding PNG rather than a hand-entered value. Replace the complete current `#intro-section` with this exact output using `apply_patch`.

- [ ] **Step 2: Reduce the intro CSS to the image container contract**

Delete the obsolete `#intro-section::before`, `#intro-section::after`, `.intro-content`, `.brand-logo`, intro-only `h1`, `#event-details`, `.event-pill`, `.event-icon`, and `.invitation-*` rules. Remove their declarations from both mobile media blocks. Preserve all downstream section styles, then add:

```css
#intro-section,
#intro-section picture,
.intro-section-image {
  display: block;
  width: 100%;
}

#intro-section { background: var(--slate); }
.intro-section-image { height: auto; }
```

Change `h1, h2, h3, p { margin-top: 0; }` to `h2, h3, p { margin-top: 0; }` rather than deleting the shared reset.

- [ ] **Step 3: Run the focused contract validator**

```powershell
node scripts/validate-responsive-intro-images.mjs
```

Expected: every line is `PASS`; exit code `0`.

- [ ] **Step 4: Run unaffected-content regression checks**

Use focused searches because `scripts/validate-invitation-local.mjs` already fails unrelated baseline contracts before this feature:

```powershell
rg -n "profile-section|directions|account-section|map_capture\.png|writeText\('04908774202501'\)" index.html
rg -n "profile-grid|directions|account-card|copy-account-number" styles.css
git diff --check
```

Expected: all listed downstream markers remain present and `git diff --check` prints nothing.

- [ ] **Step 5: Commit the production integration**

```powershell
git add -- index.html styles.css
git commit -m "feat: use responsive intro pictures"
```

### Task 4: Verify Breakpoint Selection and Rendering

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `img/intro-section-360.png`
- Verify: `img/intro-section-480.png`
- Verify: `img/intro-section-640.png`

**Interfaces:**
- Consumes: the integrated production page from Task 3.
- Produces: recorded browser evidence for source selection, overflow, image completeness, console health, and downstream behavior.

- [ ] **Step 1: Open the local page in a reusable browser session**

```powershell
$pageUrl = 'file:///' + ((Resolve-Path 'index.html').Path -replace '\\','/')
npx --yes --package @playwright/cli playwright-cli -s=intro-image-qa open $pageUrl --browser msedge
```

- [ ] **Step 2: Check all six source-selection boundaries**

For each width in `360, 419, 420, 559, 560, 640`, run `resize <width> 900`, then:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=intro-image-qa eval "() => { const image = document.querySelector('.intro-section-image'); return { source: new URL(image.currentSrc).pathname.split('/').pop(), naturalWidth: image.naturalWidth, complete: image.complete, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth }; }"
```

Expected mappings:

| Width | Source | `naturalWidth` |
| --- | --- | --- |
| 360 | `intro-section-360.png` | 720 |
| 419 | `intro-section-360.png` | 720 |
| 420 | `intro-section-480.png` | 960 |
| 559 | `intro-section-480.png` | 960 |
| 560 | `intro-section-640.png` | 1280 |
| 640 | `intro-section-640.png` | 1280 |

At every width, `complete` must be `true` and `documentWidth` must equal `viewportWidth`.

- [ ] **Step 3: Capture and inspect the three canonical intro images in-page**

At widths 360, 480, and 640, save an element screenshot:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=intro-image-qa screenshot "#intro-section" --hires --filename ".playwright-cli/intro-live-WIDTH.png"
```

Replace `WIDTH` with the active width. Inspect all three for clipping, blank seams, distorted logos, missing copy, or unintended secondary wrapping. Reconfirm the approved 640px sentence break.

- [ ] **Step 4: Check console health and downstream controls**

```powershell
npx --yes --package @playwright/cli playwright-cli -s=intro-image-qa console error
npx --yes --package @playwright/cli playwright-cli -s=intro-image-qa eval "() => ({ profile: !!document.querySelector('.profile-section'), directions: !!document.querySelector('.directions'), account: !!document.querySelector('.account-section'), copyButton: !!document.querySelector('#copy-account-number'), copyStatusLive: document.querySelector('#copy-status')?.getAttribute('aria-live') })"
```

Expected: no console errors; every boolean is `true`; `copyStatusLive` is `polite`.

- [ ] **Step 5: Run final static verification and review the scoped diff**

```powershell
node scripts/validate-responsive-intro-images.mjs
git diff HEAD~3..HEAD -- index.html styles.css scripts/validate-responsive-intro-images.mjs scripts/intro-section-stage.html scripts/render-intro-images.playwright.js img/intro-section-360.png img/intro-section-480.png img/intro-section-640.png
git status --short
```

Expected: all validator lines pass. The scoped diff contains only the responsive-intro feature. Pre-existing staged or untracked files outside this list remain untouched.

- [ ] **Step 6: Close the browser session**

```powershell
npx --yes --package @playwright/cli playwright-cli -s=intro-image-qa close
```

## Plan Self-Review

- Spec coverage: Task 1 encodes the file, source-selection, accessibility, eager-loading, and downstream-preservation contracts; Task 2 produces every approved image at 2x; Task 3 integrates them; Task 4 exercises every breakpoint edge and visual regression requirement.
- Placeholder scan: the plan contains no hand-entered future values. Task 1's `--print-markup` mode derives every otherwise-unknown height directly from the rendered PNG headers before integration.
- Interface consistency: Task 2 produces the exact three filenames consumed by Tasks 3 and 4; Task 1 validates those same paths and raster widths; Task 4 expects the same breakpoint mapping defined in Task 3.
