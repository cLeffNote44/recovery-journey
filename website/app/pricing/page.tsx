'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
import { PricingCard } from '@/components/PricingCard';
import { FAQ } from '@/components/FAQ';

const tiers = [
  {
    name: 'Solo Practitioner',
    price: '$49',
    description: 'For individual counselors and small private practices.',
    features: [
      '1 staff account',
      'Up to 25 active patients',
      'Secure HIPAA-compliant messaging',
      'Patient companion app access',
      'Basic reporting and analytics',
      'Daily patient check-in data',
      'Audit logging',
      'Email support (24hr response)',
      'HIPAA compliance included',
    ],
  },
  {
    name: 'Professional',
    price: '$249',
    description: 'For outpatient clinics and growing treatment centers.',
    features: [
      'Up to 10 staff accounts',
      'Up to 200 active patients',
      'Everything in Solo, plus:',
      'Treatment plan builder',
      'Advanced analytics and dashboards',
      'Custom intake forms',
      'Staff role management (Admin, Counselor)',
      'Group session management',
      'Priority support (8hr response)',
      'Data export capabilities',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large facilities and multi-site organizations.',
    features: [
      'Unlimited staff accounts',
      'Unlimited patients',
      'Everything in Professional, plus:',
      'Dedicated account manager',
      'Business Associate Agreement (BAA)',
      'Custom EHR integrations',
      'On-site training and onboarding',
      'Phone support with SLA guarantee',
      'Multi-site management',
      'Custom compliance reporting',
    ],
    cta: 'Contact Sales',
  },
];

const pricingFaq = [
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Yes. You can upgrade your plan at any time, and the change takes effect immediately. When downgrading, the change takes effect at the end of your current billing cycle. No data is lost during plan changes.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'We offer a 14-day free trial of the Professional plan so you can experience the full platform. No credit card is required to start your trial. At the end of the trial, you can choose the plan that best fits your needs.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) and ACH bank transfers. Enterprise clients can also pay by invoice with net-30 terms.',
  },
  {
    question: 'Is there an annual billing discount?',
    answer:
      'Yes. Annual billing is available at a 20% discount compared to monthly billing. Solo Practitioner drops to $39/mo and Professional drops to $199/mo when billed annually.',
  },
  {
    question: 'What counts as an "active patient"?',
    answer:
      'An active patient is any patient who has an open status in the system, meaning they are currently receiving care or have been active in the last 30 days. Discharged patients do not count toward your limit but their records are retained for compliance.',
  },
  {
    question: 'Do all plans include HIPAA compliance?',
    answer:
      'Yes. Every plan includes full HIPAA compliance features: encryption, audit logging, access controls, session management, and secure authentication. We do not offer a non-compliant version because compliance should never be optional in healthcare.',
  },
];

export default function PricingPage() {
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
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            className="text-lg text-slate-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Choose the plan that fits your practice. All plans include HIPAA
            compliance, 256-bit encryption, and comprehensive audit logging.
          </motion.p>
        </div>
      </section>

      {/* Compliance Note */}
      <section className="py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center gap-3 p-4 rounded-xl bg-teal-900/10 border border-teal-800/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Shield className="w-5 h-5 text-teal-400 shrink-0" />
            <p className="text-sm text-teal-300">
              <span className="font-semibold">
                All plans include full HIPAA compliance.
              </span>{' '}
              We do not charge extra for security and privacy features because
              compliance should never be optional in healthcare.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
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
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-32 bg-navy-950/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Pricing Questions
            </h2>
          </motion.div>
          <FAQ items={pricingFaq} />
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
            <h2 className="text-3xl font-bold text-white mb-4">
              Not Sure Which Plan Is Right?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Schedule a call with our team. We will help you find the plan that
              fits your facility and budget.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/25"
            >
              Talk to Sales
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
