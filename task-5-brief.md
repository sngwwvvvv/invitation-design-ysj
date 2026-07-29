# Task 5 Brief: Final Verification and Handoff

## Context

This task verifies all previous outputs and records the final Superdesign draft handoff.

- Source draft ID: `09814ba2-f71a-4d01-a3be-9ae06580b185`
- Revised draft ID: `3098fb65-2a1d-4482-befb-f7e7cf88c2bd`
- Canvas URL: `https://superdesign.dev/teams/fc757b9e-b5fe-4fa7-b86a-cb422c0d6772/projects/f01b42fd-67b3-410d-ab73-e875e40af1a0`
- Preview URL: `https://p.superdesign.dev/draft/3098fb65-2a1d-4482-befb-f7e7cf88c2bd`

## Required Verification

Run or rely on fresh controller evidence for:

1. `node scripts/validate-invitation-draft.mjs 3098fb65-2a1d-4482-befb-f7e7cf88c2bd`
   - Expected: 16 PASS lines, exit 0.
2. `git diff --check`
   - Expected: no output, exit 0.
3. `git status --short`
   - Expected: only SDD scratch/evidence files remain untracked or modified, no unstaged tracked implementation changes.
4. `npx --yes @superdesign/cli@latest get-design --draft-id 3098fb65-2a1d-4482-befb-f7e7cf88c2bd --json`
   - Expected: `currentVersion` is `2`, title is non-empty, the current version prompt is the narrow clipboard literal fix, and the HTML contains the tested implementation.

Also include Task 4 QA evidence:

- Mobile screenshot: `C:\projects\invitation-design-ysj\output\playwright\task-4-mobile-390.png`
- Desktop screenshot: `C:\projects\invitation-design-ysj\output\playwright\task-4-desktop-1280.png`
- Clipboard result: `04908774202501`
- Live-region success text: `계좌번호가 복사되었습니다.`
- Console errors: none

## Report Contract

Write `task-5-report.md` with:

- Status: `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`.
- Final draft title, draft ID, canvas URL, and preview URL.
- Automated validator result.
- `git diff --check` result.
- `git status --short` summary identifying scratch/evidence files separately.
- Remote metadata summary.
- Mobile and desktop visual QA summary.
- Exact clipboard result.
- Any residual risk or suggested focused visual refinement.
