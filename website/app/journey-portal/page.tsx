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
  Activity,
  Lock,
  ArrowRight,
  LayoutDashboard,
  Smartphone,
  Star,
  Search,
  UserPlus,
  Filter,
  Wifi,
  Eye,
  Layers,
  Palette,
  Bell,
  KeyRound,
  Clock,
} from 'lucide-react';
import { BrowserFrame } from '@/components/BrowserFrame';

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.5 },
};

const fadeInUpDelay = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.5, delay },
});

function MobileIntegrationCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 p-4 rounded-xl border border-teal-500/30 bg-teal-500/5">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center mt-0.5">
          <Smartphone className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-teal-400 mb-1">
            Mobile App Integration
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
}

function BenefitCallout({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-sm font-semibold text-white/90 leading-relaxed pl-4 border-l-2 border-teal-500">
      {children}
    </p>
  );
}

function FeatureBullet({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-600/10 flex items-center justify-center mt-0.5">
        <Icon className="w-3.5 h-3.5 text-blue-400" />
      </div>
      <span className="text-sm text-slate-300 leading-relaxed">{children}</span>
    </li>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
      </div>
      <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function JourneyPortalPage() {
  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="pt-32 pb-16 lg:pt-44 lg:pb-24 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Monitor className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Desktop Application
            </span>
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
            className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            A comprehensive desktop application for managing patients,
            coordinating treatment, scheduling appointments, and running your
            recovery facility — with real-time integration to the Recover
            patient mobile app.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/recover-app"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              See Patient App
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

      {/* ───────────────────── 1. Dashboard ───────────────────── */}
      <section className="py-20 lg:py-28 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Screenshot */}
            <motion.div {...fadeInUp}>
              <BrowserFrame
                src="/screenshots/journey-dashboard.png"
                alt="Journey facility dashboard showing 24 patients, 15 check-ins, 2 alerts, average 47 days sober, reminders, appointments, and messages"
              />
            </motion.div>

            {/* Content */}
            <motion.div {...fadeInUpDelay(0.15)}>
              <SectionHeader
                icon={LayoutDashboard}
                title="Facility Dashboard"
                description="Real-time overview of your facility's operations — everything you need to start your day."
              />

              <ul className="mt-6 space-y-3">
                <FeatureBullet icon={Users}>
                  Patient census with active, pending, and discharged counts
                </FeatureBullet>
                <FeatureBullet icon={Activity}>
                  Daily check-in monitoring — see which patients checked in
                  today
                </FeatureBullet>
                <FeatureBullet icon={Bell}>
                  Alert system — missed check-ins, pending registrations,
                  treatment plan reviews
                </FeatureBullet>
                <FeatureBullet icon={Calendar}>
                  Appointment overview — today&apos;s schedule with confirmation
                  status
                </FeatureBullet>
                <FeatureBullet icon={MessageSquare}>
                  Message preview — latest patient messages with unread count
                </FeatureBullet>
              </ul>

              <MobileIntegrationCard>
                Patient check-ins from the Recover mobile app appear here in
                real-time. When a patient completes their daily mood check-in on
                their phone, the dashboard updates automatically.
              </MobileIntegrationCard>

              <BenefitCallout>
                Clinicians get a complete picture of facility activity in one
                glance — no need to check multiple systems.
              </BenefitCallout>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────── 2. Patient Management ─────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div className="order-2 lg:order-1" {...fadeInUpDelay(0.15)}>
              <SectionHeader
                icon={Users}
                title="Patient Management"
                description="Complete patient lifecycle from intake to discharge — every record in one place."
              />

              <ul className="mt-6 space-y-3">
                <FeatureBullet icon={Search}>
                  Searchable patient list with status badges (active, pending,
                  discharged)
                </FeatureBullet>
                <FeatureBullet icon={Activity}>
                  Days sober and check-in streak tracking per patient
                </FeatureBullet>
                <FeatureBullet icon={Users}>
                  Assigned counselor visibility
                </FeatureBullet>
                <FeatureBullet icon={UserPlus}>
                  Add new patient with registration key generation
                </FeatureBullet>
                <FeatureBullet icon={Filter}>
                  Filter by status — All, Active, Pending, Discharged
                </FeatureBullet>
                <FeatureBullet icon={Eye}>
                  Click through to detailed patient profile with documents,
                  timeline, and check-ins
                </FeatureBullet>
              </ul>

              <MobileIntegrationCard>
                Each patient gets a unique registration key to connect the
                Recover mobile app to their facility record. Once connected,
                their check-ins, cravings, and progress sync automatically.
              </MobileIntegrationCard>

              <BenefitCallout>
                Staff can monitor every patient&apos;s recovery status at a
                glance without waiting for manual updates.
              </BenefitCallout>
            </motion.div>

            {/* Screenshot */}
            <motion.div className="order-1 lg:order-2" {...fadeInUp}>
              <BrowserFrame
                src="/screenshots/journey-patients.png"
                alt="Journey patient list with search, status filter, and three patients showing active and pending statuses"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────── 3. Secure Messaging ───────────────── */}
      <section className="py-20 lg:py-28 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Screenshot */}
            <motion.div {...fadeInUp}>
              <BrowserFrame
                src="/screenshots/journey-messages.png"
                alt="Journey secure messaging interface with conversation list, search, and split-pane layout"
              />
            </motion.div>

            {/* Content */}
            <motion.div {...fadeInUpDelay(0.15)}>
              <SectionHeader
                icon={MessageSquare}
                title="HIPAA-Compliant Messaging"
                description="Real-time, encrypted communication with patients — every message audited."
              />

              <ul className="mt-6 space-y-3">
                <FeatureBullet icon={Wifi}>
                  WebSocket-based real-time messaging — no page refreshes
                  needed
                </FeatureBullet>
                <FeatureBullet icon={Search}>
                  Conversation list with search
                </FeatureBullet>
                <FeatureBullet icon={Bell}>
                  Unread message badge count
                </FeatureBullet>
                <FeatureBullet icon={Shield}>
                  Full audit trail for every message (who sent what, when)
                </FeatureBullet>
                <FeatureBullet icon={Lock}>
                  End-to-end encryption in transit
                </FeatureBullet>
              </ul>

              <MobileIntegrationCard>
                Patients send messages from the Recover app&apos;s Facility tab.
                Messages appear instantly on the clinician&apos;s Messages page.
                All communication is logged for HIPAA compliance.
              </MobileIntegrationCard>

              <BenefitCallout>
                Replace unsecured text messages and phone tag with a compliant,
                auditable messaging system.
              </BenefitCallout>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────── 4. Treatment Plans ────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div className="order-2 lg:order-1" {...fadeInUpDelay(0.15)}>
              <SectionHeader
                icon={ClipboardList}
                title="Treatment Plan Builder"
                description="Create, manage, and assign structured recovery programs with phase-based tracking."
              />

              <ul className="mt-6 space-y-3">
                <FeatureBullet icon={Layers}>
                  Multiple plan types: 30-day intensive, 90-day extended,
                  outpatient, dual diagnosis
                </FeatureBullet>
                <FeatureBullet icon={Activity}>
                  Phase-based progress visualization with color-coded bars
                </FeatureBullet>
                <FeatureBullet icon={Users}>
                  Patient enrollment counts per plan
                </FeatureBullet>
                <FeatureBullet icon={UserPlus}>
                  Assign plans to individual patients
                </FeatureBullet>
                <FeatureBullet icon={Filter}>
                  Draft / Active / Archived status management
                </FeatureBullet>
                <FeatureBullet icon={LayoutDashboard}>
                  Stats overview: total plans, active plans, enrolled patients,
                  drafts
                </FeatureBullet>
              </ul>

              <MobileIntegrationCard>
                Patients can view their assigned treatment plan in the Recover
                app&apos;s Facility tab. They see their current phase, upcoming
                milestones, and goals — keeping them engaged in their own
                recovery.
              </MobileIntegrationCard>

              <BenefitCallout>
                Standardize treatment protocols across your facility while still
                customizing for individual patients.
              </BenefitCallout>
            </motion.div>

            {/* Screenshot */}
            <motion.div className="order-1 lg:order-2" {...fadeInUp}>
              <BrowserFrame
                src="/screenshots/journey-treatment-plans.png"
                alt="Journey treatment plan builder with 4 plans, stats cards, and phase progress bars"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────── 5. Clinical Documents ─────────────── */}
      <section className="py-20 lg:py-28 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Screenshot */}
            <motion.div {...fadeInUp}>
              <BrowserFrame
                src="/screenshots/journey-documents.png"
                alt="Journey document management with 14 templates across 6 categories, preview and use template buttons"
              />
            </motion.div>

            {/* Content */}
            <motion.div {...fadeInUpDelay(0.15)}>
              <SectionHeader
                icon={FileText}
                title="Document Management"
                description="14 clinical form templates with smart form-fill technology — no more paper."
              />

              <ul className="mt-6 space-y-3">
                <FeatureBullet icon={FileText}>
                  Template library: intake forms, medical history, consent,
                  HIPAA authorization, biopsychosocial, risk assessment,
                  treatment plan, progress notes, discharge summary, aftercare
                  plan, and more
                </FeatureBullet>
                <FeatureBullet icon={Filter}>
                  Category sidebar with counts — Intake, Medical, Consent,
                  Progress, Discharge, Other
                </FeatureBullet>
                <FeatureBullet icon={Shield}>
                  &ldquo;Use Template&rdquo; creates a patient-specific copy —
                  stock templates can never be modified or deleted
                </FeatureBullet>
                <FeatureBullet icon={Star}>
                  Smart form renderer: underscores become proper input fields,
                  checkboxes become real checkboxes
                </FeatureBullet>
                <FeatureBullet icon={Users}>
                  Patient Documents tab for filled-out copies
                </FeatureBullet>
                <FeatureBullet icon={Eye}>
                  Preview mode for read-only viewing
                </FeatureBullet>
              </ul>

              <MobileIntegrationCard>
                Completed documents are linked to patient profiles. When
                clinicians fill out intake forms or progress notes, that
                documentation connects directly to the patient record accessible
                from both Journey and the Recover app.
              </MobileIntegrationCard>

              <BenefitCallout>
                Eliminate paper forms. Smart form-fill means no more messy
                underlines or broken formatting — just clean, professional
                clinical documentation.
              </BenefitCallout>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────── 6. Appointments ────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div className="order-2 lg:order-1" {...fadeInUpDelay(0.15)}>
              <SectionHeader
                icon={Calendar}
                title="Appointment Scheduling"
                description="Visual calendar with color-coded sessions and program management."
              />

              <ul className="mt-6 space-y-3">
                <FeatureBullet icon={Calendar}>
                  Weekly calendar view with Day / Week / Month toggles
                </FeatureBullet>
                <FeatureBullet icon={Palette}>
                  Color-coded appointment types: Group Therapy, Individual
                  Therapy, Psychoeducation, Medical Consultation, Art Therapy,
                  Family Session, Case Management
                </FeatureBullet>
                <FeatureBullet icon={Layers}>
                  Program management: IOP, PHP, Residential, Outpatient tracks
                </FeatureBullet>
                <FeatureBullet icon={UserPlus}>
                  New appointment creation with patient assignment
                </FeatureBullet>
                <FeatureBullet icon={Users}>
                  Program assignment to patients
                </FeatureBullet>
                <FeatureBullet icon={Activity}>
                  Confirmation status tracking
                </FeatureBullet>
              </ul>

              <MobileIntegrationCard>
                Patients see their upcoming appointments in the Recover
                app&apos;s Calendar tab. Appointment reminders can be sent as
                push notifications on their phone.
              </MobileIntegrationCard>

              <BenefitCallout>
                Visual scheduling prevents double-bookings and ensures every
                patient gets their required therapy hours.
              </BenefitCallout>
            </motion.div>

            {/* Screenshot */}
            <motion.div className="order-1 lg:order-2" {...fadeInUp}>
              <BrowserFrame
                src="/screenshots/journey-appointments.png"
                alt="Journey weekly calendar view with color-coded group therapy, individual therapy, psychoeducation, medical, family, art therapy, and case management sessions"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────── 7. Settings & Security ─────────────── */}
      <section className="py-20 lg:py-28 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Screenshot */}
            <motion.div {...fadeInUp}>
              <BrowserFrame
                src="/screenshots/journey-settings.png"
                alt="Journey settings page with appearance dark mode toggle, profile management, notification preferences, and security controls including 2FA"
              />
            </motion.div>

            {/* Content */}
            <motion.div {...fadeInUpDelay(0.15)}>
              <SectionHeader
                icon={Settings}
                title="Settings & Security"
                description="Account management and HIPAA security controls — compliant by default."
              />

              <ul className="mt-6 space-y-3">
                <FeatureBullet icon={Palette}>
                  Appearance: dark / light mode toggle
                </FeatureBullet>
                <FeatureBullet icon={Users}>
                  Profile management: name, email (admin-controlled)
                </FeatureBullet>
                <FeatureBullet icon={Bell}>
                  Notification preferences: check-ins, missed alerts, messages,
                  appointments
                </FeatureBullet>
                <FeatureBullet icon={KeyRound}>
                  Security: password change, two-factor authentication setup
                </FeatureBullet>
                <FeatureBullet icon={Clock}>
                  Session timeout: automatic logout after 15 minutes of
                  inactivity
                </FeatureBullet>
              </ul>

              <MobileIntegrationCard>
                Security settings are enforced server-side. The same session
                timeout and 2FA requirements apply whether staff access Journey
                from a desktop or any device.
              </MobileIntegrationCard>

              <BenefitCallout>
                One click to enable 2FA. HIPAA session timeout built in — your
                facility is compliant by default.
              </BenefitCallout>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── CTA ────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-white mb-4"
            {...fadeInUp}
          >
            Ready to see more?
          </motion.h2>
          <motion.p
            className="text-slate-400 mb-8 max-w-xl mx-auto"
            {...fadeInUpDelay(0.1)}
          >
            Explore the patient-facing Recover app or schedule a personalized
            demo with our team.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            {...fadeInUpDelay(0.2)}
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
