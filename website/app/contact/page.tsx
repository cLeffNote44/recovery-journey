'use client';

import { motion } from 'framer-motion';
import { Mail, Clock, Shield } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';

export default function ContactPage() {
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
            Schedule a Demo
          </motion.h1>
          <motion.p
            className="text-lg text-slate-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            See how Recovery Journey can streamline your facility operations.
            Fill out the form below and a member of our team will reach out
            within one business day.
          </motion.p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-8 rounded-2xl bg-navy-800/30 border border-white/5">
                <ContactForm />
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="p-6 rounded-2xl bg-navy-800/30 border border-white/5">
                <Mail className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Email Us
                </h3>
                <p className="text-sm text-slate-400 mb-3">
                  For general inquiries or support questions.
                </p>
                <a
                  href="mailto:cody@leffel.io"
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                >
                  cody@leffel.io
                </a>
              </div>

              <div className="p-6 rounded-2xl bg-navy-800/30 border border-white/5">
                <Clock className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Response Time
                </h3>
                <p className="text-sm text-slate-400">
                  We respond to all demo requests within one business day. For
                  existing customers, priority support is available based on your
                  plan.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-navy-800/30 border border-white/5">
                <Shield className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Your Data Is Safe
                </h3>
                <p className="text-sm text-slate-400">
                  The information you share in this form is used solely to
                  schedule your demo and understand your needs. We never sell or
                  share your information with third parties.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
