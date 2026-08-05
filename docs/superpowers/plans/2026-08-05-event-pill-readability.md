# Event Pill Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Regenerate the responsive intro images with a wider, larger, positive-color event pill and the updated August 19 event date without changing the production `<picture>` architecture.

**Architecture:** Keep `scripts/intro-section-stage.html` as the editable HTML/CSS source and keep `index.html` as a responsive image consumer. Add one Playwright CLI layout contract, update the stage, render all three 2x PNGs, and then derive production intrinsic dimensions from the generated PNG headers.

**Tech Stack:** Static HTML/CSS, Node.js, Playwright CLI with Microsoft Edge, PNG assets, Git.

## Global Constraints

- The exact event notice is `2026년 8월 19일 (수) · 오전 10시 ~ 오후 9시`.
- The event time remains `오전 10시 ~ 오후 9시`.
- Keep the production intro as one responsive `<picture>` using the existing 419px and 559px source boundaries.
- Keep the existing image filenames: `img/intro-section-360.png`, `img/intro-section-480.png`, and `img/intro-section-640.png`.
- Keep the 2x raster widths at 720px, 960px, and 1280px.
- Match event-pill and invitation-message widths at 312px, 408px, and 480px for the 360px, 480px, and 640px stages.
- Use event-pill font sizes of 15px, 16px, and 16px for the 360px, 480px, and 640px stages.
- Render two intentional event-copy lines only at 360px; keep one line at 480px and 640px.
- Use `var(--platinum)` for the event background, `var(--navy)` for event text, and `var(--green)` for the icon.
- Do not change the intro message, signature, logo, reflection background, downstream sections, production breakpoints, or image filenames.

---

## File Structure

- Create `scripts/verify-event-pill-layout.playwright.js`: browser-layout contract run by Playwright CLI against all three stage widths.
- Modify `scripts/intro-section-stage.html`: single editable source for event content, semantic event spans, shared content widths, responsive line layout, typography, and positive colors.
- Modify `scripts/validate-responsive-intro-images.mjs`: production metadata contract updated from August 12 to August 19 while preserving PNG and breakpoint validation.
- Modify `img/intro-section-360.png`: regenerated 720px-wide 2x image containing the two-line event notice.
- Modify `img/intro-section-480.png`: regenerated 960px-wide 2x image containing the one-line event notice.
- Modify `img/intro-section-640.png`: regenerated 1280px-wide 2x image containing the one-line event notice.
- Modify `index.html`: production image alternative text and intrinsic heights generated from the new PNG headers.
- Read without modification `scripts/render-intro-images.playwright.js`: existing renderer that captures the three stage widths at 2x.
- Read without modification `scripts/intro-render.config.json`: existing Edge and `deviceScaleFactor: 2` configuration.

### Task 1: Encode the Event-Pill Layout Contract

**Files:**
- Create: `scripts/verify-event-pill-layout.playwright.js`
- Test: `scripts/verify-event-pill-layout.playwright.js`
- Read: `scripts/intro-section-stage.html`

**Interfaces:**
- Consumes: an open Playwright page whose base URL is `scripts/intro-section-stage.html` served over HTTP.
- Produces: a Playwright CLI function that checks all three stage widths, prints one `PASS` or `FAIL` line per width, and throws when any contract fails.

- [ ] **Step 1: Write the failing browser-layout contract**

Create `scripts/verify-event-pill-layout.playwright.js` with this complete function:

