FROM oven/bun:1 AS base
WORKDIR /app

# Copy workspace manifests first for layer caching
FROM base AS pruner
RUN bun add --global turbo@^2
COPY . .
RUN turbo prune scholatempus-backend --docker



FROM base AS builder
COPY --from=pruner /app/out/json/ .
# Install all workspace dependencies
RUN bun install 

COPY --from=pruner /app/out/full/ .

ENV NODE_ENV=production
RUN bun run build

# Compile to single binary (bundles workspace deps)
RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile /app/server \
  ./apps/backend/src/index.ts

# Minimal runtime image
FROM gcr.io/distroless/base AS runner

WORKDIR /app

COPY --from=builder /app/server server
COPY --from=builder /app/apps/backend/db/drizzle ./db/drizzle

ENV NODE_ENV=production

EXPOSE 4000

CMD ["./server"]
