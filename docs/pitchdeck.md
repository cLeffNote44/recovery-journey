# RecoverJourney Pitch Deck

**AI-Powered Recovery Management Platform**
HIPAA & 42 CFR Part 2 Compliant

Desktop Portal for Clinicians. Mobile App for Patients. One Connected Ecosystem.

*Confidential | recoverjourney.com*

---

## Contents

1. The Challenge — 3
2. The Solution — 4
3. AI Relapse Risk Prediction — 5
4. Clinician Portal — Journey — 6
5. Patient Companion App — Recover — 7
6. What Sets Us Apart — 8
7. Compliance & Security — 9
8. How It Works — 10
9. Platform at a Glance — 11
10. Next Steps — 12

---

## 1. The Challenge

Substance abuse treatment facilities face four systemic problems that undermine patient outcomes and operational efficiency.

**Reactive, Not Predictive**
Most facilities only learn about relapse risk after it happens. Staff respond to crises instead of preventing them. By the time warning signs are noticed, the window for early intervention has closed.

**Disconnected Systems**
Patient data lives in paper forms, spreadsheets, separate EHRs, and text messages. Nothing talks to each other. Staff waste hours re-entering data and hunting for information across fragmented tools.

**Patient Disengagement**
Between sessions, patients have no structured way to track progress, practice skills, or communicate with their care team. The critical hours between appointments are unsupported.

**Compliance Burden**
HIPAA and 42 CFR Part 2 compliance requires extensive documentation, audit trails, and secure communication. Most facilities handle this manually, increasing cost and error risk.

---

## 2. The Solution

RecoverJourney is the first recovery management platform that combines AI-powered relapse prediction, real-time patient engagement, and clinical workflow automation — all built on a HIPAA-compliant foundation.

### Journey — Clinician Portal
- Real-time facility dashboard with census and alerts
- Patient management and intake workflow
- HIPAA-compliant secure messaging
- Treatment plan builder with phase tracking
- 14 clinical form templates with smart form-fill
- Appointment scheduling and calendar
- Comprehensive audit logging

### Recover — Patient App
- Dual progress tracking (sobriety + streak)
- Daily mood check-ins with HALT assessment
- AI relapse risk prediction
- 12-step digital work tracker
- 7 evidence-based skill modules
- 40+ achievement badges
- Emergency support with crisis protocols

Both apps connect through a secure backend. When a patient checks in on their phone, clinicians see it instantly on their dashboard.

---

## 3. AI Relapse Risk Prediction

*The feature that sets RecoverJourney apart*

Our proprietary algorithm analyzes behavioral patterns to predict relapse risk 3-7 days before it happens, giving care teams time to intervene proactively.

### What It Analyzes
- Check-in frequency decline
- Mood trends and patterns
- Craving intensity and frequency
- HALT scores (Hungry, Angry, Lonely, Tired)
- Meeting attendance patterns
- Social isolation indicators

### What It Outputs
- **Risk Score (0-100)** with confidence level
- **Key Warnings** with specific risk factors identified
- **10+ Ranked Interventions** prioritized by effectiveness
- **Predicted Timeframe** for peak risk window

> No other recovery platform predicts relapse risk. Most apps only track sobriety milestones after the fact.

---

## 4. Journey — Clinician Portal

*A comprehensive desktop application for facility management*

**Facility Dashboard** — Real-time census, today's check-ins, active alerts, upcoming appointments, and recent messages — everything you need to start your day.

**Patient Management** — Searchable patient records with status tracking, registration key generation, intake workflows, and discharge management.

**Secure Messaging** — HIPAA-compliant WebSocket messaging with full audit trail. Every message logged with sender, recipient, timestamp, and delivery status.

**Treatment Plan Builder** — Multi-phase treatment plans with goal tracking, intervention scheduling, and patient enrollment management.

**Clinical Documents** — 14 form templates with smart form-fill technology. Paper underscores become digital fields. Checkboxes become real checkboxes.

**Appointment Scheduling** — Weekly calendar view with program management, appointment types, and real-time sync with the patient mobile app.

See full screenshots at recoverjourney.com/journey-portal

---

## 5. Recover — Patient Companion App

*Keeping patients engaged between sessions*

