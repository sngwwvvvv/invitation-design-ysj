# Repository LF Normalization

## Goal

Keep every tracked text file byte-consistent between local checkouts, Git blobs, and GitHub Pages by standardizing line endings on LF.

## Design

- Add a root `.gitattributes` rule: `* text=auto eol=lf`.
- Normalize all currently tracked text files to LF in the local working tree.
- Leave binary files unchanged through Git's automatic text detection.
- Preserve the existing uncommitted `.superpowers/brainstorm` runtime state and untracked `cloudflared` artifacts; they are outside this change.
- Do not alter source semantics, CSS declarations, HTML structure, copy, or deployment behavior.

## Verification

- Confirm `.gitattributes` resolves tracked text files to `text: auto` and `eol: lf`.
- Confirm tracked text working-tree files report LF rather than CRLF or mixed endings.
- Confirm binary files remain classified as non-text.
- Run the existing mobile-density and padding contract checks.
- Compare the deployed Pages CSS with the repository CSS after push.
