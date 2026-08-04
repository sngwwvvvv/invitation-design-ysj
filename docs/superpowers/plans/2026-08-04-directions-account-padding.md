# Directions and Account Padding Reduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce only the vertical padding of the directions and account sections by exactly 10% at default and mobile widths.

**Architecture:** Preserve the existing shared section padding and add narrowly targeted top/bottom overrides for `.directions` and `.account-section`. Keep the current responsive breakpoint and horizontal padding unchanged so the profile section and content gutters do not move.

**Tech Stack:** Static HTML, CSS, Node.js local validation

## Global Constraints

- Default top and bottom padding must change from `56px` to `50.4px` only for `.directions` and `.account-section`.
- At widths up to `480px`, top and bottom padding must change from `44px` to `39.6px` only for `.directions` and `.account-section`.
- Horizontal padding must remain `40px` by default and `24px` at widths up to `480px`.
- `.profile-section`, HTML, content, colors, typography, and interactive behavior must remain unchanged.
- Preserve all pre-existing uncommitted workspace changes.

---

### Task 1: Targeted vertical padding overrides

**Files:**
- Modify: `styles.css:37-38,74-76`
- Test: existing `scripts/validate-invitation-local.mjs` plus an inline stylesheet contract check

**Interfaces:**
- Consumes: the existing `.content-section, .account-section { padding: 56px 40px; }` rule and `@media (max-width: 480px)` rule.
- Produces: targeted `.directions, .account-section` vertical padding values at default and mobile widths.

- [ ] **Step 1: Run the pre-implementation contract check and confirm it fails**

```powershell
@'
const fs = require('fs');
const css = fs.readFileSync('styles.css', 'utf8');
const desktop = /\.directions,\s*\.account-section\s*\{[^}]*padding-top:\s*50\.4px;[^}]*padding-bottom:\s*50\.4px;/s.test(css);
const mobile = /@media\s*\(max-width:\s*480px\)[\s\S]*?\.directions,\s*\.account-section\s*\{[^}]*padding-top:\s*39\.6px;[^}]*padding-bottom:\s*39\.6px;/s.test(css);
if (!desktop || !mobile) process.exit(1);
'@ | node -
```

Expected: exit code `1` because the targeted vertical overrides do not exist yet.

- [ ] **Step 2: Add the minimal default-width override**

Change the existing positioning rule to:

```css
.directions, .account-section {
  position: relative;
  padding-top: 50.4px;
  padding-bottom: 50.4px;
}
```

- [ ] **Step 3: Add the minimal mobile override**

Inside `@media (max-width: 480px)`, immediately after the shared section padding rule, add:

```css
.directions, .account-section {
  padding-top: 39.6px;
  padding-bottom: 39.6px;
}
```

- [ ] **Step 4: Run the contract check and confirm it passes**

Run the exact PowerShell/Node command from Step 1.

Expected: exit code `0`.

- [ ] **Step 5: Run the existing invitation validation**

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
```

Expected: all validation checks pass.

- [ ] **Step 6: Review the focused diff**

```powershell
git diff -- styles.css
```

Expected: within the current user-owned diff, this task adds only the two targeted vertical padding declarations at default width and the two targeted declarations inside the `480px` media query.
