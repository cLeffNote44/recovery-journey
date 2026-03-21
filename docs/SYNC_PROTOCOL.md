# Sync Protocol: Recover ↔ Backend

This document describes how the Recover patient app syncs data with the facility Backend.

## Overview

```
┌──────────────────┐                    ┌──────────────────┐
│   Recover App    │                    │     Backend      │
│  (Patient Phone) │ ── HTTP/REST ────► │  (Fastify API)   │
│                  │                    │                  │
│  Local-first     │                    │  PostgreSQL      │
│  Zustand stores  │                    │  Prisma ORM      │
│  localStorage    │                    │                  │
└──────────────────┘                    └──────────────────┘
```

Recover is **local-first** — all patient data (check-ins, cravings, goals) lives on-device in Zustand stores backed by localStorage. The Backend sync is a **one-way push** of patient data to the facility, plus a **pull** of treatment plans and profile data.

## Authentication

1. Patient receives a **registration key** from their facility (generated in Journey)
2. Recover calls `POST /api/v1/auth/patient/login` with the key + device ID
3. Backend returns an `accessToken` (JWT) and `deviceToken`
4. Recover stores tokens in the `useFacilityStore` Zustand store
5. All subsequent requests use `Authorization: Bearer <accessToken>`
6. Token refresh via `POST /api/v1/sync/auth/refresh` using the stored refresh token

## Data Flow

### Patient → Facility (Push)

| Data Type | Endpoint | Trigger |
|-----------|----------|---------|
| Check-ins | `POST /sync/check-ins` | After new check-in submission |
| Cravings | `POST /sync/cravings` | After craving logged |
| Goals | `POST /sync/goals` | After goal created/updated |

Each endpoint accepts an array and returns `{ syncedCount }`.

**Full sync** (`performFullSync`) calls all three in parallel and is triggered:
- When app reconnects to facility
- When user manually syncs
- Periodically (if configured)

### Facility → Patient (Pull)

| Data Type | Endpoint | When |
|-----------|----------|------|
| Treatment plan | `GET /sync/treatment-plan` | On app open, after sync |
| Profile | `GET /sync/profile` | On app open |
| Messages | `GET /messages/patient/inbox` | On app open, periodic |

## Offline Queue

When sync fails (network error, server down), items are queued in localStorage:

```
localStorage key: facility_sync_queue

Queue item shape:
{
  id: "check-ins_1710000000_abc123",
  type: "check-ins" | "cravings" | "goals",
  payload: { checkIns: [...] },  // The original request body
  retries: 0,
  createdAt: "2025-01-15T10:00:00Z",
  lastAttemptAt: null
}
```

### Retry Strategy

- **Exponential backoff**: 2s → 4s → 8s → 16s → 32s (capped at 60s)
- **Max retries**: 5 per item (then dropped)
- **Auto-processor**: 30-second interval timer, self-stops when queue is empty
- **Reconnect trigger**: `processSyncQueue()` called when connection restored

### Queue API (in `facility-api.ts`)

```typescript
processSyncQueue()          // Retry all ready items
startSyncQueueProcessor()   // Start 30s interval
stopSyncQueueProcessor()    // Stop interval
getSyncQueueSize()          // Pending item count
```

## Data Shape Normalization

Recover and Backend use different conventions for enum values:

| Field | Recover sends | Backend expects | Resolution |
|-------|--------------|-----------------|------------|
| `category` | `"recovery"` | `"RECOVERY"` | Backend normalizes via Zod transform |
| `targetType` | `"yes-no"` | `"YES_NO"` | Backend normalizes via Zod transform |
| `frequency` | `"daily"` | `"DAILY"` | Backend normalizes via Zod transform |
| `recoverGoalId` | `42` (number) | `"42"` (string) | Backend coerces via Zod transform |

Both uppercase (Backend native) and lowercase (Recover native) values are accepted on all plural sync endpoints.

## Messaging

Messages use separate endpoints from the sync routes:

- `GET /messages/patient/inbox` — Fetch messages from counselor
- `POST /messages/patient/send` — Send message to assigned counselor (auto-routed)

Messages are stored in the `useFacilityStore.messages` array. The store tracks `unreadMessageCount`.

## Connection Lifecycle

```
1. User enters registration key
   └─► POST /auth/patient/login
       └─► Store connection + tokens in useFacilityStore

2. App is connected
   └─► Pull: treatment plan, profile, messages
   └─► Push: queued check-ins, cravings, goals
   └─► Start sync queue processor

3. Sync failure
   └─► Enqueue failed item to localStorage
   └─► Retry with exponential backoff

4. User disconnects
   └─► POST /auth/logout (best effort)
   └─► Clear store, stop queue processor
   └─► Queued items are NOT cleared (preserved for reconnect)
```

## Key Files

| File | Purpose |
|------|---------|
| `Recover/src/lib/facility-api.ts` | All sync functions, auth, queue processing |
| `Recover/src/lib/sync-queue.ts` | localStorage-backed queue with retry logic |
| `Recover/src/stores/useFacilityStore.ts` | Connection state, tokens, messages, sync status |
| `Backend/src/routes/patient-sync.ts` | All `/sync/*` endpoints |
| `Backend/src/routes/auth.ts` | Patient login via registration key |
| `Backend/src/routes/messages.ts` | Patient messaging endpoints |
