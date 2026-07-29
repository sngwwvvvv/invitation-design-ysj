# 호연회계법인 개업식 초청장 디자인 시스템

## 제품 및 목적

- 산출물: 별도 빌드 과정이 필요 없는 한 페이지 정적 HTML 초청장
- 대상: 개업식 초대 손님. 고령 사용자가 포함되므로 큰 글자, 높은 명암, 단순한 정보 흐름을 우선한다.
- 핵심 행동: 행사 일시와 위치를 확인하고, 정적 지도 캡처와 삼성역 도보 안내를 살펴본 뒤 필요하면 네이버 지도에서 장소 정보를 확인하며, 계좌번호를 페이지에서 직접 확인·복사한다.
- 외부 이동: `네이버 지도에서 확인하기` 버튼 외에는 허용하지 않는다.
- 정보는 접거나 숨기지 않는다. 주요 경력 전체를 처음부터 표시한다.

## 정보 구조

1. 하나의 통합 도입부: 가로형 로고, `호연회계법인에서의 새로운 출발을 알려드립니다`, 승인된 초청 인사말, 별도 일시·장소 강조 블록
2. 경력사항 소개: 왼쪽 인물 사진, 오른쪽 윤성중 부대표 이름과 주요 경력
3. 오시는 길: 정적 지도 캡처, 주소, 2호선 삼성역 도보 안내, 큰 네이버 지도 확인 버튼, 승인된 주차 안내 문구
4. 별도 제목 없는 계좌 안내: 안내 문구, 우리은행 계좌 정보, 계좌번호 복사 버튼

## 시각 방향

- 스타일: 격식 있고 전문적인 공식 안내문. 기업 신뢰감과 구조적 명료성을 우선한다.
- 레퍼런스: Superdesign의 `Mosaic Grid Architecture Style`에서 얇은 구분선, 넉넉한 여백, 평면적인 정보 구획만 차용한다.
- 사용하지 않을 요소: 모자이크 배경, 벤토 장식, 기술적 모노스페이스 표현, 거대한 영문 타이포그래피, 그림자, 그라데이션, 장식 애니메이션.
- 페이지는 Platinum Cool Gray 배경 위 중앙 정렬된 최대 폭 640px 모바일 단일 열 콘텐츠로 구성한다.
- 넓은 배경과 본문 영역은 Platinum Cool Gray와 Slate Steel을 약 80% 사용하고, Deep Navy·Standard Blue·Vivid Green은 제목과 핵심 요소에 약 20%만 사용한다.
- 짙은 색으로 카드 전체를 채우지 않는다. 밝은 평면 위 얇은 Standard Blue 구분선과 충분한 여백으로 정보 위계를 만든다.
- 모서리 반경은 6~10px로 작게 유지한다.

## 색상 토큰

전체 팔레트는 아래 5개만 사용한다. 투명도 변형은 동일 색상의 파생값으로 취급한다.

- `--deep-navy: #0A2D54` — 메인 제목, 핵심 정보, 주요 버튼
- `--standard-blue: #0063A6` — 섹션 제목, 구분선, 네이버 지도 버튼
- `--vivid-green: #43A64E` — 달력·지도 핀·버튼 내부의 작은 포인트
- `--platinum-cool-gray: #F0F4F8` — 페이지와 넓은 카드 배경
- `--slate-steel: #64748B` — 인사말, 경력, 주소, 주차 안내 본문

색 사용 규칙:

- 본문 텍스트는 밝은 배경 위 Slate Steel을 기본으로 사용한다.
- 메인 제목, 행사 일시·장소, 계좌번호는 Deep Navy로 강조한다.
- 섹션 제목과 구분선, 네이버 지도 버튼은 Standard Blue를 사용한다.
- 계좌정보 복사 버튼은 Deep Navy를 사용한다.
- Vivid Green은 달력·지도 핀·버튼 내부 아이콘 같은 작은 포인트에만 사용한다.

## 타이포그래피

- 외부 웹폰트를 요청하지 않는 시스템 산세리프 스택을 사용한다.
- 권장 스택: `Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`.
- 본문 최소 크기: 16px, 줄 높이 1.7.
- 주소·지도 버튼: 18px 이상.
- 섹션 제목: 24~32px, 700 굵기.
- 메인 제목: 모바일 34~42px, PC 48~60px. 지나치게 압축하거나 장식하지 않는다.
- 대문자 영문 레이블이나 모노스페이스 글꼴은 사용하지 않는다.

