#!/usr/bin/env bash
# Vendor the brand into a Sphinx manual, the same way the apps vendor it.
#
#   ./sync-brand-docs.sh ~/Documents/GitHub/EMStudio-doc/docs em
#   ./sync-brand-docs.sh ~/Documents/GitHub/stratigraph-server/docs stratigraph
#
# The second word chooses the face: `em` ships the skins file too, so the
# manual wears Extended Matrix; `stratigraph` leaves it out, so the manual
# wears the guidebook. Everything lands in <docs>/_static/brand/, which the
# manual's conf.py names in html_css_files.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAND="$(dirname "$HERE")"
DOCS="${1:?usage: sync-brand-docs.sh <docs-dir> <em|stratigraph>}"
FACE="${2:?usage: sync-brand-docs.sh <docs-dir> <em|stratigraph>}"
OUT="$DOCS/_static/brand"

mkdir -p "$OUT/fonts"
cp "$BRAND/stratigraph-theme.css" "$OUT/"
cp "$HERE/sphinx-rtd-bridge.css" "$OUT/"
cp "$HERE/brand-theme-toggle.js" "$OUT/"
cp "$HERE/eu-emblem.svg" "$OUT/"

# Il piede della provenienza: una pagina sola lo porta, tutte le pagine lo
# mostrano. Il modello estende quello del tema, quindi conf.py deve avere
# templates_path = ['_templates'].
mkdir -p "$DOCS/_templates"
if [ "$FACE" = "em" ]; then
  cp "$HERE/footer-em.html" "$DOCS/_templates/footer.html"
else
  cp "$HERE/footer-stratigraph.html" "$DOCS/_templates/footer.html"
fi

# The faces the theme file asks for, always.
for f in erode-latin-400-normal erode-latin-500-normal erode-latin-600-normal \
         ibm-plex-sans-latin-400-normal ibm-plex-sans-latin-500-normal \
         ibm-plex-sans-latin-600-normal ibm-plex-mono-latin-400-normal \
         ibm-plex-mono-latin-500-normal; do
  cp "$BRAND/fonts/$f.woff2" "$OUT/fonts/"
done

if [ "$FACE" = "em" ]; then
  cp "$BRAND/skins.css" "$OUT/"
  cp "$BRAND/fonts/sora-latin.woff2" "$BRAND/fonts/comfortaa-latin.woff2" "$OUT/fonts/"
  echo "html_css_files = ['brand/stratigraph-theme.css', 'brand/skins.css', 'brand/sphinx-rtd-bridge.css']"
else
  echo "html_css_files = ['brand/stratigraph-theme.css', 'brand/sphinx-rtd-bridge.css']"
fi

cp "$BRAND/fonts/OFL-ibm-plex.txt" "$BRAND/fonts/NOTICE-erode.txt" "$OUT/fonts/" 2>/dev/null || true
[ "$FACE" = "em" ] && cp "$BRAND/fonts/OFL-sora.txt" "$BRAND/fonts/OFL-comfortaa.txt" "$OUT/fonts/" 2>/dev/null || true
echo "brand vendored into $OUT (face: $FACE)"
echo "html_js_files  = ['brand/brand-theme-toggle.js']"
echo "templates_path = ['_templates']"
