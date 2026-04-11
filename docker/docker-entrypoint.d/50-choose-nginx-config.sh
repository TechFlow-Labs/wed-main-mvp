#!/bin/sh
set -e
DOMAIN="main.wedapp.gr"
HTTPS_CONF="/etc/nginx/docker-templates/https.conf"
HTTP_CONF="/etc/nginx/docker-templates/http.conf"
TARGET="/etc/nginx/conf.d/default.conf"

if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ] &&
  [ -f "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" ]; then
  cp "$HTTPS_CONF" "$TARGET"
else
  cp "$HTTP_CONF" "$TARGET"
fi