## 단일 레이아웃

- 모든 화면에서 최대 폭 640px의 모바일 단일 열 구조를 사용한다.
- PC에서는 같은 콘텐츠 폭을 페이지 중앙에 배치한다.
- 미디어 쿼리와 JavaScript 기반 리사이즈 로직을 사용하지 않는다.
- `경력사항 소개` 제목 바로 아래는 왼쪽 사진과 오른쪽 텍스트의 2열 구조로 표시한다.
- 왼쪽 사진은 원본 비율을 유지하고 자르거나 왜곡하지 않는다. 사진 열의 아래쪽에 고정해 사진 하단과 마지막 경력 문구의 하단을 맞춘다.
- 오른쪽에는 `윤성중 부대표`, `[ 주요 경력 ]`, 주요 경력 10개 항목만 표시한다.
- 전화번호, 휴대전화, 이메일과 학력·자격 3개 문구는 경력사항에 표시하지 않는다.
- 두 열의 간격은 좁은 화면에서도 경력 문구가 읽히는 범위에서 최소화한다.
- 지도 캡처는 콘텐츠 폭 전체를 사용하고 원본 비율을 유지한다.

## 이미지

- 로고: `/img/hoyeon_logo_horizontal.png`, 원본 색상과 비율을 유지하고 필터·반전·재색상·자르기를 사용하지 않는다.
- 도입부 배경: `/img/reflection_background.png`, 통합 도입부 전체를 덮는 별도 배경 레이어에 배치하고 해당 이미지 레이어에만 `opacity: 0.4`를 적용한다. 로고와 텍스트는 완전 불투명 상태를 유지한다.
- 인물 사진: `/img/portrait_ysj.png`, 원본 전체를 `object-fit: contain`으로 표시하고 아래쪽에 정렬한다. 얼굴과 상반신을 자르거나 왜곡하지 않는다.
- 지도 캡처: `/img/map_capture_resized.png`, 콘텐츠 폭 전체에 원본 비율로 표시한다.
- 지하철 아이콘: `/img/Seoul_Metro_Line_2.svg.webp`, 원형 비율을 유지하고 `2호선 삼성역 5번출구에서 도보 약 10분` 문구 앞에 작은 크기로 배치한다.
- 별도의 장식 이미지와 아이콘 세트는 추가하지 않는다.

## 구성 요소

- `InvitationIntro`: `id="intro-section"`을 사용한다. 가로형 로고, `호연회계법인에서의 새로운 출발을 알려드립니다`, 승인된 초청 인사말, `id="event-details"`인 별도 일시·장소 강조 블록을 하나의 연속된 섹션 안에 배치한다.
- `ProfileSection`: 경력사항 소개 제목, 승인된 인물 사진, 오른쪽 이름·주요 경력 10개 항목을 유지한다.
- `MapSection`: 정적 지도 캡처, 주소, 2호선 삼성역 도보 안내, 네이버 지도 장소 확인 버튼, 주차 안내, 이미지 로딩 실패 안내.
- `AccountNotice`: 별도 `h2` 없이 `축하의 마음을 전하고자 하시는 분들을 위해 계좌 정보를 조심스럽게 안내드립니다.` 문구와 우리은행·`049-087742-02-501`·윤성중 정보를 같은 페이지에 항상 표시한다. `id="copy-account-number"` 버튼과 `aria-live="polite"` 상태 영역을 포함한다.

## 동작 규칙

- 유일한 외부 이동은 `네이버 지도에서 확인하기` 버튼이다.
- 지도는 iframe이나 Web Dynamic Map API를 사용하지 않고 `/img/map_capture_resized.png` 정적 이미지만 표시한다.
- 주소 바로 아래에 2호선 아이콘과 `2호선 삼성역 5번출구에서 도보 약 10분` 문구를 한 줄로 표시한다.
- 네이버 지도 확인 버튼은 길찾기 메뉴가 아니라 `서울특별시 강남구 테헤란로81길 14` 주소 검색 결과와 장소 정보가 바로 보이는 URL을 연다.
- 지도 이미지 로딩 실패 시에도 주소, 대중교통 안내와 네이버 지도 확인 버튼은 그대로 사용할 수 있어야 한다.
- `[일시 및 장소]` 레이블은 표시하지 않는다. 승인된 일시 문구와 주소는 `event-details` 안에서 달력·지도 핀 아이콘과 함께 강조한다.
- `축하의 말씀` 제목, `마음 전하실 곳 확인하기` 버튼, 계좌 모달과 관련 열기·닫기 JavaScript는 사용하지 않는다.
- `계좌정보 복사` 버튼은 `navigator.clipboard.writeText('04908774202501')`로 계좌번호만 하이픈 없이 복사한다.
- 복사 성공 시 `계좌번호가 복사되었습니다.`를, 실패 시 `계좌번호를 길게 눌러 복사해 주세요.`를 라이브 영역에 표시한다.

