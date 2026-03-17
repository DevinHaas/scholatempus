ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# ---- base ----
FROM oven/bun:1-alpine AS base
WORKDIR /app

# ---- pruner: generate minimal dependency tree ----
FROM base AS pruner
RUN bun add --global turbo@^2
COPY . .
RUN turbo prune scholatempus-frontend --docker

# ---- installer: install deps then build ----
FROM base AS installer
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
COPY --from=pruner /app/out/json/ .
RUN bun install --production
COPY --from=pruner /app/out/full/ .
RUN cd packages/shared && bun run build
RUN bun run build

# ---- runner: production image ----
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=pruner /app/out/json/ .
RUN bun install --production

COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

USER nextjs
EXPOSE 3000
WORKDIR /app/apps/frontend
CMD ["bun", "run", "start"]
