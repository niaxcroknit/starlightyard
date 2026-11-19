#!/bin/sh
# Copy the current web app into the Android project (android/app/src/main/assets/www).
set -e
cd "$(dirname "$0")/.."
W=android/app/src/main/assets/www
rm -rf "$W"; mkdir -p "$W"
cp source/index.html source/app.css source/app.js source/manifest.webmanifest source/icon-512.png source/assets-manifest.json "$W"/
cp -r source/assets "$W"/assets
echo "copied web app into $W"
