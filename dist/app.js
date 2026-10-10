const doc = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer:fine)');
const wide = matchMedia('(min-width:761px)');
const hero = document.querySelector('.hero');
const progressBar = document.querySelector('.reading-progress');
const journey = document.querySelector('#journey');
const steps = [...document.querySelectorAll('[data-step]')];
const frame = document.querySelector('.assembly-frame');
const timeline = document.querySelector('.timeline');
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const motionAllowed = () => !reduced.matches;

// Hero depth: pointer and first-scroll offsets are transform-only and skipped on touch, narrow screens and reduced motion.
let pointerFrame = 0, pointerX = 0, pointerY = 0, heroInView = true;
function resetPointer(){
  cancelAnimationFrame(pointerFrame); pointerFrame = 0;
  hero.style.setProperty('--px','0px'); hero.style.setProperty('--py','0px');
}
hero.addEventListener('pointermove', e => {
  if (!finePointer.matches || !wide.matches || !motionAllowed()) return;
  pointerX = (e.clientX / innerWidth - .5) * 12;
  pointerY = (e.clientY / innerHeight - .5) * 8;
  if (pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    hero.style.setProperty('--px', `${pointerX.toFixed(2)}px`);
    hero.style.setProperty('--py', `${pointerY.toFixed(2)}px`);
    pointerFrame = 0;
  });
}, {passive:true});
hero.addEventListener('pointerleave', resetPointer);
new IntersectionObserver(([entry]) => { heroInView = entry.isIntersecting; if (!heroInView) resetPointer(); onScroll(); }).observe(hero);

const navLinks = [...document.querySelectorAll('.nav-links a')];
const navMark = document.querySelector('.nav-mark');
const navTargets = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
let pending = false;
let sceneCover = false;
function update(){
  pending = false;
  // Read every rect before writing, so one frame costs one layout.
  const max = doc.scrollHeight - innerHeight;
  const rect = journey.getBoundingClientRect();
  const t = timeline?.getBoundingClientRect();
  const tlItems = timeline ? [...timeline.children] : [];
  const tlRects = t ? tlItems.map(li => li.getBoundingClientRect()) : [];
  const motion = motionAllowed();
  const fraction = clamp((innerHeight * .75 - rect.top) / (rect.height * .7));
  const markLine = innerHeight * .4;
  let current = -1;
  navTargets.forEach((section, i) => { if (section.getBoundingClientRect().top <= markLine) current = i; });
  const linkBox = current >= 0 ? navLinks[current].getBoundingClientRect() : null;
  const hostBox = linkBox ? navLinks[current].parentElement.getBoundingClientRect() : null;
  progressBar.style.setProperty('--progress', String(!sceneCover && max > 0 ? clamp(scrollY / max) : 0));
  document.body.classList.toggle('is-scrolled', !sceneCover && scrollY > 24);
  document.body.classList.toggle('show-top', !sceneCover && scrollY > innerHeight * .55);
  hero.style.setProperty('--hy', !sceneCover && heroInView && motion && wide.matches ? String(Math.round(scrollY)) : '0');
  steps.forEach((el, i) => el.classList.toggle('active', i <= Math.floor(fraction * (steps.length - .001))));
  if (frame) frame.style.setProperty('--a', motion ? clamp(fraction * 1.4).toFixed(3) : '1');
  if (t) {
    const tl = motion ? clamp((innerHeight * .9 - t.top) / (innerHeight * .5)) : 1;
    const vertical = !wide.matches;
    const trackStart = vertical ? t.top + 6 : t.left;
    const trackLen = Math.max(1, vertical ? t.height - 12 : t.width);
    timeline.style.setProperty('--tl', tl.toFixed(3));
    tlItems.forEach((li, i) => {
      const box = tlRects[i];
      const dot = vertical ? box.top + 18.5 : box.left + 4.5;
      li.classList.toggle('is-on', tl * trackLen >= dot - trackStart);
    });
  }
  navLinks.forEach(link => link.removeAttribute('aria-current'));
  if (navMark) {
    if (!linkBox) navMark.style.width = '0px';
    else {
      const inset = parseFloat(getComputedStyle(navLinks[current]).paddingLeft) || 0;
      navLinks[current].setAttribute('aria-current', 'true');
      navMark.style.transform = `translate3d(${Math.round(linkBox.left - hostBox.left + inset)}px,0,0)`;
      navMark.style.width = `${Math.max(0, Math.round(linkBox.width - inset * 2))}px`;
    }
  }
}
function onScroll(){ if (pending) return; pending = true; requestAnimationFrame(update); }
addEventListener('scroll', onScroll, {passive:true});
addEventListener('resize', onScroll, {passive:true});
[reduced, finePointer, wide].forEach(query => query.addEventListener('change', () => { resetPointer(); if (sceneFrame && (reduced.matches || !finePointer.matches || !wide.matches)) finishCover(false); syncDeliveryMotion(); placeDeliveryMark(false); onScroll(); }));
onScroll();

