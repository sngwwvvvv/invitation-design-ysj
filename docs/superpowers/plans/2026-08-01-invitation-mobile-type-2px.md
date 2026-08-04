# Invitation Mobile 2px Type Reduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce only the invitation body and career-list type by exactly 2px at widths below 640px.

**Architecture:** Retain the existing `@media (max-width: 639px)` block. Change the two type calculations to `calc(1rem)` and `calc(.9375rem)`, and make the Node contract assert those exact values.

**Tech Stack:** Static CSS and Node.js built-in filesystem checks.

## Global Constraints

- Preserve HTML, account-copy behavior, palette, layout spacing, and desktop styles.
- Apply the change only from 360px through 639px.
- Modify only `.invitation-message` and `.career-list`.

---

### Task 1: Verify and implement the 2px mobile type scale

**Files:**
- Modify: `scripts/verify-mobile-density.mjs:8-9`
- Modify: `styles.css:128-129`

**Interfaces:**
- Consumes: the `@media (max-width: 639px)` block in `styles.css`.
- Produces: verified 16px invitation body and 15px career-list text at 360px.

- [ ] **Step 1: Require the 2px values in the contract**

```js
["reduces invitation text by exactly 2px", /\.invitation-message\s*\{[^}]*font-size:\s*calc\(1rem\)/.test(mobileBlock?.[1] ?? "")],
["reduces career-list text by exactly 2px", /\.career-list\s*\{[^}]*font-size:\s*calc\(\.9375rem\)/.test(mobileBlock?.[1] ?? "")],
```

- [ ] **Step 2: Run the contract and confirm failure before CSS changes**

Run: `node scripts/verify-mobile-density.mjs styles.css`

Expected: exit `1` because the CSS still uses `+ .5px`.

- [ ] **Step 3: Make the two CSS declarations match the contract**

```css
.invitation-message { font-size: calc(1rem); }
.career-list { font-size: calc(.9375rem); }
```

- [ ] **Step 4: Verify contract, JavaScript syntax, and 360px computed styles**

Run: `node scripts/verify-mobile-density.mjs styles.css; node --check scripts/verify-mobile-density.mjs`

Expected: both commands exit `0`; 360px computed values are `16px` and `15px` with no horizontal overflow.
