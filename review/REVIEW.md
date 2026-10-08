# 이서아 랜딩 외부 리뷰 자료

검수 커밋: `3e13c7c`  
브랜치: `design/korean-editorial-landing`  
일시: 2026-10-08  
화면: 로컬 Preview `http://127.0.0.1:8080` 를 Chrome headless로 연 실제 렌더.  
글꼴: Pretendard Variable 로드를 확인한 뒤 캡처했다.

Vercel Preview의 임시 인증 링크가 403인 것은 배포 보호 때문이며, 이 페이지의 코드 오류로 보지 않았다. 보호 설정은 바꾸지 않았다. `main` merge와 Production push도 하지 않았다.

## 화면 캡처

Desktop 1440×900

- `review/desktop-1440-hero.png`
- `review/desktop-1440-capabilities.png`
- `review/desktop-1440-work.png`
- `review/desktop-1440-contact.png`
- `review/desktop-1440-full.png` (1440×7618)

Mobile 390×844

- `review/mobile-390-hero.png`
- `review/mobile-390-capabilities.png`
- `review/mobile-390-work.png`
- `review/mobile-390-contact.png`
- `review/mobile-390-full.png` (390×7983)

가로 스크롤은 두 크기 모두 없었다 (`scrollWidth - innerWidth = 0`).

## 인터랙션

측정값은 `review/results.json`에 있다. 보조 화면은 `review/checks/`에 있다.

| 항목 | 결과 |
| --- | --- |
| 데스크톱 메뉴 앵커 (범위, 사례, 협업, 납품, 문의) | 확인. 대상 섹션 상단이 메뉴(64px) 아래 12px 안에 멈춤 |
| 히어로 “제작 범위 보기” | 확인. `#capabilities`로 이동 |
| 로고로 처음으로 | 확인. 문서 맨 위(top 0)로 복귀. 첫 섹션이라 메뉴 높이만큼 아래에 붙지는 않음 |
| 모바일 메뉴 앵커 4개 | 확인. 메뉴 높이 56px 기준으로 정렬 |
| 제작 범위 펼침·닫힘 | 확인. 02를 열고 닫음. 기본으로 열린 01도 닫았다가 다시 열림 |
| 납품 탭 클릭 | 확인. “콘텐츠 수정” 선택, 해당 패널 표시 |
| 납품 탭 키보드 | 확인. 포커스된 탭에서 ArrowRight → 맞춤 기능, Home → 기본 구축, End → 맞춤 기능, ArrowLeft → 콘텐츠 수정 |
| 작업 화면 확대 | 확인. Desktop 크게 보기가 다이얼로그를 열고 닫기 버튼에 포커스 |
| 닫기 버튼 | 확인. 다이얼로그가 닫히고 포커스가 `Desktop 크게 보기`로 복귀 |
| Escape | 확인. 다시 연 뒤 Escape로 닫히고 같은 버튼으로 포커스 복귀 |
| 모바일 고정 문의 버튼 | 확인. 히어로에서는 숨김, 사례에서는 표시, 문의 구간에서는 숨김. 표시 중 클릭하면 `#contact`로 이동 |
| 사례 정보와 고정 버튼 | 확인. 390×844에서 여섯 행은 버튼(상단 784px)과 겹치지 않음. 결과 행 하단 748px |
| reduced motion | 확인. Chrome에서 `prefers-reduced-motion: reduce`를 켠 상태. 스크롤은 `auto`, 제목 높이 213px·불투명도 1, 섹션 제목 transform 없음, `--hy`는 0. 문의 앵커는 350ms 안에 정렬 |

짧은 녹화: `review/desktop-1440-contact-anchor.gif`  
데스크톱에서 “프로젝트 문의”를 누른 직후 1.8초, 12프레임. 용량을 줄이려고 가로 800px로 축소했다. 원본 해상도 영상은 없다.

## 작업 사례 이미지

데스크톱 `dist/work-desktop.webp`(1200×750)는 같은 조건의 새 캡처와 픽셀 차이 1.1%였다. 제목, “제작할 손” 밑줄, 빛 원과 점의 배치가 같다. 교체하지 않았다. `work-desktop-600.webp`도 그대로다.

모바일 `dist/work-mobile.webp`는 차이가 15.7%였다. 오른쪽 위 빛과 줄바꿈이 최신 화면과 달랐다. 이번 390×844 캡처로 교체했고, 교체 후 차이는 0%다. 이 파일은 아직 커밋하지 않았다.

## 빌드

`npm run build` PASS  
`npm run check` PASS

check 스크립트 문구의 “브라우저 렌더링은 별도 대기”는 그 스크립트가 브라우저를 열지 않는다는 뜻이다. 이번 브라우저 확인은 위 표가 기준이다.

## 미확인

- 실제 휴대폰과 데스크톱 모니터에서의 조작
- 운영체제 설정으로 켠 reduced motion. 이번 확인은 Chrome 미디어 에뮬레이션
- 스크린 리더
- Vercel Preview 화면. 인증 링크 403은 보호 설정이며 페이지를 그 주소로 보지 못했다
- Lighthouse와 Core Web Vitals
- 원본 1440px 화면 녹화. 있는 파일은 800px로 줄인 GIF
