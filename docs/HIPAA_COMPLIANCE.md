# HIPAA Compliance Documentation

## Recovery Journey - Healthcare Information Security

This document outlines the HIPAA compliance measures implemented in the Recovery Journey platform for managing substance abuse treatment records in accordance with HIPAA (Health Insurance Portability and Accountability Act) and 42 CFR Part 2 regulations.

---

## Table of Contents

1. [Overview](#overview)
2. [Protected Health Information (PHI)](#protected-health-information-phi)
3. [Technical Safeguards](#technical-safeguards)
4. [Administrative Safeguards](#administrative-safeguards)
5. [Physical Safeguards](#physical-safeguards)
6. [42 CFR Part 2 Compliance](#42-cfr-part-2-compliance)
7. [Audit Controls](#audit-controls)
8. [Incident Response](#incident-response)
9. [Configuration Checklist](#configuration-checklist)

---

## Overview

Recovery Journey is designed to be HIPAA-compliant from the ground up. The platform handles sensitive patient information related to substance abuse treatment, which requires additional protections under 42 CFR Part 2.

### Applicable Regulations

| Regulation | Description |
|------------|-------------|
| HIPAA Privacy Rule | 45 CFR § 164.500-534 |
| HIPAA Security Rule | 45 CFR § 164.302-318 |
| HIPAA Breach Notification | 45 CFR § 164.400-414 |
| 42 CFR Part 2 | Confidentiality of Substance Use Disorder Records |

---

## Protected Health Information (PHI)

### PHI Categories Handled

The system processes the following types of PHI:

- **Demographics**: Name, date of birth, address, phone number
- **Identifiers**: Medical record number, insurance ID
- **Clinical**: Diagnosis, medications, treatment notes
- **Substance use history**: Drug/alcohol use patterns, recovery progress
- **Communication**: Messages between patients and counselors

### PHI Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Patient   │────▶│   API       │────▶│  Database   │
│   (Recover) │     │  (Backend)  │     │ (Encrypted) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Staff    │
                    │  (Journey)  │
                    └─────────────┘
```

---

## Technical Safeguards

### 1. Access Controls (§ 164.312(a)(1))

#### Unique User Identification
- Every user has a unique identifier (UUID)
- No shared accounts permitted
- Email-based authentication

#### Automatic Logoff
- Session timeout: 15 minutes (production)
- Configurable via `SESSION_TIMEOUT_MINUTES`
- JWT tokens expire after 15 minutes

#### Encryption and Decryption
- AES-256-GCM for data at rest
- TLS 1.3 for data in transit
- See `src/lib/encryption.ts`

**Implementation:**
```typescript
// Encrypt PHI fields before storage
import { encrypt, decrypt } from './lib/encryption'

const encryptedSSN = encrypt(patient.ssn)
const decryptedSSN = decrypt(storedValue)
```

### 2. Audit Controls (§ 164.312(b))

All PHI access is logged with:

| Field | Description |
|-------|-------------|
| Timestamp | When the action occurred |
| User ID | Who performed the action |
| Patient ID | Whose data was accessed |
| Action | What was done (VIEW, CREATE, UPDATE, DELETE) |
| IP Address | Source of the request |
| Outcome | Success or failure |

**Implementation:**
```typescript
import { logDataAccess, AuditEventType } from './lib/audit'

await logDataAccess(AuditEventType.PATIENT_VIEW, {
  userId: currentUser.id,
  patientId: patient.id,
  resourceType: 'Patient',
  resourceId: patient.id
})
```

### 3. Integrity Controls (§ 164.312(c)(1))

- Database transactions ensure atomic operations
- Audit log entries include tamper-detection hashes
- Input validation and sanitization on all endpoints
- See `src/lib/sanitize.ts` and `src/middleware/sanitize.ts`

### 4. Transmission Security (§ 164.312(e)(1))

- TLS 1.3 required for all connections
- HSTS enabled with 1-year max-age
- Certificate pinning for mobile apps
- WebSocket connections secured with WSS

**Configuration:**
```env
FORCE_SSL=true
HSTS_MAX_AGE=31536000
```

---

## Administrative Safeguards

### 1. Security Management (§ 164.308(a)(1))

#### Risk Assessment
- Regular security audits recommended
- Penetration testing before production launch
- Dependency vulnerability scanning via Dependabot

#### Workforce Security
- Role-based access control (RBAC)
- Minimum necessary access principle
- Background check requirements (operational)

### 2. Access Management (§ 164.308(a)(4))

#### User Roles

| Role | Access Level |
|------|--------------|
| SUPER_ADMIN | Full system access |
| FACILITY_ADMIN | Facility-level management |
| COUNSELOR | Patient care within assigned caseload |

#### Authorization Process
1. User created by admin with specific role
2. Multi-factor authentication required (production)
3. Access limited to assigned facility
4. Automatic deactivation after 90 days inactivity

### 3. Security Awareness Training

Recommendations for operators:
- Annual HIPAA training for all staff
- Phishing awareness training
- Secure password practices
- Incident reporting procedures

### 4. Contingency Planning (§ 164.308(a)(7))

#### Backup Procedures
- Daily encrypted database backups
- 90-day retention (configurable)
- Offsite storage via S3
- See `scripts/backup.sh`

#### Disaster Recovery
- Restore procedures documented
- RTO: 4 hours
- RPO: 24 hours
- See `scripts/restore.sh`

---

## Physical Safeguards

### Production Environment Requirements

| Control | Requirement |
|---------|-------------|
| Data Center | SOC 2 Type II certified |
| Server Access | Badge + biometric |
| Workstation | Screen lock, encrypted drives |
| Device Disposal | NIST SP 800-88 compliant |

### Cloud Provider Compliance

When using AWS/GCP/Azure:
- Use HIPAA-eligible services only
- Sign Business Associate Agreement (BAA)
- Enable encryption at rest
- Use private subnets for databases

---

## 42 CFR Part 2 Compliance

Substance use disorder (SUD) records have **additional protections** beyond HIPAA.

### Key Requirements

1. **Written Consent Required**
   - Patient must sign written consent for any disclosure
   - Consent must specify: recipient, purpose, duration
   - Re-disclosure prohibition notice required

2. **No Re-disclosure**
   - Recipients cannot share SUD information further
   - Notice required on all disclosures

3. **Restricted Disclosures**
   - Cannot disclose for employment decisions
   - Cannot disclose for legal proceedings without court order
   - Medical emergencies have limited exceptions

### Implementation

```typescript
// Check consent before any disclosure
async function canDiscloseToRecipient(
  patientId: string,
  recipientId: string,
  purpose: string
): Promise<boolean> {
  const consent = await prisma.consentForm.findFirst({
    where: {
      patientId,
      recipientId,
      purpose,
      status: 'ACTIVE',
      expiresAt: { gt: new Date() }
    }
  })
  return !!consent
}
```

---

## Audit Controls

### Audit Log Schema

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  category VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  user_id UUID,
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  facility_id UUID,
  patient_id UUID,
  resource_type VARCHAR(100),
  resource_id UUID,
  action VARCHAR(255) NOT NULL,
  outcome VARCHAR(20) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_id UUID,
  session_id UUID,
  details JSONB,
  phi_accessed BOOLEAN DEFAULT FALSE,
  previous_value TEXT,
  new_value TEXT,
  hash VARCHAR(64) NOT NULL
);
```

### Audit Events Tracked

| Category | Events |
|----------|--------|
| Authentication | Login, logout, password change, MFA |
| Data Access | View, search, list patients |
| Data Modification | Create, update, delete records |
| Security | Failed logins, rate limits, suspicious activity |
| Export | Data exports, report generation |

### Audit Log Retention

- Minimum: 6 years (HIPAA requirement)
- Recommended: 10 years
- Audit logs are immutable and encrypted

---

## Incident Response

### Breach Detection

The system monitors for:
- Multiple failed login attempts
- Unusual access patterns
- Large data exports
- Access outside business hours
- Access from unknown locations

### Breach Response Procedure

1. **Identify** - Detect and confirm the breach
2. **Contain** - Block compromised accounts/systems
3. **Assess** - Determine scope and affected individuals
4. **Notify** - Within 60 days per HIPAA (sooner if required)
5. **Document** - Full incident report for 6 years
6. **Remediate** - Fix vulnerabilities, update procedures

### Notification Requirements

| Affected Individuals | Notification Method |
|---------------------|---------------------|
| < 500 | Individual notice within 60 days |
| ≥ 500 | Media notice + HHS immediately |

---

## Configuration Checklist

### Production Environment Variables

```env
# Required for HIPAA Compliance
NODE_ENV=production
FORCE_SSL=true

# Encryption (generate unique 64-character hex keys)
ENCRYPTION_KEY=<generate-with-scripts/generate-secrets.js>
JWT_SECRET=<generate-unique-key>
JWT_REFRESH_SECRET=<generate-unique-key>

# Session Security
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SESSION_TIMEOUT_MINUTES=15

# Access Controls
REQUIRE_MFA=true
PASSWORD_MIN_LENGTH=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30

# Audit & Logging
AUDIT_LOG_ENABLED=true
LOG_LEVEL=info

# Backup
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=90
ENCRYPT_BACKUPS=true
```

### Pre-Deployment Checklist

- [ ] TLS certificates installed and valid
- [ ] Encryption keys generated and secured
- [ ] Database encrypted at rest
- [ ] Backup procedures tested
- [ ] Restore procedures tested
- [ ] Audit logging enabled and verified
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Access controls configured
- [ ] MFA enabled for all users
- [ ] Business Associate Agreement signed (if using cloud)
- [ ] Staff HIPAA training completed
- [ ] Incident response plan documented
- [ ] Security risk assessment completed

---

## Contact

For security concerns or to report vulnerabilities:
- Security Team: security@recoveryjourney.app
- HIPAA Privacy Officer: privacy@recoveryjourney.app

---

*This document should be reviewed and updated annually or when significant changes occur to the system.*

**Last Updated:** January 2026
**Version:** 1.0
