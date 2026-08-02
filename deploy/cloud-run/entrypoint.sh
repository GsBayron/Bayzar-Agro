#!/bin/sh
set -eu

cd /var/www/html

if [ "${1:-}" = "setup" ]; then
    exec php artisan bayzar:setup --no-interaction
fi

if [ -z "${PASSPORT_PRIVATE_KEY:-}" ] || [ -z "${PASSPORT_PUBLIC_KEY:-}" ]; then
    if [ ! -r storage/oauth-private.key ] || [ ! -r storage/oauth-public.key ]; then
        echo "Faltan las claves OAuth de Passport." >&2
        echo "Inyecta PASSPORT_PRIVATE_KEY y PASSPORT_PUBLIC_KEY desde Secret Manager." >&2
        exit 1
    fi
fi

php artisan config:cache

exec "$@"
