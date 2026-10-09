#!/usr/bin/env bash
# Arma el sitio para GitHub Pages: app/index.html es el código tal como se publica
# en Claude (sin <!doctype>, <head> ni viewport), así que aquí se le pone el envoltorio.
set -euo pipefail
out="${1:-_site}"
mkdir -p "$out"
{
  printf '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  printf '<link rel="manifest" href="manifest.webmanifest">\n'
  # Sin </head><body>: el parser HTML ubica <title>, <style> y el resto donde van.
  cat app/index.html
  printf '\n'
} > "$out/index.html"
cp app/manifest.webmanifest "$out/"
cp -r app/icons "$out/"
# Cada publicación usa una caché nueva, así el teléfono recibe la versión nueva sin subir CACHE a mano.
ver="$(git rev-parse --short HEAD 2>/dev/null || date +%s)"
sed "s/^const CACHE = '[^']*';/const CACHE = 'cc-${ver}';/" app/sw.js > "$out/sw.js"
touch "$out/.nojekyll"
