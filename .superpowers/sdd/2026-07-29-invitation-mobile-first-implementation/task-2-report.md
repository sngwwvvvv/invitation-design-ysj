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

Review fix round:
- Restored the approved ten-item career history, exact venue and placeholder text, and the location-pin / decorative metro-icon accessibility treatment.
- Raised normal copy contrast to Deep Navy, increased career text to 1rem, and changed the focus outline to Standard Blue.
- Removed obsolete validator-only mojibake markup; the local validator continues to pass.
- Verification: `node scripts/validate-invitation-local.mjs index.html styles.css` (12/12 PASS); `git diff --check` (PASS).
- Fix commit: `978115e0fe3ce835b0a51c6d6261ac1c38a02a9a` (`fix: correct invitation review details`).

Review fix round 2:
- Updated the event date placeholder to `202X년 X월 X일(X) 오후 X시`.
- Verification: `node scripts/validate-invitation-local.mjs index.html styles.css` (12/12 PASS); `git diff --check` (PASS).
- Fix commit: `a37471a5c623c3712b2aa4e035eb368c776a0b1c` (`fix: align event date placeholder`).
