# 모바일 우선 개업식 초청장 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 360px 모바일을 기준으로 읽기 쉬우며 계좌번호 복사 기능을 갖춘 정적 개업식 초청장을 만든다.

**Architecture:** `index.html`은 초청장의 의미론적 구조와 계좌번호 복사에 필요한 작은 스크립트만 가진다. `styles.css`는 360px 모바일 우선 레이아웃, 최대 640px 셸, 색상 토큰과 접근성 스타일을 담당한다. Node 기반 정적 계약 검증기와 브라우저 확인으로 요구사항을 검증한다.

**Tech Stack:** HTML5, CSS3, 브라우저 Clipboard API, Node.js 내장 모듈, 제공된 로컬 이미지 자산.

## Global Constraints

- 결과물은 `index.html`, `styles.css`, 로컬 `img/` 자산과 최소 인라인 JavaScript로만 구성한다.
- 프레임워크, 외부 폰트, 외부 아이콘 라이브러리, iframe, 지도 API, 서버 요청을 사용하지 않는다.
- 360px을 기준으로 하고 전체 640px 캔버스를 비례 축소하지 않는다.
- 콘텐츠 셸은 `width: 100%`, `max-width: 640px`이며 큰 화면에서 중앙 정렬한다.
- 본문은 16px 이상, 주소·지도 링크는 18px 이상, 주요 버튼은 최소 44px 높이로 구현한다.
- 주요 UI 색상은 `#F0F4F8`, `#0A2D54`, `#0063A6`, `#43A64E`, `#64748B`로 제한한다.
- 도입부는 가로형 로고 → 정확한 메인 제목 → 행사 정보 → 초청 인사말 순서다.
- `reflection_background.png`는 도입부 가상 요소에서만 40% 투명도로 표시한다.
- 지도는 `img/map_capture.png` 정적 이미지이며, 외부 이동은 네이버 지도 링크 하나뿐이다.
- 전화번호·휴대전화·이메일·학력·자격 정보는 표시하지 않는다.
- 계좌 카드는 우리은행, `049-087742-02-501`, 윤성중을 항상 보이며, 복사 문자열은 정확히 `04908774202501`이다.

---

### Task 1: 로컬 초청장 정적 계약 검증기 작성

**Files:**
- Create: `scripts/validate-invitation-local.mjs`
- Test: `scripts/validate-invitation-local.mjs`

**Interfaces:**
- Consumes: HTML 파일 경로와 CSS 파일 경로.
- Produces: 계약별 `PASS` 또는 `FAIL` 행, 성공 시 종료 코드 `0`.

- [ ] **Step 1: 실패하는 계약 검증기를 작성한다.**

```js
import { readFileSync } from "node:fs";

const [htmlPath, cssPath] = process.argv.slice(2);
if (!htmlPath || !cssPath) {
  console.error("Usage: node scripts/validate-invitation-local.mjs index.html styles.css");
  process.exit(2);
}

const html = readFileSync(htmlPath, "utf8");
const css = readFileSync(cssPath, "utf8");
const all = `${html}\n${css}`;
const checks = [
  ["Korean document language", /<html[^>]+lang=["']ko["']/i.test(html)],
  ["stylesheet link", /href=["']styles\.css["']/i.test(html)],
  ["approved heading", html.includes("호연회계법인에서의 새로운 출발을 알려드립니다")],
  ["intro and event IDs", /id=["']intro-section["']/.test(html) && /id=["']event-details["']/.test(html)],
  ["five supplied assets", ["hoyeon_logo_horizontal.png", "reflection_background.png", "portrait_ysj.png", "map_capture.png", "Seoul_Metro_Line_2.svg.webp"].every((asset) => all.includes(asset))],
  ["approved palette", ["#F0F4F8", "#0A2D54", "#0063A6", "#43A64E", "#64748B"].every((color) => css.includes(color))],
  ["mobile-first shell", /width\s*:\s*100%/.test(css) && /max-width\s*:\s*640px/.test(css)],
  ["no canvas scale", !/transform\s*:\s*scale|\bzoom\s*:/.test(css)],
  ["no forbidden dependencies", !/(iframe|maps\.js|tailwind|bootstrap|react|vue|angular|fonts\.googleapis)/i.test(all)],
  ["inline account details", ["우리은행", "049-087742-02-501", "윤성중"].every((value) => html.includes(value))],
  ["copy contract", /id=["']copy-account-number["']/.test(html) && /aria-live=["']polite["']/.test(html) && html.includes("writeText('04908774202501')")],
  ["copy feedback", html.includes("계좌번호가 복사되었습니다.") && html.includes("계좌번호를 길게 눌러 복사해 주세요.")],
];
let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: 구현 전 실패 상태를 확인한다.**

Run:

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
```

