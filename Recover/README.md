# Recover -- Patient Companion App

A cross-platform mobile and web application for patients in substance abuse recovery programs. Built with React and Capacitor 7 for iOS, Android, and web.

Part of the [Recovery Journey](https://github.com/cLeffNote44/recovery-journey) monorepo (npm workspaces).

## Overview

Recover is the patient-facing component of the Recovery Journey platform. It syncs with the facility **Backend API** and pairs with the **Journey** clinician desktop portal, creating a coordinated care experience between patients and staff.

Patients use Recover for daily check-ins, progress tracking, secure messaging with their counselor, guided meditation, craving management, and access to crisis resources.

### Key Features

- **Dual Progress Tracking** -- Current streak and total sober days
- **Daily Check-Ins** -- Mood tracking and HALT assessments
- **Smart Risk Prediction** -- AI-powered relapse risk analysis
- **Recovery Skills** -- 7 evidence-based coping skills with practice tracking
- **Secure Messaging** -- HIPAA-compliant communication with facility staff
- **Guided Meditation** -- Multiple types with progress tracking
- **Craving Management** -- Log, analyze, and manage cravings
- **Journal & Gratitude** -- Reflection and gratitude tools
- **Achievement System** -- 40+ badges across 6 categories
- **Emergency Support** -- Quick access to crisis resources

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 18 + TypeScript |
| Mobile Runtime | Capacitor 7 (iOS/Android) |
| Build System | Vite 5 |
| Styling | Tailwind CSS 4 |
| Components | Radix UI primitives |
| State | Zustand (13 stores) |
| Routing | Wouter |
| Charts | Recharts |
| Animations | Framer Motion |
| Testing | Vitest |

## Setup

### Prerequisites

- Node >= 20.0.0
- npm >= 10.0.0
- Xcode (for iOS builds)
- Android Studio (for Android builds)

### From the monorepo root

```bash
npm install                    # Install all workspaces
npm run dev:backend            # Start Fastify API
npm run dev:recover            # Start Recover (Vite, port 5174)
```

## Architecture

```
Recover/
├── src/
│   ├── components/
│   │   ├── app/              # Application screens and features
│   │   │   ├── screens/      # Main screen components
│   │   │   ├── prevention/   # Relapse prevention tools
│   │   │   └── skills/       # Recovery skills components
│   │   └── ui/               # Reusable UI primitives
│   ├── stores/               # Zustand state (13 stores)
│   ├── lib/                  # Utility modules (55 modules)
│   ├── workers/              # Web Workers for background processing
│   ├── contexts/             # React contexts
│   └── App.tsx               # Root component
├── capacitor/                # Native app configuration
└── public/                   # Static assets
```

### Key Patterns

- **Zustand stores** in `src/stores/` for all client state
- **Radix UI + Tailwind** for accessible, styled components
- **Wouter** for lightweight client-side routing
- **Web Workers** for background data processing
- **Zod** validation at system boundaries
- **Dark mode** via Tailwind `dark:` prefix

## Native Builds

```bash
# Sync web build to native projects
npx cap sync

# Open native IDEs
npx cap open ios
npx cap open android
```

Native features include biometric authentication, push notifications, and home screen widgets.

## Related

- **Backend** -- Fastify REST API + WebSocket server (`../Backend`)
- **Journey** -- Electron clinician desktop portal (`../Journey`)

## License

Proprietary. See root repository for details.
