# Riding Assistant

라이딩 일정·코스·주행·기록을 관리하는 라이딩 비서 웹앱의 공동 편집용 저장소입니다.

## Migration status

- GitHub 공동 편집 저장소 준비 완료
- 현재 ChatGPT Site의 원본 프로젝트 소스는 직접 추출되지 않아 Work 이력 기준으로 재구축 중
- 원본으로 확인되지 않은 재작성 코드는 작업 브랜치에서 검증 후 병합
- Kakao / Strava 비밀정보는 `.env`로 분리하고 커밋하지 않음

## Current production site

`riding-assistant.mose85.chatgpt.site`

## Rebuild branch

`agent/rebuild-mvp`

## Implemented in rebuild

- 오늘 / 코스 / 주행 / 기록 / 설정
- Kakao Maps SDK 동적 로딩 및 코스·주행·기록 지도
- 로컬 저장 경로/장소
- 주·월·연 누적 거리/시간 및 월간 달력 🚲 표시
- Strava OAuth 서버리스 경계
- Strava access token 자동 갱신
- 최근 활동 최대 50개 동기화
- `summary_polyline` 디코딩 후 기록 지도에 실제 경로 표시
- 동일 주행 판단: 시작 시각 10분 이내 + 거리 차 0.2km 이내이면 중복 제외

## Environment

Browser:

- `VITE_KAKAO_JAVASCRIPT_KEY`
- `VITE_STRAVA_API_BASE` (프런트와 API가 같은 origin이면 비워도 됨)

Server only:

- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `APP_ORIGIN`
- `KAKAO_REST_API_KEY` (향후 서버 경로/검색 API가 필요할 때 사용)

## Strava deployment requirement

`api/strava/*.js`는 Node 기반 서버리스 함수 형식입니다. 배포 플랫폼이 `/api` 서버리스 라우트를 지원해야 실제 OAuth가 작동합니다. Strava 개발자 설정의 Authorization Callback Domain은 실제 배포 도메인과 일치해야 합니다.

## Security

실제 API 키, Client Secret, OAuth access/refresh token은 GitHub에 올리지 마세요. Strava 토큰은 서버가 HttpOnly 쿠키로 관리하도록 구성했습니다.
