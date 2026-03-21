import type { ConnectionPromptEntry } from '@/types/app';

/**
 * Connection Building Prompts
 *
 * Structured exercises to strengthen relationships and build
 * healthy social connections in recovery.
 */

export interface ConnectionPromptTemplate {
  type: ConnectionPromptEntry['promptType'];
  title: string;
  description: string;
  prompts: string[];
  category: 'building' | 'deepening' | 'repairing' | 'boundaries';
}

export const CONNECTION_PROMPTS: ConnectionPromptTemplate[] = [
  // === REACH-OUT PROMPTS ===
  {
    type: 'reach-out',
    title: 'Reaching Out',
    description: 'Practice initiating contact and asking for support',
    category: 'building',
    prompts: [
      'Text someone you haven\'t talked to in a while and ask how they\'re doing',
      'Call your sponsor or a recovery friend just to check in',
      'Invite someone to coffee or a meeting',
      'Share something you\'re proud of with someone who supports you',
      'Ask for help with something you\'re struggling with',
      'Tell someone you miss them',
      'Reach out to someone who might be struggling',
      'Ask someone to be your accountability partner for a goal',
      'Invite a family member to do something together',
      'Send a supportive message to someone in your recovery network'
    ]
  },

  // === GRATITUDE LETTERS ===
  {
    type: 'gratitude-letter',
    title: 'Gratitude Letters',
    description: 'Express appreciation to people who have helped you',
    category: 'deepening',
    prompts: [
      'Write a letter to your sponsor thanking them for specific ways they\'ve helped',
      'Thank a family member for standing by you during difficult times',
      'Express gratitude to someone who gave you a second chance',
      'Write to a friend about why their friendship matters to you',
      'Thank someone who believed in you when you didn\'t believe in yourself',
      'Express appreciation to a therapist or counselor who helped you',
      'Write to someone who taught you an important lesson',
      'Thank a recovery friend for their support',
      'Express gratitude to someone who held you accountable',
      'Write to yourself from the perspective of your future self, expressing gratitude for your recovery efforts'
    ]
  },

  // === BOUNDARY SETTING ===
  {
    type: 'boundary-setting',
    title: 'Setting Boundaries',
    description: 'Practice establishing and maintaining healthy boundaries',
    category: 'boundaries',
    prompts: [
      'Identify one person who doesn\'t respect your recovery and plan how to set a boundary',
      'Practice saying "no" to something that conflicts with your recovery',
      'Tell someone you can\'t attend an event that would be triggering',
      'Set a boundary around when/how you\'re available to help others',
      'Communicate your need for alone time or self-care time',
      'Let someone know what topics you\'re not comfortable discussing',
      'Set boundaries around substance use in your presence',
      'Establish limits on how much you\'re willing to share about your recovery',
      'Communicate your dealbreakers in a relationship',
      'Practice ending a conversation that\'s becoming unhealthy'
    ]
  },

  // === VULNERABILITY ===
  {
    type: 'vulnerability',
    title: 'Practicing Vulnerability',
    description: 'Share authentically and build deeper connections',
    category: 'deepening',
    prompts: [
      'Share a fear you have about recovery with someone you trust',
      'Tell someone about a recent challenge you faced',
      'Admit to someone that you need support',
      'Share something you\'re ashamed of with a safe person',
      'Tell someone how they hurt you (constructively)',
      'Ask for what you need in a relationship',
      'Share your feelings instead of just facts',
      'Tell someone you\'re struggling without minimizing it',
      'Share a dream or hope for your future',
      'Open up about how addiction affected you'
    ]
  },

  // === CONFLICT RESOLUTION ===
  {
    type: 'conflict-resolution',
    title: 'Resolving Conflicts',
    description: 'Address issues and repair relationships',
    category: 'repairing',
    prompts: [
      'Have a conversation with someone you\'ve had tension with lately',
      'Apologize for something specific without making excuses',
      'Use "I feel" statements to address a problem',
      'Listen to someone\'s perspective without defending yourself',
      'Ask someone what you could do to repair trust',
      'Acknowledge your part in a conflict',
      'Make amends for a specific harm you caused',
      'Address an issue before it builds into resentment',
      'Seek to understand before being understood',
      'Forgive someone for a minor offense and let it go'
    ]
  },

  // === QUALITY TIME ===
  {
    type: 'quality-time',
    title: 'Quality Time',
    description: 'Invest in meaningful connections',
    category: 'deepening',
    prompts: [
      'Plan a sober activity with a friend or family member',
      'Have a phone conversation without multitasking',
      'Eat a meal with someone without phones',
      'Do something creative together (cook, art, music)',
      'Go for a walk and really listen to someone',
      'Attend a recovery event together',
      'Share a meaningful experience (sunrise, concert, nature)',
      'Teach someone something you\'re good at',
      'Learn something from someone else',
      'Create a new tradition with someone you care about'
    ]
  }
];

/**
 * Get random prompt by type
 */
export function getRandomPrompt(type: ConnectionPromptEntry['promptType']): string {
  const template = CONNECTION_PROMPTS.find(t => t.type === type);
  if (!template || template.prompts.length === 0) {
    return 'No prompts available';
  }
  const randomIndex = Math.floor(Math.random() * template.prompts.length);
  return template.prompts[randomIndex];
}

/**
 * Get all prompts of a specific type
 */
export function getPromptsByType(type: ConnectionPromptEntry['promptType']): string[] {
  const template = CONNECTION_PROMPTS.find(t => t.type === type);
  return template?.prompts || [];
}

/**
 * Get prompts by category
 */
export function getPromptsByCategory(category: ConnectionPromptTemplate['category']): ConnectionPromptTemplate[] {
  return CONNECTION_PROMPTS.filter(t => t.category === category);
}

/**
 * Get daily connection prompt (cycles through types)
 */
export function getDailyConnectionPrompt(dayNumber: number): {
  type: ConnectionPromptEntry['promptType'];
  prompt: string;
  title: string;
} {
  const types: ConnectionPromptEntry['promptType'][] = [
    'reach-out',
    'gratitude-letter',
    'boundary-setting',
    'vulnerability',
    'conflict-resolution',
    'quality-time'
  ];

  const typeIndex = dayNumber % types.length;
  const type = types[typeIndex];
  const template = CONNECTION_PROMPTS.find(t => t.type === type)!;

  const promptIndex = Math.floor(dayNumber / types.length) % template.prompts.length;
  const prompt = template.prompts[promptIndex];

  return {
    type,
    prompt,
    title: template.title
  };
}
