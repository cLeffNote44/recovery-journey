# System Architecture

Recovery Journey is a HIPAA and 42 CFR Part 2 compliant substance abuse recovery management platform. This document describes the system architecture for technical evaluators.

---

## 1. System Overview

The platform consists of three applications in an npm workspaces monorepo:

| Application | Role | Technology | Users |
|-------------|------|------------|-------|
| **Backend** | REST API + WebSocket server | Fastify, Prisma, PostgreSQL | All clients |
| **Journey** | Desktop staff portal | Electron, React, Zustand | Clinicians, facility admins, super admins |
| **Recover** | Mobile/web patient app | React, Capacitor 7, Zustand | Patients in recovery |

Staff use the Journey desktop application to manage patients, send messages, create treatment plans, and review recovery data. Patients use the Recover mobile app to log daily check-ins, track cravings, set goals, and communicate with their counselor. The Backend serves as the central data authority, handling authentication, authorization, data persistence, real-time messaging, and HIPAA audit logging.

---

## 2. Component Architecture

### 2.1 Backend

```
Fastify Server (port 8000)
|
+-- Route Handlers
|   +-- /auth         (staff login, patient login, token refresh, 2FA)
|   +-- /patients     (CRUD, dashboard, registration keys)
|   +-- /messages     (conversations, send/receive, read receipts)
|   +-- /treatment-plans  (CRUD, phase management, assignment)
|   +-- /dashboard    (facility stats, alerts, appointments)
|   +-- /admin        (facilities, staff management, analytics)
|   +-- /sync         (check-ins, cravings, goals, batch sync)
|   +-- /health       (liveness, readiness, detailed probes)
|
+-- Middleware Pipeline
|   +-- CORS (configurable origins)
|   +-- Rate Limiting (per-IP, configurable window)
|   +-- Request Sanitization (input validation via Zod)
|   +-- JWT Authentication (@fastify/jwt)
|   +-- Role-Based Authorization (SUPER_ADMIN, FACILITY_ADMIN, COUNSELOR, Patient)
|   +-- Security Headers (HSTS, X-Frame-Options, CSP)
|   +-- Audit Logging (all PHI access recorded)
|
+-- WebSocket Layer (@fastify/websocket)
|   +-- Authenticated connections (JWT verified on upgrade)
|   +-- Real-time message delivery
|   +-- Connection management per patient-staff pair
|
+-- Data Layer
|   +-- Prisma ORM (type-safe queries, migrations)
|   +-- PostgreSQL 16 (primary data store)
|
+-- Audit Logging Pipeline
    +-- Batch queue (non-critical events buffered)
    +-- Immediate flush (critical events: login, PHI access)
    +-- Immutable append-only log (AuditLog table)
```

**Key design decisions:**
- Fastify chosen for low overhead and schema-based validation.
- Prisma provides type-safe database access with automatic migration management.
- All routes are scoped by facility. Counselors see only their facility's patients. Super admins have cross-facility access.
- Audit log entries record the acting user, timestamp, action type, resource accessed, specific PHI fields viewed, IP address, and session ID.

### 2.2 Journey (Staff Desktop Application)

```
Electron Shell
|
+-- Main Process (electron/main.ts)
|   +-- Window management
|   +-- Native menu integration
|   +-- Auto-update (electron-updater via GitHub releases)
|
+-- Preload Script (electron/preload.ts)
|   +-- Secure IPC bridge (contextBridge)
|   +-- Exposes limited API surface to renderer
|
+-- Renderer Process (React)
    |
    +-- App.tsx (routing)
    |
    +-- Zustand Stores (src/stores/)
    |   +-- Auth store (tokens held in memory only, never persisted)
    |   +-- UI state, filters, preferences
    |
    +-- React Query Hooks (src/hooks/)
    |   +-- Centralized query keys (src/lib/queryClient.ts)
    |   +-- Automatic cache invalidation
    |   +-- Background refetch on window focus
    |
    +-- Axios API Layer (src/services/api.ts)
    |   +-- Request/response interceptors
    |   +-- Automatic token refresh on 401
    |   +-- Request queuing during refresh
    |
    +-- Validation (src/validation/schemas.ts)
    |   +-- Zod schemas for all form inputs
    |
    +-- Audit Log Service (src/services/auditLog.ts)
    |   +-- Client-side batch queue
    |   +-- Critical events flushed immediately
    |   +-- Records PHI field access at the UI level
    |
    +-- Components
        +-- src/components/ui/ (Modal, Table, Form, Card, Pagination)
        +-- src/components/SuperAdmin/ (modular admin panels)
        +-- PatientDetail (12 focused sub-components)
```

