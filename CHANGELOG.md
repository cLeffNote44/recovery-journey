# Changelog

All notable changes to the Recovery Journey platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
