# Changelog

All notable changes to the Recovery Journey platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.11.0] - 2026-06-13

### Added
- Patient crisis escalation (Recover): an "Alert my counselor — I need help
  now" action in the emergency support modal sends an urgent message that the
  backend raises as a critical `patient.alert` on the clinician side (toast +
  dashboard alert triage) and that persists in the alerts panel until the
  counselor acknowledges it — completing the patient→counselor half of the
  real-time care loop. The phone-based crisis lines (988, etc.) remain the
  offline-safe primary path; failures are surfaced honestly rather than shown as
  success.
- Medication reminders (Recover): daily per-dose reminders and refill reminders
  are scheduled from the medication list via Capacitor local notifications, kept
  in sync as medications change and gated on the master notifications toggle.
  HIPAA / 42 CFR Part 2: the medication name never appears in the lock-screen
  notification body — only a generic prompt, with specifics behind the app lock.
- Meeting finder (Recover): discover meetings via the official locators (AA, NA,
  SMART, SAMHSA) and a maps "near me" search built from a typed ZIP/city, plus
  always-available online/24-7 meetings. Works with no backend, API key, or
  native geolocation dependency (links open in the device browser).

### Changed
- Recover navigation consolidated from 7 horizontally-scrolling bottom tabs to
  five primary daily destinations (Home, Journal, Prevention, Wellness,
  Facility). Settings moved into a header button; Calendar and the new Meeting
  Finder are reached from Home quick-access cards (both remain routable via
  Search and Notifications). An always-visible, supportive crisis-support card
  was added to the Home dashboard.

### Fixed
- WebSocket `message.new` events now carry `senderType` in the lowercase form
  the clinician client's contract expects; the backend had been broadcasting the
  raw uppercase Prisma enum, silently suppressing the "new message from patient"
  toast on the clinician side.

## [1.10.0] - 2026-06-12

### Security
- Access-token revocation: staff access tokens now carry a `tokenVersion`, and
  `requireStaff` re-validates the token against the live staff record (status +
  tokenVersion) on every request — a deactivated or role-changed staff member
  loses access immediately instead of at token expiry. Deactivation bumps
  `tokenVersion` (invalidating all outstanding access tokens) in addition to
  revoking refresh tokens.
- IP + identifier brute-force throttling is now wired into staff login (the
  existing `checkBruteForce`/`recordFailedLogin` helpers were never called),
  layered on top of the per-account DB lockout.
- Audit logs are tamper-evident: each row stores a keyed HMAC (AUDIT_SECRET)
  over its canonical contents, so after-the-fact in-place edits of a row are
  detectable. (A hash chain for delete/reorder detection, and same-transaction
  "fail the request if the audit write fails" enforcement, are tracked as
  follow-ups — the latter requires wrapping each mutation and its audit row in
  one transaction to avoid leaving a committed-but-unaudited partial state.)
- Journey (Electron): the renderer is hardened with `sandbox: true` +
  `webSecurity: true`; navigation and redirects are locked to the app origin;
  new-window creation is denied (http(s) links open in the OS browser);
  `<webview>` embedding is blocked; and all permission/device requests are
  denied. The auto-update code-signing requirement is documented in main.ts.

### Fixed
- Recover: `RecoveryProgressChart` called `useMemo` after an early return
  (conditional hooks — a React "rendered fewer hooks" crash risk); the memos
  now run unconditionally.
- Recover: the `HomeScreen` and `SettingsScreen` test suites imported
  `react-router-dom` (the app uses Wouter) and never loaded — fixed; both run.

### Added
- Recover: a `lint` script (the workspace had none, so CI's recover-lint job
  silently did nothing); fixed all 10 lint errors it surfaced (a conditional
  hook, a `require()` in module code, `prefer-const`, `no-case-declarations`).
- Journey E2E (Playwright) now runs in CI and gates merges via `ci-success`.

### Changed
- Backend: Prisma migration `20260612000000_token_version_and_audit_hash` adds
  `staff.token_version` and `audit_logs.hash` (additive, non-breaking).

## [1.9.0] - 2026-06-12