**Dual Progress Tracking** — Sobriety day counter and check-in streak with milestone celebrations and money saved calculator.

**Daily Check-Ins** — Mood tracking, personal notes, and HALT assessment synced to clinician dashboard.

**AI Risk Prediction** — Personalized risk scores with warnings, ranked interventions, and timeframe projections.

**12-Step Work Tracker** — Digital step-by-step progress with reflections, exercises, and sponsor notes.

**7 Skill Modules** — Evidence-based coping strategies covering mindfulness, cognitive restructuring, trigger management, and more.

**40+ Achievement Badges** — Gamified milestones across 6 categories that celebrate progress and maintain motivation.

**Emergency Support** — 4 crisis intervention protocols, 7 hotline numbers, grounding exercises, and quick-dial to sponsors.

**Wellness Tracking** — Sleep quality, medication adherence, exercise logging, and nutrition tracking.

See full screenshots at recoverjourney.com/recover-app

---

## 6. What Sets Us Apart

**Traffic Light System** — Patients build Green/Yellow/Red zone action plans for daily maintenance, warning signs, and crisis response.

**12-Step Digital Work** — The first platform to digitize the 12-step process with reflections, exercises, and sponsor notes.

**Money Saved Calculator** — Configurable cost-per-day tracks cumulative savings — tangible financial motivation beyond milestones.

**4 Crisis Protocols** — Structured protocols (Immediate Urge, High-Risk Situation, Emotional Crisis, Trigger Management) with timed steps and grounding exercises.

**Smart Form-Fill** — 14 templates that convert paper underscores into proper digital fields with real checkboxes and date inputs.

**Offline-First Privacy** — Patient data stays on device by default. No cloud dependency. Optional sync. HIPAA-compliant by architecture.

Unlike platforms that serve all behavioral health broadly, RecoverJourney is built specifically for substance abuse treatment.

---

## 7. Compliance & Security

*Built for compliance from day one — not bolted on after the fact*

### HIPAA Privacy & Security Rule
Full administrative, physical, and technical safeguards including access controls, audit trails, transmission security, and data integrity.

### 42 CFR Part 2
Substance use disorder confidentiality requirements met at every level with consent tracking, re-disclosure prohibition, and separate SUD access controls.

### Data Encryption
AES-256 at rest, TLS 1.3 in transit, end-to-end WebSocket encryption, certificate pinning for mobile.

### Audit Logging
Every PHI access logged with user, timestamp, action, resource, and fields viewed. Immutable records with batch-queued logging.

### Additional Security Features
- 15-minute session timeout with 2-minute warning
- Tokens stored in memory only (never localStorage)
- Two-factor authentication
- Role-based access control (Super Admin, Facility Admin, Counselor)
- Input sanitization via DOMPurify
- BAA available for covered entities

> 805 automated tests ensure reliability across the entire platform.

---

## 8. How It Works

*Up and running in days, not months*

**1. Deploy & Configure** — Set up your facility, configure roles and departments, import your patient list. No month-long implementations or IT overhead.

**2. Connect Your Patients** — Each patient receives a unique registration key. They download the Recover app and connect to your facility securely.

**3. Monitor & Intervene** — Track recovery progress, receive AI risk alerts, message patients directly, and document everything — all HIPAA-compliant.

---

## 9. Platform at a Glance

| Metric | Value |
|--------|-------|
| Clinical Form Templates | 14 |
| Achievement Badges | 40+ |
| Evidence-Based Skill Modules | 7 |
| Crisis Intervention Protocols | 4 |
| Steps Digitally Tracked | 12 |
| Staff Role Levels | 3 |
| Automated Tests | 805 |
| Offline Capable | 100% |

**Tech Stack:** React, Electron, Fastify, PostgreSQL, Capacitor. TypeScript end-to-end with Zod validation. Deployed via Docker with zero-downtime updates.

---

## 10. Next Steps

We'd love to show you RecoverJourney in action.

- **Email:** cody@leffel.io
- **Website:** recoverjourney.com
- **Schedule a Consultation:** recoverjourney.com/contact

Available for live demos, pilot programs, and custom enterprise deployments.

---

**RecoverJourney — Predict Relapse Before It Happens**

*Confidential. All rights reserved.*
