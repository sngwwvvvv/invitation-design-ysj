# 주차 안내 문구 간소화 설계

## 목표

`parking-notice`의 두 문장 안내를 한 줄로 줄이고, 주차장 목록에서 주차장명(`dt`)의 시각적 위계를 소폭 높인다. 기존 주차장명·시간당 요금·요금 변동 각주와 카드의 색상 및 배치는 유지한다.

## 마크업

- `.parking-warning`과 `.parking-detail` 요소를 모두 제거한다.
- 두 요소가 있던 위치에 클래스 없는 `<p>주차장 안내(당건물 주차불가)</p>`를 한 번만 배치한다.
- `.parking-list-header`, `.parking-list`, `.parking-footnote`의 내용과 순서는 변경하지 않는다.

## 스타일

- 더 이상 사용하지 않는 `.parking-warning` 및 `.parking-detail` 규칙을 제거한다.
- `.parking-notice > p`의 기본 바깥 여백을 `0`으로 설정해 새 안내 문구가 카드의 기존 내부 여백을 따르게 한다.
- `.parking-list dt`의 기존 글자 크기 `.9375rem`에 `.5pt`를 더하고 `font-weight: 700`을 적용한다.
- `dd`, 표 머리글, 각주 및 반응형 스타일은 변경하지 않는다.

## 검증

- 로컬 계약 검증에서 새 안내 문구가 정확히 한 번 존재하고 `.parking-warning`과 `.parking-detail`이 HTML과 CSS에서 제거됐는지 확인한다.
- `dt`에 `calc(.9375rem + .5pt)`와 `font-weight: 700`이 선언됐는지 확인한다.
- 기존 주차장 세 곳과 요금, 열 머리글, 각주 및 외부 링크 검증은 유지한다.
- 모바일과 기본 너비에서 안내 영역의 줄바꿈 및 가로 넘침이 없는지 확인한다.

## 변경 범위

- `index.html`
- `styles.css`
- `scripts/validate-invitation-local.mjs`

이미지, 링크 목적지, 주차장 데이터 및 다른 섹션은 변경하지 않는다.