### Security
- Recover (patient app): all persisted PHI is now encrypted at rest with
  AES-256-GCM. A non-extractable WebCrypto master key is held in IndexedDB so
  its raw bytes never leave the crypto engine; every Zustand store (journal,
  recovery, activities, settings, quotes, and facility messages/treatment
  plan) is transparently encrypted, with legacy plaintext migrated on first
  write
- Recover: Android `allowBackup="false"` + `fullBackupContent="false"` +
  `dataExtractionRules` excluding all domains — patient data can no longer be
  extracted via `adb backup` or Android cloud/device-transfer backups
- Recover: cloud backups can no longer be uploaded unencrypted, are addressed
  by short-lived **signed** URLs instead of public URLs (a public bucket would
  expose any patient's PHI by path guessing), and use a random per-backup
  PBKDF2 salt instead of a salt derived from the password
- Recover: PIN unlock now uses PBKDF2-SHA-256 (100k iterations, random salt,
  constant-time compare) instead of a reversible 32-bit non-cryptographic hash
- Recover: lock-screen notifications no longer disclose PHI — meeting names
  and "N days sober" milestone counts are replaced with generic text; the
  specifics travel only in the notification payload surfaced inside the app
- Recover: on-device auto-backups (the full app dataset) are now encrypted at
  rest like the live stores — previously they were written to localStorage as
  plaintext JSON, bypassing encryption entirely
- Recover: "Delete all data" now performs a real device wipe — clears every
  store and sync/device/biometric key and crypto-shreds the master key
  (previously it only removed a single unused legacy key)
- Recover: a failed decrypt no longer silently overwrites the unreadable
  ciphertext on the next write, preventing a transient key error from causing
  permanent data loss
- Recover: storage layer no longer logs PHI fragments to the console

### Added
- `src/lib/device-encryption.ts` (master key + AES-GCM encrypt/decrypt +
  crypto-shred), `src/lib/encrypted-storage.ts` (Zustand persistence adapter),
  and `src/lib/device-wipe.ts` in the Recover app, with unit tests

## [1.8.0] - 2026-06-12

### Security
- Two-factor authentication is now enforced at staff login — accounts with 2FA enabled receive a short-lived pending token that must be exchanged with a valid TOTP code before any access/refresh tokens are issued; failed codes count toward the existing account lockout
- WebSocket connections derive the user type (staff/patient) from the verified JWT payload instead of trusting the client-supplied value, preventing patients from registering as staff and receiving staff-targeted broadcasts
- Typing indicators are only forwarded between connections in the same facility
- Goal sync (`/sync/goals`, `/sync/batch`) scopes updates to the authenticated patient — a client-supplied `recoverGoalId` can no longer overwrite another patient's goal
- Patient updates: facility transfers now require SUPER_ADMIN, and counselor reassignment validates the target is active staff at the patient's facility
- Journey: document HTML is re-sanitized at render time (defense in depth on all `dangerouslySetInnerHTML` sites)
- Journey: removed `'unsafe-inline'` from the CSP `script-src`; added explicit font-source allowances
- Journey: React Query cache (cached PHI) is purged on logout
- `authenticate` middleware now rejects unrecognized JWT payload shapes explicitly

### Added
- `POST /auth/staff/login/2fa` endpoint to complete a 2FA login
- Two-factor code entry step in the Journey login page
- Shared TOTP helper (`Backend/src/lib/totp.ts`) so 2FA parameters cannot drift between routes
- Image-based deployments: the backend now deploys as a tagged GHCR image
  (`ghcr.io/cleffnote44/recovery-journey/backend:<version>`) pulled on the
  server, so the image tested in CI is the image that runs in production
- Deployed-version tracking (`.deployed_version` / `.deployed_version.previous`)
  makes `scripts/rollback.sh` an actual image-tag swap instead of a no-op rebuild
- `deploy.sh --pull --image-tag <tag>` to deploy a registry tag without building
- Container-aware backup/restore: `scripts/backup.sh` and `scripts/restore.sh`
  dump/restore via `docker exec` when the database container is running
  (the production database publishes no host port)

### Fixed
- Production compose invocation: `docker-compose.prod.yml` is an override and is
  now always combined with the base file in CD, `deploy.sh`, and `rollback.sh`
  (standalone invocation could not start the stack)
- Compose override now uses `!reset` for `db.ports` and `backend.volumes` —
  empty-list overrides were silently appended, leaving the database port
  published and dev bind mounts active in production
- Production compose now passes `ENCRYPTION_KEY`/`ENCRYPTION_SALT`/`AUDIT_SECRET`
  to the backend container (startup previously exited: required in production)
- `backup.sh` could never complete: log output corrupted the file paths returned
  via command substitution (logs now go to stderr), and it rejected the
  environment argument the CD pipeline and nightly cron pass
- `restore.sh` could never restore an encrypted backup: the decrypted temp file
  lost its `.gz` extension so decompression was skipped (verified end-to-end
  against a live postgres: backup → drop → restore → data intact)
- `deploy.sh` built the development image for production deploys (missing
  `--target production`), ran vitest in watch mode (hung forever), and died in
  its health-wait loop (`((var++))` returns non-zero under `set -e`)
- CD checked out a non-existent git ref for tag deploys (`1.8.0` instead of the
  tag's commit) and deployed a version label that matched no pushed image tag
- Scheduled backup workflow now honors the manually selected environment,
  verifies the exact encrypted file each run produced, and fails loudly
- `compose run --rm migrate` reads stdin from /dev/null — when invoked through
  `ssh bash -s` it would otherwise swallow the rest of the deploy script and
  silently leave the old backend running against the new schema
- Deploy/backup workflows fail closed when the target host secret is unset
  instead of silently falling back to the other environment's host; deploys
  are serialized per environment via a concurrency group
- Staging/production env templates: `NODE_ENV=staging` (invalid enum, crashed
  the backend), `CORS_ORIGIN` (backend reads `CORS_ORIGINS`), wrong port (3000
  vs 8000), and dead variables the backend never reads

### Changed
- Database migrations run on the deploy host inside the compose network
  (`compose run --rm migrate`) using the same image as the backend — the
  production database is no longer expected to be reachable from GitHub runners
- `prisma` moved from devDependencies to dependencies so the production image
  contains the CLI that `migrate deploy` needs (no runtime npm download)
- Pre-deployment backups are mandatory: CD aborts the deploy if the backup
  fails (failures were previously masked as "non-fatal")
- SSH host keys are pinned via the `SSH_KNOWN_HOSTS` secret;
  `StrictHostKeyChecking=no` removed from all pipelines
- Backend Docker image pinned to `node:22-alpine` (LTS — was non-LTS node:25);
  Journey image moved off end-of-life `node:18-alpine`
- Backup encryption keys are passed to openssl via the environment instead of
  the command line; restore pre-dumps are now encrypted too
- Workflow permissions scoped to least privilege (`contents: read` default);
  manual production deploys must be dispatched from `main`
- `.gitignore` now covers backup artifacts (`backups/`, dump patterns) and key
  material (`*.pem`, `*.key`, `*.keystore`, `*.p12`)
- Backend/root lockfiles regenerated (root was stale at 1.7.0)

## [1.7.2] - 2026-04-04

### Security
- Console statements (`console.log`, `console.debug`, `debugger`) stripped from Recover and Journey production builds via esbuild `drop` option
- Pre-deployment database backup runs automatically before every staging/production deploy

### Added
- CD pipeline rollback automation — failed health checks trigger automatic rollback to previous version with 3-attempt retry
- Scheduled database backup workflow (`backup.yml`) — runs daily at 3:17 AM ET for both staging and production, with manual trigger support
- Health check retries in CD (3 attempts, 10s intervals) before declaring deployment failure

### Changed
- CD deploy steps restructured: SSH setup → version capture → backup → deploy → verify → rollback-on-fail → cleanup
- GitHub Release creation now gated on successful deployment (was running even on failure)

## [1.7.1] - 2026-04-04

### Fixed
- Generated initial Prisma migration (476-line SQL) — `prisma migrate deploy` now works in CD pipeline
- Recover `facility-api.ts` throws on missing `VITE_FACILITY_API_URL` in production instead of falling back to localhost
- Journey CSP in `index.html` now allows `https:` and `wss:` connections for production backends
- Journey `config/env.ts` no longer falls back to localhost in production — throws `EnvironmentError`
- Journey `websocket.ts` URL fallback gated to development only

### Security
- `ENCRYPTION_KEY` and `AUDIT_SECRET` now required in production (validated at startup, exits with error)
- Seed script (`prisma/seed.ts`) refuses to run when `NODE_ENV=production`

## [1.7.0] - 2026-04-03

### Security
- Registration keys now use `crypto.randomBytes()` instead of `Math.random()` (CSPRNG)
- WebSocket `broadcastToFacility` now filters by facility — fixes cross-tenant PHI leak
- `AUDIT_SECRET` no longer falls back to hardcoded string; throws if missing
- `ENCRYPTION_KEY`/`ENCRYPTION_SALT` added to env schema; removed hardcoded salt fallback
- `/metrics` endpoint now requires Bearer token authentication
- `X-Forwarded-For` only trusted when `TRUST_PROXY=true` in production
- Message read endpoint (`PUT /messages/:id/read`) now verifies ownership
- Cloud sync PBKDF2 salt is now derived per-password instead of static across all users
- SQL injection regex no longer false-positives on apostrophes in patient notes

### Fixed
- `useState` replaced with `useEffect` for notification permission check in SettingsScreen
- `handleConfirmImport` now has try/catch and properly resets loading state on error
- `store.logout()` calls in API interceptors now pass `'forced'` reason for HIPAA audit compliance
- `setInterval` leak in EmergencySupportModal grounding exercises — now cleaned up on unmount
- Token refresh subscriber queue now has timeout to prevent permanent promise leak
- Batch sync endpoints now return error details instead of silently swallowing failures
- `refreshQuote` button now cycles quotes via offset parameter instead of being a no-op
- `localStorage` read in ThemeContext wrapped in try/catch for environments where storage is blocked

### Changed
- All `window.confirm()` calls in SettingsScreen replaced with React state-driven confirmation dialog (Capacitor iOS compatible)
- Contact form now POSTs to `/api/contact` API route with `mailto:` fallback (was `console.log` no-op)
- Fastify server now uses centralized pino logger from `lib/logger.ts` (single instance)
- CD workflow deploy steps now use real SSH + docker-compose commands instead of placeholder echoes
- Journey/README.md rewritten to accurately describe the Electron clinician portal
- Recover/README.md rewritten to accurately describe the Capacitor patient companion app
- HIPAA compliance doc corrected: JWT expiry is 1h (with 15-min client-side idle timeout)
- `.env.example` expanded with HIPAA-critical vars: encryption, audit, session, VITE frontend vars
- Email domains standardized to `@recoveryjourney.app` across SECURITY.md and LICENSE
- electron-builder publish repo corrected from `recover-backend` to `recovery-journey`
- Dependabot reviewer teams updated from placeholder `your-org/*` to `cLeffNote44`
- Brand logo images now have descriptive `alt` text in website Header and Footer
- `@types/react` downgraded from ^19.1.16 to ^18.3.18 to match React 18 runtime
- Removed orphaned `react-router-dom` devDependency from Recover (uses Wouter)

### Added
- `/api/contact` Next.js API route for website contact/demo request form
- GitHub Actions secrets for CD pipeline: STAGING_HOST, PRODUCTION_HOST, DEPLOY_USER, DEPLOY_SSH_KEY

## [1.6.2] - 2026-03-21

### Changed
- Pitch deck now includes embedded screenshots on 6 pages (cover brand icons, solution overview, AI risk prediction, clinician portal, patient app row, platform calendar)
- Contact email updated to cody@leffel.io across contact page, footer, pitch deck HTML, and pitch deck markdown

## [1.6.1] - 2026-03-21

### Added
- 12-page pitch deck (docs/pitchdeck.html) — print-ready sales handout with cover, table of contents, problem/solution, AI prediction, app features, differentiators, compliance, implementation, and contact info
- Markdown version (docs/pitchdeck.md) for reference

## [1.6.0] - 2026-03-21

### Added
- New brand assets: blue R icon (Recover), teal J icon (Journey), combined wordmark
- Brand images added to website, Journey app, and Recover app directories

### Changed
- Header and footer logos replaced with new R+J icon pair and "Recover" (blue) + "Journey" (teal) text
- Brand colors: Recover uses blue gradient, Journey uses teal gradient

### Removed
- Old SVG logo assets (logo.svg, logo-full.svg, og-image.svg) replaced by new brand images

## [1.5.1] - 2026-03-21

### Removed
- Features page (/features) — redundant with /journey-portal, /recover-app, and /compliance pages
- "Features" link removed from header nav and footer

### Changed
- Navigation simplified to: Patient App | Clinician Portal | Pricing | Compliance | Contact
- All former /features links redirected to /recover-app

## [1.5.0] - 2026-03-21

### Added
- Complete landing page overhaul based on competitor analysis (Kipu, Sunwave, TherapyNotes, SimplePractice)
- AI Relapse Risk Prediction section — dedicated showcase of the 3-7 day prediction algorithm
- "What You Won't Find Anywhere Else" section — 6 unique differentiators (Traffic Light, 12-Step Digital, Money Saved, Crisis Protocols, Smart Form-Fill, Offline Privacy)
- Social proof section with evidence-based credibility signals
- Outcome-focused hero: "Predict Relapse Before It Happens" with product visuals
- "Book a Consultation" CTA strategy (premium positioning vs generic "Request Demo")

### Changed
- Brand name updated to "RecoverJourney" (one word) across all site metadata, header, footer, and page copy
- Hero rewritten from feature-focused to outcome-focused messaging
- Stats bar changed from generic (256-bit, 99.9%) to meaningful product stats (14 templates, 40+ badges, 7 skill modules, 4 crisis protocols)
- Pricing copy improved: "No hidden fees. No compliance add-ons."
- FAQ expanded with AI prediction and offline access questions

## [1.4.0] - 2026-03-21

### Added
- Comprehensive Journey Clinician Portal showcase page with 8 full-page screenshots (Dashboard, Patients, Messages, Treatment Plans, Documents, Appointments, Settings, Login)
- Detailed feature breakdowns for each page with bullet lists
- Mobile App Integration callouts explaining how each feature connects to the Recover patient app
- Benefit statements highlighting value to facilities
- New screenshots: journey-patients.png, journey-treatment-plans.png, journey-documents.png, journey-appointments.png, journey-settings.png

### Changed
- Rebuilt /journey-portal page from scratch with alternating screenshot/text layout and reusable section components

## [1.3.2] - 2026-03-21

### Fixed
- Patients page crash: API returns camelCase fields (`firstName`) but frontend expected snake_case (`first_name`). Added mapping layer to normalize API responses.
- Messages page infinite loading: `setIsLoadingConversations(false)` was never called on API success path, causing the page to stay in loading state when the API returned empty conversations.

## [1.3.1] - 2026-03-21

### Added
- Documents tab on PatientDetail page showing patient-specific documents
- "New Document" button on patient profile with patient pre-selected in template picker
- View button opens documents in read-only form renderer
- Mock patient documents generated per patient for demo purposes

## [1.3.0] - 2026-03-21

### Added
- Document template/copy system: Templates tab with 14 undeletable stock forms and Patient Documents tab for filled copies
- CreateDocumentModal: set document title, select patient from searchable dropdown, pick category before opening form
- Template cards with "Preview" (read-only) and "Use Template" (creates copy) actions
- Patient Documents tab with edit, delete (with confirmation), search by patient name, and sort by date/name
- `templateList` metadata in documentTemplates.ts with clean names, categories, and descriptions

### Changed
- Documents page restructured from flat list to tabbed Templates + Patient Documents layout
- Stock templates are now undeletable and uneditable — clinicians work with copies only
- Template names cleaned up: removed "TEMPLATE -" prefix and patient names from titles
- Removed old mockDocuments array, replaced with structured template list and demo patient documents

## [1.2.2] - 2026-03-21

### Fixed
- Biopsychosocial Assessment: substance use history table no longer overflows page (abbreviated column headers, reduced padding, scrollable container for wide tables)
- Biopsychosocial Assessment: Treatment Recommendations field now fillable (moved to same line as label, added second line)

## [1.2.1] - 2026-03-21

### Fixed
- Document form renderer: checkbox regex no longer swallows underscore fields in patterns like "Other: ________" (affected 11 of 14 templates)
- Document form renderer: bracket placeholders like [Facility Name] now detected as text inputs (affected 3 templates)
- Document form renderer: global regex lastIndex pollution fixed to prevent intermittent field detection failures

## [1.2.0] - 2026-03-21

### Added
- Dedicated document form renderer (DocumentFormRenderer) that replaces underscore-based fill-in fields with proper HTML inputs, checkboxes, and date/phone/SSN-formatted fields
- Automatic routing: template documents with form fields open in form renderer, free-form documents still use TipTap editor
- Print functionality for completed clinical forms
- Separate `/recover-app` and `/journey-portal` showcase pages on marketing website with 18 screenshots

### Changed
- Journey app branding: "Recover" renamed to "Journey" in sidebar header, login page, and copyright
- Bottom navigation in Recover app now scrolls horizontally instead of cramming 7 tabs

### Fixed
- LoginPage test updated to match new "Journey" branding

## [1.1.0] - 2026-03-21

### Added
- Marketing website with 9 pages (Landing, Features, Patient App, Clinician Portal, Pricing, Compliance, Contact, Privacy, Terms)
- Custom brand identity: logo mark (ascending path + triumph figure), favicon, app icons, OG social image
- 18 app screenshots captured and displayed in phone/browser frame mockups
- Dedicated `/recover-app` page showcasing all 16 patient app screens with detailed descriptions
- Dedicated `/journey-portal` page showcasing clinician desktop portal with feature grid
- Professional documentation: README, LICENSE, CHANGELOG, SECURITY, ARCHITECTURE, API Reference, Setup Guide, Deployment Guide
- Monitoring integration (Sentry/LogRocket) with provider-agnostic service layer
- Two-factor authentication setup flow in Journey Settings
- Scrollable bottom navigation bar in Recover app

### Fixed
- Backend `sanitizeEmail` angle bracket stripping order bug
- CloudSyncPanel TypeScript errors (nullability, arity mismatches)
- WebSocket handler console.logs replaced with pino structured logger
- CI/CD pipeline: corrupted backup script, SQL injection in restore, insecure PHI temp file cleanup
- Deploy script: fake health check replaced with actual container health polling
- 127 failing Recover tests fixed (type mismatches, UI drift, stale selectors)

### Security
- Backup script no longer corrupts SQL dumps by mixing stderr into output
- Restore script validates database names against regex to prevent SQL injection
- Decrypted PHI temp files now use `shred -u` for secure deletion
- Added `npm audit` dependency vulnerability scanning to CI pipeline
- Pre-migration database backups added to CD pipeline

## [1.0.0] - 2026-03-21

### Added

- HIPAA and 42 CFR Part 2 compliant architecture across all platform components
- Backend REST API built on Fastify with JWT authentication, refresh token rotation, and role-based access control
- WebSocket-based real-time messaging between clinical staff and patients
- Comprehensive audit logging for all PHI access, including user identity, timestamps, actions, and fields viewed
- Journey clinician desktop portal (Electron) with patient management, clinical dashboard, secure messaging, treatment plan builder, and rich-text document editor
- Recover patient mobile and web app (React + Capacitor) with sobriety day tracking, daily mood check-ins, craving management tools, HALT assessments, and a recovery badge achievement system
- Role-based access control supporting Super Admin, Facility Admin, and Counselor roles with granular permissions
- Offline-first patient app architecture with local Zustand stores and cloud sync support for intermittent connectivity
- Two-factor authentication setup flow for staff accounts
- Comprehensive test suite with 805 tests across all workspaces (unit, integration, and end-to-end via Playwright)
- Docker Compose deployment configuration with zero-downtime rolling updates
- Database backup and restore tooling with AES-256-GCM encryption for backup artifacts
- Session timeout enforcement with 15-minute inactivity auto-logout and 2-minute warning modal
- Request sanitization middleware to prevent injection attacks
- Rate limiting on authentication and API endpoints

### Security

- AES-256-GCM encryption at rest for all sensitive data and database backups
- TLS 1.3 enforced for all data in transit
- Automatic session timeout after 15 minutes of inactivity with mandatory logout reason tracking
- Full audit trail for every PHI access event, stored with tamper-evident logging
- Tokens stored in memory only; no persistence to localStorage or sessionStorage
- DOMPurify-based HTML sanitization for all rich-text user input
- Security headers applied via middleware (HSTS, CSP, X-Content-Type-Options, X-Frame-Options)
- Rate limiting on authentication endpoints to mitigate brute-force attacks