**Key design decisions:**
- Electron provides native desktop features (auto-update, system tray, OS-level security).
- Tokens are stored exclusively in Zustand memory stores, never written to localStorage or sessionStorage (HIPAA requirement).
- 15-minute inactivity timeout with 2-minute warning modal triggers automatic logout.
- Logout always requires a reason parameter: `manual`, `session_timeout`, or `forced`.

### 2.3 Recover (Patient Mobile/Web Application)

```
React Application
|
+-- Capacitor 7 Native Bridge
|   +-- Biometric authentication (Face ID, fingerprint)
|   +-- Push notifications
|   +-- Secure storage (device keychain)
|   +-- Camera, haptics, status bar
|
+-- Routing (Wouter, lightweight)
|
+-- Zustand Stores (src/stores/, 13 stores)
|   +-- Local-first architecture
|   +-- Data persisted to device storage
|   +-- Offline queue for pending sync operations
|
+-- Sync Engine
|   +-- Detects connectivity changes
|   +-- Batches offline data (check-ins, cravings, goals)
|   +-- Sends to Backend /sync/batch on reconnect
|   +-- Conflict resolution (server wins, with local merge)
|
+-- Web Workers (src/workers/)
|   +-- Background data processing
|   +-- Encryption/decryption off main thread
|
+-- UI Layer
|   +-- Radix UI primitives
|   +-- Tailwind CSS 4 with dark mode
|
+-- Utility Library (src/lib/, 55 modules)
    +-- Date formatting, validation, encryption helpers
    +-- DOMPurify sanitization (src/lib/sanitize.ts)
```

**Key design decisions:**
- Local-first architecture ensures patients can log check-ins and cravings without connectivity. Data syncs when a connection is available.
- Capacitor 7 provides native access on iOS and Android while sharing a single React codebase.
- Web Workers handle computationally expensive tasks (encryption, data aggregation) off the main thread.

---

## 3. Data Flow Diagrams

### 3.1 Authentication Flow

```
Staff Login (Journey):

  Journey App                   Backend                      Database
  ----------                    -------                      --------
  |  POST /auth/staff/login  -->|                            |
  |  {email, password}          |-- Validate credentials  -->|
  |                             |<-- Staff record + hash  ---|
  |                             |-- Check failed attempts    |
  |                             |-- Verify bcrypt hash       |
  |                             |-- Check 2FA enabled?       |
  |                             |   (if yes: return pending, |
  |                             |    require /2fa/validate)  |
  |                             |-- Generate JWT (1h)        |
  |                             |-- Generate refresh token   |
  |                             |-- Store refresh in DB   -->|
  |                             |-- Log LOGIN audit       -->|
  |<-- {accessToken,            |                            |
  |     refreshToken,           |                            |
  |     expiresIn, user}        |                            |

Token Refresh Cycle:

  Journey App                   Backend                      Database
  ----------                    -------                      --------
  |  (Axios interceptor         |                            |
  |   detects 401 response)     |                            |
  |  POST /auth/refresh-token-->|                            |
  |  {refreshToken}             |-- Lookup token          -->|
  |                             |<-- Token record         ---|
  |                             |-- Verify not revoked       |
  |                             |-- Verify not expired       |
  |                             |-- Revoke old token      -->|
  |                             |-- Issue new JWT + refresh  |
  |                             |-- Store new refresh     -->|
  |<-- {accessToken,            |                            |
  |     refreshToken}           |                            |
  |  (Retry queued requests)    |                            |

Session Timeout (HIPAA):

  Journey App (client-side)
  -------------------------
  |-- Track last user interaction (mouse, keyboard, touch)
  |-- After 13 minutes idle: show warning modal (2-min countdown)
  |-- If user interacts: reset timer
  |-- After 15 minutes idle: call logout('session_timeout')
  |-- POST /auth/logout --> revoke refresh token
  |-- Clear all Zustand stores (tokens purged from memory)
  |-- Redirect to login screen
```