## 성능 및 접근성

- 프레임워크와 불필요한 외부 라이브러리를 사용하지 않는다.
- JavaScript는 계좌번호 클립보드 복사와 상태 안내에 필요한 최소 범위로 제한한다.
- 지속 애니메이션, 스크롤 효과, 자동 재생 요소를 사용하지 않는다.
- 키보드 포커스 표시를 제거하지 않는다.
- 버튼의 최소 터치 영역은 44px 이상으로 한다.
- 의미론적 HTML과 명확한 제목 계층을 사용한다.

## Superdesign 생성 제약

Use ONLY the fonts, colors, spacing, and component styles defined in this design system. Do not introduce any fonts, colors, gradients, shadows, decorative patterns, or visual styles not in the design system. Use one fixed mobile-width single-column page shell on every viewport with no media queries. Build one continuous InvitationIntro with the uploaded horizontal logo in its original colors, the unchanged main heading, the approved invitation message, and a separate event-details block over the uploaded reflection background at 40% background-layer opacity. In ProfileSection, keep the approved two-column B layout: uncropped bottom-aligned portrait on the left and name plus all ten career entries on the right, with both bottoms aligned. Do not show contact, education, or certification lines. In MapSection, preserve the provided static map capture at its original aspect ratio, the Line 2 icon and walking guidance, the exact address, the Naver Map URL, and the approved parking notice; never render an iframe, API map, or directions form. Remove the celebration h2 and all account-modal UI. Show the approved account notice and account data inline with a working digits-only clipboard button and accessible success/failure status.

## 640px canonical canvas

The invitation must be authored once at a canonical visual width of exactly `640px`. At viewport widths below 640px, scale the complete canvas as one unit so 360px, 430px, and 640px keep the same line breaks, line counts, information placement, and background framing.

Use this DOM model:

```html
<div class="invitation-stage">
  <div id="invitation-scale-frame" class="invitation-scale-frame">
    <main id="invitation-canvas" class="invitation-canvas">
      <!-- all existing invitation sections, including #intro-section and #account-card -->
    </main>
  </div>
</div>
```

Use this CSS model:

```css
.invitation-stage { display: flex; justify-content: center; width: 100%; }
.invitation-scale-frame { width: min(640px, 100vw); overflow: clip; }
.invitation-canvas {
  width: 640px;
  transform-origin: top left;
  will-change: transform;
}
```

Use this JavaScript model:

```js
const frame = document.getElementById('invitation-scale-frame');
const canvas = document.getElementById('invitation-canvas');
const syncInvitationScale = () => {
  const scale = Math.min(1, window.innerWidth / 640);
  canvas.style.transform = `scale(${scale})`;
  frame.style.height = `${canvas.scrollHeight * scale}px`;
};
new ResizeObserver(syncInvitationScale).observe(canvas);
window.addEventListener('resize', syncInvitationScale, { passive: true });
syncInvitationScale();
```

Follow these constraints:

- Wrap all visible invitation content in `#invitation-scale-frame` and `#invitation-canvas`.
- `#invitation-canvas` has `width: 640px`; below 640px it is transformed from `top left` by `window.innerWidth / 640`.
- The frame reserves the transformed visual height so the document flow has no overlap or blank gap.
- Do not change a child font size, child width, spacing, or wrapping rule at narrower widths.
- Put `#intro-section` and its `.intro-bg` inside `.invitation-canvas`; preserve the full section background when scaled.
- In `#intro-section`, keep the horizontal logo first, then the exact existing main heading, then `#event-details`, then the exact invitation placeholder.
- Put the exact account notice, `#account-divider`, account labels, values, copy button, and live region inside `#account-card`.
