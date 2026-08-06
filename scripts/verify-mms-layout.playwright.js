async (page) => {
  const origin = page.url().split("/mms_design.html")[0];
  await page.setViewportSize({ width: 1080, height: 1600 });

  const ready = async () => page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });
  const within = (outer, inner) => inner.left >= outer.left - 0.5
    && inner.top >= outer.top - 0.5
    && inner.right <= outer.right + 0.5
    && inner.bottom <= outer.bottom + 0.5;

  await page.goto(`${origin}/scripts/intro-section-stage.html?width=1080`, { waitUntil: "load" });
  await ready();
  const intro = await page.evaluate(() => {
    const stage = document.querySelector("#intro-stage");
    const content = document.querySelector(".intro-content");
    const a = stage.getBoundingClientRect();
    const b = content.getBoundingClientRect();
    return {
      stage: { left: a.left, top: a.top, right: a.right, bottom: a.bottom, width: a.width, height: a.height },
      content: { left: b.left, top: b.top, right: b.right, bottom: b.bottom },
      scrollWidth: stage.scrollWidth,
      scrollHeight: stage.scrollHeight,
      date: document.querySelector(".event-date")?.textContent,
      styles: {
        copyWidth: getComputedStyle(stage).getPropertyValue("--intro-copy-width").trim(),
        logoWidth: getComputedStyle(document.querySelector(".brand-logo")).width,
        titleSize: getComputedStyle(document.querySelector(".intro-title")).fontSize,
        eventSize: getComputedStyle(document.querySelector(".event-pill")).fontSize,
        bodySize: getComputedStyle(document.querySelector(".invitation-message")).fontSize,
        signatureSize: getComputedStyle(document.querySelector(".invitation-signature")).fontSize,
      },
    };
  });

  await page.goto(`${origin}/mms_design.html`, { waitUntil: "load" });
  await ready();
  const details = await page.evaluate(() => {
    const root = document.querySelector("#mms-details");
    const box = root.getBoundingClientRect();
    const sectionData = [...root.children].map((section) => ({
      className: section.className,
      clientHeight: section.clientHeight,
      scrollHeight: section.scrollHeight,
      clientWidth: section.clientWidth,
      scrollWidth: section.scrollWidth,
    }));
    const ratio = (selector) => {
      const image = document.querySelector(selector);
      const rect = image.getBoundingClientRect();
      return { rendered: rect.width / rect.height, natural: image.naturalWidth / image.naturalHeight };
    };
    return {
      box: { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height },
      scrollWidth: root.scrollWidth,
      scrollHeight: root.scrollHeight,
      sections: sectionData,
      portrait: ratio(".portrait"),
      map: ratio(".map-image"),
      hasMapLink: Boolean(document.querySelector(".map-link")),
      hasCopyButton: Boolean(document.querySelector("#copy-account-number")),
    };
  });

  const ratioMatches = (value) => Math.abs(value.rendered - value.natural) <= 0.002;
  const passed = intro.stage.width === 1080
    && intro.stage.height === 1440
    && intro.scrollWidth === 1080
    && intro.scrollHeight === 1440
    && within(intro.stage, intro.content)
    && intro.content.left >= 110 - 0.5
    && intro.content.right <= 970 + 0.5
    && intro.styles.copyWidth === "860px"
    && intro.styles.logoWidth === "340px"
    && intro.styles.titleSize === "52px"
    && intro.styles.eventSize === "26px"
    && intro.styles.bodySize === "25px"
    && intro.styles.signatureSize === "23px"
    && intro.date === "2026년 8월 19일 (수)"
    && details.box.width === 1080
    && details.box.height === 1440
    && details.scrollWidth === 1080
    && details.scrollHeight === 1440
    && details.sections.every((section) => section.scrollHeight <= section.clientHeight + 1 && section.scrollWidth <= section.clientWidth + 1)
    && ratioMatches(details.portrait)
    && ratioMatches(details.map)
    && !details.hasMapLink
    && !details.hasCopyButton;
  console.log(`${passed ? "PASS" : "FAIL"} SENS MMS layout ${JSON.stringify({ intro, details })}`);
  if (!passed) throw new Error("SENS MMS layout contract failed.");
}
