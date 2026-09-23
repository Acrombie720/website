// Everything about the site that more than one page needs to agree on.
// Change it here, run `npm run build`, and every generated page updates.

export const site = {
  origin: 'https://fluencyfox.ai',
  name: 'Fluencyfox',
  parent: { name: 'Calyptus', url: 'https://www.calyptus.co/' },
  logo: '/assets/logo-mark.png',
  wordmark: '/assets/logo-full.svg',
  defaultOgImage: '/assets/hero-visual.jpg',
  locale: 'en_GB',
  lang: 'en',
  demoUrl: 'https://calendly.com/callum-fluencyfox/30min',
  linkedin: 'https://www.linkedin.com/company/fluencyfox/',
  address: '71–75 Shelton Street,<br>London, UK WC2H 9JQ',
};

// Hand-written pages the generator does not own, but the sitemap still needs.
export const staticPages = [
  { url: '/', changefreq: 'weekly', priority: '1.0', lastmod: '2026-09-18' },
  { url: '/privacy', changefreq: 'yearly', priority: '0.3', lastmod: '2026-09-02' },
  { url: '/terms', changefreq: 'yearly', priority: '0.3', lastmod: '2026-09-02' },
  { url: '/grad-schemes', changefreq: 'monthly', priority: '0.9', lastmod: '2026-09-21' },
  { url: '/employee-development', changefreq: 'monthly', priority: '0.9', lastmod: '2026-09-21' },
];

// The single Menu column, in the same order as the hand-written footers in
// fluencyfox-site_6. Keep the two in step: a generated page and a static page
// showing different menus is the thing this is here to prevent.
export const menuNav = [
  { url: '/#testimonials', label: 'Testimonials' },
  { url: '/#how-it-works', label: 'How It Works' },
  { url: '/#measure', label: 'What we Measure' },
  { url: '/grad-schemes', label: 'Grad Schemes' },
  { url: '/employee-development', label: 'Employee Development' },
  { url: '/research/ai-fluency-data-index', label: 'Research' },
];
