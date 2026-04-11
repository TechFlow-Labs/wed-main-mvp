#!/usr/bin/env sh
# Obtain the first certificate. Requires: web stack up, DNS A/AAAA for main.wedapp.gr → this host,
# port 80 reachable from the internet for HTTP-01.
set -e
cd "$(dirname "$0")/.."
: "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL for Let's Encrypt registration}"

docker compose run --rm certbot certonly --webroot \
  -w /var/www/certbot \
  -d main.wedapp.gr \
  --email "$CERTBOT_EMAIL" \
  --agree-tos \
  --non-interactive

docker compose restart web
