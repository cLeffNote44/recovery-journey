/**
 * Animated Number Component
 * Animates number changes with smooth count-up effect
 */

import { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { countUpTransition } from '@/lib/animations';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  decimals?: number;
  duration?: number;
}

export function AnimatedNumber({
  value,
  className = '',
  decimals = 0,
  duration = 0.5,
}: AnimatedNumberProps) {
  const spring = useSpring(value, {
    ...countUpTransition,
    duration: duration,
  });

  const display = useTransform(spring, (current) =>
    decimals > 0
      ? current.toFixed(decimals)
      : Math.floor(current).toString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}

/**
 * Simple animated number without spring physics
 */
export function SimpleAnimatedNumber({
  value,
  className = '',
  decimals = 0,
}: AnimatedNumberProps) {
  const prevValue = useRef(value);
  const displayValue = decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toString();

  useEffect(() => {
    prevValue.current = value;
  }, [value]);

  return (
    <motion.span
      key={value}
      className={className}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {displayValue}
    </motion.span>
  );
}
