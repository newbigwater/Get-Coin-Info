# Get-Coin-Info

업비트 API를 활용한 코인 정보 분석 웹 애플리케이션입니다.

## 주요 기능

1. **데이터 조회 기능**
   - 마켓 선택 (BTC, ETH, XRP 등)
   - 기준일 선택
   - 조회 기간 설정
   - 로컬 데이터 우선 활용 및 API 호출 통합

2. **시각화 도구**
   - 가격 차트 (종가, 고가, 저가)
   - 거래량 차트
   - 변동률 차트
   - 모바일 반응형 디자인

3. **데이터 분석**
   - 코인 기본 정보 요약
   - 시장 분석 데이터 (변동성, 가격 범위 등)
   - 상세 데이터 테이블 제공

## 기술 스택

- HTML5, CSS3, JavaScript
- Chart.js - 차트 시각화
- Upbit API - 데이터 소스

## 실행 방법

1. 프로젝트 폴더에서 `index.html` 파일을 브라우저로 엽니다.
2. 마켓, 기준일, 조회 기간을 선택합니다.
3. "조회" 버튼을 클릭하여 데이터를 불러옵니다.

## 스크린샷

![Pasted image 20250610223916.png|400](00.%20attachments/Pasted%20image%2020250610223916.png)

![Pasted image 20250610223925.png|400](00.%20attachments/Pasted%20image%2020250610223925.png)

![Pasted image 20250610223935.png|400](00.%20attachments/Pasted%20image%2020250610223935.png)

![Pasted image 20250610223944.png|400](00.%20attachments/Pasted%20image%2020250610223944.png)

![Pasted image 20250610223951.png|400](00.%20attachments/Pasted%20image%2020250610223951.png)

## 참고 사항

- CORS 정책으로 인해 로컬에서 API 호출 시 제약이 있을 수 있습니다.
- 업비트 API 사용 제한이 있으므로, 로컬 파일 캐싱 기능을 활용하여 API 호출을 최소화합니다.
- 필요에 따라 서버 프록시를 구현하여 CORS 문제를 해결할 수 있습니다.