// Blocks until the live site is serving this commit's sitemap.
//
//   node build/wait-for-deploy.mjs [minutes]
//
// IndexNow engines fetch a submitted URL within minutes, so submitting
// before Cloudflare Pages has published is worse than submitting an hour
// late. sitemap.xml changes on every publish, which makes it a reliable
// thing to watch.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { site } from './site.config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const expected = readFileSync(join(ROOT, 'fluencyfox-site_6', 'sitemap.xml'), 'utf8').trim();

const minutes = Number(process.argv[2] ?? 10);
const deadline = Date.now() + minutes * 60_000;

while (Date.now() < deadline) {
  // A unique query string, because the edge caches this file and a cached
  // copy is exactly the thing we are waiting to stop seeing.
  const res = await fetch(`${site.origin}/sitemap.xml?deploy-check=${Date.now()}`, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (res.ok && (await res.text()).trim() === expected) {
    console.log('Live site is serving this build.');
    process.exit(0);
  }
  await sleep(15_000);
}

console.error(`The live sitemap still does not match after ${minutes} minutes.`);
console.error('Nothing submitted. Check the Cloudflare Pages deployment, then run npm run ping.');
process.exit(1);
