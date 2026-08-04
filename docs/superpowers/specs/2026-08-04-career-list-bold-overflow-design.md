# Career List Bold and Overflow Design

## Goal

Render `.career-list` at a bold `700` weight while ensuring neither the list nor any list item extends beyond the document's horizontal bounds at 360px, 480px, or 640px viewport widths.

## Scope

- Keep the current font sizes, spacing, content, and responsive profile layout.
- Change only the career area styles and the focused regression check needed for this behavior.
- Preserve the single-column profile at 480px and below and the two-column profile at 640px.

## Styling Approach

Set `.career-list` to `font-weight: 700`. Allow the career copy grid child to shrink within its grid track with `min-width: 0`, and give career list items a safe line-breaking fallback for unusually long content. This prevents bold text from forcing the two-column 640px layout wider without reducing type size or changing the profile composition.

## Verification

Add a browser-layout regression script that opens the real invitation at 360px, 480px, and 640px. At each viewport it will assert:

- the computed `.career-list` font weight is `700`;
- the document does not have horizontal overflow;
- the list and every list item stay within the viewport's horizontal bounds.

Run the existing local validation scripts as regression checks. Capture screenshots only if a browser assertion reveals a visual issue that needs diagnosis.

## Non-goals

- No changes to career text, portrait sizing, section spacing, or other typography.
- No viewport-specific font-size reductions.
- No change to the 640px two-column layout.
