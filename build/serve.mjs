// Serves fluencyfox-site_6 the way Cloudflare Pages serves it.
//
//   node build/serve.mjs [port]
//
// The difference from `python3 -m http.server` matters: Pages serves
// /privacy from privacy.html and /blog from blog.html, with no extension and
// no trailing slash, which is the URL shape every canonical on this site
// uses. A plain static server 404s on all of them.

import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'fluencyfox-site_6');
const port = Number(process.argv[2] ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
};

const file = path => {
  try {
    return statSync(path).isFile() ? path : null;
  } catch {
    return null;
  }
};

createServer((req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0]));
  const base = join(ROOT, path);
  const found = file(base) ?? file(base + '.html') ?? file(join(base, 'index.html'));

  if (!found) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404 ${path}\n`);
    return;
  }

  res.writeHead(200, { 'Content-Type': TYPES[extname(found)] ?? 'application/octet-stream' });
  createReadStream(found).pipe(res);
}).listen(port, () => {
  console.log(`fluencyfox-site_6 on http://localhost:${port}`);
});
