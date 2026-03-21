/**
 * Enhanced Emergency Support System
 *
 * Provides immediate crisis intervention tools and resources
 * for users experiencing high-risk situations or urges to relapse.
 */

import type { Contact } from '@/types/app';

export interface EmergencyResource {
  id: string;
  name: string;
  type: 'hotline' | 'text' | 'chat' | 'app' | 'website';
  phone?: string;
  text?: string;
  url?: string;
  available: string; // "24/7", "9AM-5PM", etc.
  description: string;
  icon: string;
  country?: string;
}

export interface CrisisProtocol {
  id: string;
  title: string;
  urgency: 'immediate' | 'high' | 'moderate';
  steps: CrisisStep[];
  estimatedTime: string; // "5 minutes", "10 minutes"
  effectiveness: number; // 0-1
}

export interface CrisisStep {
  id: string;
  order: number;
  instruction: string;
  type: 'action' | 'reflection' | 'breathing' | 'grounding' | 'contact';
  duration?: number; // seconds
  guidance?: string;
  completed?: boolean;
}

export interface EmergencyAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'moderate';
  trigger: string;
  actionTaken?: string;
  outcome?: 'resolved' | 'escalated' | 'ongoing';
  notes?: string;
}

export interface GroundingExercise {
  id: string;
  name: string;
  type: '5-4-3-2-1' | 'breathing' | 'physical' | 'mental';
  duration: number; // seconds
  instructions: string[];
  difficulty: 'easy' | 'moderate' | 'advanced';
}

// National and international emergency resources
export const EMERGENCY_RESOURCES: EmergencyResource[] = [
  {
    id: 'samhsa',
    name: 'SAMHSA National Helpline',
    type: 'hotline',
    phone: '1-800-662-4357',
    available: '24/7',
    description: 'Free, confidential treatment referral and information service (in English and Spanish)',
    icon: 'phone',
    country: 'US'
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    type: 'text',
    text: '741741',
    available: '24/7',
    description: 'Text HOME to connect with a Crisis Counselor',
    icon: 'message-square',
    country: 'US'
  },
  {
    id: 'aa-helpline',
    name: 'AA Hotline',
    type: 'hotline',
    phone: '1-212-870-3400',
    available: '24/7',
    description: 'Alcoholics Anonymous general service office',
    icon: 'phone',
    country: 'US'
  },
  {
    id: 'na-helpline',
    name: 'NA Helpline',
    type: 'hotline',
    phone: '1-818-773-9999',
    available: '24/7',
    description: 'Narcotics Anonymous world services',
    icon: 'phone',
    country: 'US'
  },
  {
    id: 'suicide-prevention',
    name: '988 Suicide & Crisis Lifeline',
    type: 'hotline',
    phone: '988',
    text: '988',
    available: '24/7',
    description: 'Free and confidential support for people in distress',
    icon: 'heart',
    country: 'US'
  },
  {
    id: 'smart-recovery',
    name: 'SMART Recovery',
    type: 'website',
    url: 'https://www.smartrecovery.org/community/',
    available: '24/7',
    description: 'Online community and meeting finder',
    icon: 'globe',
    country: 'International'
  },
  {
    id: 'reddit-recovery',
    name: 'r/StopDrinking',
    type: 'website',
    url: 'https://www.reddit.com/r/stopdrinking/',
    available: '24/7',
    description: 'Active online support community',
    icon: 'users',
    country: 'International'
  }
];

