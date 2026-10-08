# 운영 점검 — 2026-10-08

이 문서의 DONE은 구현·코드 검사 또는 호스팅 확인 범위를 의미합니다. 실제 브라우저 확인과 성능 실측은 각각 명시하며, 코드 검사를 화면 검수로 대신하지 않습니다.

| 영역 | 항목 | 상태 | 근거 / 다음 행동 |
|---|---|---|---|
| SITE | Implementation | DONE | 반응형 정적 페이지, 실제 연락처, 기획·협업 범위 구현 |
| SITE | Responsive | NOT STARTED | 반응형 구현·작은 글자 보완 완료. 실제 Desktop/Tablet/Mobile 화면 검수는 미실행 |
| SITE | Interaction | NOT STARTED | 스크롤·포인터·탭·펼치기 구현 및 문법 확인 완료. 실제 실행 검수는 미실행 |
| SITE | Accessibility | NOT STARTED | semantic DOM, focus, ARIA, 키보드 탭, reduced motion 구현. 실제 대비·키보드 검수 미실행 |
| SITE | Performance | NOT STARTED | 외부 JS 라이브러리·영상·WebGL 없음, 이미지 압축, transform 기반 진행 표시, rAF 포인터 적용. LCP/CLS/INP 실측 미실행 |
| PRODUCTION | Production Build | DONE | npm run build / npm run check 통과 |
| PRODUCTION | Hosting | DONE | 현재 운영은 Vercel. 2026-10-08 공개 주소 HTTPS 응답 확인. Vercel 대시보드 READY 상태는 이번 세션에서 다시 열지 않음. 이전 Sites 주소는 별도 배포 |
| PRODUCTION | Production URL | DONE | https://seoah-production-partner.vercel.app |
| PRODUCTION | HTTPS | DONE | 2026-10-08 현재 운영 주소 TLS 요청 성공. 독립 도메인 SSL은 아래 DOMAIN 행 |
| DOMAIN | Custom Domain | USER ACTION REQUIRED | 연결할 보유 도메인 또는 원하는 도메인 전달 필요. 구매는 별도 승인 |
| DOMAIN | DNS | USER ACTION REQUIRED | 도메인 확정 후 호스트가 반환한 실제 DNS 레코드를 등록 |
| DOMAIN | SSL | NOT STARTED | 독립 도메인 SSL 미연결. 현재 Vercel 주소 HTTPS는 제공 |
| SEO | Title / Description | DONE | site.config.json 단일 설정으로 생성 |
| SEO | Semantic HTML | DONE | ko, 단일 H1, 실제 텍스트·섹션·헤딩·내부 앵커 코드 검사 |
| SEO | robots.txt | DONE | Allow: / 및 현재 Vercel sitemap 주소로 생성. 2026-10-08 공개 HTTP 200 확인. 검색 로봇 수집 성공은 아님 |
| SEO | sitemap.xml | DONE | 현재 Vercel origin으로 생성. 2026-10-08 공개 HTTP 200 확인. 검색 콘솔 제출·색인 완료와는 별개 |
| SEO | canonical | DONE | site.config.json의 Vercel origin으로 생성. 도메인 변경 시 siteUrl 갱신 |
| SEO | Open Graph | DONE | 실제 브랜드 OG 표지와 공유 메타데이터 준비 |
| SEARCH ENGINES | Google Search Console | USER ACTION REQUIRED | 직접 확인: 태그가 현재 주소 공개 HTML에 있음. 사용자 확인 기록: 10:32 KST 운영 주소용 태그를 설정에 반영. 콘솔의 소유 확인 완료 문구는 없음 |
| SEARCH ENGINES | Google Sitemap | NOT STARTED | 이 주소의 제출·처리 성공 기록 없음. 이전 Sites 주소의 처리 완료를 이 주소의 제출이나 색인 완료로 보지 않음. 실제 검색 노출은 미확인 |
| SEARCH ENGINES | Naver Search Advisor | USER ACTION REQUIRED | 직접 확인: 태그가 현재 주소 공개 HTML에 있음. 사용자 확인 기록: 10:19 KST Vercel 도메인용 태그를 설정에 반영. 콘솔의 소유 확인 완료 문구는 없음 |
| SEARCH ENGINES | Naver Sitemap | NOT STARTED | 소유 확인 뒤 제출. 제출·수집 성공 기록 없음. 실제 검색 노출은 미확인 |
| ANALYTICS | Tracking Ready | DONE | CTA/email/phone/live demo/project view 이벤트 및 설정 분리 |
| ANALYTICS | Connected | USER ACTION REQUIRED | 사용할 분석 서비스와 실제 계정 ID 결정 필요 |

