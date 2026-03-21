# Recovery Journey Backend

HIPAA & 42 CFR Part 2 compliant backend API for the Recovery Journey platform.

## Overview

This backend serves both:
- **Journey** - Desktop app for facility staff (clinicians, admins)
- **Recover** - Mobile app for patients in recovery

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Fastify
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens)
- **Real-time**: WebSocket
- **Validation**: Zod

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   cd Backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
   ```

3. **Set up database**
   ```bash
   npm run db:generate    # Generate Prisma client
   npm run db:migrate     # Run migrations
   npm run db:seed        # Seed test data
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:8000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/staff/login` | Staff login |
| POST | `/api/v1/auth/patient/login` | Patient login (registration key) |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/validate-key` | Validate registration key |

### Patients (Staff Access)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/patients` | List patients |
| GET | `/api/v1/patients/:id` | Get patient details |
| GET | `/api/v1/patients/:id/dashboard` | Get patient dashboard |
| POST | `/api/v1/patients` | Create patient |
| PUT | `/api/v1/patients/:id` | Update patient |
| POST | `/api/v1/patients/:id/regenerate-key` | Generate new registration key |
| DELETE | `/api/v1/patients/:id` | Archive patient |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/messages` | List conversations |
| GET | `/api/v1/messages/conversations/:patientId` | Get conversation |
| POST | `/api/v1/messages` | Send message |
| PUT | `/api/v1/messages/:id/read` | Mark as read |
| GET | `/api/v1/messages/patient/inbox` | Patient inbox |
| POST | `/api/v1/messages/patient/send` | Patient send message |

### Patient Sync (Recover App)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sync/check-in` | Submit check-in |
| POST | `/api/v1/sync/craving` | Submit craving |
| POST | `/api/v1/sync/batch` | Batch sync data |
| GET | `/api/v1/sync/treatment-plan` | Get assigned plan |
| GET | `/api/v1/sync/profile` | Get patient profile |

### Treatment Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/treatment-plans` | List plans |
| GET | `/api/v1/treatment-plans/:id` | Get plan details |
| POST | `/api/v1/treatment-plans` | Create plan |
| PUT | `/api/v1/treatment-plans/:id` | Update plan |
| POST | `/api/v1/treatment-plans/assign` | Assign to patient |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Facility statistics |
| GET | `/api/v1/dashboard/appointments` | Today's appointments |
| GET | `/api/v1/dashboard/recent-messages` | Unread messages |
| GET | `/api/v1/dashboard/alerts` | Recent alerts |

### Admin (Super Admin / Facility Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/stats` | System-wide stats |
| GET/POST | `/api/v1/admin/facilities` | Manage facilities |
| GET/POST | `/api/v1/admin/staff` | Manage staff |
| GET | `/api/v1/admin/activity` | Audit log |
| GET | `/api/v1/admin/analytics` | Analytics data |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8000/ws` | Real-time messaging |

## Test Credentials

After running `npm run db:seed`:

**Staff Logins:**
- Super Admin: `superadmin@recoveryjourney.com` / `Admin123!`
- Facility Admin: `admin@sunriserecovery.com` / `Admin123!`
- Counselor: `mike.chen@sunriserecovery.com` / `Counselor123!`

**Patient Registration Keys:**
- `TEST-NT-1-KEY1` (John Smith)
- `TEST-NT-2-KEY1` (Emily Davis)
- `TEST-NT-3-KEY1` (Michael Brown)

## HIPAA Compliance Features

- **Audit Logging**: All PHI access is logged with who, what, when, where
- **Session Timeout**: Configurable inactivity timeout
- **Role-Based Access**: Super Admin, Facility Admin, Counselor roles
- **Encryption**: Passwords hashed with bcrypt, JWT tokens for auth
- **Rate Limiting**: Protects against brute force attacks

## 42 CFR Part 2 Features

- **Consent Tracking**: Track patient consent for disclosures
- **Disclosure Records**: Log all information sharing
- **Revocation Support**: Patients can revoke consent

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed test data
npm run db:studio    # Open Prisma Studio
npm run test         # Run tests
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/recovery_journey
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=8000
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## License

Proprietary - Recovery Journey Platform
