/**
 * Animated List Component
 * Provides staggered animations for list items
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface AnimatedListProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  className = '',
  staggerDelay = 0.1,
  ...props
}: AnimatedListProps) {
  const customStagger = {
    ...staggerContainer,
    visible: {
      ...staggerContainer['visible'],
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={customStagger}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
}

export function AnimatedListItem({
  children,
  className = '',
  ...props
}: AnimatedListItemProps) {
  return (
    <motion.div
      className={className}
      variants={staggerItem}
      {...props}
    >
      {children}
    </motion.div>
  );
}
