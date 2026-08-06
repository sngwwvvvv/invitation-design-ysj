# Naver SENS MMS Portrait Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two MMS JPEGs with undistorted `1080 × 1440px` Naver SENS-ready images: intro only, then profile through account information.

**Architecture:** Extend the existing intro HTML stage with a native 1080px export layout and make `mms_design.html` reflow its details into a fixed three-row 1080px-wide export grid. Reuse the existing Playwright renderer filenames so the old 640px workflow cannot accidentally overwrite the new assets, capture lossless intermediate PNGs, and encode the two final JPEGs with Pillow under a strict 290KB cap.

**Tech Stack:** HTML/CSS, Node.js, Playwright CLI with Microsoft Edge/Chromium, Python 3 with Pillow, PowerShell.

## Global Constraints

- Final files are `mms_img/mms_01_intro.jpg` and `mms_img/mms_02_details.jpg`.
- Both final files are exactly `1080 × 1440px`, a portrait 3:4 ratio.
- Both final files are actual JPEG images and no larger than `290 × 1024 = 296,960` bytes.
- Preserve all invitation copy, the current color hierarchy, and the source aspect ratios of the portrait and map.
- Do not crop, hide, overlap, or non-uniformly scale invitation content.
- Fill the canvas through layout and spacing; do not add a blank letterbox or placeholder.
- Do not modify `index.html` or `styles.css`.
- Leave `mms_img/mms_01_intro.png` and `mms_img/mms_02_details.png` unchanged as legacy assets; they are not Naver SENS deliverables.
- Do not regenerate the horizontal composite or modify files under `output/mms-wide/`.
- Keep all pre-existing unrelated workspace changes unstaged and uncommitted.

---

## File structure

- Modify `scripts/intro-section-stage.html`: add a native `1080 × 1440px` intro stage that reuses the approved 640px line breaks.
- Modify `mms_design.html`: add 1080px-only details layout rules with fixed section tracks totaling 1440px.
- Modify `scripts/validate-mms-design.mjs`: statically enforce the SENS stage and details-grid hooks.
- Modify `scripts/verify-mms-layout.playwright.js`: verify both browser stages, containment, overflow, and source-image ratios.
- Modify `scripts/render-mms-images.playwright.js`: capture two lossless `1080 × 1440px` intermediate PNGs.
- Modify `scripts/verify-mms-output.playwright.js`: verify the served final JPEG pixel dimensions.
- Create `scripts/encode-mms-jpegs.py`: encode the highest JPEG quality that fits the 290KB limit without changing dimensions.
- Create `scripts/verify-mms-jpegs.py`: verify path, format, dimensions, ratio, and byte size.
- Replace `mms_img/mms_01_intro.jpg`: final intro JPEG.
- Replace `mms_img/mms_02_details.jpg`: final profile-through-account JPEG.
- Temporarily create `output/mms-sens/mms_01_intro_raw.png` and `output/mms-sens/mms_02_details_raw.png`; remove only these two files after final visual QA.

### Task 1: Native 1080 × 1440 layout contracts

**Files:**
- Modify: `scripts/validate-mms-design.mjs`
- Modify: `scripts/verify-mms-layout.playwright.js`
- Modify: `scripts/intro-section-stage.html`
- Modify: `mms_design.html`

**Interfaces:**
- Consumes: `scripts/intro-section-stage.html?width=1080`, `mms_design.html`, and the current `img/` assets.
- Produces: `#intro-stage` and `#mms-details` browser boxes of exactly `{ width: 1080, height: 1440 }`, with all relevant content contained and portrait/map ratios preserved.

- [ ] **Step 1: Extend the static validator and verify RED**

Update `scripts/validate-mms-design.mjs` to read both documents and append these checks after the existing MMS checks:

