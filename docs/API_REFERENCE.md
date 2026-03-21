# Backend API Reference

Base URL: `http://localhost:8000/api/v1`

All responses include `{ success: boolean }`. Errors include `{ error: string, code: string }`.

## Authentication

### Auth Routes (`/auth`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/staff/login` | None | Staff login |
| POST | `/auth/patient/login` | None | Patient login (registration key) |
| POST | `/auth/refresh-token` | None | Rotate access/refresh tokens |
| POST | `/auth/logout` | None | Revoke refresh token |
| POST | `/auth/validate-key` | None | Check if registration key is valid |

**POST /auth/staff/login**
```json
// Request
{ "email": "string", "password": "string" }

// Response
{
  "accessToken": "jwt...",
  "refreshToken": "string",
  "expiresIn": 3600000,
  "user": { "id", "email", "firstName", "lastName", "role", "facilityId", "facilityName" }
}
```
- Locks account after 5 failed attempts (15 min lockout)
- Resets failed attempts on success

**POST /auth/patient/login**
```json
// Request
{ "registrationKey": "string", "deviceId": "string", "deviceName?": "string", "platform": "ios|android|web" }

// Response
{
  "accessToken": "jwt...",
  "deviceToken": "string",
  "patient": { "id", "firstName", "lastName", "sobrietyDate", "facilityName", "counselorName" }
}
```

**POST /auth/refresh-token**
```json
// Request
{ "refreshToken": "string" }

// Response — old refresh token is revoked (token rotation)
{ "accessToken": "jwt...", "refreshToken": "string", "expiresIn": 3600000 }
```

**POST /auth/validate-key**
```json
// Request
{ "registrationKey": "string" }

// Response
{ "valid": true, "alreadyUsed": false, "facilityName": "string", "patientFirstName": "string" }
```

---

## Two-Factor Authentication (`/2fa`)

All routes require staff authentication.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/2fa/setup` | Generate TOTP secret + QR code |
| POST | `/2fa/verify` | Verify code and enable 2FA |
| POST | `/2fa/validate` | Validate code during login |
| POST | `/2fa/disable` | Disable 2FA (requires code + password) |
| GET | `/2fa/status` | Check if 2FA is enabled |

**POST /2fa/setup** — Returns `{ secret: "base32...", qrCode: "data:image/png;base64,..." }`

**POST /2fa/verify** — `{ "code": "123456" }` — Enables 2FA after successful verification

**POST /2fa/disable** — `{ "code": "123456", "password": "string" }` — Requires both to prevent session hijack attacks

---

## Patients (`/patients`)

All routes require staff authentication.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/patients` | Staff | List patients (paginated, filterable) |
| GET | `/patients/:id` | Staff | Get patient with full details |
| GET | `/patients/:id/dashboard` | Staff | Patient dashboard (check-ins, cravings, goals) |
| POST | `/patients` | Staff | Create patient (generates registration key) |
| PUT | `/patients/:id` | Staff | Update patient |
| POST | `/patients/:id/regenerate-key` | Staff | Generate new registration key |
| DELETE | `/patients/:id` | Admin+ | Archive patient (soft delete) |

**GET /patients** — Query params: `facilityId?`, `status?`, `counselorId?`, `search?`, `page` (default 1), `limit` (default 20)

**POST /patients**
```json
{
  "firstName": "string", "lastName": "string", "dateOfBirth": "string",
  "phone?": "string", "email?": "string",
  "admissionDate": "string", "sobrietyDate": "string",
  "substancesOfChoice?": ["string"],
  "emergencyContactName?": "string", "emergencyContactPhone?": "string",
  "assignedCounselorId?": "string", "facilityId": "string"
}
// Response includes registrationKey for the Recover app
```

---

## Messages (`/messages`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/messages` | Staff | List conversations with unread counts |
| GET | `/messages/conversations/:patientId` | Staff | Get messages in a conversation |
| POST | `/messages` | Staff | Send message to patient |
| PUT | `/messages/:id/read` | Any | Mark message as read |
| GET | `/messages/patient/inbox` | Patient | Get patient's messages |
| POST | `/messages/patient/send` | Patient | Send message to assigned counselor |

**POST /messages** (Staff → Patient)
```json
{
  "recipientId": "string",
  "content": "string",
  "messageType?": "TEXT|SYSTEM",
  "priority?": "LOW|NORMAL|HIGH|URGENT"
}
```

---

