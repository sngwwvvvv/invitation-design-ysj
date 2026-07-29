# Invitation Palette, Header, and Account Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the approved Superdesign invitation draft with the new five-color palette, a unified image-backed introduction, an inline account section, and working digits-only account-number copy behavior.

**Architecture:** Keep the current Superdesign draft as the source and create exactly one branch iteration. Update the local design-system context, upload the two user-provided image assets, generate the branch with stable semantic IDs, and validate the remote draft through an automated CLI-backed contract test plus browser interaction and visual checks.

**Tech Stack:** Superdesign CLI 0.9.x, static HTML/CSS/JavaScript, Tailwind CDN already used by the draft, Iconify already used by the draft, Node.js built-ins for validation, Codex in-app browser for responsive and clipboard QA.

## Global Constraints

- Preserve the exact main heading: `호연회계법인에서의 새로운 출발을 알려드립니다`.
- Use only `#0A2D54`, `#0063A6`, `#43A64E`, `#F0F4F8`, and `#64748B` as principal UI colors.
- Keep the visual balance near 80% Platinum Cool Gray/Slate Steel and 20% Deep Navy/Standard Blue/Vivid Green.
- Use `/img/hoyeon_logo_horizontal.png` without filters, recoloring, cropping, or aspect-ratio changes.
- Use `/img/reflection_background.png` on the unified introduction background layer with `opacity: 0.4`; text and logo remain fully opaque.
- Remove `[일시 및 장소]`, the `축하의 말씀` heading, the account modal, and the modal trigger button.
- Show `우리은행`, `049-087742-02-501`, and `윤성중` directly on the page.
- The account copy action must copy exactly `04908774202501` and no bank or account-holder text.
- Preserve the profile, map, transit, parking, and Naver Map content and order.
- Retain the centered, maximum-640px, single-column invitation shell and accessible 44px minimum controls.

---

### Task 1: Add a remote-draft contract validator and prove the current draft fails

**Files:**
- Create: `scripts/validate-invitation-draft.mjs`
- Test: `scripts/validate-invitation-draft.mjs`

**Interfaces:**
- Consumes: a Superdesign draft ID as `process.argv[2]` and authenticated local Superdesign CLI credentials.
- Produces: exit code `0` with one `PASS` line per contract, or exit code `1` with one `FAIL` line per broken contract.

- [ ] **Step 1: Write the validator that exercises the real remote draft**

