async (page) => {
  await page.setViewportSize({ width: 640, height: 1800 });
  await page.reload({ waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.complete ? image.decode().catch(() => {}) : new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    })));
  });

  const result = await page.evaluate(() => {
    const intro = document.querySelector("#intro-section");
    const details = document.querySelector("#mms-details");
    const profile = document.querySelector(".profile-section");
    const profileHeading = document.querySelector(".profile-heading");
    const transit = document.querySelector(".transit");
    const parking = document.querySelector(".parking-notice");
    const account = document.querySelector(".account-section");
    const accountInfo = document.querySelector(".account-info");
    if (![intro, details, profile, profileHeading, transit, parking, account, accountInfo].every(Boolean)) return { markup: false };

    const introBox = intro.getBoundingClientRect();
    const profileBox = profile.getBoundingClientRect();
    const detailsBox = details.getBoundingClientRect();
    const profileHeadingBox = profileHeading.getBoundingClientRect();
    const transitBox = transit.getBoundingClientRect();
    const parkingBox = parking.getBoundingClientRect();
    const accountBox = account.getBoundingClientRect();
    const infoStyle = getComputedStyle(accountInfo);
    return {
      markup: true,
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      hasMapLink: Boolean(document.querySelector(".map-link")),
      hasCopyButton: Boolean(document.querySelector("#copy-account-number")),
      detailsStartsAfterIntro: Math.abs(detailsBox.top - profileBox.top) <= 0.5,
      detailsContainsIntro: details.contains(intro),
      titleStartsAtDetailsTop: Math.abs(profileHeadingBox.top - detailsBox.top) <= 0.5,
      mapControlGap: parkingBox.top - transitBox.bottom,
      accountControlGap: Number.parseFloat(infoStyle.marginBottom),
      introHeight: Math.ceil(introBox.bottom) - Math.floor(introBox.top),
      detailsHeight: Math.ceil(accountBox.bottom) - Math.floor(profileBox.top),
    };
  });

  const passed = result.markup
    && result.viewportWidth === 640
    && result.documentWidth === 640
    && !result.hasMapLink
    && !result.hasCopyButton
    && result.detailsStartsAfterIntro
    && !result.detailsContainsIntro
    && result.titleStartsAtDetailsTop
    && Math.abs(result.mapControlGap) <= 0.5
    && result.accountControlGap === 0
    && result.introHeight > 0
    && result.detailsHeight > 0;
  console.log(`${passed ? "PASS" : "FAIL"} MMS layout ${JSON.stringify(result)}`);
  if (!passed) throw new Error("MMS layout contract failed.");
}