## 코드 보완
- 포인터 변경을 프레임당 한 번 처리하고, 사용 중 reduced motion·입력장치 설정이 변경되면 위치를 초기화합니다.
- 스크롤 진행 표시를 width 변경에서 transform으로 바꿉니다.
- 모바일 CTA·납품 탭·주요 설명을 14px로 보완하고 작은 화면 제목, 긴 업무명, 하단 safe area를 고려합니다.
- Cursor 한글 안내와 외부 패키지 없는 로컬 미리보기 명령을 준비합니다.

## 확인 한계
현재 운영 주소는 https://seoah-production-partner.vercel.app 입니다. 화면·실행·콘솔·키보드·CWV는 이번에도 실측하지 않았으므로 PASS로 적지 않습니다. 이전 Sites 주소의 검색 등록 상태는 현재 주소로 이전되지 않습니다. 검색 노출이나 순위는 확인되지 않았습니다.

## 10/8 공개 응답
이전 Sites 주소에 대한 기본 Python HTTP 요청은 Cloudflare 403 / error code 1010으로 차단됐고, 일반 브라우저 User-Agent를 사용한 익명 메인 요청은 HTTP 200이었습니다. 이는 그 주소의 일반 접근 확인이며 로봇 수집 성공이 아닙니다.

2026-10-08 현재 운영 주소의 `/`, `/robots.txt`, `/sitemap.xml`은 HTTP 200이었고, canonical·소유 확인 태그·사이트맵 주소가 site.config.json과 같았습니다. 저장소 `dist`는 같은 설정으로 다시 빌드했고 `npm run build`와 `npm run check`를 통과했습니다. 이것은 직접 확인한 배포 결과입니다.

같은 날 사용자 확인으로 남은 콘솔 기록은, 10:19 KST 네이버 태그와 10:32 KST Google 태그를 Vercel 운영 주소용으로 설정에 반영한 것입니다. 콘솔의 소유 확인 완료, 사이트맵 처리, URL 검사 문구는 이 주소로 남아 있지 않습니다. 실제 검색 노출은 미확인입니다.

## 디자인 개편 브랜치 검수 — design/korean-editorial-landing (운영 미반영)
위 표는 main(운영) 기준이며, 이 브랜치가 merge되기 전에는 바꾸지 않습니다. 아래는 2026-10-08 로컬 미리보기(127.0.0.1:8080)에서 측정한 결과입니다. Vercel Preview는 Vercel 로그인 보호(302 → SSO)로 외부 측정을 하지 못했습니다.

측정함 (로컬 headless Chrome, CDP)
- 320×568 · 375×667 · 390×844 · 768×1024 · 1024×768 · 1440×900 · 720×450(1440×900의 200% 확대 상당): 가로 넘침 없음, 44px 미만 링크·버튼 없음, Hero CTA 첫 화면 안, #contact 도착 시 제목·이메일·전화가 nav 아래 화면 안, 모바일 고정 CTA는 Hero CTA가 보일 때와 연락처 패널이 보일 때 숨김.
- 실제 키 입력: Tab 순서(본문 이동 → 로고 → 메뉴), 제작 범위 summary Enter/Space 펼침·닫힘, 납품 탭 ←/→/Home/End, 사례 확대 dialog Enter 열기 → 닫기 버튼 포커스 → Escape/닫기 후 원래 버튼으로 포커스 복귀.
- JavaScript 끔: 납품 3개 패널 모두 표시, 탭 스위치·확대 버튼 숨김, 본문·연락처 링크 유지, 이동 효과 없음.
- reduced motion: 읽기 진행 표시 scaleX 0→1 정상, Hero·도식·레이어 transform 없음, 전환 시간 0.
- 404: 제목·noindex 유지, 390px 가로 넘침 없음. 콘솔 오류 0건.
- Lighthouse(로컬, 압축 없는 미리보기 서버): Mobile 성능 0.87(FCP 2.9s, LCP 3.2s, CLS 0, TBT 0ms), 접근성 1, 권장사항 1, SEO 1 / Desktop 성능 0.99, 접근성 1, 권장사항 1, SEO 1 / Mobile devtools 실제 스로틀링 성능 0.93(FCP·LCP 2.6s). 실제 사용자 CWV가 아닙니다.

코드 검사
- npm run build / npm run check 통과. canonical·소유 확인 태그·JSON-LD·OG·연락처 유지, robots·sitemap·404·site.config.json 변경 없음.

미확인
- 실제 iOS Safari·Android Chrome 기기, 화면 낭독기, 브라우저 자체 200% 확대(뷰포트 축소로만 재현), Vercel Preview·운영의 압축 적용 후 성능, 실제 사용자 CWV.
