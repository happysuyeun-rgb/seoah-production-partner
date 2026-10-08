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
| PRODUCTION | Hosting | DONE | 기존 Sites 유지, 공개 설정 확인 |
| PRODUCTION | Production URL | DONE | https://seoah-production-partner.happysuyeun.chatgpt.site |
| PRODUCTION | HTTPS | DONE | 기존 공개 배포의 TLS 연결 확인 기록 존재 |
| DOMAIN | Custom Domain | USER ACTION REQUIRED | 연결할 보유 도메인 또는 원하는 도메인 전달 필요. 구매는 별도 승인 |
| DOMAIN | DNS | USER ACTION REQUIRED | 도메인 확정 후 호스트가 반환한 실제 DNS 레코드를 등록 |
| DOMAIN | SSL | NOT STARTED | 독립 도메인 SSL 미연결. 기본 Sites 주소 HTTPS는 제공 |
| SEO | Title / Description | DONE | site.config.json 단일 설정으로 생성 |
| SEO | Semantic HTML | DONE | ko, 단일 H1, 실제 텍스트·섹션·헤딩·내부 앵커 코드 검사 |
| SEO | robots.txt | DONE | Allow: / 및 현재 sitemap 주소 생성, 10/7 공개 HTTP 200 확인 |
| SEO | sitemap.xml | DONE | 현재 공개 origin 생성, 10/7 공개 HTTP 200 확인 |
| SEO | canonical | DONE | 실제 현재 origin 적용. 도메인 변경 시 siteUrl 갱신 |
| SEO | Open Graph | DONE | 실제 브랜드 OG 표지와 공유 메타데이터 준비 |
| SEARCH ENGINES | Google Search Console | USER ACTION REQUIRED | 사용자 계정 로그인 후 HTML 소유권 확인 태그를 전달 |
| SEARCH ENGINES | Google Sitemap | NOT STARTED | 소유권 확인 뒤 제출, 성공 증빙 필요 |
| SEARCH ENGINES | Naver Search Advisor | USER ACTION REQUIRED | 사용자 계정 로그인 후 사이트 소유권 확인 태그를 전달 |
| SEARCH ENGINES | Naver Sitemap | NOT STARTED | 소유권 확인 뒤 제출, 성공 증빙 필요 |
| ANALYTICS | Tracking Ready | DONE | CTA/email/phone/live demo/project view 이벤트 및 설정 분리 |
| ANALYTICS | Connected | USER ACTION REQUIRED | 사용할 분석 서비스와 실제 계정 ID 결정 필요 |

## 코드 보완
- 포인터 변경을 프레임당 한 번 처리하고, 사용 중 reduced motion·입력장치 설정이 변경되면 위치를 초기화합니다.
- 스크롤 진행 표시를 width 변경에서 transform으로 바꿉니다.
- 모바일 CTA·납품 탭·주요 설명을 14px로 보완하고 작은 화면 제목, 긴 업무명, 하단 safe area를 고려합니다.
- Cursor 한글 안내와 외부 패키지 없는 로컬 미리보기 명령을 준비합니다.

## 확인 한계
현재 Sites 관리 환경에는 이 정적 사이트를 실제 브라우저로 검수할 수 있는 지원 경로가 없습니다. 따라서 실제 화면·실행·콘솔·키보드·CWV는 PASS로 표기하지 않습니다. 사이트 기본 주소로 검색 등록을 먼저 할 수 있지만 독립 도메인을 곧 연결한다면 최종 주소를 먼저 결정하는 편이 중복 등록을 줄입니다. 검색 노출이나 순위는 확인되지 않았습니다.

## 10/8 자동 HTTP 재검사
기본 Python HTTP 요청은 Cloudflare 403 / error code 1010으로 차단됐으나, 일반 브라우저 User-Agent를 사용한 익명 메인 요청은 HTTP 200을 반환했습니다. Sites 공개 설정도 확인했습니다. 이는 일반 접근 응답 확인이며 Google/Naver 로봇 수집 성공 증명은 아닙니다. 각 검색 콘솔에서 실제 수집·색인 상태를 별도로 확인해야 합니다.
