async (page) => {
  const origin = page.url().split("/mms_design.html")[0];
  const result = await page.evaluate(async (base) => {
    const loadSize = (path) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => resolve(null);
      image.src = `${base}/${path}?qa=${Date.now()}-${Math.random()}`;
    });
    return {
      intro: await loadSize("mms_img/mms_01_intro.jpg"),
      details: await loadSize("mms_img/mms_02_details.jpg"),
    };
  }, origin);
  const valid = (value) => value?.width === 1080 && value?.height === 1440;
  const passed = valid(result.intro) && valid(result.details);
  console.log(`${passed ? "PASS" : "FAIL"} SENS MMS output ${JSON.stringify(result)}`);
  if (!passed) throw new Error("SENS MMS output geometry failed.");
}