## Treatment Plans (`/treatment-plans`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/treatment-plans` | Staff | List plans (filterable by facility, status) |
| GET | `/treatment-plans/:id` | Staff | Get plan with phases |
| POST | `/treatment-plans` | Admin+ | Create plan with phases |
| PUT | `/treatment-plans/:id` | Admin+ | Update plan |
| POST | `/treatment-plans/assign` | Staff | Assign plan to patient |
| DELETE | `/treatment-plans/:id` | Admin+ | Archive plan |

**POST /treatment-plans**
```json
{
  "name": "string", "description?": "string",
  "duration": 90, "durationUnit": "DAYS|WEEKS|MONTHS",
  "facilityId": "string",
  "phases": [
    { "name": "string", "description?": "string", "duration": 30, "durationUnit": "DAYS", "goals?": ["string"], "activities?": ["string"] }
  ]
}
```

**POST /treatment-plans/assign** — `{ "patientId", "treatmentPlanId", "startDate" }`

---

## Dashboard (`/dashboard`)

All routes require staff authentication. Data is scoped to the user's facility.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/dashboard/stats` | Facility stats (patient counts, check-ins today, alerts) |
| GET | `/dashboard/appointments` | Today's appointments |
| GET | `/dashboard/recent-messages` | Up to 5 unread messages |
| GET | `/dashboard/alerts` | High cravings + low mood from last 48h (up to 15) |

---

## Admin (`/admin`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/admin/stats` | Super Admin | System-wide statistics |
| GET | `/admin/facilities` | Super Admin | List all facilities |
| GET | `/admin/facilities/:id` | Super Admin | Facility details with staff |
| POST | `/admin/facilities` | Super Admin | Create facility |
| PUT | `/admin/facilities/:id` | Super Admin | Update facility |
| POST | `/admin/facilities/:id/suspend` | Super Admin | Suspend facility |
| GET | `/admin/staff` | Facility Admin+ | List staff |
| POST | `/admin/staff` | Facility Admin+ | Create staff member |
| POST | `/admin/staff/:id/deactivate` | Facility Admin+ | Deactivate staff |
| GET | `/admin/activity` | Super Admin | Recent audit log entries |
| GET | `/admin/analytics` | Super Admin | System analytics (7d/30d/90d/1y) |

---

## Patient Sync (`/sync`)

All routes require patient authentication. Used by the Recover mobile app.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/sync/check-in` | Submit single check-in |
| POST | `/sync/craving` | Submit single craving |
| POST | `/sync/check-ins` | Submit multiple check-ins |
| POST | `/sync/cravings` | Submit multiple cravings |
| POST | `/sync/goals` | Submit multiple goals |
| POST | `/sync/batch` | Batch sync (offline reconnect) |
| GET | `/sync/treatment-plan` | Get assigned treatment plan |
| GET | `/sync/profile` | Get patient profile + stats |

**POST /sync/check-ins** — `{ "checkIns": [{ "date", "mood" (1-10), "notes?", HALT fields... }] }` → `{ "syncedCount" }`

**POST /sync/goals** — Accepts both uppercase (`RECOVERY`) and lowercase (`recovery`) enum values. Coerces number IDs to strings.
```json
{
  "goals": [{ "recoverGoalId", "title", "category", "targetType", "currentValue", "frequency", "startDate", "isActive", "isCompleted" }],
  "progress?": [{ "goalId", "date", "value", "notes?" }]
}
```

**POST /sync/batch** — Returns `{ "results": { "checkIns": { "created", "errors" }, "cravings": {...}, "goals": {...} } }`

---

## Health Checks (no prefix)

No authentication required.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Basic liveness check |
| GET | `/health/live` | Kubernetes liveness probe |
| GET | `/health/ready` | Readiness probe (checks DB connection) |
| GET | `/health/detailed` | Detailed check with DB latency + uptime |

---

## Auth Roles

| Role | Access |
|------|--------|
| `SUPER_ADMIN` | All endpoints, all facilities |
| `FACILITY_ADMIN` | Own facility + staff management |
| `COUNSELOR` | Own facility patients, messages, dashboard |
| Patient (JWT type=patient) | Sync endpoints + patient messaging only |

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Invalid credentials or token |
| `FORBIDDEN` | 403 | Insufficient role/permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Zod schema validation failed |
| `DUPLICATE_ENTRY` | 409 | Unique constraint violation |
| `TOKEN_EXPIRED` | 401 | JWT has expired |
| `NO_TOKEN` | 401 | Authorization header missing |
