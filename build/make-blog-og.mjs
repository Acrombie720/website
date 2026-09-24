// Renders the 1200x630 social card for every blog post.
//
//   node build/make-blog-og.mjs
//
// Same visual language as make-og.mjs, driven by build/generated/blog-posts.json
// so a new post gets a card without anyone drawing one. A post that sets
// `ogImage` in its front matter is skipped, because it has its own.

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = join(ROOT, 'build', 'generated', 'blog-posts.json');
const OUTDIR = join(ROOT, 'fluencyfox-site_6', 'og', 'blog');

if (!existsSync(MANIFEST)) {
  console.log('No blog manifest yet. Run `npm run build` in blog/ first.');
  process.exit(0);
}

const UI = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const MONO = 'Menlo, Monaco, Courier New, monospace';

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Greedy wrap by width, measured in the rough character budget a line of this
// font size has at 1040px. Long titles get a smaller size rather than a
// fourth line, which would collide with the rule underneath.
function layout(title) {
  const size = title.length > 52 ? 62 : title.length > 34 ? 74 : 86;
  const budget = Math.floor(1040 / (size * 0.52));
  const lines = [];
  let line = '';
  for (const word of title.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > budget && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return { size, lines: lines.slice(0, 3) };
}

const longDate = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});

function card(post) {
  const { size, lines } = layout(post.title);
  const step = Math.round(size * 1.07);
  const top = 236 - (lines.length - 1) * (step / 2);
  const ruleY = top + (lines.length - 1) * step + 54;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F4F6F8"/>
  <rect x="0" y="0" width="1200" height="10" fill="#0C1116"/>

  <text x="80" y="118" font-family="${MONO}" font-size="21" font-weight="500"
        letter-spacing="3.2" fill="#7B8797">FLUENCYFOX · BLOG</text>

${lines.map((line, i) => `  <text x="80" y="${top + i * step}" font-family="${UI}" font-size="${size}" font-weight="bold"
        letter-spacing="-2.2" fill="#0C1116">${esc(line)}</text>`).join('\n')}

  <rect x="80" y="${ruleY}" width="120" height="4" fill="#0C1116"/>

  <g font-family="${MONO}" font-size="23" font-weight="500">
    <rect x="80" y="530" width="${48 + longDate(post.published).length * 14}" height="46" rx="23" fill="#E3E7F4"/>
    <text x="104" y="560" fill="#33468C">${esc(longDate(post.published).toUpperCase())}</text>
  </g>

  <text x="1120" y="560" text-anchor="end" font-family="${MONO}" font-size="22"
        fill="#7B8797">fluencyfox.ai/blog</text>
</svg>`;
}

const { posts } = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const own = posts.filter(p => !p.ogImage);

// Wiped first, so a renamed or deleted post does not leave its card behind,
// and an emptied blog does not leave a folder of orphans.
rmSync(OUTDIR, { recursive: true, force: true });

if (!own.length) {
  console.log('No blog cards to render.');
  process.exit(0);
}

mkdirSync(OUTDIR, { recursive: true });
for (const post of own) {
  const png = await sharp(Buffer.from(card(post))).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(join(OUTDIR, `${post.slug}.png`), png);
  console.log(`og/blog/${post.slug}.png`.padEnd(46) + `1200x630  ${(png.length / 1024).toFixed(0)}KB`);
}
