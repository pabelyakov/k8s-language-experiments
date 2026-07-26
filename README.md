
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

## Java 26
cd mvps/java-26
docker build -t beer-vote:java-26 .
docker run --rm -p 8080:8080 beer-vote:java-26

## Node.js (NestJS)
cd mvps/nodejs
docker build -t beer-vote:nodejs .
docker run --rm -p 8080:8080 beer-vote:nodejs

## Node.js 26 (NestJS)
cd mvps/nodejs-26
docker build -t beer-vote:nodejs-26 .
docker run --rm -p 8080:8080 beer-vote:nodejs-26

## Bun
cd mvps/nodejs
docker build -f Dockerfile.bun -t beer-vote:bun .
docker run --rm -p 8080:8080 beer-vote:bun

## Bun 1.3.14
cd mvps/nodejs-26
docker build -f Dockerfile.bun -t beer-vote:bun-1.3.14 .
docker run --rm -p 8080:8080 beer-vote:bun-1.3.14

## .NET 8 (ASP.NET Core)
cd mvps/dotnet
docker build -t beer-vote:dotnet .
docker run --rm -p 8080:8080 beer-vote:dotnet

## .NET 10 (ASP.NET Core)
cd mvps/dotnet-10
docker build -t beer-vote:dotnet-10 .
docker run --rm -p 8080:8080 beer-vote:dotnet-10

## Go 1.22+ (chi)
cd mvps/go
docker build -t beer-vote:go .
docker run --rm -p 8080:8080 beer-vote:go

## PHP 8.3+ (Laravel 11)
cd mvps/php
docker build -t beer-vote:php .
docker run --rm -p 8080:8080 beer-vote:php