// Heading first, then the body copy in order, once the section fills the viewport.
// Reduced motion and no-JS keep every line visible.
doc.classList.add('motion-ready');
function primeSequence(section){
  const title = section.querySelector('h1, h2');
  const nodes = [];
  const push = el => { if (el && !nodes.includes(el)) nodes.push(el); };
  if (section.classList.contains('hero')) {
    const eyebrow = section.querySelector('.hero-eyebrow');
    if (eyebrow) { eyebrow.classList.add('seq'); eyebrow.style.setProperty('--d', '0s'); }
    ['.hero-lead','.hero-trust','.hero-actions','.hero-lens'].forEach(sel => push(section.querySelector(sel)));
  } else {
    push(section.querySelector('.section-lead, .contact-lead'));
    push(section.querySelector('.section-head .status'));
    section.querySelectorAll('.cap-list > .cap, .cap-note, .steps > li, .assembly, .case-preview, .case-body > h3, .case-info > div, .pending-work, .partner-who, .forms, .whitelabel, .timeline, .delivery-switch, .delivery-panels, .layers > li, .ways > article, .ways-caption, .templates, .contact-panel, .contact-action, footer').forEach(push);
  }
  const label = section.querySelector('.label');
  if (label) { label.classList.add('seq'); label.style.setProperty('--d', '0s'); }
  if (title) { title.classList.add('seq'); title.style.setProperty('--d', '0s'); }
  nodes.forEach((el, i) => { el.classList.add('seq'); el.style.setProperty('--d', `${0.16 + i * 0.07}s`); });
}
const showSection = section => section.classList.add('is-in');
const sectionFills = entry => {
  if (entry.boundingClientRect.bottom <= 0) return true;
  const visible = entry.intersectionRect.height;
  return visible >= innerHeight * .62 || (entry.boundingClientRect.top <= innerHeight * .18 && visible > 120);
};
const sectionWatch = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!sectionFills(entry)) return;
    sectionWatch.unobserve(entry.target);
    // Let the hidden state paint, then reveal the title before the body.
    requestAnimationFrame(() => requestAnimationFrame(() => showSection(entry.target)));
  });
}, {threshold:[0,.2,.35,.5,.75]});
document.querySelectorAll('.hero, .section').forEach(section => { primeSequence(section); sectionWatch.observe(section); });

