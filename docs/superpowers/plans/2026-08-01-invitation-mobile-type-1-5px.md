# Invitation Mobile 1.5px Type Reduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce only the invitation body and career-list type by 1.5px at 360px through 639px so their narrow mobile line wrapping is less cramped.

**Architecture:** Keep the existing `@media (max-width: 639px)` boundary in `styles.css`. Change only its `.invitation-message` and `.career-list` font-size calculations, and update the small Node contract to assert those exact values.

**Tech Stack:** Static HTML/CSS; Node.js built-in `node:fs` verification script.

## Global Constraints

- Preserve the HTML structure, account-copy behavior, visual palette, and desktop styles.
- Apply the typography changes only from 360px through 639px.
- Modify only `.invitation-message` and `.career-list`; leave all other mobile text and spacing unchanged.
- The account number remains on one line at narrow widths.

---

### Task 1: Update the mobile typography contract and CSS override

**Files:**
- Modify: `scripts/verify-mobile-density.mjs:8-9`
- Modify: `styles.css:127-129`

**Interfaces:**
- Consumes: the final `@media (max-width: 639px)` block in `styles.css`.
- Produces: a contract that accepts `calc(1rem + .5px)` for `.invitation-message` and `calc(.9375rem + .5px)` for `.career-list`.

- [ ] **Step 1: Change the contract to require the new sizes**

```js
["reduces invitation text by exactly 1.5px", /\.invitation-message\s*\{[^}]*font-size:\s*calc\(1rem\s*\+\s*\.5px\)/.test(mobileBlock?.[1] ?? "")],
["reduces career-list text by exactly 1.5px", /\.career-list\s*\{[^}]*font-size:\s*calc\(\.9375rem\s*\+\s*\.5px\)/.test(mobileBlock?.[1] ?? "")],
```

- [ ] **Step 2: Run the contract and verify it fails**

Run: `node scripts/verify-mobile-density.mjs styles.css`

Expected: exit code `1`, with failures for both exact 1.5px typography checks because the CSS still contains `+ 1px`.

- [ ] **Step 3: Change only the two mobile CSS declarations**

```css
@media (max-width: 639px) {
  .invitation-message { font-size: calc(1rem + .5px); }
  .career-list { font-size: calc(.9375rem + .5px); }
}
```

- [ ] **Step 4: Run the contract and syntax check**

Run: `node scripts/verify-mobile-density.mjs styles.css; node --check scripts/verify-mobile-density.mjs`

Expected: both commands exit `0`.

- [ ] **Step 5: Run the local invitation validator and inspect mobile output**

Run: `node scripts/validate-invitation-local.mjs`

Expected: validator exits `0`; its 360px output has no horizontal overflow, and the invitation body and career list have the specified mobile sizes.

- [ ] **Step 6: Commit**

```bash
git add styles.css scripts/verify-mobile-density.mjs docs/superpowers/plans/2026-08-01-invitation-mobile-type-1-5px.md
git commit -m "fix: reduce mobile invitation type by 1.5px"
```