```js
import { execFileSync } from "node:child_process";

const draftId = process.argv[2];
if (!draftId) {
  console.error("Usage: node scripts/validate-invitation-draft.mjs [draft-id]");
  process.exit(2);
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const raw = execFileSync(
  npx,
  ["--yes", "@superdesign/cli@latest", "get-design", "--draft-id", draftId, "--json"],
  { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);
const { htmlContent: html } = JSON.parse(raw);

const checks = [
  ["keeps the approved main heading", html.includes("호연회계법인에서의<br>새로운 출발을 알려드립니다") || html.includes("호연회계법인에서의 새로운 출발을 알려드립니다")],
  ["declares the five approved colors", ["#0A2D54", "#0063A6", "#43A64E", "#F0F4F8", "#64748B"].every((color) => html.toUpperCase().includes(color))],
  ["removes the former palette", !["#142755", "#A9AABC", "#35B84A", "#F6F4EF"].some((color) => html.toUpperCase().includes(color))],
  ["uses one unified intro section", /id=["']intro-section["']/.test(html)],
  ["uses the reflection background at 40 percent opacity", html.includes("reflection_background.png") && /opacity\s*:\s*0?\.4(?:0)?\b/.test(html)],
  ["uses the horizontal logo without image filters", html.includes("hoyeon_logo_horizontal.png") && !/hoyeon_logo_horizontal[^>]+(?:filter|brightness|invert)/i.test(html)],
  ["removes the date and place label", !html.includes("[일시 및 장소]")],
  ["uses a dedicated event details block", /id=["']event-details["']/.test(html)],
  ["removes the celebration heading", !html.includes(">축하의 말씀<")],
  ["shows the chosen account copy", html.includes("축하의 마음을 전하고자 하시는 분들을 위해 계좌 정보를 조심스럽게 안내드립니다.")],
  ["shows the inline account information", ["우리은행", "049-087742-02-501", "윤성중"].every((value) => html.includes(value))],
  ["removes modal behavior", !/(account-modal|openModal|closeModal|modal-backdrop)/.test(html)],
  ["exposes the account copy button", /id=["']copy-account-number["']/.test(html) && html.includes("계좌정보 복사")],
  ["copies only the digits-only account number", /(?:writeText|clipboard)[\s\S]{0,240}04908774202501/.test(html)],
  ["provides copy success and failure feedback", html.includes("계좌번호가 복사되었습니다.") && html.includes("계좌번호를 길게 눌러 복사해 주세요.") && /aria-live=["']polite["']/.test(html)],
  ["preserves map and profile content", ["윤성중 부대표", "국세청 근무경력 30년", "map_capture", "2호선 삼성역 5번출구에서 도보 약 10분", "네이버 지도에서 확인하기", "[주차 안내가 확정되면 이곳에 표시됩니다]"].every((value) => html.includes(value))],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Run the validator against the current draft and verify RED**

Run:

```powershell
node scripts/validate-invitation-draft.mjs 09814ba2-f71a-4d01-a3be-9ae06580b185
```

Expected: exit code `1`; failures include the approved palette, unified intro, horizontal logo, inline account information, and copy behavior.

- [ ] **Step 3: Commit the failing contract validator**

```powershell
git add -- scripts/validate-invitation-draft.mjs
git commit -m "test: validate revised invitation draft contract"
```

---

### Task 2: Update the design system and upload the approved assets

**Files:**
- Modify: `.superdesign/design-system.md`
- Read: `img/hoyeon_logo_horizontal.png`
- Read: `img/reflection_background.png`

**Interfaces:**
- Consumes: the approved revision spec and local PNG assets.
- Produces: updated Superdesign context plus two uploaded asset URLs for Task 3.

- [ ] **Step 1: Replace obsolete design-system rules**

Update `.superdesign/design-system.md` so its information structure and component rules state:

```markdown
1. `InvitationIntro`: one continuous section containing the horizontal logo, approved main heading, invitation message, and `#event-details` block over `reflection_background.png` at 40% background-layer opacity.
2. `ProfileSection`: preserve the approved portrait and ten career entries.
3. `MapSection`: preserve the static map, address, transit row, Naver Map link, and parking notice.
4. `AccountNotice`: no h2 and no modal; show the approved message and inline account card with `#copy-account-number` and an `aria-live="polite"` status region.
```

Replace the old five colors with these exact tokens:

```css
--deep-navy: #0A2D54;
--standard-blue: #0063A6;
--vivid-green: #43A64E;
--platinum-cool-gray: #F0F4F8;
--slate-steel: #64748B;
```

Delete every rule that requires a vertical logo, separate reflection card, dark navy cards, account modal, modal trigger, modal closing interactions, or placeholder account details.

- [ ] **Step 2: Confirm the context no longer contradicts the approved spec**

Run:

```powershell
rg -n "#142755|#A9AABC|#35B84A|#F6F4EF|hoyeon_logo_vertical|Account Modal|openModal|마음 전하실 곳|후원계좌 placeholder" .superdesign/design-system.md
```

Expected: no matches.

- [ ] **Step 3: Upload the horizontal logo without adding a canvas node**

Run:

```powershell
$horizontalLogoAsset = npx --yes @superdesign/cli@latest upload-asset ./img/hoyeon_logo_horizontal.png --project-id f01b42fd-67b3-410d-ab73-e875e40af1a0 --no-canvas --json | ConvertFrom-Json
$horizontalLogoUrl = $horizontalLogoAsset.url
```

Expected: `$horizontalLogoUrl` is a non-empty public URL.

- [ ] **Step 4: Upload the reflection background without adding a canvas node**

Run:

```powershell
$reflectionAsset = npx --yes @superdesign/cli@latest upload-asset ./img/reflection_background.png --project-id f01b42fd-67b3-410d-ab73-e875e40af1a0 --no-canvas --json | ConvertFrom-Json
$reflectionBackgroundUrl = $reflectionAsset.url
```

Expected: `$reflectionBackgroundUrl` is a non-empty public URL.

- [ ] **Step 5: Commit only the design-system update**

```powershell
git add -- .superdesign/design-system.md
git commit -m "design: update invitation palette and section rules"
```

Do not stage the user-provided image additions or deletions.

---

### Task 3: Generate exactly one revised branch and make the contract green

**Files:**
- Context: `.superdesign/design-system.md`
- Test: `scripts/validate-invitation-draft.mjs`

**Interfaces:**
- Consumes: source draft `09814ba2-f71a-4d01-a3be-9ae06580b185`, the two Task 2 asset URLs, and the updated design system.
- Produces: one new Superdesign branch draft ID and preview/canvas URLs.

- [ ] **Step 1: Iterate the existing draft in branch mode with one prompt**

Construct one prompt by interpolating the two uploaded URLs:

```powershell
$iterationPrompt = @"
Create exactly one revised branch of the current invitation. Preserve the centered max-width 640px single-column shell; the approved main heading; the complete profile content and two-column profile layout; and the existing static map, address, Line 2 transit row, Naver Map URL, and parking placeholder. Replace the old palette everywhere with only #0A2D54, #0063A6, #43A64E, #F0F4F8, and #64748B, using the light gray and slate colors across roughly 80% of the composition and navy, blue, and green only for hierarchy and accents. Merge the header and invitation message into one continuous section with id="intro-section". Put the uploaded horizontal logo at $horizontalLogoUrl at its natural aspect ratio with no CSS filter, recoloring, inversion, or cropping. Use $reflectionBackgroundUrl as a full-cover pseudo-element/background layer across intro-section with opacity: 0.4; keep all content fully opaque. Preserve the exact heading 호연회계법인에서의 새로운 출발을 알려드립니다 and the invitation placeholder. Remove [일시 및 장소]. Put the existing date and address inside a distinct div id="event-details" below the message, with a vivid-green calendar icon and map pin and deep-navy text. Use #0063A6 for section headings and dividers, #64748B for body copy, and #43A64E only for small icons and accents. Remove the 축하의 말씀 h2, the 마음 전하실 곳 확인하기 button, the entire modal markup, and all modal JavaScript. In the same page, render the exact message 축하의 마음을 전하고자 하시는 분들을 위해 계좌 정보를 조심스럽게 안내드립니다. followed by an always-visible account card showing 우리은행, 049-087742-02-501, and 윤성중, with the account number visually strongest. Add a Deep Navy button id="copy-account-number" labeled 계좌정보 복사. Its click handler must use navigator.clipboard.writeText('04908774202501') so it copies only the digits-only account number. Add an aria-live="polite" status region; on success display 계좌번호가 복사되었습니다. and on clipboard failure display 계좌번호를 길게 눌러 복사해 주세요. Keep semantic HTML, visible keyboard focus, minimum 44px controls, readable text contrast, original image ratios, and no gradients or shadows. Use ONLY the fonts, colors, spacing, and component styles defined in the design system. Do not introduce any fonts, colors, or visual styles not in the design system.
"@
```

Run one `iterate-design-draft` command with `--mode branch`, one `-p`, `--context-file .superdesign/design-system.md`, and no viewport override:

```powershell
$approvedUserRequest = "컬러 팔레트와 헤더·초청 인사말 구조를 승인한 명세대로 수정하고, 축하의 말씀 제목과 계좌 모달을 삭제한 뒤 우리은행 049-087742-02-501 윤성중 계좌정보를 페이지에 직접 표시해 주세요. 계좌정보 복사 버튼은 하이픈 없는 계좌번호 04908774202501만 복사해야 합니다."
$iterationResult = npx --yes @superdesign/cli@latest iterate-design-draft --draft-id 09814ba2-f71a-4d01-a3be-9ae06580b185 -p $iterationPrompt --mode branch --user-request $approvedUserRequest --context-file .superdesign/design-system.md --json | ConvertFrom-Json
$revisedDraftId = $iterationResult.drafts[0].draftId
$canvasUrl = $iterationResult.projectUrl
```

Expected: `$iterationResult.drafts.Count` is `1`; `$revisedDraftId` and `$canvasUrl` are non-empty. Read the preview URL from `$iterationResult.drafts[0]`.

- [ ] **Step 2: Run the validator against the new draft and verify GREEN**

Run:

```powershell
node scripts/validate-invitation-draft.mjs $revisedDraftId
```

Expected: exit code `0` and every line begins with `PASS`.

- [ ] **Step 3: Correct one narrow generation defect if the validator identifies one**

If a single localized contract fails, read the draft with:

```powershell
npx --yes @superdesign/cli@latest get-design --draft-id $revisedDraftId --json
```

Then run one `iterate-design-draft --mode replace` prompt naming only that failed contract, retain the same design-system context, and rerun the validator. If failures span multiple unrelated areas, stop and report them instead of spending additional generation credits without approval.

---

### Task 4: Verify responsive layout and real clipboard behavior in the browser

**Files:**
- Test: remote preview URL returned for `$revisedDraftId`

**Interfaces:**
- Consumes: the Task 3 preview URL.
- Produces: visual screenshots and direct evidence that the rendered copy control writes `04908774202501`.

- [ ] **Step 1: Inspect the full mobile design at 390px viewport width**

Open the exact preview URL in the Codex in-app browser, set viewport width to 390px, take a full-page screenshot, and verify:

```text
intro-section is one continuous section; logo is not recolored or cropped; text is readable over the 40% background; event-details is distinct; profile text and image do not overlap; map stays uncropped; account card and copy button fit without horizontal overflow.
```

- [ ] **Step 2: Inspect the desktop design at 1280px viewport width**

Set viewport width to 1280px, take a full-page screenshot, and verify the invitation remains centered at no more than 640px without duplicated content, clipping, or excess horizontal stretching.

- [ ] **Step 3: Exercise the copy button and read the real clipboard result**

Use the DOM snapshot to locate the unique button `계좌정보 복사`, click it once, read the browser clipboard, and assert the exact value:

```text
04908774202501
```

Also verify the visible live-region message is `계좌번호가 복사되었습니다.` and that it is associated with `aria-live="polite"`.

- [ ] **Step 4: Check browser console output**

Read error-level console logs for the preview URL.

Expected: no JavaScript errors, asset-load failures, or clipboard-handler exceptions.

---

### Task 5: Final verification and handoff

**Files:**
- Verify: `.superdesign/design-system.md`
- Verify: `scripts/validate-invitation-draft.mjs`
- Verify: remote draft stored in `$revisedDraftId`

**Interfaces:**
- Consumes: all previous task outputs.
- Produces: final draft ID, clickable canvas/preview URLs, test evidence, and a clean worktree report that identifies user-owned asset changes separately.

- [ ] **Step 1: Run all automated checks again**

```powershell
node scripts/validate-invitation-draft.mjs $revisedDraftId
git diff --check
git status --short
```

Expected: validator passes; Git reports no whitespace errors; only intended work and the pre-existing user-owned image changes remain.

- [ ] **Step 2: Review the final draft metadata**

```powershell
npx --yes @superdesign/cli@latest get-design --draft-id $revisedDraftId --json
```

Expected: the new draft is current, its prompt records the approved revision, and the returned HTML contains the tested implementation.

- [ ] **Step 3: Report the finished branch**

Provide the draft title, draft ID, canvas URL, preview URL, automated validator result, mobile/desktop visual QA result, and exact clipboard result. Invite the user to choose whether to keep this branch as final or request one focused visual refinement.
