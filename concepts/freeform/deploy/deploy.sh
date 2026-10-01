#!/usr/bin/env bash
# Publishes concepts/freeform to its Railway share link. This is NOT the live
# site: fluencyfox.ai deploys only from pushes to main (see CLAUDE.md).
#
# Needs the Railway CLI, plus either RAILWAY_TOKEN (a project token for the
# fluencyfox-concept project, which is how cloud sessions authenticate) or a
# local `railway login`.
#
#   concepts/freeform/deploy/deploy.sh "what changed"
set -euo pipefail

PROJECT_ID="${RAILWAY_PROJECT_ID:-ed9a347e-9b83-4514-ab5f-243dbaecdcbb}"
ENVIRONMENT="${RAILWAY_ENVIRONMENT:-production}"
SERVICE="${RAILWAY_SERVICE:-web}"

here="$(cd "$(dirname "$0")" && pwd)"
concept="$here/.."
site_assets="$here/../../../fluencyfox-site_6/assets"
out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT

# The concept borrows files from the live site's assets (the screenshare clip,
# the favicon and the fonts with their licence); the share build carries its
# own copies so it stands alone.
mkdir -p "$out/site/assets/fonts"
cp "$concept/index.html" "$concept/concept.css" "$concept/concept.js" "$out/site/"
cp "$concept"/assets/* "$out/site/assets/"
cp "$site_assets/candidate-screenshare-TLIHC6EP.mp4" "$site_assets/candidate-screenshare-poster.webp" "$site_assets/favicon-32.png" "$out/site/assets/"
cp "$site_assets"/fonts/*.woff2 "$site_assets/fonts/OFL.txt" "$out/site/assets/fonts/"
sed -i.bak 's#\.\./\.\./fluencyfox-site_6/assets/#assets/#g' "$out/site/index.html" && rm "$out/site/index.html.bak"
if grep -q '\.\./\.\./' "$out/site/index.html" "$out/site/concept.css" "$out/site/concept.js"; then
  echo "The concept points at a file outside its folder; copy it in above." >&2
  exit 1
fi
printf 'User-agent: *\nDisallow: /\n' > "$out/site/robots.txt"
cp "$here/Dockerfile" "$here/Caddyfile" "$out/"

cd "$out"
railway up --project "$PROJECT_ID" --environment "$ENVIRONMENT" --service "$SERVICE" --detach -m "${1:-Concept update}"
echo "Share link: https://web-production-66a5f.up.railway.app"
