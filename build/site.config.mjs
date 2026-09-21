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
  demoUrl: 'https://calendly.com/callum-calyptus/30m',
  linkedin: 'https://www.linkedin.com/company/fluencyfox/',
  address: '71–75 Shelton Street,<br>London, UK WC2H 9JQ',
  // IndexNow. The same string is the filename and the contents of the key
  // file in fluencyfox-site_6/, which is how the protocol proves the key is
  // ours. Rotating it means renaming that file and changing this line.
  indexNowKey: '557e471de8f93dc71a4da1fb75f00480',
};

// Hand-written pages the generator does not own, but the sitemap still needs.
export const staticPages = [
  { url: '/', changefreq: 'weekly', priority: '1.0', lastmod: '2026-09-18' },
  { url: '/privacy', changefreq: 'yearly', priority: '0.3', lastmod: '2026-09-02' },
  { url: '/terms', changefreq: 'yearly', priority: '0.3', lastmod: '2026-09-02' },
];

// The research footer. Only lists routes that actually exist, because linking
// to a 404 is worse than not linking at all. Add entries as pages ship.
export const researchNav = [
  { url: '/research/ai-fluency-data-index', label: 'AI Fluency Data Index' },
];

export const productNav = [
  { url: '/#how-it-works', label: 'How It Works' },
  { url: '/#measure', label: 'What We Measure' },
  { url: '/#testimonials', label: 'Testimonials' },
];
