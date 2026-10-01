// Smaller copies of the images the new homepage shows, so a phone or laptop
// does not download the designer's 2048px originals: WebP for all of them,
// plus AVIF for the photos where it is clearly smaller (see AVIF_BASE).
//   node build/optimise-home-images.mjs          report only, changes nothing
//   node build/optimise-home-images.mjs --write  actually write the files
//
// Every output is made from the designer's file, never from an earlier output,
// so running it again gives the same files. The "-d" in a name marks a copy
// derived from the designer's file. Originals are never modified.
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DIR = new URL('../fluencyfox-site_6/assets/', import.meta.url);
const write = process.argv.includes('--write');
const kb = n => (n / 1024).toFixed(0) + 'KB';

// A recompressed copy is only worth a new URL if it saves at least this much.
const MIN_SAVING = 0.10;

// AVIF copies of the photos, which index.html offers first in a <picture>
// with the WebP as the fallback. A job's avif settings are the lowest quality
// at which every width is at least as close to the designer's original as
// its WebP (SSIM on luma; measured 1 Oct 2026 with sharp 0.35.5). Bit depth
// is per job: 10-bit is smaller for some photos, 8-bit for others. Chroma is
// 4:2:0 like WebP's; effort 9 saved only about 1% more for 4x the time.
// AVIF is only worth it where it is at least about 15% smaller than the
// WebP beside it: every width must save 14% or more. A srcset takes all its
// widths from one format, so a set is written whole or not at all.
const AVIF_BASE = { effort: 6, chromaSubsampling: '4:2:0' };
const AVIF_MIN_SAVING = 0.14;

// Full-bleed at 100vw in the hero and the closing CTA. Both have real
// transparency (the mountains' sky, everything around the flowers), so the
// alpha plane is kept lossless (alphaQuality 100).
const WIDTHS = [
  { file: 'hero-mountains-BD-V2s5g.webp',       stem: 'hero-mountains-d', widths: [768, 1280, 1440, 1600, 1920, 2048], quality: 72,
    avif: { quality: 58, bitdepth: 10 } },
  { file: 'hero-flowers-overlap-5zR-FvQe.webp', stem: 'hero-flowers-d',   widths: [768, 1280, 1440, 1600, 1920, 2216], quality: 75,
    avif: { quality: 60 } },
];

// One recompressed copy each. maxWidth is the widest it is shown, doubled for retina.
// No AVIF for Eleonora, Romil or Tess: as close to the original, it is only
// 13%, 7% and 6% smaller. The camera photo would save 32%, but it is a CSS
// background set in index.html, which a <picture> cannot reach.
const RECOMPRESS = [
  { file: 'testimonial-eleonora-BU8lwlWD.webp',   out: 'testimonial-eleonora-d.webp', maxWidth: 940, quality: 76 },
  { file: 'testimonial-romil-photo-Cb0H6cwe.webp', out: 'testimonial-romil-d.webp',   maxWidth: 940, quality: 76 },
  { file: 'testimonial-tess-photo-COCQv1Ze.webp',  out: 'testimonial-tess-d.webp',    maxWidth: 940, quality: 76 },
  { file: 'testimonial-jay-photo-DCc6BvwN.webp',   out: 'testimonial-jay-d.webp',     maxWidth: 940, quality: 76,
    avif: { quality: 54, bitdepth: 10 } },
  { file: 'assessment-camera-Dh5KHne1.webp',       out: 'assessment-camera-d.webp',   maxWidth: 640, quality: 76 },
];

// The product mockup is a 650KB SVG: text as outlines plus five embedded
// bitmaps. It is a fixed illustration, so WebP at its display sizes (and 2x)
// looks the same for a fraction of the bytes. Transparent outside its rounded
// corners and drop shadow, so the WebP keeps an alpha channel.
const RASTER = [
  // 1600 exists for 1x laptops: index.html's sizes asks for about 1.33x there,
  // because the mockup's small UI text goes soft when drawn at close to 1:1.
  { file: 'ai-tests-default-Da5avjdU.svg', stem: 'hero-mockup-d', widths: [768, 1280, 1600, 2404], quality: 85 },
];

// Writes only when the bytes changed, so a re-run leaves identical files alone.
function save(name, buf) {
  const path = new URL(name, DIR);
  if (!write) return '';
  if (existsSync(path) && readFileSync(path).equals(buf)) return '  unchanged';
  writeFileSync(path, buf);
  return '  written';
}

async function line(name, buf, srcName, srcBytes, note = '') {
  const m = await sharp(buf).metadata();
  console.log(`${name.padEnd(28)} ${`${m.width}x${m.height}`.padEnd(10)} ${kb(buf.length).padStart(6)}` +
              `${m.hasAlpha ? ' alpha' : '      '}  from ${srcName} ${kb(srcBytes)}${note}`);
}

