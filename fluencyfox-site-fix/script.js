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
  // Step by the slide's own width + the flex gap (22px), in pixels — a plain
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
  iframe.style.width = w + 'px';
  iframe.style.height = h + 'px';

  function resize() {
    const scale = wrap.clientWidth / w;
    iframe.style.transform = `scale(${scale})`;
    wrap.style.height = Math.round(h * scale) + 'px';
  }
  resize();
  new ResizeObserver(resize).observe(wrap);
});
