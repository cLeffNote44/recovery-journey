# Journey -- Clinician Portal

A cross-platform Electron desktop application for rehabilitation facility staff to manage patients, communicate securely, and track recovery progress in real-time.

Part of the [Recovery Journey](https://github.com/cLeffNote44/recovery-journey) monorepo (npm workspaces).

## Overview

Journey is the clinician-facing component of the Recovery Journey platform. It pairs with the **Recover** patient companion app (React + Capacitor) and connects to a shared **Fastify REST API** backend. Staff use Journey to manage patient records, send HIPAA-compliant messages, build treatment plans, and monitor facility-wide analytics.

### Key Features

- **Dashboard** -- Facility stats, appointments, reminders, message notifications
- **Patient Management** -- Registration keys, recovery milestone tracking, detailed patient views
- **Secure Messaging** -- Real-time WebSocket communication with patients
- **Treatment Plans** -- Create, edit, and track individualized plans
- **Document Management** -- Rich text editing (TipTap), import/export
- **Multi-Role Access** -- Super Admin, Facility Admin, Counselor
- **Offline Support** -- Service Worker with request queuing and background sync
- **Dark Mode** -- Full theme support with system preference detection
- **Auto-Updates** -- Seamless updates via GitHub releases

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop Runtime | Electron 28 |
| Frontend | React 18 + TypeScript |
| Build System | Vite 5 |
| Styling | Tailwind CSS (dark mode) |
| State | Zustand (tokens in memory only -- HIPAA) |
| Data Fetching | React Query |
| Validation | Zod |
| API Client | Axios with automatic token refresh |
| Testing | Vitest + React Testing Library + Playwright |

## Quick Start

### Prerequisites

- Node >= 20.0.0
- npm >= 10.0.0
- Backend running on port 8000 (see root README)

### From the monorepo root

```bash
npm install                    # Install all workspaces
npm run dev:backend            # Start Fastify API (requires DB setup)
npm run dev:journey            # Start Journey (Vite + Electron)
```

### From the Journey directory

```bash
npm run dev          # Vite dev server + Electron
npm run build        # Production build
npm run test         # Unit tests (watch mode)
npm run test:run     # Single run
```

## Architecture

```
Journey/
├── electron/
│   ├── main.ts              # Electron main process, auto-updater
│   └── preload.ts           # Secure IPC bridge (contextBridge)
├── src/
│   ├── components/
│   │   ├── SuperAdmin/      # Admin dashboard modules
│   │   ├── ui/              # Modal, Table, Form, Card, Pagination
│   │   ├── Patients/        # Patient-specific components
│   │   ├── ErrorBoundary.tsx
│   │   ├── SessionTimeoutWarning.tsx
│   │   └── OfflineIndicator.tsx
│   ├── hooks/               # React Query hooks, session timeout, WebSocket
│   ├── lib/                 # queryClient, sanitize (DOMPurify), sentry
│   ├── pages/               # Route components (Dashboard, Patients, Messages, etc.)
│   ├── services/            # api.ts (Axios), auditLog.ts, websocket.ts
│   ├── stores/              # authStore, themeStore (Zustand)
│   ├── validation/          # Zod schemas
│   └── config/              # Environment validation at startup
├── e2e/                     # Playwright E2E tests
└── public/
    └── sw.js                # Service Worker for offline support
```

## Testing

**395 unit tests** (Vitest) + **117 E2E tests** (Playwright) = **512 total**

```bash
npm run test              # Unit tests (watch)
npm run test:run          # Unit tests (single run)
npm run test:coverage     # With coverage report
npm run test:e2e          # Playwright E2E
npm run test:e2e:headed   # E2E with visible browser
npm run test:all          # Unit + E2E combined
```

E2E suites cover auth flows, patient management, messaging, documents, treatment plans, settings, and error handling.

## Building & Packaging

```bash
npm run package            # All platforms
npm run package:mac        # macOS (.dmg)
npm run package:win        # Windows (.exe)
npm run package:linux      # Linux (.AppImage, .deb)
```

Auto-update is configured via `electron-updater` publishing to GitHub releases.

## HIPAA Compliance

- **Tokens in memory only** -- never persisted to localStorage/sessionStorage
- **15-minute session timeout** with 2-minute warning modal
- **Audit logging** -- all PHI access logged (user, timestamp, action, resource, fields)
- **Rich text sanitization** -- DOMPurify on all user HTML input
- **Logout requires reason** -- `logout('manual')`, `logout('session_timeout')`, `logout('forced')`

## Related

- **Backend** -- Fastify REST API + WebSocket server (`../Backend`)
- **Recover** -- React + Capacitor patient companion app (`../Recover`)

## License

Proprietary. See root repository for details.
