// Fluencyfox homepage behaviour and motion. Plain JS, no dependencies.
//
// The page is static HTML (see index.html); this file only adds behaviour on
// top. Two classes on <html>, set in <head> unless the visitor prefers reduced
// motion: ff-motion (animate) and ff-reveal (below-the-fold content starts
// hidden and is revealed here). With them off, every feature below still
// works, it just does not animate.

(() => {
  'use strict';

  const root = document.documentElement;
  const motion = root.classList.contains('ff-motion');
  // The <head> failsafe drops ff-reveal if this file was slow to start; then
  // everything is already visible and nothing here should hide it again.
  const revealing = root.classList.contains('ff-reveal');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeOutExpo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const onLoaded = fn => (document.readyState === 'complete' ? fn() : addEventListener('load', fn, { once: true }));
  const observe = (el, fn) => { if ('ResizeObserver' in window) new ResizeObserver(fn).observe(el); else addEventListener('resize', fn); };
  const whenVisible = (el, fn, margin = '0px') => {
    if (!('IntersectionObserver' in window)) { fn(true); return; }
    new IntersectionObserver(([e]) => fn(e.isIntersecting), { rootMargin: margin }).observe(el);
  };
  const once = (el, fn, margin) => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: margin });
    io.observe(el);
  };
  // Each feature runs on its own, so one failing cannot take the rest down.
  const feature = (name, fn) => { try { fn(); } catch (err) { console.error('[home.js] ' + name, err); } };

  // A number that animates on screen while assistive tech keeps the real value.
  function splitCounter(el) {
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = el.dataset.count;
    el.after(sr);
    el.setAttribute('aria-hidden', 'true');
  }

  // ---------------------------------------------------------------- reveals

  const revealHooks = new Map();
  const onReveal = (el, fn) => {
    if (!revealHooks.has(el)) revealHooks.set(el, []);
    revealHooks.get(el).push(fn);
  };
  const revealables = $$('[data-reveal], [data-split]:not([data-split="hero"])');

  // instant: for content the visitor jumps past (anchor links) - just there.
  function reveal(el, instant = false) {
    if (el.classList.contains('is-in')) return;
    const delay = instant ? 0 : parseFloat(el.style.getPropertyValue('--d')) || 0;
    if (instant) el.classList.add('is-in', 'is-done');
    else {
      el.classList.add('is-in');
      setTimeout(() => el.classList.add('is-done'), delay + (parseFloat(el.dataset.done) || 1500));
    }
    (revealHooks.get(el) || []).forEach(fn => fn(delay, instant));
  }

  feature('stagger', () => {
    $$('[data-stagger]').forEach(parent => {
      const step = parseFloat(parent.dataset.stagger) || 80;
      $$(':scope > [data-reveal]', parent).forEach((child, i) => {
        const own = parseFloat(child.style.getPropertyValue('--d')) || 0;
        child.style.setProperty('--d', own + i * step + 'ms');
      });
    });
  });

  feature('reveals', () => {
    if (revealing && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          reveal(e.target);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
      revealables.forEach(el => io.observe(el));
    } else {
      revealables.forEach(el => reveal(el, true));
    }
  });

  // From here on the page no longer needs the <head> failsafe.
  window.ffReady = true;

  // In-page links: content the visitor flies past is simply there, and the
  // destination starts its entrance during the glide, so no blank screens.
  feature('anchors', () => {
    if (!revealing) return;
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.hasAttribute('data-top')) return;
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      const targetTop = target.getBoundingClientRect().top + scrollY;
      revealables.forEach(el => {
        const top = el.getBoundingClientRect().top + scrollY;
        if (top < targetTop - 20) reveal(el, true);
        else if (top < targetTop + innerHeight) reveal(el);
      });
    }, true);
  });

  // Smooth scrolling only once the page is up, so deep links land instantly.
  onLoaded(() => requestAnimationFrame(() => root.classList.add('ff-smooth')));

  // Printing (or save as PDF) shows the finished page.
  addEventListener('beforeprint', () => {
    root.classList.remove('ff-reveal');
    $$('[data-count]').forEach(el => { el.textContent = el.dataset.count; });
    $$('.ff-tw-ch').forEach(el => el.classList.add('on'));
  });

  // ---------------------------------------------------------------- counters

  function countUp(el, { delay = 0, duration = 1300, instant = false } = {}) {
    const target = el.dataset.count;
    const decimals = (target.split('.')[1] || '').length;
    const end = parseFloat(target);
    if (!revealing || instant) { el.textContent = target; return; }
    setTimeout(() => {
      const start = performance.now();
      const tick = now => {
        const t = clamp((now - start) / duration, 0, 1);
        el.textContent = (end * easeOutExpo(t)).toFixed(decimals);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    }, delay);
  }

  feature('score counters', () => {
    $$('#what-we-measure [data-reveal]').forEach(card => {
      const num = $('[data-count]', card);
      if (!num) return;
      splitCounter(num);
      if (revealing) num.textContent = '0';
      onReveal(card, (d, instant) => countUp(num, { delay: d + 300, duration: 1500, instant }));
    });
  });

  // Company heatmap: each cell counts up as its wave reaches it. The timing
  // matches the CSS transition-delay on .ff-cell.
  feature('heatmap', () => {
    const heatmap = $('.ff-heatmap');
    if (!heatmap) return;
    const cells = $$('.ff-cell [data-count]', heatmap);
    cells.forEach(c => { splitCounter(c); if (revealing) c.textContent = '0.0'; });
    heatmap.dataset.done = '2600';
    onReveal(heatmap, (d, instant) => {
      cells.forEach(span => {
        const cell = span.closest('.ff-cell');
        const r = parseFloat(cell.style.getPropertyValue('--r')) || 0;
        const c = parseFloat(cell.style.getPropertyValue('--c')) || 0;
        countUp(span, { delay: 320 + (r + c) * 75, duration: 1100, instant });
      });
    });
  });

  // ---------------------------------------------------------------- header

  const header = $('#siteHeader');

  feature('scrollspy', () => {
    const navLinks = $$('.ff-navlink', header);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('section[data-section]').forEach(s => spy.observe(s));
  });

  // Logo links scroll to the top without leaving "#" in the address bar.
  feature('to top', () => {
    $$('[data-top]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: motion ? 'smooth' : 'auto' });
    }));
  });

  feature('mobile menu', () => {
    const toggle = $('#navToggle');
    const nav = $('#mobileNav');
    if (!toggle || !nav) return;
    let timer = 0;
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    function setMenu(open) {
      clearTimeout(timer);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.classList.toggle('was-open', !open);
      if (open) {
        nav.hidden = false;
        nav.getBoundingClientRect(); // commit the closed state so it transitions
        nav.classList.add('is-open');
      } else {
        nav.classList.remove('is-open');
        timer = setTimeout(() => { nav.hidden = true; }, motion ? 380 : 0);
      }
    }
    toggle.addEventListener('click', () => setMenu(!isOpen()));
    $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen()) { setMenu(false); toggle.focus(); }
    });
    document.addEventListener('click', e => {
      if (isOpen() && !header.contains(e.target)) setMenu(false);
    });
  });

  // ---------------------------------------------------------------- buttons + cards

  feature('magnetic buttons', () => {
    if (!motion || !finePointer) return;
    $$('.ff-cta, .ff-ghost').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.translate = `${clamp(dx * 0.22, -9, 9)}px ${clamp(dy * 0.32, -7, 7)}px`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
    });
  });

  feature('spotlight', () => {
    if (!finePointer) return;
    $$('.ff-spot').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', e.clientX - r.left + 'px');
        card.style.setProperty('--my', e.clientY - r.top + 'px');
      });
    });
  });

  // The final Book a Demo glints once when it arrives, to draw the eye.
  feature('glint', () => {
    const cta = $('#live-assessment-blue-panel .ff-cta');
    if (!motion || !cta) return;
    onReveal(cta, (d, instant) => {
      if (instant) return;
      setTimeout(() => {
        cta.classList.add('is-glint');
        setTimeout(() => cta.classList.remove('is-glint'), 1400);
      }, d + 700);
    });
  });

  // Photo-backed cards fetch their photo only when they get close.
  feature('card photos', () => {
    $$('.ff-bgcard').forEach(card => once(card, () => card.classList.add('ff-near'), '600px 0px'));
  });

  // The three handwriting faces draw only "AI", "AI" and "X", well down the
  // page, so they load after everything else.
  feature('handwriting fonts', () => {
    onLoaded(() => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Reenie+Beanie&family=Shalimar&family=Waterfall&display=swap';
      document.head.appendChild(link);
    });
  });

  // ---------------------------------------------------------------- scroll-linked scene

  // One rAF loop drives everything that follows the scroll position or the
  // pointer: header state, progress bar, hero parallax and tilt, CTA parallax.
  // It only runs while something is actually changing.
  feature('scene', () => {
    const progress = $('.ff-progress', header);
    const stage = $('#heroStage');
    const mountains = $('.ff-hero-mountains');
    const tilt = $('.ff-hero-mockup');
    const flowers = $('.ff-hero-flowers');
    const cta = $('#ctaStage');
    const ctaLand = $('.ff-cta-land');
    const ctaFlowers = $('.ff-cta-flowers');

    let vh = innerHeight, vw = innerWidth, docH = 1;
    let stageTop = 0, stageH = 1, stageBottom = 0, mockW = 1200, ctaTop = 0, ctaH = 1;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let heroVisible = true, ctaVisible = false;
    let raf = 0;

    const docTop = el => {
      let y = 0;
      for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
      return y;
    };

    function measure() {
      vh = innerHeight;
      vw = innerWidth;
      docH = root.scrollHeight;
      if (stage) {
        stageTop = docTop(stage);
        stageH = stage.offsetHeight || 1;
        stageBottom = stageTop + stageH;
        mockW = tilt.offsetWidth || mockW;
      }
      if (cta) { ctaTop = docTop(cta); ctaH = cta.offsetHeight || 1; }
      request();
    }

    // Composited layers only while things move; at rest the images repaint
    // at full sharpness.
    const live = (el, cls, timerRef) => {
      el.classList.add(cls);
      clearTimeout(timerRef.t);
      timerRef.t = setTimeout(() => el.classList.remove(cls), 300);
    };
    const heroLive = { t: 0 }, ctaLive = { t: 0 };

    function frame() {
      raf = 0;
      const sy = scrollY;

      header.classList.toggle('is-scrolled', sy > 8);
      if (progress) progress.style.transform = `scaleX(${clamp(sy / Math.max(1, docH - vh), 0, 1)})`;

      if (!motion) return;

      // Pointer easing, so the parallax glides rather than snaps to the mouse.
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      const settling = Math.abs(pointer.tx - pointer.x) > 0.001 || Math.abs(pointer.ty - pointer.y) > 0.001;

      if (heroVisible && stage) {
        // The mockup flattens while it is actually on screen: from the top of
        // the page until its upper third reaches the middle of the viewport.
        const p = clamp(sy / Math.max(1, stageTop + stageH * 0.35 - vh * 0.5), 0, 1);
        const flat = easeInOut(p);
        const travelled = clamp(sy / Math.max(1, stageBottom), 0, 1);
        const px = pointer.x, py = pointer.y;

        mountains.style.translate = `${(-px * vw * 0.0065).toFixed(2)}px ${(travelled * stageH * 0.16 - py * 6).toFixed(2)}px`;
        tilt.style.transform =
          `perspective(${Math.round(mockW * 1.33)}px) ` +
          `rotateX(${((1 - flat) * 12 - py * 2).toFixed(3)}deg) rotateY(${(px * 2.4).toFixed(3)}deg) ` +
          `scale(${(0.95 + flat * 0.05).toFixed(4)})`;
        flowers.style.translate = `${(px * vw * 0.0072).toFixed(2)}px ${Math.max(0, py * 4).toFixed(2)}px`;
        flowers.style.transform = `scale(${(1 + travelled * 0.07).toFixed(4)})`;
        live(stage, 'ff-live', heroLive);
      }

      if (ctaVisible && cta) {
        const through = clamp((sy + vh - ctaTop) / (vh + ctaH), 0, 1);
        const arrive = clamp((sy + vh - ctaTop) / (ctaH * 0.9), 0, 1);
        ctaLand.style.translate = `0 ${((through - 0.5) * -0.06 * ctaH).toFixed(2)}px`;
        ctaFlowers.style.translate = `0 ${((1 - easeOutCubic(arrive)) * 70).toFixed(2)}px`;
        live(cta, 'ff-live-cta', ctaLive);
      }

      if (settling) request();
    }

    function request() { if (!raf) raf = requestAnimationFrame(frame); }

    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', measure);
    onLoaded(measure);
    observe(document.body, measure);
    requestAnimationFrame(measure);

    if (stage) whenVisible(stage, v => { heroVisible = v; root.classList.toggle('ff-hero-away', !v); if (v) request(); }, '100px');
    if (cta) whenVisible(cta, v => { ctaVisible = v; if (v) request(); }, '200px');

    // Once the landscape has settled it becomes a plain scaled image.
    [mountains, flowers].forEach(img => img && img.addEventListener('animationend', () => img.classList.add('is-landed')));

    if (motion && finePointer && stage) {
      addEventListener('pointermove', e => {
        if (!heroVisible) return;
        const below = e.clientY > stageBottom - scrollY;
        pointer.tx = below ? 0 : clamp((e.clientX / vw) * 2 - 1, -1, 1);
        pointer.ty = below ? 0 : clamp((e.clientY / vh) * 2 - 1, -1, 1);
        request();
      }, { passive: true });
      // Pointer left the window: ease back to rest.
      document.addEventListener('mouseout', e => { if (!e.relatedTarget) { pointer.tx = 0; pointer.ty = 0; request(); } });
    }
  });

  // ---------------------------------------------------------------- pollen

  // A few dozen soft motes drifting up out of the meadow. One pre-rendered
  // glow sprite, drawn at 30fps into a canvas that covers only the meadow,
  // paused off screen and faded out after a while with nothing happening.
  function pollen(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 32;
    const sg = sprite.getContext('2d');
    const grad = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,252,238,1)');
    grad.addColorStop(0.35, 'rgba(255,246,214,.55)');
    grad.addColorStop(1, 'rgba(255,246,214,0)');
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 32, 32);

    let w = 0, h = 0, motes = [], running = false, resting = false, last = 0, lastDraw = 0, id = 0;
    let onScreen = false, lastActivity = performance.now();
    const mouse = { x: -9999, y: -9999 };
    const REST_AFTER = 12000;

    const spawn = anywhere => ({
      x: Math.random() * w,
      y: anywhere ? h * (0.2 + Math.random() * 0.8) : h * (1 - Math.random() * 0.08),
      r: 1.2 + Math.random() * 2.8,
      vy: 7 + Math.random() * 16,
      sway: 8 + Math.random() * 18,
      f: 0.25 + Math.random() * 0.6,
      ph: Math.random() * Math.PI * 2,
      tw: 0.8 + Math.random() * 1.6,
      a: 0.35 + Math.random() * 0.5,
      dx: 0,
    });

    function size() {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      // Soft glows gain nothing from retina resolution; 1x keeps it cheap.
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);
      motes = Array.from({ length: Math.round(clamp(w / 34, 14, 46)) }, () => spawn(true));
    }

    function draw(now) {
      if (!running) return;
      id = requestAnimationFrame(draw);
      if (now - lastDraw < 32) return; // 30fps is plenty for drifting dust
      lastDraw = now;
      if (!resting && now - lastActivity > REST_AFTER) {
        resting = true;
        canvas.classList.add('is-resting');
        setTimeout(() => { if (resting) stop(); }, 1300);
      }
      const dt = Math.min(0.08, (now - (last || now)) / 1000);
      last = now;
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.y -= m.vy * dt;
        // Drift away from the cursor a little.
        const ddx = m.x - mouse.x, ddy = m.y - mouse.y;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 < 14400) m.dx += (ddx / Math.sqrt(d2 + 1)) * 40 * dt;
        m.dx *= 0.96;
        m.x += m.dx * dt * 10;
        const x = m.x + Math.sin(t * m.f + m.ph) * m.sway;
        const fadeTop = clamp(m.y / (h * 0.35), 0, 1);
        if (m.y < 0 || x < -20 || x > w + 20) { motes[i] = spawn(false); continue; }
        const s = m.r * 4;
        ctx.globalAlpha = m.a * fadeTop * (0.55 + 0.45 * Math.sin(t * m.tw + m.ph));
        ctx.drawImage(sprite, x - s / 2, m.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    }

    function start() {
      if (running) return;
      running = true; last = 0; lastDraw = 0;
      id = requestAnimationFrame(draw);
    }
    function stop() { running = false; cancelAnimationFrame(id); }
    function wake() {
      lastActivity = performance.now();
      if (resting) { resting = false; canvas.classList.remove('is-resting'); }
      if (onScreen && !document.hidden) start();
    }

    size();
    observe(canvas, size);
    whenVisible(canvas, v => { onScreen = v; v && !document.hidden ? wake() : stop(); }, '80px');
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : onScreen && wake()));
    addEventListener('scroll', wake, { passive: true });
    addEventListener('pointermove', wake, { passive: true });
    if (finePointer) {
      canvas.parentElement.addEventListener('pointermove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      });
      canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    }
  }
  feature('pollen', () => { if (motion) $$('canvas[data-pollen]').forEach(pollen); });

  // ---------------------------------------------------------------- hero video

  // The screenshare clip inside the mockup waits until the page has loaded so
  // it never competes with the hero images, and pauses when scrolled away.
  // With reduced motion it shows its first frame and stays still.
  feature('hero video', () => {
    const video = $('video[data-autoplay]');
    if (!video) return;
    video.muted = true;
    if (!motion) { video.preload = 'metadata'; return; }
    let visible = false;
    const play = () => { if (!visible) return; video.preload = 'auto'; video.play().catch(() => {}); };
    whenVisible(video, v => {
      visible = v;
      if (v) onLoaded(play); else video.pause();
    });
  });

  // ---------------------------------------------------------------- how-it-works demos

  // Each demo is a fixed-size HTML animation, scaled to fit its box and centred
  // exactly as the designer's build did. They load once the page is idle,
  // while the visitor is still on the hero, so their start-up work never lands
  // in the middle of a scroll.
  feature('demos', () => {
    const boxes = $$('.ff-embed');
    boxes.forEach(box => {
      const frame = $('iframe', box);
      const w = parseFloat(box.dataset.embedW), h = parseFloat(box.dataset.embedH);
      // Layout size, not getBoundingClientRect: the step may still be scaled
      // by its entrance transform when this first runs.
      const fit = () => {
        const bw = box.clientWidth, bh = box.clientHeight;
        if (!bw || !bh) return;
        frame.style.transform = `scale(${Math.min(bw / w, bh / h)})`;
      };
      fit();
      observe(box, fit);
    });
    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      boxes.forEach(box => {
        const frame = $('iframe[data-src]', box);
        if (frame) { frame.src = frame.dataset.src; frame.removeAttribute('data-src'); }
      });
    };
    onLoaded(() => (window.requestIdleCallback ? requestIdleCallback(load, { timeout: 2000 }) : setTimeout(load, 1200)));
    once($('#how-it-works'), load, '100% 0px');
  });

  // ---------------------------------------------------------------- testimonials

  feature('testimonials', () => {
    const carousel = $('#testimonialCarousel');
    if (!carousel) return;
    const photos = $$('.ff-t-photo', carousel);
    const slides = $$('.ff-t-slide', carousel);
    let current = 0, busy = 0, lastGo = 0, queued = 0, queueTimer = 0;

    // Words become individually animatable spans for the eye; assistive tech
    // reads one sentence from the sr-only copy.
    if (motion) {
      $$('.ff-t-quote', carousel).forEach(p => {
        const text = p.textContent;
        let i = 0;
        const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const words = text.split(/(\s+)/).map(w => (/^\s+$/.test(w) || !w ? w : `<span class="ff-qw" style="--i:${i++}">${esc(w)}</span>`)).join('');
        p.innerHTML = `<span class="sr-only">${esc(text)}</span><span aria-hidden="true">${words}</span>`;
      });
    }

    // The other photos and logos load after the page, once the carousel gets
    // close, and are decoded ahead of time so the first wipe never reveals a
    // blank frame. Never before load: on phones they used to compete with the
    // hero image.
    onLoaded(() => once(carousel, () => {
      $$('img[data-src]', carousel).forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        if (img.decode) img.decode().catch(() => {});
      });
    }, '600px 0px'));

    function go(next, dir) {
      next = (next + slides.length) % slides.length;
      if (next === current) return;
      const prevSlide = slides[current], nextSlide = slides[next];
      const prevPhoto = photos[current], nextPhoto = photos[next];
      const all = photos.concat(slides);
      all.forEach(el => el !== prevSlide && el !== nextSlide && el !== prevPhoto && el !== nextPhoto &&
        el.classList.remove('is-active', 'is-leaving', 'is-entering'));

      prevSlide.setAttribute('aria-hidden', 'true');
      prevSlide.inert = true;
      nextSlide.removeAttribute('aria-hidden');
      nextSlide.inert = false;
      current = next;

      if (!motion) {
        [prevSlide, prevPhoto].forEach(el => el.classList.remove('is-active'));
        [nextSlide, nextPhoto].forEach(el => el.classList.add('is-active'));
        return;
      }

      carousel.classList.toggle('dir-prev', dir < 0);
      clearTimeout(busy);
      [prevSlide, prevPhoto].forEach(el => { el.classList.remove('is-active', 'is-entering'); el.classList.add('is-leaving'); });
      [nextSlide, nextPhoto].forEach(el => { el.classList.remove('is-leaving'); el.classList.add('is-active', 'is-entering'); });
      // Reading layout commits the start state; dropping is-entering straight
      // after then runs the transitions from it.
      nextPhoto.getBoundingClientRect();
      nextSlide.classList.remove('is-entering');
      nextPhoto.classList.remove('is-entering');
      busy = setTimeout(() => {
        prevSlide.classList.remove('is-leaving');
        prevPhoto.classList.remove('is-leaving');
      }, 1300);
    }

    // Rapid clicks: let the current transition get underway, then take the
    // latest step, rather than cutting a half-revealed photo.
    function step(dir) {
      if (!motion) { go(current + dir, dir); return; }
      const since = performance.now() - lastGo;
      if (since < 520) {
        queued = dir;
        clearTimeout(queueTimer);
        queueTimer = setTimeout(() => { const d = queued; queued = 0; step(d); }, 520 - since);
        return;
      }
      lastGo = performance.now();
      go(current + dir, dir);
    }

    $$('.ff-t-btn', carousel).forEach(btn => btn.addEventListener('click', () => step(Number(btn.dataset.dir))));
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
    });

    // Swipe on touch screens; vertical scrolling is left alone (touch-action: pan-y).
    let sx = 0, sy0 = 0, tracking = false;
    carousel.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'touch') return;
      tracking = true; sx = e.clientX; sy0 = e.clientY;
    });
    carousel.addEventListener('pointerup', e => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - sx, dy = e.clientY - sy0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1);
    });
    carousel.addEventListener('pointercancel', () => { tracking = false; });
  });

  // ---------------------------------------------------------------- typewriter

  feature('typewriter', () => {
    const tw = $('[data-typewriter]');
    if (!tw) return;
    const text = tw.textContent;
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    const vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    const chars = Array.from(text).map(ch => {
      if (ch === '\n') return document.createTextNode('\n');
      const s = document.createElement('span');
      s.className = 'ff-tw-ch' + (revealing ? '' : ' on');
      s.textContent = ch;
      return s;
    });
    chars.forEach(c => vis.appendChild(c));
    tw.textContent = '';
    tw.append(sr, vis);
    if (!revealing) return;

    const caret = document.createElement('span');
    caret.className = 'ff-caret';
    vis.insertBefore(caret, vis.firstChild);
    const spans = chars.filter(c => c.nodeType === 1);
    let started = false;
    const type = () => {
      let i = 0, acc = 0, last = performance.now();
      const tick = now => {
        acc += now - last; last = now;
        // Slightly human rhythm: a beat longer after punctuation.
        while (i < spans.length && acc >= 0) {
          const ch = spans[i].textContent;
          spans[i].classList.add('on');
          vis.insertBefore(caret, spans[i].nextSibling);
          i++;
          acc -= /[.,'“”]/.test(ch) ? 110 : 34;
        }
        if (i < spans.length) requestAnimationFrame(tick);
        else setTimeout(() => caret.classList.add('is-gone'), 1400);
      };
      requestAnimationFrame(tick);
    };
    // Mostly in view, or filling half the screen when it is taller than the
    // viewport (small windows, heavy zoom), whichever comes first.
    const io = new IntersectionObserver(([e]) => {
      if (started || !e.isIntersecting) return;
      if (e.intersectionRatio < 0.6 && e.intersectionRect.height < innerHeight * 0.5) return;
      started = true;
      io.disconnect();
      type();
    }, { threshold: [0, 0.2, 0.4, 0.6] });
    io.observe(tw);
  });

  // ---------------------------------------------------------------- evidence cards

  feature('evidence', () => {
    const grid = $('#assessment-evidence .grid');
    if (grid) whenVisible(grid, v => grid.classList.toggle('in-view', v));

    // "41:20" ticks on while the card is on screen: every minute replayable.
    const clock = $('[data-timer]');
    if (!clock || !motion) return;
    let secs = parseInt(clock.dataset.timer, 10);
    let timer = 0;
    clock.style.fontVariantNumeric = 'tabular-nums';
    whenVisible(clock, v => {
      clearInterval(timer);
      if (v) timer = setInterval(() => {
        secs++;
        clock.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
      }, 1000);
    });
  });
})();
