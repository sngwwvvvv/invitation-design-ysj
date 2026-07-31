# Invitation Parking Notice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the parking placeholder with the approved two-line notice and add a second, new-tab Naver Map link that opens nearby parking results around the event venue.

**Architecture:** Keep the static HTML/CSS page and its existing directions section. Strengthen the local validation contract first, then replace only the parking placeholder and add focused styles inside the existing navy parking panel. Verify the semantic link contract and responsive geometry without adding JavaScript, a map API, or an iframe.

**Tech Stack:** Static HTML, CSS, Node.js validation script, local HTTP server, browser/Playwright inspection.

## Global Constraints

- Display exactly `❗ 본 건물에는 주차가 불가합니다.` followed by `죄송하지만 인근 유료주차장 이용을 부탁드립니다.`.
- Label the new link `인근 주차장 확인하기`.
- Use `https://map.naver.com/p/search/%EC%A3%BC%EC%B0%A8%EC%9E%A5?c=3zkOlZ%2C2AJB2L%2C15.00%2C0%2C0%2C0%2Cdh` as the new link destination.
- Open both Naver Map links in a new tab with `target="_blank"` and `rel="noopener"`.
- Keep exactly two `https://` external anchor elements in `index.html`.
- Preserve the existing venue map link, address, transit guidance, static map, content order, and five-color palette.
- Use an `<a>` element for the new navigation; do not add `window.open()`, other JavaScript, a map API, an iframe, or location permission.
- Keep the new control at least 44px high with a visible keyboard focus style.

---

## File Structure

- Modify `scripts/validate-invitation-local.mjs`: define the approved parking URL, inspect external anchor tags, and enforce the parking copy/link/style contract.
- Modify `index.html`: replace the single parking placeholder paragraph with the approved parking container and link.
- Modify `styles.css`: add the parking copy hierarchy, 44px link control, and focus style using existing palette variables.
- Create `output/playwright/invitation-parking-notice-360.png`: narrow-screen visual evidence.
- Create `output/playwright/invitation-parking-notice-640.png`: canonical-width visual evidence.

### Task 1: Implement and verify the approved parking notice

**Files:**
- Modify: `scripts/validate-invitation-local.mjs:9-45`
- Modify: `index.html:50-52`
- Modify: `styles.css:81-94`
- Create: `output/playwright/invitation-parking-notice-360.png`
- Create: `output/playwright/invitation-parking-notice-640.png`

**Interfaces:**
- Consumes: existing `.directions`, `.map-link`, `.parking-notice`, palette variables, and `node scripts/validate-invitation-local.mjs index.html styles.css` contract runner.
- Produces: `.parking-warning`, `.parking-detail`, and `.parking-link` elements; exactly two secure new-tab Naver Map anchors; responsive screenshot evidence.

- [ ] **Step 1: Add the failing parking contract**

After `const all = ...` in `scripts/validate-invitation-local.mjs`, add:

```js
const parkingSearchUrl = "https://map.naver.com/p/search/%EC%A3%BC%EC%B0%A8%EC%9E%A5?c=3zkOlZ%2C2AJB2L%2C15.00%2C0%2C0%2C0%2Cdh";
const externalLinkTags = [...html.matchAll(/<a\b[^>]*>/gi)]
  .map(([tag]) => tag)
  .filter((tag) => /\bhref=["']https:\/\//i.test(tag));
const parkingLinkTag = externalLinkTags.find((tag) => tag.includes(`href="${parkingSearchUrl}"`)) ?? "";
```

Add these checks immediately before `valid event-details nesting`:

```js
[
  "approved parking notice",
  html.includes("❗ 본 건물에는 주차가 불가합니다.") &&
    html.includes("죄송하지만 인근 유료주차장 이용을 부탁드립니다.") &&
    !html.includes("[주차 안내가 확정되면 이곳에 표시됩니다]"),
],
[
  "exactly two secure external map links",
  externalLinkTags.length === 2 &&
    externalLinkTags.every((tag) => /\btarget=["']_blank["']/i.test(tag) && /\brel=["']noopener["']/i.test(tag)) &&
    parkingLinkTag.includes(`href="${parkingSearchUrl}"`) &&
    /<a\b[^>]*class=["'][^"']*\bparking-link\b[^"']*["'][^>]*>[\s\S]*?인근 주차장 확인하기[\s\S]*?<\/a>/i.test(html),
],
[
  "accessible parking link styling",
  /\.map-link\s*,\s*\.parking-link\s*,\s*#copy-account-number\s*\{[^}]*\bmin-height\s*:\s*44px/i.test(css) &&
    /\.parking-link\s*\{[^}]*\bbackground\s*:\s*var\(--platinum\)[^}]*\bcolor\s*:\s*var\(--navy\)/i.test(css) &&
    /\.parking-link:focus-visible\s*\{[^}]*\boutline\s*:/i.test(css),
],
```

