// Which published pages a push actually changed.
//
//   node build/changed-urls.mjs <base-sha> <head-sha>
//
// Prints one URL per line, for build/ping-indexnow.mjs to submit. Used by
// the IndexNow workflow, which has no memory between runs but does know
// exactly which files the push touched.
//
// Two rules keep the list honest. A changed file only counts if it is a page
// (index.html, privacy.html, blog/some-post.html), and the URL it maps to
// only counts if sitemap.xml lists it. That second rule means a noindexed
// page, an embed fragment or a page whose canonical points elsewhere is
// never submitted, without this file having to know about any of them.
//
// With no usable base commit, which is what a manual run gives, it falls
// back to every URL in the sitemap.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from './site.config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLISHED = 'fluencyfox-site_6';

const sitemap = readFileSync(join(ROOT, PUBLISHED, 'sitemap.xml'), 'utf8');
const inSitemap = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));

const [base, head = 'HEAD'] = process.argv.slice(2);
const usable = base && !/^0+$/.test(base);

// fluencyfox-site_6/research/x.html -> https://fluencyfox.ai/research/x
//   ...      /index.html            -> https://fluencyfox.ai/
const toUrl = file => {
  const path = file.slice(PUBLISHED.length).replace(/\.html$/, '');
  return site.origin + (path === '/index' ? '/' : path);
};

let urls;
if (usable) {
  const diff = execFileSync('git', [
    'diff', '--name-only', '--diff-filter=AM', base, head, '--', PUBLISHED,
  ], { cwd: ROOT, encoding: 'utf8' });

  urls = diff.split('\n')
    .filter(file => file.endsWith('.html'))
    .map(toUrl)
    .filter(url => inSitemap.has(url));
} else {
  urls = [...inSitemap];
}

console.log([...new Set(urls)].join('\n'));