// First view: dust gathers into each English letter at the viewport center, then the line settles and the hero follows.
async function playHeroIntro(){
  const root = document.documentElement;
  const brand = document.querySelector('.hero-brand');
  if (!root.classList.contains('hero-intro') || !motionAllowed() || !brand) {
    root.classList.remove('hero-intro');
    document.dispatchEvent(new Event('hero-title-ready'));
    return;
  }
  if (document.fonts?.ready) await document.fonts.ready;
  const letters = [...document.querySelectorAll('.hero-letter')];
  letters.forEach(letter => {
    const glyph = document.createElement('span');
    glyph.className = 'hero-glyph';
    glyph.textContent = letter.textContent;
    letter.textContent = '';
    letter.append(glyph);
    for (let i = 0; i < 8; i++) {
      const dust = document.createElement('i');
      dust.className = 'hero-dust';
      dust.setAttribute('aria-hidden', 'true');
      const spread = 16 + Math.random() * 42;
      const angle = Math.random() * Math.PI * 2;
      dust.style.setProperty('--x', `${(Math.cos(angle) * spread).toFixed(1)}px`);
      dust.style.setProperty('--y', `${(Math.sin(angle) * spread).toFixed(1)}px`);
      dust.style.setProperty('--r', `${Math.floor(Math.random() * 360)}deg`);
      letter.append(dust);
    }
  });
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  root.classList.add('hero-prep');
  letters.forEach(letter => {
    const box = letter.getBoundingClientRect();
    letter.style.setProperty('--tx', `${(centerX - (box.left + box.width / 2)).toFixed(1)}px`);
    letter.style.setProperty('--ty', `${(centerY - (box.top + box.height / 2)).toFixed(1)}px`);
    letter.style.setProperty('--spin', `${(Math.random() * 70 - 35).toFixed(1)}deg`);
  });
  void brand.offsetWidth;
  root.classList.remove('hero-prep');
  const step = 120;
  const dustLead = 260;
  letters.forEach((letter, index) => {
    setTimeout(() => letter.classList.add('is-dust'), index * step);
    setTimeout(() => letter.classList.add('is-on'), index * step + dustLead);
  });
  const opened = (letters.length - 1) * step + dustLead + 760;
  const mark = (name, at) => setTimeout(() => root.classList.add(name), opened + at);
  setTimeout(() => root.classList.add('hero-fade', 'hero-title-in'), opened);
  setTimeout(() => {
    root.classList.add('hero-prep', 'hero-settle');
    root.classList.remove('hero-fade');
    letters.forEach(letter => letter.classList.add('is-seat'));
    void brand.offsetWidth;
    root.classList.remove('hero-prep');
    letters.forEach((letter, index) => setTimeout(() => letter.classList.add('is-seated'), index * 46));
  }, opened + 900);
  setTimeout(() => document.dispatchEvent(new Event('hero-title-ready')), opened);
  mark('hero-line-in', 320);
  mark('hero-lead-in', 680);
  mark('hero-action-in', 680);
  mark('hero-tabs-in', 1020);
  mark('hero-lab-in', 1020);
  setTimeout(() => {
    root.classList.remove('hero-intro', 'hero-settle', 'hero-prep', 'hero-fade', 'hero-title-in', 'hero-line-in', 'hero-lead-in', 'hero-action-in', 'hero-tabs-in', 'hero-lab-in');
    letters.forEach(letter => {
      letter.classList.remove('is-seat', 'is-seated');
      letter.querySelectorAll('.hero-dust').forEach(dust => dust.remove());
    });
  }, opened + 3900);
}
playHeroIntro();

// The work frame draws once as the screenshot enters. The picture stays visible the whole time.
const stage = document.querySelector('.preview-stage');
if (stage) {
  const frameWatch = new IntersectionObserver(([entry]) => {
    const visible = entry.isIntersecting && entry.intersectionRect.height > 120;
    const past = entry.boundingClientRect.bottom < innerHeight * .4;
    if (!visible && !past) return;
    if (motionAllowed()) stage.classList.add('play');
    frameWatch.disconnect();
  });
  frameWatch.observe(stage);
}

// Floating mobile CTA: shown only after the hero CTAs leave and hidden while the real contact panel is visible.
const floatState = {heroCta:true, panel:false};
function updateFloat(){
  document.body.classList.toggle('show-float', !floatState.heroCta && !floatState.panel);
  document.body.classList.toggle('contact-visible', floatState.panel);
}
new IntersectionObserver(([entry]) => { floatState.heroCta = entry.isIntersecting; updateFloat(); }).observe(document.querySelector('.hero-actions'));
new IntersectionObserver(([entry]) => { floatState.panel = entry.isIntersecting; updateFloat(); }, {threshold:.4}).observe(document.querySelector('#contact-panel'));

