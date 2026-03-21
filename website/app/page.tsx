'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Server,
  ShieldCheck,
  Monitor,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Brain,
  AlertTriangle,
  Target,
  Activity,
  TrafficCone,
  BookOpen,
  DollarSign,
  Siren,
  FileText,
  WifiOff,
  Rocket,
  Link2,
  Eye,
  Clock,
  KeyRound,
  Scale,
  Sparkles,
  Phone,
  BarChart3,
  Award,
  BookOpenCheck,
  HeartPulse,
} from 'lucide-react';

import { PricingCard } from '@/components/PricingCard';
import { ComplianceBadge } from '@/components/ComplianceBadge';
import { FAQ } from '@/components/FAQ';
import { BrowserFrame } from '@/components/BrowserFrame';
import { PhoneFrame } from '@/components/PhoneFrame';

/* ───────────────────────── DATA ───────────────────────── */

const trustBadges = [
  { icon: ShieldCheck, title: 'HIPAA Compliant', description: 'Full Privacy & Security Rule adherence' },
  { icon: Lock, title: '42 CFR Part 2', description: 'Substance use disorder confidentiality' },
  { icon: Server, title: 'AES-256 Encryption', description: 'Data encrypted at rest & in transit' },
  { icon: Shield, title: 'SOC 2 Ready', description: 'Enterprise security controls' },
];

const heroStats = [
  { value: '14', label: 'Clinical Form Templates' },
  { value: '40+', label: 'Achievement Badges' },
  { value: '7', label: 'Evidence-Based Skill Modules' },
  { value: '4', label: 'Crisis Intervention Protocols' },
];

const aiFeatures = [
  {
    icon: Brain,
    title: 'Predictive Intelligence',
    description: 'Risk score 0\u2013100 with confidence metrics and timeframe projections.',
  },
  {
    icon: AlertTriangle,
    title: 'Key Warnings',
    description: 'Identifies specific risk factors \u2014 social isolation, meeting decline, mood shifts.',
  },
  {
    icon: Target,
    title: 'Ranked Interventions',
    description: '10+ personalized actions prioritized by effectiveness and time required.',
  },
  {
    icon: Activity,
    title: 'HALT Integration',
    description: 'Hungry, Angry, Lonely, Tired assessment feeds directly into prediction.',
  },
];

const clinicianFeatures = [
  'Patient management and intake',
  'HIPAA-compliant messaging',
  'Treatment plan builder with phase tracking',
  '14 clinical form templates with smart form-fill',
  'Appointment scheduling and calendar',
  'Comprehensive audit logging',
];

const patientFeatures = [
  'Dual progress tracking (sobriety + streak)',
  'Daily mood check-ins with HALT assessment',
  'AI relapse risk prediction',
  '12-step digital work tracker',
  '7 evidence-based skill modules',
  '40+ achievement badges',
  'Emergency support with crisis protocols',
];

const differentiators = [
  {
    icon: TrafficCone,
    title: 'Traffic Light Relapse Prevention',
    description:
      'Patients build their own Green/Yellow/Red zone action plans. Green for daily maintenance, Yellow for warning signs, Red for crisis response \u2014 with quick-dial to sponsors and therapists.',
  },
  {
    icon: BookOpen,
    title: '12-Step Digital Work Tracker',
    description:
      'Full step-by-step progress tracking with reflections, exercises, and sponsor notes. The first platform to digitize the 12-step process.',
  },
  {
    icon: DollarSign,
    title: 'Money Saved Calculator',
    description:
      'Show patients the tangible financial benefit of sobriety. Configurable cost-per-day tracks cumulative savings \u2014 real motivation beyond milestones.',
  },
  {
    icon: Siren,
    title: '4 Crisis Intervention Protocols',
    description:
      'Not just a list of hotline numbers. Four structured protocols: Immediate Urge, High-Risk Situation, Emotional Crisis, and Trigger Management \u2014 each with timed steps and grounding exercises.',
  },
  {
    icon: FileText,
    title: 'Smart Clinical Form-Fill',
    description:
      '14 templates that convert paper underscores into proper digital fields. Checkboxes become real checkboxes. Dates become date inputs. No more broken formatting.',
  },
  {
    icon: WifiOff,
    title: 'Offline-First Privacy',
    description:
      'Patient data stays on their device by default. No cloud dependency. No data collection. Optional sync when they choose. HIPAA-compliant by architecture, not just policy.',
  },
];