Expected: 아직 HTML·CSS 파일이 없으므로 파일을 찾지 못해 실패한다.

- [ ] **Step 3: 검증기만 커밋한다.**

```powershell
git add -- scripts/validate-invitation-local.mjs
git commit -m "test: add local invitation contract validator"
```

### Task 2: 모바일 우선 초청장 구현

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Test: `scripts/validate-invitation-local.mjs`

**Interfaces:**
- Consumes: `img/`의 제공 이미지와 Task 1 계약 검증기.
- Produces: 브라우저에서 직접 열리는 초청장과 `#copy-account-number` 복사 제어.

- [ ] **Step 1: 계약 검증기가 구현 전 실패하는지 다시 확인한다.**

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
```

Expected: 파일이 없으므로 실패한다.

- [ ] **Step 2: `index.html`의 문서·도입부·경력 마크업을 작성한다.**

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="호연회계법인 개업식 초청장">
  <title>호연회계법인 개업식 초청장</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="invitation-shell">
    <section id="intro-section" aria-labelledby="invitation-title">
      <div class="intro-content">
        <img class="brand-logo" src="img/hoyeon_logo_horizontal.png" alt="호연회계법인 로고">
        <h1 id="invitation-title">호연회계법인에서의 새로운 출발을 알려드립니다</h1>
        <div id="event-details" aria-label="행사 일시 및 장소">
          <p><span aria-hidden="true" class="event-icon">▣</span><strong>202X년 X월 X일(X) 오후 X시</strong></p>
          <p><span aria-hidden="true" class="event-icon">⌖</span>서울특별시 강남구 테헤란로81길 14, 8층</p>
        </div>
        <p class="invitation-message">[초청 인사말이 이곳에 들어갑니다]</p>
      </div>
    </section>
    <section class="content-section" aria-labelledby="profile-title">
      <h2 id="profile-title">경력사항 소개</h2>
      <div class="profile-grid">
        <img class="portrait" src="img/portrait_ysj.png" alt="윤성중 부대표 프로필 사진">
        <div class="career-copy">
          <h3>윤성중 부대표</h3>
          <p class="eyebrow">[ 주요 경력 ]</p>
          <ul class="career-list"><li>국세청 근무경력 30년</li><li>전 서울지방국세청 조사4국 조사팀장</li><li>전 서울지방국세청 국제거래조사국 조사팀장</li><li>전 성동세무서 법인세과장</li><li>전 동고양세무서 납세자보호담당관</li><li>전 서울지방국세청 송무국 상송팀장</li><li>전 서울지방국세청 조사1국 조사팀</li><li>전 서울지방국세청 조사2국 조사팀</li><li>전 서초세무서 조사과 조사팀장</li><li>전 강동세무서 재산세과 재산팀장</li></ul>
        </div>
      </div>
    </section>
  </main>
</body>
</html>
```

- [ ] **Step 3: 오시는 길과 계좌 카드 마크업을 `main` 안에 추가한다.**

