// Saves a plain-HTML copy of the homepage into index.html, so search engines
// and AI crawlers see the real text without running JavaScript.
//
// The homepage is a compiled app (assets/index-*.js) that draws everything
// into <div id="app">. Without this, the raw page is just a menu and a footer.
// The app replaces the snapshot as soon as it loads, so visitors see no change.
//
// Run it again whenever the designer ships a new homepage bundle:
//   node build/snapshot-home.mjs
// Needs Google Chrome installed (it runs headless).

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'fluencyfox-site_6');
const INDEX = join(ROOT, 'index.html');
const START = '<!-- snapshot:start -->';
const END = '<!-- snapshot:end -->';
const CHROME = process.env.CHROME_PATH
  ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.json': 'application/json', '.mp4': 'video/mp4', '.woff2': 'font/woff2',
};

// Runs inside headless Chrome. Loads the homepage in a frame, waits for the
// app to draw, then strips what a static copy should not carry.
const SNAPSHOT_PAGE = `<!doctype html><meta charset="utf-8">
<iframe id="f" src="/" style="width:1440px;height:900px"></iframe>
<script>
const f = document.getElementById('f');
f.onload = () => setTimeout(() => {
  const app = f.contentDocument.getElementById('app');
  const c = app.cloneNode(true);
  c.querySelectorAll('header').forEach(e => { if (e.querySelector('button[aria-label="Open menu"],button[aria-label="Close menu"]')) e.remove(); });
  c.querySelectorAll('footer').forEach(e => { if (e.querySelector('nav[aria-label="Menu"]')) e.remove(); });
  c.querySelectorAll('iframe, video, script, noscript').forEach(e => e.remove());
  c.querySelectorAll('[style]').forEach(e => {
    const s = e.getAttribute('style').replace(/(opacity|transform|will-change|filter)\\s*:[^;]*;?/g, '').trim();
    s ? e.setAttribute('style', s) : e.removeAttribute('style');
  });
  c.querySelectorAll('img').forEach(e => { if (!e.closest('#hero')) e.setAttribute('loading', 'lazy'); });
  const out = document.createElement('pre');
  out.id = 'out';
  out.textContent = c.innerHTML.split(location.origin).join('');
  document.body.replaceChildren(out);
}, 4000);
</script>`;

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/__snapshot') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(SNAPSHOT_PAGE);
  }
  let file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) && existsSync(file + '.html')) file = file + '.html';
  if (!existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});

await new Promise(r => server.listen(0, r));
const url = `http://localhost:${server.address().port}/__snapshot`;

let dom;
try {
  // Async on purpose: a blocking call would freeze the server Chrome is reading from.
  ({ stdout: dom } = await promisify(execFile)(CHROME, [
    '--headless=new', '--disable-gpu', '--virtual-time-budget=15000',
    '--window-size=1500,1000', '--dump-dom', url,
  ], { encoding: 'utf8', maxBuffer: 50e6, timeout: 60000 }));
} finally {
  server.close();
}

const m = dom.match(/<pre id="out">([\s\S]*)<\/pre>/);
if (!m) throw new Error('Snapshot failed: the homepage app did not render in time.');
const html = m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
if (!/<h1[\s>]/.test(html)) throw new Error('Snapshot has no <h1>. Not writing it.');

const index = readFileSync(INDEX, 'utf8');
const block = `<div id="app">${START}\n${html}\n${END}</div>`;
const next = index.includes(START)
  ? index.replace(/<div id="app">[\s\S]*?<!-- snapshot:end --><\/div>/, block)
  : index.replace('<div id="app"></div>', block);
if (next === index && !index.includes(START)) throw new Error('Could not find <div id="app"> in index.html.');

writeFileSync(INDEX, next);
console.log(`Homepage snapshot written: ${(html.length / 1024).toFixed(0)}KB of HTML.`);
