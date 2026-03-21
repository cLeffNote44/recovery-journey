'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
  delay?: number;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  features,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      className="relative p-8 rounded-2xl bg-navy-800/50 border border-white/5 hover:border-teal-500/20 transition-all group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="w-12 h-12 rounded-xl bg-teal-600/10 flex items-center justify-center mb-5 group-hover:bg-teal-600/20 transition-colors">
        <Icon className="w-6 h-6 text-teal-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
      {features && features.length > 0 && (
        <ul className="mt-5 space-y-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-slate-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
