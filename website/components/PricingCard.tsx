'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta?: string;
  delay?: number;
}

export function PricingCard({
  name,
  price,
  period = '/mo',
  description,
  features,
  highlighted = false,
  cta = 'Get Started',
  delay = 0,
}: PricingCardProps) {
  return (
    <motion.div
      className={`relative p-8 rounded-2xl border flex flex-col ${
        highlighted
          ? 'bg-gradient-to-b from-teal-900/20 to-navy-800/50 border-teal-500/30'
          : 'bg-navy-800/50 border-white/5'
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex px-4 py-1 rounded-full text-xs font-semibold bg-teal-600 text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <div className="mb-8">
        <span className="text-4xl font-bold text-white">{price}</span>
        {period && price !== 'Custom' && (
          <span className="text-slate-400 ml-1">{period}</span>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <span className="text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/contact"
        className={`block w-full text-center px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
          highlighted
            ? 'bg-teal-600 text-white hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-500/25'
            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
        }`}
      >
        {cta}
      </Link>
    </motion.div>
  );
}
