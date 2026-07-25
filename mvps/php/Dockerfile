# syntax=docker/dockerfile:1

FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --prefer-dist \
    --no-security-blocking \
    --ignore-platform-reqs

FROM dunglas/frankenphp:1-php8.3-bookworm
WORKDIR /app

COPY --from=vendor /app/vendor ./vendor
COPY . .

RUN mkdir -p bootstrap/cache storage/framework/{cache,sessions,views} storage/logs \
    && chmod -R 777 bootstrap/cache storage \
    && cp .env.example .env \
    && php -r "file_put_contents('.env', preg_replace('/^APP_KEY=.*/m', 'APP_KEY=base64:'.base64_encode(random_bytes(32)), file_get_contents('.env')));" \
    && php artisan package:discover --ansi \
    && php artisan config:cache

# HTTP on 8080; exactly one FrankenPHP worker so in-memory votes/users are shared.
ENV SERVER_NAME=":8080" \
    APP_ENV=production \
    APP_DEBUG=false \
    CACHE_STORE=array \
    SESSION_DRIVER=array \
    QUEUE_CONNECTION=sync \
    LOG_CHANNEL=stderr

EXPOSE 8080

CMD ["frankenphp", "run", "--config", "/app/Caddyfile"]
