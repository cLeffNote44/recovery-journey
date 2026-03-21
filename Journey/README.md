# Recover Clinician Portal

A modern, cross-platform desktop application for rehabilitation facility staff to manage patients, communicate securely, and track recovery progress in real-time.

<p align="center">
  <strong>Built with Electron + React + TypeScript</strong>
</p>

---

## Overview

The Recover Clinician Portal is the clinician-facing component of the Recover platform, designed to streamline patient management and communication in rehabilitation facilities. It pairs with the React Native mobile application for patients, creating a seamless care coordination experience.

### Key Features

- **Dashboard** — Real-time facility stats, appointments, reminders, and message notifications
- **Patient Management** — Create patients, generate secure registration keys, track recovery milestones
- **Secure Messaging** — HIPAA-compliant real-time communication with patients via WebSocket
- **Treatment Plans** — Create, edit, and track individualized treatment plans
- **Document Management** — Rich text editing with TipTap, import/export capabilities
- **Multi-Role Support** — Super Admin, Facility Admin, and Counselor access levels
- **Offline Support** — Service Worker with request queuing and background sync
- **Dark Mode** — Full dark theme support with system preference detection
- **Auto-Updates** — Seamless application updates via GitHub releases

## Technology

| Layer | Technology |
|-------|------------|
| Desktop Runtime | Electron 28 |
| Frontend | React 18 + TypeScript 5.3 |
| Build System | Vite 5 |
| Styling | Tailwind CSS (with dark mode) |
| State Management | Zustand (persisted) |
| Data Fetching | React Query (@tanstack/react-query) |
| Validation | Zod schemas |
| Rich Text | TipTap editor |
| Data Visualization | Recharts |
| Testing | Vitest + React Testing Library + Playwright |
| Error Tracking | Sentry |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

This launches both the Vite dev server (hot reload) and the Electron application.

### Testing

```bash
npm run test           # Watch mode
npm run test:run       # Single run (395 tests)
npm run test:coverage  # Coverage report
npm run test:e2e       # E2E tests with Playwright
npm run test:e2e:ui    # E2E with interactive UI
npm run test:all       # Unit + E2E tests
```

### Build & Distribution

```bash
# Build for production
npm run build

# Package for distribution
npm run package        # All platforms
npm run package:mac    # macOS (.dmg)
npm run package:win    # Windows (.exe)
npm run package:linux  # Linux (.AppImage, .deb)
```

## Project Structure

```
recover-portal/
├── electron/              # Electron main process
│   ├── main.ts           # App lifecycle, windows, auto-update
│   └── preload.ts        # Secure IPC bridge
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── SuperAdmin/   # Admin dashboard modules
│   │   ├── ui/           # Modal, Table, Form, Card, Pagination
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingState.tsx
│   │   ├── SessionTimeoutWarning.tsx
│   │   └── OfflineIndicator.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── usePatients.ts
│   │   ├── useMessages.ts
│   │   ├── useWebSocket.ts
│   │   ├── useServiceWorker.ts
│   │   └── useSessionTimeout.ts
│   ├── lib/              # Utilities
│   │   ├── queryClient.ts
│   │   ├── sanitize.ts
│   │   └── sentry.ts
│   ├── pages/            # Route components
│   ├── services/         # API layer with auth handling
│   │   ├── api.ts
│   │   ├── auditLog.ts
│   │   └── websocket.ts
│   ├── stores/           # Zustand state management
│   ├── validation/       # Zod schemas
│   └── test/             # Test utilities
├── public/
│   └── sw.js             # Service Worker for offline
├── e2e/                  # Playwright E2E tests
└── release/              # Build output
```

## HIPAA Compliance

- **Session Timeout** — Auto-logout after 15 min inactivity with 2-min warning
- **Audit Logging** — All PHI access logged with user ID, timestamp, and context
- **Token Security** — Access tokens in memory only, never localStorage
- **Rich Text Sanitization** — DOMPurify prevents XSS in user content
- **Unsaved Changes Protection** — Prevents accidental data loss

## Security

- **Token Management** — Access tokens stored in memory only (not localStorage)
- **Session Isolation** — contextBridge isolates renderer from Node.js APIs
- **Auto Token Refresh** — Transparent token refresh with request queuing
- **Secure IPC** — All main/renderer communication through validated channels
- **Environment Validation** — API URLs validated at startup

## Design

The application uses a cohesive blue color scheme matching the mobile companion app:

- **Primary**: Blue scale (#1e3a8a to #3b82f6)
- **Success**: Green (#22c55e)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)

Dark mode fully supported with Tailwind's `dark:` prefix.

## Roadmap

- [x] WebSocket real-time updates
- [x] Offline mode with sync
- [x] Session timeout & audit logging
- [x] Dark mode support
- [ ] Video call integration
- [ ] Advanced analytics dashboard
- [ ] Mobile responsive admin view

## Related Projects

- **recover-backend** — FastAPI backend service
- **recover-mobile** — React Native patient application

---

<p align="center">
  <strong>Recover System</strong> — Transforming rehabilitation through technology
</p>
