# Invitation Intro Card and Section Divider Design

## Goal

Increase the intro section's visible depth so it resembles the supplied paper-card reference, and clearly separate the profile and directions sections without changing the invitation's restrained platinum, navy, blue, green, and slate visual language.

## Approved visual direction

- Use the selected **C: independent card frame** treatment for the intro.
- Use the revised **B: faded navy line** between `.profile-section` and `.directions`.
- Remove the proposed center diamond from the divider.
- Keep all production changes in `styles.css`; do not add decorative HTML or alter invitation copy.

## Intro card frame

### Layer structure

- Keep `#intro-section` as the positioning and clipping container.
- Set its base background to `var(--slate)` as the narrow outer matte visible around the framed intro.
- Inset `#intro-section::before` by 4px from all four edges so the reflection artwork reads as a separate card rather than a full-bleed section.
- Keep `.intro-content` above all decorative layers and preserve its current centered layout.
- Use `#intro-section::after` only for the edge highlight and inset shading required to complete the frame; it must not intercept pointer events.

### Depth treatment

- Remove the single global `opacity: .38` from `#intro-section::before`. It currently weakens the reflection image and both gradient layers together, flattening their tonal range.
- Control transparency inside each gradient color stop instead, leaving the composed pseudo-element fully opaque.
- Retain `img/reflection_background.png`, with mildly increased contrast and restrained saturation so its geometric planes remain visible without competing with the text.
- Add a one-pixel light top/left edge, a one-pixel translucent navy inner border, stronger lower/side inset shading, and a `0 6px 18px rgba(10, 45, 84, .32)` exterior shadow.
- Use a 2px radius so the frame remains nearly square, matching the supplied reference rather than introducing a rounded app-card style.
- The resulting effect should be deliberately stronger than the current treatment but still use soft shadow edges; no hard black shadow or glossy highlight is allowed.

### Readability

- Preserve the existing navy foreground copy and slate event pill.
- Ensure background geometry and shadows do not reduce the contrast or legibility of the logo, heading, event details, or invitation message.
- Keep the decorative layers `aria`-neutral because they are CSS pseudo-elements.

## Profile-to-directions divider

- Render the divider with `.directions::before`, positioned at the boundary between `.profile-section` and `.directions`.
- Use a one-pixel horizontal `linear-gradient`: transparent at 0%, rising to navy at 42% opacity by 20%, remaining steady through 80%, then fading symmetrically to transparent at 100%.
- Do not include a diamond, icon, label, or other centered ornament.
- Align the divider with the content gutters: 40px on wider layouts and 24px at the existing mobile breakpoint.
- Preserve the current profile bottom padding and directions top padding so the line has balanced breathing room above and below.
- Keep the divider visually lighter than the full-width navy profile heading and the navy parking notice.

## Responsive behavior

- At desktop/tablet widths, keep the intro frame inset and divider aligned with the 40px content gutter.
- At widths up to 480px, retain the same 4px frame inset, reduce only the exterior shadow to `0 4px 12px rgba(10, 45, 84, .28)`, and align the divider to the 24px content gutter.
- The intro must remain free of horizontal overflow at 360px and 640px viewport widths.

## Scope and validation

- Production scope: `styles.css` only.
- Do not change `index.html`, source images, copy, profile layout, directions content, or account styling.
- Run the existing local invitation validation script.
- Render and inspect the full invitation at 640px and 360px widths.
- Confirm visually that the intro reads as an inset paper card, the text remains clear, and the divider separates the two platinum sections without looking decorative or heavy.
- Confirm computed styles for the intro pseudo-elements and divider, and check that no new horizontal overflow is introduced.
