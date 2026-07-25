# Java
cd java
docker build -t beer-vote:java .
docker run --rm -p 8080:8080 beer-vote:java

# Node.js (NestJS)
cd nodejs
docker build -t beer-vote:nodejs .
docker run --rm -p 8080:8080 beer-vote:nodejs

# .NET 8 (ASP.NET Core)
cd dotnet
docker build -t beer-vote:dotnet .
docker run --rm -p 8080:8080 beer-vote:dotnet

# Go 1.22+ (chi)
cd go
docker build -t beer-vote:go .
docker run --rm -p 8080:8080 beer-vote:go

# PHP 8.3+ (Laravel 11)
cd php
docker build -t beer-vote:php .
docker run --rm -p 8080:8080 beer-vote:php
