# Invitation Mobile Type and Account Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce invitation and career-list type by 1px below 640px and compact the account card by roughly 35 to 45% while retaining account-copy behavior.

**Architecture:** Add a single `max-width: 639px` CSS override block. Its rules supersede the existing 480px typography declarations when both match, without modifying desktop declarations or HTML.

**Tech Stack:** HTML5, CSS media queries, Node.js contract check.

## Global Constraints

- Preserve HTML structure, clipboard behavior, palette, and desktop styles.
- Apply the responsive changes only from 360px through 639px.
- Keep the account number on one line at narrow widths.

---

### Task 1: Implement and verify mobile density

**Files:**
- Modify: `styles.css`
- Create: `scripts/verify-mobile-density.mjs`

**Interfaces:**
- Consumes: Existing CSS selectors for invitation content, career list, account card, copy button, and status text.
- Produces: Mobile-only CSS overrides; a Node.js check verifies that the required responsive rules are present.

- [x] **Step 1: Write and run the failing mobile-density contract**

Run: `node scripts/verify-mobile-density.mjs styles.css`

Observed: Exit code 1 because no 639px media-query override existed.

- [x] **Step 2: Add the minimal CSS overrides**

Add a `@media (max-width: 639px)` block with `calc(1rem + 1px)` for `.invitation-message`, `calc(.9375rem + 1px)` for `.career-list`, compact card and detail spacing, a 36px copy button, and `#copy-status:empty { display: none; }`.

- [x] **Step 3: Run verification**

Run: `node scripts/verify-mobile-density.mjs styles.css` and `node --check scripts/verify-mobile-density.mjs`

Observed: Both commands exit 0.
