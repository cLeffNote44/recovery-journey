# Deployment Guide

## Prerequisites

- Docker with the Compose v2 plugin, **v2.24.4 or newer** (the production
  override uses the `!reset` merge tag; Compose v1 cannot parse it and the
  scripts refuse to use it)
- Node.js >= 20.0.0 and npm >= 10.0.0 (LTS lines only: 20/22/24)
- Git
- Access to the deployment server

## How deployment works

The backend deploys as a **tagged container image** pulled from GitHub
Container Registry (`ghcr.io/cleffnote44/recovery-journey/backend`), not by
rebuilding from source on the server. Every deploy records its tag in
`/opt/recovery-journey/.deployed_version` (previous tag in
`.deployed_version.previous`), which is what makes rollback an actual tag
swap instead of a rebuild.

| Environment | Backend URL | Trigger |
|------------|------------|-------------------|
| Staging | `https://staging-api.recoveryjourney.app` | Push to `main` (CD) or manual dispatch |
| Production | `https://api.recoveryjourney.app` | Push a `v*` tag (CD) or manual dispatch from `main` |

Both environments run the same compose configuration:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml <command>
```

`docker-compose.prod.yml` is an **override** file — it cannot start the stack
by itself and must always be combined with the base file as shown above.

## Server setup (one-time)

1. Clone the repository to `/opt/recovery-journey`.
2. Copy the environment template and fill in real values:
   ```bash
   cp deploy/production/.env.production.example /opt/recovery-journey/.env   # or staging template
   chmod 600 /opt/recovery-journey/.env
   ```
   docker compose reads `.env` automatically; `scripts/backup.sh` and
   `scripts/restore.sh` also source it (so cron/SSH invocations work).
   The compose override fails fast if a required value is missing.
3. Confirm the templates' invariants: `NODE_ENV=production` (also on staging —
   `staging` is not a valid value), `CORS_ORIGINS` (plural), port 8000.
4. **Bootstrap the database before the first CD deploy.** The pipeline takes a
   mandatory backup before deploying, which requires the database container to
   be running:
   ```bash
   cd /opt/recovery-journey
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d db
   ```
   (On a brand-new host with an empty database this first backup is of an empty
   database — that is expected.)
5. **Optional but recommended:** log the server into GHCR with a read-only
   fine-grained PAT (`docker login ghcr.io`). The CD pipeline logs in with an
   ephemeral token that expires when the job ends, so emergency
   `./scripts/rollback.sh` pulls of older tags at 3 AM depend on either this
   persistent login or the image still being in the local cache.

### Required GitHub Actions secrets

All of these must be **repository-level** secrets (the scheduled backup
workflow runs without an `environment:` context and cannot read
environment-scoped secrets):

| Secret | Purpose |
|--------|---------|
| `DEPLOY_SSH_KEY` | Private key for the deploy user |
| `DEPLOY_USER` | SSH user on the deploy hosts |
| `STAGING_HOST` / `PRODUCTION_HOST` | Deploy host addresses. Workflows fail closed if the secret for the target environment is unset — there is no fallback to the other host. |
| `SSH_KNOWN_HOSTS` | Pinned host keys — run `ssh-keyscan <host>` for each host and store the combined output. Deploys fail without it (no `StrictHostKeyChecking=no` anywhere). |

## Deploy

### Via CD (preferred)

- **Staging**: push to `main`. The pipeline builds and pushes the backend
  image, then on the server: checks out the commit, takes a database backup
  (hard failure aborts the deploy), pulls the image, runs migrations, and
  starts the stack. Health checks run on the host and the public URL; failure
  triggers an automatic rollback to the previously recorded tag.
- **Production**: push a `v*` tag. Same flow against the production host,
  plus a GitHub release on success.

### Manually on the server

```bash
# Build from the current checkout and deploy
./scripts/deploy.sh staging
./scripts/deploy.sh production     # requires main branch, prompts for confirmation

# Deploy an image tag already in the registry (no local build)
./scripts/deploy.sh production --pull --image-tag 1.8.0

# Options
./scripts/deploy.sh staging --dry-run          # Preview without executing
./scripts/deploy.sh staging --with-tests       # Also run the Backend test suite locally
./scripts/deploy.sh staging --skip-migrations  # Skip DB migrations
./scripts/deploy.sh production --force         # Skip confirmation prompts
```

### What deploy.sh does

1. **Checks prerequisites** — Docker, Compose v2, Git, Node.js, correct branch, clean working tree
2. **Optionally runs tests** — opt-in via `--with-tests` (`npm run test:run`,
   single run). CI is the authoritative test gate; deployment servers
   typically have neither the dev toolchain nor a reachable test database.
3. **Prepares the image** — builds the `production` target tagged
   `ghcr.io/cleffnote44/recovery-journey/backend:<git describe>`, or pulls
   `--image-tag` from the registry
4. **Runs migrations** — `docker compose run --rm migrate` (inside the compose
   network; the production DB publishes no host port)
5. **Starts the stack** — `up -d --no-build` and waits for the container
   healthcheck
6. **Verifies health** — `http://localhost:8000/health` is the gate; the
   public URL is checked as a warning (the reverse proxy may be managed
   separately)
7. **Records the deployed tag** — `.deployed_version` / `.deployed_version.previous`
8. **Cleans up** — prunes Docker images older than 7 days

## Rollback

```bash
# Roll back to the previous deploy (from .deployed_version.previous)
./scripts/rollback.sh staging
./scripts/rollback.sh production

# Roll back to a specific image tag
./scripts/rollback.sh production 1.7.2
```

The script pulls the tag if it isn't cached locally, swaps the backend
container to it, verifies `http://localhost:8000/health`, and updates the
version records. **Database migrations are not rolled back automatically** —
if the bad deploy included schema changes, restore from the pre-deploy backup
or apply a manual down-migration.

## Database

### Migrations

Migrations run inside the compose network using the same image as the backend
(the Prisma CLI ships in the production image for exactly this purpose):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm migrate
```

They run automatically during deploys unless `--skip-migrations` is passed.

### Backup

```bash
./scripts/backup.sh production            # labeled, encrypted, compressed
./scripts/backup.sh staging --quiet       # errors only (used by CD)
```

- When the `recovery-journey-db` container is running, the dump is taken via
  `docker exec` (the production DB has no published port).
- Backups are AES-256 encrypted with `BACKUP_ENCRYPTION_KEY` (falls back to
  `ENCRYPTION_KEY`); the script **fails** if neither is set.
- A scheduled workflow (`backup.yml`) runs nightly for both environments and
  fails loudly if no encrypted backup is produced.
- Set `BACKUP_S3_BUCKET` for offsite copies — strongly recommended; a backup
  that lives only on the database host does not survive host loss.
- The CD pipeline takes a backup before every deploy and **aborts the deploy
  if the backup fails**.

### Restore

```bash
./scripts/restore.sh backups/recovery_journey_production_20260612_031700.sql.gz.enc
```

Restore is container-aware like backup, takes an encrypted pre-restore dump of
the current database first, and streams the SQL through `psql -v ON_ERROR_STOP=1`.
**Test the restore path regularly** — an untested backup is not a backup.

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
- View logs: `docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend`

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
