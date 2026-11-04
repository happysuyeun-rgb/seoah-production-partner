# B2B 문의 폼 — 현재 운영 구조

- Vercel `/api/contact` → Google Apps Script → Gmail `seoah.lab@gmail.com`.
- 별도 DB·Google Sheets·Resend 없음. 2026-10-26 운영 테스트 수신 및 사용자 확인 완료.
- 모든 입력·동의가 유효해야 버튼 활성화, 전송 중 중복 클릭 차단.

## 서버 설정

`CONTACT_ENABLED=true`, `CONTACT_SCRIPT_URL`(승인된 exec URL), `CONTACT_SHARED_SECRET`(서버 전용), `CONTACT_SITE_ORIGIN`(해당 환경의 정확한 origin).
Secret을 Git·클라이언트·로그에 노출하지 않는다. Preview와 Production 설정을 구분한다.

## 검증·남은 일

- API에서 필수 이름·연락처·문의 내용·상황·동의·요청 ID·honeypot·origin·크기 검증.
- `node scripts/contact-test.mjs`: mock 검사, 메일 발송 없음. 빈 내용 거절, 공급자 실패 502·rate_limited 429 검사.
- origin·honeypot은 보조 방어이며 요청 횟수 제한의 대체가 아니다.
- Apps Script 기존 전역 요청 제한·캐시 기반 중복 방지는 운영 설정 재확인 대상. exactly-once 보장으로 표현하지 않는다.
- Vercel 플랫폼 요청 제한 적용·실차단 검증은 미완료. 운영 API 대량 테스트 금지.
- 모바일·키보드·전송 실패·재시도 브라우저 재검수는 별도 기록한다.

## 개인정보 운영

화면의 상담 목적 수집·Vercel/Google 처리·국외 처리 가능성 안내를 유지한다. 상담 종료 후 90일 이내 삭제는 운영자가 수행할 절차이며 자동 삭제 구현이 아니다. 법적 적합성 검토 완료를 뜻하지 않는다.
불필요한 테스트메일 재발송은 하지 않는다.
