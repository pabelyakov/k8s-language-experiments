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
