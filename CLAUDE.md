# fluencyfox.ai

Marketing site for Fluencyfox (a Calyptus product). Plain HTML, CSS and JS. No build step.

## Where things live

The site is in `fluencyfox-site_6/`, **not** at the repo root.

- `index.html` — the whole homepage
- `privacy.html`, `terms.html`
- `styles.css`, `script.js`, `cookie-consent.js`
- `assets/` — images and video
- `robots.txt`, `sitemap.xml`

Do not create a new numbered folder (`_7`, `_8`). The numbered copies are a leftover from
editing via the GitHub website. Git is the version history now; edit `fluencyfox-site_6`
in place.

## Deploying

The site is a Cloudflare **Worker** named `fluencyfoxwebsite`, serving static assets, wired
to this repo through the Cloudflare dashboard. Not Cloudflare Pages, whatever this file said
before. There is no deploy config in the repo (no GitHub Actions on `main`, no
`wrangler.toml`, no `CNAME`).

**Pushing to `main` deploys to production.** It goes live in roughly 45 seconds.

**Never run `wrangler deploy` by hand.** A manual deploy uploads whatever is in one working
copy and replaces the entire live site, without a commit, a merge or anything in git. On
2026-09-23 three manual deploys from the `blog` branch took `/grad-schemes`,
`/employee-development` and `/research/ai-fluency-data-index` off the live site for a day:
that branch was cut before those pages existed, so it had never heard of them. Git pushes
cannot do this, because git makes you merge first. Every deploy goes through `main`.

Manual deploys show in the Cloudflare dashboard under Versions as "Manually deployed /
Wrangler"; deploys from a push carry the commit message. If the live site disagrees with
`main`, check there first.

Always verify after pushing rather than assuming:

```bash
curl -s "https://fluencyfox.ai/?cb=$RANDOM" | grep "<your changed text>"
```

## Workflow

Several chats edit this repo, so **always `git pull` before editing** or you will hit
conflicts.

1. `git pull`
2. Edit
3. Show the diff and get approval before pushing (pushing publishes to the live site)
4. `git commit` and `git push origin main`
5. Confirm the change is live

## DNS

Cloudflare. `www.fluencyfox.ai` 301-redirects to `https://fluencyfox.ai` via a Cloudflare
Redirect Rule. The `www` DNS record must stay **proxied (orange cloud)** or the rule never
fires and www stops resolving entirely. Canonical URL is non-www throughout.

## Gotchas

- **Empty `alt=""` on the Spin.vc and SilverTree logos is correct, not a bug.** Those logos
  sit inside a `.lockup` div next to a `<span>` holding the company name. Adding alt text
  makes screen readers announce the name twice. The HIVED logo has no adjacent text, so it
  correctly has `alt="HIVED"`. Check what is next to an image before "fixing" its alt text.
- Decorative images (`hero-mountains`, `hero-flowers-overlap`) correctly have `alt=""` plus
  `aria-hidden="true"`.
- Testimonial quotes are attributed to real named people at real companies. Flag any request
  to reword them rather than silently editing.

## Audience

Angus is non-technical. Explain changes in plain language, avoid jargon and shorthand paths,
and say what will happen before doing anything that touches the live site.