const tabs = [...document.querySelectorAll('[data-delivery]')];
const panels = [...document.querySelectorAll('.delivery-panel')];
const deliveryRoot = document.querySelector('#delivery');
function syncDeliveryMotion(){
  deliveryRoot?.classList.toggle('is-live', motionAllowed());
}
function placeDeliveryMark(animate){
  const tab = tabs.find(item => item.getAttribute('aria-selected') === 'true');
  const mark = document.querySelector('.delivery-mark');
  if (!tab || !mark) return;
  const host = tab.parentElement.getBoundingClientRect();
  const box = tab.getBoundingClientRect();
  mark.parentElement.classList.add('has-mark');
  if (!animate || !motionAllowed()) mark.style.transition = 'none';
  mark.style.transform = `translate3d(${Math.round(box.left - host.left)}px,1px,0)`;
  mark.style.width = `${Math.max(0, Math.round(box.width))}px`;
  if (mark.style.transition === 'none') {
    void mark.offsetWidth;
    mark.style.transition = '';
  }
}
function selectTab(tab, animateMark = true){
  const id = tab.getAttribute('aria-controls');
  tabs.forEach(x => { x.setAttribute('aria-selected', String(x === tab)); x.tabIndex = x === tab ? 0 : -1; });
  panels.forEach(p => {
    const show = p.id === id;
    p.hidden = !show;
    if (!show) p.classList.remove('draw');
  });
  const panel = document.getElementById(id);
  const h3 = panel?.querySelector('h3');
  if (panel && h3 && animateMark && motionAllowed()) {
    h3.style.transition = 'none';
    panel.classList.remove('draw');
    void h3.offsetWidth;
    h3.style.transition = '';
    panel.classList.add('draw');
  } else panel?.classList.add('draw');
  placeDeliveryMark(animateMark);
}
if (tabs.length) {
syncDeliveryMotion();
selectTab(tabs[0], false);
addEventListener('resize', () => placeDeliveryMark(false), {passive:true});
document.fonts?.ready.then(() => placeDeliveryMark(false));
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', e => {
    let n;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (i + tabs.length - 1) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    else return;
    e.preventDefault(); selectTab(tabs[n]); tabs[n].focus();
  });
});
}

const dialog = document.querySelector('#preview-dialog');
if (dialog && typeof dialog.showModal === 'function') {
  const image = dialog.querySelector('#preview-image');
  const caption = dialog.querySelector('#preview-caption');
  let opener = null;
  document.querySelectorAll('.zoom-actions').forEach(el => { el.hidden = false; });
  document.addEventListener('click', e => {
    const button = e.target.closest?.('[data-zoom]');
    if (!button) return;
    const source = button.closest('figure')?.querySelector(button.dataset.zoom);
    if (!source) return;
    opener = button;
    image.src = source.src;
    image.alt = source.alt;
    caption.textContent = button.textContent.replace(/\s*크게 보기/, '');
    dialog.classList.toggle('is-mobile', button.dataset.zoom.includes('mobile'));
    dialog.showModal();
    dialog.querySelector('.dialog-close').focus();
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    const back = opener;
    opener = null;
    if (back) requestAnimationFrame(() => back.focus());
  });
}

// Scroll remains native; scene state retained for existing shared handlers.
let sceneFrame=0;
function finishCover(){}

const safeURL = value => { if (typeof value !== 'string' || !value.trim()) return null; try { const url = new URL(value, location.href); return ['http:','https:'].includes(url.protocol) ? url.href : null; } catch { return null; } };
const element = (tag, text, className) => { const el = document.createElement(tag); if (text) el.textContent = text; if (className) el.className = className; return el; };
const data = window.seoahContent || {projects:[], templates:[]};

for (const p of data.projects.filter(p => p.published && p.name && p.role && p.result && safeURL(p.image) && ['COMPANY PROJECT','INDEPENDENT PROJECT'].includes(p.category))) {
  const article = element('article', null, 'case');
  article.dataset.project = p.name;
  const figure = element('figure', null, 'case-preview');
  const img = element('img', null, 'shot-desktop');
  img.src = safeURL(p.image); img.alt = p.imageAlt || p.name; img.loading = 'lazy'; img.decoding = 'async';
  figure.append(img);
  const body = element('div', null, 'case-body');
  body.append(element('p', p.category, 'tag'), element('h3', p.name));
  const dl = element('dl', null, 'case-info');
  for (const [label, value] of [['유형', p.type], ['해결하려던 문제', p.problem], ['역할', p.role], ['기여 범위', p.contribution], ['결과', p.result]]) {
    const row = element('div'); row.append(element('dt', label), element('dd', value || '내용 준비 중')); dl.append(row);
  }
  body.append(dl); article.append(figure, body);
  document.querySelector('#project-collection').append(article);
}

