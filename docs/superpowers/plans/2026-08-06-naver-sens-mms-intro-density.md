# Naver SENS MMS 01 Intro Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** Increase the visual size of every content element in `mms_img/mms_01_intro.jpg` while preserving the exact Naver SENS portrait canvas and safe horizontal margins.

**Architecture:** Keep the existing 1080px-only stage in `scripts/intro-section-stage.html` as the single source of layout truth. Add regression assertions to the existing Playwright layout contract, render only the intro raw PNG, encode only `mms_01_intro.jpg`, and reuse the existing dimension/size validators.

**Tech Stack:** HTML/CSS, Playwright CLI browser scripts, Node.js validation scripts, Pillow JPEG encoding, Git worktree.

## Global Constraints

- Final canvas remains exactly `1080 × 1440px`.
- Content width is `860px` with at least `110px` left and right safety margins.
- Target sizes: logo `340px`, title `52px`, event pill `26px`, body `25px`, signature `23px`.
- Preserve all existing copy, forced line breaks, background, and visual proportions.
- Do not modify 360/480/640 previews, `mms_02_details.jpg`, `index.html`, `styles.css`, legacy PNGs, or `output/mms-wide/`.
- Final JPEG remains `≤290KB`; no Naver SENS API send is performed.

---

### Task 1: Add the intro density regression contract

**Files:**
- Modify: `scripts/verify-mms-layout.playwright.js`

**Interfaces:**
- Consumes the existing `?width=1080` intro stage.
- Produces assertions for exact stage size, target CSS dimensions, safe margins, and no overflow.

- [ ] **Step 1: Write the failing assertions**

Add assertions for the 1080 stage: `--intro-copy-width` resolves to `860px`, the logo width is `340px`, title font size is `52px`, event font size is `26px`, body font size is `25px`, signature font size is `23px`, and the content bounding box is inside `x=110..970` without horizontal overflow.

- [ ] **Step 2: Run the browser contract to verify it fails**

Run: `node scripts/verify-mms-layout.playwright.js`

Expected: FAIL because the current stage still reports the old 760px/300px/46px/23px/22px/20px values.

- [ ] **Step 3: Commit the failing contract**

```bash
git add scripts/verify-mms-layout.playwright.js
git commit -m "test: lock denser intro layout targets"
```

### Task 2: Implement the approved 1080px-only CSS enlargement

**Files:**
- Modify: `scripts/intro-section-stage.html:39-53`

**Interfaces:**
- Keeps `#intro-stage[data-width="1080"]` at `1080 × 1440px`.
- Keeps all non-1080 preview variants unchanged.

- [ ] **Step 1: Update only the 1080px rules**

Set `--intro-copy-width: 860px`; retain `padding-inline: 110px`; set logo width to `340px`, title to `52px`, event pill to `26px`, body to `25px`, and signature to `23px`. Tighten only the 1080px vertical gaps/line-height as needed to keep the content group inside the canvas.

- [ ] **Step 2: Run the browser contract to verify it passes**

Run: `node scripts/verify-mms-layout.playwright.js`

Expected: PASS with no horizontal overflow, no vertical overflow, no unintended title/date wrapping, and all target dimensions present.

- [ ] **Step 3: Commit the layout change**

```bash
git add scripts/intro-section-stage.html
git commit -m "feat: enlarge Naver SENS intro content"
```

### Task 3: Re-render and replace only the intro JPEG

**Files:**
- Modify: `mms_img/mms_01_intro.jpg`
- Use: `scripts/render-mms-images.playwright.js`, `scripts/encode-mms-jpegs.py`

**Interfaces:**
- The renderer creates a temporary raw intro PNG at `output/mms-sens/mms_01_intro_raw.png`.
- The encoder replaces only `mms_img/mms_01_intro.jpg` and leaves details output unchanged.

- [ ] **Step 1: Render the new intro raw PNG**

Run: `node scripts/render-mms-images.playwright.js`

Expected: exit 0 and a fresh 1080×1440 raw intro PNG.

- [ ] **Step 2: Encode the intro JPEG**

Run: `python scripts/encode-mms-jpegs.py`

Expected: `mms_01_intro.jpg` is regenerated at 1080×1440 and ≤290KB; `mms_02_details.jpg` is byte-for-byte untouched by the working tree diff.

- [ ] **Step 3: Remove temporary raw PNGs**

Delete only the generated raw files under `output/mms-sens/` after visual inspection; do not remove the directory or unrelated ignored files.

- [ ] **Step 4: Commit the rendered asset**

```bash
git add mms_img/mms_01_intro.jpg
git commit -m "assets: tighten Naver SENS intro composition"
```

### Task 4: Verify output, regressions, and visual result

**Files:**
- Test: `scripts/validate-mms-design.mjs`
- Test: `scripts/verify-mms-layout.playwright.js`
- Test: `scripts/verify-mms-output.playwright.js`
- Test: `scripts/verify-mms-jpegs.py`

- [ ] **Step 1: Run all static and browser contracts**

```bash
node scripts/validate-mms-design.mjs
node scripts/verify-mms-layout.playwright.js
node scripts/verify-mms-output.playwright.js
python scripts/verify-mms-jpegs.py
```

Expected: all commands exit 0; both JPEGs remain 1080×1440 and ≤290KB.

- [ ] **Step 2: Verify untouched files and whitespace**

```bash
git diff --check
git diff --exit-code HEAD~1 -- mms_img/mms_02_details.jpg index.html styles.css output/mms-wide
```

Expected: no whitespace errors and no changes to unrelated assets/files.

- [ ] **Step 3: Inspect the final intro image**

Open `mms_img/mms_01_intro.jpg` and confirm larger logo/title/date/body/signature, reduced unused whitespace, no clipping, no overlap, and balanced top/bottom margins.

- [ ] **Step 4: Push the isolated branch only**

```bash
git push origin codex/naver-sens-mms-portrait
```

Expected: remote branch updates; do not merge into `main` and do not create a PR.