```js
const introStage = readFileSync("scripts/intro-section-stage.html", "utf8");
const sensChecks = [
  ["supports the 1080 intro stage", /\[360,\s*480,\s*640,\s*1080\]\.includes\(requestedWidth\)/.test(introStage)],
  ["sets the SENS intro canvas", /#intro-stage\[data-width=["']1080["']\][^{]*\{[^}]*width:\s*1080px;[^}]*height:\s*1440px;/s.test(introStage)],
  ["sets the SENS details canvas", /#mms-details\s*\{[^}]*height:\s*1440px;/s.test(html)],
  ["uses exact details tracks", /grid-template-rows:\s*456px\s+814px\s+170px/.test(html)],
];
checks.push(...sensChecks);
```

Run:

```powershell
node scripts/validate-mms-design.mjs
```

Expected: existing checks pass and the four new SENS checks fail because neither document has a 1080px export layout yet.

- [ ] **Step 2: Replace the browser layout contract and verify RED**

Replace `scripts/verify-mms-layout.playwright.js` with a contract that:

```js
async (page) => {
  const origin = new URL(page.url()).origin;
  await page.setViewportSize({ width: 1080, height: 1600 });

  const ready = async () => page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });
  const within = (outer, inner) => inner.left >= outer.left - 0.5
    && inner.top >= outer.top - 0.5
    && inner.right <= outer.right + 0.5
    && inner.bottom <= outer.bottom + 0.5;

  await page.goto(`${origin}/scripts/intro-section-stage.html?width=1080`, { waitUntil: "load" });
  await ready();
  const intro = await page.evaluate(() => {
    const stage = document.querySelector("#intro-stage");
    const content = document.querySelector(".intro-content");
    const a = stage.getBoundingClientRect();
    const b = content.getBoundingClientRect();
    return {
      stage: { left: a.left, top: a.top, right: a.right, bottom: a.bottom, width: a.width, height: a.height },
      content: { left: b.left, top: b.top, right: b.right, bottom: b.bottom },
      scrollWidth: stage.scrollWidth,
      scrollHeight: stage.scrollHeight,
      date: document.querySelector(".event-date")?.textContent,
    };
  });

  await page.goto(`${origin}/mms_design.html`, { waitUntil: "load" });
  await ready();
  const details = await page.evaluate(() => {
    const root = document.querySelector("#mms-details");
    const box = root.getBoundingClientRect();
    const sectionData = [...root.children].map((section) => ({
      className: section.className,
      clientHeight: section.clientHeight,
      scrollHeight: section.scrollHeight,
      clientWidth: section.clientWidth,
      scrollWidth: section.scrollWidth,
    }));
    const ratio = (selector) => {
      const image = document.querySelector(selector);
      const rect = image.getBoundingClientRect();
      return { rendered: rect.width / rect.height, natural: image.naturalWidth / image.naturalHeight };
    };
    return {
      box: { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height },
      scrollWidth: root.scrollWidth,
      scrollHeight: root.scrollHeight,
      sections: sectionData,
      portrait: ratio(".portrait"),
      map: ratio(".map-image"),
      hasMapLink: Boolean(document.querySelector(".map-link")),
      hasCopyButton: Boolean(document.querySelector("#copy-account-number")),
    };
  });

  const ratioMatches = (value) => Math.abs(value.rendered - value.natural) <= 0.002;
  const passed = intro.stage.width === 1080
    && intro.stage.height === 1440
    && intro.scrollWidth === 1080
    && intro.scrollHeight === 1440
    && within(intro.stage, intro.content)
    && intro.date === "2026년 8월 19일 (수)"
    && details.box.width === 1080
    && details.box.height === 1440
    && details.scrollWidth === 1080
    && details.scrollHeight === 1440
    && details.sections.every((section) => section.scrollHeight <= section.clientHeight + 1 && section.scrollWidth <= section.clientWidth + 1)
    && ratioMatches(details.portrait)
    && ratioMatches(details.map)
    && !details.hasMapLink
    && !details.hasCopyButton;
  console.log(`${passed ? "PASS" : "FAIL"} SENS MMS layout ${JSON.stringify({ intro, details })}`);
  if (!passed) throw new Error("SENS MMS layout contract failed.");
}
```

Start a local server and run the new contract:

