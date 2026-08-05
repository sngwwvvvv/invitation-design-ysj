# MMS Invitation Image Rendering Design

## Goal

Create a print-only copy of the current invitation page and render it as two MMS images at 640 CSS pixels wide. The image heights follow the reflowed content rather than a fixed height.

## Source and outputs

- Copy the current `index.html` to `mms_design.html` so the live invitation URL remains unchanged.
- Keep using the repository's current `styles.css` and image assets.
- Replace the existing files below:
  - `mms_img/mms_01_intro.png`
  - `mms_img/mms_01_intro.jpg`
  - `mms_img/mms_02_details.png`
  - `mms_img/mms_02_details.jpg`

## MMS-only page changes

- Remove the Naver Map link element from the DOM.
- Remove the account-number copy button from the DOM.
- Remove the clipboard script because its target button no longer exists.
- Do not hide either control with CSS: hidden controls can preserve layout space or leave dead behavior.
- Do not add a placeholder, spacer, compensating padding, margin, or minimum height for either removed control.
- Add only narrowly scoped MMS-page spacing overrides when an adjacent element's existing margin would otherwise look like the removed control's empty slot. Those overrides collapse the residual gap; they do not recreate the control height.

## Capture boundaries

Render `mms_design.html` in a real Chromium browser with a 640-pixel viewport and wait for fonts and images to finish loading.

- Image 1 captures the natural bounding box of `#intro-section`.
- Image 2 starts at `.profile-section` and ends at the bottom of `.account-section`.
- Capture both boundaries after the controls are removed and the document has reflowed.
- Produce PNG directly from the browser and JPEG from the same geometry so each format has matching dimensions.

## Verification

Use a test-first workflow:

1. Add a validator that initially fails because `mms_design.html` does not exist.
2. Verify that the MMS page preserves the invitation's main sections while omitting `.map-link`, `#copy-account-number`, and clipboard behavior.
3. Verify that no MMS-only spacer or control-height compensation is present.
4. Render the four files and check that every image is 640 pixels wide, each PNG/JPEG pair has identical dimensions, and both heights equal the captured content bounds.
5. Inspect the final PNG files visually for clipping, blank control slots, and unexpected overflow.

## Scope

The work does not change `index.html`, redesign invitation content, force 1440-pixel heights, publish files, or commit unrelated existing workspace changes.
