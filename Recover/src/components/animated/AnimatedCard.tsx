/**
 * Animated Card Component
 * Provides hover and tap animations for card elements
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cardHover } from '@/lib/animations';

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  enableHover?: boolean;
  enableTap?: boolean;
  className?: string;
}

export function AnimatedCard({
  children,
  enableHover = true,
  enableTap = true,
  className = '',
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial="rest"
      whileHover={enableHover ? "hover" : undefined}
      whileTap={enableTap ? "tap" : undefined}
      variants={cardHover}
      {...props}
    >
      {children}
    </motion.div>
  );
}
