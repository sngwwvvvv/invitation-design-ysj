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
