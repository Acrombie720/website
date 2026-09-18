// Builds the downloadable CSV straight out of the Data Index markup, so the
// file and the page can never disagree. Run after build.mjs.
//
//   node build/make-csv.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'build', 'pages', 'research', '_data-index.body.html');
const OUT = join(ROOT, 'fluencyfox-site_6', 'research', 'ai-fluency-data-index.csv');

const CATEGORY = {
  demand: 'Demand',
  gap: 'Measurement gap',
  cap: 'Capability',
  train: 'Training',
  market: 'Market context',
};

const text = html => html
  .replace(/<br\s*\/?>/gi, ' · ')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const cell = v => `"${String(v).replace(/"/g, '""')}"`;

const src = readFileSync(SRC, 'utf8');
const cards = [...src.matchAll(/<article class="stat" data-cat="([a-z]+)">([\s\S]*?)<\/article>/g)];

const rows = cards.map(([, cat, inner]) => {
  const pick = cls => {
    const m = inner.match(new RegExp(`<p class="${cls}[^"]*">([\\s\\S]*?)<\\/p>`));
    return m ? m[1] : '';
  };
  const srcHtml = pick('src');
  const link = (srcHtml.match(/href="([^"]+)"/) || [])[1] || '';
  // The source line is "Publication · n=... · Date", split on the <br>.
  const parts = text(srcHtml).split(' · ');
  const publication = parts[0] || '';
  const tail = parts.slice(1).join(' · ');
  const bits = tail.split(' · ');
  return {
    category: CATEGORY[cat] || cat,
    figure: text(pick('fig')),
    claim: text(pick('claim')),
    source: publication,
    sample: bits.length > 1 ? bits.slice(0, -1).join(' · ') : tail,
    date: bits.length > 1 ? bits[bits.length - 1] : '',
    url: link,
  };
});

const header = ['Category', 'Figure', 'Claim', 'Source', 'Sample', 'Date', 'Source URL'];
const csv = [header.map(cell).join(',')]
  .concat(rows.map(r => [r.category, r.figure, r.claim, r.source, r.sample, r.date, r.url]
    .map(cell).join(',')))
  .join('\r\n') + '\r\n';

writeFileSync(OUT, csv);
console.log(`ai-fluency-data-index.csv  ${rows.length} rows, ${(csv.length / 1024).toFixed(1)}KB`);
const missing = rows.filter(r => !r.figure || !r.claim || !r.source);
if (missing.length) console.log(`WARNING: ${missing.length} row(s) missing a field`);
