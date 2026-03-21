# Development Setup Guide

This guide covers setting up the Recovery Journey development environment from scratch.

---

## Prerequisites

| Requirement | Minimum Version | Check Command |
|-------------|----------------|---------------|
| Node.js | 20.0.0 | `node --version` |
| npm | 10.0.0 | `npm --version` |
| PostgreSQL | 14+ | `psql --version` |
| Git | 2.30+ | `git --version` |

Optional (for containerized development):

| Requirement | Purpose |
|-------------|---------|
| Docker | Run all services in containers |
| Docker Compose | Orchestrate multi-service environment |

---

## 1. Clone and Install

```bash
git clone <repository-url> "Recovery Journey"
cd "Recovery Journey"
npm install
```

The `npm install` command installs dependencies for all three workspaces (Backend, Journey, Recover) via npm workspaces.

---

## 2. Database Setup

### 2.1 Create the PostgreSQL Database

If PostgreSQL is installed locally:

```bash
# Create the database
createdb recovery_journey

# Or via psql
psql -U postgres -c "CREATE DATABASE recovery_journey;"
```

### 2.2 Configure Environment Variables

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

At minimum, set these values in `.env`:

```bash
DB_USER=postgres
DB_PASSWORD=your-local-password
DB_NAME=recovery_journey
DB_PORT=5432

JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production

BACKEND_PORT=8000
JOURNEY_PORT=5173
RECOVER_PORT=5174
```

The Backend reads `DATABASE_URL` directly. If not set, it is constructed from the individual `DB_*` variables. For explicit control:

```bash
DATABASE_URL=postgresql://postgres:your-local-password@localhost:5432/recovery_journey?schema=public
```

### 2.3 Generate Prisma Client and Run Migrations

```bash
cd Backend
npx prisma generate
npx prisma migrate dev
```

The `migrate dev` command applies all pending migrations and creates the database tables.

### 2.4 Seed Test Data (Optional)

```bash
cd Backend
npx tsx prisma/seed.ts
```

This populates the database with sample facilities, staff accounts, patients, and test data for development.

### 2.5 Browse the Database (Optional)

```bash
cd Backend
npx prisma studio
```

Opens a visual database browser at `http://localhost:5555`.

---

## 3. Running the Applications

### 3.1 Start Each App Individually

Each command should be run from the repository root:

```bash
# Backend API server (port 8000)
npm run dev:backend

# Journey staff desktop app (port 5173)
npm run dev:journey

# Recover patient app (port 5174)
npm run dev:recover
```

The Backend must be running before Journey or Recover can make API calls. Start it first.

### 3.2 Start All Services Together

```bash
npm run docker:up
```

This uses Docker Compose to start PostgreSQL, the Backend, and optionally the frontend apps.

### 3.3 Typical Development Workflow

1. Start the Backend: `npm run dev:backend`
2. Start the app you are working on: `npm run dev:journey` or `npm run dev:recover`
3. The Backend watches for file changes and reloads automatically (tsx watch mode).
4. The frontend apps use Vite with hot module replacement.

---

## 4. Docker Alternative

If you prefer not to install PostgreSQL locally, Docker Compose provides the full environment:

```bash
# Start database and backend
docker-compose up -d db backend

# Run migrations
docker-compose run --rm migrate

# Seed test data (optional)
docker-compose --profile seed up seed

# Start frontend apps (optional)
docker-compose --profile frontend up -d journey recover

# Stop all services
docker-compose down

# Stop and remove database volume (full reset)
docker-compose down -v
```

Service ports (configurable via `.env`):

| Service | Default Port |
|---------|-------------|
| PostgreSQL | 5432 |
| Backend API | 8000 |
| Journey | 5173 |
| Recover | 5174 |

---

## 5. Running Tests

### 5.1 Unit Tests

All workspaces use Vitest:

```bash
# Backend tests (watch mode)
npm run test --workspace=Backend

# Journey unit tests (395 tests, watch mode)
npm run test --workspace=Journey

# Recover tests (watch mode)
npm run test --workspace=Recover
```

### 5.2 Journey E2E Tests

Playwright end-to-end tests for the Journey app:

```bash
cd Journey

# Headless (CI mode)
npm run test:e2e

# With visible browser
npm run test:e2e:headed

# All tests (unit + E2E, 512 total)
npm run test:all
```

### 5.3 Linting

```bash
# Lint all workspaces
npm run lint
```

ESLint and Prettier are enforced via a Husky pre-commit hook on staged files.

### 5.4 Build

```bash
# Build all workspaces
npm run build

# Package Journey for macOS
cd Journey && npm run package:mac
```

---

## 6. Common Issues and Solutions

### Port already in use

```
Error: listen EADDRINUSE :::8000
```

Another process is using the port. Find and stop it:

```bash
lsof -i :8000
kill -9 <PID>
```

Or change the port in `.env`:

```bash
BACKEND_PORT=8001
```

### Prisma client out of date

```
Error: @prisma/client does not match prisma schema
```

Regenerate the client after schema changes:

```bash
cd Backend
npx prisma generate
```

### Migration drift or conflicts

```
Error: The migration ... has not been applied to the database
```

Reset the development database (destroys all data):

```bash
cd Backend
npx prisma migrate reset
```

### Cannot connect to PostgreSQL

Verify PostgreSQL is running:

```bash
pg_isready
```

Check that `DATABASE_URL` in your `.env` matches your PostgreSQL configuration (host, port, user, password, database name).

### Node.js version too old

The project requires Node.js 20+. Check your version:

```bash
node --version
```

Use a version manager (nvm, fnm, volta) to install and switch to Node.js 20:

```bash
nvm install 20
nvm use 20
```

### Docker containers fail to start

If the backend container cannot reach the database:

```bash
# Check container status
docker-compose ps

# View backend logs
docker-compose logs backend

# Restart from scratch
docker-compose down -v && docker-compose up -d
```

### Journey Electron app does not open

Ensure the backend is running first. The Electron app needs the API server to be available at the configured `VITE_API_URL`.

---

## 7. Environment Variables Reference

All environment variables are documented in the following files:

- **Root**: `.env.example` -- Database, JWT, port, CORS, and rate limiting configuration
- **Backend**: Uses `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and other server-side variables
- **Journey**: Uses `VITE_API_URL` and `VITE_WS_URL` (Vite-prefixed for client-side access)
- **Recover**: Uses `VITE_FACILITY_API_URL` (Vite-prefixed)

### Key Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | (constructed) | PostgreSQL connection string |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | (none) | Database password |
| `DB_NAME` | `recovery_journey` | Database name |
| `DB_PORT` | `5432` | Database port |
| `JWT_SECRET` | (none) | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | (none) | Secret for signing refresh tokens |
| `JWT_EXPIRES_IN` | `1h` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `BACKEND_PORT` | `8000` | Backend API server port |
| `JOURNEY_PORT` | `5173` | Journey dev server port |
| `RECOVER_PORT` | `5174` | Recover dev server port |
| `CORS_ORIGINS` | (varies) | Comma-separated allowed origins |
| `RATE_LIMIT_MAX` | `100` | Max requests per window per IP |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window in milliseconds |

For production environment variables, see `docs/DEPLOYMENT.md`.
