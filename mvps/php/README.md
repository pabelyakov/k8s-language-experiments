# beer-vote (PHP 8.3 + Laravel 11)

In-memory HTTP voting service for comparing language runtimes in k3s under k6.
No database, Redis, brokers, or outbound HTTP — all state lives in an
`InMemoryStore` singleton (plain PHP arrays).

## Memory caveat (important)

PHP-FPM workers **do not share memory**. Each worker would keep its own empty
store, so votes/users would appear to “vanish” under load.

`php artisan serve` also **does not** keep application state across requests
(the built-in server resets request scope every time).

This image runs **FrankenPHP worker mode with exactly one worker**
(`Caddyfile` → `worker { num 1; match /* }`), which boots Laravel once via
`public/frankenphp-worker.php` and reuses the container so `InMemoryStore`
persists within the pod replica. Keep **one worker per replica**; horizontal
scaling still means per-replica memory (not shared across pods).

## Run locally (Docker)

```bash
docker build -t beer-vote:php .
docker run --rm -p 8080:8080 beer-vote:php
```

## Run locally (FrankenPHP)

Requires PHP 8.3+, Composer, and [FrankenPHP](https://frankenphp.dev):

```bash
composer install
cp .env.example .env
php artisan key:generate
SERVER_NAME=:8080 FRANKENPHP_CONFIG="worker ./public/frankenphp-worker.php 1" \
  frankenphp run --config ./Caddyfile
```

Or use the Docker image above (recommended for the meetup).

## API examples

### Health

```bash
curl -s http://localhost:8080/health
```

### List beers

```bash
curl -s http://localhost:8080/v1/beers
```

### Create user

```bash
curl -s -X POST http://localhost:8080/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice"}'
```

### List users

```bash
curl -s 'http://localhost:8080/v1/users?page=1&page_size=20&sort=created_at&order=desc'
```

### Cast vote

```bash
USER_ID=<uuid-from-create-user>
curl -s -X POST http://localhost:8080/v1/votes \
  -H 'Content-Type: application/json' \
  -d "{\"user_id\":\"$USER_ID\",\"beer_id\":3}"
```

### Results

```bash
curl -s http://localhost:8080/v1/results
```

## Notes

- Port: **8080** (binds `0.0.0.0` via FrankenPHP `SERVER_NAME=:8080`)
- Drivers: `CACHE_STORE=array`, `SESSION_DRIVER=array`, `QUEUE_CONNECTION=sync`
- No Eloquent / migrations — store is process memory only
- One vote per user; second vote returns **409**
- Unknown user → **404**; invalid beer_id → **400**
- Shares in results use 4 decimal places; all shares are `0` when `total_votes` is `0`
- Runtime label: `php-laravel`
- Errors: `{ "error": "<message>", "status": <code> }`
- No auth / rate limiting (load-test friendly)