- [ ] **Step 2: Run the contract and confirm the intended failure**

Run:

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
```

Expected: exit code `1`; `FAIL approved parking notice`, `FAIL exactly two secure external map links`, and `FAIL accessible parking link styling` appear. Existing unrelated checks remain `PASS`.

- [ ] **Step 3: Replace the parking placeholder with semantic HTML**

Replace the existing `<p class="parking-notice">...</p>` in `index.html` with:

```html
<div class="parking-notice">
  <p class="parking-warning"><strong>❗ 본 건물에는 주차가 불가합니다.</strong></p>
  <p class="parking-detail">죄송하지만 인근 유료주차장 이용을 부탁드립니다.</p>
  <a class="parking-link" href="https://map.naver.com/p/search/%EC%A3%BC%EC%B0%A8%EC%9E%A5?c=3zkOlZ%2C2AJB2L%2C15.00%2C0%2C0%2C0%2Cdh" target="_blank" rel="noopener">인근 주차장 확인하기</a>
</div>
```

Do not change the preceding `네이버 지도에서 확인하기` anchor.

- [ ] **Step 4: Add the minimal parking presentation and focus styles**

In `styles.css`, replace the existing shared control selector and parking notice rule, then add the child styles:

```css
.map-link, .parking-link, #copy-account-number { display: flex; min-height: 44px; align-items: center; justify-content: center; border-radius: 8px; font-size: 1.0625rem; font-weight: 700; }
.map-link { background: var(--green); color: var(--platinum); text-decoration: none; }
.parking-notice { margin: 18px 0 0; padding: 18px 14px; background: var(--navy); color: var(--platinum); text-align: center; }
.parking-warning, .parking-detail { margin: 0; }
.parking-warning { font-size: 1rem; }
.parking-detail { margin-top: 8px; font-size: .875rem; line-height: 1.6; }
.parking-link { margin-top: 14px; background: var(--platinum); color: var(--navy); text-decoration: none; }
```

Keep the current `.map-link:focus-visible` rule. Add this adjacent rule:

```css
.parking-link:focus-visible { outline: 3px solid var(--green); outline-offset: -3px; }
```

- [ ] **Step 5: Run the local contract and confirm green**

Run:

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
```

Expected: exit code `0`; every check prints `PASS`, including the three new parking checks.

- [ ] **Step 6: Start a local preview and capture both approved widths**

Start the project server:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

In another terminal, open the page and capture both viewports:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=parking-notice open http://127.0.0.1:4173/index.html
npx --yes --package @playwright/cli playwright-cli -s=parking-notice resize 360 900
npx --yes --package @playwright/cli playwright-cli -s=parking-notice eval '() => document.querySelector(`.parking-notice`).scrollIntoView({ block: `center` })'
npx --yes --package @playwright/cli playwright-cli -s=parking-notice screenshot --filename output/playwright/invitation-parking-notice-360.png
npx --yes --package @playwright/cli playwright-cli -s=parking-notice resize 640 900
npx --yes --package @playwright/cli playwright-cli -s=parking-notice eval '() => document.querySelector(`.parking-notice`).scrollIntoView({ block: `center` })'
npx --yes --package @playwright/cli playwright-cli -s=parking-notice screenshot --filename output/playwright/invitation-parking-notice-640.png
```

Expected: the `❗` warning, apology line, and complete button are visible without clipping or overlap.

- [ ] **Step 7: Verify browser geometry and the exact two-link contract**

At both widths, run:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=parking-notice eval '() => { const link = document.querySelector(`.parking-link`); const externalLinks = [...document.querySelectorAll(`a[href^="https://"]`)]; const box = link.getBoundingClientRect(); return { text: document.querySelector(`.parking-notice`).innerText, linkHeight: box.height, parkingHref: link.href, target: link.target, rel: link.rel, externalLinkCount: externalLinks.length, horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth }; }'
```

Expected at 360px and 640px:

```text
text includes both approved sentences and 인근 주차장 확인하기
linkHeight >= 44
parkingHref = the fixed parkingSearchUrl
target = _blank
rel = noopener
externalLinkCount = 2
horizontalOverflow = 0
```

- [ ] **Step 8: Run final regression checks**

Run:

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
git diff --check
git status --short
```

Expected: all validator lines are `PASS`, `git diff --check` reports no errors, and status contains only the intended HTML/CSS/validator changes plus the two parking screenshots. The pre-existing `.superpowers/brainstorm/` runtime directory remains untracked and is not staged.

- [ ] **Step 9: Commit the implementation and evidence**

```powershell
git add -- index.html styles.css scripts/validate-invitation-local.mjs output/playwright/invitation-parking-notice-360.png output/playwright/invitation-parking-notice-640.png
git commit -m "feat: add nearby parking notice link"
```
