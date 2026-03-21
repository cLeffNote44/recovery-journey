/**
 * Values Clarification & Self-Compassion Libraries
 *
 * Tools for identifying core values and practicing self-kindness
 */

// === VALUES CLARIFICATION ===

export interface ValueSuggestion {
  value: string;
  description: string;
  category: 'relationships' | 'personal-growth' | 'contribution' | 'health' | 'integrity';
  recoveryConnection: string; // How this value relates to recovery
}

export const CORE_VALUES: ValueSuggestion[] = [
  // RELATIONSHIPS
  {
    value: 'Family',
    description: 'Being present and supportive for loved ones',
    category: 'relationships',
    recoveryConnection: 'Sobriety allows me to be the family member my loved ones deserve'
  },
  {
    value: 'Friendship',
    description: 'Building genuine, supportive connections',
    category: 'relationships',
    recoveryConnection: 'Recovery helps me form authentic friendships based on truth'
  },
  {
    value: 'Love',
    description: 'Giving and receiving love authentically',
    category: 'relationships',
    recoveryConnection: 'Staying sober helps me love myself and others more fully'
  },
  {
    value: 'Community',
    description: 'Being part of something larger than myself',
    category: 'relationships',
    recoveryConnection: 'Recovery connects me to a supportive community'
  },
  {
    value: 'Trust',
    description: 'Being reliable and trustworthy',
    category: 'relationships',
    recoveryConnection: 'Sobriety allows me to rebuild trust with others'
  },

  // PERSONAL GROWTH
  {
    value: 'Growth',
    description: 'Continuously learning and evolving',
    category: 'personal-growth',
    recoveryConnection: 'Recovery is the ultimate personal growth journey'
  },
  {
    value: 'Self-Awareness',
    description: 'Understanding my thoughts, feelings, and patterns',
    category: 'personal-growth',
    recoveryConnection: 'Sobriety clears the fog and allows genuine self-knowledge'
  },
  {
    value: 'Courage',
    description: 'Facing fears and challenges',
    category: 'personal-growth',
    recoveryConnection: 'Every day sober requires courage and builds strength'
  },
  {
    value: 'Resilience',
    description: 'Bouncing back from setbacks',
    category: 'personal-growth',
    recoveryConnection: 'Recovery teaches me to rise after falling'
  },
  {
    value: 'Peace',
    description: 'Inner calm and serenity',
    category: 'personal-growth',
    recoveryConnection: 'Sobriety brings peace that substances never could'
  },
  {
    value: 'Freedom',
    description: 'Living without chains of addiction',
    category: 'personal-growth',
    recoveryConnection: 'Recovery liberates me from slavery to substances'
  },

  // CONTRIBUTION
  {
    value: 'Service',
    description: 'Helping others',
    category: 'contribution',
    recoveryConnection: 'I can use my experience to help others in recovery'
  },
  {
    value: 'Purpose',
    description: 'Living a meaningful life',
    category: 'contribution',
    recoveryConnection: 'Sobriety allows me to discover and live my purpose'
  },
  {
    value: 'Compassion',
    description: 'Showing kindness to others and myself',
    category: 'contribution',
    recoveryConnection: 'Recovery teaches me to be gentle with myself and others'
  },
  {
    value: 'Contribution',
    description: 'Making a positive difference',
    category: 'contribution',
    recoveryConnection: 'Staying sober allows me to contribute meaningfully to the world'
  },

  // HEALTH
  {
    value: 'Physical Health',
    description: 'Taking care of my body',
    category: 'health',
    recoveryConnection: 'Sobriety is the foundation of physical wellbeing'
  },
  {
    value: 'Mental Health',
    description: 'Nurturing emotional and psychological wellbeing',
    category: 'health',
    recoveryConnection: 'Recovery clears my mind and stabilizes my emotions'
  },
  {
    value: 'Vitality',
    description: 'Having energy and zest for life',
    category: 'health',
    recoveryConnection: 'Sobriety restores my natural energy and enthusiasm'
  },
  {
    value: 'Self-Care',
    description: 'Prioritizing my needs',
    category: 'health',
    recoveryConnection: 'Recovery teaches me that self-care isn\'t selfish'
  },

  // INTEGRITY
  {
    value: 'Honesty',
    description: 'Living truthfully',
    category: 'integrity',
    recoveryConnection: 'Sobriety allows me to be honest with myself and others'
  },
  {
    value: 'Integrity',
    description: 'Aligning actions with values',
    category: 'integrity',
    recoveryConnection: 'Recovery helps me live in alignment with who I want to be'
  },
  {
    value: 'Responsibility',
    description: 'Being accountable for my choices',
    category: 'integrity',
    recoveryConnection: 'Staying sober means taking responsibility for my life'
  },
  {
    value: 'Authenticity',
    description: 'Being my true self',
    category: 'integrity',
    recoveryConnection: 'Sobriety allows me to drop the mask and be genuine'
  },
  {
    value: 'Dignity',
    description: 'Treating myself and others with respect',
    category: 'integrity',
    recoveryConnection: 'Recovery restores my sense of self-worth and dignity'
  }
];

/**
 * Values Reflection Prompts
 */
export const VALUES_REFLECTION_PROMPTS = [
  'How did staying sober today honor your value of {value}?',
  'What action did you take today that aligned with {value}?',
  'How does your commitment to {value} strengthen your recovery?',
  'When did you feel most connected to {value} today?',
  'How can you honor {value} even more tomorrow?',
  'What would living fully aligned with {value} look like?',
  'How has recovery helped you reclaim {value}?',
  'What small step can you take today to honor {value}?'
];

