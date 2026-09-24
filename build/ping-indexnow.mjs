// Tells the IndexNow search engines which pages changed.
//
//   node build/ping-indexnow.mjs             submit what changed since last time
//   node build/ping-indexnow.mjs --all       submit every URL in the sitemap
//   node build/ping-indexnow.mjs <url> <url> submit exactly these
//   node build/ping-indexnow.mjs --dry-run   print what would be sent
//
// Given URLs explicitly, it submits those and leaves the local record of
// what has been sent alone. That is the mode CI uses, because CI knows
// precisely which pages the push changed and keeps no state between runs.
//
// Bing, ChatGPT's search, Yandex, Naver and Seznam share one endpoint, so a
// single call reaches all of them. Google does not take part: it finds new
// posts through sitemap.xml, which the build already keeps current.
//
// Run it after deploying, not before. The engines fetch the URL within
// minutes, and a 404 at that moment is worse than telling them later.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from './site.config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITEMAP = join(ROOT, 'fluencyfox-site_6', 'sitemap.xml');
const SENT = join(ROOT, 'build', 'generated', 'indexnow-sent.json');
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);
const all = args.includes('--all');
const dryRun = args.includes('--dry-run');
const given = args.filter(a => a.startsWith('http'));

for (const url of given) {
  if (!url.startsWith(site.origin + '/')) {
    throw new Error(`${url} is not on ${site.origin}. IndexNow rejects a mixed host list.`);
  }
}

if (!site.indexNowKey) throw new Error('No indexNowKey in build/site.config.mjs.');

// The sitemap is the one list of what this site publishes, so it is the list
// worth submitting, rather than a second one that can disagree with it.
const xml = readFileSync(SITEMAP, 'utf8');
const current = {};
for (const block of xml.split('<url>').slice(1)) {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
  const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  if (loc) current[loc] = lastmod ?? '';
}

const sent = existsSync(SENT) ? JSON.parse(readFileSync(SENT, 'utf8')) : {};
const urls = given.length
  ? given
  : Object.keys(current).filter(url => all || sent[url] !== current[url]);

if (!urls.length) {
  console.log('Nothing changed since the last ping.');
  process.exit(0);
}

const host = new URL(site.origin).host;
const body = {
  host,
  key: site.indexNowKey,
  keyLocation: `${site.origin}/${site.indexNowKey}.txt`,
  urlList: urls,
};

console.log(`${urls.length} URL(s):`);
for (const url of urls) console.log(`  ${url}`);

if (dryRun) {
  console.log('\n--dry-run, nothing sent.');
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

// 200 accepted, 202 accepted but the key is still being verified.
if (res.status !== 200 && res.status !== 202) {
  throw new Error(`IndexNow returned ${res.status} ${res.statusText}. Nothing recorded as sent.`);
}

if (!given.length) {
  mkdirSync(dirname(SENT), { recursive: true });
  writeFileSync(SENT, JSON.stringify({ ...sent, ...current }, null, 2) + '\n');
}
console.log(`\nIndexNow accepted the list (${res.status}).`);
