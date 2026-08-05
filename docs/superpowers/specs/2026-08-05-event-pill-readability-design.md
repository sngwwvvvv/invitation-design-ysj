# Event Pill Readability Design

## Goal

Improve the readability of the intro section's date and time notice while preserving the production `<picture>` structure and its 360px, 480px, and 640px rendered image variants.

## Scope

- Keep the current intro composition, copy, background, logo, message, signature, and responsive image breakpoints.
- Change the event date from August 12 to August 19, 2026. August 19, 2026 is a Wednesday, so the exact notice is `2026년 8월 19일 (수) · 오전 10시 ~ 오후 9시`.
- Change only the event pill content, markup, and styling in `scripts/intro-section-stage.html`, plus generated assets, production alternative text, image dimensions, and focused validation where required.
- Regenerate all three intro PNG assets after changing the stage.
- Do not restore the old live intro implementation or replace the production `<picture>` with live HTML.

## Layout

Give the event pill and invitation message one shared content width at every render size:

| Render width | Shared content width |
| --- | ---: |
| 360px | 312px |
| 480px | 408px |
| 640px | 480px |

Center both elements within the intro stage. Their left and right edges must match, and the event pill's right edge must also match the invitation signature's right edge.

Represent the date, separator, and time as distinct inline elements so wrapping is intentional rather than browser-dependent. At 360px, hide the separator and render `2026년 8월 19일 (수)` above `오전 10시 ~ 오후 9시`. At 480px and 640px, keep `2026년 8월 19일 (수) · 오전 10시 ~ 오후 9시` on one line with the separator visible.

The event icon remains beside the notice and is vertically centered against either the two-line 360px copy or the one-line wider copy.

## Typography and Color

Increase the event pill font size by 1.5pt, equivalent to 2 CSS pixels at the browser's 96dpi CSS reference pixel:

| Render width | Current | New |
| --- | ---: | ---: |
| 360px | 13px | 15px |
| 480px | 14px | 16px |
| 640px | 14px | 16px |

Use a positive color treatment:

- background: `var(--platinum)`;
- text: `var(--navy)`, matching the main intro copy;
- icon: retain `var(--green)` as the accent;
- boundary: use a subtle navy-tinted border so the light pill remains distinct from the reflective intro background.

Keep the existing pill radius, vertical rhythm, and bottom spacing unless the larger 360px two-line content requires a small internal padding adjustment. Do not reduce the approved font sizes to resolve overflow.

## Rendering Flow

1. Modify the event markup and stage-only CSS in `scripts/intro-section-stage.html`.
2. Render `img/intro-section-360.png`, `img/intro-section-480.png`, and `img/intro-section-640.png` with the existing Playwright render script and 2x device scale factor.
3. Read the new PNG dimensions and update the intrinsic `height` values in `index.html` if any rendered height changed.
4. Update the production image alternative text and focused validator from August 12 to August 19 so their text matches the rendered notice.
5. Keep the existing production source-selection boundaries: 360 image through 419px, 480 image from 420px through 559px, and 640 image from 560px upward.

## Verification

Verify the stage and production output at 360px, 480px, and 640px:

- the event pill and invitation message have identical left and right bounds;
- the event pill and invitation signature share the same right bound;
- computed event font sizes are 15px, 16px, and 16px respectively;
- the 360px notice has exactly two intentional lines;
- the 480px and 640px notices each remain on one line;
- neither the event pill nor the document has horizontal overflow;
- background, text, icon, and border use the approved positive palette;
- all generated images are complete, undistorted, and selected at the existing breakpoints;
- existing downstream invitation content and account-copy behavior remain intact.

Run the focused responsive-intro validator and browser layout checks after regenerating the assets.

## Non-goals

- No event-content changes beyond moving the date from August 12 to August 19; the Wednesday label and event time remain as specified.
- No changes to the intro message, signature, logo, background treatment, or outer spacing.
- No changes to profile, directions, parking, or account sections.
- No return to a live production HTML intro.
- No new production breakpoints or image filenames.
