#!/usr/bin/env sh
set -e
cd "$(dirname "$0")/.."

docker compose run --rm certbot renew
docker compose exec web nginx -s reload
