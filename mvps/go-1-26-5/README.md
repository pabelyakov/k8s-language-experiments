# beer-vote (Go 1.26.5 + chi)

In-memory HTTP voting service for comparing language runtimes in k3s under k6.
No database, Redis, brokers, or outbound HTTP — all state lives behind `sync.RWMutex`.

Same API as `mvps/go`, rebuilt on Go 1.26.5.

## Run locally (Docker)

```bash
docker build -t beer-vote:go-1-26-5 .
docker run --rm -p 8080:8080 beer-vote:go-1-26-5
```

## Run locally (Go)

Requires Go 1.26.5+:

```bash
go run ./cmd/server
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
- Runtime label: `go-1-26-5`
- Errors: `{ "error": "<message>", "status": <code> }`
