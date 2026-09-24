// Places the Astro build into the folder Cloudflare Pages publishes.
//
//   node emit.mjs      (run for you by `npm run build` in this folder)
//
// Two moves matter:
//
//   dist/index.html -> fluencyfox-site_6/blog.html
//     A file is served at /blog. A folder would be served at /blog/ with a
//     307 from /blog, and every canonical on this site is slashless.
//
//   dist/manifest.json -> build/generated/blog-posts.json
//     The non-Astro half of the build reads this: sitemap.xml, the site-wide
//     footer, and the social cards. It is not part of the published site.
//
// The blog folder is wiped first, so a post that was deleted or renamed does
// not linger on the live site as an orphan page.

import { cp, mkdir, rm, readFile, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DIST = join(HERE, 'dist');
const SITE = join(ROOT, 'fluencyfox-site_6');
const BLOG = join(SITE, 'blog');
const MANIFEST = join(ROOT, 'build', 'generated', 'blog-posts.json');

const exists = async p => access(p).then(() => true, () => false);

if (!(await exists(DIST))) {
  throw new Error('No dist/ to emit. Run `astro build` first.');
}

await rm(BLOG, { recursive: true, force: true });
await rm(join(SITE, 'blog.html'), { force: true });
await cp(DIST, BLOG, { recursive: true });

// The index becomes /blog rather than /blog/.
await cp(join(BLOG, 'index.html'), join(SITE, 'blog.html'));
await rm(join(BLOG, 'index.html'));

// The manifest is build input, not a published page.
const manifest = JSON.parse(await readFile(join(BLOG, 'manifest.json'), 'utf8'));
await rm(join(BLOG, 'manifest.json'));
await mkdir(dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

console.log(`blog.html + blog/          ${manifest.posts.length} post(s)`);
console.log(`build/generated/blog-posts.json written`);
console.log("\nNow run npm run build at the repo root to refresh sitemap.xml,");
console.log("the footer on every other page, and the social cards.");