// Crisis intervention protocols
export const CRISIS_PROTOCOLS: CrisisProtocol[] = [
  {
    id: 'immediate-urge',
    title: 'Immediate Urge Protocol',
    urgency: 'immediate',
    estimatedTime: '5 minutes',
    effectiveness: 0.85,
    steps: [
      {
        id: 'pause',
        order: 1,
        instruction: 'STOP. Take 3 deep breaths right now.',
        type: 'breathing',
        duration: 30,
        guidance: 'Inhale for 4 counts, hold for 4, exhale for 6. Repeat 3 times.'
      },
      {
        id: 'delay',
        order: 2,
        instruction: 'Delay for 10 minutes. Urges peak and pass.',
        type: 'action',
        duration: 600,
        guidance: 'Set a timer. The craving will be less intense in 10 minutes.'
      },
      {
        id: 'distract',
        order: 3,
        instruction: 'Do something NOW: Walk, call someone, drink water, splash face with cold water.',
        type: 'action',
        guidance: 'Physical action interrupts the urge cycle.'
      },
      {
        id: 'reach-out',
        order: 4,
        instruction: 'Call your sponsor, therapist, or a support person.',
        type: 'contact',
        guidance: 'You don\'t have to do this alone.'
      },
      {
        id: 'reflect',
        order: 5,
        instruction: 'Remember why you started. Check your reasons for recovery.',
        type: 'reflection',
        guidance: 'Your future self will thank you for choosing recovery.'
      }
    ]
  },
  {
    id: 'high-risk-situation',
    title: 'High-Risk Situation',
    urgency: 'high',
    estimatedTime: '10 minutes',
    effectiveness: 0.80,
    steps: [
      {
        id: 'remove-self',
        order: 1,
        instruction: 'Remove yourself from the situation IMMEDIATELY.',
        type: 'action',
        guidance: 'Leave the place, excuse yourself, create physical distance.'
      },
      {
        id: 'ground',
        order: 2,
        instruction: 'Ground yourself with the 5-4-3-2-1 technique.',
        type: 'grounding',
        duration: 180,
        guidance: '5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.'
      },
      {
        id: 'emergency-contact',
        order: 3,
        instruction: 'Contact your emergency support person.',
        type: 'contact',
        guidance: 'Call or text someone from your support network.'
      },
      {
        id: 'safe-place',
        order: 4,
        instruction: 'Go to a safe place - meeting, friend\'s house, public place.',
        type: 'action',
        guidance: 'Don\'t isolate. Be around safe people.'
      },
      {
        id: 'plan',
        order: 5,
        instruction: 'Make a plan for the next 24 hours.',
        type: 'reflection',
        guidance: 'Schedule activities, meetings, check-ins with supports.'
      }
    ]
  },
  {
    id: 'emotional-crisis',
    title: 'Emotional Crisis Management',
    urgency: 'high',
    estimatedTime: '15 minutes',
    effectiveness: 0.75,
    steps: [
      {
        id: 'safe-check',
        order: 1,
        instruction: 'Are you safe right now? If not, call 988 immediately.',
        type: 'reflection',
        guidance: 'Your safety is the priority.'
      },
      {
        id: 'breathing',
        order: 2,
        instruction: 'Box breathing: 4-4-4-4 for 2 minutes.',
        type: 'breathing',
        duration: 120,
        guidance: 'Breathe in 4, hold 4, out 4, hold 4. Repeat.'
      },
      {
        id: 'name-emotion',
        order: 3,
        instruction: 'Name the emotion you\'re feeling. Say it out loud.',
        type: 'reflection',
        guidance: 'Naming emotions reduces their intensity.'
      },
      {
        id: 'physical-release',
        order: 4,
        instruction: 'Physical release: stretch, walk, or progressive muscle relaxation.',
        type: 'physical',
        duration: 300,
        guidance: 'Release physical tension that comes with intense emotions.'
      },
      {
        id: 'support',
        order: 5,
        instruction: 'Reach out for support - therapist, sponsor, trusted friend.',
        type: 'contact',
        guidance: 'Emotional pain is easier to bear with support.'
      },
      {
        id: 'self-compassion',
        order: 6,
        instruction: 'Practice self-compassion. This is hard, and you\'re doing your best.',
        type: 'reflection',
        guidance: 'Be kind to yourself. Recovery is not linear.'
      }
    ]
  },
  {
    id: 'moderate-trigger',
    title: 'Trigger Management',
    urgency: 'moderate',
    estimatedTime: '10 minutes',
    effectiveness: 0.70,
    steps: [
      {
        id: 'identify',
        order: 1,
        instruction: 'Identify the trigger. What just happened?',
        type: 'reflection',
        guidance: 'Awareness is the first step to managing triggers.'
      },
      {
        id: 'halt-check',
        order: 2,
        instruction: 'HALT check: Am I Hungry, Angry, Lonely, or Tired?',
        type: 'reflection',
        guidance: 'Address basic needs first.'
      },
      {
        id: 'cope',
        order: 3,
        instruction: 'Use a healthy coping skill from your toolbox.',
        type: 'action',
        guidance: 'Music, exercise, journaling, meditation, creative activity.'
      },
      {
        id: 'support-check',
        order: 4,
        instruction: 'Check in with your support network.',
        type: 'contact',
        guidance: 'A quick text or call can help reset your mindset.'
      },
      {
        id: 'document',
        order: 5,
        instruction: 'Log the trigger and how you handled it.',
        type: 'reflection',
        guidance: 'Track patterns to strengthen your response over time.'
      }
    ]
  }
];

// Grounding exercises
export const GROUNDING_EXERCISES: GroundingExercise[] = [
  {
    id: '5-4-3-2-1',
    name: '5-4-3-2-1 Grounding',
    type: '5-4-3-2-1',
    duration: 180,
    difficulty: 'easy',
    instructions: [
      'Look around and name 5 things you can SEE',
      'Notice 4 things you can TOUCH (and touch them)',
      'Listen for 3 things you can HEAR',
      'Identify 2 things you can SMELL',
      'Notice 1 thing you can TASTE'
    ]
  },
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    type: 'breathing',
    duration: 120,
    difficulty: 'easy',
    instructions: [
      'Breathe in slowly for 4 counts',
      'Hold your breath for 4 counts',
      'Breathe out slowly for 4 counts',
      'Hold empty for 4 counts',
      'Repeat for 2 minutes'
    ]
  },
  {
    id: 'physical-grounding',
    name: 'Physical Grounding',
    type: 'physical',
    duration: 180,
    difficulty: 'easy',
    instructions: [
      'Press your feet firmly into the floor',
      'Notice the sensation of your body on the chair',
      'Clench and release your fists 5 times',
      'Roll your shoulders back and down',
      'Touch something cool or textured nearby'
    ]
  },
  {
    id: 'mental-categories',
    name: 'Category Game',
    type: 'mental',
    duration: 300,
    difficulty: 'moderate',
    instructions: [
      'Pick a category (animals, countries, colors, etc.)',
      'Name items in that category alphabetically',
      'Example: Animals - Alligator, Bear, Cat...',
      'Continue through the alphabet',
      'This engages your thinking brain and reduces emotional intensity'
    ]
  }
];

