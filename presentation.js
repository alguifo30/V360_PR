// ───────── Configuración editable ─────────
// Fraude: indicator = etiqueta bajo cada anillo (NPS y FCR confirmados).
// detail = texto al señalar la cifra. status = línea junto a «Resultados».
const fraudData = {
  metrics: [
    { value: '+6%', indicator: 'NPS', detail: 'NPS del canal Front · +6% · 1 segmento = 1 punto' },
    { value: '+12%', indicator: 'FCR', detail: 'FCR del canal Front · +12% · 1 segmento = 1 punto' }
  ],
  status: 'Canal Front · escala 0–20%'
};

// ───────── Estado ─────────
const stage = document.querySelector('#stage');
const scenes = Array.from(stage.querySelectorAll('.scene'));
const chrome = document.querySelector('#chrome');
const tracker = chrome.querySelector('.tracker');
const trackerBar = tracker.querySelector('.tracker-bar');
const chromeSub = chrome.querySelector('.chrome-sub');
const loader = document.querySelector('#loader');
const panel = document.querySelector('#rehearsal');
const jump = document.querySelector('#jump');
const buildMenu = document.querySelector('#build');
const report = document.querySelector('#report');
const continuous = document.querySelector('#continuous');
const OUT = 'cubic-bezier(.16,.84,.24,1)', IO = 'cubic-bezier(.65,0,.25,1)', IN = 'cubic-bezier(.5,0,.75,0)';
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let current = 0;
let transitionToken = 0;
let started = false;
let pending = null;
let restartOnFullscreen = true;

const isLight = scene => scene.classList.contains('light');
const stepsOf = scene => Number(scene.dataset.steps || 0);
const sceneIndex = cls => scenes.findIndex(s => s.classList.contains(cls));
const IDX = { bridge: sceneIndex('bridge'), fraude: sceneIndex('fraude'), carterizados: sceneIndex('carterizados'), multisesion: sceneIndex('multisesion'), tiempo: sceneIndex('tiempo') };

function showReport(message) { report.textContent = message; }
function fit() { stage.style.setProperty('--scale', Math.min(innerWidth / 1920, innerHeight / 1080)); }

