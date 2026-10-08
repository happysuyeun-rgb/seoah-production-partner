# SEOAH — B2B Web Production Partner

Static production v1.2 on existing Sites hosting. No backend, database, CMS, login, payment or runtime dependency. GitHub is optional.

## Edit with Cursor
Open this project folder. Files:
- dist/index.html — semantic, crawlable page content and navigation.
- dist/style.css — design, mobile breakpoints, focus, reduced motion.
- dist/app.js — tabs, scroll/pointer effects, future analytics event bridge.
- dist/content.js — verified case studies and completed template data.
- site.config.json — SINGLE SOURCE for production origin, SEO text, OG path, verification tokens and analytics settings.
- dist/og-cover.jpg — optimized 1200×630 dedicated brand sharing cover.

Run with Node.js 22 or later (no npm install needed):
```
npm run build
npm run check
```
Run npm run preview for a local static preview in Cursor. See CURSOR_GUIDE.md for Korean editing instructions. Deploy dist/ as the public root. Existing Sites publication must continue through Sites; editing locally does not auto-publish.

## Domain migration
1. Choose and own the hostname; do not substitute an invented domain.
2. Add the hostname to the existing Site using Sites custom-domain controls.
3. Set ONLY the A/CNAME and validation records returned for this hostname by Sites.
4. Wait for host validation and active SSL, then confirm HTTPS and public responses.
5. Change siteUrl in site.config.json to the verified HTTPS origin, run build/check and republish.
6. Canonical, JSON-LD IDs, og:url, OG image URL, sitemap and robots update together.
7. Verify a new Google/Naver property for the new origin, submit its sitemap, and configure redirects from the old origin where supported. Do not imply redirects exist before they are configured.

## Search registration
The owner authorized public access on 2026-10-07. Search property verification and sitemap submission remain pending. Public access is a prerequisite for crawlability and unfurl previews.

After owner authorizes public access:
- Anonymous GET /, /robots.txt, /sitemap.xml, /og-cover.jpg must return 200 and real content.
- A deliberately unknown URL must return 404 rather than a duplicate home page (custom 404 asset is included; runtime routing must be confirmed).
- Google Search Console: add URL-prefix property for siteUrl, obtain HTML meta verification, set verification.google to the exact supplied token, build/redeploy, verify ownership, submit sitemap.xml, inspect root indexing eligibility.
- Naver Search Advisor: register siteUrl, obtain meta verification, set verification.naver to the exact supplied token, build/redeploy, verify ownership, submit sitemap.xml, check robots and collection diagnostics.
- Neither verification nor sitemap submission guarantees indexing or rankings.
- No fabricated verification code or analytics ID has been added.

## Analytics
Disabled by default. No external analytics script, cookies, persistent analytics storage or outbound analytics requests.
A local CustomEvent named seoah:analytics exposes {event, placement} or {event, project}.
Events: partnership_cta_click, email_click, phone_click, live_demo_click, project_view (once per project per page load).
If analytics.enabled becomes true, events are also pushed to window.dataLayer. A real provider integration still needs its account/script and appropriate privacy decisions; merely entering an ID does not connect tracking. Do not send email/phone values as event properties.

## Content integrity
No invented clients, company project roles, metrics, testimonials or completed templates.
The current Site is the first independent case. Company cases stay marked pending.
Templates render only with status=complete, nonempty real desktop/mobile previews and a valid HTTP(S) live demo URL. Company cases must explicitly identify COMPANY PROJECT and verified role/contribution.

## QA scope
Build/check verifies generated metadata, schema JSON, links, asset references, JavaScript syntax, ARIA references, single H1 and static no-JS delivery content. OG image visually inspected and compressed. Reduced motion and keyboard tab behavior implemented.
Actual desktop/tablet/mobile rendering, browser runtime console, executed interactions, measured LCP/CLS/INP, deployed custom 404/header behavior and multi-browser acceptance remain unverified: this session's Sites managed preview has no static-site browser testing path. Do not label those checks PASS based solely on code inspection.
HTTPS origin is confirmed by successful TLS request. Public HTTP checks are recorded in the latest handoff.

## Search keyword strategy
Focus terms in site.config.json.seoKeywords inform title, description, visible Korean copy and WebPage structured data. No keyword stuffing or unsupported claims. Legacy meta keywords is intentionally omitted. Keyword targeting does not guarantee search indexing or ranking.

## GitHub source
Source mirror: https://github.com/happysuyeun-rgb/seoah-production-partner
GitHub is source storage; automatic GitHub-to-Sites deployment is not configured.
