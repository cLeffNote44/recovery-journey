'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Smartphone,
  Home,
  CheckCircle2,
  CalendarDays,
  BookOpen,
  ShieldCheck,
  HeartPulse,
  Building2,
  Settings,
  Brain,
  TrendingUp,
  DollarSign,
  Trophy,
  Smile,
  ClipboardCheck,
  Clock,
  Pen,
  Users,
  Sprout,
  AlertTriangle,
  Moon,
  Pill,
  Dumbbell,
  Apple,
  MessageSquare,
  KeyRound,
  Bell,
  Cloud,
  ArrowRight,
} from 'lucide-react';
import { PhoneFrame } from '@/components/PhoneFrame';

interface AppSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  screenshots: { src: string; alt: string; caption: string }[];
  bullets: string[];
  index: number;
  reverse?: boolean;
}

function AppSection({ icon: Icon, title, description, screenshots, bullets, index, reverse }: AppSectionProps) {
  return (
    <section className={`py-16 lg:py-24 ${index % 2 === 1 ? 'bg-navy-800/30' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
          </div>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">{description}</p>
        </motion.div>

        {/* Screenshots */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {screenshots.map((shot) => (
            <div key={shot.src} className="flex flex-col items-center">
              <PhoneFrame src={shot.src} alt={shot.alt} />
              <p className="text-sm text-slate-500 mt-3 text-center max-w-[240px]">{shot.caption}</p>
            </div>
          ))}
        </motion.div>

        {/* Feature Bullets */}
        <motion.ul
          className="grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-slate-300">{bullet}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

const sections: Omit<AppSectionProps, 'index'>[] = [
  {
    icon: Home,
    title: 'Home Dashboard',
    description:
      'The home screen gives patients an instant view of their recovery progress. From sobriety milestones and money saved to AI-powered risk predictions, everything they need to stay motivated is front and center.',
    screenshots: [
      { src: '/screenshots/recover-home.png', alt: 'Recovery progress tracker showing sobriety days and milestones', caption: 'Progress tracker with milestones' },
      { src: '/screenshots/recover-home-risk.png', alt: 'AI risk prediction display with motivational quote', caption: 'AI risk prediction and daily quote' },
      { src: '/screenshots/recover-home-top.png', alt: 'Money saved counter and achievement badges', caption: 'Money saved and achievements' },
    ],
    bullets: [
      'Sobriety day counter with milestone celebrations',
      'AI-powered risk prediction alerts',
      'Money saved calculator based on substance costs',
      'Achievement badges for recovery milestones',
      'Daily motivational quotes',
      'Quick-access navigation to all app sections',
    ],
  },
  {
    icon: ClipboardCheck,
    title: 'Daily Check-In',
    description:
      'Structured daily check-ins help patients reflect on their emotional state and identify potential triggers. Data flows directly to their care team for real-time monitoring and early intervention when needed.',
    screenshots: [
      { src: '/screenshots/recover-checkin.png', alt: 'Daily check-in modal with mood tracking and HALT assessment', caption: 'Mood tracking and HALT assessment' },
    ],
    bullets: [
      'Mood and emotional state tracking',
      'Personal notes and reflections',
      'HALT assessment (Hungry, Angry, Lonely, Tired)',
      'Data synced to clinician dashboard',
    ],
  },
  {
    icon: CalendarDays,
    title: 'Calendar',
    description:
      'A visual calendar keeps patients organized with their appointments, meetings, and personal recovery events. Integration with the facility system ensures appointments stay synchronized.',
    screenshots: [
      { src: '/screenshots/recover-calendar.png', alt: 'Calendar view showing scheduled events and appointments', caption: 'Monthly calendar with events' },
    ],
    bullets: [
      'Monthly and weekly calendar views',
      'Appointment scheduling and reminders',
      'Meeting and event tracking',
      'Facility appointment synchronization',
    ],
  },
  {
    icon: BookOpen,
    title: 'Journal',
    description:
      'A comprehensive journaling suite helps patients process their recovery experience. From tracking cravings and meetings to celebrating growth and processing setbacks, every aspect of the journey is captured.',
    screenshots: [
      { src: '/screenshots/recover-journal.png', alt: 'Journal entry screen for cravings tracking', caption: 'Cravings journal' },
      { src: '/screenshots/recover-journal-meetings.png', alt: 'Meeting attendance tracker', caption: 'Meetings tracker' },
      { src: '/screenshots/recover-journal-growth.png', alt: 'Growth section with logs, challenges, gratitude, and meditation', caption: 'Growth: logs, challenges, gratitude' },
      { src: '/screenshots/recover-journal-setbacks.png', alt: 'Setback recording and analysis', caption: 'Setback documentation' },
    ],
    bullets: [
      'Craving intensity and trigger logging',
      'Meeting attendance and reflection',
      'Growth logs, challenges, and gratitude entries',
      'Meditation and mindfulness tracking',
      'Setback documentation with context',
      'Historical trend analysis',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Prevention',
    description:
      'Prevention tools give patients actionable strategies to maintain their recovery. The traffic light system provides quick visual assessment while skill-building exercises develop long-term resilience.',
    screenshots: [
      { src: '/screenshots/recover-prevention.png', alt: 'Prevention tools with 12-step work and traffic light system', caption: 'Prevention toolkit' },
    ],
    bullets: [
      '12-step program integration',
      'Traffic light risk assessment system',
      'Personal goal setting and tracking',
      'Skill-building exercises and resources',
    ],
  },
  {
    icon: HeartPulse,
    title: 'Wellness',
    description:
      'Holistic wellness tracking covers the physical health factors that directly impact recovery outcomes. From sleep quality and medication adherence to exercise and nutrition, patients build healthy routines.',
    screenshots: [
      { src: '/screenshots/recover-wellness.png', alt: 'Sleep tracking interface', caption: 'Sleep quality tracking' },
      { src: '/screenshots/recover-wellness-medication.png', alt: 'Medication management and reminders', caption: 'Medication tracker' },
      { src: '/screenshots/recover-wellness-exercise.png', alt: 'Exercise logging interface', caption: 'Exercise log' },
      { src: '/screenshots/recover-wellness-nutrition.png', alt: 'Nutrition tracking and meal logging', caption: 'Nutrition log' },
    ],
    bullets: [
      'Sleep quality and duration tracking',
      'Medication schedule with reminders',
      'Exercise type, duration, and intensity logging',
      'Nutrition and meal tracking',
      'Wellness trend visualization',
      'Care team visibility into wellness data',
    ],
  },
  {
    icon: Building2,
    title: 'Facility Connection',
    description:
      'Patients connect securely to their treatment facility using a registration key. Once connected, they can message their care team, view treatment plans, and stay engaged with their recovery program.',
    screenshots: [
      { src: '/screenshots/recover-facility.png', alt: 'Facility connection screen with registration key entry', caption: 'Secure facility registration' },
    ],
    bullets: [
      'Registration key-based facility connection',
      'Secure messaging with care team',
      'Treatment plan viewing and progress tracking',
      'HIPAA-compliant data transmission',
    ],
  },
  {
    icon: Settings,
    title: 'Settings',
    description:
      'Full control over the app experience with notification preferences, data management options, and cloud sync. Patients own their data and can manage it on their terms.',
    screenshots: [
      { src: '/screenshots/recover-settings.png', alt: 'Settings screen with notifications, preferences, and data management', caption: 'App settings and preferences' },
    ],
    bullets: [
      'Push notification preferences',
      'Display and accessibility settings',
      'Data export and management',
      'Cloud sync with end-to-end encryption',
    ],
  },
];

export default function RecoverAppPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-44 lg:pb-24 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-600/10 border border-teal-500/20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-medium text-teal-400">Mobile Application</span>
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Recover — Patient Companion App
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            A comprehensive mobile app that keeps patients engaged in their recovery journey
            with daily tracking, wellness tools, and secure facility connection
          </motion.p>
        </div>
      </section>

      {/* App Sections */}
      {sections.map((section, index) => (
        <AppSection key={section.title} {...section} index={index} />
      ))}

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
            Explore the clinician-facing Journey portal or schedule a personalized demo with our team.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/journey-portal"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              See the Clinician Portal
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
