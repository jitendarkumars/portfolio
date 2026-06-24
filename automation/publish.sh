#!/bin/bash
# Deploys pending content changes (blog posts written by the "portfolio-blog"
# scheduled task, daily-log entries, etc.) → GitHub → Vercel rebuilds.
# Runs on a schedule via com.jeet.publish.plist. Safe to run anytime: it only
# commits when something actually changed.
set -e
cd "$(dirname "$0")/.." || exit 1

if [ -z "$(git status --porcelain)" ]; then
  echo "$(date) nothing to publish"
  exit 0
fi

git add -A
git commit -m "auto: content update $(date +%F)" || exit 0
git push
echo "$(date) published"