```powershell
$sensServer = Start-Process python -ArgumentList '-m','http.server','8765','--bind','127.0.0.1' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru
npx --yes --package @playwright/cli playwright-cli -s=sens-layout open http://127.0.0.1:8765/mms_design.html --browser msedge
npx --yes --package @playwright/cli playwright-cli -s=sens-layout snapshot
npx --yes --package @playwright/cli playwright-cli -s=sens-layout run-code --filename scripts/verify-mms-layout.playwright.js
```

Expected: FAIL because the intro stage resolves to the 640px fallback and details still use their natural 640px layout.

- [ ] **Step 3: Implement the 1080px intro stage**

Add these rules after the current 640px intro rules in `scripts/intro-section-stage.html`:

```css
#intro-stage[data-width="1080"] {
  --intro-copy-width:760px;
  display:flex;
  width:1080px;
  height:1440px;
  align-items:center;
  padding:88px 110px;
}
#intro-stage[data-width="1080"] .intro-content { width:100%; }
#intro-stage[data-width="1080"] .brand-logo { width:300px; margin-bottom:36px; }
#intro-stage[data-width="1080"] .intro-title { margin-bottom:34px; font-size:46px; }
#intro-stage[data-width="1080"] .event-pill { margin-bottom:34px; padding:12px 18px; font-size:23px; }
#intro-stage[data-width="1080"] .invitation-message { font-size:22px; line-height:1.72; }
#intro-stage[data-width="1080"] .invitation-message p { margin-bottom:18px; }
#intro-stage[data-width="1080"] .invitation-signature { margin-top:22px !important; font-size:20px; line-height:1.55; }
```

Change the stage-selection script so 1080 is accepted while the approved 640 copy is reused:

