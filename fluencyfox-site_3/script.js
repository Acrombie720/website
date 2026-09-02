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

// Manual only - the carousel used to auto-advance every 7s, which moved the
// slide out from under someone mid-read. Visitors now navigate with the
// arrows/dots and nothing changes on its own.

// ---------- "How it works" embedded demo animations ----------
// Each demo is a self-contained, self-looping HTML animation (embeds/how-step*.html)
// built to the exact intrinsic size in data-embed-w/h. We scale it down to fit
// its card via a CSS transform rather than resizing the iframe's own viewport,
// so the animation renders crisp at its native size and just shrinks visually.
document.querySelectorAll('.how-embed').forEach(wrap => {
  const iframe = wrap.querySelector('iframe');
  const w = parseFloat(wrap.dataset.embedW);
  const h = parseFloat(wrap.dataset.embedH);

  // Fit the fixed-size embed into the responsive card with a plain
  // top-left transform: scale(). Previously this rendered the iframe at
  // 2x via an internal CSS `zoom`, purely for extra crispness - but that
  // relied on the wrap's flex-centering and the transform's center-origin
  // exactly cancelling out, and on `zoom` (a non-standard property) doing
  // the same thing in every browser. When either assumption didn't hold,
  // the embed came out cropped or not filling its box. Anchoring the
  // scale to the top-left corner keeps the math simple and unambiguous:
  // the visible box is always exactly (w * scale) x (h * scale), flush
  // with the wrap's own top-left corner, at any card width.
  iframe.style.width = w + 'px';
  iframe.style.height = h + 'px';

  // Scale to fit the card's width exactly (never crops), and size the wrap
  // to match so the box always fully fits the scaled animation with no
  // leftover blank space. The surrounding .how-card has its own min-height
  // so all three "how it works" steps line up at the same overall height.
  function resize() {
    // Guard against a spurious 0 (or stale) width from a layout pass that
    // hasn't settled yet - e.g. right as the page loads, before webfonts
    // swap in. Applying scale(0) would flash the embed away and then
    // "snap" back once a later, correct resize fires, which is exactly
    // the kind of jump some visitors reported on mobile.
    if (!wrap.clientWidth) return;
    const scale = wrap.clientWidth / w;
    iframe.style.transform = `scale(${scale})`;
    wrap.style.height = Math.round(h * scale) + 'px';
  }
  resize();
  new ResizeObserver(resize).observe(wrap);
});
