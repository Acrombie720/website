// Fluencyfox, free-form concept. Plain JS, no dependencies.
//
// Everything that moves here moves because the visitor scrolled, pointed or
// clicked. Two views of one thing stay in step, as they do on the platform:
// the recording and its transcript and chat, the weights and the results
// table, the waveform and its words. Nothing loops while the page sits still.

(() => {
  'use strict';

  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const tone = v => (v >= 7.5 ? 'high' : v >= 5 ? 'medium' : 'low');
  const onLoaded = fn => (document.readyState === 'complete' ? fn() : addEventListener('load', fn, { once: true }));
  const docTop = el => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
  const watch = (el, fn, margin = '0px') => new IntersectionObserver(([e]) => fn(e.isIntersecting), { rootMargin: margin }).observe(el);
  // For loops: fn(true) while el is on screen in a visible tab, fn(false)
  // once it scrolls away or the tab is hidden.
  const watchSeen = (el, fn, margin) => {
    let on = false, seen;
    const update = () => { const v = on && !document.hidden; if (v !== seen) fn((seen = v)); };
    watch(el, v => { on = v; update(); }, margin);
    document.addEventListener('visibilitychange', update);
  };
  const once = (el, fn, margin = '0px') => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: margin });
    io.observe(el);
  };
  const feature = (name, fn) => { try { fn(); } catch (err) { console.error('[concept] ' + name, err); } };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const splitWords = (el, text) => {
    el.innerHTML = text.split(/(\s+)/).map(w => (/^\s+$/.test(w) || !w ? w : `<span class="w">${esc(w)}</span>`)).join('');
    return $$('.w', el);
  };

  // One scroll loop for everything scroll-linked; resize re-measures.
  const onScroll = [];
  const onMeasure = [];
  let raf = 0;
  const tick = () => { raf = 0; const y = scrollY; onScroll.forEach(fn => fn(y)); };
  const request = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const measure = () => { onMeasure.forEach(fn => fn()); request(); };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', measure);
  onLoaded(() => { measure(); requestAnimationFrame(() => root.classList.add('smooth')); });

  // In a hidden tab the CSS loops pause too (concept.css, .tab-hidden).
  feature('hidden tab', () => {
    const sync = () => root.classList.toggle('tab-hidden', document.hidden);
    document.addEventListener('visibilitychange', sync);
    sync();
  });

  // ---------------------------------------------------------------- reveals

  feature('reveal', () => {
    $$('.bento, .voice-grid, .steps').forEach(p => $$(':scope > [data-reveal]', p).forEach((c, i) => c.style.setProperty('--d', (i * 0.09).toFixed(2) + 's')));
    const els = $$('[data-reveal], .problems');
    if (!motion) { els.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -12% 0px' });
    els.forEach(el => io.observe(el));
    const steps = $('#steps');
    if (steps) once(steps, () => steps.style.setProperty('--steps', '1'), '0px 0px -30% 0px');
  });

  // ---------------------------------------------------------------- nav

  feature('nav', () => {
    const nav = $('#nav');
    const zones = $$('[data-nav]').filter(el => el !== document.body);
    const links = $$('.nav-links a');
    const targets = links.map(a => $(a.getAttribute('href')));
    onScroll.push(() => {
      // Later sheets sit on top of earlier ones: the last zone under the
      // header's line is the one being looked at.
      const probe = nav.getBoundingClientRect().bottom - 6;
      let theme = 'paper';
      zones.forEach(z => { const r = z.getBoundingClientRect(); if (r.top <= probe && r.bottom > probe) theme = z.dataset.nav; });
      if (document.body.dataset.nav !== theme) document.body.dataset.nav = theme;
      let current = -1;
      targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
      links.forEach((a, i) => a.classList.toggle('is-current', i === current));
    });
  });

  // ---------------------------------------------------------------- hero: pinned, then covered

  feature('hero cover', () => {
    const hero = $('.hero');
    const pin = $('#heroPin');
    const night = $('.sheet-night');
    onMeasure.push(() => hero.style.setProperty('--pin-top', Math.min(0, innerHeight - hero.offsetHeight) + 'px'));
    onScroll.push(() => {
      if (!motion) return;
      const p = clamp(1 - night.getBoundingClientRect().top / innerHeight, 0, 1);
      pin.style.transform = p > 0 ? `scale(${(1 - p * 0.06).toFixed(4)})` : '';
      pin.style.opacity = p > 0 ? (1 - p * 0.75).toFixed(3) : '';
    });
  });

  // ---------------------------------------------------------------- the lens

  // Two identical CVs. The lens shows the report behind each one. On a mouse
  // it follows the pointer; on touch a tap opens a CV from where you touched.
  feature('lens', () => {
    const desk = $('#desk');
    const lens = $('#lens');
    const cvs = $$('.cv', desk);
    const revealAll = $('#revealAll');
    let R = 132;
    const L = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0 };
    let geo = [];
    let frame = 0, intro = null, touched = false;

    function measureDesk() {
      R = parseFloat(getComputedStyle(desk).getPropertyValue('--r')) || 132;
      geo = cvs.map(cv => ({
        cv,
        w: cv.offsetWidth,
        h: cv.offsetHeight,
        cx: cv.offsetLeft + cv.offsetWidth / 2,
        cy: cv.offsetTop + cv.offsetHeight / 2,
        th: -(parseFloat(getComputedStyle(cv).getPropertyValue('--rot')) || 0) * Math.PI / 180,
      }));
    }
    onMeasure.push(measureDesk);
    measureDesk();
    const touch = () => { if (!touched) { touched = true; desk.classList.add('is-touched'); } };

    function draw(now) {
      frame = 0;
      if (intro) runIntro(now);
      const k = intro ? 0.12 : 0.24;
      L.x = lerp(L.x, L.tx, k);
      L.y = lerp(L.y, L.ty, k);
      L.r = lerp(L.r, L.tr, 0.16);
      if (Math.abs(L.r - L.tr) < 0.4) L.r = L.tr;
      lens.style.transform = `translate(${L.x.toFixed(1)}px, ${L.y.toFixed(1)}px)`;
      lens.style.setProperty('--lens-scale', (L.r / R).toFixed(3));
      lens.classList.toggle('is-on', L.r > 4);
      geo.forEach(g => {
        const dx = L.x - g.cx, dy = L.y - g.cy;
        const c = Math.cos(g.th), s = Math.sin(g.th);
        g.cv.style.setProperty('--lx', (dx * c - dy * s + g.w / 2).toFixed(1) + 'px');
        g.cv.style.setProperty('--ly', (dx * s + dy * c + g.h / 2).toFixed(1) + 'px');
        g.cv.style.setProperty('--lr', L.r.toFixed(1) + 'px');
      });
      if (intro || Math.abs(L.x - L.tx) > 0.3 || Math.abs(L.y - L.ty) > 0.3 || L.r !== L.tr) frame = requestAnimationFrame(draw);
    }
    const go = () => { if (!frame) frame = requestAnimationFrame(draw); };

    // One demonstration pass when the desk first appears, then it rests.
    function startIntro() {
      if (!motion || touched || geo.length < 2) return;
      const [a, b] = geo;
      intro = {
        t0: performance.now(),
        pts: [
          [0, a.cx - a.w * 0.15, a.cy - 40, 0],
          [500, a.cx - a.w * 0.15, a.cy - 40, R],
          [1500, a.cx + a.w * 0.12, a.cy + a.h * 0.18, R],
          [2600, b.cx - b.w * 0.12, b.cy - 30, R],
          [3600, b.cx + b.w * 0.12, b.cy + b.h * 0.2, R],
          [4300, b.cx + b.w * 0.12, b.cy + b.h * 0.2, 0],
        ],
      };
      L.x = L.tx = intro.pts[0][1];
      L.y = L.ty = intro.pts[0][2];
      go();
    }
    function runIntro(now) {
      const t = now - intro.t0;
      const pts = intro.pts;
      if (t >= pts[pts.length - 1][0]) { intro = null; L.tr = 0; return; }
      let i = 0;
      while (i < pts.length - 2 && t > pts[i + 1][0]) i++;
      const [t0, x0, y0, r0] = pts[i], [t1, x1, y1, r1] = pts[i + 1];
      const u = easeIO(clamp((t - t0) / (t1 - t0), 0, 1));
      L.tx = lerp(x0, x1, u);
      L.ty = lerp(y0, y1, u);
      L.tr = lerp(r0, r1, u);
    }
    once(desk, () => setTimeout(startIntro, 1700), '0px 0px -25% 0px');

    desk.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = desk.getBoundingClientRect();
      L.tx = e.clientX - r.left;
      L.ty = e.clientY - r.top;
      intro = null;
      L.tr = e.target.closest('.cv') ? R : R * 0.55;
      touch();
      go();
    });
    desk.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') { L.tr = 0; go(); } });

    function setOpen(cv, open, ox = '50%', oy = '50%') {
      if (open) {
        cv.classList.remove('is-closing');
        cv.style.setProperty('--ox', ox);
        cv.style.setProperty('--oy', oy);
        cv.classList.add('is-open');
      } else if (cv.classList.contains('is-open')) {
        cv.style.setProperty('--lx', getComputedStyle(cv).getPropertyValue('--ox') || '50%');
        cv.style.setProperty('--ly', getComputedStyle(cv).getPropertyValue('--oy') || '50%');
        cv.classList.add('is-closing');
        cv.classList.remove('is-open');
        setTimeout(() => cv.classList.remove('is-closing'), 650);
      }
    }
    let down = null;
    desk.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') down = { x: e.clientX, y: e.clientY }; });
    desk.addEventListener('pointerup', e => {
      if (e.pointerType !== 'touch' || !down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      const cv = e.target.closest('.cv');
      if (!cv || moved > 12) return;
      const r = cv.getBoundingClientRect();
      const g = geo.find(x => x.cv === cv);
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const c = Math.cos(g.th), s = Math.sin(g.th);
      setOpen(cv, !cv.classList.contains('is-open'), (dx * c - dy * s + g.w / 2) + 'px', (dx * s + dy * c + g.h / 2) + 'px');
      touch();
    });
    revealAll.addEventListener('click', () => {
      const open = revealAll.getAttribute('aria-pressed') !== 'true';
      revealAll.setAttribute('aria-pressed', String(open));
      revealAll.textContent = open ? 'Back to the CVs' : 'Show both reports';
      cvs.forEach(cv => setOpen(cv, open));
      touch();
    });
  });

  // ---------------------------------------------------------------- the session: the employer's report

  const session = {};
  feature('session', () => {
    const track = $('#sessionTrack');
    const stage = $('.session-stage');
    const report = $('#player');
    const parts = $$('[data-part]', $('#rpPage')).slice(1); // the written report, below the player
    const frame = $('.rp-frame', report);
    const page = $('#rpPage');
    const view = $('.rp-view', page);
    const scenes = $$('.scene', report);
    const lis = $$('#chapters li');
    const moments = $('#chapters');
    const T = lis.map(li => Number(li.dataset.t));
    const END = T[T.length - 1];
    const N = lis.length;
    const labels = lis.map(li => $('span', li).textContent);
    const sceneOf = lis.map(li => Number(li.dataset.scene));
    const stepsOf = lis.map(li => (li.dataset.steps ? li.dataset.steps.split(',').map(Number) : [-1, -1]));
    const clocks = [$('#clock'), $('#playerClock')];
    const now = $('#chapterNow');
    const rpTrack = $('#rpTrack');
    const playBtn = $('#rpPlay');
    const rail = $('.rp-rail', report);
    const tabs = $$('.rp-rail [role="tab"]', report);
    const panes = { transcript: $('#transcriptPane'), chat: $('#chatPane') };
    const msgs = $$('.msg', panes.chat).map(el => ({ el, at: Number(el.dataset.at), shown: false, words: el.textContent.trim().split(/\s+/).length }));
    const cam = $('#camVideo');

    // Transcript: what she says, with the time she says it. Words light up as
    // the line plays.
    const lines = $$('p', $('#lines').content).map(p => {
      const at = Number(p.dataset.at);
      const row = document.createElement('p');
      row.className = 'tline is-future';
      row.innerHTML = `<time>${fmt(at)}</time><span></span>`;
      panes.transcript.appendChild(row);
      return { row, at, words: splitWords($('span', row), p.textContent) };
    });

    // The recording plays event by event: a line of speech, a chat message, a
    // change on her screen. Each gets time to be read; the clock fast-forwards
    // through the quiet stretches between them.
    const stops = [...new Set([...T, ...lines.map(l => l.at), ...msgs.map(m => m.at), ...stepsOf.flat().filter(s => s >= 0)])].sort((a, b) => a - b);
    const S = stops.length;
    const HOLD = 0.15; // share of each step spent still, before the clock moves
    const read = n => clamp(1.6 + n * 0.2, 2.2, 6.5);
    const D = stops.slice(0, -1).map(s => {
      const n = lines.filter(l => l.at === s).reduce((a, l) => a + l.words.length, 0) + msgs.filter(m => m.at === s).reduce((a, m) => a + m.words, 0);
      return n ? read(n) : 2.2;
    });
    lines.forEach(l => { l.stop = stops.indexOf(l.at); });

    // Chat moments are marked on the player's timeline, as on the report.
    const marks = msgs.map(m => {
      const s = document.createElement('span');
      s.className = 'mark';
      s.style.left = (m.at / END * 100).toFixed(2) + '%';
      rpTrack.appendChild(s);
      return s;
    });

    // Timestamps in the written report play the recording from that moment.
    $$('.rp-list li, .rp-timeline li, .rp-tools span', page).forEach(el => {
      el.innerHTML = el.innerHTML.replace(/\[(\d{2}):(\d{2})\]/g, (_, m, s) =>
        `<button type="button" class="ts" data-at="${Number(m) * 60 + Number(s)}" title="Play recording from ${m}:${s}" aria-label="Play recording from ${m}:${s}"><svg aria-hidden="true"><use href="#i-play"/></svg>${m}:${s}</button>`);
    });

    // The rail follows whoever spoke last, Amara or the chat, unless the
    // visitor picks a tab; that choice holds until the next moment.
    let pane = 'transcript', manual = -1, cur = -1, curScene = -1;
    const setPane = key => {
      pane = key;
      tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.pane === key)));
      panes.transcript.hidden = key !== 'transcript';
      panes.chat.hidden = key !== 'chat';
      if (key === 'chat') rail.classList.remove('has-unread');
    };
    tabs.forEach(t => t.addEventListener('click', () => { manual = cur; setPane(t.dataset.pane); }));

    // u: position in the recording, in steps (0 … S-1).
    let u = 0;
    const tAt = x => {
      const i = Math.min(S - 1, Math.floor(x));
      return i < S - 1 ? stops[i] + (stops[i + 1] - stops[i]) * clamp((x - i - HOLD) / (1 - HOLD), 0, 1) : END;
    };
    const uAt = sec => {
      let i = 0;
      while (i < S - 2 && stops[i + 1] <= sec) i++;
      if (sec >= END) return S - 1;
      return i + (sec <= stops[i] ? 0 : HOLD + (1 - HOLD) * clamp((sec - stops[i]) / (stops[i + 1] - stops[i]), 0, 1));
    };
    // Each moment plays from its first step to just short of the next moment.
    const first = T.map(t => stops.indexOf(t));
    const endU = k => (k < N - 1 ? first[k + 1] - 0.02 : S - 1);
    const momentOf = sec => { let k = 0; while (k < N - 1 && T[k + 1] <= sec) k++; return k; };

    function render() {
      const i = Math.min(S - 1, Math.floor(u));
      const f = u - i;
      const t = tAt(u);
      const k = momentOf(t);

      const stamp = fmt(t);
      clocks.forEach(c => { if (c.textContent !== stamp) c.textContent = stamp; });
      rpTrack.style.setProperty('--p', (t / END).toFixed(4));
      report.classList.toggle('is-ended', u >= S - 1);

      if (k !== cur) {
        lis.forEach((li, n) => { li.classList.toggle('is-past', n < k); li.classList.toggle('is-now', n === k); });
        if (manual !== k) manual = -1;
        if (review && now.textContent !== labels[k]) now.textContent = labels[k];
        cur = k;
      }
      if (sceneOf[k] !== curScene) {
        curScene = sceneOf[k];
        scenes.forEach(s => s.classList.toggle('is-on', Number(s.dataset.scene) === curScene));
      }
      const scene = scenes[curScene];
      scene.classList.toggle('step-1', t >= stepsOf[k][0]);
      scene.classList.toggle('step-2', t >= stepsOf[k][1]);

      let last = null;
      lines.forEach(l => {
        const state = l.at > t ? 1 : l.stop < i ? -1 : 0;
        l.row.classList.toggle('is-past', state < 0);
        l.row.classList.toggle('is-future', state > 0);
        const n = state < 0 || i >= S - 1 ? l.words.length : state > 0 ? 0 : Math.round(clamp(f * 1.25, 0, 1) * l.words.length);
        l.words.forEach((w, x) => { w.classList.toggle('said', x < n); w.classList.toggle('now', state === 0 && x === n - 1 && n < l.words.length); });
        if (l.at <= t) last = { kind: 'transcript', at: l.at };
      });
      msgs.forEach((m, x) => {
        const show = t >= m.at;
        m.el.classList.toggle('is-future', !show);
        marks[x].classList.toggle('is-hot', show && t - m.at < 60);
        if (show && (!last || m.at > last.at)) last = { kind: 'chat', at: m.at };
        if (show && !m.shown) { m.shown = true; m.el.classList.add('is-new'); if (pane === 'transcript' && manual !== -1) rail.classList.add('has-unread'); }
        else if (!show && m.shown) { m.shown = false; m.el.classList.remove('is-new'); }
      });
      if (manual === -1 && last && last.kind !== pane) setPane(last.kind);
      if (!msgs.some(m => m.shown)) rail.classList.remove('has-unread');

      moments.style.setProperty('--prog', (k < N - 1 ? (k + (t - T[k]) / (T[k + 1] - T[k])) / (N - 1) : 1).toFixed(4));
    }

    // Playback within the current moment. Runs only while playing and on
    // screen; when the moment has played out it stops, and the next moment
    // in the list lights once to say a scroll moves on.
    let mk = -1; // the moment the scroll position is in
    let playing = false, userPaused = false, visible = false, loopId = 0, lastTs = 0, pending = null;
    // Review: from the written report, a timestamp plays the recording in
    // place, as an ordinary player, instead of sending the visitor back
    // through the moments. Any scroll returns the report to where it was.
    let review = false, reviewY = 0;
    const limit = () => (review ? S - 1 : endU(mk));
    const loop = ts => {
      loopId = 0;
      if (!playing) return;
      const dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
      lastTs = ts;
      const stop = limit();
      u = Math.min(stop, u + dt / D[Math.min(S - 2, Math.floor(u))]);
      render();
      if (u >= stop) { setPlaying(false); if (!review && lis[mk + 1]) lis[mk + 1].classList.add('is-next'); return; }
      loopId = requestAnimationFrame(loop);
    };
    function setPlaying(on) {
      if (on && u >= limit()) { u = review ? 0 : first[mk]; render(); }
      playing = on && (review || mk < N - 1);
      lastTs = 0;
      report.classList.toggle('is-playing', playing);
      playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      if (playing && !loopId) loopId = requestAnimationFrame(loop);
    }
    playBtn.addEventListener('click', () => { userPaused = playing; setPlaying(!playing); });

    // Arriving at a moment: forwards, it plays from the start; backwards, it
    // shows as played. A timestamp or the timeline can ask for a set time.
    const enter = (k, dir) => {
      mk = k;
      lis.forEach(li => li.classList.remove('is-next'));
      if (pending !== null && momentOf(pending) === k) { u = uAt(pending); pending = null; userPaused = false; }
      else if (dir < 0 || !motion) u = endU(k);
      else { u = first[k]; userPaused = false; }
      render();
      if (motion && visible && !userPaused && u < endU(k)) setPlaying(true);
      else if (playing && u >= endU(k)) setPlaying(false);
    };

    // Scroll: one step per moment, then the written report moves up with the
    // visitor's own scroll, at the same speed, until it ends.
    let top = 0, height = 1, M = 1, HOLD_PX = 0, max = 0, offs = [], shift = -1;
    onMeasure.push(() => {
      const avail = innerHeight - 28 - (frame.getBoundingClientRect().top - stage.getBoundingClientRect().top) - 12;
      frame.style.height = Math.round(clamp(view.offsetHeight + 84, 240, Math.max(240, avail))) + 'px';
      M = Math.round(innerHeight * 0.55);
      HOLD_PX = Math.round(innerHeight * 0.3);
      max = Math.max(0, page.offsetHeight - frame.offsetHeight);
      offs = parts.map(p => Math.min(p.offsetTop - 12, max));
      track.style.height = Math.round(innerHeight + (N - 1) * M + HOLD_PX + max + innerHeight * 0.25) + 'px';
      top = docTop(track);
      height = track.offsetHeight;
      shift = -1;
    });
    const offAt = y => clamp(y - top, 0, Math.max(0, height - innerHeight));
    const scrollToOff = off => window.scrollTo({ top: top + off, behavior: motion ? 'smooth' : 'auto' });
    const ease = () => { report.classList.add('is-easing'); clearTimeout(ease.t); ease.t = setTimeout(() => report.classList.remove('is-easing'), 700); };
    const startReview = sec => {
      if (!review) { review = true; reviewY = scrollY; report.classList.add('is-review'); ease(); page.style.transform = ''; frame.classList.remove('at-end'); }
      u = uAt(sec);
      userPaused = false;
      render();
      setPlaying(true);
    };
    const endReview = () => {
      if (!review) return;
      review = false;
      setPlaying(false);
      report.classList.remove('is-review');
      ease();
      u = endU(mk);
      render();
      shift = -1;
      request();
    };
    onScroll.push(y => {
      if (review) { if (Math.abs(y - reviewY) < 8) return; endReview(); }
      const off = offAt(y);
      const k = Math.min(N - 1, Math.floor(off / M));
      if (k !== mk) enter(k, k > mk ? 1 : -1);
      const s = Math.round(clamp(off - (N - 1) * M - HOLD_PX, 0, max));
      if (s !== shift) {
        shift = s;
        page.style.transform = s ? `translateY(${-s}px)` : '';
        frame.classList.toggle('at-end', s >= max - 1);
      }
      let label = labels[mk];
      if (s > 24) parts.forEach((p, x) => { if (offs[x] - 80 <= s) label = p.dataset.part; });
      if (now.textContent !== label) now.textContent = label;
    });

    // Moments, the player's timeline and the report's timestamps all lead to
    // a place in the scroll, so the list and the screen stay in step.
    const goTo = sec => {
      if (mk === N - 1) { startReview(sec); return; }
      const k = momentOf(sec);
      if (k === mk && shift <= 0) { u = uAt(sec); userPaused = false; render(); if (motion) setPlaying(true); return; }
      pending = sec;
      scrollToOff(k * M + 2);
    };
    lis.forEach((li, k) => $('button', li).addEventListener('click', () => goTo(T[k])));
    rpTrack.addEventListener('click', e => {
      const r = rpTrack.getBoundingClientRect();
      goTo(clamp((e.clientX - r.left) / r.width, 0, 1) * END);
    });
    page.addEventListener('click', e => {
      const b = e.target.closest('.ts, [data-end]');
      if (!b) return;
      if (b.dataset.end === 'scores') { endReview(); scrollToOff((N - 1) * M + HOLD_PX + (offs[0] || 0)); }
      else goTo(b.dataset.end === 'replay' ? 0 : Number(b.dataset.at));
    });
    $('#rpBack').addEventListener('click', endReview);
    session.jump = k => { if (mk === N - 1) endReview(); pending = T[k]; scrollToOff(k * M + 2); };
    Object.assign(session, { T, labels, END });

    // Score bars fill as they come into view in the frame.
    const scoresCard = $('[data-part="Scores Table"]', page);
    new IntersectionObserver(([e]) => { if (e.isIntersecting) scoresCard.classList.add('is-seen'); }, { root: frame, threshold: 0.5 }).observe(scoresCard);

    // Plays while the player is on screen, unless reduced motion is on or the
    // visitor paused it. The webcam runs whenever the player is visible.
    watch($('.rp-screen', report), v => {
      visible = v;
      if (cam) { if (v && motion) { cam.preload = 'auto'; cam.play().catch(() => {}); } else cam.pause(); }
      if (!motion) return;
      if (v && !userPaused && mk >= 0 && u < endU(mk)) setPlaying(true);
      else if (!v && playing) setPlaying(false);
    }, '-15% 0px -15% 0px');
    // A hidden tab pauses the webcam clip too. The recording needs nothing:
    // browsers run no animation frames in a hidden tab, and its loop caps the
    // first step back, so it carries on from the same moment.
    if (cam) document.addEventListener('visibilitychange', () => {
      if (document.hidden) cam.pause();
      else if (visible && motion) cam.play().catch(() => {});
    });
  });

  // ---------------------------------------------------------------- weights editor and results table

  feature('weigher', () => {
    const weigher = $('#weigher');
    const inputs = $$('.wfield input', weigher);
    const segs = $$('#wbar > i', weigher);
    const ghost = $$('#wghost b', weigher);
    const notice = $('#wNotice');
    const presets = $$('.segmented button', weigher);
    const list = $('#ranking');
    let w = inputs.map(i => Number(i.value));

    const rows = $$('.rrow', list).map((el, idx) => {
      const v = [Number(el.dataset.s), Number(el.dataset.c), Number(el.dataset.a)];
      const note = el.dataset.note ? `<em> · ${el.dataset.note}</em>` : '';
      el.innerHTML =
        `<span class="r-who" role="cell"><strong>${el.dataset.name}<svg class="r-crown" aria-hidden="true"><use href="#ff-spark"/></svg></strong><small>${el.dataset.email}${note}</small></span>` +
        '<span class="r-overall" role="cell"><span class="pill pill-sm r-total"></span><span class="r-move" aria-hidden="true"></span></span>' +
        v.map(x => `<span class="pill pill-sm tone-none" role="cell">${x.toFixed(1)}</span>`).join('');
      return { el, idx, v, rank: idx, total: $('.r-total', el), move: $('.r-move', el), mt: 0 };
    });

    function renderBar() {
      const total = w.reduce((a, b) => a + b, 0);
      const scale = total > 100 ? 100 / total : 1;
      segs.forEach((s, i) => {
        if (i < 3) {
          const pct = w[i] * scale;
          s.style.setProperty('--w', pct + '%');
          s.textContent = pct >= 8 ? Math.round(w[i]) + '%' : '';
        } else s.style.setProperty('--w', Math.max(0, 100 - total) + '%');
      });
      presets.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.w === w.join(','))));
      if (total === 100) { notice.hidden = true; return true; }
      notice.hidden = false;
      $('span', notice).textContent = total < 100
        ? `Weights add up to ${total}%. Add ${100 - total}% and the results re-rank.`
        : `Weights add up to ${total}%. Take off ${total - 100}% and the results re-rank.`;
      return false;
    }

    function rank() {
      const scored = rows.map(r => {
        const total = (r.v[0] * w[0] + r.v[1] * w[1] + r.v[2] * w[2]) / 100;
        r.total.textContent = total.toFixed(1);
        r.total.className = `pill pill-sm r-total tone-${tone(total)}`;
        return { r, total };
      }).sort((x, y) => y.total - x.total || x.r.idx - y.r.idx);

      // FLIP: note where each row is, reorder, then glide from old to new.
      const first = new Map(rows.map(r => [r, r.el.getBoundingClientRect().top]));
      const before = new Map(rows.map(r => [r, r.rank]));
      scored.forEach(({ r }, i) => { list.appendChild(r.el); r.rank = i; r.el.classList.toggle('is-top', i === 0); });
      rows.forEach(r => {
        const moved = before.get(r) - r.rank;
        if (moved) {
          r.move.textContent = moved > 0 ? `▲${moved}` : `▼${-moved}`;
          r.move.className = 'r-move is-shown ' + (moved > 0 ? 'up' : 'down');
          clearTimeout(r.mt);
          r.mt = setTimeout(() => r.move.classList.remove('is-shown'), 1400);
        }
        if (!motion) return;
        const dy = first.get(r) - r.el.getBoundingClientRect().top;
        if (!dy) return;
        r.el.classList.remove('is-moving');
        r.el.style.transform = `translateY(${dy}px)`;
      });
      if (motion) {
        list.getBoundingClientRect();
        rows.forEach(r => { if (r.el.style.transform) { r.el.classList.add('is-moving'); r.el.style.transform = ''; } });
      }
    }

    const update = () => { if (renderBar()) rank(); };
    inputs.forEach((inp, i) => inp.addEventListener('input', () => {
      w[i] = clamp(Math.round(Number(inp.value) || 0), 0, 100);
      update();
    }));
    presets.forEach(b => {
      const vals = b.dataset.w.split(',').map(Number);
      // Hovering a preset lets you try it on: dashed marks show where the
      // bar's boundaries would move.
      const preview = on => {
        weigher.classList.toggle('is-previewing', on);
        if (on) { ghost[0].style.setProperty('--x', vals[0] + '%'); ghost[1].style.setProperty('--x', (vals[0] + vals[1]) + '%'); }
      };
      b.addEventListener('pointerenter', () => preview(true));
      b.addEventListener('pointerleave', () => preview(false));
      b.addEventListener('focus', () => preview(true));
      b.addEventListener('blur', () => preview(false));
      b.addEventListener('click', () => {
        w = vals.slice();
        inputs.forEach((inp, i) => { inp.value = w[i]; });
        preview(false);
        update();
      });
    });
    update();
  });

  // ---------------------------------------------------------------- evidence tiles

  feature('tiles', () => {
    if (fine) $$('.tile').forEach(t => t.addEventListener('pointermove', e => {
      const r = t.getBoundingClientRect();
      t.style.setProperty('--mx', e.clientX - r.left + 'px');
      t.style.setProperty('--my', e.clientY - r.top + 'px');
    }));
    $$('.tile').forEach(t => watch(t, v => t.classList.toggle('in-view', v)));

    // Screen: the windows lean toward the pointer.
    const screenTile = $('.tile-screen');
    const desktop = $('#desktop');
    if (screenTile && desktop && fine) {
      screenTile.addEventListener('pointermove', e => {
        const r = screenTile.getBoundingClientRect();
        desktop.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        desktop.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
      screenTile.addEventListener('pointerleave', () => { desktop.style.setProperty('--px', '0'); desktop.style.setProperty('--py', '0'); });
    }

    // Camera: the recorder preview plays while the tile is on screen and the
    // tab is showing.
    const vid = $('#tileVideo');
    if (vid && !motion) vid.preload = 'metadata';
    if (vid) watchSeen(vid, v => { if (v && motion) { vid.preload = 'auto'; vid.play().catch(() => {}); } else vid.pause(); });

    // Voice: scrub the waveform and the transcript lights up to that point.
    const voice = $('#voice');
    const wave = $('#wave');
    if (voice && wave) {
      const bars = Array.from({ length: 64 }, (_, i) => {
        const h = 0.18 + 0.82 * Math.abs(Math.sin(i * 0.37) * 0.55 + Math.sin(i * 0.11 + 1.3) * 0.35 + Math.sin(i * 1.7) * 0.1);
        const b = document.createElement('i');
        b.style.setProperty('--h', Math.min(1, h).toFixed(3));
        wave.appendChild(b);
        return b;
      });
      const wordsEl = $('#voiceWords');
      const words = splitWords(wordsEl, wordsEl.textContent);
      const set = (p, head) => {
        wave.style.setProperty('--p', p.toFixed(4));
        wave.style.setProperty('--head', head ? '1' : '0');
        bars.forEach((b, i) => b.classList.toggle('on', i / bars.length < p));
        words.forEach((w, i) => w.classList.toggle('on', i / words.length < p));
      };
      set(motion ? 0 : 1, false);
      let sweeping = false;
      once(voice, () => {
        if (!motion) return;
        sweeping = true;
        const t0 = performance.now(), dur = 2600;
        const step = n => {
          if (!sweeping) return;
          const u = clamp((n - t0) / dur, 0, 1);
          set(u, u < 1);
          if (u < 1) requestAnimationFrame(step); else sweeping = false;
        };
        requestAnimationFrame(step);
      }, '0px 0px -20% 0px');
      const scrub = e => {
        const r = wave.getBoundingClientRect();
        sweeping = false;
        set(clamp((e.clientX - r.left) / r.width, 0, 1), true);
      };
      voice.addEventListener('pointermove', scrub);
      voice.addEventListener('pointerdown', scrub);
      voice.addEventListener('pointerleave', () => set(1, false));
    }

    // Replay: moments marked on the player; each one leads back into the session.
    const replay = $('#replay');
    if (replay && session.T) {
      const bar = $('.scrub', replay);
      const label = $('#scrubLabel');
      const time = $('#scrubTime');
      const jumpLink = $('.tile-replay [data-jump]');
      const ticks = session.T.map(t => {
        const s = document.createElement('span');
        s.className = 'mark';
        s.style.left = (t / session.END * 100).toFixed(2) + '%';
        bar.appendChild(s);
        return s;
      });
      const setHot = k => {
        ticks.forEach((t, i) => t.classList.toggle('is-hot', i === k));
        bar.style.setProperty('--p', (session.T[k] / session.END).toFixed(4));
        label.innerHTML = `<b>${fmt(session.T[k])}</b> · ${session.labels[k]}`;
        time.textContent = fmt(session.T[k]);
        jumpLink.dataset.jump = String(k);
        jumpLink.firstChild.textContent = `Replay ${fmt(session.T[k])} `;
      };
      setHot(4);
      const nearest = e => {
        const r = bar.getBoundingClientRect();
        const p = clamp((e.clientX - r.left) / r.width, 0, 1) * session.END;
        let best = 0;
        session.T.forEach((t, i) => { if (Math.abs(t - p) < Math.abs(session.T[best] - p)) best = i; });
        return best;
      };
      bar.addEventListener('pointermove', e => setHot(nearest(e)));
      bar.addEventListener('click', e => session.jump(nearest(e)));
    }
    $$('[data-jump]').forEach(a => a.addEventListener('click', e => {
      if (!session.jump) return;
      e.preventDefault();
      session.jump(Number(a.dataset.jump));
    }));
  });

  // ---------------------------------------------------------------- team fluency map

  feature('fluency map', () => {
    const grid = $('#fmapGrid');
    const tip = $('#fmapTip');
    const tabs = $$('.fmap-tabs button');
    if (!grid) return;
    const AREAS = ['Core work', 'Comms', 'Systems', 'Admin'];
    const LEVELS = ['Not yet using AI', 'Basic use', 'Confident', 'Fluent'];
    const COLORS = ['#DBDCDB', '#EFB56E', '#92BAD5', '#5D54A1']; // grey, sand, light blue, purple
    const level = v => (v >= 8 ? 3 : v >= 6 ? 2 : v >= 3.5 ? 1 : 0);
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    // Example people. Order matches the faces in assets/team-avatars.webp.
    const TEAM = [
      'Ava M.|Account exec|Sales',
      'Ben T.|Software engineer|Engineering',
      'Karim S.|Finance manager|Finance',
      'Dev P.|Data analyst|Data',
      'Elif Y.|Product designer|Product',
      'Priya K.|Team lead|Operations',
      'Farah N.|Marketing manager|Marketing',
      'Gus L.|Support specialist|Customer success',
      'Hiro T.|Backend engineer|Engineering',
      'Isla M.|Recruiter|People',
      'Jonas B.|Sales lead|Sales',
      'Kemi A.|Customer success manager|Customer success',
      'Leo F.|Financial analyst|Finance',
      'Mei L.|Product manager|Product',
      'Nadia R.|Content lead|Marketing',
      'Omar H.|Solutions engineer|Sales',
      'Rafi G.|Data engineer|Data',
      'Quinn E.|Payroll specialist|People',
      'Marcus D.|Account exec|Sales',
      'Rosa V.|Legal counsel|Legal',
      'Sami O.|Ops coordinator|Operations',
      'Tara J.|Brand designer|Marketing',
      'Amina Y.|Accountant|Finance',
      'Vera K.|QA engineer|Engineering',
      'Wes C.|Frontend engineer|Engineering',
      'Xin Z.|Growth marketer|Marketing',
      'Yusuf B.|Procurement lead|Operations',
      'Zoe P.|UX researcher|Product',
      'Aiko S.|Data scientist|Data',
      'Hannah W.|Ops manager|Operations',
      'Bruno C.|Support lead|Customer success',
      'Diego M.|Sales director|Sales',
      'Dara O.|People partner|People',
      'Emeka U.|DevOps engineer|Engineering',
      'Yasmin A.|Compliance analyst|Legal',
      'Gael R.|Office manager|Operations',
      'Noor H.|Onboarding specialist|Customer success',
      'Ivo N.|Finance director|Finance',
      'Juno W.|Business analyst|Operations',
      'Kai L.|Mobile engineer|Engineering',
      'Tom R.|Platform engineer|Engineering',
      'Lia S.|Social media manager|Marketing',
      'Mateo G.|Sales development rep|Sales',
      'Ravi D.|Pricing analyst|Finance',
      'Oli T.|L&D coordinator|People',
      'Paz M.|Implementation manager|Customer success',
      'Stefan K.|Head of product|Product',
      'Rhea B.|Paralegal|Legal',
    ].map(s => { const [name, role, dept] = s.split('|'); return { name, role, dept }; });
    // Hand-set scores for four people, so their profiles tell a story across tabs.
    const SET = { 5: [8.9, 5.1, 7.2, 7.0], 18: [7.4, 3.2, 5.5, 5.8], 29: [6.8, 8.6, 8.1, 9.0], 40: [8.2, 2.9, 4.4, 4.9] };
    const people = TEAM.map((who, i) => {
      const v = SET[i] || AREAS.map((_, a) => clamp(2 + rnd() * 6.5 + (a === 0 ? 1 : 0) + (i % 7 === 0 ? 1.5 : 0), 1, 9.8));
      const el = document.createElement('span');
      el.style.setProperty('--x', `calc(${i % 12} * 100% / 11)`);
      el.style.setProperty('--y', `calc(${Math.floor(i / 12)} * 100% / 3)`);
      grid.appendChild(el);
      return { ...who, v, el, lv: -1 };
    });
    let area = 0;
    const cols = () => getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    function setArea(a, fromTab) {
      area = a;
      const c = cols();
      const origin = fromTab ? Math.round(tabs.indexOf(fromTab) / (tabs.length - 1) * (c - 1)) : 0;
      people.forEach((p, i) => {
        const lv = level(p.v[a]);
        p.el.style.setProperty('--delay', motion && fromTab ? (Math.hypot(i % c - origin, Math.floor(i / c)) * 0.035).toFixed(3) + 's' : '0s');
        p.el.style.setProperty('--c', COLORS[lv]);
        if (fromTab && motion && lv !== p.lv) { p.el.classList.remove('is-bump'); void p.el.offsetWidth; p.el.classList.add('is-bump'); }
        p.lv = lv;
      });
      tabs.forEach((t, i) => t.setAttribute('aria-selected', String(i === a)));
    }
    tabs.forEach((t, i) => t.addEventListener('click', () => setArea(i, t)));
    grid.addEventListener('animationend', e => e.target.classList.remove('is-bump'));
    grid.addEventListener('pointerover', e => {
      const p = people.find(x => x.el === e.target);
      if (!p) return;
      tip.textContent = `${p.name} · ${p.role}, ${p.dept} · ${LEVELS[p.lv]} in ${AREAS[area].toLowerCase()} (${p.v[area].toFixed(1)})`;
    });
    grid.addEventListener('pointerleave', () => { tip.textContent = 'Hover a person'; });
    setArea(0, null);
  });

  // ---------------------------------------------------------------- sparks

  // A still field of the mark's sparks. The ones near the pointer brighten;
  // nothing moves unless the pointer does.
  feature('sparks', () => {
    const field = $('#sparks');
    const finale = $('#finale');
    if (!field) return;
    let seed = 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const sparks = Array.from({ length: 46 }, () => {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.innerHTML = '<use href="#ff-spark"/>';
      const x = rnd() * 100, y = rnd() * 100, size = 6 + rnd() * 12, base = 0.1 + rnd() * 0.22;
      s.style.left = x + '%';
      s.style.top = y + '%';
      s.style.setProperty('--s', size.toFixed(1) + 'px');
      s.style.setProperty('--o', base.toFixed(2));
      field.appendChild(s);
      return { s, x, y, base };
    });
    if (!motion || !fine) return;
    let px = -1, py = -1, pending = 0;
    const paint = () => {
      pending = 0;
      const r = field.getBoundingClientRect();
      sparks.forEach(sp => {
        const dx = sp.x / 100 * r.width - px, dy = sp.y / 100 * r.height - py;
        const k = px < 0 ? 0 : clamp(1 - Math.hypot(dx, dy) / 220, 0, 1);
        sp.s.style.setProperty('--o', (sp.base + k * 0.75).toFixed(3));
        sp.s.style.setProperty('--k', (1 + k * 0.8).toFixed(3));
      });
    };
    finale.addEventListener('pointermove', e => {
      const r = field.getBoundingClientRect();
      px = e.clientX - r.left; py = e.clientY - r.top;
      if (!pending) pending = requestAnimationFrame(paint);
    });
    finale.addEventListener('pointerleave', () => { px = py = -1; if (!pending) pending = requestAnimationFrame(paint); });
  });

  // ---------------------------------------------------------------- buttons lean toward the pointer

  feature('magnetic', () => {
    if (!motion || !fine) return;
    $$('.btn').forEach(btn => {
      if (btn.closest('.ffr')) return; // product UI stays as the platform draws it
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.translate = `${clamp((e.clientX - r.left - r.width / 2) * 0.2, -8, 8)}px ${clamp((e.clientY - r.top - r.height / 2) * 0.3, -6, 6)}px`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
    });
  });

  measure();
})();
