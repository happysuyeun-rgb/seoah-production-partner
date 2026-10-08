import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const config=JSON.parse(await readFile(resolve(root,'site.config.json'),'utf8'));
const origin=new URL(config.siteUrl);
if(origin.protocol!=='https:'||origin.pathname!=='/'||origin.search||origin.hash)throw new Error('siteUrl must be a verified HTTPS origin without path/query/hash');
const url=origin.origin+'/';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageURL=new URL(config.ogImage,url).href;
await access(resolve(root,'dist',config.ogImage.replace(/^\//,'')));
const meta=[`<title>${escape(config.title)}</title>`,`<meta name="description" content="${escape(config.description)}">`,`<meta name="robots" content="${config.indexingEnabled?'index, follow, max-image-preview:large':'noindex, follow'}">`,`<link rel="canonical" href="${url}">`,`<meta name="theme-color" content="#2944ff">`,`<meta name="author" content="이서아">`,
...Object.entries({'og:type':'website','og:locale':'ko_KR','og:site_name':config.siteName,'og:title':config.title,'og:description':config.description,'og:url':url,'og:image':imageURL,'og:image:secure_url':imageURL,'og:image:type':'image/jpeg','og:image:width':config.ogImageWidth,'og:image:height':config.ogImageHeight,'og:image:alt':'SEOAH — UX Planning, UI/UX Design, Web Production Partner'}).map(([k,v])=>`<meta property="${k}" content="${escape(v)}">`),
...Object.entries({'twitter:card':'summary_large_image','twitter:title':config.title,'twitter:description':config.description,'twitter:image':imageURL,'twitter:image:alt':'SEOAH Web Production Partner'}).map(([k,v])=>`<meta name="${k}" content="${escape(v)}">`)];
for(const [k,name] of [['google','google-site-verification'],['naver','naver-site-verification']])if(config.verification[k])meta.push(`<meta name="${name}" content="${escape(config.verification[k])}">`);
const ld={'@context':'https://schema.org','@graph':[{'@type':'Person','@id':url+'#seoah',name:'이서아',url,jobTitle:'UX Planner · UI/UX Designer · Web Production Partner',email:'seoah.lab@gmail.com',telephone:'+82-10-6856-6622',knowsAbout:['UX Planning','UI/UX Design','Responsive Web Design','Web Production']},{'@type':'WebSite','@id':url+'#website',url,name:config.siteName,inLanguage:'ko-KR',publisher:{'@id':url+'#seoah'}},{'@type':'WebPage','@id':url+'#webpage',url,name:config.title,description:config.description,keywords:(config.seoKeywords||[]).join(', '),inLanguage:'ko-KR',isPartOf:{'@id':url+'#website'},about:{'@id':url+'#seoah'}}]};
meta.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script>`);
let html=await readFile(resolve(root,'dist/index.html'),'utf8');
html=html.replace(/<!-- SEO START -->[\s\S]*?<!-- SEO END -->/,'').replace(/<title>[\s\S]*?<\/title>/,'').replace(/<meta name="description"[^>]*>/,'');
html=html.replace('</head>',`<!-- SEO START -->\n${meta.join('\n')}\n<!-- SEO END -->\n</head>`);
await writeFile(resolve(root,'dist/index.html'),html);
await writeFile(resolve(root,'dist/robots.txt'),`User-agent: *\n${config.indexingEnabled?'Allow: /':'Disallow: /'}\n\nSitemap: ${origin.origin}/sitemap.xml\n`);
await writeFile(resolve(root,'dist/sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(url)}</loc></url></urlset>\n`);
await writeFile(resolve(root,'dist/site-settings.js'),`window.seoahSettings = ${JSON.stringify({analytics:config.analytics})};\n`);
await writeFile(resolve(root,'dist/404.html'),`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>페이지를 찾을 수 없습니다 | SEOAH</title><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/style.css"></head><body><main class="error-page"><span class="mini">SEOAH / 404</span><h1>LET’S GET<br>BACK ON TRACK.</h1><p>요청한 페이지를 찾을 수 없습니다.<br>주소를 확인하거나 첫 화면으로 돌아가 주세요.</p><a class="button light" href="/">첫 화면으로 돌아가기</a><a class="text-link" href="mailto:seoah.lab@gmail.com">이메일 문의</a></main></body></html>`);
console.log('Production static build PASS: metadata, canonical, robots, sitemap, schema, settings, 404');