```js
async (page) => {
  const base = page.url().split("?")[0];
  const contracts = {
    360: { contentWidth: 312, fontSize: "15px", lineCount: 2, separatorVisible: false },
    480: { contentWidth: 408, fontSize: "16px", lineCount: 1, separatorVisible: true },
    640: { contentWidth: 480, fontSize: "16px", lineCount: 1, separatorVisible: true },
  };
  let failed = false;

  for (const [widthText, contract] of Object.entries(contracts)) {
    const width = Number(widthText);
    await page.goto(`${base}?width=${widthText}`, { waitUntil: "load" });

    const result = await page.locator("#intro-stage").evaluate((stage, expected) => {
      const pill = stage.querySelector(".event-pill");
      const message = stage.querySelector(".invitation-message");
      const signature = stage.querySelector(".invitation-signature");
      const copy = stage.querySelector(".event-copy");
      const icon = stage.querySelector(".event-icon");
      const date = stage.querySelector(".event-date");
      const separator = stage.querySelector(".event-separator");
      const time = stage.querySelector(".event-time");

      if (![pill, message, signature, copy, icon, date, separator, time].every(Boolean)) {
        return { markup: false };
      }

      const pillRect = pill.getBoundingClientRect();
      const messageRect = message.getBoundingClientRect();
      const signatureRect = signature.getBoundingClientRect();
      const dateRect = date.getBoundingClientRect();
      const timeRect = time.getBoundingClientRect();
      const pillStyle = getComputedStyle(pill);
      const iconStyle = getComputedStyle(icon);
      const separatorStyle = getComputedStyle(separator);
      const close = (left, right) => Math.abs(left - right) <= 0.5;
      const lineCount = close(dateRect.top, timeRect.top) ? 1 : 2;

      return {
        markup: true,
        contentWidth: pillRect.width,
        edgesMatchMessage: close(pillRect.left, messageRect.left) && close(pillRect.right, messageRect.right),
        rightMatchesSignature: close(pillRect.right, signatureRect.right),
        fontSize: pillStyle.fontSize,
        lineCount,
        separatorVisible: separatorStyle.display !== "none",
        date: date.textContent.trim(),
        time: time.textContent.trim(),
        backgroundColor: pillStyle.backgroundColor,
        color: pillStyle.color,
        iconColor: iconStyle.color,
        borderWidth: pillStyle.borderTopWidth,
        borderStyle: pillStyle.borderTopStyle,
        stageFits: stage.scrollWidth <= stage.clientWidth,
        pillFits: pill.scrollWidth <= pill.clientWidth,
        expected,
      };
    }, contract);

    const passed = result.markup
      && Math.abs(result.contentWidth - contract.contentWidth) <= 0.5
      && result.edgesMatchMessage
      && result.rightMatchesSignature
      && result.fontSize === contract.fontSize
      && result.lineCount === contract.lineCount
      && result.separatorVisible === contract.separatorVisible
      && result.date === "2026년 8월 19일 (수)"
      && result.time === "오전 10시 ~ 오후 9시"
      && result.backgroundColor === "rgb(240, 244, 248)"
      && result.color === "rgb(10, 45, 84)"
      && result.iconColor === "rgb(67, 166, 78)"
      && result.borderWidth === "1px"
      && result.borderStyle === "solid"
      && result.stageFits
      && result.pillFits;

    console.log(`${passed ? "PASS" : "FAIL"} ${width}px ${JSON.stringify(result)}`);
    failed ||= !passed;
  }

  if (failed) throw new Error("Event-pill layout contract failed.");
}
```

- [ ] **Step 2: Run the new contract and verify RED**

Run from the worktree root:

```powershell
$eventPillServer = Start-Process -FilePath python -ArgumentList '-m','http.server','8765','--bind','127.0.0.1' -WorkingDirectory (Get-Location).Path -WindowStyle Hidden -PassThru
$redObserved = $false
try {
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-red open 'http://127.0.0.1:8765/scripts/intro-section-stage.html?width=640' --browser msedge
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-red snapshot
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-red run-code --filename scripts/verify-event-pill-layout.playwright.js
  $redObserved = $LASTEXITCODE -ne 0
} finally {
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-red close
  if (-not $eventPillServer.HasExited) { Stop-Process -Id $eventPillServer.Id }
}
if (-not $redObserved) { throw 'Expected the event-pill contract to fail before implementation.' }
```

