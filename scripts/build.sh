#!/usr/bin/env bash
# Arma el sitio para GitHub Pages: app/index.html es el código tal como se publica
# en Claude (sin <!doctype>, <head> ni viewport), así que aquí se le pone el envoltorio.
set -euo pipefail
out="${1:-_site}"
mkdir -p "$out"
{
  printf '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  # Sin </head><body>: el parser HTML ubica <title>, <style> y el resto donde van.
  cat app/index.html
  printf '\n'
} > "$out/index.html"
touch "$out/.nojekyll"
