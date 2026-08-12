async (page) => {
  const base = page.url().split("?")[0];
  const contracts = {
    360: { contentWidth: 312, fontSize: "15px", lineCount: 2, separatorVisible: false },
    480: { contentWidth: 408, fontSize: "16px", lineCount: 1, separatorVisible: true },
    640: { contentWidth: 480, fontSize: "16px", lineCount: 1, separatorVisible: true },
  };
  let failed = false;

  for (const [widthText, contract] of Object.entries(contracts)) {
    await page.goto(`${base}?width=${widthText}`, { waitUntil: "load" });

    const result = await page.locator("#intro-stage").evaluate((stage, expected) => {
      const pill = stage.querySelector(".event-pill");
      const message = stage.querySelector(".invitation-message");
      const signature = stage.querySelector(".invitation-signature");
      const copy = stage.querySelector(".event-copy");
      const icon = stage.querySelector(".event-icon");
      const date = stage.querySelector(".event-date");
      const separator = stage.querySelector(".event-separator");
      const time = stage.querySelector(".event-time");

      if (![pill, message, signature, copy, icon, date, separator, time].every(Boolean)) {
        return { markup: false };
      }

      const pillRect = pill.getBoundingClientRect();
      const messageRect = message.getBoundingClientRect();
      const signatureRect = signature.getBoundingClientRect();
      const dateRect = date.getBoundingClientRect();
      const timeRect = time.getBoundingClientRect();
      const pillStyle = getComputedStyle(pill);
      const iconStyle = getComputedStyle(icon);
      const separatorStyle = getComputedStyle(separator);
      const close = (left, right) => Math.abs(left - right) <= 0.5;
      const lineCount = close(dateRect.top, timeRect.top) ? 1 : 2;

      return {
        markup: true,
        contentWidth: pillRect.width,
        edgesMatchMessage: close(pillRect.left, messageRect.left) && close(pillRect.right, messageRect.right),
        rightMatchesSignature: close(pillRect.right, signatureRect.right),
        fontSize: pillStyle.fontSize,
        lineCount,
        separatorVisible: separatorStyle.display !== "none",
        date: date.textContent.trim(),
        time: time.textContent.trim(),
        backgroundColor: pillStyle.backgroundColor,
        color: pillStyle.color,
        iconColor: iconStyle.color,
        borderWidth: pillStyle.borderTopWidth,
        borderStyle: pillStyle.borderTopStyle,
        stageFits: stage.scrollWidth <= stage.clientWidth,
        pillFits: pill.scrollWidth <= pill.clientWidth,
        expected,
      };
    }, contract);

    const passed = result.markup
      && Math.abs(result.contentWidth - contract.contentWidth) <= 0.5
      && result.edgesMatchMessage
      && result.rightMatchesSignature
      && result.fontSize === contract.fontSize
      && result.lineCount === contract.lineCount
      && result.separatorVisible === contract.separatorVisible
      && result.date === "2026년 8월 26일 (수)"
      && result.time === "오전 10시 ~ 오후 9시"
      && result.backgroundColor === "rgb(240, 244, 248)"
      && result.color === "rgb(10, 45, 84)"
      && result.iconColor === "rgb(67, 166, 78)"
      && result.borderWidth === "1px"
      && result.borderStyle === "solid"
      && result.stageFits
      && result.pillFits;

    console.log(`${passed ? "PASS" : "FAIL"} ${widthText}px ${JSON.stringify(result)}`);
    failed ||= !passed;
  }

  if (failed) throw new Error("Event-pill layout contract failed.");
}
