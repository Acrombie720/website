// Recompress the heavy images, and build smaller variants of the two hero
// images so phones do not download a 2048px file for a 375px screen.
//   node build/optimise-images.mjs          report only, changes nothing
//   node build/optimise-images.mjs --write  actually write the files
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = new URL('../fluencyfox-site_6/assets/', import.meta.url);
const write = process.argv.includes('--write');
const kb = n => (n / 1024).toFixed(0) + 'KB';

// Recompressed in place. maxWidth is the widest it is ever shown, doubled for retina.
const RECOMPRESS = [
  { file: 'hero-mountains.webp',       maxWidth: 2048, quality: 68 },
  { file: 'hero-flowers-overlap.webp', maxWidth: 1920, quality: 68 },
  { file: 'cta-grass-mask.png',        maxWidth: 3200, quality: 80 },
  { file: 'hero-visual.jpg',           maxWidth: 1600, quality: 82 },
  { file: 'testimonial-romil.jpg',     maxWidth: 904,  quality: 80 },
];

// Extra widths written alongside the original, for srcset.
const VARIANTS = [
  { file: 'hero-mountains.webp',       widths: [768, 1280], quality: 70 },
  { file: 'hero-flowers-overlap.webp', widths: [768, 1280], quality: 70 },
];

function encode(pipe, ext, quality) {
  if (ext === 'webp') return pipe.webp({ quality, effort: 6 });
  if (ext === 'png')  return pipe.png({ compressionLevel: 9, palette: true, quality });
  return pipe.jpeg({ quality, mozjpeg: true });
}

let before = 0, after = 0;
for (const job of RECOMPRESS) {
  const path = new URL(job.file, DIR);
  const src = readFileSync(path);
  const meta = await sharp(src).metadata();
  const ext = job.file.split('.').pop().toLowerCase();
  let pipe = sharp(src);
  if (meta.width > job.maxWidth) pipe = pipe.resize({ width: job.maxWidth, withoutEnlargement: true });
  const out = await encode(pipe, ext, job.quality).toBuffer();
  const outMeta = await sharp(out).metadata();
  const keep = out.length < src.length;
  before += src.length; after += keep ? out.length : src.length;
  console.log(`${job.file.padEnd(30)} ${meta.width}x${meta.height} ${kb(src.length)}` +
              ` -> ${outMeta.width}x${outMeta.height} ${kb(out.length)}${keep ? '' : '  SKIPPED'}`);
  if (write && keep) writeFileSync(path, out);
}

console.log('');
for (const job of VARIANTS) {
  const src = readFileSync(new URL(job.file, DIR));
  const ext = job.file.split('.').pop().toLowerCase();
  const stem = job.file.slice(0, -(ext.length + 1));
  for (const w of job.widths) {
    const out = await encode(sharp(src).resize({ width: w, withoutEnlargement: true }), ext, job.quality).toBuffer();
    const m = await sharp(out).metadata();
    const name = `${stem}-${w}.${ext}`;
    console.log(`${name.padEnd(30)} ${m.width}x${m.height} ${kb(out.length)}`);
    if (write) writeFileSync(new URL(name, DIR), out);
  }
}
console.log(`\nRecompressed ${kb(before)} -> ${kb(after)}, saves ${kb(before - after)}`);
if (!write) console.log('Dry run. Add --write to apply.');