// set: [{ name, buf, webp: bytes of the WebP it sits beside }], one per width.
async function avifSet(set, srcName, srcBytes) {
  const worst = Math.min(...set.map(a => 1 - a.buf.length / a.webp));
  for (const a of set) {
    const saving = 1 - a.buf.length / a.webp;
    await line(a.name, a.buf, srcName, srcBytes, worst < AVIF_MIN_SAVING
      ? `  SKIPPED, the set's worst width is only ${(worst * 100).toFixed(0)}% smaller than WebP` +
        (existsSync(new URL(a.name, DIR)) ? ' (an old copy exists: delete it and its <source>)' : '')
      : `  -${(saving * 100).toFixed(0)}% vs WebP` + save(a.name, a.buf));
  }
}

// librsvg (inside sharp) cannot decode a WebP data URI in an SVG and silently
// leaves that image out: the screen recording, Maya's avatar and the webcam
// still come out as blank boxes (see commit 3d11168). Rewriting each embedded
// WebP as a lossless PNG first makes every image decode.
async function embeddedWebpToPng(svg) {
  let out = '', last = 0;
  for (const m of svg.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=\s]+)/g)) {
    const png = await sharp(Buffer.from(m[1], 'base64')).png().toBuffer();
    out += svg.slice(last, m.index) + 'data:image/png;base64,' + png.toString('base64');
    last = m.index + m[0].length;
  }
  out += svg.slice(last);
  if (/data:image\/(webp|avif)/.test(out)) throw new Error('an embedded image librsvg cannot decode is left in the SVG');
  return out;
}

// Pads or trims to exactly w x h rather than resampling, so text stays crisp.
async function exactSize(buf, w, h) {
  const m = await sharp(buf).metadata();
  if (m.width === w && m.height === h) return buf;
  let pipe = sharp(buf).extract({ left: 0, top: 0, width: Math.min(w, m.width), height: Math.min(h, m.height) });
  if (m.width < w || m.height < h) {
    pipe = sharp(await pipe.toBuffer()).extend({
      right: Math.max(0, w - m.width), bottom: Math.max(0, h - m.height),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }
  return pipe.png().toBuffer();
}

for (const job of WIDTHS) {
  const src = readFileSync(new URL(job.file, DIR));
  const avifs = [];
  for (const w of job.widths) {
    const resized = () => sharp(src).resize({ width: w, withoutEnlargement: true });
    const out = await resized().webp({ quality: job.quality, alphaQuality: 100, effort: 6 }).toBuffer();
    const name = `${job.stem}-${w}.webp`;
    await line(name, out, job.file, src.length, save(name, out));
    if (job.avif) {
      avifs.push({ name: `${job.stem}-${w}.avif`, buf: await resized().avif({ ...AVIF_BASE, ...job.avif }).toBuffer(), webp: out.length });
    }
  }
  if (avifs.length) await avifSet(avifs, job.file, src.length);
  console.log('');
}

for (const job of RASTER) {
  const src = readFileSync(new URL(job.file, DIR));
  const svg = Buffer.from(await embeddedWebpToPng(src.toString('utf8')));
  const [, , vbW, vbH] = src.toString('utf8').match(/viewBox="([^"]+)"/)[1].split(/[\s,]+/).map(Number);
  for (const w of job.widths) {
    const h = Math.round(w * vbH / vbW);
    const png = await sharp(svg, { density: 72 * w / vbW }).png().toBuffer();
    const out = await sharp(await exactSize(png, w, h))
      .webp({ quality: job.quality, alphaQuality: 100, smartSubsample: true, effort: 6 }).toBuffer();
    const name = `${job.stem}-${w}.webp`;
    await line(name, out, job.file, src.length, save(name, out));
  }
  console.log('');
}

for (const job of RECOMPRESS) {
  const src = readFileSync(new URL(job.file, DIR));
  const resized = () => sharp(src).resize({ width: job.maxWidth, withoutEnlargement: true });
  const out = await resized().webp({ quality: job.quality, effort: 6 }).toBuffer();
  const saving = 1 - out.length / src.length;
  if (saving < MIN_SAVING) {
    await line(job.out, out, job.file, src.length,
      `  SKIPPED, only ${(saving * 100).toFixed(0)}% smaller: use the original` +
      (existsSync(new URL(job.out, DIR)) ? ` (an old ${job.out} exists, delete it)` : ''));
    continue;
  }
  await line(job.out, out, job.file, src.length, `  -${(saving * 100).toFixed(0)}%` + save(job.out, out));
  if (job.avif) {
    const avif = await resized().avif({ ...AVIF_BASE, ...job.avif }).toBuffer();
    await avifSet([{ name: job.out.replace(/\.webp$/, '.avif'), buf: avif, webp: out.length }], job.file, src.length);
  }
}

// The only favicon was the 42KB 512px logo, fetched by every first visit.
// Browsers want 32px; the 512px file stays as the touch icon.
{
  const src = readFileSync(new URL('logo-mark.png', DIR));
  const out = await sharp(src).resize(32, 32).png({ compressionLevel: 9, palette: true }).toBuffer();
  await line('favicon-32.png', out, 'logo-mark.png', src.length, save('favicon-32.png', out));
}

if (!write) console.log('\nDry run. Add --write to apply.');
