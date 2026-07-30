# Invitation Depth and Account Slate Design

## Goal

Give the intro background subtle visual depth and make the account section visually continuous with the slate directions section.

## Intro background

- Keep the existing `reflection_background.png` on `#intro-section::before`.
- Layer restrained radial and linear gradients over the image in the same pseudo-element.
- Keep the center softly illuminated while adding mild edge and lower-area shading.
- Preserve the current foreground stacking and text readability.

## Account section

- Set both `.account-section` and `.account-card` backgrounds to `var(--slate)`.
- Use white account copy and status text so normal-size text meets WCAG AA contrast against slate.
- Use a subtle translucent light border and divider so the card remains legible without introducing another solid background color.
- Keep the copy-account button navy for clear action contrast; add a platinum boundary and retain its green focus-visible outline.

## Scope and validation

- Change `styles.css` only; HTML structure and copy remain unchanged.
- Validate the existing local checks and inspect desktop and mobile rendering for depth, contrast, and section continuity.
