# Deployment Guide

This document covers deployment procedures for the Recovery Journey platform, including staging/production environments, Docker configuration, rollback procedures, and operational monitoring.

---

## Prerequisites

- Docker and Docker Compose installed on the deployment server
- Node.js >= 20.0.0 and npm >= 10.0.0 (for local builds and migrations)
- Git access to the repository
- SSH access to the deployment server

---

## Environments

| Environment | Backend URL | Branch Restriction |
|-------------|-------------|--------------------|
| Staging | `https://staging-api.recoveryjourney.app` | Any branch |
| Production | `https://api.recoveryjourney.app` | `main` only (enforced by deploy script) |

---

## Configuration

### Required Environment Variables

These must be set on the deployment server via host environment or a secrets manager. They must not be committed to source control.

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

### Environment-Specific Files

- `deploy/staging/.env.staging` -- Staging-specific non-secret overrides
- `deploy/production/.env.production` -- Production-specific non-secret overrides

These files should contain only non-secret configuration. All secrets must be injected via the host environment or a secrets manager.

---

## Deploy

### Using the Deploy Script

```bash
# Staging deployment
./scripts/deploy.sh staging

# Production deployment (requires main branch, prompts for confirmation)
./scripts/deploy.sh production
```

### Deploy Script Options

| Flag | Effect |
|------|--------|
| `--dry-run` | Preview the deployment without executing |
| `--skip-tests` | Skip the test suite |
| `--skip-migrations` | Skip database migrations |
| `--force` | Skip confirmation prompts (production) |

### What the Deploy Script Does

1. **Checks prerequisites** -- Verifies Docker, Git, Node.js are available; confirms correct branch and clean working tree.
2. **Runs tests** -- Executes `npm test` in the Backend workspace (skippable with `--skip-tests`).
3. **Builds Docker images** -- Tags images with the git version and environment name.
4. **Runs migrations** -- Executes `npx prisma migrate deploy` to apply pending schema changes (skippable with `--skip-migrations`).
5. **Deploys backend** -- Zero-downtime deployment via Docker Compose: scales up a new container, verifies health, then drains the old container.
6. **Verifies health** -- Polls the `/health` endpoint up to 30 times at 5-second intervals.
7. **Cleans up** -- Prunes Docker images older than 7 days.

---

## Docker Compose Configuration

### Development

```bash
docker-compose up -d
```

Uses `docker-compose.yml` with:
- All ports exposed (DB on 5432, Backend on 8000, Journey on 5173, Recover on 5174)
- Source volumes mounted for hot-reload
- Development-mode environment variables

### Production

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

The production override (`docker-compose.prod.yml`) applies:
- Database port not exposed externally
- No source volume mounts (uses built image only)
- Resource limits enforced (see table below)
- JSON-structured logging with rotation

### Services

| Service | Image | Health Check | Notes |
|---------|-------|-------------|-------|
| `db` | postgres:16-alpine | `pg_isready` | Persistent volume for data |
| `backend` | Custom (Fastify) | `GET /health` | Depends on db health |
| `migrate` | Custom (one-shot) | N/A | Profile: `migrate` |
| `seed` | Custom (one-shot) | N/A | Profile: `seed` |
| `journey` | Custom (Vite) | N/A | Profile: `frontend` |
| `recover` | Custom (Vite) | N/A | Profile: `frontend` |

### Resource Limits (Production)

| Service | CPU Limit | Memory Limit | Memory Reserved |
|---------|-----------|-------------|-----------------|
| Database | 2 cores | 2 GB | 512 MB |
| Backend | 2 cores | 1 GB | 256 MB |

---

## Rollback

### Using the Rollback Script

```bash
# Rollback to the previous version
./scripts/rollback.sh staging
./scripts/rollback.sh production

# Rollback to a specific version
./scripts/rollback.sh staging v1.2.3
./scripts/rollback.sh production v1.2.3
```

### What the Rollback Script Does

1. Lists available Docker image version tags.
2. Defaults to the second-most-recent tag (the previous deployment).
3. Swaps the running container to the target version.
4. Verifies the health check passes.

---

## Database Operations

### Migrations

Migrations run automatically during deployment unless `--skip-migrations` is passed.

```bash
# Apply pending migrations (non-destructive)
cd Backend && npx prisma migrate deploy

# Check migration status
cd Backend && npx prisma migrate status
```

### Backup

```bash
./scripts/backup.sh
```

### Restore

```bash
./scripts/restore.sh <backup-file>
```

---

## Health Checks

The Backend exposes endpoints for load balancers and orchestrators:

| Endpoint | Purpose | Recommended Use |
|----------|---------|-----------------|
| `GET /health` | Basic liveness | Load balancer health check |
| `GET /health/live` | Liveness probe | Kubernetes `livenessProbe` |
| `GET /health/ready` | Readiness (checks DB connection) | Kubernetes `readinessProbe` |
| `GET /health/detailed` | Full status with DB latency and uptime | Monitoring dashboards |

---

## Logging

Production logging uses JSON format via Pino with Docker's `json-file` driver:

- Maximum 10 MB per log file, 3 files retained per container
- View logs: `docker-compose logs -f backend`
- Filter by level or search for request IDs in structured JSON output

---

## Client Application Distribution

### Journey Desktop App (Electron)

```bash
cd Journey
npm run package:mac    # macOS .dmg
npm run package:win    # Windows .exe
npm run package:linux  # Linux .AppImage + .deb
```

Auto-updates are configured via `electron-updater`, publishing to GitHub releases. Users receive update notifications within the application.

### Recover Mobile App (Capacitor)

```bash
cd Recover
npm run build                     # Web build (dist/)
npx cap sync android              # Sync to Android project
npx cap open android              # Open in Android Studio for APK/AAB build
```

The web build can also be deployed to any static hosting service for PWA access.

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:

1. **Lint** -- ESLint across all workspaces
2. **Test** -- Vitest unit tests per workspace
3. **Build** -- Production builds for all workspaces

Deployment to staging or production is triggered manually via `./scripts/deploy.sh`.

---

## Security Considerations for Deployment

- All secrets (database credentials, JWT secrets) must be injected via environment variables or a secrets manager. They must never appear in committed files.
- The `.env.example` file at the repository root documents all required variables with placeholder values.
- Production deployments enforce the `main` branch restriction.
- CORS origins must be explicitly listed; wildcard origins are not permitted in staging or production.
- The database port must not be exposed externally in production (handled by `docker-compose.prod.yml`).
- Audit log retention is configured via `AUDIT_LOG_RETENTION_DAYS` (default: 2555 days / ~7 years, per HIPAA requirements).
