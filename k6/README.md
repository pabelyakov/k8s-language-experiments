# k6 load tests for beer-vote

In-memory API: при `connection refused` / transport error прогон **сразу abort** —
рестарт сервиса обнуляет данные, продолжать бессмысленно.

## Сценарии

| # | Файл / скрипт | Что делает |
|---|---------------|------------|
| 1 | `scenarios/01_beers_max.js` | max RPS на `GET /v1/beers` |
| 2 | `scenarios/02_users_max.js` | max RPS на `POST /v1/users` |
| 3 | `scripts/03_users_then_votes.sh` | fill N users (low) → max RPS на `POST /v1/votes` |
| 4 | `scripts/04_init_then_results.sh` | fill N users+votes (low) → max RPS на `GET /v1/results` |
| 5 | `scenarios/05_mixed.js` | смешанный трафик |
| — | `scenarios/smoke.js` | быстрый happy-path |

## Быстрый старт

Из **корня репозитория**:

```bash
# сервис на :8080
curl -s http://localhost:8080/health

# sanity
k6 run k6/scenarios/smoke.js

# 1) ceiling на чтение beers
k6 run k6/scenarios/01_beers_max.js

# 2) ceiling на запись users
k6 run k6/scenarios/02_users_max.js

# 3) 1M users → max votes  (для пробы: TARGET_USERS=1000)
TARGET_USERS=1000000 FILL_RATE=50 bash k6/scripts/03_users_then_votes.sh

# 4) 10M users+votes → max results  (для пробы: TARGET_USERS=1000)
TARGET_USERS=10000000 FILL_RATE=40 bash k6/scripts/04_init_then_results.sh

# 5) mixed
k6 run -e VUS=50 -e DURATION=5m k6/scenarios/05_mixed.js
```

## Прогон против k3s (по runtime) + HTML-отчёт

NodePort’ы из манифестов `k8s/*.yaml`:

| Runtime | Manifest | NodePort |
|---------|----------|----------|
| Go | `k8s/go.yaml` | `30001` |
| PHP | `k8s/php.yaml` | `30002` |
| Java | `k8s/java.yaml` | `30003` |
| Node.js | `k8s/nodejs.yaml` | `30004` |
| .NET | `k8s/dotnet.yaml` | `30005` |
| Bun | `k8s/bun.yaml` | `30006` |

Подставь IP ноды k3s вместо `NODE_IP` (пример: `192.168.1.254`):

```bash
export NODE_IP=192.168.1.254
mkdir -p k6/reports
```

Отчёт: live UI на время прогона (`http://127.0.0.1:5665`) + HTML-файл через
`K6_WEB_DASHBOARD=true` и `K6_WEB_DASHBOARD_EXPORT=...`.

### Smoke (все runtime)

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/go_smoke_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30001 k6/scenarios/smoke.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/php_smoke_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30002 k6/scenarios/smoke.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/java_smoke_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30003 k6/scenarios/smoke.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/nodejs_smoke_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30004 k6/scenarios/smoke.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/dotnet_smoke_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30005 k6/scenarios/smoke.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/bun_smoke_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30006 k6/scenarios/smoke.js
```

### 1) Max RPS — beers

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/go_01_beers_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30001 k6/scenarios/01_beers_max.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/php_01_beers_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30002 k6/scenarios/01_beers_max.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/java_01_beers_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30003 k6/scenarios/01_beers_max.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/nodejs_01_beers_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30004 k6/scenarios/01_beers_max.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/dotnet_01_beers_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30005 k6/scenarios/01_beers_max.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/bun_01_beers_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30006 k6/scenarios/01_beers_max.js
```

### 2) Max RPS — users

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/go_02_users_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30001 k6/scenarios/02_users_max.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/php_02_users_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30002 k6/scenarios/02_users_max.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/java_02_users_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30003 k6/scenarios/02_users_max.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/nodejs_02_users_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30004 k6/scenarios/02_users_max.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/dotnet_02_users_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30005 k6/scenarios/02_users_max.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/bun_02_users_max_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30006 k6/scenarios/02_users_max.js
```

### 3) Mixed

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/go_03_mixed_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30001 -e VUS=50 -e DURATION=5m k6/scenarios/03_mixed.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/php_03_mixed_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30002 -e VUS=50 -e DURATION=5m k6/scenarios/03_mixed.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/java_03_mixed_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30003 -e VUS=50 -e DURATION=5m k6/scenarios/03_mixed.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/nodejs_03_mixed_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30004 -e VUS=50 -e DURATION=5m k6/scenarios/03_mixed.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/dotnet_03_mixed_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30005 -e VUS=50 -e DURATION=5m k6/scenarios/03_mixed.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/bun_03_mixed_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30006 -e VUS=50 -e DURATION=5m k6/scenarios/03_mixed.js
```

