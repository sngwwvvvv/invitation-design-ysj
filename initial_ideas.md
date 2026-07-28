# invitation design inital ideas

## objectives

- 개업식 초청장으로 사용할 design layout 생성
- design layout에 대한 color scheme 설정
- 소감문과 후원계좌는 placeholder로 설정, 나머지는 'design layout'에 입력함

## design layout

전반적인 layout은 다음과 같음

```html
<div class="reflection-sector"> <!--개업에 대한 간단한 소감문을 삽입하는 sector-->
    <img src="/img/hoyeon_logo_vertical.png"> <!--법인 로고 sector 최상단으로-->
    새로운 시작을 알려드립니다 (등 개업식 초청장에 적합한 문구 삽입)
    <div class="reflection-placeholder">
        <!--소감문 내용은 임의로 작성하지 말고 빈칸으로 둘 것-->
    </div>
</div>
<div class="profile-sector"> <!--개업자의 간단한 약력을 소개하는 sector-->
    <table>
        <tbody>
            <tr>
                <td class="profile-title"> <!--개업자 성함, 연락처 정보-->
                    <dl>
                        <dt>윤성중 부대표</dt>
                        <dt>Tel. 02-566-6596</dt>
                        <dt>Mobile. 010-3875-6596</dt>
                        <dt>E-mail. ysj5988@ihoyeonacc.com</dt>
                    </dl>
                </td>
                <td class="profile-image"> <!--개업자 프로필사진-->
                    <img src="/img/portrait_ysj.png">
                </td>
                <td class="profile-body"> <!--개업자의 약력 정보-->
                    <dl>
                        <dd>국립세무대학 내국세학과 졸업</dd>
                        <dd>고려대학교 법무대학원 조세법학과 졸업</dd>
                        <dd>한국세무사</dd>
                        <dd class="blank">&nbsp;</dd>
                        <dd>[주 요 경 력]</dd>
                        <dd>국세청 근무경력 30년</dd>
                        <dd>전 서울지방국세청 조사4국 조사팀장</dd>
                        <dd>전 서울지방국세청 국제거래조사국 조사팀장</dd>
                        <dd>전 성동세무서 법인세과장</dd>
                        <dd>전 동고양세무서 납세자보호담당권</dd>
                        <dd>전 서울지방국세청 송무국 상증팀장</dd>
                        <dd>전 서울지방국세청 조사1국 조사팀</dd>
                        <dd>전 서울지방국세청 조사2국 조사팀</dd>
                        <dd>전 서초세무서 조사과 조사팀장</dd>
                        <dd>전 강동세무서 재산세과 제산1팀장</dd>
                    </dl>
                </td>
            </tr>
        </tbody>
    </table>
</div>
<div class="map-sector"> <!--찾아오는 길 약도 sector-->
    <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_CLIENT_ID"></script>
    <!--https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html 참고할 것 !!-->
    <div class="map-iframe-sector">
        <!--네이버 지도를 iframe으로 직접 랜더링-->
    </div>
    <div class="map-redirect-sector">
        <!--네이버 지도 web (web환경)/네이버 지도 app (app 환경) 으로 redirect하는 버튼 추가-->
    </div>
</div>
<div class="information-sector"> <!--안내 세부 내용 sector-->
    <p>서울특별시 강남구 테헤란로81길 14, 8층 (카이마빌딩)</p>
    <div class="parking-lot-sector">
        주차 안내
        <div class="parking-lot-info">
            <!--아직 확정 내용 없음. placeholder로 둘것-->
        </div>
    </div>
</div>
<div class="account-sector"> <!--후원계좌 입력 sector-->
    축하의 말씀 부탁드려요 (아직 문구 미정)
    <button class="account-popup-btn"> <!--버튼 클릭 event 감지하여 모달창 return-->
        <script>
            // 계좌 정보를 보여주고, 계좌 정보 옆의 "계좌 복사" 버튼 클릭시 계좌번호를 클립보드로 복사
            // 계좌번호 복사 시 하이픈 ("-") 은 제거하고 숫자 형태의 string으로 복사해야 함
        </script>
</div>
```

## color schema

- main color : NAVY (#142755 또는 이와 비슷한 색상의 후보군)
- sub color : GREY (#A9AABC 또는 이와 비슷한 색상의 후보군)
- 이외 필요한 경우 추가 색상을 넣되, main, sub colour 포함하여 최대 5개까지만 허용
