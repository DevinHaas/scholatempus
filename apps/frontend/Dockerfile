# ---- base ----
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app

# ---- pruner: generate minimal dependency tree ----
FROM base AS pruner
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune scholatempus-frontend --docker

# ---- installer: install deps then build ----
FROM base AS installer
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Layer 1: install from pruned lockfile only (cached until lockfile/package.json changes)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
# Layer 2: copy full source and build
COPY --from=pruner /app/out/full/ .
RUN pnpm build

# ---- runner: production image ----
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install prod-only deps from pruned lockfile (runs as root, files are world-readable)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts with nextjs ownership
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

USER nextjs
EXPOSE 3000
WORKDIR /app/apps/frontend
CMD ["pnpm", "start"]
