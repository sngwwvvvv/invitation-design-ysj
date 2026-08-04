# Invitation Mobile Typography and Account Density Design

## Scope

Adjust only `styles.css`. Preserve the existing HTML structure, account-copy behavior, visual palette, and desktop styles.

## Mobile typography

At viewport widths below 640px, reduce the computed font size of the invitation body (`.invitation-message`, including `.invitation-copy`) and `.career-list` by exactly 1.5px from their current desktop declarations. Retain the existing 480px-specific layout rules; the 640px type rule applies consistently throughout the requested 360px to 639px range.

## Account card density

Keep the notice, account details, copy button, and live status inside `.account-card`. At widths below 640px, reduce its visual height by approximately 35 to 45% through compact spacing and type only:

- Card padding: `14px 16px`.
- Notice and account-detail type: reduce by roughly 2px while retaining legibility.
- Divider and list spacing: reduce `dl` margins, top padding, and row padding to about half their current values.
- Copy button: retain its full width and behavior; reduce minimum height to `36px` and reduce its type scale.
- Copy status: reserve no height while empty; show a compact status line after a successful copy.

Desktop styles remain unchanged. The account number continues to stay on one line on narrow screens.

## Verification

Run the existing local validator. Inspect CSS computed styles at 360px and 640px to confirm the mobile breakpoint, exact 1.5px typography reduction, compact account-card height, visible copy feedback, and no horizontal overflow.
