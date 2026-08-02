#!/bin/sh
set -eu

cd /var/www/html

if [ "${1:-}" = "setup" ]; then
    exec php artisan bayzar:setup --no-interaction
fi

if [ ! -r storage/oauth-private.key ] || [ ! -r storage/oauth-public.key ]; then
    echo "Faltan las claves OAuth de Passport en storage/." >&2
    echo "Monta bayzar-oauth-private y bayzar-oauth-public desde Secret Manager." >&2
    exit 1
fi

php artisan config:cache

exec "$@"