```js
const requestedWidth = Number(new URLSearchParams(location.search).get("width"));
const width = [360, 480, 640, 1080].includes(requestedWidth) ? requestedWidth : 640;
const copyWidth = width === 1080 ? 640 : width;
const stage = document.querySelector("#intro-stage");
stage.dataset.width = String(width);
stage.append(document.querySelector(`#copy-${copyWidth}`).content.cloneNode(true));
```

- [ ] **Step 4: Implement the 1080px details grid**

Append this 1080px-only block to the existing inline `<style>` in `mms_design.html`:

```css
@media (min-width:1080px) {
  .mms-design .invitation-shell { width:1080px; max-width:1080px; margin:0; }
  .mms-design #mms-details {
    display:grid;
    width:1080px;
    height:1440px;
    grid-template-rows:456px 814px 170px;
  }
  .mms-design #mms-details > section { min-width:0; min-height:0; }
  .mms-design #mms-details .profile-section { padding:0 72px 24px; }
  .mms-design #mms-details .profile-heading {
    margin:0 -72px 20px;
    padding:10px 72px;
    font-size:1.5rem;
  }
  .mms-design #mms-details .profile-grid { grid-template-columns:220px minmax(0,1fr); gap:40px; }
  .mms-design #mms-details .portrait { width:220px; }
  .mms-design #mms-details .career-list { font-size:18px; line-height:1.55; }
  .mms-design #mms-details .directions { padding:24px 72px; }
  .mms-design #mms-details .directions::before,
  .mms-design #mms-details .account-section::before { right:72px; left:72px; }
  .mms-design #mms-details .directions h2 { margin-bottom:18px; font-size:28px; }
  .mms-design #mms-details .map-image { width:500px; margin:0 auto 14px; }
  .mms-design #mms-details address { margin-bottom:10px; font-size:18px; }
  .mms-design #mms-details .transit { margin-bottom:0; font-size:18px; }
  .mms-design #mms-details .parking-notice { margin-top:0; padding:12px 14px; }
  .mms-design #mms-details .parking-list-header { margin-top:10px; }
  .mms-design #mms-details .parking-list > div { padding:6px 0; }
  .mms-design #mms-details .parking-footnote { margin-top:8px; }
  .mms-design #mms-details .account-section { padding:22px 72px; }
  .mms-design #mms-details .account-card { padding:14px 20px 8px; }
}
```

- [ ] **Step 5: Run static and browser contracts and verify GREEN**

```powershell
node scripts/validate-mms-design.mjs
npx --yes --package @playwright/cli playwright-cli -s=sens-layout run-code --filename scripts/verify-mms-layout.playwright.js
npx --yes --package @playwright/cli playwright-cli -s=sens-layout console error
```

Expected: the static validator and browser contract pass, both stages report exactly `1080 × 1440`, no section reports scroll overflow, both image ratios match within `0.002`, and the error console is empty.

- [ ] **Step 6: Close the browser/server and commit the layout**

```powershell
npx --yes --package @playwright/cli playwright-cli -s=sens-layout close
Stop-Process -Id $sensServer.Id
git add -- mms_design.html scripts/intro-section-stage.html scripts/validate-mms-design.mjs scripts/verify-mms-layout.playwright.js
git commit -m "feat: add Naver SENS MMS portrait layouts"
```

### Task 2: Lossless capture and size-bounded JPEG encoding

**Files:**
- Modify: `scripts/render-mms-images.playwright.js`
- Modify: `scripts/verify-mms-output.playwright.js`
- Create: `scripts/encode-mms-jpegs.py`
- Create: `scripts/verify-mms-jpegs.py`
- Replace: `mms_img/mms_01_intro.jpg`
- Replace: `mms_img/mms_02_details.jpg`

**Interfaces:**
- Consumes: the two validated 1080px browser stages from Task 1.
- Produces: two raw PNG captures under `output/mms-sens/`, then the highest-quality JPEGs at or below 296,960 bytes in `mms_img/`.

- [ ] **Step 1: Replace the output contracts and verify RED**

Replace `scripts/verify-mms-output.playwright.js` with:

```js
async (page) => {
  const origin = new URL(page.url()).origin;
  const result = await page.evaluate(async (base) => {
    const loadSize = (path) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => resolve(null);
      image.src = `${base}/${path}?qa=${Date.now()}-${Math.random()}`;
    });
    return {
      intro: await loadSize("mms_img/mms_01_intro.jpg"),
      details: await loadSize("mms_img/mms_02_details.jpg"),
    };
  }, origin);
  const valid = (value) => value?.width === 1080 && value?.height === 1440;
  const passed = valid(result.intro) && valid(result.details);
  console.log(`${passed ? "PASS" : "FAIL"} SENS MMS output ${JSON.stringify(result)}`);
  if (!passed) throw new Error("SENS MMS output geometry failed.");
}
```

Create `scripts/verify-mms-jpegs.py`:

```python
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MAX_BYTES = 290 * 1024
EXPECTED_SIZE = (1080, 1440)
FILES = [
    ROOT / "mms_img" / "mms_01_intro.jpg",
    ROOT / "mms_img" / "mms_02_details.jpg",
]

failed = False
for path in FILES:
    with Image.open(path) as image:
        result = {
            "path": str(path),
            "format": image.format,
            "size": image.size,
            "bytes": path.stat().st_size,
        }
    passed = result["format"] == "JPEG" and result["size"] == EXPECTED_SIZE and result["bytes"] <= MAX_BYTES
    print(f"{'PASS' if passed else 'FAIL'} SENS JPEG {result}")
    failed |= not passed