### 3.2 Message Flow

```
Staff sends message to patient:

  Journey App        Backend (HTTP)      Database       Backend (WS)       Recover App
  -----------        --------------      --------       ------------       -----------
  |  POST /messages  -->|                |              |                  |
  |  {recipientId,      |               |              |                  |
  |   content,          |               |              |                  |
  |   priority}         |               |              |                  |
  |                     |-- Validate -->|              |                  |
  |                     |-- Authorize   |              |                  |
  |                     |   (staff      |              |                  |
  |                     |    owns       |              |                  |
  |                     |    patient)   |              |                  |
  |                     |-- Save     -->|              |                  |
  |                     |-- Audit log-->|              |                  |
  |                     |-- Notify via WebSocket ----->|                  |
  |                     |              |               |-- Push to        |
  |                     |              |               |   connected   -->|
  |                     |              |               |   patient        |
  |<-- {message}     ---|              |               |                  |
  |                     |              |               |                  |
  |                     |              |               | (If patient      |
  |                     |              |               |  offline:        |
  |                     |              |               |  push            |
  |                     |              |               |  notification)   |

Patient reads message (Recover):

  Recover App           Backend                    Database
  -----------           -------                    --------
  |  GET /messages/     |                          |
  |  patient/inbox   -->|-- Fetch messages      -->|
  |                     |<-- Unread messages     ---|
  |<-- [messages]    ---|                          |
  |                     |                          |
  |  PUT /messages/     |                          |
  |  :id/read        -->|-- Mark read           -->|
  |                     |-- Audit log           -->|
```

### 3.3 Sync Flow (Offline Reconnect)

```
  Recover App (offline)              Recover App (online)          Backend              Database
  ---------------------              --------------------          -------              --------
  |                                  |                             |                    |
  |-- Patient logs check-in         |                             |                    |
  |-- Stored in Zustand + device    |                             |                    |
  |-- Patient logs craving          |                             |                    |
  |-- Stored locally                |                             |                    |
  |-- Patient updates goal          |                             |                    |
  |-- Stored locally                |                             |                    |
  |                                  |                             |                    |
  |   [Connectivity restored]     -->|                             |                    |
  |                                  |  POST /sync/batch        -->|                    |
  |                                  |  {checkIns: [...],          |                    |
  |                                  |   cravings: [...],          |                    |
  |                                  |   goals: [...]}             |                    |
  |                                  |                             |-- Validate each    |
  |                                  |                             |-- Upsert records-->|
  |                                  |                             |-- Audit log     -->|
  |                                  |<-- {results:                |                    |
  |                                  |      checkIns: {created,    |                    |
  |                                  |                errors},     |                    |
  |                                  |      cravings: {...},       |                    |
  |                                  |      goals: {...}}          |                    |
  |                                  |                             |                    |
  |                                  |-- Clear synced items        |                    |
  |                                  |   from offline queue        |                    |
```

### 3.4 Audit Logging Flow

```
  Client App              Audit Service              Backend              Database
  ----------              -------------              -------              --------
  |                       |                          |                    |
  |-- User views          |                          |                    |
  |   patient record      |                          |                    |
  |-- logAuditEvent({     |                          |                    |
  |     action,           |                          |                    |
  |     resourceType,     |                          |                    |
  |     phiAccessed})  -->|                          |                    |
  |                       |-- Is critical event?     |                    |
  |                       |   (LOGIN, PHI_ACCESS)    |                    |
  |                       |                          |                    |
  |                       |   [If critical]       -->|  POST /audit    -->|
  |                       |     Flush immediately    |  (immediate        |
  |                       |                          |   insert)          |
  |                       |   [If non-critical]      |                    |
  |                       |     Add to batch queue   |                    |
  |                       |                          |                    |
  |                       |-- Queue reaches 10       |                    |
  |                       |   OR 30s timer fires     |                    |
  |                       |     Flush batch       -->|  POST /audit    -->|
  |                       |                          |  (batch insert)    |
  |                       |                          |                    |
  |                       |                          |  Audit records     |
  |                       |                          |  are append-only.  |
  |                       |                          |  No UPDATE or      |
  |                       |                          |  DELETE permitted.  |
```

---

## 4. Security Architecture

### 4.1 Encryption

