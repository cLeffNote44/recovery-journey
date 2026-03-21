# Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Node.js >= 20.0.0 and npm >= 10.0.0
- Git
- Access to the deployment server

## Environments

| Environment | Backend URL | Deploy from branch |
|------------|------------|-------------------|
| Staging | `https://staging-api.recoveryjourney.app` | Any branch |
| Production | `https://api.recoveryjourney.app` | `main` (enforced) |

## Configuration

### Required Environment Variables

These must be set on the deployment server (not committed to source):

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/recovery_journey"
DB_USER="recovery_prod"
DB_PASSWORD="<strong-password>"
DB_NAME="recovery_journey"

# JWT (generate with: openssl rand -hex 64)
JWT_SECRET="<64-char-hex>"
JWT_REFRESH_SECRET="<64-char-hex>"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS (comma-separated allowed origins)
CORS_ORIGINS="https://app.recoveryjourney.app,https://admin.recoveryjourney.app"

# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

### Environment Files

- `deploy/staging/.env.staging` — Staging-specific overrides
- `deploy/production/.env.production` — Production-specific overrides

These files should only contain non-secret configuration. All secrets must be injected via the host environment or a secrets manager.

## Deploy

```bash
# Staging
./scripts/deploy.sh staging

# Production (requires main branch, prompts for confirmation)
./scripts/deploy.sh production

# Options
./scripts/deploy.sh staging --dry-run          # Preview without executing
./scripts/deploy.sh staging --skip-tests       # Skip test suite
./scripts/deploy.sh staging --skip-migrations  # Skip DB migrations
./scripts/deploy.sh production --force         # Skip confirmation prompts
```

### What deploy.sh does

1. **Checks prerequisites** — Docker, Git, Node.js, correct branch, clean working tree
2. **Runs tests** — `npm test` in Backend (skippable with `--skip-tests`)
3. **Builds Docker images** — Tagged with git version + environment name
4. **Runs migrations** — `npx prisma migrate deploy` (skippable with `--skip-migrations`)
5. **Deploys backend** — Zero-downtime via docker-compose scale (2 → 1)
6. **Verifies health** — Polls `/health` endpoint up to 30 times (5s intervals)
7. **Cleans up** — Prunes Docker images older than 7 days

### Docker Compose Files

- `docker-compose.yml` — Development (exposes all ports, mounts volumes, dev config)
- `docker-compose.prod.yml` — Production override (no port exposure for DB, resource limits, no volume mounts)

Production usage:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Rollback

```bash
# Rollback to previous version
./scripts/rollback.sh staging
./scripts/rollback.sh production

# Rollback to specific version
./scripts/rollback.sh staging v1.2.3
```

The rollback script:
1. Lists available Docker image versions
2. Defaults to the second-most-recent tag (previous deploy)
3. Swaps the running container to the target version
4. Verifies health check

## Database

### Migrations

```bash
# Apply pending migrations (non-destructive)
cd Backend && npx prisma migrate deploy

# Check migration status
cd Backend && npx prisma migrate status
```

Migrations run automatically during deploy unless `--skip-migrations` is passed.

### Backup

```bash
./scripts/backup.sh
```

### Restore

```bash
./scripts/restore.sh <backup-file>
```

## Health Checks

The Backend exposes health endpoints for monitoring:

| Endpoint | Purpose | Use for |
|----------|---------|---------|
| `GET /health` | Basic liveness | Load balancer |
| `GET /health/live` | Liveness probe | Kubernetes `livenessProbe` |
| `GET /health/ready` | Readiness (checks DB) | Kubernetes `readinessProbe` |
| `GET /health/detailed` | Full status + DB latency | Monitoring dashboards |

## Resource Limits (Production)

Configured in `docker-compose.prod.yml`:

| Service | CPU Limit | Memory Limit | Memory Reserved |
|---------|-----------|-------------|-----------------|
| Database | 2 cores | 2 GB | 512 MB |
| Backend | 2 cores | 1 GB | 256 MB |

## Logging

Production logging uses JSON format (via Pino) with Docker's `json-file` driver:
- Max 10 MB per log file, 3 files retained
- View logs: `docker-compose logs -f backend`

## Journey Desktop App

The Journey Electron app is distributed separately:

```bash
cd Journey
npm run package:mac    # macOS .dmg
npm run package:win    # Windows .exe
npm run package:linux  # Linux .AppImage + .deb
```

Auto-updates are configured via `electron-updater` publishing to GitHub releases.

## Recover Mobile App

```bash
cd Recover
npm run build                     # Web build (dist/)
npx cap sync android              # Sync to Android project
npx cap open android              # Open in Android Studio for APK/AAB build
```

The web build can also be deployed to any static hosting for PWA access.
