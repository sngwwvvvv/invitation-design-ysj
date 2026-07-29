# Task 1 Report

## Outcome

Task 1 is complete. I added a remote-draft contract validator for the invitation draft and ran it against the approved current draft `09814ba2-f71a-4d01-a3be-9ae06580b185`.

## Files changed

- `scripts/validate-invitation-draft.mjs`
- `task-1-report.md`

## What the validator does

- Accepts a draft ID from `process.argv[2]`.
- Exits with code `2` and a usage message if no draft ID is supplied.
- Calls `npx --yes @superdesign/cli@latest get-design --draft-id <id> --json`.
- Reads `htmlContent` from the returned JSON.
- Prints one `PASS` or `FAIL` line per contract.
- Exits with code `0` only when every contract passes, otherwise exits with code `1`.

## RED validation result

Command run:

```powershell
node scripts/validate-invitation-draft.mjs 09814ba2-f71a-4d01-a3be-9ae06580b185
```

Result:

- Exit code: `1`
- The current draft failed multiple contracts, including the approved heading, palette, unified intro section, horizontal logo, event details block, account message, inline account details, copy button behavior, and preserved map/profile content.

## Notes

- I did not modify any unrelated files.
- I did not attempt Task 2 or later tasks.
- The validator is currently red on the current draft, which satisfies the requested proof step for Task 1.