Пример в одну строку (как ты писал):

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6/reports/nodejs_05_mixed_report.html \
  k6 run -e BASE_URL=http://192.168.1.254:30004 -e VUS=50 -e DURATION=5m \
  k6/scenarios/05_mixed.js
```

## Max RPS (сценарии 1, 2, 3b, 4b)

Используется `ramping-arrival-rate`: ступени от `START_RATE` до `MAX_RATE`.

| Env | Default | Смысл |
|-----|---------|--------|
| `BASE_URL` | `http://localhost:8080` | цель |
| `START_RATE` | `100` | нач. req/s |
| `MAX_RATE` | `10000` | потолок req/s |
| `STAGE_TIME` | `20s` | длина ступени |
| `PRE_VUS` | `50` | pre-allocated VUs |
| `MAX_VUS` | `500` | потолок VUs |

Смотри в summary пиковый `http_reqs` rate и `http_req_duration` p95/p99.
Если сервис падает — k6 печатает abort и останавливается.

```bash
k6 run -e MAX_RATE=20000 -e MAX_VUS=1000 -e STAGE_TIME=30s k6/scenarios/01_beers_max.js
```

## Fill (сценарии 3a / 4a)

| Env | Default (03 / 04) | Смысл |
|-----|-------------------|--------|
| `TARGET_USERS` | `1000000` / `10000000` | сколько создать |
| `FILL_RATE` | `50` / `40` | целевой суммарный RPS записи |
| `FILL_VUS` | `5` | параллелизм fill |
| `FILL_MAX_DURATION` | `48h` | таймаут fill |

Оценка времени fill: `TARGET_USERS / FILL_RATE` секунд  
(1M @ 50 RPS ≈ 5.5 ч; 10M @ 40 RPS ≈ 69 ч).

Для отладки всегда начинай с малого:

```bash
TARGET_USERS=5000 FILL_RATE=100 bash k6/scripts/03_users_then_votes.sh
TARGET_USERS=5000 FILL_RATE=100 bash k6/scripts/04_init_then_results.sh
```

### Сценарий 3 подробнее

1. `03a_fill_users.js` создаёт пользователей и печатает `UID=<uuid>`
2. shell сохраняет id в `k6/data/user-ids.txt`
3. `03b_votes_max.js` читает файл в `SharedArray` и лупит `POST /v1/votes`

Повторные голоса дают `409` — это нормально, эндпоинт всё равно нагружается.

### Сценарий 4 подробнее

1. `04a` — каждая итерация: create user → vote  
2. `04b` — только `GET /v1/results` на максимум  

Состояние должно остаться в **том же pod/процессе** между 04a и 04b (не рестартовать сервис).

## Abort при connection refused

Все вызовы идут через `lib/endpoints.js` → `lib/abort.js`:
- `status === 0` (refused / reset / dial error) → `exec.test.abort(...)`
- тест прекращается сразу, без «добивания» пустого инстанса

## Mixed (сценарий 5)

Веса: create+vote 35%, results 20%, list users 15%, beers 10%, health 5%, edge 10%, heavy list 5%.

```bash
k6 run -e BASE_URL=http://localhost:8080 -e VUS=50 -e DURATION=5m k6/scenarios/05_mixed.js
```

## Сравнение языков

1. Один и тот же сценарий + те же env  
2. Одинаковые k3s limits  
3. Свежий pod перед прогоном (пустая память)  
4. Для 3/4 — не рестартовать между fill и hammer  

## Структура

```text
k6/
  lib/           abort, endpoints, fill, maxrps, helpers, traffic, summary
  scenarios/     01..05 + smoke + 03a/03b + 04a/04b
  scripts/       03_users_then_votes.sh, 04_init_then_results.sh
  data/          user-ids.txt (генерируется)
  reports/       HTML-отчёты K6_WEB_DASHBOARD_EXPORT (локально)
```
