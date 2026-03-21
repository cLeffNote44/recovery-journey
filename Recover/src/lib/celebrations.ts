import confetti from 'canvas-confetti';

/**
 * Celebration utilities for milestone achievements
 * Uses canvas-confetti to create fun animations
 */

export type CelebrationType =
  | 'milestone'
  | 'badge'
  | 'streak'
  | 'checkIn'
  | 'cravingOvercome'
  | 'perfectWeek';

/**
 * Fires confetti for a sobriety milestone
 * Big celebration with lots of confetti
 */
export const celebrateMilestone = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
};

/**
 * Fires confetti for badge unlock
 * Medium celebration from center
 */
export const celebrateBadge = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FFA500', '#FF6347', '#9B59B6', '#3498DB'],
    zIndex: 9999
  });
};

/**
 * Fires confetti for streak achievements
 * Fire-themed colors
 */
export const celebrateStreak = () => {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#FF6B6B', '#FFA500', '#FFD700', '#FF4500'],
    zIndex: 9999
  });
};

/**
 * Small celebration for daily check-in
 * Quick and subtle
 */
export const celebrateCheckIn = () => {
  confetti({
    particleCount: 50,
    spread: 50,
    origin: { y: 0.7 },
    colors: ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899'],
    zIndex: 9999
  });
};

/**
 * Celebration for overcoming a craving
 * Victory burst
 */
export const celebrateCravingOvercome = () => {
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#10B981', '#22C55E', '#4ADE80', '#86EFAC'],
    zIndex: 9999,
    shapes: ['circle', 'square'],
    scalar: 1.2
  });
};

/**
 * Epic celebration for perfect week
 * Multiple bursts
 */
export const celebratePerfectWeek = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999
  };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  };

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Main celebration function - determines which animation to use
 * Respects user's motion preferences for accessibility
 */
export const celebrate = (type: CelebrationType) => {
  // Respect user's motion preferences
  if (prefersReducedMotion()) {
    return;
  }

  switch (type) {
    case 'milestone':
      celebrateMilestone();
      break;
    case 'badge':
      celebrateBadge();
      break;
    case 'streak':
      celebrateStreak();
      break;
    case 'checkIn':
      celebrateCheckIn();
      break;
    case 'cravingOvercome':
      celebrateCravingOvercome();
      break;
    case 'perfectWeek':
      celebratePerfectWeek();
      break;
    default:
      celebrateCheckIn(); // Default to simple celebration
  }
};

/**
 * Check if celebrations are enabled in settings
 * Returns true if animations should play
 */
export const shouldCelebrate = (settings?: { celebrationsEnabled?: boolean }): boolean => {
  // Default to true if no settings provided
  if (!settings) return true;
  return settings.celebrationsEnabled !== false;
};