/**
 * Get values by category
 */
export function getValuesByCategory(category: ValueSuggestion['category']): ValueSuggestion[] {
  return CORE_VALUES.filter(v => v.category === category);
}

/**
 * Get reflection prompt for value
 */
export function getValuesReflectionPrompt(valueName: string): string {
  const promptIndex = Math.floor(Math.random() * VALUES_REFLECTION_PROMPTS.length);
  return VALUES_REFLECTION_PROMPTS[promptIndex].replace('{value}', valueName);
}

// === SELF-COMPASSION PRACTICES ===

export interface SelfCompassionPractice {
  type: 'self-compassion-break' | 'affirmation' | 'loving-kindness' | 'forgiveness';
  name: string;
  description: string;
  duration: number; // minutes
  instructions: string[];
  whenToUse: string[];
}

export const SELF_COMPASSION_PRACTICES: SelfCompassionPractice[] = [
  {
    type: 'self-compassion-break',
    name: 'Self-Compassion Break',
    description: 'Dr. Kristin Neff\'s practice for moments of difficulty',
    duration: 5,
    instructions: [
      'Acknowledge: "This is a moment of suffering" or "This is really hard right now"',
      'Remember: "Suffering is part of being human" or "I\'m not alone in this"',
      'Place your hands on your heart',
      'Say: "May I be kind to myself" or "May I give myself the compassion I need"',
      'Take a few deep breaths',
      'Ask: "What do I need right now?" and honor that need'
    ],
    whenToUse: [
      'After a mistake',
      'When feeling shame',
      'During self-criticism',
      'After a setback',
      'When comparing yourself to others',
      'Feeling inadequate'
    ]
  },

  {
    type: 'affirmation',
    name: 'Recovery Affirmations',
    description: 'Positive self-talk to counteract negative beliefs',
    duration: 3,
    instructions: [
      'Choose one or more affirmations that resonate',
      'Stand in front of a mirror if possible',
      'Place hand on heart',
      'Say the affirmation out loud',
      'Repeat it 3-5 times',
      'Try to feel the truth of it',
      'Notice any resistance without judgment'
    ],
    whenToUse: [
      'Morning routine',
      'When feeling doubtful',
      'After negative self-talk',
      'Before challenging situations',
      'As daily practice',
      'When motivation is low'
    ]
  },

  {
    type: 'loving-kindness',
    name: 'Loving-Kindness for Self',
    description: 'Metta meditation focused on self-compassion',
    duration: 10,
    instructions: [
      'Sit comfortably and close your eyes',
      'Place hands on heart',
      'Visualize yourself with warmth',
      'Repeat: "May I be safe. May I be happy. May I be healthy. May I live with ease."',
      'If it feels insincere, that\'s okay - keep practicing',
      'Feel whatever emotions arise',
      'Send genuine kindness to yourself',
      'Continue for 10 minutes'
    ],
    whenToUse: [
      'Low self-esteem',
      'Self-hatred',
      'After hurting yourself',
      'Regular meditation practice',
      'Building self-love',
      'Healing shame'
    ]
  },

  {
    type: 'forgiveness',
    name: 'Self-Forgiveness Practice',
    description: 'Releasing guilt and shame through forgiveness',
    duration: 15,
    instructions: [
      'Sit quietly and breathe',
      'Acknowledge what you did that you regret',
      'Recognize you were doing your best at the time',
      'Say: "I forgive myself for {specific action}"',
      'Feel the emotions that arise',
      'Recognize your humanity - all people make mistakes',
      'Commit to doing better going forward',
      'Say: "I am worthy of forgiveness and love"',
      'Release the burden of guilt',
      'Breathe into freedom'
    ],
    whenToUse: [
      'Carrying guilt',
      'Can\'t move past mistakes',
      'Shame about addiction',
      'After making amends',
      'Feeling unworthy',
      'Stuck in the past'
    ]
  }
];

/**
 * Recovery-specific affirmations
 */
export const RECOVERY_AFFIRMATIONS = [
  'I am worthy of recovery',
  'I am stronger than my cravings',
  'I choose sobriety one day at a time',
  'My past does not define my future',
  'I am healing and growing every day',
  'I deserve happiness and peace',
  'I am proud of my progress',
  'I have the courage to face my feelings',
  'I am building a life I don\'t need to escape from',
  'I am enough, exactly as I am',
  'Every day sober is a victory',
  'I am grateful for my recovery',
  'I trust the process',
  'I am surrounded by support',
  'I choose health over temporary relief',
  'I am worthy of love and belonging',
  'My recovery is worth the effort',
  'I am becoming who I\'m meant to be',
  'I forgive myself for my past',
  'I am creating a better future'
];

/**
 * Get practice by type
 */
export function getSelfCompassionPractice(type: SelfCompassionPractice['type']): SelfCompassionPractice | undefined {
  return SELF_COMPASSION_PRACTICES.find(p => p.type === type);
}

/**
 * Get random affirmation
 */
export function getRandomAffirmation(): string {
  return RECOVERY_AFFIRMATIONS[Math.floor(Math.random() * RECOVERY_AFFIRMATIONS.length)];
}

/**
 * Get daily affirmation (consistent for the day)
 */
export function getDailyAffirmation(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return RECOVERY_AFFIRMATIONS[dayOfYear % RECOVERY_AFFIRMATIONS.length];
}
