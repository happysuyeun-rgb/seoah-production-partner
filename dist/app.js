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

// Section heads and the system layers settle into place once; content is never hidden.
document.querySelectorAll('.layers li').forEach((li, i) => li.style.setProperty('--i', i));
let settlePrimed = false;
const settle = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting || entry.boundingClientRect.top < 0) { entry.target.classList.add('in'); settle.unobserve(entry.target); }
  });
  if (!settlePrimed) { settlePrimed = true; requestAnimationFrame(() => doc.classList.add('motion-ready')); }
}, {rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.section-head,.layers,#contact-title').forEach(el => settle.observe(el));

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
  dialog.addEventListener('close', () => { opener?.focus(); opener = null; });
}

// Hero scene: one mouse-wheel gesture on the hero lifts that screen away and reveals 제작 범위.
// Touch, narrow viewports, keyboard, and in-page scrolling below that screen stay native.
let sceneFrame = 0;
let sceneLockUntil = 0;
let sceneToY = 0;
let wheelAccum = 0;
let wheelGesture = null;
let wheelIdle = 0;
const sceneSpacer = document.createElement('div');
sceneSpacer.setAttribute('aria-hidden', 'true');
sceneSpacer.style.cssText = 'display:block;width:100%;pointer-events:none';
const sceneInput = () => finePointer.matches && wide.matches && hero.getBoundingClientRect().height >= innerHeight * .92;
const navOffset = () => { const n = parseFloat(getComputedStyle(doc).scrollPaddingTop); return Number.isFinite(n) ? n : 64; };
const capSceneY = () => Math.max(0, Math.round(document.querySelector('#capabilities').getBoundingClientRect().top + scrollY - navOffset()));
const heroIsScene = () => { const r = hero.getBoundingClientRect(); return r.top >= -2 && r.top <= 2 && r.bottom >= innerHeight - 4; };
const atCapScene = () => Math.abs(document.querySelector('#capabilities').getBoundingClientRect().top - navOffset()) <= 16;
const wheelDelta = e => e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
function nestedScroll(target, dy){
  for (let el = target instanceof Element ? target : null; el && el !== doc; el = el.parentElement) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
      if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
      if (dy < 0 && el.scrollTop > 1) return true;
    }
  }
  return false;
}
function cleanupCover(){
  const cap = document.querySelector('#capabilities');
  sceneCover = false;
  sceneFrame = 0;
  doc.classList.remove('is-scene');
  cap.classList.remove('is-scene-next');
  cap.style.top = '';
  cap.style.transform = '';
  hero.classList.remove('is-cover');
  hero.style.height = '';
  hero.style.transform = '';
  sceneSpacer.remove();
  doc.style.scrollBehavior = '';
}
function finishCover(lock = true){
  const y = sceneToY;
  cancelAnimationFrame(sceneFrame);
  cleanupCover();
  doc.style.scrollBehavior = 'auto';
  scrollTo(0, y);
  doc.style.scrollBehavior = '';
  sceneLockUntil = lock ? performance.now() + 420 : 0;
  onScroll();
}
function startCover(direction, toY){
  if (sceneFrame || performance.now() < sceneLockUntil) return;
  sceneToY = toY;
  sceneLockUntil = performance.now() + 420;
  if (!motionAllowed()) {
    doc.style.scrollBehavior = 'auto';
    scrollTo(0, toY);
    doc.style.scrollBehavior = '';
    onScroll();
    return;
  }
  const cap = document.querySelector('#capabilities');
  const nav = navOffset();
  const pinned = scrollY;
  const travel = direction > 0 ? Math.max(1, innerHeight - nav) : Math.max(hero.getBoundingClientRect().height, innerHeight);
  sceneCover = true;
  doc.classList.add('is-scene');
  doc.style.scrollBehavior = 'auto';
  scrollTo(0, pinned);
  if (direction > 0) {
    sceneSpacer.style.height = `${cap.getBoundingClientRect().height}px`;
    cap.before(sceneSpacer);
    cap.classList.add('is-scene-next');
    cap.style.top = `${nav}px`;
    cap.style.transform = `translate3d(0,${travel}px,0)`;
  } else {
    const H = hero.getBoundingClientRect().height;
    sceneSpacer.style.height = `${H}px`;
    hero.before(sceneSpacer);
    hero.classList.add('is-cover');
    hero.style.height = `${H}px`;
    hero.style.transform = `translate3d(0,${-travel}px,0)`;
  }
  scrollTo(0, pinned);
  const start = performance.now();
  const dur = 760;
  sceneFrame = requestAnimationFrame(function tick(now){
    const t = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - t, 3);
    const shift = travel * (1 - e);
    if (Math.abs(scrollY - pinned) > 1) scrollTo(0, pinned);
    if (direction > 0) cap.style.transform = `translate3d(0,${shift}px,0)`;
    else hero.style.transform = `translate3d(0,${-shift}px,0)`;
    if (t < 1) sceneFrame = requestAnimationFrame(tick);
    else finishCover();
  });
  sceneLockUntil = start + dur + 420;
}
addEventListener('wheel', e => {
  if (!sceneInput() || e.ctrlKey || e.metaKey) return;
  const dy = wheelDelta(e);
  if (!dy || Math.abs(e.deltaX) > Math.abs(dy)) return;
  if (dialog?.open || nestedScroll(e.target, dy)) return;
  if (performance.now() < sceneLockUntil || sceneFrame) { e.preventDefault(); return; }
  if (!wheelGesture) wheelGesture = {hero:heroIsScene(), cap:atCapScene()};
  clearTimeout(wheelIdle);
  wheelIdle = setTimeout(() => { wheelGesture = null; wheelAccum = 0; }, 180);
  if (wheelGesture.hero && heroIsScene() && dy > 0) {
    e.preventDefault();
    wheelAccum += dy;
    if (wheelAccum >= 32) { wheelAccum = 0; startCover(1, capSceneY()); }
  } else if (wheelGesture.cap && atCapScene() && dy < 0) {
    e.preventDefault();
    wheelAccum += dy;
    if (wheelAccum <= -32) { wheelAccum = 0; startCover(-1, 0); }
  } else wheelAccum = 0;
}, {passive:false});
document.addEventListener('click', e => {
  if (!sceneFrame || !e.target.closest?.('a[href^="#"]')) return;
  cancelAnimationFrame(sceneFrame);
  cleanupCover();
  sceneLockUntil = 0;
});
addEventListener('resize', () => { if (sceneFrame) finishCover(false); }, {passive:true});

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
