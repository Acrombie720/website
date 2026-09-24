// Blocks until Cloudflare has deployed a commit.
//
//   node build/wait-for-deploy.mjs <sha> [minutes]
//
// Needs GITHUB_TOKEN and GITHUB_REPOSITORY, which the workflow provides.
// In the workflow it also sets the step output deployed=true|false, and exits
// 0 either way. It only fails when Cloudflare never reports on the commit.
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

const [sha, minutesArg = '10'] = process.argv.slice(2);
const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;
if (!sha || !GITHUB_TOKEN || !GITHUB_REPOSITORY) {
  console.error('Usage: GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo node build/wait-for-deploy.mjs <sha> [minutes]');
  process.exit(2);
}

const minutes = Number(minutesArg);
const deadline = Date.now() + minutes * 60_000;
const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${sha}/check-runs`
  + `?check_name=${encodeURIComponent(CHECK)}`;

let seen = 'no check run yet';
while (Date.now() < deadline) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) throw new Error(`GitHub returned ${res.status} ${res.statusText} for ${url}`);

  // A re-run adds a second check run to the same commit. The newest one is
  // the deploy that counts.
  const [run] = (await res.json()).check_runs
    .sort((a, b) => (b.started_at ?? '').localeCompare(a.started_at ?? ''));

  if (run?.status === 'completed') {
    const deployed = run.conclusion === 'success';
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `deployed=${deployed}\n`);
    if (deployed) {
      console.log(`Cloudflare deployed ${sha.slice(0, 7)}.`);
    } else {
      // A warning, not a failure. Cloudflare's own check on the commit is
      // already red, and a second red mark for the same event is just noise.
      console.log(`::warning::Cloudflare's build of ${sha.slice(0, 7)} ended "${run.conclusion}", so nothing new went live and nothing was submitted. ${run.html_url}`);
    }
    process.exit(0);
  }
  if (run) seen = `check run ${run.status}`;
  await sleep(15_000);
}

console.error(`No finished "${CHECK}" check on ${sha.slice(0, 7)} after ${minutes} minutes (${seen}).`);
console.error('Nothing submitted. Check the Worker in the Cloudflare dashboard, then run npm run ping.');
process.exit(1);
