# =============================================================================
# Recovery Journey Backend - Multi-stage Dockerfile
# =============================================================================
# Stages:
#   1. base       - Common Node.js setup
#   2. deps       - Install dependencies
#   3. builder    - Build TypeScript
#   4. production - Final slim production image
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base image with Node.js
# -----------------------------------------------------------------------------
# Node 22 is the active LTS line. Do not bump to odd-numbered (non-LTS)
# releases; they receive no long-term security support.
FROM node:22-alpine AS base

# Label used by deploy.sh's `docker image prune --filter label=...`
LABEL app="recovery-journey"

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    openssl \
    libc6-compat \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2: Install dependencies
# -----------------------------------------------------------------------------
FROM base AS deps

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for building)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# -----------------------------------------------------------------------------
# Stage 3: Build the application
# -----------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy source code
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

# Build TypeScript
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 4: Production image
# -----------------------------------------------------------------------------
FROM base AS production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8000

# Copy package files
COPY --from=deps /app/package.json ./
COPY --from=deps /app/package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy Prisma schema and generated client
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R backend:nodejs /app

# Switch to non-root user
USER backend

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:8000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application
CMD ["node", "dist/server.js"]

# -----------------------------------------------------------------------------
# Stage: Development (optional, for docker-compose dev)
# -----------------------------------------------------------------------------
FROM base AS development

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Expose port
EXPOSE 8000

# Start with tsx for hot-reload
CMD ["npx", "tsx", "watch", "src/server.ts"]
