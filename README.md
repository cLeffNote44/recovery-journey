# Recovery Journey

**Substance abuse recovery management platform built for clinical compliance.**

![Build Status](https://img.shields.io/github/actions/workflow/status/recovery-journey/recovery-journey/ci.yml?branch=main&label=CI)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![Tests](https://img.shields.io/badge/tests-805%20passing-brightgreen)
![HIPAA](https://img.shields.io/badge/HIPAA-compliant-blue)
![42 CFR Part 2](https://img.shields.io/badge/42%20CFR%20Part%202-compliant-blue)

Recovery Journey is an integrated platform for substance abuse treatment facilities that connects clinical staff, administrators, and patients through three purpose-built applications. HIPAA and 42 CFR Part 2 compliance is foundational to the architecture -- not an afterthought bolted onto a generic framework.

---

## Key Features

### Facility Management

- Role-based access control with three staff tiers: Super Admin, Facility Admin, and Counselor
- Centralized dashboard with real-time census, treatment metrics, and compliance indicators
- Multi-facility support with isolated data boundaries
- Comprehensive audit logging with 7-year retention for regulatory requirements

### Clinical Tools

- Treatment plan creation and management with structured progress tracking
- Secure real-time messaging between staff and patients (WebSocket-based, end-to-end)
- Patient detail views with segmented clinical data (demographics, treatment history, assessments)
- Rich text clinical notes with automatic PHI sanitization

### Patient Companion App

- Sobriety day tracking with milestone recognition
- Daily mood check-ins and trend visualization
- Craving management tools with coping strategy suggestions
- HALT assessments (Hungry, Angry, Lonely, Tired)
- Offline-first architecture -- full functionality without connectivity, with automatic cloud sync when online
- Biometric authentication (Face ID / Touch ID) on supported devices

### Security and Compliance

- Tokens held in memory only -- never persisted to localStorage or sessionStorage
- 15-minute inactivity timeout with 2-minute warning modal
- All PHI access logged with user, timestamp, action, resource, and fields viewed
- Input sanitization on every user-submitted field via DOMPurify
- Security headers, rate limiting, and request validation on all API routes

---

## Architecture Overview

```
                    +------------------+
                    |    PostgreSQL     |
                    +--------+---------+
                             |
                    +--------+---------+
                    |  Backend (API)   |
                    |  Fastify + WS    |
                    +---+----------+---+
                        |          |
              +---------+--+  +---+---------+
              |  Journey    |  |   Recover   |
              |  (Desktop)  |  |   (Mobile)  |
              |  Electron   |  |  Capacitor  |
              +-------------+  +-------------+
```

| Application | Purpose | Users |
|-------------|---------|-------|
| **Backend** | REST API and WebSocket server handling authentication, data, and real-time messaging | -- |
| **Journey** | Desktop application for day-to-day clinical operations and facility administration | Counselors, facility admins, super admins |
| **Recover** | Mobile and web companion app for patients in active recovery | Patients |

The monorepo uses npm workspaces. All three applications share TypeScript, Zod validation schemas, and a consistent Tailwind CSS design system with dark mode support.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| API Server | Fastify with JWT authentication and WebSocket support |
| Database | PostgreSQL with Prisma ORM |
| Desktop App | Electron + React + Vite |
| Mobile/Web App | React + Capacitor 7 (iOS, Android, Web) |
| State Management | Zustand (both frontend apps) |
| Data Fetching | React Query with centralized query key management |
| Validation | Zod (runtime type checking across all workspaces) |
| Styling | Tailwind CSS 4 with Radix UI primitives (Recover) |
| Routing | React Router (Journey), Wouter (Recover) |
| Testing | Vitest (unit/integration), Playwright (E2E) |
| CI/CD | GitHub Actions, Docker Compose |

---

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL (local instance or Docker)

### Install

```bash
git clone <repository-url>
cd recovery-journey
npm install
```

### Database Setup

```bash
# Copy environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

cd Backend
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts    # Load test data
```

### Run Development Servers

```bash
# From the repository root:
npm run dev:backend       # API server on port 8000
npm run dev:journey       # Desktop app on port 5173
npm run dev:recover       # Patient app on port 5174
```

Or start everything at once with Docker:

```bash
npm run docker:up
```

---

## Testing

Recovery Journey has **805 automated tests** across all workspaces.

| Workspace | Type | Count | Command |
|-----------|------|-------|---------|
| Backend | Unit / Integration | -- | `npm run test --workspace=Backend` |
| Journey | Unit | 395 | `npm run test --workspace=Journey` |
| Journey | E2E (Playwright) | 117 | `cd Journey && npm run test:e2e` |
| Recover | Unit | -- | `npm run test --workspace=Recover` |

```bash
# Run all Journey tests (unit + E2E)
cd Journey && npm run test:all

# Run E2E tests with visible browser
cd Journey && npm run test:e2e:headed
```

---

## Deployment

### Docker

A full Docker Compose configuration is provided for local and staging environments:

```bash
docker-compose up -d
```

### Production

```bash
./scripts/deploy.sh staging       # Deploy to staging
./scripts/deploy.sh production    # Deploy to production
./scripts/rollback.sh production  # Rollback if needed
```

CI runs automatically on push via GitHub Actions (`.github/workflows/ci.yml`), executing lint, test, and build steps for each workspace.

---

## Documentation

Detailed documentation is available in the `docs/` directory:

- Architecture decisions and data flow diagrams
- API endpoint reference
- Compliance and audit logging specifications
- Deployment and infrastructure guides

Each workspace also contains its own `CLAUDE.md` with workspace-specific patterns and conventions.

---

## Security and Compliance

Recovery Journey is designed from the ground up to satisfy **HIPAA** and **42 CFR Part 2** requirements for substance abuse treatment records, which carry stricter protections than standard medical data.

| Requirement | Implementation |
|-------------|----------------|
| Authentication tokens | In-memory only; never written to disk or browser storage |
| Session management | 15-minute inactivity auto-logout with advance warning |
| Audit trail | Every PHI access logged with user, timestamp, action, resource, and field-level detail |
| Data retention | Audit logs retained for 7 years per federal requirements |
| Input sanitization | All user-submitted HTML processed through DOMPurify before storage or rendering |
| API security | Security headers, rate limiting, and request validation on every route |
| Access control | Role-based permissions enforced at API and UI layers |
| Logout tracking | All logout events include reason classification (manual, session timeout, forced) |

---

## Screenshots

<!-- Screenshots coming soon -->
<!-- Planned: Dashboard overview, treatment plan editor, patient app sobriety tracker, secure messaging -->

---

## License

Proprietary -- All Rights Reserved.

This software is the confidential property of Recovery Journey. Unauthorized copying, distribution, or use of this software, in whole or in part, is strictly prohibited. See [LICENSE](./LICENSE) for details.