```html
<section class="content-section directions" aria-labelledby="directions-title">
  <h2 id="directions-title">오시는 길</h2>
  <img class="map-image" src="img/map_capture.png" alt="삼성역과 행사장 위치를 표시한 지도">
  <address>서울특별시 강남구 테헤란로81길 14, 8층 <span>(카이마빌딩)</span></address>
  <p class="transit"><img src="img/Seoul_Metro_Line_2.svg.webp" alt="2호선">2호선 삼성역 5번출구에서 도보 약 10분</p>
  <a class="map-link" href="https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%ED%85%8C%ED%97%A4%EB%9E%80%EB%A1%9C81%EA%B8%B8%2014" target="_blank" rel="noopener">네이버 지도에서 확인하기</a>
  <p class="parking-notice">[주차 안내가 확정되면 이곳에 표시됩니다]</p>
</section>
<section class="account-section" aria-label="계좌 안내">
  <div class="account-card">
    <p class="account-message">축하의 마음을 전하고자 하시는 분들을 위해 계좌 정보를 조심스럽게 안내드립니다.</p>
    <dl><div><dt>은행</dt><dd>우리은행</dd></div><div><dt>계좌번호</dt><dd>049-087742-02-501</dd></div><div><dt>예금주</dt><dd>윤성중</dd></div></dl>
    <button id="copy-account-number" type="button">계좌정보 복사</button>
    <p id="copy-status" aria-live="polite"></p>
  </div>
</section>
```

- [ ] **Step 4: `</body>` 직전에 복사 성공·실패 처리를 추가한다.**

```html
<script>
  const copyButton = document.querySelector('#copy-account-number');
  const copyStatus = document.querySelector('#copy-status');
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('04908774202501');
      copyStatus.textContent = '계좌번호가 복사되었습니다.';
    } catch {
      copyStatus.textContent = '계좌번호를 길게 눌러 복사해 주세요.';
    }
  });
</script>
```

- [ ] **Step 5: `styles.css`에 모바일 우선 레이아웃과 카드 규칙을 작성한다.**

```css
:root { --platinum: #F0F4F8; --navy: #0A2D54; --blue: #0063A6; --green: #43A64E; --slate: #64748B; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--platinum); color: var(--slate); font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
.invitation-shell { width: 100%; max-width: 640px; margin: 0 auto; background: var(--platinum); overflow: hidden; }
#intro-section { position: relative; overflow: hidden; padding: 48px 24px; background: var(--platinum); }
#intro-section::before { content: ""; position: absolute; inset: 0; background: url("img/reflection_background.png") center / cover no-repeat; opacity: .4; }
.intro-content { position: relative; z-index: 1; text-align: center; }
.brand-logo { display: block; width: min(220px, 70%); height: auto; margin: 0 auto 32px; }
h1 { color: var(--navy); font-size: clamp(2rem, 9vw, 3.5rem); line-height: 1.28; }
.content-section, .account-section { padding: 48px 24px; }
h2 { color: var(--blue); font-size: 1.75rem; text-align: center; }
.profile-grid { display: grid; grid-template-columns: minmax(120px, .85fr) minmax(0, 1.35fr); gap: 16px; align-items: end; }
.portrait, .map-image { display: block; width: 100%; height: auto; }
.transit { display: flex; align-items: center; gap: 8px; font-size: 1.125rem; }
.transit img { width: 1.5rem; height: auto; }
.map-link, #copy-account-number { display: flex; min-height: 44px; align-items: center; justify-content: center; border-radius: 8px; font-size: 1.125rem; font-weight: 700; }
.map-link { background: var(--blue); color: var(--platinum); text-decoration: none; }
.account-card { padding: 28px 20px; border: 1px solid var(--blue); border-radius: 16px; background: var(--platinum); }
.account-card dl { margin: 24px 0; padding-top: 20px; border-top: 1px solid var(--blue); }
.account-card dl > div { display: flex; justify-content: space-between; gap: 16px; padding: 8px 0; }
.account-card dd { margin: 0; font-weight: 700; }
.account-card dl > div:nth-child(2) dd { color: var(--navy); font-size: 1.35rem; }
#copy-account-number { width: 100%; border: 0; background: var(--navy); color: var(--platinum); cursor: pointer; }
#copy-status { min-height: 1.7em; margin: 12px 0 0; color: var(--navy); text-align: center; }
a:focus-visible, button:focus-visible { outline: 3px solid var(--green); outline-offset: 3px; }
```

