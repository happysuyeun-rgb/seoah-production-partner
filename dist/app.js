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

let pending = false;
function update(){
  pending = false;
  // Read every rect before writing, so one frame costs one layout.
  const max = doc.scrollHeight - innerHeight;
  const rect = journey.getBoundingClientRect();
  const t = timeline?.getBoundingClientRect();
  const motion = motionAllowed();
  const fraction = clamp((innerHeight * .75 - rect.top) / (rect.height * .7));
  progressBar.style.setProperty('--progress', String(max > 0 ? clamp(scrollY / max) : 0));
  document.body.classList.toggle('is-scrolled', scrollY > 24);
  hero.style.setProperty('--hy', heroInView && motion && wide.matches ? String(Math.round(scrollY)) : '0');
  steps.forEach((el, i) => el.classList.toggle('active', i <= Math.floor(fraction * (steps.length - .001))));
  if (frame) frame.style.setProperty('--a', motion ? clamp(fraction * 1.4).toFixed(3) : '1');
  if (t) timeline.style.setProperty('--tl', motion ? clamp((innerHeight * .9 - t.top) / (innerHeight * .5)).toFixed(3) : '1');
}
function onScroll(){ if (pending) return; pending = true; requestAnimationFrame(update); }
addEventListener('scroll', onScroll, {passive:true});
addEventListener('resize', onScroll, {passive:true});
[reduced, finePointer, wide].forEach(query => query.addEventListener('change', () => { resetPointer(); onScroll(); }));
onScroll();

// Section heads and the system layers settle into place once; content is never hidden.
document.querySelectorAll('.layers li').forEach((li, i) => li.style.setProperty('--i', i));
let settlePrimed = false;
const settle = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting || entry.boundingClientRect.top < 0) { entry.target.classList.add('in'); settle.unobserve(entry.target); }
  });
  if (!settlePrimed) { settlePrimed = true; requestAnimationFrame(() => doc.classList.add('motion-ready')); }
}, {rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.section-head,.layers').forEach(el => settle.observe(el));

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
function selectTab(tab){
  tabs.forEach(x => { x.setAttribute('aria-selected', String(x === tab)); x.tabIndex = x === tab ? 0 : -1; });
  panels.forEach(p => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
}
selectTab(tabs[0]);
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
    caption.textContent = button.textContent.replace(' 크게 보기', ' 화면');
    dialog.classList.toggle('is-mobile', button.dataset.zoom.includes('mobile'));
    dialog.showModal();
    dialog.querySelector('.dialog-close').focus();
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { opener?.focus(); opener = null; });
}

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
if (templates.length) document.querySelector('#template-empty').hidden = true;
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
  document.querySelector('#template-collection').append(article);
}

// No account connected: dispatch events locally; no storage, network requests or PII.
const tracking = window.seoahSettings?.analytics;
function track(name, parameters = {}){ const detail = {event:name, ...parameters}; window.dispatchEvent(new CustomEvent('seoah:analytics', {detail})); if (tracking?.enabled) { window.dataLayer = window.dataLayer || []; window.dataLayer.push(detail); } }
document.addEventListener('click', e => { const link = e.target.closest?.('[data-track]'); if (!link) return; link.dataset.track.split(' ').forEach(name => track(name, {placement:link.closest('section')?.id || 'navigation'})); });
const seenProjects = new Set();
const projectObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting && !seenProjects.has(entry.target)) { seenProjects.add(entry.target); track('project_view', {project:entry.target.dataset.project}); projectObserver.unobserve(entry.target); } }), {threshold:.25});
document.querySelectorAll('[data-project]').forEach(el => projectObserver.observe(el));
