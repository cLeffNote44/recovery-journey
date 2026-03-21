'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield,
  Lock,
  FileText,
  Eye,
  Server,
  Key,
  Clock,
  UserCheck,
  AlertTriangle,
  Database,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const hipaaFeatures = [
  {
    icon: Lock,
    title: 'Access Controls',
    items: [
      'Unique user identification for all staff accounts',
      'Role-based access control (Super Admin, Facility Admin, Counselor)',
      'Minimum necessary access principle enforced at the application level',
      'Emergency access procedures documented and testable',
      'Automatic session termination after 15 minutes of inactivity',
    ],
  },
  {
    icon: FileText,
    title: 'Audit Controls',
    items: [
      'Comprehensive audit logging of all PHI access and modifications',
      'Immutable audit records with user ID, timestamp, action, and resource',
      'Field-level tracking of viewed and modified patient data',
      'Batch-queued logging with immediate dispatch for critical events',
      'Audit log retention for minimum 6 years per HIPAA requirements',
    ],
  },
  {
    icon: Server,
    title: 'Transmission Security',
    items: [
      'TLS 1.3 encryption for all data in transit',
      'WebSocket connections encrypted end-to-end',
      'Certificate pinning for mobile applications',
      'API requests authenticated with JWT tokens',
      'Rate limiting and request throttling to prevent abuse',
    ],
  },
  {
    icon: Database,
    title: 'Data Integrity',
    items: [
      'AES-256 encryption for all data at rest',
      'Automated database backups with point-in-time recovery',
      'Input validation and sanitization with Zod schemas',
      'Rich text sanitization through DOMPurify to prevent XSS',
      'Data validation at both client and server boundaries',
    ],
  },
];

const cfrFeatures = [
  'Substance use disorder treatment records maintained under heightened confidentiality',
  'Patient consent required before any disclosure of SUD treatment information',
  'Consent forms track purpose, recipient, and expiration of each disclosure',
  'Re-disclosure prohibition notices attached to all shared records',
  'Separate access controls for SUD-specific treatment data',
  'Audit logging specifically tracks access to Part 2 protected information',
  'Court order verification procedures for compelled disclosures',
  'Research access controls with proper de-identification',
];

const technicalSafeguards = [
  {
    icon: Key,
    title: 'Authentication',
    description:
      'Secure password hashing with bcrypt. Access tokens stored in memory only and never persisted to localStorage, sessionStorage, or cookies. Refresh token rotation prevents replay attacks.',
  },
  {
    icon: Clock,
    title: 'Session Management',
    description:
      'Automatic session timeout after 15 minutes of inactivity with a 2-minute warning. Logout requires a reason parameter for audit purposes. Device tracking identifies concurrent sessions.',
  },
  {
    icon: UserCheck,
    title: 'Authorization',
    description:
      'Three-tier role system: Super Admin, Facility Admin, and Counselor. Each role has precisely scoped permissions. All API endpoints enforce authorization middleware before processing requests.',
  },
  {
    icon: AlertTriangle,
    title: 'Threat Protection',
    description:
      'Security headers including CSP, HSTS, X-Frame-Options, and X-Content-Type-Options. Rate limiting on all endpoints. Request sanitization strips potential injection vectors from all inputs.',
  },
  {
    icon: Eye,
    title: 'Monitoring',
    description:
      'Real-time monitoring of failed authentication attempts with automatic lockout. Anomalous access pattern detection. Health check endpoints for uptime monitoring.',
  },
  {
    icon: Shield,
    title: 'Infrastructure',
    description:
      'Deployed on SOC 2 compliant cloud infrastructure. Network isolation with VPC. Regular security assessments and penetration testing. Automated vulnerability scanning.',
  },
];

export default function CompliancePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-44 lg:pb-24 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-teal-900/30 text-teal-400 border border-teal-800/50 mb-6">
              <Shield className="w-3.5 h-3.5" />
              Security & Compliance
            </span>
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Built for Healthcare Compliance
          </motion.h1>
          <motion.p
            className="text-lg text-slate-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Recovery Journey meets the highest standards for healthcare data
            protection, including HIPAA Privacy and Security Rules and 42 CFR
            Part 2 substance use disorder confidentiality.
          </motion.p>
        </div>
      </section>

      {/* HIPAA Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              HIPAA Privacy &amp; Security Rule
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl">
              Our platform implements the full spectrum of HIPAA technical
              safeguards. These controls are not add-on features; they are
              fundamental to how Recovery Journey is built.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {hipaaFeatures.map((section, sIndex) => (
              <motion.div
                key={section.title}
                className="p-8 rounded-2xl bg-navy-800/50 border border-white/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: sIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-teal-600/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 42 CFR Part 2 */}
      <section className="py-24 lg:py-32 bg-navy-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                42 CFR Part 2
              </h2>
              <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                Substance use disorder treatment records require protections
                beyond standard HIPAA requirements. 42 CFR Part 2 restricts
                disclosure of SUD patient identifying information and imposes
                additional consent and confidentiality obligations.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Recovery Journey is purpose-built for SUD treatment providers,
                which means Part 2 compliance is woven into every feature, from
                consent management to audit logging to re-disclosure controls.
              </p>
            </motion.div>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {cfrFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-navy-800/30 border border-white/5"
                >
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technical Safeguards */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Technical Safeguards
            </h2>
            <p className="text-lg text-slate-400">
              A detailed look at the security architecture protecting your data.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {technicalSafeguards.map((safeguard, index) => (
              <motion.div
                key={safeguard.title}
                className="p-6 rounded-2xl bg-navy-800/50 border border-white/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <safeguard.icon className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {safeguard.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {safeguard.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BAA Section */}
      <section className="py-24 lg:py-32 bg-navy-950/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <FileText className="w-12 h-12 text-teal-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Business Associate Agreement
            </h2>
            <p className="text-lg text-slate-400 mb-4 leading-relaxed">
              A Business Associate Agreement (BAA) is included with all
              Enterprise plans and available upon request for Professional plan
              subscribers. Our BAA covers all aspects of data handling, storage,
              transmission, and breach notification procedures.
            </p>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Contact our sales team to discuss your compliance requirements and
              obtain a BAA for your organization.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/25"
            >
              Request a BAA
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