raise SystemExit(1 if failed else 0)
```

Run against the current assets:

```powershell
$sensServer = Start-Process python -ArgumentList '-m','http.server','8765','--bind','127.0.0.1' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru
python scripts/verify-mms-jpegs.py
npx --yes --package @playwright/cli playwright-cli -s=sens-output open http://127.0.0.1:8765/mms_design.html --browser msedge
npx --yes --package @playwright/cli playwright-cli -s=sens-output snapshot
npx --yes --package @playwright/cli playwright-cli -s=sens-output run-code --filename scripts/verify-mms-output.playwright.js
```

Expected: both checks fail because the current JPEGs are `640 × 1082` and `640 × 1641`.

- [ ] **Step 2: Replace the browser renderer**

Replace `scripts/render-mms-images.playwright.js` with:

```js
async (page) => {
  const origin = new URL(page.url()).origin;
  await page.setViewportSize({ width: 1080, height: 1600 });
  const waitForAssets = async () => page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });
  const capture = async (url, selector, path) => {
    await page.goto(url, { waitUntil: "load" });
    await waitForAssets();
    const locator = page.locator(selector);
    const box = await locator.boundingBox();
    if (!box || box.width !== 1080 || box.height !== 1440) {
      throw new Error(`Unexpected ${selector} geometry: ${JSON.stringify(box)}`);
    }
    await locator.screenshot({ path, type: "png", animations: "disabled", caret: "hide", scale: "css" });
    return box;
  };
  const intro = await capture(
    `${origin}/scripts/intro-section-stage.html?width=1080`,
    "#intro-stage",
    "output/mms-sens/mms_01_intro_raw.png",
  );
  const details = await capture(
    `${origin}/mms_design.html`,
    "#mms-details",
    "output/mms-sens/mms_02_details_raw.png",
  );
  console.log(JSON.stringify({ intro, details }));
}
```

- [ ] **Step 3: Create the deterministic JPEG encoder**

Create `scripts/encode-mms-jpegs.py`:

```python
from io import BytesIO
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MAX_BYTES = 290 * 1024
MIN_QUALITY = 60
EXPECTED_SIZE = (1080, 1440)
PAIRS = [
    (ROOT / "output" / "mms-sens" / "mms_01_intro_raw.png", ROOT / "mms_img" / "mms_01_intro.jpg"),
    (ROOT / "output" / "mms-sens" / "mms_02_details_raw.png", ROOT / "mms_img" / "mms_02_details.jpg"),
]

for source, target in PAIRS:
    with Image.open(source) as opened:
        image = opened.convert("RGB")
        if image.size != EXPECTED_SIZE:
            raise ValueError(f"{source} must be {EXPECTED_SIZE}, got {image.size}")
        encoded = None
        selected_quality = None
        for quality in range(95, MIN_QUALITY - 1, -1):
            buffer = BytesIO()
            image.save(buffer, format="JPEG", quality=quality, optimize=True, progressive=False, subsampling=2)
            if buffer.tell() <= MAX_BYTES:
                encoded = buffer.getvalue()
                selected_quality = quality
                break
    if encoded is None:
        raise ValueError(f"{source} cannot meet {MAX_BYTES} bytes at quality >= {MIN_QUALITY}")
    target.write_bytes(encoded)
    print(f"created={target} quality={selected_quality} bytes={len(encoded)} size={EXPECTED_SIZE}")
