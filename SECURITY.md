# Security Policy

Recovery Journey takes the security of its platform seriously. As a HIPAA and
42 CFR Part 2 compliant system handling protected health information (PHI), we
maintain rigorous security standards and welcome responsible vulnerability
disclosure from the security research community.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | Yes                |
| < 1.0   | No                 |

Only the latest patch release within a supported major.minor version receives
security updates. Users are strongly encouraged to stay on the latest release.

## Reporting a Vulnerability

If you discover a security vulnerability in Recovery Journey, please report it
responsibly. Do NOT open a public GitHub issue for security vulnerabilities.

**Email:** security@recoveryjourney.com

Please include the following in your report:

- A clear description of the vulnerability
- Steps to reproduce the issue
- The potential impact or severity
- Any suggested remediation, if applicable
- Your contact information for follow-up

### Response Timeline

- **Acknowledgment:** Within 48 hours of receiving your report
- **Initial assessment:** Within 5 business days
- **Critical vulnerabilities:** Fix targeted within 30 days
- **High-severity vulnerabilities:** Fix targeted within 60 days
- **Medium and low severity:** Addressed in the next scheduled release

We will keep you informed of our progress throughout the remediation process.

## What Constitutes a Vulnerability

We consider the following categories to be valid security vulnerabilities:

- Authentication or authorization bypass (e.g., accessing another user's data,
  escalating privileges beyond assigned role)
- Exposure of protected health information (PHI) to unauthorized parties
- SQL injection, NoSQL injection, or other injection attacks
- Cross-site scripting (XSS), cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- Insecure direct object references leading to unauthorized data access
- Broken session management (e.g., session fixation, token leakage)
- Cryptographic weaknesses in data-at-rest or data-in-transit protections
- Audit logging bypass or tampering
- Remote code execution
- Significant information disclosure via error messages, headers, or metadata

## What Does NOT Qualify

The following are generally outside the scope of this security policy:

- Social engineering or phishing attacks against staff or users
- Physical access attacks (e.g., accessing an unlocked workstation)
- Denial-of-service (DoS/DDoS) attacks
- Vulnerabilities in third-party services or dependencies not under our direct
  control (please report these to the relevant upstream project)
- Issues requiring an already-compromised user account or device
- Missing security headers on non-sensitive pages that do not lead to
  exploitable conditions
- Automated scanner output without a demonstrated proof of concept
- Theoretical attacks without a realistic exploitation path

## Disclosure Policy

Recovery Journey follows a coordinated disclosure model:

1. Report the vulnerability privately to security@recoveryjourney.com.
2. We will acknowledge receipt and work with you to understand and validate
   the issue.
3. We request a **90-day disclosure window** from the date of our
   acknowledgment before any public disclosure, to allow sufficient time for
   remediation and release.
4. Once a fix is released, we welcome public disclosure and will credit
   reporters (unless anonymity is preferred).
5. If we are unable to resolve the issue within 90 days, we will communicate
   our progress and negotiate an extended timeline in good faith.

We will not pursue legal action against researchers who discover and report
vulnerabilities in accordance with this policy.

## HIPAA Compliance

Recovery Journey is designed and operated to support compliance with the Health
Insurance Portability and Accountability Act (HIPAA) and 42 CFR Part 2
regulations governing substance use disorder patient records.

A **Business Associate Agreement (BAA)** is available for covered entities and
their business associates. Contact legal@recoveryjourney.com to request BAA
execution.

## Security Architecture Overview

The following summarizes the key security controls in place across the platform:

**Encryption**
- Data at rest is encrypted using AES-256-GCM
- Data in transit is protected with TLS 1.3
- Database backups are encrypted before storage

**Authentication and Authorization**
- JWT-based authentication with short-lived access tokens and secure refresh
  token rotation
- Role-based access control (Super Admin, Facility Admin, Counselor) with
  granular permission enforcement
- Two-factor authentication support for staff accounts
- Rate limiting on authentication endpoints to mitigate brute-force attacks

**Session Security**
- Access and refresh tokens are stored in memory only; never persisted to
  localStorage or sessionStorage
- Automatic session timeout after 15 minutes of inactivity
- Mandatory logout reason tracking (manual, timeout, forced)

**Audit Logging**
- All access to protected health information is logged with user identity,
  timestamp, action performed, resource accessed, and specific fields viewed
- Critical audit events are transmitted immediately; routine events are
  batched for performance
- Audit logs are stored with integrity protections

**Input Validation and Sanitization**
- All user input is validated with Zod schemas at runtime
- Rich-text HTML input is sanitized using DOMPurify
- Request sanitization middleware protects against injection attacks

**Infrastructure**
- Security headers enforced via middleware (HSTS, CSP, X-Content-Type-Options,
  X-Frame-Options)
- Docker-based deployment with zero-downtime rolling updates
- Environment variable validation at application startup
