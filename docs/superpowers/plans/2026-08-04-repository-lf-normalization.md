# Repository LF Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make tracked text files use LF consistently in local checkouts, Git, and GitHub Pages.

**Architecture:** Add a root `.gitattributes` policy with `* text=auto eol=lf`, then rewrite only tracked text files whose working-tree bytes are CRLF or mixed. Binary assets and unrelated runtime artifacts remain untouched.

**Tech Stack:** Git attributes, PowerShell, Node.js verification scripts

## Global Constraints

- Use the exact policy `* text=auto eol=lf`.
- Normalize tracked text files to LF without changing semantic content.
- Leave binary files unchanged.
- Preserve `.superpowers/brainstorm` runtime state and untracked `cloudflared` artifacts.
- Preserve HTML, CSS, JavaScript, copy, and deployment behavior.

---

### Task 1: Add the repository line-ending policy

**Files:** Create `.gitattributes`.

- [ ] Confirm `.gitattributes` is absent.
- [ ] Create it with the single rule `* text=auto eol=lf`.
- [ ] Verify `git check-attr text eol -- styles.css index.html img/portrait_ysj.png` reports LF for text files and non-text for the PNG.

### Task 2: Normalize tracked text working files

**Files:** Modify only tracked text files currently reported by `git ls-files --eol` as `w/crlf` or `w/mixed`.

- [ ] Record the pre-normalization list with `git ls-files --eol | Select-String 'w/(crlf|mixed)'`.
- [ ] Rewrite those tracked text files as UTF-8 without BOM, replacing CRLF and bare CR with LF; exclude binary assets, `.superpowers/brainstorm` runtime changes, and untracked `cloudflared*` artifacts.
- [ ] Verify `git ls-files --eol` has no `w/crlf` or `w/mixed` entries.

### Task 3: Verify and publish

**Files:** Stage `.gitattributes` and only line-ending normalization changes.

- [ ] Run `node --check scripts/verify-mobile-density.mjs` and `node scripts/verify-mobile-density.mjs index.html styles.css`.
- [ ] Confirm `git diff --cached --check` is clean and excluded runtime artifacts are unstaged.
- [ ] Commit as `chore: normalize tracked text line endings` and push `main`.
- [ ] Compare repository and GitHub Pages CSS bytes after deployment.