| Layer | Method | Details |
|-------|--------|---------|
| In transit | TLS 1.3 | All HTTP and WebSocket connections |
| At rest (database) | AES-256-GCM | PostgreSQL volume encryption; message content encryption with per-conversation keys |
| At rest (device) | OS keychain | Capacitor Secure Storage for device tokens on iOS/Android |

### 4.2 Token Management

- **Access tokens (JWT)**: 1-hour expiry, signed with HS256, stored in application memory only. Never written to localStorage, sessionStorage, cookies, or disk.
- **Refresh tokens**: 7-day expiry, stored server-side in the `refresh_tokens` table. Token rotation on every use (old token revoked, new token issued). Single-use enforcement prevents replay attacks.
- **Device tokens (patients)**: Bound to a specific device ID and platform. Stored as a hash in the `patient_devices` table.

### 4.3 Session Handling

- 15-minute inactivity timeout (HIPAA requirement). Client tracks mouse, keyboard, and touch events.
- 2-minute warning modal before forced logout.
- Logout reason is always recorded: `manual`, `session_timeout`, or `forced`.
- All Zustand stores are cleared on logout, purging tokens from memory.

### 4.4 Input Sanitization

- All incoming request bodies validated with Zod schemas (type checking + constraint enforcement).
- Rich text / HTML inputs sanitized with DOMPurify before storage and before rendering.
- SQL injection prevented by Prisma's parameterized queries (no raw SQL).

### 4.5 CORS and Rate Limiting

- CORS origins are explicitly configured per environment. No wildcard origins in staging or production.
- Rate limiting: 100 requests per IP per 60-second window (configurable).
- Account lockout: 5 failed login attempts triggers a 15-minute lockout.

### 4.6 42 CFR Part 2 Consent Tracking

The `Consent` model tracks patient authorization for disclosure of substance abuse treatment records. Each consent record specifies the recipient, purpose, information to be disclosed, effective/expiration dates, and revocation status. No patient data can be shared with external parties without an active, non-expired consent record.

---

## 5. Database Schema Overview

### Entity Relationship Diagram (Conceptual)

```
  Facility
  |-- has many --> Staff
  |-- has many --> Patient
  |-- has many --> TreatmentPlan

  Staff
  |-- has many --> RefreshToken
  |-- has many --> AuditLog
  |-- assigned to many --> Patient (as counselor)
  |-- has many --> Message (sent)

  Patient
  |-- belongs to --> Facility
  |-- assigned to --> Staff (counselor, optional)
  |-- has one --> RegistrationKey
  |-- has many --> PatientDevice
  |-- has many --> CheckIn
  |-- has many --> Craving
  |-- has many --> Message
  |-- has one --> TreatmentAssignment
  |-- has many --> Consent
  |-- has many --> PatientGoal

  TreatmentPlan
  |-- belongs to --> Facility
  |-- has many --> TreatmentPhase (ordered)
  |-- has many --> TreatmentAssignment

  TreatmentAssignment
  |-- links --> Patient (one-to-one)
  |-- links --> TreatmentPlan

  AuditLog
  |-- references --> Staff (actor, optional)
  |-- records: action, resourceType, resourceId, phiAccessed[], timestamp
  |-- append-only (no updates or deletes)

  Appointment
  |-- references --> Patient, Staff, Facility
```

### Key Entities

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **Facility** | Treatment center | name, address, status (ACTIVE/SUSPENDED/ARCHIVED) |
| **Staff** | Clinicians and admins | email, role, facilityId, 2FA status, lockout fields |
| **Patient** | Individuals in recovery | demographics, sobrietyDate, substancesOfChoice, status |
| **Message** | Secure communication | senderType, content, priority, encryption metadata, readAt |
| **TreatmentPlan** | Structured recovery program | phases with goals and activities, duration |
| **CheckIn** | Daily wellness record | mood (1-10), HALT scores, sleep, exercise |
| **Craving** | Craving event log | intensity, trigger, copingStrategy, overcame |
| **PatientGoal** | Recovery goals (synced from Recover) | category, targetType, frequency, progress tracking |
| **Consent** | 42 CFR Part 2 disclosure authorization | consentType, recipient, informationToDisclose, expiration |
| **AuditLog** | HIPAA compliance trail | action, resourceType, phiAccessed[], ipAddress, timestamp |

---

## 6. Deployment Architecture

