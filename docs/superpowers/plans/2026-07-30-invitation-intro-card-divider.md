# Invitation Intro Card and Section Divider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the intro read as an inset paper card and add a restrained faded navy divider between the profile and directions sections.

**Architecture:** Keep the existing static HTML unchanged and implement both visual changes in `styles.css`. The intro will use the section background plus two CSS pseudo-elements for an inset reflection card, edge highlight, inner shading, and exterior shadow; `.directions::before` will render the divider at the section boundary. Validation will use the existing local invitation script plus 640px and 360px browser renders.

**Tech Stack:** Semantic HTML5, vanilla CSS, existing Node.js validation script, Playwright CLI for visual inspection.

## Global Constraints

- Production scope: `styles.css` only; do not change `index.html`, source images, copy, profile layout, directions content, or account styling.
- Keep the existing platinum, navy, blue, green, and slate palette.
- Use a 4px intro frame inset and a 2px near-square frame radius.
- The desktop intro exterior shadow is `0 6px 18px rgba(10, 45, 84, .32)`; at widths up to 480px it is `0 4px 12px rgba(10, 45, 84, .28)`.
- Do not use a single global opacity on the composed intro pseudo-element; transparency belongs in individual gradient stops.
- The divider is one pixel high, fades from transparent at 0% to navy at 42% opacity by 20%, stays steady through 80%, and fades to transparent at 100%; it has no center ornament.
- Preserve the existing 40px content gutter and use 24px at the existing `max-width: 480px` breakpoint.

---

### Task 1: Capture a baseline and map the existing CSS layers

**Files:**
- Read: `styles.css` (`#intro-section`, `#intro-section::before`, `.intro-content`, `.content-section`, `.profile-section`, `.directions`, and the mobile media query)
- Read: `scripts/validate-invitation-local.mjs`
- Output: `output/playwright/baseline-640.png` and `output/playwright/baseline-360.png`

**Interfaces:**
- Consumes: current static page at `http://127.0.0.1:4173/`
- Produces: baseline screenshots and a recorded list of selectors/values to preserve while editing `styles.css`.

- [ ] **Step 1: Start the local static server**

Run from the repository root:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Keep the process running for the browser checks.

- [ ] **Step 2: Capture the 640px baseline**

Run:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=invitation-implementation open http://127.0.0.1:4173
npx --yes --package @playwright/cli playwright-cli -s=invitation-implementation resize 640 900
npx --yes --package @playwright/cli playwright-cli -s=invitation-implementation screenshot
```

Copy the resulting screenshot into `output/playwright/baseline-640.png` if the CLI writes it under `.playwright-cli`.

- [ ] **Step 3: Capture the 360px baseline**

Run:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=invitation-implementation resize 360 900
npx --yes --package @playwright/cli playwright-cli -s=invitation-implementation screenshot
```

Copy the resulting screenshot into `output/playwright/baseline-360.png`.

- [ ] **Step 4: Run the existing validation before editing**

Run:

```powershell
node scripts/validate-invitation-local.mjs
```

Expected: the repository's current validation completes successfully; record any pre-existing warning without changing unrelated files.

- [ ] **Step 5: Commit the baseline artifacts only if the repository tracks visual baselines**

If `output/playwright/` is already tracked, stage only the two baseline images and commit:

```powershell
git add output/playwright/baseline-640.png output/playwright/baseline-360.png
git commit -m "test: capture invitation visual baselines"
```

If that directory is ignored or untracked by project convention, keep the images local and do not force them into Git.

### Task 2: Implement the independent intro card frame

**Files:**
- Modify: `styles.css` at `#intro-section`, `#intro-section::before`, `.intro-content`, and the mobile `#intro-section` rule
- Test: 640px and 360px renders from Task 1

**Interfaces:**
- Consumes: existing `var(--platinum)`, `var(--slate)`, `var(--navy)`, and `img/reflection_background.png`.
- Produces: an inset card surface with a 4px matte around it, readable foreground content, and no horizontal overflow.

- [ ] **Step 1: Replace the full-bleed intro base with the outer matte**

Change the `#intro-section` background to `var(--slate)` while preserving `position: relative`, `overflow: hidden`, and all existing desktop padding values. Keep the mobile padding values unchanged except where the 4px frame needs a corresponding visual balance.

- [ ] **Step 2: Make the reflection pseudo-element fully composed instead of globally transparent**

Replace the existing `#intro-section::before` declaration with an inset layer using these required properties:

```css
#intro-section::before {
  position: absolute;
  inset: 4px;
  content: "";
  background:
    radial-gradient(circle at 50% 38%, rgba(240, 244, 248, .62) 0%, rgba(10, 45, 84, .10) 54%, rgba(10, 45, 84, .36) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, .18) 0%, rgba(10, 45, 84, .18) 100%),
    url("img/reflection_background.png") center / cover no-repeat;
  filter: contrast(1.12) saturate(.85);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .92),
    inset 0 -36px 60px rgba(10, 45, 84, .17),
    inset 12px 0 24px rgba(10, 45, 84, .06),
    0 6px 18px rgba(10, 45, 84, .32);
}
```

