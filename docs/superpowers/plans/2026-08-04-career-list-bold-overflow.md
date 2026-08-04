# Career List Bold and Overflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `.career-list` bold and keep its rendered content inside the horizontal bounds at 360px, 480px, and 640px.

**Architecture:** Add one dependency-free Node/Playwright browser regression script that serves the real invitation, injects a deliberately long token, and measures computed layout at the three target widths. Apply narrowly scoped CSS containment and wrapping rules without changing font sizes or the responsive grid composition.

**Tech Stack:** HTML, CSS, Node.js, bundled Playwright/Chromium

## Global Constraints

- Keep the current font sizes, spacing, content, and responsive profile layout.
- Preserve the single-column profile at 480px and below and the two-column profile at 640px.
- Use `font-weight: 700` for `.career-list`.
- Do not modify career text, portrait sizing, section spacing, or other typography.
- Do not add viewport-specific font-size reductions.

---

### Task 1: Bold and contain the career list

**Files:**
- Create: `scripts/verify-career-list-layout.cjs`
- Modify: `styles.css:34-36`
- Test: `scripts/verify-career-list-layout.cjs`

**Interfaces:**
- Consumes: `index.html`, `styles.css`, and the bundled `playwright` package resolved through `NODE_PATH`.
- Produces: a command-line regression check that exits `0` only when all target viewports use weight `700` and contain the list content horizontally.

- [x] **Step 1: Write the failing browser-layout test**

Create `scripts/verify-career-list-layout.cjs`:

```js
const { createReadStream, existsSync, statSync } = require("node:fs");
const { createServer } = require("node:http");
const { extname, join, normalize } = require("node:path");
const { chromium } = require("playwright");

const root = process.cwd();
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
};

const server = createServer((request, response) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = normalize(join(root, relativePath));

  if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream" });
  createReadStream(filePath).pipe(response);
});

(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const browser = await chromium.launch({ headless: true });
  let failed = false;

  try {
    for (const width of [360, 480, 640]) {
      const page = await browser.newPage({ viewport: { width, height: 2400 } });
      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
      await page.locator(".career-list li").first().evaluate((item) => {
        item.textContent = "A".repeat(120);
      });

      const result = await page.locator(".career-list").evaluate((list) => {
        const viewportWidth = document.documentElement.clientWidth;
        const elements = [list, ...list.children];
        return {
          fontWeight: getComputedStyle(list).fontWeight,
          documentFits: document.documentElement.scrollWidth <= viewportWidth,
          elementsFit: elements.every((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left >= 0 && rect.right <= viewportWidth && element.scrollWidth <= element.clientWidth;
          }),
        };
      });

      const passed = result.fontWeight === "700" && result.documentFits && result.elementsFit;
      console.log(`${passed ? "PASS" : "FAIL"} ${width}px ${JSON.stringify(result)}`);
      failed ||= !passed;
      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }

  process.exitCode = failed ? 1 : 0;
})().catch((error) => {
  console.error(error);
  server.close();
  process.exitCode = 1;
});
```

- [x] **Step 2: Run the test and verify RED**

Run:

```powershell
$env:NODE_PATH='C:\Users\seung\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node scripts/verify-career-list-layout.cjs
```

Expected: exit code `1`; all three widths report `FAIL` because the computed font weight is currently `500`, and the injected long token is not safely wrapped.

- [x] **Step 3: Apply the minimal CSS implementation**

Update the career styles in `styles.css`:

```css
.career-copy { min-width: 0; }
.career-list { margin: 0; padding-left: 18px; font-size: calc(.9375rem + 2px + 1pt); line-height: 1.7; font-weight: 700; }
.career-list li { overflow-wrap: anywhere; }
.career-list li::marker { font-size: .72em; }
```

- [x] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
$env:NODE_PATH='C:\Users\seung\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node scripts/verify-career-list-layout.cjs
```

Expected: exit code `0`; 360px, 480px, and 640px each report `PASS` with `fontWeight` equal to `700`, `documentFits` true, and `elementsFit` true.

- [x] **Step 5: Run existing regressions**

Run:

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
node scripts/verify-mobile-density.mjs index.html styles.css
git diff --check
```

Expected: both Node scripts exit `0`, and `git diff --check` produces no output.

- [x] **Step 6: Commit the implementation**

```powershell
git add scripts/verify-career-list-layout.cjs styles.css docs/superpowers/plans/2026-08-04-career-list-bold-overflow.md
git commit -m "fix: contain bold career list text"
```