### 6.1 Docker Compose Services

```
docker-compose.yml (development)
|
+-- db (postgres:16-alpine)
|   +-- Health check: pg_isready
|   +-- Persistent volume: postgres_data
|   +-- Init script: Backend/scripts/init-db.sql
|
+-- backend (Fastify application)
|   +-- Depends on: db (service_healthy)
|   +-- Health check: GET /health
|   +-- Source volumes mounted for hot-reload
|
+-- migrate (one-shot, profile: migrate)
|   +-- Runs: npx prisma migrate deploy
|
+-- seed (one-shot, profile: seed)
|   +-- Runs: npx prisma db seed
|
+-- journey (Vite dev server, profile: frontend)
|   +-- Port 5173
|
+-- recover (Vite dev server, profile: frontend)
|   +-- Port 5174
|
Network: recovery-network (bridge)
```

### 6.2 Production Overrides (docker-compose.prod.yml)

- Database port not exposed externally.
- No source volume mounts (built image only).
- Resource limits enforced:

| Service | CPU Limit | Memory Limit | Memory Reserved |
|---------|-----------|-------------|-----------------|
| Database | 2 cores | 2 GB | 512 MB |
| Backend | 2 cores | 1 GB | 256 MB |

- JSON-structured logging (Pino) with log rotation (10 MB per file, 3 files retained).

### 6.3 Zero-Downtime Deploy Strategy

1. `deploy.sh` verifies prerequisites (Docker, Git, Node.js, correct branch, clean working tree).
2. Runs the test suite (skippable with `--skip-tests`).
3. Builds Docker images tagged with the git version and environment name.
4. Applies Prisma migrations with `prisma migrate deploy` (skippable with `--skip-migrations`).
5. Scales up a new backend container alongside the existing one.
6. Health check polling: up to 30 attempts at 5-second intervals against `/health`.
7. Once the new container is healthy, the old container is drained and removed.
8. Prunes Docker images older than 7 days.

### 6.4 Rollback

`rollback.sh` lists available Docker image tags, defaults to the previous version, swaps the running container, and verifies the health check. A specific version tag can be provided as an argument.

### 6.5 Environments

| Environment | Backend URL | Branch Restriction |
|-------------|-------------|--------------------|
| Staging | `https://staging-api.recoveryjourney.app` | Any branch |
| Production | `https://api.recoveryjourney.app` | `main` only (enforced) |

---

## 7. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **API Server** | Fastify 5 | Low overhead, built-in schema validation, plugin ecosystem |
| **Authentication** | @fastify/jwt + bcrypt | Industry-standard JWT with secure password hashing |
| **Real-time** | @fastify/websocket | Native Fastify integration for WebSocket connections |
| **ORM** | Prisma | Type-safe queries, automatic migrations, PostgreSQL optimization |
| **Database** | PostgreSQL 16 | ACID compliance, JSONB support, mature ecosystem |
| **Desktop Framework** | Electron | Cross-platform desktop app with auto-update support |
| **Mobile Framework** | Capacitor 7 | Native iOS/Android access from a single React codebase |
| **UI Framework** | React 18 | Component model, ecosystem maturity, developer availability |
| **State Management** | Zustand | Lightweight, TypeScript-native, supports memory-only storage |
| **Data Fetching** | React Query (TanStack) | Caching, background refetch, optimistic updates |
| **Form Validation** | Zod | Runtime type checking shared between client and server |
| **CSS** | Tailwind CSS 4 | Utility-first, dark mode support, small production bundles |
| **UI Primitives** | Radix UI | Accessible, unstyled components (Recover app) |
| **HTTP Client** | Axios | Interceptors for token refresh, request queuing |
| **Routing (Recover)** | Wouter | Minimal bundle size for mobile web |
| **HTML Sanitization** | DOMPurify | XSS prevention for rich text inputs |
| **Testing** | Vitest + Playwright | Fast unit tests (Vitest), reliable E2E tests (Playwright) |
| **CI/CD** | GitHub Actions | Lint, test, and build per workspace on every push |
| **Containerization** | Docker + Docker Compose | Reproducible environments, orchestrated services |
| **Process Management** | tsx (watch mode) | TypeScript execution with hot-reload for development |
| **Code Quality** | ESLint + Prettier + Husky | Consistent formatting enforced at commit time |
