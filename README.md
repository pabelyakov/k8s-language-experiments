
# Структура
- bruno – коллекция для bruno
- mvps – исходные коды наших mvp
- k6 – нагрузочные тесты
- k6/reports – Результаты нагрузочных тестов
- grafana_dashboards – Скрины графаны по итогам нагрузочных тестов
- k8s – Манифесты для деплоя в kubernetes

# MVPS
## Java
cd mvps/java
docker build -t beer-vote:java .
docker run --rm -p 8080:8080 beer-vote:java

## Node.js (NestJS)
cd mvps/nodejs
docker build -t beer-vote:nodejs .
docker run --rm -p 8080:8080 beer-vote:nodejs

## Bun
cd mvps/nodejs
docker build -f Dockerfile.bun -t beer-vote:bun .
docker run --rm -p 8080:8080 beer-vote:bun

## .NET 8 (ASP.NET Core)
cd mvps/dotnet
docker build -t beer-vote:dotnet .
docker run --rm -p 8080:8080 beer-vote:dotnet

## Go 1.22+ (chi)
cd mvps/go
docker build -t beer-vote:go .
docker run --rm -p 8080:8080 beer-vote:go

## PHP 8.3+ (Laravel 11)
cd mvps/php
docker build -t beer-vote:php .
docker run --rm -p 8080:8080 beer-vote:php
