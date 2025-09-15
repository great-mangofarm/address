# 카카오 주소 검색 프로젝트

카카오 우편번호 API를 사용한 주소 검색 리액트 애플리케이션입니다.

## 기능

- 카카오 우편번호 API를 통한 주소 검색
- 선택된 주소의 필요한 데이터만 필터링하여 표시
- 지번주소, 도로명주소, 우편번호, 시도, 시군구, 법정동코드 정보 제공
- 좌표 정보 (lon, lat) - 카카오 Maps API 키 필요
- 반응형 디자인

## 표시되는 필드

- `lot_address`: 지번 주소
- `road_address`: 도로명 주소  
- `zipcode`: 우편번호
- `lon`: 경도 (카카오 Maps API 키 필요)
- `lat`: 위도 (카카오 Maps API 키 필요)
- `city`: 시도
- `district`: 시군구
- `address_code`: 법정동 코드

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm start
```

3. 빌드:
```bash
npm run build
```

## 좌표 정보 사용하기

좌표 정보(lon, lat)를 사용하려면:

1. 카카오 개발자 사이트에서 앱 등록 및 JavaScript 키 발급
2. `public/index.html`에서 주석 처리된 Maps API 스크립트의 `YOUR_APP_KEY`를 실제 키로 교체
3. 주석을 해제하여 스크립트를 활성화

```html
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=실제_앱_키&libraries=services"></script>
```

## 사용된 기술

- React 18
- Webpack 5
- Babel
- 카카오 우편번호 API (Daum Postcode)
- 카카오 Maps API (선택사항, 좌표 정보용)

## 프로젝트 구조

```
src/
  ├── components/
  │   └── AddressSearch.js    # 주소 검색 컴포넌트
  ├── App.js                  # 메인 앱 컴포넌트
  ├── index.js               # 앱 진입점
  └── index.css              # 전역 스타일
public/
  └── index.html             # HTML 템플릿
```

## 주요 특징

- 카카오 우편번호 API의 모든 반환 데이터를 한국어 라벨로 표시
- 깔끔한 UI/UX 디자인
- 반응형 레이아웃