- [ ] **Step 6: 정적 계약을 통과시키고 구현을 커밋한다.**

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
git add -- index.html styles.css
git commit -m "feat: build mobile-first opening invitation"
```

Expected: 모든 계약 행이 `PASS`이고, 초청장 구현만 커밋된다.

### Task 3: 브라우저 품질 검증과 최종 확인

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `scripts/validate-invitation-local.mjs`
- Create: `qa-screenshots/invitation-360.png`
- Create: `qa-screenshots/invitation-640.png`

**Interfaces:**
- Consumes: Task 2의 정적 페이지.
- Produces: 두 뷰포트 스크린샷, 실제 클립보드 문자열, 콘솔 오류 검사 결과.

- [ ] **Step 1: 최종 계약과 공백 오류를 확인한다.**

```powershell
node scripts/validate-invitation-local.mjs index.html styles.css
git diff --check
```

Expected: 검증기는 종료 코드 `0`, 공백 오류 검사는 출력 없이 성공한다.

- [ ] **Step 2: 정적 서버에서 360px 화면을 확인하고 캡처한다.**

```powershell
npx --yes serve . -l 4173
```

```text
URL: http://localhost:4173/index.html
뷰포트: 360 × 900
저장: qa-screenshots/invitation-360.png
확인: 가로 스크롤 없음, 본문 16px 이상, 2열 경력·지도·계좌 카드가 겹치거나 잘리지 않음.
```

- [ ] **Step 3: 640px 화면을 확인하고 캡처한다.**

```text
URL: http://localhost:4173/index.html
뷰포트: 640 × 1000
저장: qa-screenshots/invitation-640.png
확인: 셸이 중앙 정렬되고 최대 640px을 넘지 않으며, 텍스트·이미지·버튼이 자연스럽게 배치됨.
```

- [ ] **Step 4: 실제 복사 성공·실패 상태와 콘솔을 확인한다.**

```text
1. 계좌정보 복사 버튼을 클릭한다.
2. 브라우저 클립보드가 정확히 04908774202501인지 확인한다.
3. aria-live="polite" 영역이 계좌번호가 복사되었습니다.를 표시하는지 확인한다.
4. Clipboard API가 실패하는 상태에서 계좌번호를 길게 눌러 복사해 주세요.를 표시하는지 확인한다.
5. 콘솔 error 로그가 없는지 확인한다.
```

- [ ] **Step 5: 검증 스크린샷을 커밋한다.**

```powershell
git add -- qa-screenshots/invitation-360.png qa-screenshots/invitation-640.png
git commit -m "test: verify invitation responsive layout"
```

## 계획 자체 검토

- 명세 범위: 360px 우선 셸, 다섯 색상, 도입부 배경 투명도와 순서, 제공 자산, 경력·지도·주차 정보, 직접 표시 계좌 카드, 정확한 복사와 라이브 상태를 Task 2와 Task 3이 다룬다.
- 검증: Task 1이 정적 계약을 만들고, Task 2가 이를 통과시키며, Task 3이 실제 렌더링·클립보드·콘솔을 확인한다.
- 범위: HTML·CSS·최소 JavaScript·검증기만 포함하므로 별도 하위 프로젝트로 나눌 필요가 없다.
- 일관성: 복사 버튼 ID는 `copy-account-number`, 상태 영역 ID는 `copy-status`, 복사 문자열은 `04908774202501`으로 모든 작업에서 동일하다.
