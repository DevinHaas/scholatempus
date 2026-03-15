FROM oven/bun:1 AS build

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install all workspace dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY apps/backend/src ./apps/backend/src
COPY packages/shared ./packages/shared

ENV NODE_ENV=production

# Compile to single binary (bundles workspace deps)
RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile /app/server \
  ./apps/backend/src/index.ts

# Minimal runtime image
FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production

EXPOSE 4000

CMD ["./server"]
