Status: complete

Changed files:
- `index.html` — semantic, single-page Korean opening invitation with local assets, map link, and inline account-number copy feedback.
- `styles.css` — mobile-first 640px shell, approved palette, accessible touch targets, and section/card layout.

Commands and results:
- `node scripts/validate-invitation-local.mjs index.html styles.css` before implementation: failed with `ENOENT` because `index.html` did not exist (expected RED baseline).
- `node scripts/validate-invitation-local.mjs index.html styles.css` after implementation: all 12 local contract checks passed.
- `git diff --check`: passed with no whitespace errors.

Implementation commit: `742993c9e5700d98fe03ea2c222a9ce0daa3f641` (`feat: build mobile-first opening invitation`).

Remaining risks:
- Event date/time and parking details remain intentionally provisional content and should be confirmed before publication.
