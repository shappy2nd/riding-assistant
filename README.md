# Riding Assistant

라이딩 일정·코스·주행·기록을 관리하는 라이딩 비서 웹앱의 공동 편집용 저장소입니다.

## Migration status

- GitHub 공동 편집 저장소 준비 완료
- 현재 ChatGPT Site의 원본 프로젝트 소스는 아직 이 저장소로 추출되지 않음
- 원본으로 확인되지 않은 재작성 코드는 커밋하지 않음
- Kakao / Strava 비밀정보는 `.env`로 분리하고 커밋하지 않음

## Current production site

`riding-assistant.mose85.chatgpt.site`

## Known product areas

- 오늘
- 코스
- 주행
- 기록
- 설정
- Kakao 지도/경로 연동
- Strava 연동

## Security

실제 API 키, Client Secret, OAuth access/refresh token은 GitHub에 올리지 마세요. 필요한 변수명만 `.env.example`에 유지합니다.

## Next migration step

ChatGPT Site 원본 프로젝트 파일 또는 내보낸 ZIP을 확보하면 해당 파일을 원본 그대로 이 저장소에 이관하고, 이후 두 ChatGPT 계정에서 같은 GitHub 저장소를 기준으로 수정합니다.