const templates = data.templates.filter(t => t.status === 'complete' && t.title && safeURL(t.desktopPreview) && safeURL(t.mobilePreview) && safeURL(t.liveDemoUrl));
const templateCollection = document.querySelector('#template-collection');
const templateEmpty = document.querySelector('#template-empty');
if (templates.length && templateEmpty) templateEmpty.hidden = true;
for (const t of templates) {
  const article = element('article', null, 'template-item');
  article.append(element('p', t.category, 'tag'), element('h4', t.title), element('p', t.description));
  const preview = element('img');
  preview.src = safeURL(t.desktopPreview); preview.alt = t.title + ' 데스크톱 미리보기'; preview.loading = 'lazy'; preview.decoding = 'async';
  const controls = element('div', null, 'template-controls');
  for (const [label, src] of [['Desktop', t.desktopPreview], ['Mobile', t.mobilePreview]]) {
    const button = element('button', label, 'button'); button.type = 'button';
    button.setAttribute('aria-pressed', String(label === 'Desktop'));
    button.addEventListener('click', () => { preview.src = safeURL(src); preview.alt = t.title + ' ' + label + ' 미리보기'; controls.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button))); });
    controls.append(button);
  }
  const link = element('a', '라이브 데모 보기', 'button light');
  link.href = safeURL(t.liveDemoUrl); link.target = '_blank'; link.rel = 'noopener noreferrer'; link.dataset.track = 'live_demo_click';
  controls.append(link); article.append(preview, controls);
  templateCollection?.append(article);
}

// No account connected: dispatch events locally; no storage, network requests or PII.
const tracking = window.seoahSettings?.analytics;
function track(name, parameters = {}){ const detail = {event:name, ...parameters}; window.dispatchEvent(new CustomEvent('seoah:analytics', {detail})); if (tracking?.enabled) { window.dataLayer = window.dataLayer || []; window.dataLayer.push(detail); } }
document.addEventListener('click', e => { const link = e.target.closest?.('[data-track]'); if (!link) return; link.dataset.track.split(' ').forEach(name => track(name, {placement:link.closest('section')?.id || 'navigation'})); });
const seenProjects = new Set();
const projectObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting && !seenProjects.has(entry.target)) { seenProjects.add(entry.target); track('project_view', {project:entry.target.dataset.project}); projectObserver.unobserve(entry.target); } }), {threshold:.25});
document.querySelectorAll('[data-project]').forEach(el => projectObserver.observe(el));


