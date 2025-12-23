# syntax=docker/dockerfile:1.7

############################
# 1) deps (cache friendly)
############################
FROM node:20-alpine AS deps
WORKDIR /app

# Install native build dependencies
RUN apk add --no-cache libc6-compat

# Install pnpm directly
RUN npm install -g pnpm@10.24.0

# Copy only manifests to maximize cache
COPY package.json pnpm-lock.yaml ./

# Cache pnpm store (BuildKit)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

############################
# 2) build
############################
FROM node:20-alpine AS build
WORKDIR /app

# Install native build dependencies
RUN apk add --no-cache libc6-compat

# Install pnpm directly
RUN npm install -g pnpm@10.24.0

# Bring installed node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./

# Copy source code
COPY . .

# Set Next.js telemetry disabled
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true

# Build Next.js (outputs to .next/)
RUN pnpm build

############################
# 3) runtime (small & safe)
############################
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies
RUN apk add --no-cache libc6-compat

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy Next.js standalone build
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
