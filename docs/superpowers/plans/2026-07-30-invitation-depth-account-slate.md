# Invitation Depth and Account Slate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add subtle depth to the intro background and restyle the account section as a slate panel while retaining a navy copy button.

**Architecture:** Keep the HTML unchanged and implement the presentation entirely in `styles.css`. Verify the result through the existing static validation plus browser-computed styles and desktop/mobile screenshots.

**Tech Stack:** HTML5, CSS custom properties and layered gradients, Node.js validation script, Playwright CLI.

## Global Constraints

- Keep `reflection_background.png` on `#intro-section::before`.
- Use `var(--slate)` for both account backgrounds and white for account copy so normal text meets WCAG AA contrast.
- Keep `#copy-account-number` navy with a platinum boundary and its green focus-visible outline.
- Modify no production file other than `styles.css`.

---

### Task 1: Intro depth and slate account presentation

**Files:**
- Modify: `styles.css`
- Test: browser-computed style assertions against the locally served `index.html`

**Interfaces:**
- Consumes: existing `--slate`, `--platinum`, and `--navy` CSS custom properties.
- Produces: layered pseudo-element background and computed account-section colors.

- [x] **Step 1: Run browser assertions before the change**

Serve the repository locally, open it with Playwright, and evaluate the following literal expectations:

```js
const intro = getComputedStyle(document.querySelector('#intro-section'), '::before').backgroundImage;
const account = getComputedStyle(document.querySelector('.account-section'));
const card = getComputedStyle(document.querySelector('.account-card'));
const button = getComputedStyle(document.querySelector('#copy-account-number'));
({
  introHasRadialGradient: intro.includes('radial-gradient'),
  introHasLinearGradient: intro.includes('linear-gradient'),
  sectionBackground: account.backgroundColor,
  cardBackground: card.backgroundColor,
  sectionText: account.color,
  buttonBackground: button.backgroundColor
})
```

Expected before implementation: gradient checks are `false`, the account backgrounds are `rgb(240, 244, 248)`, and the account text is not platinum.

- [x] **Step 2: Implement the minimal CSS**

Change `styles.css` so `#intro-section::before` layers a restrained radial highlight and linear edge/lower shading over the current image. Set `.account-section` and `.account-card` to slate, set account text/status to white, and use translucent light borders while leaving the button declaration navy with a platinum boundary.

- [x] **Step 3: Run project and browser checks**

Run:

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
```

Expected: every line begins with `PASS` and the process exits 0.

Repeat the computed-style evaluation. Expected: both gradient checks are `true`; section and card backgrounds are `rgb(100, 116, 139)`; section text is `rgb(255, 255, 255)` with at least 4.5:1 contrast; button background remains `rgb(10, 45, 84)` with a platinum boundary above 3:1 contrast.

- [x] **Step 4: Inspect desktop and mobile rendering**

Use 1280×900 and 390×844 viewports to capture full-page `output/playwright/invitation-depth-account-desktop.png` and `output/playwright/invitation-depth-account-mobile.png`. Inspect both for natural intro shading, readable account content, uninterrupted slate continuity, and a distinct navy copy button.

- [x] **Step 5: Commit and push**

```powershell
git add -- styles.css docs/superpowers/plans/2026-07-30-invitation-depth-account-slate.md output/playwright/invitation-depth-account-desktop.png output/playwright/invitation-depth-account-mobile.png
git commit -m "Refine invitation depth and account section"
git push origin main
```
