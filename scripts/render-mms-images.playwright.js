async (page) => {
  const origin = page.url().split("/mms_design.html")[0];
  await page.setViewportSize({ width: 1080, height: 4000 });
  const waitForAssets = async () => page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });
  const capture = async (url, selector, path) => {
    await page.goto(url, { waitUntil: "load" });
    await waitForAssets();
    const locator = page.locator(selector);
    const box = await locator.boundingBox();
    if (!box || box.width !== 1080 || box.height !== 1440) {
      throw new Error(`Unexpected ${selector} geometry: ${JSON.stringify(box)}`);
    }
    await page.screenshot({
      path,
      type: "png",
      clip: { x: box.x, y: box.y, width: 1080, height: 1440 },
      animations: "disabled",
      caret: "hide",
      scale: "css",
    });
    return box;
  };
  const intro = await capture(
    `${origin}/scripts/intro-section-stage.html?width=1080`,
    "#intro-stage",
    "output/mms-sens/mms_01_intro_raw.png",
  );
  const details = await capture(
    `${origin}/mms_design.html`,
    "#mms-details",
    "output/mms-sens/mms_02_details_raw.png",
  );
  console.log(JSON.stringify({ intro, details }));
}
