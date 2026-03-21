# Multi-stage Dockerfile for Recover Clinician Portal
# Stage 1: Base image with dependencies
FROM node:18-alpine AS base

# Install dependencies needed for Electron builds
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Stage 2: Development dependencies
FROM base AS development

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy application files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server (Vite only, not Electron)
CMD ["npm", "run", "dev:vite"]

# Stage 3: Build stage
FROM base AS build

# Install all dependencies
RUN npm ci

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Stage 4: Production builder (for creating distributable packages)
FROM base AS builder

# Install all dependencies (needed for electron-builder)
RUN npm ci

# Copy application files
COPY . .

# Build the application
RUN npm run build

# The packaged applications will be in ./release directory
# This stage is meant to be used with volume mounts to extract the built apps

# Stage 5: Lightweight production image (serves built files)
FROM node:18-alpine AS production

WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/assets ./assets

# Install only production dependencies
RUN npm ci --omit=dev

# Expose port (if you add a web server later)
EXPOSE 3000

# Note: Running Electron GUI in Docker requires X11 forwarding
# This is mainly for the web components or headless testing
CMD ["node", "dist/main/main.js"]
