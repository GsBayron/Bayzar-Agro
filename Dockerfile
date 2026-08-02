# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS frontend

WORKDIR /build/frontend

COPY app-bayzarAgro/package.json app-bayzarAgro/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY app-bayzarAgro/ ./
RUN npm run build -- --configuration production


FROM php:8.3-apache-bookworm AS php-base

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libicu-dev \
        libonig-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        intl \
        mbstring \
        opcache \
        pdo_mysql \
        zip \
    && a2enmod expires headers rewrite \
    && rm -rf /var/lib/apt/lists/*


FROM php-base AS backend

ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /build/backend

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY api-bayzarAgro/composer.json api-bayzarAgro/composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader \
    --prefer-dist

COPY api-bayzarAgro/ ./

RUN composer dump-autoload \
    --classmap-authoritative \
    --no-dev \
    --no-interaction


FROM php-base AS runtime

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public \
    APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    PORT=8080

WORKDIR /var/www/html

COPY deploy/cloud-run/apache-vhost.conf /etc/apache2/sites-available/000-default.conf
COPY deploy/cloud-run/php-production.ini /usr/local/etc/php/conf.d/99-bayzar-production.ini
COPY deploy/cloud-run/entrypoint.sh /usr/local/bin/bayzar-entrypoint

COPY --from=backend --chown=www-data:www-data /build/backend/ /var/www/html/
COPY --from=frontend --chown=www-data:www-data \
    /build/frontend/dist/app-bayzarAgro/browser/ \
    /var/www/html/public/

RUN chmod 0755 /usr/local/bin/bayzar-entrypoint \
    && mkdir -p \
        bootstrap/cache \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
    && chown -R www-data:www-data bootstrap/cache storage

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/bayzar-entrypoint"]
CMD ["apache2-foreground"]