Expected: exit code is nonzero. Each width reports `FAIL` because the old stage lacks `.event-copy`, `.event-date`, `.event-separator`, and `.event-time` and still uses the old date, old font sizes, intrinsic pill width, and negative color palette.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add -- scripts/verify-event-pill-layout.playwright.js
git commit -m "test: define event pill layout contract"
```

### Task 2: Implement the Responsive Event Pill Source

**Files:**
- Modify: `scripts/intro-section-stage.html:8-34`
- Modify: `scripts/intro-section-stage.html:40-82`
- Test: `scripts/verify-event-pill-layout.playwright.js`

**Interfaces:**
- Consumes: the exact selectors and values asserted by `verify-event-pill-layout.playwright.js`.
- Produces: three deterministic stage variants with shared event/message bounds, updated date content, approved typography and colors, and intentional responsive line layout.

- [ ] **Step 1: Replace the event-pill base CSS**

Replace the existing `.event-pill` and `.event-icon` rules with:

```css
.event-pill {
  display:flex;
  width:var(--intro-copy-width);
  align-items:center;
  justify-content:center;
  gap:6px;
  margin:0 auto 26px;
  padding:8px 12px;
  border:1px solid rgba(10,45,84,.16);
  border-radius:999px;
  background:var(--platinum);
  color:var(--navy);
  font-weight:700;
  letter-spacing:-.03em;
  line-height:1.4;
}
.event-copy { display:inline-flex; align-items:center; justify-content:center; white-space:nowrap; }
.event-separator { margin:0 .18em; }
.event-icon { color:var(--green); }
```

- [ ] **Step 2: Share the approved content widths and apply responsive typography**

Replace the stage-width rules for the event pill and invitation message with these exact declarations while preserving the existing stage padding, title sizes, and invitation-message font sizes:

```css
#intro-stage[data-width="360"] { --intro-copy-width:312px; width:360px; padding:56px 24px 64px; }
#intro-stage[data-width="360"] .intro-title { font-size:24px; }
#intro-stage[data-width="360"] .event-pill { font-size:15px; }
#intro-stage[data-width="360"] .event-copy { flex-direction:column; }
#intro-stage[data-width="360"] .event-separator { display:none; }
#intro-stage[data-width="360"] .invitation-message { font-size:16px; }
#intro-stage[data-width="480"] { --intro-copy-width:408px; width:480px; padding:64px 36px 70px; }
#intro-stage[data-width="480"] .intro-title { font-size:28px; }
#intro-stage[data-width="480"] .event-pill { font-size:16px; }
#intro-stage[data-width="480"] .invitation-message { font-size:17px; }
#intro-stage[data-width="640"] { --intro-copy-width:480px; width:640px; padding:72px 48px 76px; }
#intro-stage[data-width="640"] .intro-title { font-size:32px; }
#intro-stage[data-width="640"] .event-pill { font-size:16px; }
#intro-stage[data-width="640"] .invitation-message { font-size:18px; }
.invitation-message { width:var(--intro-copy-width); margin:0 auto; color:var(--navy); font-weight:700; letter-spacing:-.01em; line-height:2; text-align:left; text-shadow:0 1px 0 rgba(240,244,248,.5); }
```

Keep only one `.invitation-message` base rule after the edit; do not leave the old `width` declarations in the per-width rules.

- [ ] **Step 3: Replace all three event-pill instances with structured updated copy**

In each of `#copy-360`, `#copy-480`, and `#copy-640`, replace the current one-line event pill with this exact markup:

```html
<div class="event-pill">
  <span aria-hidden="true" class="event-icon">▣</span>
  <span class="event-copy"><span class="event-date">2026년 8월 19일 (수)</span><span aria-hidden="true" class="event-separator"> · </span><span class="event-time">오전 10시 ~ 오후 9시</span></span>
</div>
```

- [ ] **Step 4: Run the focused contract and verify GREEN**

```powershell
$eventPillServer = Start-Process -FilePath python -ArgumentList '-m','http.server','8765','--bind','127.0.0.1' -WorkingDirectory (Get-Location).Path -WindowStyle Hidden -PassThru
try {
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-green open 'http://127.0.0.1:8765/scripts/intro-section-stage.html?width=640' --browser msedge
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-green snapshot
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-green run-code --filename scripts/verify-event-pill-layout.playwright.js
  if ($LASTEXITCODE -ne 0) { throw 'Event-pill layout contract failed after implementation.' }
} finally {
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-green close
  if (-not $eventPillServer.HasExited) { Stop-Process -Id $eventPillServer.Id }
}
```

Expected: the three widths print `PASS`. Reported widths are 312, 408, and 480; fonts are 15px, 16px, and 16px; line counts are 2, 1, and 1; every overflow and edge-alignment boolean is true.

- [ ] **Step 5: Run static regression checks**

```powershell
node scripts/validate-responsive-intro-images.mjs
git diff --check
```

Expected: the existing responsive-intro validator still passes before production metadata changes, and `git diff --check` prints nothing.

- [ ] **Step 6: Commit the editable source implementation**

```powershell
git add -- scripts/intro-section-stage.html
git commit -m "feat: improve event pill source layout"
```

### Task 3: Regenerate Images and Integrate the Updated Date

