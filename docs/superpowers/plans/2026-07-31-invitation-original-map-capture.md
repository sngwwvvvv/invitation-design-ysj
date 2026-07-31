# Invitation Original Map Capture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the venue-only map with the unmodified wide capture so Samsung Station and the venue are visible together, then verify that relationship in the rendered invitation.

**Architecture:** Keep the current static HTML and CSS structure. Strengthen the existing local contract first, make the single image-source change in `index.html`, and verify both the DOM geometry and screenshots at the approved 360px and 640px widths.

**Tech Stack:** Static HTML/CSS, Node.js validation script, local HTTP server, Playwright CLI.

## Global Constraints

- Use `img/map_capture.png` without cropping, filtering, compositing, labels, route lines, or an inset map.
- Preserve the existing `.map-image` layout and the source image aspect ratio.
- Preserve the address, transit guidance, `네이버 지도에서 확인하기` button, parking notice, and their order.
- Do not add a map API, iframe, external link, or map interaction.
- The map only needs to make Samsung Station, the venue marker, and their approximate relative position identifiable; small business and road labels do not all need to be readable.

---

## File Structure

- Modify `scripts/validate-invitation-local.mjs`: require the approved original capture and reject the venue-only capture in the rendered HTML contract.
- Modify `index.html`: point the existing `.map-image` element to `img/map_capture.png`.
- Create `output/playwright/invitation-original-map-360.png`: mobile visual evidence.
- Create `output/playwright/invitation-original-map-640.png`: canonical-width visual evidence.

### Task 1: Apply and verify the original map capture

**Files:**
- Modify: `scripts/validate-invitation-local.mjs:32-33`
- Modify: `index.html:47`
- Create: `output/playwright/invitation-original-map-360.png`
- Create: `output/playwright/invitation-original-map-640.png`

**Interfaces:**
- Consumes: existing `.map-image` CSS rule, `img/map_capture.png`, and the existing directions-section content.
- Produces: an `<img class="map-image" src="img/map_capture.png">` element and two viewport screenshots proving its rendered geometry.

- [ ] **Step 1: Strengthen the local validation contract**

In `scripts/validate-invitation-local.mjs`, replace `map_capture_resized.png` with `map_capture.png` in the `current supplied assets` check and add this adjacent check:

```js
[
  "original map capture selected",
  /<img\b(?=[^>]*\bclass=["'][^"']*\bmap-image\b[^"']*["'])(?=[^>]*\bsrc=["']img\/map_capture\.png["'])[^>]*>/i.test(html) &&
    !html.includes("map_capture_resized.png"),
],
```

- [ ] **Step 2: Run the contract and confirm the intended failure**

Run:

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
```

Expected: exit code `1`; `FAIL current supplied assets` and `FAIL original map capture selected` appear because `index.html` still references `map_capture_resized.png`. Unrelated checks remain `PASS`.

- [ ] **Step 3: Make the minimal HTML change**

Change the existing directions image in `index.html` to:

```html
<img class="map-image" src="img/map_capture.png" alt="삼성역과 행사장 위치를 표시한 지도">
```

Do not change `styles.css` or any surrounding directions content.

- [ ] **Step 4: Run the local contract and confirm it passes**

Run:

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
```

Expected: exit code `0` and every check prints `PASS`, including `current supplied assets` and `original map capture selected`.

- [ ] **Step 5: Start the local preview and capture both approved widths**

Start a local server in the project root:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

In another terminal, open a Playwright session and capture both screenshots:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=original-map open http://127.0.0.1:4173/index.html
npx --yes --package @playwright/cli playwright-cli -s=original-map resize 360 900
npx --yes --package @playwright/cli playwright-cli -s=original-map screenshot --filename output/playwright/invitation-original-map-360.png
npx --yes --package @playwright/cli playwright-cli -s=original-map resize 640 900
npx --yes --package @playwright/cli playwright-cli -s=original-map screenshot --filename output/playwright/invitation-original-map-640.png
```

After each resize, scroll until the `오시는 길` heading and complete map are visible, then capture the 900px viewport. Expected: both files exist, show the map and its adjacent directions content, and show no horizontal clipping.

- [ ] **Step 6: Verify map geometry and inspect visual readability**

At both viewport widths, run:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=original-map eval "() => { const image = document.querySelector('.map-image'); const box = image.getBoundingClientRect(); return { src: image.getAttribute('src'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, renderedWidth: box.width, renderedHeight: box.height, ratioDelta: Math.abs((box.width / box.height) - (image.naturalWidth / image.naturalHeight)), horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth }; }"
```

Expected at each width:

- `src` is `img/map_capture.png`.
- `naturalWidth` is `1521` and `naturalHeight` is `807`.
- `ratioDelta` is less than `0.01`.
- `horizontalOverflow` is `0`.
- Visual inspection of both screenshots can identify the red venue marker near the center and Samsung Station on the right, with the venue lying west of the station.
- The address, transit guidance, Naver Map button, and parking notice remain below the map in their existing order.

- [ ] **Step 7: Commit the implementation and evidence**

```powershell
git add -- index.html scripts/validate-invitation-local.mjs output/playwright/invitation-original-map-360.png output/playwright/invitation-original-map-640.png
git commit -m "feat: restore original map capture"
```
