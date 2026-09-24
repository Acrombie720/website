// Blocks until Cloudflare has deployed a commit.
//
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo GITHUB_SHA=... node build/wait-for-deploy.mjs
//
// The workflow provides all three. There it also sets the step output
// deployed=true|false and exits 0 either way: a failed Cloudflare build is a
// warning. It fails only when Cloudflare never reports on the commit.
//
// IndexNow engines fetch a submitted URL within minutes, so submitting
// before the Worker has deployed is worse than submitting an hour late.
//
// The Worker's Git integration posts a "Workers Builds" check run on every
// commit it builds, so that check is the thing to watch. The first version
// watched the live sitemap.xml instead, which proved nothing (it only changes
// when a lastmod does, so most pushes looked deployed before they were) and
// never matched from a GitHub runner at all: it failed both pushes to main on
// 2026-09-24 while the live sitemap matched main byte for byte.

import { appendFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const CHECK = 'Workers Builds: fluencyfoxwebsite';
const MINUTES = 10;

const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_OUTPUT } = process.env;
if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !GITHUB_SHA) {
  console.error('Needs GITHUB_TOKEN, GITHUB_REPOSITORY and GITHUB_SHA.');
  process.exit(2);
}
const short = GITHUB_SHA.slice(0, 7);

// Cloudflare posts two check runs per build: one marked in_progress when the
// build starts, which it never closes, and a separate completed one when it
// ends. filter=latest (GitHub's default, spelled out here because this
// depends on it) returns only the completed one once it exists.
const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${GITHUB_SHA}/check-runs`
  + `?check_name=${encodeURIComponent(CHECK)}&filter=latest`;

const deadline = Date.now() + MINUTES * 60_000;
let seen = 'no check run yet';
while (Date.now() < deadline) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) throw new Error(`GitHub returned ${res.status} ${res.statusText} for ${url}`);

  const [run] = (await res.json()).check_runs;
  if (run?.status === 'completed') {
    const deployed = run.conclusion === 'success';
    if (GITHUB_OUTPUT) appendFileSync(GITHUB_OUTPUT, `deployed=${deployed}\n`);
    if (deployed) {
      console.log(`Cloudflare deployed ${short}.`);
    } else {
      // A warning, not a failure. Cloudflare's own check on the commit is
      // already red, and a second red mark for the same event is just noise.
      console.log(`::warning::Cloudflare's build of ${short} ended "${run.conclusion}", so nothing new went live and nothing was submitted. ${run.html_url}`);
    }
    process.exit(0);
  }
  if (run) seen = `check run ${run.status}`;
  await sleep(15_000);
}

console.error(`No finished "${CHECK}" check on ${short} after ${MINUTES} minutes (${seen}).`);
console.error('Nothing submitted. Check the Worker in the Cloudflare dashboard, then run npm run ping.');
process.exit(1);
