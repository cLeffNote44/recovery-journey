'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Monitor,
  Users,
  ClipboardList,
  MessageSquare,
  FileText,
  Calendar,
  Settings,
  Shield,
  Building2,
  ScrollText,
  Activity,
  Bell,
  Lock,
  UserCog,
  ArrowRight,
} from 'lucide-react';
import { BrowserFrame } from '@/components/BrowserFrame';

const featureGrid = [
  {
    icon: Users,
    title: 'Patient Management',
    description:
      'Complete patient intake workflows, demographic profiles, insurance details, and treatment history all in one place.',
  },
  {
    icon: ClipboardList,
    title: 'Treatment Plans',
    description:
      'Create structured treatment plans with goals, objectives, and interventions. Track progress and adjust based on outcomes.',
  },
  {
    icon: MessageSquare,
    title: 'Secure Messaging',
    description:
      'HIPAA-compliant real-time messaging powered by WebSocket connections. Full message history with audit trails.',
  },
  {
    icon: FileText,
    title: 'Documents',
    description:
      'Rich text clinical documentation with TipTap editor. Templates for progress notes, assessments, and discharge summaries.',
  },
  {
    icon: Calendar,
    title: 'Appointments',
    description:
      'Schedule individual and group sessions with automated reminders. Track confirmations and manage recurring appointments.',
  },
  {
    icon: Settings,
    title: 'Settings',
    description:
      'Configure two-factor authentication, notification preferences, and account security. Manage personal and facility settings.',
  },
  {
    icon: Building2,
    title: 'SuperAdmin',
    description:
      'Multi-facility management for enterprise deployments. Oversee all locations, staff, and compliance from a single pane.',
  },
  {
    icon: ScrollText,
    title: 'Audit Logging',
    description:
      'Comprehensive PHI access tracking with immutable records. Every view, edit, and export is logged for compliance audits.',
  },
];

export default function JourneyPortalPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-44 lg:pb-24 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Monitor className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Desktop Application</span>
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Journey — Clinician Portal
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            A powerful desktop application for managing patients, coordinating care,
            and running your recovery facility
          </motion.p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Built for Recovery Professionals
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Journey is an Electron-based desktop application designed specifically for
              clinicians, counselors, and facility administrators. It provides a comprehensive
              command center for managing every aspect of patient care — from intake and
              treatment planning to secure messaging and compliance reporting. Built with
              HIPAA and 42 CFR Part 2 compliance at its core, Journey ensures your facility
              meets the highest standards of data protection while streamlining daily operations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Screenshot Section */}
      <section className="py-20 lg:py-28 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Facility Dashboard
              </h2>
            </div>
            <p className="text-slate-400 max-w-2xl">
              Your entire facility at a glance. The dashboard surfaces the most important
              metrics and alerts so you can focus on what matters most — your patients.
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <BrowserFrame
              src="/screenshots/journey-dashboard.png"
              alt="Journey clinician dashboard showing patient census, check-ins, alerts, appointments, and messaging"
              className="mx-auto"
            />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Users,
                title: 'Patient Overview',
                description: 'See total patients, active count, and quickly access any patient record from the dashboard.',
              },
              {
                icon: Activity,
                title: 'Daily Check-In Monitoring',
                description: 'Monitor which patients have completed their daily check-ins and identify those who may need outreach.',
              },
              {
                icon: Bell,
                title: 'Alert System',
                description: 'Immediate notifications for missed check-ins, pending registrations, and items requiring attention.',
              },
              {
                icon: Calendar,
                title: 'Upcoming Appointments',
                description: 'View scheduled appointments with confirmation status so you can prepare for each session.',
              },
              {
                icon: MessageSquare,
                title: 'Messaging Preview',
                description: 'Real-time messaging preview with unread count so you never miss an important patient message.',
              },
              {
                icon: UserCog,
                title: 'Staff Role Management',
                description: 'Support for Super Admin, Facility Admin, and Counselor roles with appropriate access levels.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="p-5 rounded-xl bg-navy-800/50 border border-white/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <item.icon className="w-5 h-5 text-teal-400 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Screenshot Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Secure Authentication
              </h2>
            </div>
            <p className="text-slate-400 max-w-2xl">
              Every session starts with enterprise-grade security. The login experience is
              designed to be fast for staff while meeting strict compliance requirements.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <BrowserFrame
                src="/screenshots/journey-login.png"
                alt="Journey secure login page with split-layout design and HIPAA-compliant authentication"
                className="mx-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <ul className="space-y-5">
                {[
                  {
                    icon: Shield,
                    title: 'Split-Layout Design',
                    description: 'Clean, branded login experience with your facility information alongside secure credential entry.',
                  },
                  {
                    icon: Lock,
                    title: 'JWT Authentication',
                    description: 'Industry-standard JSON Web Token authentication with access tokens stored in memory only — never persisted to disk.',
                  },
                  {
                    icon: Settings,
                    title: 'Remember Me & Password Recovery',
                    description: 'Convenient remember-me option for trusted devices with secure forgot-password flow via email verification.',
                  },
                  {
                    icon: Activity,
                    title: 'Session Timeout Protection',
                    description: '15-minute inactivity auto-logout with a 2-minute warning countdown. Sessions end with a logged reason for audit compliance.',
                  },
                ].map((item, index) => (
                  <li key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-teal-600/10 flex items-center justify-center mt-0.5">
                      <item.icon className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 lg:py-28 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Everything Your Team Needs
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Journey covers the full spectrum of facility management — from patient intake
              to compliance reporting.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureGrid.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-6 rounded-xl bg-navy-800/60 border border-white/5 hover:border-white/10 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to see more?
          </motion.h2>
          <motion.p
            className="text-slate-400 mb-8 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Explore the patient-facing Recover app or schedule a personalized demo with our team.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/recover-app"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              See the Patient App
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors"
            >
              Request Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
