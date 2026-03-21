'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Monitor,
  Smartphone,
  Server,
  Shield,
  Users,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Calendar,
  FileText,
  Bell,
  Lock,
  Activity,
  Heart,
  BookOpen,
  Fingerprint,
  RefreshCw,
  Database,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { FeatureCard } from '@/components/FeatureCard';

const journeyFeatures = [
  {
    icon: Users,
    title: 'Patient Management',
    description:
      'Comprehensive patient records with intake forms, demographics, insurance details, and treatment history. Search, filter, and manage your entire caseload from a unified dashboard.',
  },
  {
    icon: ClipboardList,
    title: 'Treatment Plan Builder',
    description:
      'Create structured treatment plans with goals, objectives, and interventions. Track progress over time and adjust plans based on patient outcomes.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard & Analytics',
    description:
      'Real-time facility metrics including census, admissions, discharges, and outcome tracking. Visualize trends and generate reports for stakeholders.',
  },
  {
    icon: Calendar,
    title: 'Scheduling',
    description:
      'Manage appointments, group sessions, and staff schedules. Automatic reminders keep patients and staff aligned on upcoming commitments.',
  },
  {
    icon: MessageSquare,
    title: 'Secure Messaging',
    description:
      'HIPAA-compliant real-time messaging between staff members and with patients. Full message history with audit trails for compliance.',
  },
  {
    icon: FileText,
    title: 'Documentation',
    description:
      'Digital clinical documentation with templates for progress notes, assessments, and discharge summaries. Rich text editing with compliance-safe sanitization.',
  },
];

const recoverFeatures = [
  {
    icon: Activity,
    title: 'Daily Check-Ins',
    description:
      'Patients log their mood, cravings, sleep quality, and overall wellness daily. Data flows to their care team for real-time monitoring and early intervention.',
  },
  {
    icon: Heart,
    title: 'Progress Milestones',
    description:
      'Visual tracking of recovery milestones and sobriety goals. Celebrate achievements and maintain motivation through the recovery journey.',
  },
  {
    icon: BookOpen,
    title: 'Resource Library',
    description:
      'Curated recovery resources including coping strategies, educational content, and community resources. Facilities can add custom materials.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Appointment reminders, medication alerts, and check-in prompts. Configurable notification preferences respect patient boundaries.',
  },
  {
    icon: MessageSquare,
    title: 'Care Team Messaging',
    description:
      'Secure, encrypted messaging directly with counselors and care coordinators. Patients can reach their team when they need support.',
  },
  {
    icon: Fingerprint,
    title: 'Biometric Authentication',
    description:
      'Face ID and fingerprint authentication for secure, convenient access. No password fatigue while maintaining strong security.',
  },
];

const infrastructureFeatures = [
  {
    icon: Zap,
    title: 'Real-Time WebSocket',
    description:
      'Instant message delivery and live updates powered by WebSocket connections. No page refreshes, no delays.',
  },
  {
    icon: Database,
    title: 'PostgreSQL Database',
    description:
      'Enterprise-grade PostgreSQL database with automated backups, point-in-time recovery, and data replication for reliability.',
  },
  {
    icon: RefreshCw,
    title: 'Offline-First Architecture',
    description:
      'The patient app works offline with local data storage and automatic sync when connectivity returns. Critical for patients in varied environments.',
  },
  {
    icon: Globe,
    title: 'REST API',
    description:
      'Clean, well-documented REST API for integration with existing systems. Enterprise clients can build custom workflows and data pipelines.',
  },
];

const complianceFeaturesList = [
  'AES-256 encryption at rest for all stored data',
  'TLS 1.3 encryption for all data in transit',
  'Role-based access control (RBAC) with minimum necessary principle',
  'Comprehensive audit logging with immutable records',
  '15-minute auto-logout with configurable warning period',
  'Access tokens stored in memory only -- never persisted to disk',
  'Automatic PHI sanitization in all user inputs',
  'Session management with device tracking',
  'Failed login attempt monitoring and lockout',
  'Data retention policies with configurable periods',
  'Secure password hashing with bcrypt',
  'Request rate limiting to prevent abuse',
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-44 lg:pb-24 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Platform Features
          </motion.h1>
          <motion.p
            className="text-lg text-slate-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            A comprehensive look at everything Recovery Journey offers for
            clinicians, patients, and facility administrators.
          </motion.p>
        </div>
      </section>

      {/* Journey Features */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center gap-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Journey -- Clinician Portal
              </h2>
              <p className="text-slate-400">
                Desktop application for clinical staff and administrators
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {journeyFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recover Features */}
      <section className="py-24 lg:py-32 bg-navy-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center gap-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Recover -- Patient App
              </h2>
              <p className="text-slate-400">
                Mobile and web application for patients in recovery
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recoverFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center gap-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-lg bg-purple-600/10 flex items-center justify-center">
              <Server className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Infrastructure & Backend
              </h2>
              <p className="text-slate-400">
                Enterprise-grade technology powering the platform
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {infrastructureFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Features */}
      <section className="py-24 lg:py-32 bg-navy-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center gap-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-lg bg-teal-600/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Compliance & Security
              </h2>
              <p className="text-slate-400">
                Built-in safeguards for HIPAA and 42 CFR Part 2
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {complianceFeaturesList.map((feature, index) => (
              <motion.div
                key={feature}
                className="flex items-start gap-3 p-4 rounded-xl bg-navy-800/30 border border-white/5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">{feature}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/compliance"
              className="inline-flex items-center gap-2 text-teal-400 font-medium hover:text-teal-300 transition-colors"
            >
              View full compliance documentation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              See It in Action
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Schedule a personalized demo to see how Recovery Journey can
              streamline your facility operations.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/25"
            >
              Request a Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
