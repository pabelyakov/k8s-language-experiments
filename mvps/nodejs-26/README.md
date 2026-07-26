# beer-vote (Node.js 26.5 + NestJS)

In-memory HTTP voting service for comparing language runtimes in k3s under k6.
No database, Redis, brokers, or outbound HTTP — all state lives in `Map`.

Same API as `mvps/nodejs`, rebuilt on Node.js 26.5.0.

## Run locally (Docker)

```bash
docker build -t beer-vote:nodejs-26 .
docker run --rm -p 8080:8080 beer-vote:nodejs-26
```

### Bun 1.3.14

Same NestJS build, runtime is Bun instead of Node:

```bash
docker build -f Dockerfile.bun -t beer-vote:bun-1.3.14 .
docker run --rm -p 8080:8080 beer-vote:bun-1.3.14
```

## Run locally (npm)

Requires Node.js 26.5.0+:

```bash
npm ci
npm run start:dev
```

Production:

```bash
npm ci
npm run build
npm run start:prod
```

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

- Port: **8080** (binds `0.0.0.0`)
- One vote per user; second vote returns **409**
- Unknown user → **404**; invalid beer_id → **400**
- Shares in results use 4 decimal places; all shares are `0` when `total_votes` is `0`
- Runtime label: `nodejs-26-nestjs`
