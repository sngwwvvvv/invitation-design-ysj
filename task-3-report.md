# Task 3 Report — Fix Round 1

## Status

BLOCKED — the local validator contract is aligned with the real UTF-8 Korean draft and now isolates exactly one genuine failure, but Superdesign CLI 0.9.0 rejected both the documented `-p` invocation and the one allowed retry using `--prompt` before generation with `Must provide 1-4 prompts`. The remote draft remained at version 1, so no replacement generation occurred and the final validator remains `15 PASS`, `1 FAIL`.

## Draft

- Draft title: `호연회계법인 공식 초청장`
- Draft ID: `3098fb65-2a1d-4482-befb-f7e7cf88c2bd`
- Canvas URL: https://superdesign.dev/teams/fc757b9e-b5fe-4fa7-b86a-cb422c0d6772/projects/f01b42fd-67b3-410d-ab73-e875e40af1a0
- Preview URL: https://p.superdesign.dev/draft/3098fb65-2a1d-4482-befb-f7e7cf88c2bd
- Current version after the rejected replace calls: `1`
- Accepted replace-generation count in this round: `0`

## Root-cause evidence

Baseline command:

```powershell
node scripts/validate-invitation-draft.mjs 3098fb65-2a1d-4482-befb-f7e7cf88c2bd
```

Baseline output (exit code `1`):

```text
FAIL keeps the approved main heading
PASS declares the five approved colors
PASS removes the former palette
PASS uses one unified intro section
PASS uses the reflection background at 40 percent opacity
PASS uses the horizontal logo without image filters
PASS removes the date and place label
PASS uses a dedicated event details block
PASS removes the celebration heading
FAIL shows the chosen account copy message
FAIL shows the inline account information
PASS removes modal behavior
FAIL exposes the account copy button
FAIL copies only the digits-only account number
FAIL provides copy success and failure feedback
FAIL preserves map and profile content
```

Read-only draft probe:

```powershell
$design = npx --yes @superdesign/cli@latest get-design --draft-id 3098fb65-2a1d-4482-befb-f7e7cf88c2bd --json | ConvertFrom-Json
$html = [string]$design.htmlContent
$plain = $html -replace '(?i)<br\b[^>]*>', ' ' -replace '<[^>]+>', '' -replace '\s+', ' '
Write-Output "Korean heading in raw HTML: $($html.Contains('호연회계법인에서의'))"
Write-Output "Normalized full heading: $($plain.Contains('호연회계법인에서의 새로운 출발을 알려드립니다'))"
Write-Output "Korean account label: $($plain.Contains('계좌정보 복사'))"
Write-Output "Variable clipboard call: $($html.Contains('navigator.clipboard.writeText(accountNumber)'))"
Write-Output "Literal clipboard call: $($html.Contains("navigator.clipboard.writeText('04908774202501')"))"
```

Output (exit code `0`):

```text
Korean heading in raw HTML: True
Normalized full heading: True
Korean account label: True
Variable clipboard call: True
Literal clipboard call: False
```

## Validator fix

`scripts/validate-invitation-draft.mjs` now:

- uses UTF-8 Korean contract literals;
- builds a normalized text view by converting `<br>` tags to spaces, removing remaining tags, normalizing non-breaking spaces, and collapsing whitespace;
- uses normalized text only for visible phrase checks while retaining raw-HTML checks for IDs, `aria-live`, colors, images, modal behavior, and JavaScript source;
- requires the exact source literal `navigator.clipboard.writeText('04908774202501')`.

Post-fix red-state command:

```powershell
node scripts/validate-invitation-draft.mjs 3098fb65-2a1d-4482-befb-f7e7cf88c2bd
```

Output (exit code `1`; the intended single localized failure):

```text
PASS keeps the approved main heading
PASS declares the five approved colors
PASS removes the former palette
PASS uses one unified intro section
PASS uses the reflection background at 40 percent opacity
PASS uses the horizontal logo without image filters
PASS removes the date and place label
PASS uses a dedicated event details block
PASS removes the celebration heading
PASS shows the chosen account copy message
PASS shows the inline account information
PASS removes modal behavior
PASS exposes the account copy button
FAIL copies only the digits-only account number
PASS provides copy success and failure feedback
PASS preserves map and profile content
```

## Replace-iteration evidence

The replacement prompt was restricted to one source-code correction: literal `navigator.clipboard.writeText('04908774202501')`, with the current Deep Navy `copy-account-number` button, `계좌정보 복사` label, `aria-live="polite"` region, and exact success/failure messages frozen.

First documented-form invocation:

```powershell
npx --yes @superdesign/cli@latest iterate-design-draft --draft-id 3098fb65-2a1d-4482-befb-f7e7cf88c2bd -p $iterationPrompt --mode replace --user-request $userRequest --context-file .superdesign/design-system.md
```

Output (exit code `1`, before generation):

```text
✗ Must provide 1-4 prompts
```

One allowed retry using the long-form flag:

```powershell
npx --yes @superdesign/cli@latest iterate-design-draft --draft-id 3098fb65-2a1d-4482-befb-f7e7cf88c2bd --prompt "$iterationPrompt" --mode replace --user-request "$userRequest" --context-file .superdesign/design-system.md
```

Output (exit code `1`, before generation):

```text
✗ Must provide 1-4 prompts
```

Installed CLI help still advertises both forms:

```powershell
npx --yes @superdesign/cli@latest iterate-design-draft --help
```

Relevant output (exit code `0`):

```text
Usage: superdesign iterate-design-draft [options]
  -p, --prompt <prompt...>   Iteration prompt(s). Use multiple -p for specific
                             prompts per variation.
  --mode <mode>              Iteration mode (replace or branch)
```

## Remote-state verification

Command:

```powershell
$design = npx --yes @superdesign/cli@latest get-design --draft-id 3098fb65-2a1d-4482-befb-f7e7cf88c2bd --json | ConvertFrom-Json
$html = [string]$design.htmlContent
Write-Output "Draft ID: $($design.draftId)"
Write-Output "Current version: $($design.currentVersion)"
Write-Output "Variable clipboard call: $($html.Contains('navigator.clipboard.writeText(accountNumber)'))"
Write-Output "Literal clipboard call: $($html.Contains("navigator.clipboard.writeText('04908774202501')"))"
```

Output (exit code `0`):

```text
Draft ID: 3098fb65-2a1d-4482-befb-f7e7cf88c2bd
Current version: 1
Variable clipboard call: True
Literal clipboard call: False
```

## Concerns

- Superdesign CLI 0.9.0 rejected a prompt that was present in both the documented short and long option forms. Per the Superdesign workflow, no third mutation retry was attempted after the one allowed retry failed.
- The validator is now trustworthy for the confirmed Korean/HTML-normalization root cause, but the remote draft still violates the literal clipboard-call contract.
- No branch was created and no remote draft version changed during this fix round.
