# Directions and Account Padding Reduction

## Goal

Reduce only the vertical padding of `.content-section.directions` and `.account-section` by exactly 10%, while preserving the profile section and all horizontal padding.

## Design

- Keep the shared `.content-section, .account-section` padding declarations unchanged.
- Add targeted vertical padding overrides for `.directions` and `.account-section`.
- Use `50.4px` for top and bottom padding at the default width, which is 90% of `56px`.
- Use `39.6px` for top and bottom padding at widths up to `480px`, which is 90% of `44px`.
- Preserve horizontal padding at `40px` by default and `24px` at widths up to `480px`.
- Do not change `.profile-section`, HTML, content, colors, typography, or interactive behavior.

## Verification

- Run the existing local invitation validation script.
- Confirm the stylesheet contains the targeted desktop and mobile overrides.
- Confirm no unrelated source files are changed by this implementation.
