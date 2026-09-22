// Page generator for the AI Fluency Benchmark programme.
//
//   node build/build.mjs
//
// Reads every content file under build/pages/, writes a finished HTML page to
// fluencyfox-site_6/<slug>/index.html, and regenerates sitemap.xml.
//
// A content file is JSON front matter between --- lines, then the body HTML:
//
//   ---
//   { "title": "...", "description": "...", "published": "2026-09-18" }
//   ---
//   <h2>A claim with the number in it</h2>
//
// The point of this file is that the head block, the schema, the methodology
// block and the internal links are written once here rather than copied into
// fifteen pages by hand. Nothing about a page's SEO plumbing lives in the
// page itself.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, staticPages, researchNav, productNav } from './site.config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = join(ROOT, 'build', 'pages');
const ASSETS = join(ROOT, 'build', 'assets');
const OUT = join(ROOT, 'fluencyfox-site_6');

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Embedding JSON inside a <script> tag: the only sequence that can break out.
const jsonld = obj => JSON.stringify(obj, null, 2).replace(/<\//g, '<\\/');

const abs = path => site.origin + path;

// ---------------------------------------------------------------- content

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    // _ prefix means a fragment another page includes, not a page of its own.
    if (!name.endsWith('.html') || name.startsWith('_') || name.includes('.raw.')) return [];
    return [full];
  });
}

function parse(file) {
  const src = readFileSync(file, 'utf8');
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(`${relative(ROOT, file)}: no --- front matter block at the top`);
  let meta;
  try {
    meta = JSON.parse(m[1]);
  } catch (err) {
    throw new Error(`${relative(ROOT, file)}: front matter is not valid JSON. ${err.message}`);
  }
  const slug = '/' + relative(PAGES, file).replace(/\.html$/, '').split('\\').join('/');
  for (const key of ['title', 'description', 'published']) {
    if (!meta[key]) throw new Error(`${relative(ROOT, file)}: missing "${key}" in front matter`);
  }
  let body = m[2];
  if (meta.bodyFile) body = readFileSync(join(dirname(file), meta.bodyFile), 'utf8');
  return { file, slug, meta, body };
}

// ---------------------------------------------------------------- schema

