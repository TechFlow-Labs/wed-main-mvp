#!/bin/sh
set -e
UPSTREAM="${WEDDING_API_NGINX_UPSTREAM:-backend:8000}"
sed -i "s|__WEDDING_API_NGINX_UPSTREAM__|${UPSTREAM}|g" /etc/nginx/conf.d/default.conf