/**
 * Determine appropriate crisis protocol based on severity
 */
export function getCrisisProtocol(severity: 'critical' | 'high' | 'moderate'): CrisisProtocol {
  const urgencyMap = {
    'critical': 'immediate',
    'high': 'high',
    'moderate': 'moderate'
  };

  const protocol = CRISIS_PROTOCOLS.find(p => p.urgency === urgencyMap[severity]);
  return protocol || CRISIS_PROTOCOLS[0];
}

/**
 * Get emergency contacts sorted by priority
 */
export function getEmergencyContacts(contacts: Contact[]): Contact[] {
  return contacts
    .filter(c => c.relationship === 'sponsor' || c.relationship === 'therapist' || c.isEmergency)
    .sort((a, b) => {
      // Prioritize: sponsors, therapists, then other emergency contacts
      if (a.relationship === 'sponsor' && b.relationship !== 'sponsor') return -1;
      if (b.relationship === 'sponsor' && a.relationship !== 'sponsor') return 1;
      if (a.relationship === 'therapist' && b.relationship !== 'therapist') return -1;
      if (b.relationship === 'therapist' && a.relationship !== 'therapist') return 1;
      return 0;
    });
}

/**
 * Create an emergency alert log entry
 */
export function createEmergencyAlert(
  severity: 'critical' | 'high' | 'moderate',
  trigger: string
): EmergencyAlert {
  return {
    id: `alert_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    timestamp: new Date().toISOString(),
    severity,
    trigger,
    outcome: 'ongoing'
  };
}

/**
 * Get quick access phone numbers
 */
export function getQuickDialNumbers(): Array<{ label: string; number: string; type: string }> {
  return [
    { label: '988 Crisis Line', number: '988', type: 'emergency' },
    { label: 'SAMHSA Helpline', number: '1-800-662-4357', type: 'support' },
    { label: 'Crisis Text Line', number: '741741', type: 'text' }
  ];
}

/**
 * Generate immediate action suggestions based on time of day and risk level
 */
export function getImmediateActions(
  riskLevel: 'critical' | 'high' | 'moderate',
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
): string[] {
  const baseActions = [
    'Call your sponsor or support person RIGHT NOW',
    'Go to a public place (coffee shop, library, mall)',
    'Attend an online meeting (AA, NA, SMART Recovery)',
    'Use the 5-4-3-2-1 grounding technique',
    'Call SAMHSA helpline: 1-800-662-4357'
  ];

  const timeSpecificActions = {
    morning: [
      'Go for a walk in your neighborhood',
      'Visit a breakfast spot',
      'Go to a morning meeting'
    ],
    afternoon: [
      'Exercise or go to the gym',
      'Visit a friend or family member',
      'Work on a hobby or project'
    ],
    evening: [
      'Attend an evening meeting',
      'Cook a healthy meal',
      'Watch a recovery-focused video or podcast'
    ],
    night: [
      'Call the 24/7 crisis line',
      'Join an online support chat',
      'Use a sleep meditation or breathing exercise'
    ]
  };

  const criticalActions = [
    'Call 988 if you\'re in immediate danger',
    'Have someone stay with you tonight',
    'Go to an emergency room if you can\'t stay safe'
  ];

  let actions = [...baseActions];

  if (riskLevel === 'critical') {
    actions = [...criticalActions, ...actions];
  }

  actions = [...actions, ...timeSpecificActions[timeOfDay]];

  return actions.slice(0, 7); // Return top 7 actions
}

/**
 * Get current time of day
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Format phone number for dialing
 */
export function formatPhoneForDial(phone: string): string {
  // Remove all non-numeric characters except +
  return phone.replace(/[^0-9+]/g, '');
}

/**
 * Check if device can make phone calls (native app vs web)
 */
export function canMakePhoneCalls(): boolean {
  // Check if running in Capacitor
  return !!(window as any).Capacitor;
}

/**
 * Initiate emergency call
 */
export function initiateEmergencyCall(phoneNumber: string): void {
  const formattedNumber = formatPhoneForDial(phoneNumber);

  if (canMakePhoneCalls()) {
    // Native app - use Capacitor
    window.location.href = `tel:${formattedNumber}`;
  } else {
    // Web - open tel link
    window.open(`tel:${formattedNumber}`, '_self');
  }
}

/**
 * Initiate emergency text
 */
export function initiateEmergencyText(number: string, message?: string): void {
  const formattedNumber = formatPhoneForDial(number);
  const body = message ? `?body=${encodeURIComponent(message)}` : '';

  if (canMakePhoneCalls()) {
    window.location.href = `sms:${formattedNumber}${body}`;
  } else {
    window.open(`sms:${formattedNumber}${body}`, '_self');
  }
}
