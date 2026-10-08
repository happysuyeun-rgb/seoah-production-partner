const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('.hero');
const finePointer = matchMedia('(pointer:fine)');
let pointerFrame = 0;
let pointerX = 0, pointerY = 0;
function resetPointer(){
  cancelAnimationFrame(pointerFrame); pointerFrame = 0;
  hero.style.setProperty('--px','0px'); hero.style.setProperty('--py','0px');
}
hero.addEventListener('pointermove', e => {
  if (!finePointer.matches || reduced.matches) return;
  pointerX = (e.clientX / innerWidth - .5) * 12;
  pointerY = (e.clientY / innerHeight - .5) * 8;
  if (pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    hero.style.setProperty('--px', `${pointerX}px`);
    hero.style.setProperty('--py', `${pointerY}px`);
    pointerFrame = 0;
  });
}, {passive:true});
hero.addEventListener('pointerleave', resetPointer);
reduced.addEventListener('change', resetPointer);
finePointer.addEventListener('change', resetPointer);
const steps = [...document.querySelectorAll('[data-step]')];
const journey = document.querySelector('#journey');
let pending = false;
function onScroll(){ if(pending)return; pending=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.reading-progress').style.setProperty('--progress',String(max>0?Math.max(0,Math.min(1,scrollY/max)):0));const rect=journey.getBoundingClientRect();const fraction=Math.max(0,Math.min(1,(innerHeight*.8-rect.top)/(rect.height*.8)));steps.forEach((el,i)=>el.classList.toggle('active',i<=Math.floor(fraction*5)));pending=false;});}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});onScroll();
new IntersectionObserver(entries=>{document.body.classList.toggle('contact-visible',entries.some(entry=>entry.isIntersecting))},{threshold:.2}).observe(document.querySelector('#contact-panel'));
const tabs=[...document.querySelectorAll('[data-delivery]')];
const panels=[...document.querySelectorAll('.delivery-panel')];
function selectTab(tab){tabs.forEach(x=>{x.setAttribute('aria-selected',String(x===tab));x.tabIndex=x===tab?0:-1});panels.forEach(p=>{p.hidden=p.id!==tab.getAttribute('aria-controls')});}
selectTab(tabs[0]);
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();selectTab(tabs[n]);tabs[n].focus();});});
const safeURL=value=>{if(typeof value!=='string'||!value.trim())return null;try{const url=new URL(value,location.href);return ['http:','https:'].includes(url.protocol)?url.href:null}catch{return null}};
const element=(tag,text,className)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;};
const data=window.seoahContent||{projects:[],templates:[]};
for(const p of data.projects.filter(p=>p.published&&p.name&&p.role&&p.result&&safeURL(p.image)&&['COMPANY PROJECT','INDEPENDENT PROJECT'].includes(p.category))){const article=element('article',null,'featured-work');article.style.marginTop='70px';article.dataset.project=p.name;article.append(element('p',p.category,'mini'));const img=element('img');img.src=safeURL(p.image);img.alt=p.imageAlt||p.name;img.loading='lazy';img.style.width='100%';article.append(img,element('h3',p.name),element('p',p.type,'mini'));const dl=element('dl',null,'case-info');for(const [label,value] of [['PROBLEM',p.problem],['MY ROLE',p.role],['CONTRIBUTION',p.contribution],['RESULT',p.result]]){const d=element('div');d.append(element('dt',label),element('dd',value||'내용 준비 중'));dl.append(d)}article.append(dl);document.querySelector('#project-collection').append(article);}
const templates=data.templates.filter(t=>t.status==='complete'&&t.title&&safeURL(t.desktopPreview)&&safeURL(t.mobilePreview)&&safeURL(t.liveDemoUrl));
if(templates.length)document.querySelector('#template-empty').hidden=true;
for(const t of templates){const article=element('article');article.style.marginTop='40px';article.append(element('p',t.category,'mini'),element('h3',t.title),element('p',t.description));const preview=element('img');preview.src=safeURL(t.desktopPreview);preview.alt=t.title+' 데스크톱 미리보기';preview.loading='lazy';preview.style.cssText='width:100%;max-height:650px;object-fit:contain;background:#151b50';const controls=element('div');controls.style.cssText='display:flex;gap:12px;margin:20px 0;flex-wrap:wrap';for(const [label,src] of [['Desktop',t.desktopPreview],['Mobile',t.mobilePreview]]){const button=element('button',label,'button');button.type='button';button.setAttribute('aria-pressed',String(label==='Desktop'));button.addEventListener('click',()=>{preview.src=safeURL(src);preview.alt=t.title+' '+label+' 미리보기';controls.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))});controls.append(button)}const link=element('a','EXPLORE LIVE','button light');link.href=safeURL(t.liveDemoUrl);link.target='_blank';link.rel='noopener noreferrer';link.dataset.track='live_demo_click';controls.append(link);article.append(preview,controls);document.querySelector('#template-collection').append(article);}

// No account connected: dispatch events locally; no storage, network requests or PII.
const tracking=window.seoahSettings?.analytics;
function track(name,parameters={}){const detail={event:name,...parameters};window.dispatchEvent(new CustomEvent('seoah:analytics',{detail}));if(tracking?.enabled){window.dataLayer=window.dataLayer||[];window.dataLayer.push(detail);}}
document.addEventListener('click',e=>{const link=e.target.closest?.('[data-track]');if(!link)return;link.dataset.track.split(' ').forEach(name=>track(name,{placement:link.closest('section')?.id||'navigation'}));});
const seenProjects=new Set();const projectObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting&&!seenProjects.has(entry.target)){seenProjects.add(entry.target);track('project_view',{project:entry.target.dataset.project});projectObserver.unobserve(entry.target);}}),{threshold:.25});document.querySelectorAll('[data-project]').forEach(el=>projectObserver.observe(el));
