# Static Parking List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Replace the `parking-notice` Naver parking-search link with a compact, static three-row parking list that remains self-contained in the HTML image export.

**Architecture:** Keep the existing directions section and venue Naver Map link unchanged. Replace only the parking notice contents with semantic static HTML: short warning copy, a two-column parking-name/one-hour-price list, and a price-change footnote. Add focused CSS inside the existing palette and use the current local validator plus Playwright screenshots for regression checks.

**Tech Stack:** Static HTML, CSS custom properties, Node.js validation scripts, Playwright CLI.

## Global Constraints

- Keep the existing venue `네이버 지도에서 확인하기` link.
- Remove the parking-only `인근 주차장 확인하기` link and its Naver search URL.
- Display only parking name and `1시간 요금` for three specified parking lots.
- Use the exact copy: `주차 안내`, `본 건물에는 주차가 불가합니다.`, `아래 인근 유료주차장을 이용해 주세요.`, and `※ 요금은 주차장 사정에 따라 변동될 수 있습니다.`
- Do not add JavaScript, map APIs, iframes, addresses, distance, hours, availability, or directions.
- Preserve 360px and 640px readability with no horizontal overflow or clipping.

---

### Task 1: Add failing parking-list contract checks

**Files:**
- Modify: `scripts/validate-invitation-local.mjs`

**Interfaces:**
- Consumes: `index.html` and `styles.css` loaded by the existing validator.
- Produces: explicit checks for the approved static parking copy/data and absence of the old parking link.

- [ ] **Step 1: Replace old parking-link expectations with the approved static contract**

Add checks for the exact title, two sentences, footnote, all three name/price pairs, no `parking-link` class, no `인근 주차장 확인하기`, and no old parking URL. Keep the existing venue-link check intact.

- [ ] **Step 2: Run the validator to verify the new contract fails**

Run: `node scripts/validate-invitation-local.mjs`

Expected: the new static parking checks fail against the current linked notice while unrelated existing checks retain their current results.

### Task 2: Replace parking notice HTML

**Files:**
- Modify: `index.html:48-52`

**Interfaces:**
- Consumes: the exact copy and three parking records from the design spec.
- Produces: a static `.parking-list` structure with semantic name/price pairs.

- [ ] **Step 1: Add the approved notice and semantic list**

Use a heading-level label, two short paragraphs, and a `<dl class="parking-list">` with three `<div>` rows. Each row contains a `<dt>` parking name and `<dd>` price:

```html
<div class="parking-notice">
  <h3>주차 안내</h3>
  <p class="parking-warning"><strong>본 건물에는 주차가 불가합니다.</strong></p>
  <p class="parking-detail">아래 인근 유료주차장을 이용해 주세요.</p>
  <dl class="parking-list" aria-label="인근 주차장 1시간 요금">
    <div><dt>투루파킹 삼성동빌딩점 주차장</dt><dd>5,000원</dd></div>
    <div><dt>투루파킹 삼성역WeWork 주차장</dt><dd>6,000원</dd></div>
    <div><dt>투루파킹 LG트윈텔2점 주차장</dt><dd>6,000원</dd></div>
  </dl>
  <p class="parking-footnote">※ 요금은 주차장 사정에 따라 변동될 수 있습니다.</p>
</div>
```

- [ ] **Step 2: Run the validator before CSS changes**

Run: `node scripts/validate-invitation-local.mjs`

Expected: content checks pass; the focused layout/style checks remain failing until Task 3.

### Task 3: Style the compact two-column list

**Files:**
- Modify: `styles.css` near the existing `.parking-notice` rules

**Interfaces:**
- Consumes: `.parking-notice`, `.parking-list`, `.parking-footnote` markup from Task 2 and existing palette variables.
- Produces: a readable static card at 360px and 640px without an interactive parking control.

- [ ] **Step 1: Replace obsolete parking-link rules with list rules**

Keep `.parking-notice` as a navy panel. Style its `h3` and copy for the compact hierarchy. Set `.parking-list` to zeroed margins, then make each row a two-column flex row with a 1px low-opacity platinum separator, consistent vertical padding, and `gap`. Let `dt` wrap and keep `dd` right-aligned with `white-space: nowrap`. Style `.parking-footnote` as smaller slate/platinum supporting text. Do not add shadows, gradients, icons, or new colors.

- [ ] **Step 2: Run the validator to verify the contract passes**

Run: `node scripts/validate-invitation-local.mjs`

Expected: exit code `0` and every check prints `PASS`.

### Task 4: Render and verify image-friendly layouts

**Files:**
- Create/update: `output/playwright/invitation-parking-list-360.png`, `output/playwright/invitation-parking-list-640.png`

- [ ] **Step 1: Start the local static server**

Run: `python -m http.server 4173`

- [ ] **Step 2: Capture the parking notice at both target widths**

Use the existing Playwright workflow to open `http://127.0.0.1:4173/index.html`, resize to `360x900` and `640x900`, scroll `.parking-notice` into view, and save the two screenshots above.

- [ ] **Step 3: Verify DOM geometry and copy**

Evaluate the page at both widths and confirm `.parking-notice` contains all four text groups, `.parking-link` count is `0`, the venue map link remains present, and `document.documentElement.scrollWidth - window.innerWidth` is `0`.

### Task 5: Run the full regression checks

**Files:**
- Test: `scripts/validate-invitation-local.mjs`, `scripts/validate-responsive-intro-images.mjs`, `scripts/verify-mobile-density.mjs`

- [ ] **Step 1: Run all local validators**

Run:

```powershell
node scripts/validate-invitation-local.mjs
node scripts/validate-responsive-intro-images.mjs
node scripts/verify-mobile-density.mjs
git diff --check
```

Expected: all commands exit `0`; no validator reports a failure; `git diff --check` prints no errors.

- [ ] **Step 2: Inspect the final diff**

Run: `git diff -- index.html styles.css scripts/validate-invitation-local.mjs`

Confirm only the parking notice markup, focused parking CSS, and corresponding validator assertions changed.

- [ ] **Step 3: Commit the implementation**

```powershell
git add -- index.html styles.css scripts/validate-invitation-local.mjs output/playwright/invitation-parking-list-360.png output/playwright/invitation-parking-list-640.png
git commit -m "feat: show static nearby parking list"
```