function schemaFor(page, byslug) {
  const { meta, slug } = page;
  const url = abs(meta.canonical || slug);
  const graph = [];

  graph.push({
    '@type': 'Article',
    '@id': url + '#article',
    headline: meta.title,
    description: meta.description,
    url,
    datePublished: meta.published,
    dateModified: meta.updated || meta.published,
    inLanguage: site.lang,
    isAccessibleForFree: true,
    author: { '@type': 'Organization', name: site.name, url: site.origin + '/' },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: site.origin + '/',
      logo: { '@type': 'ImageObject', url: abs(site.logo) },
    },
    image: abs(meta.ogImage || site.defaultOgImage),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  });

  if (meta.dataset) {
    const d = meta.dataset;
    graph.push({
      '@type': 'Dataset',
      '@id': url + '#dataset',
      name: d.name || meta.title,
      description: d.description || meta.description,
      url,
      license: d.license || 'https://creativecommons.org/licenses/by/4.0/',
      isAccessibleForFree: true,
      creator: { '@type': 'Organization', name: site.name, url: site.origin + '/' },
      datePublished: meta.published,
      dateModified: meta.updated || meta.published,
      ...(d.temporalCoverage ? { temporalCoverage: d.temporalCoverage } : {}),
      ...(d.keywords ? { keywords: d.keywords } : {}),
      ...(d.variables ? { variableMeasured: d.variables } : {}),
      ...(meta.csv ? {
        distribution: [{
          '@type': 'DataDownload',
          encodingFormat: 'text/csv',
          contentUrl: abs(meta.csv),
        }],
      } : {}),
    });
  }

  if (meta.faq && meta.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': url + '#faq',
      mainEntity: meta.faq.map(q => ({
        '@type': 'Question',
        name: q.q,
        acceptedAnswer: { '@type': 'Answer', text: q.a },
      })),
    });
  }

  // Breadcrumbs from the slug, using real page titles where we have them.
  const parts = slug.split('/').filter(Boolean);
  const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: site.origin + '/' }];
  let acc = '';
  parts.forEach((part, i) => {
    acc += '/' + part;
    const known = byslug.get(acc);
    crumbs.push({
      '@type': 'ListItem',
      position: i + 2,
      name: known ? known.meta.shortTitle || known.meta.title : titleCase(part),
      item: abs(acc),
    });
  });
  graph.push({ '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: crumbs });

  return { '@context': 'https://schema.org', '@graph': graph };
}

const titleCase = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// ---------------------------------------------------------------- blocks

// Saying n=80 out loud is a credibility feature. Every research page gets one.
function methodologyBlock(m) {
  if (!m) return '';
  const row = (label, value) => value
    ? `      <div class="ff-meth-row"><dt>${esc(label)}</dt><dd>${value}</dd></div>\n` : '';
  const list = items => '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
  return `
  <section class="ff-methodology" aria-labelledby="methodology">
    <h2 id="methodology">Methodology</h2>
    <dl>
${row('Sources', Array.isArray(m.sources) ? list(m.sources) : m.sources)}${
  row('Sample size', m.sampleSize)}${
  row('Date range', m.dateRange)}${
  row('Limitations', Array.isArray(m.limitations) ? list(m.limitations) : m.limitations)}${
  row('Last updated', m.lastUpdated)}    </dl>
  </section>`;
}

function relatedBlock(meta, byslug) {
  if (!meta.related || !meta.related.length) return '';
  const links = meta.related.map(entry => {
    // Either "/some/slug", or { url, label } when the target is not a page we generate.
    const href = typeof entry === 'string' ? entry : entry.url;
    const known = byslug.get(href);
    const label = (typeof entry === 'object' && entry.label)
      || (known && (known.meta.shortTitle || known.meta.title))
      || titleCase(href.split('/').filter(Boolean).pop() || 'Home');
    return `      <li><a href="${esc(href)}">${esc(label)}</a></li>`;
  }).join('\n');
  return `
  <nav class="ff-related" aria-labelledby="related">
    <h2 id="related">Related</h2>
    <ul>
${links}
    </ul>
  </nav>`;
}

function csvBlock(meta) {
  if (!meta.csv) return '';
  return `
  <p class="ff-csv"><a href="${esc(meta.csv)}" download>Download the underlying figures as CSV</a></p>`;
}

// ---------------------------------------------------------------- shell

function header(shell) {
  if (shell === 'none') return '';
  return `
<header class="ff-bar">
  <a class="ff-bar-logo" href="/"><img src="${site.wordmark}" alt="${esc(site.name)}" width="208" height="44"></a>
  <nav class="ff-bar-nav" aria-label="Main">
    <a href="/#testimonials">Testimonials</a>
    <a href="/#how-it-works">How It Works</a>
    <a href="/#measure">What we Measure</a>
    <a class="ff-bar-cta" href="${site.demoUrl}" target="_blank" rel="noopener">Book a Demo</a>
  </nav>
</header>`;
}

// A research page earns attention but has nowhere to send it. This is the one
// ask, placed after the reading and before the footer.
function cta(shell) {
  if (shell === 'none') return '';
  return `
<section class="ff-cta">
  <h2>See what fluency looks like up close.</h2>
  <p>These are the numbers. A demo is the hour behind them: a real assessment, scored, end to end.</p>
  <a href="${site.demoUrl}?utm_source=fluencyfox&amp;utm_medium=site&amp;utm_campaign=research" target="_blank" rel="noopener">Book a Demo</a>
</section>`;
}

function footer(shell) {
  if (shell === 'none') return '';
  const col = (heading, links) => `
    <div>
      <h2>${esc(heading)}</h2>
      ${links.map(l => `<a href="${esc(l.url)}">${esc(l.label)}</a>`).join('\n      ')}
    </div>`;
  return `
<footer class="ff-foot">
  <div class="ff-foot-cols">
${col('Research', researchNav)}
${col('Product', productNav)}
${col('Docs', [{ url: '/privacy', label: 'Privacy Policy' }, { url: '/terms', label: 'Terms & Conditions' }])}
    <div>
      <h2>Fluencyfox</h2>
      <p>${site.address}</p>
      <a href="${site.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </div>
  <p class="ff-foot-legal">Fluencyfox is a product of
    <a href="${site.parent.url}" target="_blank" rel="noopener">${esc(site.parent.name)}</a>.</p>
</footer>`;
}

// ---------------------------------------------------------------- render

function render(page, byslug) {
  const { meta, slug, body } = page;
  const canonical = abs(meta.canonical || slug);
  const ogImage = abs(meta.ogImage || site.defaultOgImage);
  const shell = meta.shell || 'full';
  const updated = meta.updated || meta.published;

  const inlineCss = [join(ASSETS, 'css', 'shell.css')]
    .concat(meta.inlineCss ? [join(ASSETS, 'css', meta.inlineCss)] : [])
    .map(p => readFileSync(p, 'utf8'))
    .join('\n');
  const inlineJs = meta.inlineJs ? readFileSync(join(ASSETS, 'js', meta.inlineJs), 'utf8') : '';

  const fonts = meta.fonts || 'https://fonts.googleapis.com/css2?family=Ovo&family=Poppins:ital,wght@0,400;0,500;0,600&display=swap';

  // Generated blocks go where the body says <!--ff:blocks-->, or at the end if
  // it does not say. Pages with their own footer want to place them themselves.
  const blocks = csvBlock(meta) + methodologyBlock(meta.methodology) + relatedBlock(meta, byslug);
  const main = body.includes('<!--ff:blocks-->')
    ? body.replace('<!--ff:blocks-->', blocks)
    : body.trimEnd() + '\n' + blocks;

  return `<!DOCTYPE html>
<html lang="${site.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<meta name="robots" content="${meta.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}">
<link rel="canonical" href="${esc(canonical)}">

<!-- The page's own CSS is inlined, so nothing but the fonts blocks the render. -->
<style>${inlineCss}</style>

<meta property="og:type" content="article">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:title" content="${esc(meta.ogTitle || meta.title)}">
<meta property="og:description" content="${esc(meta.ogDescription || meta.description)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(meta.ogImageAlt || meta.title)}">
<meta property="article:published_time" content="${esc(meta.published)}">
<meta property="article:modified_time" content="${esc(updated)}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(meta.ogTitle || meta.title)}">
<meta name="twitter:description" content="${esc(meta.ogDescription || meta.description)}">
<meta name="twitter:image" content="${esc(ogImage)}">

<link rel="icon" type="image/png" sizes="512x512" href="${site.logo}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="${fonts}">
<link rel="stylesheet" href="${fonts}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="${fonts}"></noscript>

<script type="application/ld+json">
${jsonld(schemaFor(page, byslug))}
</script>
</head>
<body class="ff-page${meta.bodyClass ? ' ' + meta.bodyClass : ''}">
${header(shell)}
<main id="main">
${main.trim()}
</main>
${cta(shell)}
${footer(shell)}
${inlineJs ? `<script>\n${inlineJs}\n</script>` : ''}
</body>
</html>
`;
}

// ---------------------------------------------------------------- sitemap

function sitemap(pages) {
  const entries = staticPages
    .map(p => ({ url: p.url, lastmod: p.lastmod, changefreq: p.changefreq, priority: p.priority }))
    .concat(pages
      // A page whose canonical points elsewhere must not be in the sitemap.
      .filter(p => !p.meta.noindex && !p.meta.canonical)
      .map(p => ({
        url: p.slug,
        lastmod: p.meta.updated || p.meta.published,
        changefreq: p.meta.changefreq || 'monthly',
        priority: p.meta.priority || '0.8',
      })));

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by build/build.mjs. Do not edit by hand. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${abs(e.url)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
}

// ---------------------------------------------------------------- run

const pages = walk(PAGES).map(parse).sort((a, b) => a.slug.localeCompare(b.slug));
const byslug = new Map(pages.map(p => [p.slug, p]));

// Write <slug>.html, NOT <slug>/index.html.
//
// Cloudflare Pages treats the two differently, and only one of them gives the
// URL we want. A folder is served at /path/ and the slashless /path 307s to
// it. A file is served at /path with no slash, the same way /privacy already
// works on this site. Canonical URLs on this site carry no trailing slash, so
// the page has to be a file or every canonical points at a redirect.
for (const page of pages) {
  const file = join(OUT, page.slug.replace(/^\//, '') + '.html');
  mkdirSync(dirname(file), { recursive: true });
  const html = render(page, byslug);
  writeFileSync(file, html);
  console.log(`${page.slug.padEnd(38)} ${(html.length / 1024).toFixed(0)}KB`);
}

writeFileSync(join(OUT, 'sitemap.xml'), sitemap(pages));
console.log(`\nsitemap.xml               ${staticPages.length + pages.filter(p => !p.meta.noindex && !p.meta.canonical).length} urls`);
console.log(`${pages.length} page(s) built.`);
