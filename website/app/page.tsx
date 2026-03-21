'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Server,
  ShieldCheck,
  Monitor,
  MessageSquare,
  Smartphone,
  Settings,
  Users,
  HeartPulse,
  ArrowRight,
  ClipboardList,
  FileText,
  Bell,
  BarChart3,
  Activity,
  CheckCircle2,
} from 'lucide-react';

import Image from 'next/image';
import { Hero } from '@/components/Hero';
import { FeatureCard } from '@/components/FeatureCard';
import { PricingCard } from '@/components/PricingCard';
import { ComplianceBadge } from '@/components/ComplianceBadge';
import { FAQ } from '@/components/FAQ';
import { BrowserFrame } from '@/components/BrowserFrame';
import { PhoneFrame } from '@/components/PhoneFrame';

const trustBadges = [
  { icon: ShieldCheck, title: 'HIPAA Compliant', description: 'Full Privacy & Security Rule adherence' },
  { icon: Lock, title: '42 CFR Part 2', description: 'Substance use disorder confidentiality' },
  { icon: Server, title: '256-bit Encryption', description: 'AES-256 data encryption at rest & in transit' },
  { icon: Shield, title: 'SOC 2 Ready', description: 'Enterprise security controls' },
];

const features = [
  {
    icon: Monitor,
    title: 'Facility Management',
    description:
      'A comprehensive clinician portal for managing patients, treatment plans, and facility operations. Role-based access ensures staff see only what they need.',
    features: [
      'Patient intake and management',
      'Treatment plan builder',
      'Staff role management',
      'Dashboard and analytics',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Secure Messaging',
    description:
      'Real-time, HIPAA-compliant messaging between staff and patients. End-to-end encrypted with full audit trails for every conversation.',
    features: [
      'Real-time WebSocket messaging',
      'End-to-end encryption',
      'Message audit logging',
      'File sharing with access controls',
    ],
  },
  {
    icon: Smartphone,
    title: 'Patient Companion App',
    description:
      'A mobile app that keeps patients engaged in their recovery. Daily check-ins, resource access, and direct communication with their care team.',
    features: [
      'Daily mood and progress tracking',
      'Recovery resource library',
      'Appointment reminders',
      'Biometric authentication',
    ],
  },
];

const howItWorks = [
  {
    step: '01',
    icon: Settings,
    title: 'Deploy & Configure',
    description:
      'Set up your facility in minutes. Configure roles, departments, and compliance settings. We handle the infrastructure so you can focus on care.',
  },
  {
    step: '02',
    icon: Users,
    title: 'Onboard Your Team',
    description:
      'Invite counselors and staff with role-based access. Training takes less than an hour with our intuitive interface and guided setup.',
  },
  {
    step: '03',
    icon: HeartPulse,
    title: 'Engage Patients',
    description:
      'Patients download the companion app, complete intake digitally, and stay connected to their care team throughout their recovery journey.',
  },
];

const clinicianFeatures = [
  'Patient records and treatment plans',
  'Facility-wide dashboard',
  'Staff scheduling and management',
  'Compliance audit reports',
  'Secure internal messaging',
  'Analytics and outcome tracking',
];

const patientFeatures = [
  'Daily check-ins and mood tracking',
  'Secure messaging with care team',
  'Appointment scheduling',
  'Recovery resource library',
  'Progress milestones',
  'Emergency contacts and crisis tools',
];

const complianceFeatures = [
  {
    icon: FileText,
    title: 'Complete Audit Trail',
    description: 'Every action logged with user, timestamp, and resource accessed.',
  },
  {
    icon: Lock,
    title: 'Access Controls',
    description: 'Role-based permissions ensure minimum necessary access to PHI.',
  },
  {
    icon: Bell,
    title: 'Session Management',
    description: '15-minute auto-logout with warning. Tokens stored in memory only.',
  },
  {
    icon: Shield,
    title: 'Data Encryption',
    description: 'AES-256 encryption at rest. TLS 1.3 for all data in transit.',
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

const faqItems = [
  {
    question: 'Is Recovery Journey fully HIPAA compliant?',
    answer:
      'Yes. Recovery Journey is built from the ground up for HIPAA compliance. We implement all required technical safeguards including AES-256 encryption, role-based access controls, comprehensive audit logging, automatic session timeouts, and secure authentication. We also comply with 42 CFR Part 2 regulations specific to substance use disorder treatment records.',
  },
  {
    question: 'How long does implementation take?',
    answer:
      'Most facilities are up and running within one to two weeks. The platform is designed for rapid deployment -- you can configure your facility, invite staff, and begin onboarding patients in days rather than months. Enterprise clients with custom integration needs typically complete full deployment within four to six weeks.',
  },
  {
    question: 'Do you provide a Business Associate Agreement (BAA)?',
    answer:
      'Yes. A BAA is included with all Enterprise plans and available upon request for Professional plan subscribers. The BAA covers all aspects of data handling, storage, and transmission within the Recovery Journey platform.',
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
    question: 'Can Recovery Journey integrate with our existing EHR system?',
    answer:
      'Enterprise plans include custom integration support. We offer REST APIs and can work with your technical team to build integrations with existing EHR, billing, and practice management systems. Contact our sales team to discuss your specific integration requirements.',
  },
  {
    question: 'How is data migration handled from our current system?',
    answer:
      'We provide guided data migration support for Professional and Enterprise plans. Our team works with you to securely transfer patient records, treatment plans, and historical data from your existing system. All migrations are performed with full encryption and audit logging to maintain compliance throughout the process.',
  },
  {
    question: 'What kind of support is available?',
    answer:
      'Solo plans include email support with a 24-hour response time. Professional plans receive priority support with an 8-hour response time. Enterprise clients get a dedicated account manager, phone support, and guaranteed SLAs. All plans include access to our knowledge base and video training library.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Trust Bar */}
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

      {/* Features Overview */}
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
              Everything You Need for Recovery Management
            </h2>
            <p className="text-lg text-slate-400">
              A complete platform connecting clinicians, staff, and patients
              through secure, compliant tools designed for substance abuse
              treatment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                features={feature.features}
                delay={index * 0.15}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
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
              Recovery Journey is designed for rapid deployment so your team can
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

      {/* Platform Section */}
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
                    Journey -- Clinician Portal
                  </h3>
                  <p className="text-sm text-slate-400">Desktop application</p>
                </div>
              </div>

              {/* Dashboard Screenshot */}
              <div className="mb-6">
                <BrowserFrame
                  src="/screenshots/journey-dashboard.png"
                  alt="Journey clinician dashboard showing patient census, admissions, and facility analytics"
                  className="mx-auto"
                />
              </div>

              <ul className="space-y-2.5">
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
                    Recover -- Patient App
                  </h3>
                  <p className="text-sm text-slate-400">
                    Mobile and web application
                  </p>
                </div>
              </div>

              {/* Home Screen Screenshot */}
              <div className="flex justify-center mb-6">
                <div className="transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <PhoneFrame
                    src="/screenshots/recover-home.png"
                    alt="Recover patient app home screen showing 46 days clean and daily wellness tracking"
                  />
                </div>
              </div>

              <ul className="space-y-2.5">
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-24 lg:py-32 bg-navy-950/30">
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
                Compliance Is Not an Afterthought
              </h2>
              <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                Recovery Journey was architected from day one to meet the
                stringent requirements of HIPAA and 42 CFR Part 2. Every feature,
                from authentication to messaging, is designed with compliance at
                its core.
              </p>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Unlike platforms that bolt on compliance features later, our
                security and privacy controls are fundamental to the
                architecture. This means fewer gaps, stronger protections, and
                less risk for your organization.
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
              {complianceFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="p-6 rounded-xl bg-navy-800/50 border border-white/5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <feature.icon className="w-8 h-8 text-teal-400 mb-3" />
                  <h4 className="text-base font-semibold text-white mb-1.5">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot Gallery */}
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
              See Recovery Journey in Action
            </h2>
            <p className="text-lg text-slate-400">
              Real screenshots from the platform. Designed for clarity,
              built for compliance.
            </p>
          </motion.div>

          {/* Desktop screenshot */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <BrowserFrame
              src="/screenshots/journey-dashboard.png"
              alt="Journey clinician dashboard with patient census, recent admissions, and facility-wide analytics"
              className="mx-auto"
            />
            <p className="text-center text-sm text-slate-500 mt-4">
              Journey clinician dashboard — real-time facility overview
            </p>
          </motion.div>

          {/* Mobile screenshots row */}
          <div className="flex flex-wrap justify-center items-end gap-6 lg:gap-10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <PhoneFrame
                  src="/screenshots/recover-home.png"
                  alt="Recover home screen showing 46 days clean with daily wellness tracking"
                />
              </div>
              <p className="text-sm text-slate-500 mt-4">Home</p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <PhoneFrame
                  src="/screenshots/recover-checkin.png"
                  alt="Recover daily check-in modal for mood and craving tracking"
                />
              </div>
              <p className="text-sm text-slate-500 mt-4">Daily Check-In</p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <PhoneFrame
                  src="/screenshots/recover-prevention.png"
                  alt="Recover relapse prevention tools with coping strategies and emergency contacts"
                />
              </div>
              <p className="text-sm text-slate-500 mt-4">Prevention Tools</p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <PhoneFrame
                  src="/screenshots/recover-journal.png"
                  alt="Recover journal and cravings tracking tab"
                />
              </div>
              <p className="text-sm text-slate-500 mt-4">Journal</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
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
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-400">
              Plans for every stage of your practice. All plans include HIPAA
              compliance and core security features.
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
            All plans include HIPAA compliance, 256-bit encryption, and audit
            logging.{' '}
            <Link
              href="/pricing"
              className="text-teal-400 hover:underline"
            >
              View full pricing details
            </Link>
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
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
              Ready to Transform Your Practice?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Join facilities that trust Recovery Journey to manage their
              recovery programs with confidence and compliance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/25"
              >
                Schedule a Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
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