```

- [ ] **Step 4: Render, encode, and verify GREEN**

```powershell
New-Item -ItemType Directory -Force 'output\mms-sens' | Out-Null
npx --yes --package @playwright/cli playwright-cli -s=sens-output run-code --filename scripts/render-mms-images.playwright.js
python scripts/encode-mms-jpegs.py
python scripts/verify-mms-jpegs.py
npx --yes --package @playwright/cli playwright-cli -s=sens-output run-code --filename scripts/verify-mms-output.playwright.js
npx --yes --package @playwright/cli playwright-cli -s=sens-output console error
```

Expected: both raw captures are exactly `1080 × 1440`; the encoder reports a quality of at least 60 and a byte count no greater than 296,960 for each JPEG; both verifiers pass; the browser error console is empty.

- [ ] **Step 5: Visually inspect the final JPEGs**

Open both final JPEGs with the local image viewer and confirm:

- `mms_01_intro.jpg` contains only the complete intro with a balanced full-canvas background.
- `mms_02_details.jpg` starts with the profile heading and ends after the full account card.
- Korean text is legible and no line is clipped, overlapped, or unexpectedly wrapped.
- The portrait and map look natural, with no horizontal or vertical stretching.
- There is no blank control slot, letterbox, or cropped section edge.
- JPEG compression does not visibly break thin borders or small parking text.

- [ ] **Step 6: Close the session/server and commit the renderer and assets**

```powershell
npx --yes --package @playwright/cli playwright-cli -s=sens-output close
Stop-Process -Id $sensServer.Id
git add -- scripts/render-mms-images.playwright.js scripts/verify-mms-output.playwright.js scripts/encode-mms-jpegs.py scripts/verify-mms-jpegs.py mms_img/mms_01_intro.jpg mms_img/mms_02_details.jpg
git commit -m "assets: render Naver SENS MMS portrait images"
```

### Task 3: Full regression and final handoff

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `mms_design.html`
- Verify: `scripts/intro-section-stage.html`
- Verify: `scripts/validate-mms-design.mjs`
- Verify: `scripts/verify-mms-layout.playwright.js`
- Verify: `scripts/verify-mms-output.playwright.js`
- Verify: `scripts/verify-mms-jpegs.py`
- Verify: `mms_img/mms_01_intro.jpg`
- Verify: `mms_img/mms_02_details.jpg`

**Interfaces:**
- Consumes: the two implementation commits from Tasks 1-2.
- Produces: final evidence that the public invitation is unchanged, all MMS contracts pass, and only the two approved JPEG deliverables changed.

- [ ] **Step 1: Run static and existing invitation regressions**

```powershell
node scripts/validate-mms-design.mjs
node scripts/validate-invitation-local.mjs
node scripts/validate-invitation-draft.mjs
git diff --exit-code -- index.html styles.css
```

Expected: every validator exits 0 and the public page/style diff command prints nothing.

- [ ] **Step 2: Run the final browser and image contracts in a clean session**

```powershell
$sensServer = Start-Process python -ArgumentList '-m','http.server','8765','--bind','127.0.0.1' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru
npx --yes --package @playwright/cli playwright-cli -s=sens-final open http://127.0.0.1:8765/mms_design.html --browser msedge
npx --yes --package @playwright/cli playwright-cli -s=sens-final snapshot
npx --yes --package @playwright/cli playwright-cli -s=sens-final run-code --filename scripts/verify-mms-layout.playwright.js
npx --yes --package @playwright/cli playwright-cli -s=sens-final run-code --filename scripts/verify-mms-output.playwright.js
npx --yes --package @playwright/cli playwright-cli -s=sens-final console error
python scripts/verify-mms-jpegs.py
npx --yes --package @playwright/cli playwright-cli -s=sens-final close
Stop-Process -Id $sensServer.Id
```

Expected: both browser contracts print `PASS`, the console has no errors, and both JPEG reports show format `JPEG`, size `(1080, 1440)`, and no more than 296,960 bytes.

- [ ] **Step 3: Confirm legacy assets and unrelated work are untouched**

```powershell
git diff --exit-code HEAD~2 -- mms_img/mms_01_intro.png mms_img/mms_02_details.png output/mms-wide
git diff --check
git status --short
git log -4 --oneline --decorate
```

Expected: legacy PNGs and horizontal-output files have no diff in the two implementation commits; no whitespace errors appear; pre-existing unrelated changes remain outside the MMS commits.

- [ ] **Step 4: Remove only the generated lossless intermediates**

Resolve and verify the two exact targets before removal:

```powershell
$rawIntro = (Resolve-Path 'output\mms-sens\mms_01_intro_raw.png').Path
$rawDetails = (Resolve-Path 'output\mms-sens\mms_02_details_raw.png').Path
if ((Split-Path $rawIntro -Parent) -ne (Join-Path (Get-Location) 'output\mms-sens')) { throw 'Unexpected intro raw path' }
if ((Split-Path $rawDetails -Parent) -ne (Join-Path (Get-Location) 'output\mms-sens')) { throw 'Unexpected details raw path' }
Remove-Item -LiteralPath $rawIntro, $rawDetails
```

Expected: only the two generated raw PNGs are removed. The final JPEGs remain in `mms_img/`.

- [ ] **Step 5: Deliver the final assets**

Report the absolute links, exact dimensions, byte sizes, and selected JPEG qualities printed by the encoder for both files. State that actual Naver SENS upload/send was outside scope and recommend one test MMS with both file IDs before bulk delivery.
