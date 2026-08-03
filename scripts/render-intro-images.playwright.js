async (page) => {
  const base = page.url().split("?")[0];
  const cdp = await page.context().newCDPSession(page);

  for (const width of [360, 480, 640]) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 2400,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await page.goto(`${base}?width=${width}`);
    await page.locator("#intro-stage").screenshot({
      path: `img/intro-section-${width}.png`,
      animations: "disabled",
      scale: "device",
    });
  }
}
