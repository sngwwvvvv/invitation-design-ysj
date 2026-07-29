# Task 4 Brief: Browser QA for Revised Invitation Draft

## Context

This task verifies the live Superdesign preview generated in Task 3.

- Draft ID: `3098fb65-2a1d-4482-befb-f7e7cf88c2bd`
- Preview URL: `https://p.superdesign.dev/draft/3098fb65-2a1d-4482-befb-f7e7cf88c2bd`

## Requirements

Use a real browser against the exact preview URL above.

1. Set the viewport to 390px wide, inspect the full mobile page, and take a full-page screenshot.
2. Verify on mobile:
   - `#intro-section` is one continuous section.
   - The horizontal logo is not recolored, filtered, cropped, or distorted.
   - Text is readable over the background image.
   - `#event-details` is visually distinct.
   - Profile text and image do not overlap.
   - The map stays uncropped.
   - Account card and copy button fit without horizontal overflow.
3. Set the viewport to 1280px wide, inspect the desktop page, and take a full-page screenshot.
4. Verify on desktop:
   - Invitation shell remains centered.
   - The shell does not stretch beyond roughly 640px.
   - There is no duplicated content, clipping, or excessive horizontal stretching.
5. Click the unique account copy button labeled `계좌정보 복사`.
6. Read the browser clipboard and assert the exact copied value is `04908774202501`.
7. Verify the visible live-region success message says `계좌번호가 복사되었습니다.`.
8. Verify the status region is associated with `aria-live="polite"`.
9. Check browser console output for the preview URL.

Expected: no JavaScript errors, asset-load failures, or clipboard-handler exceptions.

## Report Contract

Write `task-4-report.md` with:

- Status: `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`.
- Preview URL and draft ID.
- Mobile viewport evidence, including screenshot path or browser artifact reference.
- Desktop viewport evidence, including screenshot path or browser artifact reference.
- Clipboard result, exact copied value, and live-region result.
- Console check result.
- Any concerns or visual defects.

No git commit is required unless you create tracked evidence files that must be preserved.