// Interactive production demo; labels and explanatory copy remain in the DOM.
const modes={plan:{accent:'#f48b29',title:'흩어진 요구사항을, 제작할 수 있는 구조로.',copy:'요구사항 분석 · IA · User Flow · UX 정책 · 화면설계<br>정리되지 않은 아이디어부터 기존 기획 자료의 보완까지 협의합니다.',aside:'구조부터<br>정리하다.',desc:'같은 사이트의 목적·콘텐츠를<br>흐름과 화면 구조로 정리합니다.',checks:'Requirements<br>IA / User flow<br>Screen structure',tag:'01 / UX PLANNING',note:'같은 콘텐츠의 화면 구조를 먼저 정리한 상태'},design:{accent:'#ff623c',title:'사용자 흐름과 브랜드를, 하나의 UI로.',copy:'웹 UI · 반응형 UI · 컴포넌트 · 디자인 시스템<br>기획 자료가 있는 프로젝트도 디자인 구간부터 협의할 수 있습니다.',aside:'구조에<br>브랜드를 더하다.',desc:'같은 콘텐츠와 흐름에<br>타이포·컬러·컴포넌트를 적용합니다.',checks:'Typography<br>Color system<br>Component',tag:'02 / UI DESIGN',note:'같은 화면에 디자인 시스템이 적용된 상태'},web:{accent:'#8760ee',title:'',copy:'',aside:'화면을<br>동작으로 연결하다.',desc:'Desktop / Mobile 버튼을 눌러<br>같은 콘텐츠의 재배치를 확인하세요.',checks:'Responsive layout<br>Interaction / QA<br>Deployment',tag:'03 / WEB PRODUCTION',note:'구현을 설명하는 데모입니다. 위에서 Desktop / Mobile을 전환해보세요.'}};
const productionTabs=[...document.querySelectorAll('[data-mode]')];let current='design';
function writePhaseNote(){
  const mobile = document.querySelector('#product-shell').classList.contains('mobile');
  const note = modes[current].note + (mobile ? ' 지금은 같은 콘텐츠의 Mobile 배치입니다.' : '');
  document.querySelector('#phase-note').textContent = note;
}
function select(mode){
  current = mode;
  const m = modes[mode];
  document.querySelector('.hero').style.setProperty('--accent', m.accent);
  document.querySelector('.lab').dataset.phase = mode;
  productionTabs.forEach(t => {
    const on = t.dataset.mode === mode;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
  });
  const detail = document.querySelector('#scope-detail');
  detail.hidden = !m.title && !m.copy;
  document.querySelector('#detail-title').textContent = m.title;
  document.querySelector('#detail-copy').innerHTML = m.copy;
  document.querySelector('#production-demo').setAttribute('aria-labelledby', 'tab-' + mode);
  document.querySelector('#aside-title').innerHTML = m.aside;
  document.querySelector('#aside-copy').innerHTML = m.desc;
  document.querySelector('#lab-checks').innerHTML = m.checks;
  document.querySelector('#aside-kicker').textContent = m.tag;
  document.querySelector('#stage-tag').textContent = m.tag;
  writePhaseNote();
}
productionTabs.forEach((t,i)=>{t.addEventListener('click',()=>select(t.dataset.mode));t.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%3;else if(e.key==='ArrowLeft')n=(i+2)%3;else if(e.key==='Home')n=0;else if(e.key==='End')n=2;else return;e.preventDefault();select(productionTabs[n].dataset.mode);productionTabs[n].focus()})});document.querySelector('#prev').onclick=()=>select(productionTabs[(productionTabs.findIndex(t=>t.dataset.mode===current)+2)%3].dataset.mode);document.querySelector('#next').onclick=()=>select(productionTabs[(productionTabs.findIndex(t=>t.dataset.mode===current)+1)%3].dataset.mode);
const devices=[...document.querySelectorAll('[data-device]')];
devices.forEach(b => b.addEventListener('click', () => {
  devices.forEach(d => d.setAttribute('aria-pressed', d === b));
  document.querySelector('#product-shell').classList.toggle('mobile', b.dataset.device === 'mobile');
  writePhaseNote();
}));

document.querySelector('.demo-button').addEventListener('click',e=>{const button=e.currentTarget;const panel=document.querySelector('#demo-more');panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));button.textContent=panel.hidden?'Explore ↓':'Close ↑'});
const demo = document.querySelector('#production-demo');
if (demo && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const pointer = document.createElement('div');
  pointer.className = 'hero-pointer';
  pointer.hidden = true;
  pointer.setAttribute('aria-hidden', 'true');
  document.body.append(pointer);
  demo.classList.add('has-pointer');
  demo.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    pointer.hidden = false;
    pointer.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  });
  demo.addEventListener('pointerleave', () => { pointer.hidden = true; });
}
const collaboration=document.querySelector('.collaboration-choice');collaboration.hidden=false;
const collabTabs=[...document.querySelectorAll('[data-collab]')];
const collabData={full:{areas:['brief','ux','ui','web','qa']},partial:{areas:['ui','web']},white:{areas:['ux','ui','web','qa']},long:{areas:['brief','ux','ui','web','qa']}};
collabData.full.text='요구사항에서 공개까지, 전체 제작 범위를 프로젝트에 맞춰 협의합니다.';
collabData.partial.text='기존 기획·디자인 자료를 확인하고 팀에 필요한 업무 구간을 정합니다. 강조된 구간은 예시이며, 실제 참여 범위는 협의합니다.';
collabData.white.text='대행사가 최종 고객과 소통하고, 이서아가 합의한 제작 범위를 담당합니다. 커뮤니케이션·공개 범위와 NDA는 사전에 협의합니다.';
collabData.long.text='반복되는 제작 수요와 프로젝트 상황에 맞춰 업무 범위·빈도·검토 방식을 협의합니다.';
function setCollab(tab){const data=collabData[tab.dataset.collab];collabTabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1});document.querySelector('#collab-panel').setAttribute('aria-labelledby',tab.id);document.querySelector('#collab-description').textContent=data.text;document.querySelectorAll('[data-area]').forEach(li=>li.classList.toggle('selected',data.areas.includes(li.dataset.area)))}
collabTabs.forEach((t,i)=>{t.addEventListener('click',()=>setCollab(t));t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%collabTabs.length;else if(e.key==='ArrowLeft')n=(i+collabTabs.length-1)%collabTabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=collabTabs.length-1;else return;e.preventDefault();setCollab(collabTabs[n]);collabTabs[n].focus()})});setCollab(collabTabs[0]);
document.querySelector('.inquiry-options').hidden=false;
const inquiryRadios=[...document.querySelectorAll('input[name=inquiry-situation]')];
const inquiryHints=['목표·대상·필수 콘텐츠와 희망 일정을 알려주세요.','기획서·디자인 자료와 진행 상태, 남은 업무를 알려주세요.','반복되는 업무와 빈도, 고객 커뮤니케이션 방식과 희망 일정을 알려주세요.'];
function setInquiry(){const i=inquiryRadios.findIndex(r=>r.checked);document.querySelector('#inquiry-help').textContent=inquiryHints[i];const body='협업 상황: '+inquiryRadios[i].value+'\n\n프로젝트 개요: \n필요한 업무: \n준비된 자료: \n희망 일정: \n';document.querySelector('.contact-action .button').href='mailto:seoah.lab@gmail.com?subject='+encodeURIComponent('B2B 웹 제작 문의 / '+inquiryRadios[i].value)+'&body='+encodeURIComponent(body)}
inquiryRadios.forEach(r=>r.addEventListener('change',setInquiry));setInquiry();
const layerWatch=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('layer-in');layerWatch.unobserve(entry.target)}}),{threshold:.6});document.querySelectorAll('.layers li').forEach(el=>layerWatch.observe(el));