Do not add `opacity` to this composed layer.

- [ ] **Step 3: Add the inner border/highlight layer**

Add `#intro-section::after` immediately after the `::before` rule:

```css
#intro-section::after {
  position: absolute;
  inset: 4px;
  z-index: 1;
  border: 1px solid rgba(10, 45, 84, .14);
  content: "";
  pointer-events: none;
}
```

Raise `.intro-content` to `z-index: 2` so the content remains above both decorative layers.

- [ ] **Step 4: Add the mobile shadow override**

Inside the existing `@media (max-width: 480px)` block, override only the exterior shadow while retaining the same inset frame geometry:

```css
#intro-section::before {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .92),
    inset 0 -28px 48px rgba(10, 45, 84, .15),
    inset 8px 0 18px rgba(10, 45, 84, .05),
    0 4px 12px rgba(10, 45, 84, .28);
}
```

- [ ] **Step 5: Render and inspect the intro at both target widths**

Run the Playwright session at 640px and 360px, then inspect the screenshots. Expected: the intro is visibly inset like a paper card, the lower and side planes have depth, the heading and event pill remain legible, and no horizontal scrollbar appears.

- [ ] **Step 6: Run validation**

Run:

```powershell
node scripts/validate-invitation-local.mjs
```

Expected: PASS with no new errors.

- [ ] **Step 7: Commit the intro-only change**

```powershell
git add styles.css
git commit -m "feat: add independent intro card depth"
```

### Task 3: Implement the profile-to-directions divider

**Files:**
- Modify: `styles.css` at `.directions` and the existing mobile media query
- Test: full-page 640px and 360px renders

**Interfaces:**
- Consumes: existing `.profile-section` bottom padding, `.directions` top padding, `var(--navy)`, and the 40px/24px content gutters.
- Produces: a one-pixel faded navy boundary with no HTML changes or center ornament.

- [ ] **Step 1: Make `.directions` the divider positioning context**

Add `position: relative` to the existing `.directions` rule without changing its current background or text colors.

- [ ] **Step 2: Add the divider pseudo-element**

Add this rule immediately after `.directions`:

```css
.directions::before {
  position: absolute;
  top: 0;
  right: 40px;
  left: 40px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(10, 45, 84, .18) 8%,
    rgba(10, 45, 84, .42) 20%,
    rgba(10, 45, 84, .42) 80%,
    rgba(10, 45, 84, .18) 92%,
    transparent 100%
  );
  content: "";
}
```

Do not add `::after`, a diamond, an icon, or a label.

- [ ] **Step 3: Align the divider to the mobile gutter**

Inside the existing `@media (max-width: 480px)` block, add:

```css
.directions::before {
  right: 24px;
  left: 24px;
}
```

- [ ] **Step 4: Render and inspect the full page at both target widths**

Expected: the line sits at the boundary between the profile and directions sections, has equal breathing room from the surrounding content, is lighter than the navy profile heading, and does not introduce overflow.

- [ ] **Step 5: Run validation**

Run:

```powershell
node scripts/validate-invitation-local.mjs
```

Expected: PASS with no new errors.

- [ ] **Step 6: Commit the divider-only change**

```powershell
git add styles.css
git commit -m "feat: separate profile and directions sections"
```

### Task 4: Final visual and regression verification

**Files:**
- Read: `index.html`, `styles.css`, `scripts/validate-invitation-local.mjs`
- Verify: `output/playwright/final-640.png`, `output/playwright/final-360.png`

**Interfaces:**
- Consumes: the committed intro frame and divider CSS from Tasks 2 and 3.
- Produces: verified final screenshots and a clean validation result.

- [ ] **Step 1: Capture final screenshots**

Use the existing `invitation-implementation` Playwright session:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=invitation-implementation resize 640 900
npx --yes --package @playwright/cli playwright-cli -s=invitation-implementation screenshot
npx --yes --package @playwright/cli playwright-cli -s=invitation-implementation resize 360 900
npx --yes --package @playwright/cli playwright-cli -s=invitation-implementation screenshot
```

Save the two outputs under `output/playwright/final-640.png` and `output/playwright/final-360.png` when the project tracks visual artifacts.

- [ ] **Step 2: Check computed styles and overflow**

Run in the active browser session:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=invitation-implementation eval "() => ({ bodyScrollWidth: document.body.scrollWidth, viewportWidth: window.innerWidth, introBefore: getComputedStyle(document.querySelector('#intro-section'), '::before').boxShadow, divider: getComputedStyle(document.querySelector('.directions'), '::before').backgroundImage })"
```

Expected: `bodyScrollWidth` equals `viewportWidth` at both widths; `introBefore` includes the configured exterior shadow; `divider` is a horizontal linear gradient.

- [ ] **Step 3: Run the final local validator**

```powershell
node scripts/validate-invitation-local.mjs
```

Expected: PASS.

- [ ] **Step 4: Review the final diff**

```powershell
git diff HEAD~2..HEAD -- styles.css
git status --short
```

Confirm only the intended `styles.css` changes are present in the implementation commits; preserve unrelated user files and generated visual-review artifacts.
