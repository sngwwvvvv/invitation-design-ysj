# GitHub Pages Automatic Deployment Design

## Goal

Publish the repository's static invitation site to a stable GitHub Pages URL whenever changes are pushed to `main`.

## Delivery path

GitHub Actions runs on each push to `main` and on manual dispatch. It checks out the repository, uploads the repository root as a Pages artifact while excluding repository metadata and local-only folders, then deploys the artifact through the official GitHub Pages actions.

The published URL is expected to be `https://sngwwvvvv.github.io/invitation-design-ysj/`. The existing Cloudflare quick tunnel remains an unrelated local-preview tool and is not used for published delivery.

## Workflow constraints

- Add one workflow: `.github/workflows/deploy-pages.yml`.
- Use `actions/checkout`, `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.
- Grant only `pages: write`, `id-token: write`, and repository read permissions required for deployment.
- Trigger only from `main` pushes and `workflow_dispatch`.
- Publish `index.html`, `styles.css`, `img/`, and other static repository assets; exclude `.git`, `.github`, `.superpowers`, `.worktrees`, and local logs.

## Verification

Validate the workflow YAML locally, confirm the committed workflow appears on `main`, enable GitHub Pages with the Actions build source, and inspect the completed deployment URL after the first workflow run.
