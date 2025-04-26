# 1. Builder: install production deps and copy source
FROM oven/bun:1.2.5 AS builder
WORKDIR /usr/src/app

# install only runtime dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# copy your source files
COPY . .

# 2. Production: slim image to serve your Hono app
FROM oven/bun:1.2.5 AS production
WORKDIR /usr/src/app

# bring in just what we need
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000

# start your server (runs "bun run src/index.ts" via the "start" script)
ENTRYPOINT ["bun", "run", "start"]
