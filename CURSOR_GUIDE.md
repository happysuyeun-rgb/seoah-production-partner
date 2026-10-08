# Cursor에서 편집하기

이 프로젝트는 이서아의 B2B 제작 파트너십 랜딩페이지입니다. 기존 Seoah-studio 플랫폼과 별개입니다.

## 처음 열기
1. Cursor의 Clone Repository에서 https://github.com/happysuyeun-rgb/seoah-production-partner.git 을 입력합니다. ZIP을 다운로드했다면 압축을 풀고 Open Folder로 폴더를 엽니다.
2. Node.js 22 이상을 사용합니다. 외부 npm 패키지가 없어 npm install은 필요하지 않습니다.
3. Cursor 터미널에서 `npm run build`와 `npm run check`를 실행합니다.
4. 미리보기는 `npm run preview`를 실행하고 표시된 로컬 주소를 브라우저에서 엽니다. 종료는 Ctrl+C입니다.

## 수정할 파일
- 문구·섹션·연락처: dist/index.html
- 색·타이포그래피·반응형: dist/style.css
- 인터랙션: dist/app.js
- 실제 프로젝트·완성 템플릿: dist/content.js
- 도메인·SEO·검색 소유권 코드: site.config.json

index.html의 SEO START/END 영역은 빌드가 자동 생성하므로 직접 편집하지 않습니다. 도메인은 siteUrl 한 곳에서 변경하고 다시 빌드합니다.

## Cursor에 줄 요청 예시
“기존 디자인과 실제 콘텐츠를 유지하면서 [변경 내용]만 수정해줘. 가짜 프로젝트·성과·템플릿을 만들지 말고, 변경 후 npm run build와 npm run check를 실행해줘. 실제 브라우저에서 확인하지 못한 사항은 미확인으로 표시해줘.”

## 저장과 배포
수정 → 빌드·검사 → 브라우저 검수 → GitHub commit/push 순서로 보관합니다.
GitHub 업로드는 소스 보관이며 기존 Sites에 자동 배포되지 않습니다. 이 대화에서 최신 GitHub 소스로 Sites 업데이트를 요청하면 됩니다. 다른 호스팅으로 이동할 때는 dist 폴더가 정적 배포 루트입니다.

## 검색 등록
현재 origin: https://seoah-production-partner.happysuyeun.chatgpt.site
Google·네이버에서 제공한 정확한 HTML 소유권 코드만 verification.google / verification.naver에 넣고 빌드·재배포한 뒤 확인합니다. 계정 비밀번호·API secret은 파일에 넣지 않습니다.
