// ---------- Mobile nav ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ---------- Testimonial carousel ----------
const track = document.getElementById('testimonialTrack');
const slides = Array.from(track.children);
const dotsWrap = document.getElementById('carouselDots');
let current = 0;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsWrap.appendChild(dot);
});

function goToSlide(i) {
  current = (i + slides.length) % slides.length;
  // Step by the slide's own width + the flex gap (22px), in pixels - a plain
  // -N*100% shift ignores the gap and drifts further off with each slide.
  const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
  const step = slides[0].getBoundingClientRect().width + gap;
  track.style.transform = `translateX(-${current * step}px)`;
  track.style.transition = 'transform 0.5s ease';
  Array.from(dotsWrap.children).forEach((d, idx) => d.classList.toggle('active', idx === current));
}

document.getElementById('prevSlide').addEventListener('click', () => goToSlide(current - 1));
document.getElementById('nextSlide').addEventListener('click', () => goToSlide(current + 1));

// auto-advance every 7s, pause on hover
let autoplay = setInterval(() => goToSlide(current + 1), 7000);
track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplay));
track.parentElement.addEventListener('mouseleave', () => { autoplay = setInterval(() => goToSlide(current + 1), 7000); });

// ---------- "How it works" embedded demo animations ----------
// Each demo is a self-contained, self-looping HTML animation (embeds/how-step*.html)
// built to the exact intrinsic size in data-embed-w/h. We scale it down to fit
// its card via a CSS transform rather than resizing the iframe's own viewport,
// so the animation renders crisp at its native size and just shrinks visually.
document.querySelectorAll('.how-embed').forEach(wrap => {
  const iframe = wrap.querySelector('iframe');
  const w = parseFloat(wrap.dataset.embedW);
  const h = parseFloat(wrap.dataset.embedH);

  // Render the iframe's document at 2x its logical size (via internal zoom)
  // so the final CSS scale-down is a true supersample rather than a single
  // shrink of an already-1x rasterization - this keeps fine UI details and
  // photo thumbnails inside the embed looking crisp instead of soft.
  const SS = 2;
  iframe.style.width = (w * SS) + 'px';
  iframe.style.height = (h * SS) + 'px';

  function applyZoom() {
    try {
      const doc = iframe.contentDocument;
      if (doc && doc.documentElement) {
        doc.documentElement.style.zoom = String(SS);
      }
    } catch (e) { /* cross-origin, ignore */ }
  }
  if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
    applyZoom();
  }
  iframe.addEventListener('load', applyZoom);

  // Scale to fit the card's width exactly (never crops), and size the wrap
  // to match so the box always fully fits the scaled animation with no
  // leftover blank space. The surrounding .how-card has its own min-height
  // so all three "how it works" steps line up at the same overall height.
  function resize() {
    const scale = (wrap.clientWidth / w) / SS;
    iframe.style.transform = `scale(${scale})`;
    wrap.style.height = Math.round(h * (wrap.clientWidth / w)) + 'px';
  }
  resize();
  new ResizeObserver(resize).observe(wrap);
});
