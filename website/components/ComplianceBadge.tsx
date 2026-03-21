'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ComplianceBadgeProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export function ComplianceBadge({
  icon: Icon,
  title,
  description,
  delay = 0,
}: ComplianceBadgeProps) {
  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-xl bg-navy-800/30 border border-white/5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="w-10 h-10 rounded-lg bg-teal-600/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-teal-400" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </motion.div>
  );
}
