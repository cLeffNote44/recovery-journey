/**
 * Page Transition Component
 * Wraps pages with smooth transition animations
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { pageTransition, fadeSlideUp } from '@/lib/animations';

interface PageTransitionProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'slide' | 'fade';
}

export function PageTransition({
  children,
  className = '',
  variant = 'default',
  ...props
}: PageTransitionProps) {
  const variants = variant === 'slide' ? fadeSlideUp : pageTransition;

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
}
