# Parking Notice Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the two parking notice paragraphs with one concise paragraph and make parking-list names 1pt larger and bold.

**Architecture:** Keep the existing `.parking-notice` panel and parking list structure. Update only the parking notice markup, its obsolete selectors, the `dt` typography, and the local contract checks.

**Tech Stack:** Static HTML, CSS, Node.js validation scripts.

## Global Constraints

- Preserve the existing parking names, rates, footnote, map link, colors, and responsive layout.
- The replacement markup must be exactly `<p>주차장 안내(당건물 주차불가)</p>` with no added class.
- Use `calc(.9375rem + 1pt)` and `font-weight: 700` for `.parking-list dt`.
- Do not modify unrelated working-tree changes.

---

### Task 1: Update parking notice markup and styles

**Files:**
- Modify: `index.html` in the `.parking-notice` block
- Modify: `styles.css` in the parking notice/list rules

**Interfaces:**
- Consumes: Existing `.parking-notice`, `.parking-list`, and `.parking-footnote` markup.
- Produces: One unclassed parking summary paragraph and updated `dt` typography.

- [ ] Replace the two paragraphs with exactly:

```html
<p>주차장 안내(당건물 주차불가)</p>
```

- [ ] Remove `.parking-warning` and `.parking-detail` CSS rules, add `.parking-notice > p { margin: 0; }`, and change the `dt` rule to:

```css
.parking-list dt { min-width: 0; font-size: calc(.9375rem + 1pt); font-weight: 700; line-height: 1.45; }
```

- [ ] Confirm the existing list header, three rows, footnote, and map link remain byte-for-byte unchanged outside the targeted block.

### Task 2: Align local contract validation

**Files:**
- Modify: `scripts/validate-invitation-local.mjs` parking checks

**Interfaces:**
- Consumes: The new `index.html` and `styles.css` contracts from Task 1.
- Produces: Checks that reject the removed classes and enforce the new summary and `dt` styles.

- [ ] Replace old checks for the two removed Korean paragraphs and left-aligned warning/detail selectors with checks for the exact summary paragraph, zero occurrences of both removed class names, `.parking-notice > p` margin reset, and the `dt` size/weight declarations.
- [ ] Preserve checks for parking names/rates, column headers, secure venue map link, list layout, and notice panel styling.

### Task 3: Verify the change

**Files:**
- Test: `scripts/validate-invitation-local.mjs`
- Test: `scripts/verify-mobile-density.mjs`

- [ ] Run `node scripts/validate-invitation-local.mjs index.html styles.css` and confirm every check passes.
- [ ] Run `node scripts/verify-mobile-density.mjs index.html styles.css` and confirm every check passes.
- [ ] Run `git diff --check` and inspect `git diff` to verify only the requested files changed beyond the already committed plan/spec.
- [ ] Commit the implementation with `feat: simplify parking notice copy`.
