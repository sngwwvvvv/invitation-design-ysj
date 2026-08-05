async (page) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 640,
    height: 1800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await page.reload({ waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });

  const introBox = await page.evaluate(() => {
    const intro = document.querySelector("#intro-section").getBoundingClientRect();
    return { x: 0, y: Math.floor(intro.top), width: 640, height: Math.ceil(intro.bottom) - Math.floor(intro.top) };
  });
  const capture = async (box, captures) => {
    for (const [path, type] of captures) {
      const clip = { ...box, y: 0 };
      await page.screenshot({
        path,
        type,
        ...(type === "jpeg" ? { quality: 90 } : {}),
        clip,
        animations: "disabled",
        caret: "hide",
        scale: "css",
      });
    }
  };
  await capture(introBox, [
    ["mms_img/mms_01_intro.png", "png"],
    ["mms_img/mms_01_intro.jpg", "jpeg"],
  ]);

  await page.evaluate(() => document.querySelector(".profile-section").scrollIntoView({ block: "start", inline: "nearest" }));
  const detailsBox = await page.evaluate(() => {
    const profile = document.querySelector(".profile-section").getBoundingClientRect();
    const account = document.querySelector(".account-section").getBoundingClientRect();
    return { x: 0, y: Math.floor(profile.top), width: 640, height: Math.ceil(account.bottom) - Math.floor(profile.top) };
  });
  await capture(detailsBox, [
    ["mms_img/mms_02_details.png", "png"],
    ["mms_img/mms_02_details.jpg", "jpeg"],
  ]);
  console.log(JSON.stringify({ intro: introBox, details: detailsBox }));
}
