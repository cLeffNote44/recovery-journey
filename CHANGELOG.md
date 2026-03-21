# Changelog

All notable changes to the Recovery Journey platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
