# Use Node.js 20
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Set working directory
WORKDIR /app

# Copy root package files (needed for monorepo)
# Note: Build context must be from repo root for this to work
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy frontend package
COPY apps/frontend ./apps/frontend

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder

WORKDIR /app

# Build the frontend
RUN cd apps/frontend && pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy frontend package (including .next build)
COPY --from=builder /app/apps/frontend ./apps/frontend

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Expose port
EXPOSE 3000

# Set working directory to frontend
WORKDIR /app/apps/frontend

# Start the application
CMD ["pnpm", "start"]
