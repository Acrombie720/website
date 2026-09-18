// Renders the 1200x630 social sharing card for the Data Index.
// The figure count is read from the page itself so the card cannot go stale.
//
//   node build/make-og.mjs

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BODY = join(ROOT, 'build', 'pages', 'research', '_data-index.body.html');
const OUTDIR = join(ROOT, 'fluencyfox-site_6', 'og');

const body = readFileSync(BODY, 'utf8');
const figures = (body.match(/<article class="stat"/g) || []).length;
const sources = (body.match(/<li><b>/g) || []).length;

const UI = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const MONO = 'Menlo, Monaco, Courier New, monospace';

// Matches the page: --paper #F4F6F8, --ink #0C1116, --ink-2 #4C5765, --ink-3 #7B8797
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F4F6F8"/>
  <rect x="0" y="0" width="1200" height="10" fill="#0C1116"/>

  <text x="80" y="118" font-family="${MONO}" font-size="21" font-weight="500"
        letter-spacing="3.2" fill="#7B8797">FLUENCYFOX · RESEARCH</text>

  <text x="80" y="238" font-family="${UI}" font-size="86" font-weight="bold"
        letter-spacing="-2.6" fill="#0C1116">The AI Fluency</text>
  <text x="80" y="330" font-family="${UI}" font-size="86" font-weight="bold"
        letter-spacing="-2.6" fill="#0C1116">Data Index</text>

  <rect x="80" y="374" width="120" height="4" fill="#0C1116"/>

  <text x="80" y="438" font-family="${UI}" font-size="30" fill="#4C5765">Every published figure on AI fluency in hiring,</text>
  <text x="80" y="480" font-family="${UI}" font-size="30" fill="#4C5765">with the sample size and date attached to each one.</text>

  <g font-family="${MONO}" font-size="23" font-weight="500">
    <rect x="80"  y="530" width="196" height="46" rx="23" fill="#E3E7F4"/>
    <text x="104" y="560" fill="#33468C">${figures} FIGURES</text>

    <rect x="296" y="530" width="186" height="46" rx="23" fill="#DEEDE9"/>
    <text x="320" y="560" fill="#175B50">${sources} SOURCES</text>

    <rect x="502" y="530" width="268" height="46" rx="23" fill="#F3EBD6"/>
    <text x="526" y="560" fill="#6F5410">UPDATED MONTHLY</text>
  </g>

  <text x="1120" y="560" text-anchor="end" font-family="${MONO}" font-size="22"
        fill="#7B8797">fluencyfox.ai</text>
</svg>`;

mkdirSync(OUTDIR, { recursive: true });
const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync(join(OUTDIR, 'ai-fluency-data-index.png'), png);
console.log(`og/ai-fluency-data-index.png  1200x630  ${(png.length / 1024).toFixed(0)}KB  (${figures} figures, ${sources} sources)`);
