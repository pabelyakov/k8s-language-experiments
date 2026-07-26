# syntax=docker/dockerfile:1

FROM node:26.5.0-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:26.5.0-bookworm-slim
WORKDIR /app
RUN groupadd --system app && useradd --system --gid app app
COPY --from=build /app/package.json /app/package-lock.json* ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER app
EXPOSE 8080
CMD ["node", "dist/main.js"]
