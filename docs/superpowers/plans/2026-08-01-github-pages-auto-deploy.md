# GitHub Pages Automatic Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the static invitation to GitHub Pages automatically whenever `main` is pushed.

**Architecture:** A single GitHub Actions workflow packages the repository's public static assets and delegates deployment to GitHub Pages' official actions. GitHub's Pages setting uses the Actions source, making the published URL independent of the local Cloudflare tunnel.

**Tech Stack:** GitHub Actions, GitHub Pages, YAML, static HTML and CSS.

## Global Constraints

- Create only `.github/workflows/deploy-pages.yml` for deployment behavior.
- Trigger only from `main` pushes and `workflow_dispatch`.
- Use official checkout, configure, upload-artifact, and deploy-pages actions.
- Publish static assets only; exclude repository metadata and local-only directories.
- Use least-privilege read, Pages write, and ID-token write permissions.

---

### Task 1: Create and validate the Pages workflow

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create: `docs/superpowers/plans/2026-08-01-github-pages-auto-deploy.md`

**Interfaces:**
- Consumes: repository root static assets and GitHub Pages deployment permissions.
- Produces: a Pages deployment artifact and GitHub Pages deployment on every `main` push.

- [ ] **Step 1: Write a failing workflow-presence check**

Run: `Test-Path .github/workflows/deploy-pages.yml`

Expected: `False`, because no Pages deployment workflow exists yet.

- [ ] **Step 2: Add the official deployment workflow**

Create `.github/workflows/deploy-pages.yml` with this content:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - name: Prepare site artifact
        run: |
          mkdir -p _site
          tar --exclude-vcs --exclude='./.github' --exclude='./.superpowers' --exclude='./.worktrees' --exclude='./cloudflared*' -cf - . | tar -xf - -C _site
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Validate the workflow content**

Run a YAML parser over `.github/workflows/deploy-pages.yml` and confirm the trigger, permissions, artifact upload, and deploy action are present.

Expected: The parser reports valid YAML and every required workflow component is present.

- [ ] **Step 4: Commit and push**

```bash
git add .github/workflows/deploy-pages.yml docs/superpowers/plans/2026-08-01-github-pages-auto-deploy.md
git commit -m "ci: deploy invitation to GitHub Pages"
git push origin main
```

- [ ] **Step 5: Enable and inspect GitHub Pages**

Use the GitHub API to configure Pages with the Actions build source. Inspect the Pages site and the corresponding Actions run until deployment completes, then open `https://sngwwvvvv.github.io/invitation-design-ysj/` and confirm it serves `index.html`.
