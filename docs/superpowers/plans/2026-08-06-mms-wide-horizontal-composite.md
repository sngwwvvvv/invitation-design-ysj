# MMS Wide Horizontal Composite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render `mms_design.html`'s details content at 971px without distortion, align it with the 971px-high intro panel, and produce a 1942×1641px horizontal PNG.

**Architecture:** Keep the existing 640px MMS HTML and four source MMS assets unchanged. Add a focused Playwright renderer that injects a 971px export-only layout, captures the details section, then uses Pillow for deterministic resizing and compositing.

**Tech Stack:** HTML/CSS, Playwright CLI wrapper, Node.js, Python Pillow, PNG.

## Global Constraints

- Existing 640px `mms_design.html` output remains unchanged.
- Preserve all Korean copy, colors, source images, and aspect ratios.
- Do not horizontally stretch or crop content.
- Final intro and details panels are exactly 971×1641px; final composite is exactly 1942×1641px.
- Save new outputs beside the existing assets using versioned names.

---

### Task 1: Add the wide details renderer

**Files:**
- Create: `scripts/render-mms-wide-horizontal.playwright.js`
- Test: `scripts/verify-mms-wide-horizontal.playwright.js`

**Interfaces:**
- Renderer consumes `mms_design.html` and existing `img/*` assets.
- Renderer produces `output/mms-wide/mms_02_details_wide.png` and a JSON geometry report.

- [ ] **Step 1: Write the geometry contract test**

  Assert that the renderer reports a details clip width of 971px, a positive natural height, and no horizontal overflow after the wide CSS override. Assert every image has completed loading before capture.

- [ ] **Step 2: Run the contract test to confirm the new renderer is absent**

  Run: `node scripts/verify-mms-wide-horizontal.playwright.js`

  Expected: FAIL because the wide renderer and its geometry report do not exist.

- [ ] **Step 3: Implement the export-only renderer**

  Open `mms_design.html` at a 971px viewport, inject an override scoped to the export page that sets `.invitation-shell { width: 971px; max-width: 971px; }`, preserves image `aspect-ratio: auto`, widens section padding to 64px, and keeps the profile grid and cards within the shell. Wait for `document.fonts.ready` and all image decodes. Capture `#mms-details` to `output/mms-wide/mms_02_details_wide.png` and write its measured `{width,height,scrollWidth}` to `output/mms-wide/mms_02_details_wide.json`.

- [ ] **Step 4: Run the renderer and inspect the measured height**

  Run the Playwright wrapper with the new script. Expected: a 971px-wide details capture with no overflow; record the natural height for the compositing step.

- [ ] **Step 5: Adjust only export spacing to reach 1641px**

  If the natural details height differs from 1641px, tune export-only section padding/gaps or constrain only decorative whitespace; do not crop, overlap, change font sizes, or change image aspect ratios. Re-run until the details capture is exactly 971×1641px.

- [ ] **Step 6: Run the contract test to verify the renderer**

  Run: `node scripts/verify-mms-wide-horizontal.playwright.js`

  Expected: PASS with `{ width: 971, height: 1641, scrollWidth: 971 }` and zero image-load errors.

- [ ] **Step 7: Commit the renderer and contract**

  Run: `git add scripts/render-mms-wide-horizontal.playwright.js scripts/verify-mms-wide-horizontal.playwright.js output/mms-wide/mms_02_details_wide.json && git commit -m "feat: render wide MMS details panel"`

### Task 2: Compose and visually verify the final PNG

**Files:**
- Create: `scripts/compose-mms-wide-horizontal.py`
- Create: `mms_img/mms_intro_details_horizontal_v3.png`
- Test: `scripts/verify-mms-wide-composite.py`

**Interfaces:**
- Composer consumes `mms_img/mms_01_intro.png` and `output/mms-wide/mms_02_details_wide.png`.
- Composer produces `mms_img/mms_intro_details_horizontal_v3.png` with exact dimensions.

- [ ] **Step 1: Write the composite dimension test**

  Assert both panel sizes are `(971, 1641)`, the composite size is `(1942, 1641)`, and the output is RGB/RGBA PNG.

- [ ] **Step 2: Run the test before composition**

  Run: `python scripts/verify-mms-wide-composite.py`

  Expected: FAIL because the v3 output does not exist.

- [ ] **Step 3: Implement deterministic composition**

  Resize only the intro image proportionally to `(971, 1641)` with Pillow `Image.Resampling.LANCZOS`; paste it and the already-rendered details panel side by side with no gap; save a PNG without overwriting v2.

- [ ] **Step 4: Run the dimension test**

  Run: `python scripts/verify-mms-wide-composite.py`

  Expected: PASS with exact dimensions and a readable PNG mode.

- [ ] **Step 5: View the final PNG and inspect content**

  Open `mms_img/mms_intro_details_horizontal_v3.png` and confirm equal panel widths, no blank seam, no clipping, no overlap, preserved Korean text, undistorted portrait/map, and an exact bottom edge.

- [ ] **Step 6: Commit the final artifact and verification scripts**

  Run: `git add scripts/compose-mms-wide-horizontal.py scripts/verify-mms-wide-composite.py mms_img/mms_intro_details_horizontal_v3.png && git commit -m "feat: create wide MMS horizontal composite"`

### Task 3: Final verification and handoff

**Files:**
- Verify: `mms_design.html`, `mms_img/mms_01_intro.png`, `mms_img/mms_02_details.png`, `mms_img/mms_intro_details_horizontal_v3.png`

- [ ] **Step 1: Verify source files are unchanged**

  Run: `git diff HEAD~2 -- mms_design.html mms_img/mms_01_intro.png mms_img/mms_02_details.png` and confirm no source replacement occurred.

- [ ] **Step 2: Run both verification commands**

  Run: `node scripts/verify-mms-wide-horizontal.playwright.js; python scripts/verify-mms-wide-composite.py`

  Expected: both commands PASS.

- [ ] **Step 3: Report the final absolute file path and dimensions**

  Deliver the v3 PNG link and state `1942×1641px`.
