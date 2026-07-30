# Invitation Platinum Directions and Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the directions and account sections as light platinum panels while retaining their green and navy action accents.

**Architecture:** Keep the HTML and intro treatment unchanged. Update only the directions/account presentation rules in `styles.css`, then verify real browser-computed colors and full-page desktop/mobile rendering.

**Tech Stack:** HTML5, CSS custom properties, Node.js validation script, Playwright CLI.

## Global Constraints

- Set `.directions`, `.account-section`, and `.account-card` to `var(--platinum)`.
- Use navy for directions and account text.
- Keep `.map-link` green and `.parking-notice` plus `#copy-account-number` navy.
- Preserve existing layout, copy, HTML structure, intro depth treatment, and focus-visible styles.

---

### Task 1: Platinum directions and account presentation

**Files:**
- Modify: `styles.css`
- Modify: `scripts/validate-invitation-local.mjs`
- Test: browser-computed style assertions against the locally served `index.html`

**Interfaces:**
- Consumes: existing `--platinum`, `--navy`, `--blue`, and `--green` CSS custom properties.
- Produces: light section backgrounds with dark copy and unchanged action accents.

- [x] **Step 1: Run the browser assertions before implementation**

Open the local page and assert these literal computed values:

```js
const directions = getComputedStyle(document.querySelector('.directions'));
const directionsHeading = getComputedStyle(document.querySelector('.directions h2'));
const account = getComputedStyle(document.querySelector('.account-section'));
const card = getComputedStyle(document.querySelector('.account-card'));
const mapLink = getComputedStyle(document.querySelector('.map-link'));
const parking = getComputedStyle(document.querySelector('.parking-notice'));
const copyButton = getComputedStyle(document.querySelector('#copy-account-number'));
```

Expected before implementation: the directions/account/card backgrounds are `rgb(100, 116, 139)` instead of platinum, so the assertion fails for the intended reason.

- [x] **Step 2: Implement the minimal CSS**

Set the directions, account section, and account card backgrounds to platinum. Set directions heading/body, account message/value/status text to navy; use blue card/divider borders; retain the green map link and navy parking/copy controls.

- [x] **Step 3: Run project and computed-style verification**

Run:

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
```

Expected: all checks print `PASS` and exit 0. Browser assertions must report platinum `rgb(240, 244, 248)` backgrounds, navy `rgb(10, 45, 84)` text, green `rgb(67, 166, 78)` map link, and navy `rgb(10, 45, 84)` parking/copy controls.

Update the prior slate-panel validation contract to require platinum directions/account panels and navy directions heading text.

- [x] **Step 4: Inspect desktop and mobile rendering**

Use 1280×900 and 390×844 viewports to capture full-page `output/playwright/invitation-platinum-sections-desktop.png` and `output/playwright/invitation-platinum-sections-mobile.png`. Inspect section continuity, text contrast, card boundary, and action contrast.

- [x] **Step 5: Commit and push**

```powershell
git add -- styles.css scripts/validate-invitation-local.mjs docs/superpowers/plans/2026-07-30-invitation-platinum-directions-account.md output/playwright/invitation-platinum-sections-desktop.png output/playwright/invitation-platinum-sections-mobile.png
git commit -m "Restyle invitation sections in platinum"
git push origin main
```
