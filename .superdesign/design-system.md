# 호연회계법인 개업식 초청장 디자인 시스템

## 제품 및 목적

- 산출물: 별도 빌드 과정이 필요 없는 한 페이지 정적 HTML 초청장
- 대상: 개업식 초대 손님. 고령 사용자가 포함되므로 큰 글자, 높은 명암, 단순한 정보 흐름을 우선한다.
- 핵심 행동: 행사 일시와 위치를 확인하고, 정적 지도 캡처와 삼성역 도보 안내를 살펴본 뒤 필요하면 네이버 지도에서 장소 정보를 확인한다.
- 외부 이동: `네이버 지도에서 확인하기` 버튼 외에는 허용하지 않는다.
- 정보는 접거나 숨기지 않는다. 주요 경력 전체를 처음부터 표시한다.

## 정보 구조

1. 하나의 상단 섹션: 로고, `호연회계법인에서의 새로운 출발을 알려드립니다`, 날짜·시간 placeholder, 장소
2. 상단 섹션과 좁은 간격으로 이어지는 초청 소감문 placeholder
3. 경력사항 소개: 왼쪽 인물 사진, 오른쪽 윤성중 부대표 이름과 주요 경력
4. 오시는 길: 정적 지도 캡처, 주소, 2호선 삼성역 도보 안내, 큰 네이버 지도 확인 버튼, 주차 안내 placeholder
5. 축하 문구와 후원계좌 placeholder

## 시각 방향

- 스타일: 격식 있고 전문적인 공식 안내문. 기업 신뢰감과 구조적 명료성을 우선한다.
- 레퍼런스: Superdesign의 `Mosaic Grid Architecture Style`에서 얇은 구분선, 넉넉한 여백, 평면적인 정보 구획만 차용한다.
- 사용하지 않을 요소: 모자이크 배경, 벤토 장식, 기술적 모노스페이스 표현, 거대한 영문 타이포그래피, 그림자, 그라데이션, 장식 애니메이션.
- 페이지는 서브 그레이 배경 위 중앙 정렬된 최대 폭 640px 모바일 단일 열 콘텐츠로 구성한다.
- 섹션은 1px 웜 아이보리 구분선을 가진 네이비 평면 카드로 분리한다.
- 모서리 반경은 6~10px로 작게 유지한다.

## 색상 토큰

전체 팔레트는 아래 5개만 사용한다. 투명도 변형은 동일 색상의 파생값으로 취급한다.

- `--navy: #142755` — 본문 카드 배경
- `--gray: #A9AABC` — 페이지 배경
- `--green: #35B84A` — 로고와 작은 포인트에만 사용
- `--ivory: #F6F4EF` — 보조 정보와 경계선
- `--white: #FFFFFF` — 제목, 버튼, 구분선과 주요 본문

색 사용 규칙:

- 본문 텍스트는 네이비 카드 위 화이트를 기본으로 사용한다.
- 보조 정보는 웜 아이보리를 사용하며 크기와 굵기를 충분히 확보한다.
- 버튼은 화이트 배경과 네이비 글자를 사용한다.
- 구분선은 화이트 또는 웜 아이보리를 낮은 투명도로 사용한다.
- 그린은 로고와 작은 상태·위치 포인트에만 사용한다.

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

- 로고: `/img/hoyeon_logo_vertical.png`, 원본 비율 유지, 아이보리 또는 흰색 배경 위에 충분한 안전 여백 제공.
- 인물 사진: `/img/portrait_ysj.png`, 원본 전체를 `object-fit: contain`으로 표시하고 아래쪽에 정렬한다. 얼굴과 상반신을 자르거나 왜곡하지 않는다.
- 지도 캡처: `/img/map_capture.png`, 콘텐츠 폭 전체에 원본 비율로 표시한다.
- 지하철 아이콘: `/img/Seoul_Metro_Line_2.svg.webp`, 원형 비율을 유지하고 `2호선 삼성역 5번출구에서 도보 약 10분` 문구 앞에 작은 크기로 배치한다.
- 별도의 장식 이미지와 아이콘 세트는 추가하지 않는다.

## 구성 요소

- `InvitationHero`: 로고, `호연회계법인에서의 새로운 출발을 알려드립니다`, 날짜·시간 placeholder와 장소.
- `ReflectionSection`: 상단 섹션과 좁은 간격으로 이어지는 소감문 placeholder.
- `ProfileSection`: 경력사항 소개 제목, 왼쪽 인물 사진, 오른쪽 이름·주요 경력 목록.
- `MapSection`: 정적 지도 캡처, 주소, 2호선 삼성역 도보 안내, 네이버 지도 장소 확인 버튼, 주차 안내, 이미지 로딩 실패 안내.
- `AccountNotice`: 축하 문구, 후원계좌 placeholder, 추후 모달과 복사 동작을 위한 버튼 자리.

## 동작 규칙

- 유일한 외부 이동은 `네이버 지도에서 확인하기` 버튼이다.
- 지도는 iframe이나 Web Dynamic Map API를 사용하지 않고 `/img/map_capture.png` 정적 이미지만 표시한다.
- 주소 바로 아래에 2호선 아이콘과 `2호선 삼성역 5번출구에서 도보 약 10분` 문구를 한 줄로 표시한다.
- 네이버 지도 확인 버튼은 길찾기 메뉴가 아니라 `서울특별시 강남구 테헤란로81길 14` 주소 검색 결과와 장소 정보가 바로 보이는 URL을 연다.
- 지도 이미지 로딩 실패 시에도 주소, 대중교통 안내와 네이버 지도 확인 버튼은 그대로 사용할 수 있어야 한다.
- `마음 전하실 곳` 버튼은 페이지 내부 모달을 실제로 열고 닫아야 한다. 정보가 확정되기 전에는 모달 안에 placeholder 상태를 명확히 표시한다.
- 계좌번호 복사 시 하이픈을 제거한 숫자 문자열을 클립보드에 쓴다. 실패하면 사용자가 직접 선택할 수 있는 원문을 유지한다.
- 모달은 키보드로 열고 닫을 수 있고, 배경 클릭과 Escape로 닫을 수 있어야 한다.

## 성능 및 접근성

- 프레임워크와 불필요한 외부 라이브러리를 사용하지 않는다.
- JavaScript는 지도 보조, 모달, 클립보드 복사에 필요한 최소 범위로 제한한다.
- 지속 애니메이션, 스크롤 효과, 자동 재생 요소를 사용하지 않는다.
- 키보드 포커스 표시를 제거하지 않는다.
- 버튼의 최소 터치 영역은 44px 이상으로 한다.
- 의미론적 HTML과 명확한 제목 계층을 사용한다.

## Superdesign 생성 제약

Use ONLY the fonts, colors, spacing, and component styles defined in this design system. Do not introduce any fonts, colors, gradients, shadows, decorative patterns, or visual styles not in the design system. Use one fixed mobile-width single-column page shell on every viewport with no media queries. In ProfileSection, keep the approved two-column B layout: uncropped bottom-aligned portrait on the left and name plus all ten career entries on the right, with both bottoms aligned. Do not show contact, education, or certification lines. In MapSection, use the provided static map capture at its original aspect ratio, add the Line 2 icon and walking guidance directly below the address, and label the single external button `네이버 지도에서 확인하기`; never render an iframe, API map, or directions form. Include working inline account-modal behavior in the preview.
