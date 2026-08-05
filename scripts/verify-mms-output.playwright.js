async (page) => {
  await page.setViewportSize({ width: 640, height: 1800 });
  await page.reload({ waitUntil: "load" });
  const result = await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
    const intro = document.querySelector("#intro-section").getBoundingClientRect();
    const profile = document.querySelector(".profile-section").getBoundingClientRect();
    const account = document.querySelector(".account-section").getBoundingClientRect();
    const expected = {
      intro: { width: 640, height: Math.ceil(intro.bottom) - Math.floor(intro.top) },
      details: { width: 640, height: Math.ceil(account.bottom) - Math.floor(profile.top) },
    };
    const loadSize = (src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => resolve(null);
      image.src = `${src}?qa=${Date.now()}-${Math.random()}`;
    });
    return {
      expected,
      introPng: await loadSize("mms_img/mms_01_intro.png"),
      introJpg: await loadSize("mms_img/mms_01_intro.jpg"),
      detailsPng: await loadSize("mms_img/mms_02_details.png"),
      detailsJpg: await loadSize("mms_img/mms_02_details.jpg"),
    };
  });

  const same = (left, right) => left && right && left.width === right.width && left.height === right.height;
  const passed = same(result.introPng, result.expected.intro)
    && same(result.introJpg, result.expected.intro)
    && same(result.detailsPng, result.expected.details)
    && same(result.detailsJpg, result.expected.details);
  console.log(`${passed ? "PASS" : "FAIL"} MMS output ${JSON.stringify(result)}`);
  if (!passed) throw new Error("MMS output geometry contract failed.");
}
