import type { BreathingExerciseSession } from '@/types/app';

/**
 * Breathing Exercises Library
 *
 * Evidence-based breathing techniques for stress relief,
 * anxiety reduction, and craving management.
 */

export interface BreathingExercise {
  type: BreathingExerciseSession['exerciseType'];
  name: string;
  description: string;
  benefits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // recommended duration in seconds
  pattern: {
    inhale: number;
    hold?: number;
    exhale: number;
    holdAfterExhale?: number;
  };
  instructions: string[];
  tips: string[];
  bestFor: string[];
}

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    type: 'box-breathing',
    name: 'Box Breathing (4-4-4-4)',
    description: 'Also called "square breathing" - used by Navy SEALs for stress management',
    benefits: [
      'Reduces stress and anxiety',
      'Improves focus and concentration',
      'Lowers heart rate',
      'Activates parasympathetic nervous system',
      'Helpful during cravings'
    ],
    difficulty: 'beginner',
    duration: 300, // 5 minutes
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      holdAfterExhale: 4
    },
    instructions: [
      'Sit comfortably with your back straight',
      'Place one hand on your belly',
      'Exhale completely to start',
      'Inhale through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale through your mouth for 4 counts',
      'Hold empty for 4 counts',
      'Repeat for 5-10 minutes'
    ],
    tips: [
      'Visualize tracing a square as you breathe',
      'If 4 counts is too long, start with 3',
      'Keep your shoulders relaxed',
      'Focus on the counting to quiet your mind'
    ],
    bestFor: [
      'Acute stress',
      'Before important meetings',
      'During cravings',
      'Difficulty concentrating',
      'Panic attacks'
    ]
  },

  {
    type: '4-7-8',
    name: '4-7-8 Breathing',
    description: 'Dr. Andrew Weil\'s relaxation technique - natural tranquilizer for the nervous system',
    benefits: [
      'Promotes deep relaxation',
      'Helps with insomnia',
      'Reduces anxiety',
      'Calms racing thoughts',
      'Prepares body for sleep'
    ],
    difficulty: 'intermediate',
    duration: 240, // 4 minutes (8 cycles)
    pattern: {
      inhale: 4,
      hold: 7,
      exhale: 8
    },
    instructions: [
      'Sit with your back straight',
      'Place tongue behind upper front teeth',
      'Exhale completely through your mouth (whoosh sound)',
      'Close mouth and inhale quietly through nose for 4 counts',
      'Hold breath for 7 counts',
      'Exhale completely through mouth for 8 counts (whoosh sound)',
      'This is one breath cycle',
      'Repeat for 4 cycles (about 2 minutes)',
      'Do not exceed 4 cycles for first month'
    ],
    tips: [
      'The ratio is more important than the speed',
      'Exhale should be twice as long as inhale',
      'Practice twice daily',
      'Takes practice - gets easier over time',
      'Don\'t force it - stop if dizzy'
    ],
    bestFor: [
      'Before sleep',
      'Managing anger',
      'Anxiety attacks',
      'When ruminating',
      'Difficult cravings'
    ]
  },

  {
    type: 'calm-breathing',
    name: 'Calm Breathing (Natural Rhythm)',
    description: 'Simple diaphragmatic breathing to activate relaxation response',
    benefits: [
      'Easy to do anywhere',
      'Reduces physical tension',
      'Lowers blood pressure',
      'Improves oxygen flow',
      'Centers and grounds'
    ],
    difficulty: 'beginner',
    duration: 300, // 5 minutes
    pattern: {
      inhale: 4,
      exhale: 6
    },
    instructions: [
      'Sit, stand, or lie comfortably',
      'Place one hand on chest, one on belly',
      'Breathe in slowly through your nose for 4 counts',
      'Feel your belly rise (not chest)',
      'Exhale slowly through your mouth for 6 counts',
      'Feel your belly fall',
      'Pause naturally before next breath',
      'Continue for 5-10 minutes'
    ],
    tips: [
      'Belly should move more than chest',
      'Longer exhale is key to relaxation',
      'Don\'t strain - find your natural rhythm',
      'Can do with eyes open or closed',
      'Practice regularly for best results'
    ],
    bestFor: [
      'General anxiety',
      'Daily practice',
      'Beginners',
      'When feeling overwhelmed',
      'Grounding exercise'
    ]
  },

  {
    type: 'energizing-breathing',
    name: 'Energizing Breath (Bellows Breath)',
    description: 'Quick, rhythmic breathing to increase energy and alertness',
    benefits: [
      'Increases energy',
      'Improves alertness',
      'Clears mind',
      'Boosts mood',
      'Warming effect on body'
    ],
    difficulty: 'advanced',
    duration: 60, // 1 minute
    pattern: {
      inhale: 1,
      exhale: 1
    },
    instructions: [
      'Sit up straight',
      'Breathe rapidly in and out through your nose',
      'Keep mouth closed but relaxed',
      'Breaths should be equal in duration',
      'Breaths should be short and quick',
      'Do 3 cycles of 10 breaths',
      'Rest for 30 seconds between cycles',
      'Breathe normally after completing'
    ],
    tips: [
      'Stop if you feel lightheaded',
      'Not recommended before sleep',
      'Keep neck and shoulders relaxed',
      'Focus on belly movement',
      'Start slow, build up speed'
    ],
    bestFor: [
      'Morning wake-up',
      'Mid-day energy slump',
      'Before exercise',
      'When feeling sluggish',
      'Replacing caffeine urges'
    ]
  }
];

/**
 * Get exercise by type
 */
export function getBreathingExercise(type: BreathingExerciseSession['exerciseType']): BreathingExercise | undefined {
  return BREATHING_EXERCISES.find(ex => ex.type === type);
}

/**
 * Get exercises by difficulty
 */
export function getExercisesByDifficulty(difficulty: BreathingExercise['difficulty']): BreathingExercise[] {
  return BREATHING_EXERCISES.filter(ex => ex.difficulty === difficulty);
}

/**
 * Calculate total breath cycles
 */
export function calculateBreathCycles(
  pattern: BreathingExercise['pattern'],
  durationSeconds: number
): number {
  const cycleTime = (pattern.inhale || 0) +
                   (pattern.hold || 0) +
                   (pattern.exhale || 0) +
                   (pattern.holdAfterExhale || 0);

  return Math.floor(durationSeconds / cycleTime);
}

/**
 * Get recommended exercise for situation
 */
export function getRecommendedExercise(situation: 'stress' | 'sleep' | 'energy' | 'anxiety' | 'craving'): BreathingExercise {
  switch (situation) {
    case 'stress':
    case 'craving':
      return BREATHING_EXERCISES[0]; // Box breathing
    case 'sleep':
    case 'anxiety':
      return BREATHING_EXERCISES[1]; // 4-7-8
    case 'energy':
      return BREATHING_EXERCISES[3]; // Energizing
    default:
      return BREATHING_EXERCISES[2]; // Calm breathing
  }
}