**Files:**
- Modify: `scripts/validate-responsive-intro-images.mjs:28-32`
- Modify: `scripts/validate-responsive-intro-images.mjs:57`
- Modify: `img/intro-section-360.png`
- Modify: `img/intro-section-480.png`
- Modify: `img/intro-section-640.png`
- Modify: `index.html:12-16`
- Read: `scripts/render-intro-images.playwright.js`
- Read: `scripts/intro-render.config.json`

**Interfaces:**
- Consumes: the verified stage from Task 2 and the existing three-width Playwright renderer.
- Produces: three current 2x PNGs plus production `<picture>` metadata whose alt text and intrinsic dimensions match those assets.

- [ ] **Step 1: Update the production metadata contract and verify RED**

In `pictureMarkup()` and the `provides concise image alt text` check, replace:

```text
2026년 8월 12일
```

with:

```text
2026년 8월 19일
```

Then run:

```powershell
node scripts/validate-responsive-intro-images.mjs
```

Expected: exit code `1` with `FAIL provides concise image alt text` because `index.html` still describes August 12.

- [ ] **Step 2: Render the three replacement PNGs at 2x**

Run the existing renderer through the approved configuration:

```powershell
$eventPillServer = Start-Process -FilePath python -ArgumentList '-m','http.server','8765','--bind','127.0.0.1' -WorkingDirectory (Get-Location).Path -WindowStyle Hidden -PassThru
try {
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-render open 'http://127.0.0.1:8765/scripts/intro-section-stage.html?width=640' --config scripts/intro-render.config.json
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-render snapshot
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-render run-code --filename scripts/render-intro-images.playwright.js
  if ($LASTEXITCODE -ne 0) { throw 'Responsive intro image rendering failed.' }
} finally {
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-render close
  if (-not $eventPillServer.HasExited) { Stop-Process -Id $eventPillServer.Id }
}
```

Expected: all three PNG files are replaced without navigation, image-load, or screenshot errors.

- [ ] **Step 3: Verify PNG headers before production integration**

```powershell
node scripts/validate-responsive-intro-images.mjs
```

Expected at this intermediate point: `PASS has all three valid PNG assets`, `PASS uses 2x raster widths`, and `PASS uses portrait intro images`. The alt-text and intrinsic-dimension checks may still fail because `index.html` has not yet been regenerated.

- [ ] **Step 4: Regenerate the exact production `<picture>` markup**

Run:

```powershell
node scripts/validate-responsive-intro-images.mjs --print-markup
```

Replace the complete current `#intro-section` in `index.html` with that exact printed section. The generated output reads each PNG header, so do not hand-enter any height. Confirm that the printed `<img>` alt text contains `2026년 8월 19일`.

- [ ] **Step 5: Verify the production static contract is GREEN**

```powershell
node scripts/validate-responsive-intro-images.mjs
git diff --check
```

Expected: all responsive-intro checks print `PASS`, including matching intrinsic dimensions and the August 19 alt text; `git diff --check` prints nothing.

- [ ] **Step 6: Inspect all three generated images**

Open these files with the local image viewer:

```text
img/intro-section-360.png
img/intro-section-480.png
img/intro-section-640.png
```

Expected: 360px shows the date above the time inside the full-width light pill; 480px and 640px show one event line; all show August 19, dark navy text, green icon, subtle border, matching message edges, and no clipping, blank seams, or distortion.

- [ ] **Step 7: Commit generated assets and production integration**

```powershell
git add -- scripts/validate-responsive-intro-images.mjs index.html img/intro-section-360.png img/intro-section-480.png img/intro-section-640.png
git commit -m "feat: render readable August 19 event notice"
```

### Task 4: Verify Production Breakpoints and Regressions

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `img/intro-section-360.png`
- Verify: `img/intro-section-480.png`
- Verify: `img/intro-section-640.png`
- Test: `scripts/verify-event-pill-layout.playwright.js`
- Test: `scripts/validate-responsive-intro-images.mjs`

**Interfaces:**
- Consumes: the committed stage, PNGs, validator, and production markup from Tasks 1-3.
- Produces: final browser evidence for source selection, overflow, rendering health, date metadata, and downstream preservation.

- [ ] **Step 1: Re-run the static contract**

```powershell
node scripts/validate-responsive-intro-images.mjs
```

Expected: every static responsive-intro check reports `PASS`.

- [ ] **Step 2: Run the stage contract and all six production boundary checks**

Run this complete block so the temporary server is always stopped:

```powershell
$eventPillServer = Start-Process -FilePath python -ArgumentList '-m','http.server','8765','--bind','127.0.0.1' -WorkingDirectory (Get-Location).Path -WindowStyle Hidden -PassThru
try {
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final open 'http://127.0.0.1:8765/scripts/intro-section-stage.html?width=640' --browser msedge
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final snapshot
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final run-code --filename scripts/verify-event-pill-layout.playwright.js
  if ($LASTEXITCODE -ne 0) { throw 'Final stage layout contract failed.' }

  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final goto 'http://127.0.0.1:8765/index.html'
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final snapshot

  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final resize 360 900
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final eval "() => { const image = document.querySelector('.intro-section-image'); return { source: new URL(image.currentSrc).pathname.split('/').pop(), naturalWidth: image.naturalWidth, complete: image.complete, alt: image.alt, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth }; }"
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final resize 419 900
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final eval "() => { const image = document.querySelector('.intro-section-image'); return { source: new URL(image.currentSrc).pathname.split('/').pop(), naturalWidth: image.naturalWidth, complete: image.complete, alt: image.alt, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth }; }"
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final resize 420 900
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final eval "() => { const image = document.querySelector('.intro-section-image'); return { source: new URL(image.currentSrc).pathname.split('/').pop(), naturalWidth: image.naturalWidth, complete: image.complete, alt: image.alt, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth }; }"
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final resize 559 900
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final eval "() => { const image = document.querySelector('.intro-section-image'); return { source: new URL(image.currentSrc).pathname.split('/').pop(), naturalWidth: image.naturalWidth, complete: image.complete, alt: image.alt, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth }; }"
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final resize 560 900
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final eval "() => { const image = document.querySelector('.intro-section-image'); return { source: new URL(image.currentSrc).pathname.split('/').pop(), naturalWidth: image.naturalWidth, complete: image.complete, alt: image.alt, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth }; }"
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final resize 640 900
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final eval "() => { const image = document.querySelector('.intro-section-image'); return { source: new URL(image.currentSrc).pathname.split('/').pop(), naturalWidth: image.naturalWidth, complete: image.complete, alt: image.alt, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth }; }"

  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final console error
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final eval "() => ({ profile: !!document.querySelector('.profile-section'), directions: !!document.querySelector('.directions'), account: !!document.querySelector('.account-section'), copyButton: !!document.querySelector('#copy-account-number'), accountNumber: document.querySelector('.account-info')?.textContent })"
} finally {
  npx --yes --package @playwright/cli playwright-cli -s=event-pill-final close
  if (-not $eventPillServer.HasExited) { Stop-Process -Id $eventPillServer.Id }
}
```

Expected mappings:

| Viewport | Source | Natural width |
| --- | --- | ---: |
| 360px | `intro-section-360.png` | 720 |
| 419px | `intro-section-360.png` | 720 |
| 420px | `intro-section-480.png` | 960 |
| 559px | `intro-section-480.png` | 960 |
| 560px | `intro-section-640.png` | 1280 |
| 640px | `intro-section-640.png` | 1280 |

At every width, `complete` is true, `alt` contains `2026년 8월 19일`, and `documentWidth` equals `viewportWidth`. The console has no errors; all four downstream booleans are true; `accountNumber` still includes `049-087742-02-501`. The `finally` block closes the named browser and exact server process.

- [ ] **Step 3: Review final scope and repository state**

```powershell
node scripts/validate-responsive-intro-images.mjs
git diff --check
git log --oneline -5
git status --short
```

Expected: all validator lines pass, `git diff --check` prints nothing, the log contains the contract/source/assets commits, and the worktree is clean except for intentionally untracked Playwright CLI artifacts.

## Plan Self-Review

- Spec coverage: Task 1 encodes all requested geometry, type, line-count, date, palette, border, and overflow requirements; Task 2 updates only the editable stage; Task 3 regenerates all assets and derives production metadata; Task 4 verifies breakpoint selection and downstream preservation.
- Placeholder scan: the plan contains no unknown hand-entered dimensions. Task 3 derives every new intrinsic height directly from PNG headers through the existing `--print-markup` command.
- Interface consistency: `.event-copy`, `.event-date`, `.event-separator`, and `.event-time` are defined identically in Task 2 and consumed by Task 1; the three filenames and breakpoint mappings remain identical across rendering, integration, and final verification.
