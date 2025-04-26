# 1. Builder: install deps & build
FROM oven/bun:1.2.5 AS builder
WORKDIR /usr/src/app

# only copy manifest to cache installs
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# copy source & build
COPY . .
RUN bun run build

# 2. Runtime: serve the built files
FROM oven/bun:1.2.5 AS production
WORKDIR /usr/src/app

# copy production deps and build output
COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=builder /usr/src/app/dist dist
COPY package.json ./

ENV NODE_ENV=production

EXPOSE 3000

# serve the static build
ENTRYPOINT ["bun", "run", "serve", "--", "--host", "0.0.0.0"]
