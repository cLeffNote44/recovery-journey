# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Recovery Journey is a **HIPAA & 42 CFR Part 2 compliant** substance abuse recovery management platform. It is an npm workspaces monorepo with three apps:

- **Backend** — Fastify REST API + WebSocket server (port 8000)
- **Journey** — Electron desktop app for clinicians/staff (port 5173)
- **Recover** — React + Capacitor mobile/web app for patients (port 5174)

## Commands

### Setup
```bash
npm install                              # All workspaces
npm run dev:backend                      # Requires DB setup first (see below)
```

### Database (Backend workspace)
```bash
cd Backend
npx prisma generate                      # Generate Prisma client
npx prisma migrate dev                   # Run migrations
npx tsx prisma/seed.ts                   # Seed test data
npx prisma studio                        # Visual DB browser
```

### Development
```bash
npm run dev:backend                      # Backend (Fastify + tsx watch)
npm run dev:journey                      # Journey (Vite + Electron)
npm run dev:recover                      # Recover (Vite)
npm run docker:up                        # All services via Docker
```

### Testing
```bash
npm run test --workspace=Backend         # Backend tests (vitest watch)
npm run test --workspace=Journey         # Journey unit tests (395 tests, watch)
npm run test --workspace=Recover         # Recover tests (vitest watch)

# Journey E2E (from Journey/)
cd Journey
npm run test:e2e                         # Playwright (117 tests)
npm run test:e2e:headed                  # With visible browser
npm run test:all                         # Unit + E2E (512 total)
```

### Linting & Building
```bash
npm run lint                             # ESLint all workspaces
npm run build                            # Build all workspaces
cd Journey && npm run package:mac        # Package Electron for macOS
```

### Deployment
```bash
./scripts/deploy.sh staging|production
./scripts/rollback.sh staging|production
```

## Architecture

### Backend (`Backend/`)
- **Fastify** with `@fastify/jwt` auth, `@fastify/websocket` for real-time messaging
- **Prisma ORM** with PostgreSQL — schema at `Backend/prisma/schema.prisma`
- Routes at `Backend/src/routes/` (auth, patients, messages, treatment-plans, dashboard, admin, sync)
- Middleware for security headers, rate limiting, request sanitization, audit logging
- Staff roles: SUPER_ADMIN, FACILITY_ADMIN, COUNSELOR

### Journey (`Journey/`)
- Electron main process at `Journey/electron/main.ts`, preload at `electron/preload.ts`
- React entry at `Journey/src/main.tsx`, routes in `src/App.tsx`
- **State**: Zustand stores in `src/stores/` — tokens kept in memory only (HIPAA requirement)
- **Data fetching**: React Query hooks in `src/hooks/` with centralized query keys in `src/lib/queryClient.ts`
- **Validation**: Zod schemas in `src/validation/schemas.ts`
- **API layer**: Axios with automatic token refresh via interceptors in `src/services/api.ts`
- **Audit logging**: `src/services/auditLog.ts` — batch-queued, critical events sent immediately
- Reusable UI components in `src/components/ui/` (Modal, Table, Form, Card, Pagination)
- SuperAdmin components are modular in `src/components/SuperAdmin/`
- PatientDetail split into 12 focused sub-components
- See `Journey/CLAUDE.md` for detailed Journey-specific patterns

### Recover (`Recover/`)
- React + Capacitor 7 for iOS/Android native features (biometric auth, notifications)
- **Routing**: Wouter (lightweight)
- **State**: Zustand stores in `src/stores/` (13 stores, local-first architecture)
- **UI**: Radix UI primitives + Tailwind CSS 4
- Extensive utility library in `src/lib/` (55 modules)
- Web Workers for background processing in `src/workers/`

### Cross-Cutting Patterns
- TypeScript + Zod runtime validation throughout
- Environment validation at startup in each app's `src/config/`
- Error boundaries for crash protection
- Tailwind CSS with dark mode support (`dark:` prefix)
- All three apps use Vitest for testing

## HIPAA Compliance (Critical)

These are not optional patterns — they are compliance requirements:

- **Tokens in memory only** — never persist access/refresh tokens to localStorage or sessionStorage
- **Session timeout** — 15-minute inactivity auto-logout with 2-minute warning
- **Audit logging** — all PHI access must be logged (user, timestamp, action, resource, fields viewed)
- **Rich text sanitization** — all user HTML input goes through DOMPurify (`src/lib/sanitize.ts`)
- **Logout requires reason parameter**: `logout('manual')`, `logout('session_timeout')`, or `logout('forced')`

## Environment

- Node >= 20.0.0, npm >= 10.0.0
- PostgreSQL for Backend
- `.env.example` at root has all variables; Backend runs on port 8000
- Vite env vars prefixed with `VITE_` in Journey and Recover
- Docker Compose available for full local environment (`docker-compose.yml`)

## CI/CD

- GitHub Actions: `.github/workflows/ci.yml` (lint + test + build per workspace)
- Husky pre-commit hook runs ESLint + Prettier on staged files
- Deployment via `scripts/deploy.sh` with staging/production environments

## Version Control & Release Process

**Repository**: `github.com/cLeffNote44/recovery-journey` (private)
**Current version**: See `package.json` root and `CHANGELOG.md`

### Versioning Rules (Semantic Versioning)

Follow [semver](https://semver.org/) — `MAJOR.MINOR.PATCH`:
- **PATCH** (1.0.x): Bug fixes, test fixes, dependency updates, documentation changes
- **MINOR** (1.x.0): New features, new pages, new API endpoints, UI enhancements
- **MAJOR** (x.0.0): Breaking changes to API, database schema changes requiring migration, architecture changes

### When Pushing Changes — MANDATORY Checklist

After committing and pushing changes, **always** complete ALL of the following steps. No exceptions — every version gets every step, even small patches:

1. **Update the version** in root `package.json` according to semver
2. **Update `CHANGELOG.md`** — add a new version entry at the top with:
   - Date in format `YYYY-MM-DD`
   - Sections as needed: `Added`, `Changed`, `Fixed`, `Removed`, `Security`
   - Brief descriptions of what changed and why
3. **Commit** using conventional commit format: `feat|fix|docs|chore(scope): description`
4. **Create a git tag**: `git tag vX.Y.Z`
5. **Push code and tag**: `git push && git push origin vX.Y.Z`
6. **ALWAYS create a GitHub release**: `gh release create vX.Y.Z --title "Recovery Journey vX.Y.Z" --notes "..."` with release notes from the changelog. **Every single version MUST have a corresponding GitHub release — no exceptions.**

### Commit Message Format (enforced by husky hook)

```
type(scope): description (max 100 chars)

Optional body with details.
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Marketing Website

- **Vercel project**: `website-eight-beta-84.vercel.app`
- **Planned domain**: `recoverjourney.com` (not yet purchased)
- Deploy with: `cd website && vercel --yes --prod`
- Website is NOT part of the npm workspaces — it's a standalone Next.js project in `website/`
