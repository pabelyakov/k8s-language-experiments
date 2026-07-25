# k6 load tests for beer-vote

Сценарии нагружают один и тот же API на всех runtime (Java / .NET / Go / Node / PHP).

# 
`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=go_smoke_report.html k6 run -e BASE_URL=http://192.168.1.254:30001 k6/scenarios/smoke.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=go_load_report.html k6 run -e BASE_URL=http://192.168.1.254:30001 k6/scenarios/load.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=go_spike_report.html k6 run -e BASE_URL=http://192.168.1.254:30001 k6/scenarios/spike.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=go_stress_report.html k6 run -e BASE_URL=http://192.168.1.254:30001 k6/scenarios/stress.js`

---

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=dotnet_smoke_report.html k6 run -e BASE_URL=http://192.168.1.254:30005 k6/scenarios/smoke.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=dotnet_load_report.html k6 run -e BASE_URL=http://192.168.1.254:30005 k6/scenarios/load.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=dotnet_spike_report.html k6 run -e BASE_URL=http://192.168.1.254:30005 k6/scenarios/spike.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=dotnet_stress_report.html k6 run -e BASE_URL=http://192.168.1.254:30005 k6/scenarios/stress.js`

---

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=java_smoke_report.html k6 run -e BASE_URL=http://192.168.1.254:30003 k6/scenarios/smoke.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=java_load_report.html k6 run -e BASE_URL=http://192.168.1.254:30003 k6/scenarios/load.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=java_spike_report.html k6 run -e BASE_URL=http://192.168.1.254:30003 k6/scenarios/spike.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=java_stress_report.html k6 run -e BASE_URL=http://192.168.1.254:30003 k6/scenarios/stress.js`

---

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=nodejs_smoke_report.html k6 run -e BASE_URL=http://192.168.1.254:30004 k6/scenarios/smoke.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=nodejs_load_report.html k6 run -e BASE_URL=http://192.168.1.254:30004 k6/scenarios/load.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=nodejs_spike_report.html k6 run -e BASE_URL=http://192.168.1.254:30004 k6/scenarios/spike.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=nodejs_stress_report.html k6 run -e BASE_URL=http://192.168.1.254:30004 k6/scenarios/stress.js`

---

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=nodejs_smoke_report.html k6 run -e BASE_URL=http://192.168.1.254:30005 k6/scenarios/smoke.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=nodejs_load_report.html k6 run -e BASE_URL=http://192.168.1.254:30005 k6/scenarios/load.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=nodejs_spike_report.html k6 run -e BASE_URL=http://192.168.1.254:30005 k6/scenarios/spike.js`

`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=nodejs_stress_report.html k6 run -e BASE_URL=http://192.168.1.254:30005 k6/scenarios/stress.js`


## Структура

```text
k6/
  lib/
    helpers.js      # BASE_URL, random, weighted pick
    endpoints.js    # обёртки над HTTP API
    traffic.js      # общий микс нагрузки
    summary.js      # thresholds + summary.json
  scenarios/
    smoke.js        # 1 VU, happy-path sanity
    load.js         # основной профиль для митапа
    stress.js       # ступенчатый рост до высокого VU
    spike.js        # резкий всплеск
```

## Установка k6

```bash
# Debian/Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update && sudo apt install k6

# или https://grafana.com/docs/k6/latest/set-up/install-k6/
k6 version
```

## Быстрый старт

Подними любой runtime на `:8080`, затем:

```bash
# 1) Проверка, что API жив и контракт совпадает
k6 run k6/scenarios/smoke.js

# 2) Основная нагрузка для сравнения языков
k6 run k6/scenarios/load.js

# 3) Другой base URL (сервис в k3s / другой порт)
k6 run -e BASE_URL=http://localhost:8080 k6/scenarios/load.js
```

Запускай из **корня репозитория** (`k8s-language-experiments`), чтобы относительные импорты `../lib/...` резолвились.

## Что делает load.js

Один VU-итерационный микс (~100%):

| Вес | Действие | Зачем |
|-----|----------|--------|
| 35% | `POST /users` → сразу `POST /votes` | write path |
| 20% | `GET /results` | online aggregation |
| 15% | `GET /users` (random sort/page) | sort + pagination |
| 10% | `GET /beers` | лёгкий hot read |
| 5% | `GET /health` | probe noise |
| 10% | негатив: 400/404/409 | error paths |
| 5% | heavy list `page_size=100&sort=name` | тяжёлое чтение |

Профиль по умолчанию: **ramp 30s → 50 VU × 5m → ramp-down 30s**.

## Параметры (env)

| Переменная | Где | Default | Смысл |
|------------|-----|---------|--------|
| `BASE_URL` | все | `http://localhost:8080` | адрес API |
| `VUS` | load | `50` | целевые виртуальные пользователи |
| `DURATION` | load | `5m` | длина полки |
| `RAMP_UP` | load | `30s` | разгон |
| `RAMP_DOWN` | load | `30s` | спад |
| `SLEEP` | load/stress/spike | `0.1` | пауза между итерациями (сек) |
| `P95_MS` | все | `300` (load) | порог p95 |
| `VUS_MAX` | stress | `200` | пик stress |
| `BASE_VUS` / `SPIKE_VUS` | spike | `10` / `150` | база и пик spike |

Примеры:

```bash
# Помягче локально
k6 run -e VUS=20 -e DURATION=2m -e P95_MS=500 k6/scenarios/load.js

# Жёстче под k3s demo
k6 run -e BASE_URL=http://192.168.1.10:30080 -e VUS=80 -e DURATION=8m k6/scenarios/load.js

# Stress / spike
k6 run -e BASE_URL=http://localhost:8080 -e VUS_MAX=150 k6/scenarios/stress.js
k6 run -e BASE_URL=http://localhost:8080 -e SPIKE_VUS=120 k6/scenarios/spike.js
```

## Как читать результат

В конце прогона k6 печатает summary и пишет `summary.json` в **текущую директорию**.

Смотри в первую очередь:

- `http_reqs` / RPS
- `http_req_duration` → `p(95)`, `p(99)`
- `http_req_duration{endpoint:...}` — latency по эндпоинтам
- `checks` — доля успешных проверок
- кастомные счётчики: `users_created`, `votes_ok`, `votes_conflict`, `edge_cases`

Для честного сравнения языков:

1. Одинаковые k3s `requests`/`limits`
2. Один и тот же `load.js` + те же `VUS`/`DURATION`
3. Перед каждым прогоном новый/пустой pod (in-memory state с нуля)
4. Сначала `smoke.js`, потом `load.js`

## Типичный порядок на митапе

```bash
# Java
k6 run -e BASE_URL=http://localhost:8080 k6/scenarios/smoke.js
k6 run -e BASE_URL=http://localhost:8080 -e VUS=50 -e DURATION=5m k6/scenarios/load.js
# сохрани summary / скрин / метрики pod

# затем то же для go / dotnet / nodejs / php
```

## Troubleshooting

- **`connection refused`** — сервис не слушает `BASE_URL`, проверь `curl $BASE_URL/health`
- **много failed checks на vote** — ок, если сервис ещё поднимается; для smoke fail hard ожидаем
- **`http_req_failed` растёт** — негативный трафик помечен `expectedStatuses` (400/404/409 не считаются fail); если растёт дальше — смотри 5xx
- **скрипт не находит import** — запускай из корня репо: `k6 run k6/scenarios/load.js`
