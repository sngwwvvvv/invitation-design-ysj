# Invitation Platinum Directions and Account Design

## Goal

Replace the slate directions and account panels with a lighter platinum presentation while retaining the established green and navy action accents.

## Directions section

- Set `.directions` to `var(--platinum)` with navy body and heading text.
- Keep the green map link and navy parking notice unchanged as the primary and secondary accents.
- Preserve the current map, spacing, typography, and HTML structure.

## Account section

- Set `.account-section` and `.account-card` to `var(--platinum)`.
- Use navy for the message, account values, and copy-status text.
- Replace translucent light card borders and dividers with blue borders suitable for the light background.
- Keep the copy-account button navy with platinum text and its green focus-visible outline.

## Scope and validation

- Keep the intro depth treatment unchanged.
- Change `styles.css` only in production code; do not change HTML content or structure.
- Validate computed colors and contrast, then inspect full-page desktop and mobile screenshots.