const howItWorks = [
  {
    step: '01',
    icon: Rocket,
    title: 'Deploy in Days',
    description:
      'Set up your facility, configure roles, import patient list. No month-long implementations.',
  },
  {
    step: '02',
    icon: Link2,
    title: 'Connect Your Patients',
    description:
      'Each patient gets a unique registration key. They download the Recover app and connect to your facility securely.',
  },
  {
    step: '03',
    icon: Eye,
    title: 'Monitor & Intervene',
    description:
      'Track recovery progress, receive AI risk alerts, message patients directly, and document everything \u2014 all HIPAA-compliant.',
  },
];

const complianceCards = [
  {
    icon: FileText,
    title: 'Complete Audit Trail',
    description: 'Every PHI access logged with user, timestamp, and action.',
  },
  {
    icon: Clock,
    title: 'Session Security',
    description: '15-min auto-logout, tokens in memory only, 2FA.',
  },
  {
    icon: KeyRound,
    title: 'Data Encryption',
    description: 'AES-256 at rest, TLS 1.3 in transit.',
  },
  {
    icon: Scale,
    title: '42 CFR Part 2',
    description: 'Substance use disorder confidentiality built into every feature.',
  },
];

const pricingTiers = [
  {
    name: 'Solo Practitioner',
    price: '$49',
    description: 'For individual counselors and small practices.',
    features: [
      '1 staff account',
      'Up to 25 patients',
      'Secure messaging',
      'Patient companion app',
      'AI relapse risk prediction',
      'Basic reporting',
      'HIPAA compliance included',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    price: '$249',
    description: 'For growing clinics and outpatient facilities.',
    features: [
      'Up to 10 staff accounts',
      'Up to 200 patients',
      'All Solo features',
      'Treatment plan builder',
      'Advanced analytics',
      'Custom intake forms',
      'Priority support',
      'Staff role management',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large facilities and multi-site organizations.',
    features: [
      'Unlimited staff',
      'Unlimited patients',
      'All Professional features',
      'Dedicated account manager',
      'BAA included',
      'Custom integrations',
      'On-site training',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
  },
];

const trustPoints = [
  {
    icon: HeartPulse,
    text: 'Built with input from addiction recovery professionals',
  },
  {
    icon: ShieldCheck,
    text: '805 automated tests ensuring reliability',
  },
  {
    icon: BookOpenCheck,
    text: 'Designed around evidence-based recovery principles from AA, NA, CBT, DBT, and mindfulness practices',
  },
];

const faqItems = [
  {
    question: 'How does the AI relapse prediction work?',
    answer:
      'Our proprietary algorithm analyzes behavioral patterns from daily check-ins \u2014 mood trends, craving intensity, HALT scores (Hungry, Angry, Lonely, Tired), meeting attendance, and social isolation indicators. By comparing current patterns against known risk profiles, it generates a risk score from 0\u2013100 with confidence metrics, key warning factors, and ranked intervention recommendations. The system can identify elevated risk 3\u20137 days before a potential relapse event.',
  },
  {
    question: 'Do patients need internet access to use the app?',
    answer:
      'No. The Recover patient app is built with an offline-first architecture. All patient data is stored locally on their device by default, and core features like check-ins, journal entries, skill modules, and crisis protocols work without any internet connection. When connectivity is available, patients can optionally sync with their facility for clinician visibility.',
  },
  {
    question: 'Is RecoverJourney fully HIPAA compliant?',
    answer:
      'Yes. RecoverJourney is built from the ground up for HIPAA compliance. We implement all required technical safeguards including AES-256 encryption, role-based access controls, comprehensive audit logging, automatic session timeouts, and secure authentication. We also comply with 42 CFR Part 2 regulations specific to substance use disorder treatment records.',
  },
  {
    question: 'How long does implementation take?',
    answer:
      'Most facilities are up and running within one to two weeks. The platform is designed for rapid deployment \u2014 you can configure your facility, invite staff, and begin onboarding patients in days rather than months. Enterprise clients with custom integration needs typically complete full deployment within four to six weeks.',
  },
  {
    question: 'Do you provide a Business Associate Agreement (BAA)?',
    answer:
      'Yes. A BAA is included with all Enterprise plans and available upon request for Professional plan subscribers. The BAA covers all aspects of data handling, storage, and transmission within the RecoverJourney platform.',
  },
  {
    question: 'Can patients use the app on their personal devices?',
    answer:
      'Yes. The patient companion app is available as both a mobile app (iOS and Android) and a web application. It features biometric authentication for secure access, and all data is encrypted end-to-end. Patients can access their recovery tools, communicate with their care team, and track progress from any device.',
  },
  {
    question: 'What happens to our data if we cancel?',
    answer:
      'Your data remains accessible for 90 days after cancellation. During this period, you can export all records in standard formats. After 90 days, data is securely deleted in accordance with our data retention policy. We never hold data hostage and make it easy to migrate.',
  },
  {
    question: 'Can RecoverJourney integrate with our existing EHR system?',
    answer:
      'Enterprise plans include custom integration support. We offer REST APIs and can work with your technical team to build integrations with existing EHR, billing, and practice management systems. Contact our sales team to discuss your specific integration requirements.',
  },
];

/* ───────────────────────── PAGE ───────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-teal-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-teal-900/30 text-teal-400 border border-teal-800/50 mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Recovery Management
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Predict Relapse Before{' '}
              <span className="text-teal-400">It Happens</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              The only recovery management platform with AI-powered risk
              prediction, real-time patient engagement, and built-in HIPAA
              compliance. Desktop portal for clinicians. Mobile app for patients.
              One connected ecosystem.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/25"
              >
                Book a Consultation
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/journey-portal"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all"
              >
                Watch Product Tour
              </Link>
            </motion.div>
          </div>

          {/* Hero visual — dashboard + phone overlap */}
          <motion.div
            className="relative max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <BrowserFrame
              src="/screenshots/journey-dashboard.png"
              alt="RecoverJourney clinician dashboard showing patient census, admissions, and facility analytics"
              className="mx-auto"
            />
            {/* Overlapping phone */}
            <div className="absolute -bottom-8 -right-2 sm:right-4 lg:right-[-40px] z-10">
              <PhoneFrame
                src="/screenshots/recover-home.png"
                alt="Recover patient app home screen"
                className="!max-w-[140px] sm:!max-w-[180px] lg:!max-w-[220px]"
              />
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {heroStats.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-teal-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="py-12 bg-navy-950/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, index) => (
              <ComplianceBadge
                key={badge.title}
                icon={badge.icon}
                title={badge.title}
                description={badge.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI RELAPSE PREDICTION ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Phone screenshot */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <PhoneFrame
                src="/screenshots/recover-home-risk.png"
                alt="Recover app showing AI relapse risk prediction with risk score and recommended interventions"
              />
            </motion.div>

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-teal-900/30 text-teal-400 border border-teal-800/50 mb-4">
                <Brain className="w-3.5 h-3.5" />
                Hero Differentiator
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                AI-Powered Relapse Risk Prediction
              </h2>
              <p className="text-lg text-teal-400 font-medium mb-4">
                The feature that sets RecoverJourney apart from every other
                platform.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                Our proprietary algorithm analyzes behavioral patterns &mdash;
                check-in frequency, mood trends, craving intensity, HALT scores,
                meeting attendance, and isolation indicators &mdash; to predict
                relapse risk 3&ndash;7 days before it happens.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {aiFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="p-4 rounded-xl bg-navy-800/50 border border-white/5"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <feature.icon className="w-6 h-6 text-teal-400 mb-2" />
                    <h4 className="text-sm font-semibold text-white mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-teal-900/15 border border-teal-800/30">
                <p className="text-sm text-teal-300 leading-relaxed">
                  <strong>No other recovery platform predicts relapse risk.</strong>{' '}
                  Most apps only track sobriety milestones after the fact.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TWO APPS, ONE PLATFORM ─── */}
      <section className="py-24 lg:py-32 bg-navy-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Two Apps, One Platform
            </h2>
            <p className="text-lg text-slate-400">
              A desktop portal for your clinical team and a mobile app for
              patients, seamlessly connected through a secure backend.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Clinician Portal */}
            <motion.div
              className="p-8 rounded-2xl bg-navy-800/50 border border-white/5"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Journey &mdash; Clinician Portal
                  </h3>
                  <p className="text-sm text-slate-400">Desktop application</p>
                </div>
              </div>

              <div className="mb-6">
                <BrowserFrame
                  src="/screenshots/journey-dashboard.png"
                  alt="Journey clinician dashboard showing patient census, admissions, and facility analytics"
                  className="mx-auto"
                />
              </div>

              <ul className="space-y-2.5 mb-6">
                {clinicianFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/journey-portal"
                className="inline-flex items-center gap-2 text-teal-400 font-medium text-sm hover:text-teal-300 transition-colors"
              >
                Explore Clinician Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Patient App */}
            <motion.div
              className="p-8 rounded-2xl bg-navy-800/50 border border-white/5"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Recover &mdash; Patient App
                  </h3>
                  <p className="text-sm text-slate-400">
                    Mobile and web application
                  </p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <PhoneFrame
                  src="/screenshots/recover-home.png"
                  alt="Recover patient app home screen showing 46 days clean and daily wellness tracking"
                />
              </div>

              <ul className="space-y-2.5 mb-6">
                {patientFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/recover-app"
                className="inline-flex items-center gap-2 text-teal-400 font-medium text-sm hover:text-teal-300 transition-colors"
              >
                Explore Patient App
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Bridge text */}
          <motion.p
            className="text-center text-slate-400 mt-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Everything syncs in real-time. When a patient checks in on their
            phone, clinicians see it instantly on their dashboard.
          </motion.p>
        </div>
      </section>

      {/* ─── DIFFERENTIATORS ─── */}
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
              What You Won&apos;t Find Anywhere Else
            </h2>
            <p className="text-lg text-slate-400">
              Features that competitors simply don&apos;t have.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentiators.map((item, index) => (
              <motion.div
                key={item.title}
                className="p-6 rounded-2xl bg-navy-800/50 border border-white/5 hover:border-teal-800/30 transition-colors"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="w-11 h-11 rounded-xl bg-teal-600/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 lg:py-32 bg-navy-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Get Started in Days, Not Months
            </h2>
            <p className="text-lg text-slate-400">
              RecoverJourney is designed for rapid deployment so your team can
              focus on what matters most.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.title}
                className="relative text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="text-5xl font-bold text-teal-600/20 mb-4">
                  {step.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-teal-600/10 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-7 h-7 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPLIANCE ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-900/30 text-teal-400 border border-teal-800/50 mb-4">
                Compliance Built In
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Built for Compliance from Day One
              </h2>
              <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                Unlike platforms that bolt on compliance after the fact,
                RecoverJourney was architected from the ground up for HIPAA and
                42 CFR Part 2.
              </p>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Every feature, from authentication to messaging, is designed
                with compliance at its core. This means fewer gaps, stronger
                protections, and less risk for your organization.
              </p>
              <Link
                href="/compliance"
                className="inline-flex items-center gap-2 text-teal-400 font-medium hover:text-teal-300 transition-colors"
              >
                Learn more about our compliance
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              {complianceCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  className="p-6 rounded-xl bg-navy-800/50 border border-white/5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <card.icon className="w-8 h-8 text-teal-400 mb-3" />
                  <h4 className="text-base font-semibold text-white mb-1.5">
                    {card.title}
                  </h4>
                  <p className="text-sm text-slate-400">{card.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-24 lg:py-32 bg-navy-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-400 mb-3">
              All plans include full HIPAA compliance, AI risk prediction, and
              the patient companion app.
            </p>
            <p className="text-sm text-slate-500">
              No hidden fees. No compliance add-ons. No per-patient charges.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <PricingCard
                key={tier.name}
                name={tier.name}
                price={tier.price}
                period={tier.period}
                description={tier.description}
                features={tier.features}
                highlighted={tier.highlighted}
                cta={tier.cta}
                delay={index * 0.15}
              />
            ))}
          </div>

          <motion.p
            className="text-center text-sm text-slate-500 mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            All plans include HIPAA compliance, AES-256 encryption, and audit
            logging.{' '}
            <Link href="/pricing" className="text-teal-400 hover:underline">
              View full pricing details
            </Link>
          </motion.p>
        </div>
      </section>

      {/* ─── SOCIAL PROOF / TRUST ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built on Evidence, Tested Rigorously
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {trustPoints.map((point, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-navy-800/50 border border-white/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-teal-600/10 flex items-center justify-center mb-4">
                  <point.icon className="w-6 h-6 text-teal-400" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {point.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 lg:py-32 bg-navy-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Predict and Prevent Relapse?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Join facilities that trust RecoverJourney to keep patients engaged
              and data secure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/25"
              >
                Book a Consultation
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/recover-app"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all"
              >
                Explore the Platform
              </Link>
            </div>
            <p className="text-sm text-slate-500">
              Or call us: (XXX) XXX-XXXX
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-400">
              Have questions? We have answers.
            </p>
          </motion.div>

          <FAQ items={faqItems} />
        </div>
      </section>
    </>
  );
}