const wordTrack=document.querySelector('#word-track');
const wordCurrent=document.querySelector('.word-current');
const wideStrip=matchMedia('(min-width:901px)');
if(wordTrack&&wordCurrent){
  const wordCount=wordTrack.children.length-1;
  let wordIndex=0;
  let wordTimer=0;
  const wordRow=()=>wordTrack.firstElementChild.getBoundingClientRect().height||0;
  function placeWord(index,animate){
    const y=-(index*wordRow());
    if(!animate||!motionAllowed()){
      wordTrack.style.transition='none';
      wordTrack.style.transform=`translate3d(0,${y}px,0)`;
      void wordTrack.offsetWidth;
      wordTrack.style.transition='';
    }else wordTrack.style.transform=`translate3d(0,${y}px,0)`;
  }
  function showWord(index){
    const n=index%wordCount;
    wordCurrent.textContent=wordTrack.children[n].textContent;
    if(!wideStrip.matches)return;
    const tab=productionTabs.find(item=>item.dataset.mode===['design','web','plan','design','web'][n]);
    if(tab&&tab.dataset.mode!==current)select(tab.dataset.mode);
  }
  function advanceWord(){
    if(!motionAllowed()){
      wordIndex=(wordIndex+1)%wordCount;
      placeWord(wordIndex,false);
      showWord(wordIndex);
      return;
    }
    if(wordIndex>=wordCount){wordIndex=0;placeWord(0,false)}
    wordIndex+=1;
    placeWord(wordIndex,true);
    showWord(wordIndex);
    if(wordIndex!==wordCount)return;
    const reset=event=>{
      if(event.propertyName!=='transform')return;
      wordTrack.removeEventListener('transitionend',reset);
      wordIndex=0;
      placeWord(0,false);
    };
    wordTrack.addEventListener('transitionend',reset);
  }
  function runWords(){
    clearInterval(wordTimer);
    if(document.hidden||wordRow()===0)return;
    wordTimer=setInterval(advanceWord,2400);
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInterval(wordTimer);else runWords()});
  addEventListener('resize',()=>{if(wordIndex===wordCount)wordIndex=0;placeWord(wordIndex,false)},{passive:true});
  wideStrip.addEventListener('change',()=>showWord(wordIndex%wordCount));
  reduced.addEventListener('change',()=>{if(wordIndex===wordCount)wordIndex=0;placeWord(wordIndex,false)});
  document.fonts?.ready.then(()=>placeWord(wordIndex,false));
  showWord(0);
  if(document.documentElement.classList.contains('hero-intro')) document.addEventListener('hero-title-ready',runWords,{once:true});
  else runWords();
}
