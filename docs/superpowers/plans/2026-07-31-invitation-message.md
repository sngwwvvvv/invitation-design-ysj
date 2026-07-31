# 초청 인사말 표시 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 확정된 초청 인사말을 정확한 문단 줄바꿈과 높은 대비의 패널로 인트로 영역에 표시한다.

**Architecture:** `index.html`의 자리표시자를 의미 단위별 `<p>`와 서명 영역으로 교체하고 `id="invitation-message"`를 부여한다. `styles.css`에서 인사말 패널, 본문 왼쪽 정렬, 서명 오른쪽 정렬, 모바일 여백을 정의한다. 기존 Node 기반 로컬 검증 스크립트에 콘텐츠·스타일 계약을 추가한다.

**Tech Stack:** 정적 HTML, CSS, Node.js 검증 스크립트

## Global Constraints

- 확정 문구의 문단 내부 줄바꿈과 문단 순서를 보존한다.
- 모바일에서는 자연 줄바꿈을 허용하되 가로 넘침과 텍스트 잘림을 만들지 않는다.
- 기존 네이비·플래티넘 색상 체계를 유지한다.
- 기존 행사 정보 → 초청 인사말 순서를 유지한다.

---

### Task 1: 인사말 계약을 검증 스크립트에 추가

**Files:**
- Modify: `scripts/validate-invitation-local.mjs`

**Interfaces:**
- Consumes: `index.html`, `styles.css`
- Produces: 인사말 콘텐츠·줄바꿈·패널 스타일의 PASS/FAIL 검사

- [ ] **Step 1: Write the failing test**

  검증 배열에 다음 계약을 추가한다: `id="invitation-message"`, 자리표시자 제거, 확정 문구 포함, 본문 `<br>` 줄바꿈 8개 이상, 서명 영역, 본문 왼쪽 정렬, 서명 오른쪽 정렬, 밝은 패널 배경.

- [ ] **Step 2: Run test to verify it fails**

  Run: `node scripts/validate-invitation-local.mjs index.html styles.css`

  Expected: 새 인사말 관련 검사들이 `FAIL`이고 기존 검사는 통과한다.

- [ ] **Step 3: Commit**

  테스트 계약만 커밋한다: `git add scripts/validate-invitation-local.mjs && git commit -m "test: define invitation message contract"`

### Task 2: 확정 문구와 시각 스타일 구현

**Files:**
- Modify: `index.html:19`
- Modify: `styles.css:55`

**Interfaces:**
- Consumes: Task 1의 인사말 계약
- Produces: `#invitation-message` 실제 표시 영역

- [ ] **Step 1: Replace placeholder with semantic paragraphs**

  다섯 개 본문 문단을 `<p>`로 작성하고 제공된 줄바꿈을 `<br>`로 표현한다. 날짜·직함·이름은 `.invitation-signature`로 분리한다.

- [ ] **Step 2: Add readable panel styling**

  `.invitation-message`에 `max-width`, 밝은 반투명 배경, 네이비 텍스트, 패딩, 테두리, 그림자를 적용한다. `.invitation-copy`는 왼쪽 정렬, `.invitation-signature`는 오른쪽 정렬, 문단 간격과 충분한 줄 높이를 지정한다. 모바일 미디어 쿼리에서 패널 패딩을 줄인다.

- [ ] **Step 3: Run test to verify it passes**

  Run: `node scripts/validate-invitation-local.mjs index.html styles.css`

  Expected: 모든 검사가 `PASS`.

- [ ] **Step 4: Commit**

  `git add index.html styles.css && git commit -m "feat: add approved invitation message"`

### Task 3: 렌더링 및 회귀 검증

**Files:**
- Inspect: `index.html`, `styles.css`, `scripts/validate-invitation-local.mjs`

- [ ] **Step 1: Run static checks**

  Run: `node scripts/validate-invitation-local.mjs index.html styles.css` and `git diff --check HEAD~2..HEAD`.

- [ ] **Step 2: Inspect desktop and mobile rendering**

  Serve the folder with an available local static server and verify the intro at desktop and 360px widths. Confirm no horizontal overflow, exact manual breaks, visible panel contrast, and right-aligned signature.

- [ ] **Step 3: Review final diff and status**

  Run: `git status -sb; git log -3 --oneline` and confirm only intended tracked files changed; leave `.superpowers/brainstorm/` untracked.