// Posición de diseño (px del escenario), ignorando transformaciones en curso.
function layoutRect(el) {
  let x = 0, y = 0, e = el;
  while (e && e !== stage) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

// ───────── Métricas ─────────
const fraudHost = document.querySelector('#fraud-metrics');
fraudData.metrics.forEach(({ value, indicator, detail }) => {
  const n = Number.parseFloat(value);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'metric ring';
  Object.assign(button.dataset, { value: Math.abs(n), prefix: n >= 0 ? '+' : '−', suffix: '%', scale: 20, label: indicator || '', detail: detail || value });
  fraudHost.append(button);
});
const fraudNote = fraudHost.closest('.panel').querySelector('.metric-note');
fraudNote.textContent = fraudNote.dataset.default = fraudData.status;

function ringSvg(scale) {
  const cx = 89, r = 78, step = 360 / scale, gap = 4;
  let segs = '';
  for (let k = 0; k < scale; k++) {
    const a0 = (k * step + gap / 2 - 90) * Math.PI / 180, a1 = ((k + 1) * step - gap / 2 - 90) * Math.PI / 180;
    segs += `<path class="seg" d="M${(cx + r * Math.cos(a0)).toFixed(2)} ${(cx + r * Math.sin(a0)).toFixed(2)}A${r} ${r} 0 0 1 ${(cx + r * Math.cos(a1)).toFixed(2)} ${(cx + r * Math.sin(a1)).toFixed(2)}"/>`;
  }
  return `<svg viewBox="0 0 178 178" aria-hidden="true">${segs}</svg>`;
}
const blocks = (n, extra = '') => `<div class="blocks">${Array.from({ length: n }, (_, k) => `<i style="--k:${k}"${k === n - 1 && extra ? ` class="${extra}"` : ''}>${k === n - 1 && extra ? '+25' : ''}</i>`).join('')}</div>`;

function buildMetric(el) {
  const d = el.dataset;
  const label = `<span class="lbl">${d.label || ''}</span>`;
  if (el.classList.contains('ring')) {
    el.innerHTML = ringSvg(Number(d.scale)) + `<b class="num">${d.prefix || ''}${d.value}<small>%</small></b>` + label;
  } else if (el.classList.contains('ratio')) {
    el.innerHTML = `<b class="num">2<em>X</em></b><div class="rows"><div class="b"><span>Base</span>${blocks(3)}</div><div class="t" style="--d:300ms"><span>Esperado</span>${blocks(6)}</div></div>` + label;
  } else if (el.classList.contains('index')) {
    el.innerHTML = `<div><b class="num">+25<small>%</small></b>${label}</div><div class="cmp"><span>Base</span><div class="line b">${blocks(4)}<b>100</b></div><span>Esperado</span><div class="line t" style="--d:350ms">${blocks(5, 'plus')}<b class="vt">125</b></div></div>`;
  }
  el.setAttribute('aria-label', d.detail);
  el.setAttribute('aria-pressed', 'false');
}
function countTo(node, from, to, duration, format, delay = 0) {
  cancelAnimationFrame(node._raf);
  clearTimeout(node._wait);
  node._wait = setTimeout(() => {
    const t0 = performance.now();
    const tick = now => {
      const k = Math.min(1, (now - t0) / duration);
      node.innerHTML = format(from + (to - from) * (1 - Math.pow(1 - k, 3)), k === 1);
      if (k < 1) node._raf = requestAnimationFrame(tick);
    };
    node._raf = requestAnimationFrame(tick);
  }, delay);
}
function playMetric(el) {
  const d = el.dataset;
  resetMetric(el, true);
  void el.offsetWidth;
  const ms = reduceMotion() ? 1 : 1300;
  el.classList.add('on');
  if (el.classList.contains('ring')) {
    const segs = el.querySelectorAll('.seg');
    const lit = Math.round(Number(d.value));
    segs.forEach((seg, k) => { if (k < lit) seg._t = setTimeout(() => seg.classList.add('lit'), reduceMotion() ? 0 : 80 + k * (ms / lit)); });
    countTo(el.querySelector('.num'), 0, Number(d.value), ms, v => `${d.prefix || ''}${Math.round(v)}<small>%</small>`);
  } else if (el.classList.contains('ratio')) {
    countTo(el.querySelector('.num'), 1, 2, ms, (v, done) => done ? '2<em>X</em>' : `${v.toFixed(1)}<em>X</em>`, 200);
  } else if (el.classList.contains('index')) {
    countTo(el.querySelector('.num'), 0, 25, ms, v => `+${Math.round(v)}<small>%</small>`);
    countTo(el.querySelector('.vt'), 100, 125, ms, v => String(Math.round(v)), 350);
  }
}
function resetMetric(el, keepPress) {
  el.classList.remove('on');
  if (!keepPress) el.setAttribute('aria-pressed', 'false');
  el.querySelectorAll('.seg').forEach(seg => { clearTimeout(seg._t); seg.classList.remove('lit'); });
}
const metrics = Array.from(document.querySelectorAll('.metric'));
metrics.forEach(el => {
  buildMetric(el);
  const note = el.closest('.panel').querySelector('.metric-note');
  const siblings = () => metrics.filter(m => m.closest('.panel') === el.closest('.panel'));
  const show = () => { note.textContent = el.dataset.detail; note.classList.add('live'); };
  const hide = () => {
    const pinned = siblings().find(m => m.getAttribute('aria-pressed') === 'true');
    if (pinned) { note.textContent = pinned.dataset.detail; return; }
    note.textContent = note.dataset.default; note.classList.remove('live');
  };
  el.addEventListener('pointerenter', show);
  el.addEventListener('focus', show);
  el.addEventListener('pointerleave', hide);
  el.addEventListener('blur', hide);
  el.addEventListener('click', event => {
    event.stopPropagation();
    const pressed = el.getAttribute('aria-pressed') === 'true';
    siblings().forEach(m => m.setAttribute('aria-pressed', 'false'));
    el.setAttribute('aria-pressed', String(!pressed));
    show();
    playMetric(el);
  });
});
function syncMetrics(scene, build) {
  scene.querySelectorAll('.metric').forEach(el => {
    if (build >= 3 && !el.classList.contains('on')) el._t = setTimeout(() => playMetric(el), 450);
    if (build < 3) { clearTimeout(el._t); resetMetric(el); }
  });
}

// ───────── Tiempo de entrega ─────────
const tiempo = scenes[IDX.tiempo];
tiempo.querySelectorAll('.trow').forEach((row, i) => {
  row.style.setProperty('--d', `${250 + i * 380}ms`);
  row.style.setProperty('--d2', `${150 + i * 320}ms`);
  row.style.setProperty('--n', row.querySelectorAll('.track i').length);
});
function syncTiempo(build) {
  tiempo.querySelectorAll('.trow').forEach(row => row.classList.toggle('on', build >= 1));
  const counters = tiempo.querySelectorAll('[data-count]');
  if (build >= 3 && !tiempo._counted) {
    tiempo._counted = true;
    counters.forEach(c => { const to = Number(c.dataset.count); countTo(c, to === 3 ? 1 : 0, to, reduceMotion() ? 1 : 1200, v => String(Math.round(v)), 450); });
  }
  if (build < 3) { tiempo._counted = false; counters.forEach(c => { clearTimeout(c._wait); c.textContent = c.dataset.count; }); }
}

// ───────── Builds ─────────
function renderBuild() {
  const scene = scenes[current];
  const build = Number(scene.dataset.build) || 0;
  const steps = stepsOf(scene);
  buildMenu.disabled = !steps;
  Array.from(buildMenu.options).forEach(o => { o.hidden = Number(o.value) > steps; });
  if (build) buildMenu.value = build;
  scene.querySelectorAll('[data-reveal]').forEach(element => {
    const visible = Number(element.dataset.reveal) <= build;
    element.classList.toggle('revealed', visible);
    element.setAttribute('aria-hidden', String(!visible));
    element.querySelectorAll('button').forEach(button => button.tabIndex = visible ? 0 : -1);
  });
  scene.classList.toggle('focus', scene.classList.contains('initiative') && build === 3);
  if (scene.classList.contains('initiative')) syncMetrics(scene, build);
  if (scene === tiempo) syncTiempo(build);
}
// Al salir de una lámina, sus elementos vuelven al estado oculto sin animarse,
// para que la próxima entrada vuelva a construirse desde cero.
function resetScene(scene) {
  scene.querySelectorAll('[data-reveal]').forEach(el => {
    el.style.transition = 'none';
    el.querySelectorAll('.body,.illus').forEach(c => c.style.transition = 'none');
    el.classList.remove('revealed');
  });
  scene.querySelectorAll('.trow').forEach(l => l.classList.remove('on'));
  scene.querySelectorAll('.metric').forEach(m => resetMetric(m));
  scene.classList.remove('focus');
  void scene.offsetWidth;
  scene.querySelectorAll('[data-reveal],[data-reveal] .body,[data-reveal] .illus').forEach(el => el.style.transition = '');
  if (scene === tiempo) tiempo._counted = false;
}

// ───────── Chrome: fondo, progreso y subtítulo ─────────
function placeTrackerBar(index) {
  const span = tracker.querySelector(`[data-i="${index}"]`);
  tracker.querySelectorAll('span').forEach(s => s.classList.toggle('on', s === span));
  if (span) { trackerBar.style.width = span.offsetWidth + 'px'; trackerBar.style.transform = `translateX(${span.offsetLeft}px)`; }
}
function syncChrome(scene) {
  const initiativeIndex = [IDX.fraude, IDX.carterizados, IDX.multisesion].indexOf(scenes.indexOf(scene));
  tracker.style.opacity = initiativeIndex >= 0 ? 1 : 0;
  chromeSub.style.opacity = scene === tiempo ? 1 : 0;
  if (initiativeIndex >= 0) placeTrackerBar(initiativeIndex);
}
tracker.style.transition = chromeSub.style.transition = 'opacity .6s ease';

// ───────── Transiciones ─────────
function flushTransition() {
  if (!pending) return;
  const job = pending; pending = null;
  job.anims.forEach(a => { if (a._exit) a.cancel(); else if (a.playState !== 'finished') a.finish(); });
  job.cleanup();
}
function choreograph(from, to, dir) {
  const anims = [];
  // Entradas: fill 'backwards' (al terminar no queda efecto). Salidas: fill 'forwards' y se cancelan con la escena ya oculta.
  const A = (el, frames, opts) => {
    if (!el) return;
    const exit = el === from || from.contains(el);
    const a = el.animate(frames, { easing: OUT, ...opts, fill: exit ? 'forwards' : 'backwards' });
    a._exit = exit;
    anims.push(a);
    return a;
  };
  const fromI = scenes.indexOf(from), toI = scenes.indexOf(to);
  const lightFrom = isLight(from), lightTo = isLight(to);
  const fadeOutOld = (d = 450) => A(from, [{ opacity: 1 }, { opacity: 0 }], { duration: d, easing: 'ease' });
  const titleIn = (delay = 250, y = 36) => A(to.querySelector('.slide-title'), [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: 'none' }], { duration: 800, delay });
  const titleOut = () => A(from.querySelector('.slide-title'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-36px)' }], { duration: 420, easing: IN });

  if (reduceMotion()) { A(to, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 }); return anims; }

  // Oscuro → oscuro: disolvencia sobre la escena anterior.
  if (!lightFrom && !lightTo) { A(to, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'ease' }); return anims; }

  // Video → puente: el comercial se aleja como una tarjeta y aparece el fondo institucional.
  if (!lightFrom && lightTo) {
    A(from, [{ transform: 'none', opacity: 1, borderRadius: '0px' }, { transform: 'scale(.9)', opacity: 0, borderRadius: '40px' }], { duration: 900, easing: IO });
    A(chrome, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 250, easing: 'ease' });
    chrome.querySelectorAll('.chrome-lines path').forEach((p, i) => A(p, [{ strokeDasharray: 1000, strokeDashoffset: 1000 }, { strokeDasharray: 1000, strokeDashoffset: 0 }], { duration: 1600, delay: 350 + i * 70, easing: IO }));
    A(chrome.querySelector('.chrome-icon'), [{ opacity: 0, transform: 'scale(.6) rotate(-12deg)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 600 });
    A(chrome.querySelector('.chrome-logo'), [{ opacity: 0, transform: 'translateX(40px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 900 });
    titleIn(700);
    A(to.querySelector('.bridge-lead'), [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 850 });
    to.querySelectorAll('.bcard').forEach((c, i) => A(c, [{ opacity: 0, transform: 'translateY(70px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: 1050 + i * 140 }));
    to.querySelectorAll('.panel.revealed,.tpanel').forEach(p => A(p, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 600 }));
    return anims;
  }

  // Claro → oscuro: el fondo institucional se apaga bajo la nueva escena.
  if (lightFrom && !lightTo) {
    A(to, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 150, easing: 'ease' });
    return anims;
  }

  // Claro → claro, hacia atrás: empuje inverso.
  if (dir < 0 || Math.abs(toI - fromI) !== 1) {
    fadeOutOld(350);
    titleIn(150, -30);
    A(to.querySelector('.grid,.bcards,.tpanel'), [{ opacity: 0, transform: `translateX(${dir < 0 ? -120 : 120}px)` }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 150 });
    return anims;
  }

  // Puente → Fraude: «01» viaja al título y la primera tarjeta se convierte en el primer panel.
  if (fromI === IDX.bridge && toI === IDX.fraude) {
    const cards = from.querySelectorAll('.bcard');
    const card = cards[0];
    const c = layoutRect(card), p = layoutRect(to.querySelector('.p-d'));
    titleOut();
    A(from.querySelector('.bridge-lead'), [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-20px)' }], { duration: 400, easing: IN });
    card.querySelectorAll(':scope > *').forEach(ch => A(ch, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 }));
    A(card, [{ transformOrigin: '0 0', transform: 'none', opacity: 1 }, { transformOrigin: '0 0', transform: `translate(${p.x - c.x}px,${p.y - c.y}px) scale(${p.w / c.w},${p.h / c.h})`, opacity: 1, offset: .85 }, { transformOrigin: '0 0', transform: `translate(${p.x - c.x}px,${p.y - c.y}px) scale(${p.w / c.w},${p.h / c.h})`, opacity: 0 }], { duration: 1000, delay: 120, easing: IO });
    [cards[1], cards[2]].forEach((k, i) => A(k, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(90px) scale(.96)' }], { duration: 600, delay: i * 80, easing: IN }));
    const num = to.querySelector('.slide-title .num'), src = layoutRect(card.querySelector('.bnum')), dst = layoutRect(num);
    A(num, [{ transformOrigin: '0 0', transform: `translate(${src.x - dst.x}px,${src.y - dst.y}px) scale(${src.h / dst.h})`, color: '#7df2b7' }, { transformOrigin: '0 0', transform: 'none', color: '#13bc77' }], { duration: 1100, delay: 100, easing: IO });
    A(to.querySelector('.slide-title h2'), [{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)' }], { duration: 900, delay: 650, easing: IO });
    A(tracker, [{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 900 });
    to.querySelectorAll('.panel.revealed').forEach(pn => A(pn, [{ opacity: 0 }, { opacity: 0, offset: .55 }, { opacity: 1 }], { duration: 1150, easing: 'linear' }));
    return anims;
  }

  // Multisesión → Tiempo: los nombres del progreso bajan y se convierten en las filas.
  if (fromI === IDX.multisesion && toI === IDX.tiempo) {
    titleOut();
    from.querySelectorAll('.panel.revealed').forEach((pn, i) => A(pn, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], { duration: 500, delay: i * 40, easing: IN }));
    titleIn(350);
    const tpanel = to.querySelector('.tpanel');
    tpanel.style.transition = 'none';
    tpanel.classList.add('revealed');
    A(tpanel, [{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 350 });
    to.querySelectorAll('.tname b').forEach((b, i) => {
      const s = tracker.querySelector(`[data-i="${i}"]`);
      const src = layoutRect(s), dst = layoutRect(b);
      A(b, [{ transformOrigin: '0 0', transform: `translate(${src.x - dst.x}px,${src.y - dst.y}px) scale(${src.h / dst.h})`, color: s.classList.contains('on') ? '#062c7c' : '#97a4ba' }, { transformOrigin: '0 0', transform: 'none', color: '#ffffff' }], { duration: 1200, delay: 60 + i * 90, easing: IO });
    });
    to.querySelectorAll('.tname span,.tlegend').forEach(el => A(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 1000 }));
    return anims;
  }

  // Iniciativa → iniciativa: dos coreografías distintas para que la secuencia no se repita.
  titleOut();
  titleIn(300);
  const oldPanels = from.querySelectorAll('.panel.revealed');
  const grid = to.querySelector('.grid');
  if (toI === IDX.carterizados) {
    // Empuje lateral: el contenido sale a la izquierda y el nuevo entra desde la derecha.
    oldPanels.forEach((pn, i) => A(pn, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-140px)', offset: .7 }, { opacity: 0, transform: 'translateX(-160px)' }], { duration: 460, delay: i * 35, easing: 'cubic-bezier(.4,0,1,1)' }));
    A(grid, [{ opacity: 0, transform: 'translateX(200px)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: 400 });
  } else {
    // Profundidad: lo anterior se aleja y lo nuevo llega desde el frente.
    oldPanels.forEach((pn, i) => A(pn, [{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(.92)', filter: 'blur(6px)', offset: .75 }, { opacity: 0, transform: 'scale(.9)', filter: 'blur(6px)' }], { duration: 480, delay: i * 30, easing: 'cubic-bezier(.4,0,1,1)' }));
    A(grid, [{ opacity: 0, transform: 'scale(1.06)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1000, delay: 380 });
  }
  return anims;
}

function startScene() {
  const scene = scenes[current];
  if (scene === opening) startOpening(() => { if (continuous.checked && current === 0) next(); });
  const video = scene.querySelector('video');
  if (video) playVideo(video);
}
function playVideo(video) {
  const token = transitionToken;
  return video.play().catch(error => {
    if (token === transitionToken && error.name !== 'AbortError') showReport(`El navegador requiere reanudar el video con P o con «Pausa / reproducir». (${error.name})`);
  });
}

function goTo(index, build = 1) {
  if (!scenes[index]) return;
  flushTransition();
  transitionToken++;
  const old = scenes[current];
  const scene = scenes[index];
  const dir = index >= current ? 1 : -1;
  old.querySelector('video')?.pause();
  if (old === opening && index !== 0) stopOpening();
  const changed = index !== current;
  if (changed) {
    old.classList.remove('current');
    old.inert = true;
    old.classList.add('leaving');
    current = index;
  }
  if (stepsOf(scene)) scene.dataset.build = Math.min(build, stepsOf(scene));
  const video = scene.querySelector('video');
  if (video) video.currentTime = 0;
  scene.classList.add('current');
  scene.inert = false;
  void scene.offsetWidth; // la escena ya tiene caja: sus builds se animan al entrar
  jump.value = current;
  scene.querySelectorAll('.metric').forEach(m => m.setAttribute('aria-pressed', 'false'));
  scene.querySelectorAll('.metric-note').forEach(n => { n.textContent = n.dataset.default; n.classList.remove('live'); });
  if (isLight(scene)) { chrome.classList.add('on'); syncChrome(scene); }
  renderBuild();
  const anims = changed ? choreograph(old, scene, dir) : [];
  const job = {
    anims,
    cleanup: () => {
      old.classList.remove('leaving');
      if (changed && old !== scene) resetScene(old);
      if (!isLight(scenes[current])) chrome.classList.remove('on');
      scene.querySelector('.tpanel')?.style.removeProperty('transition');
    }
  };
  pending = job;
  if (anims.length) Promise.all(anims.map(a => a.finished)).then(() => { if (pending === job) flushTransition(); }, () => {});
  else flushTransition();
  startScene();
}

function setBuild(number) {
  const scene = scenes[current];
  if (stepsOf(scene)) { scene.dataset.build = number; renderBuild(); }
}
function next() {
  const scene = scenes[current];
  const build = Number(scene.dataset.build);
  if (build && build < stepsOf(scene)) setBuild(build + 1);
  else goTo(current + 1);
}
function back() {
  const build = Number(scenes[current].dataset.build);
  if (build > 1) setBuild(build - 1);
  else goTo(current - 1, 9);
}
function togglePlayback() {
  const video = scenes[current].querySelector('video');
  if (video) {
    if (video.ended) video.currentTime = 0;
    if (video.paused) playVideo(video); else video.pause();
  } else if (current === 0) toggleOpening();
}
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { showReport('La pantalla completa no está disponible en este contexto. Usa F11 en Chrome o Edge.'); }
}
function togglePanel() {
  panel.hidden = !panel.hidden;
  if (!panel.hidden) jump.focus(); else stage.focus({ preventScroll: true });
}

// ───────── Pantalla de preparación ─────────
const ringPrg = loader.querySelector('.mini-ring .prg');
const startLabel = loader.querySelector('.start-label');
const statusNode = loader.querySelector('.loader-status');
const startFull = document.querySelector('#start-full');
const startWindow = document.querySelector('#start-window');
let target = 0, shown = 0, ready = false, failures = [];

function drawProgress() {
  shown += (target - shown) * .08;
  if (target - shown < .002) shown = target;
  const pct = Math.round(shown * 100);
  ringPrg.style.strokeDasharray = `${pct} 100`;
  startLabel.innerHTML = `Preparando · <b>${pct}</b> %`;
  if (shown >= 1 && target >= 1) return markReady();
  requestAnimationFrame(drawProgress);
}
function markReady() {
  if (ready) return;
  ready = true;
  loader.classList.add('ready');
  startLabel.textContent = 'Iniciar en pantalla completa';
  statusNode.textContent = failures.length
    ? `No se pudo cargar ${failures.join(' y ')}. Revisa la carpeta assets o inicia igual.`
    : 'Todo listo. También puedes iniciar con → o Espacio en el presentador.';
  startFull.disabled = startWindow.disabled = false;
  startFull.focus({ preventScroll: true });
}
function waitFor(promise, ms) { return Promise.race([promise, new Promise(r => setTimeout(r, ms))]); }
function loadMedia() {
  const jobs = [
    { label: 'Cargando tipografías e imágenes', run: () => Promise.all([document.fonts.ready, ...['assets/vision_logo_negativo.png', 'assets/fondo_azul_1n.jpg', 'assets/formula1n.png'].map(src => new Promise(res => { const im = new Image(); im.onload = im.onerror = res; im.src = src; }))]) },
    ...Array.from(document.querySelectorAll('video'), (video, i) => ({
      label: i === 0 ? 'Cargando el video del equipo' : 'Cargando el comercial',
      name: i === 0 ? 'el video del equipo' : 'el comercial',
      run: () => new Promise(res => {
        if (video.readyState >= 3) return res();
        video.preload = 'auto';
        video.addEventListener('canplaythrough', res, { once: true });
        video.addEventListener('loadeddata', () => setTimeout(res, 400), { once: true });
        video.addEventListener('error', () => { failures.push(i === 0 ? 'el video del equipo' : 'el comercial'); res(); }, { once: true });
        video.load();
      })
    }))
  ];
  const t0 = performance.now();
  let done = 0;
  const run = async () => {
    for (const job of jobs) {
      statusNode.textContent = job.label;
      await waitFor(job.run(), 12000);
      done++;
      target = done / jobs.length * .96;
    }
    await new Promise(r => setTimeout(r, Math.max(0, 1600 - (performance.now() - t0))));
    target = 1;
  };
  run();
  requestAnimationFrame(drawProgress);
}
async function begin(full) {
  if (started || !ready) return;
  started = true;
  restartOnFullscreen = false;
  if (full) { try { await document.documentElement.requestFullscreen(); } catch {} }
  loader.querySelector('.cover-main').animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-60px)' }], { duration: 600, easing: IN, fill: 'forwards' });
  loader.querySelectorAll('.cover-agenda li').forEach((li, i) => li.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(60px)' }], { duration: 500, delay: i * 40, easing: IN, fill: 'forwards' }));
  loader.querySelector('.cover-agenda').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 150, fill: 'forwards' });
  loader.animate([{ opacity: 1 }, { opacity: 1, offset: .5 }, { opacity: 0 }], { duration: 1000, easing: 'ease', fill: 'forwards' }).onfinish = () => {
    loader.hidden = true;
    document.body.classList.remove('loading');
    stage.focus({ preventScroll: true });
  };
  setTimeout(() => { goTo(0); restartOnFullscreen = true; }, full ? 700 : 400);
}
startFull.addEventListener('click', event => { event.stopPropagation(); begin(true); });
startWindow.addEventListener('click', event => { event.stopPropagation(); begin(false); });
// Al entrar a pantalla completa en la apertura, la animación vuelve a empezar para verse completa.
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement && started && current === 0 && restartOnFullscreen) {
    stopOpening();
    setTimeout(() => { if (current === 0) goTo(0); }, 600);
  }
});

// ───────── Teclado y controles ─────────
const actions = {
  ArrowRight: next, ArrowDown: next, PageDown: next, Enter: next, ' ': next,
  ArrowLeft: back, ArrowUp: back, PageUp: back, Backspace: back,
  Home: () => goTo(0), End: () => goTo(scenes.length - 1), f: fullscreen, g: togglePanel,
  p: togglePlayback, r: () => goTo(current, Number(scenes[current].dataset.build) || 1),
  a: () => setBuild(stepsOf(scenes[current])),
  m: () => scenes[current].querySelectorAll('.panel.revealed .metric').forEach(playMetric)
};

scenes.forEach((scene, index) => {
  jump.add(new Option(scene.getAttribute('aria-label'), index));
  const video = scene.querySelector('video');
  if (video) {
    video.addEventListener('ended', () => { if (continuous.checked && current === index) next(); });
    video.addEventListener('error', () => showReport(`No se pudo cargar ${video.getAttribute('src')}. Revisa la carpeta assets.`));
  }
});

addEventListener('resize', fit);
stage.addEventListener('click', event => { if (event.button === 0 && started) next(); });
addEventListener('keydown', event => {
  if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if ((key === 'Escape' && !panel.hidden) || key === 'g') { event.preventDefault(); togglePanel(); return; }
  if (panel.contains(event.target)) return;
  if (!started) {
    const onButton = event.target.closest?.('#loader button');
    if (['ArrowRight', 'ArrowDown', 'PageDown', 'f'].includes(key) || (!onButton && (key === ' ' || key === 'Enter'))) { event.preventDefault(); begin(true); }
    return;
  }
  if (event.target.closest?.('.metric') && (key === 'Enter' || key === ' ')) return;
  const action = actions[key];
  if (action) { event.preventDefault(); action(); }
});

jump.addEventListener('change', () => { if (!started) { started = true; loader.hidden = true; document.body.classList.remove('loading'); } goTo(Number(jump.value)); });
buildMenu.addEventListener('change', () => setBuild(Number(buildMenu.value)));
document.querySelector('#maximize').addEventListener('click', fullscreen);
const buttons = { prev: back, next, pause: togglePlayback, replay: actions.r, full: fullscreen, hide: togglePanel };
Object.entries(buttons).forEach(([id, action]) => document.querySelector('#' + id).addEventListener('click', action));
document.querySelector('#check').addEventListener('click', () => {
  const lines = Array.from(document.querySelectorAll('video'), video => {
    const file = video.getAttribute('src').split('/').pop();
    return `${file} · ${Number.isFinite(video.duration) ? `${video.duration.toFixed(1)} s · ${video.videoWidth}×${video.videoHeight}` : 'Revisa el archivo o espera la carga'}`;
  });
  showReport(lines.join('\n') + '\nPara verificar la salida de audio, reproduce el comercial desde Escena.');
});

document.body.classList.add('loading');
fit();
renderBuild();
loadMedia();
