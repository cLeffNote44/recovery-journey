/**
 * Animation utilities and variants for Framer Motion
 * Provides consistent animations throughout the app
 */

import { Variants, Transition, Easing } from 'framer-motion';

/**
 * Standard easing curves for smooth animations
 */
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1] as const as unknown as Easing,
  easeOut: [0, 0, 0.2, 1] as const as unknown as Easing,
  easeIn: [0.4, 0, 1, 1] as const as unknown as Easing,
  sharp: [0.4, 0, 0.6, 1] as const as unknown as Easing,
  bounce: [0.68, -0.55, 0.265, 1.55] as const as unknown as Easing,
};

/**
 * Standard spring configurations
 */
export const springs = {
  gentle: { type: 'spring' as const, stiffness: 120, damping: 14 },
  snappy: { type: 'spring' as const, stiffness: 300, damping: 30 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 10 },
  slow: { type: 'spring' as const, stiffness: 80, damping: 15 },
};

/**
 * Standard durations
 */
export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
};

/**
 * Fade in animation variants
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast, ease: easings.easeIn },
  },
};

/**
 * Fade and slide up animation
 */
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: durations.fast, ease: easings.easeIn },
  },
};

/**
 * Fade and slide down animation
 */
export const fadeSlideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: durations.fast, ease: easings.easeIn },
  },
};

/**
 * Scale animation (pop in/out)
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: durations.fast, ease: easings.easeIn },
  },
};

/**
 * Spring scale animation
 */
export const springScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: durations.fast },
  },
};

/**
 * Slide from left animation
 */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: { duration: durations.fast, ease: easings.easeIn },
  },
};

/**
 * Slide from right animation
 */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: { duration: durations.fast, ease: easings.easeIn },
  },
};

/**
 * Card hover animation
 */
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

/**
 * Button press animation
 */
export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: durations.fast } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

/**
 * Stagger children animation
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

/**
 * Stagger item animation
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: durations.fast },
  },
};

/**
 * Modal/Dialog animation
 */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: durations.fast, ease: easings.easeIn },
  },
};

/**
 * Backdrop animation
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: durations.fast } },
  exit: { opacity: 0, transition: { duration: durations.fast } },
};

/**
 * Progress bar animation
 */
export const progressBar: Variants = {
  initial: { width: 0 },
  animate: {
    width: '100%',
    transition: { duration: durations.slow, ease: easings.easeOut },
  },
};

/**
 * Number count-up transition
 */
export const countUpTransition: Transition = {
  duration: durations.slow,
  ease: easings.easeOut,
};

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: durations.fast, ease: easings.easeIn },
  },
};

/**
 * Rotate animation
 */
export const rotate360: Variants = {
  animate: {
    rotate: 360,
    transition: { duration: 1, ease: 'linear', repeat: Infinity },
  },
};

/**
 * Pulse animation (for loading states)
 */
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

/**
 * Shake animation (for errors)
 */
export const shake: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

/**
 * Bounce animation
 */
export const bounce: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 0.6,
      ease: easings.bounce,
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};
