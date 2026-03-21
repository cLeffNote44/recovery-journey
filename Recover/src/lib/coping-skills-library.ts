import type { CopingSkill } from '@/types/app';

/**
 * Comprehensive Coping Skills Library
 *
 * Organized by category with evidence-based techniques
 */

export const COPING_SKILLS_LIBRARY: CopingSkill[] = [
  // === GROUNDING TECHNIQUES ===
  {
    id: '5-4-3-2-1',
    name: '5-4-3-2-1 Grounding',
    category: 'grounding',
    description: 'Use your five senses to anchor yourself in the present moment',
    instructions: [
      'Look around and name 5 things you can see',
      'Notice 4 things you can touch',
      'Listen for 3 things you can hear',
      'Identify 2 things you can smell',
      'Name 1 thing you can taste'
    ],
    whenToUse: [
      'Feeling anxious or overwhelmed',
      'Experiencing a craving',
      'Having intrusive thoughts',
      'Feeling disconnected from reality'
    ],
    difficulty: 'easy'
  },
  {
    id: 'body-scan',
    name: 'Body Scan',
    category: 'grounding',
    description: 'Systematically focus attention on different parts of your body',
    instructions: [
      'Sit or lie in a comfortable position',
      'Close your eyes and take 3 deep breaths',
      'Starting with your toes, notice sensations without judgment',
      'Slowly move attention up through each body part',
      'Release tension as you notice it',
      'Continue until you reach the top of your head'
    ],
    whenToUse: [
      'Feeling tense or stressed',
      'Before sleep',
      'During meditation practice',
      'When feeling disconnected from body'
    ],
    difficulty: 'medium'
  },
  {
    id: 'cold-water',
    name: 'Cold Water Splash',
    category: 'grounding',
    description: 'Use temperature change to reset your nervous system',
    instructions: [
      'Go to a sink',
      'Splash cold water on your face',
      'Hold cold water in your hands',
      'Notice the intense sensation',
      'Take slow, deep breaths'
    ],
    whenToUse: [
      'Intense emotional crisis',
      'Panic attack',
      'Strong urge to use',
      'Feeling numb or dissociated'
    ],
    difficulty: 'easy'
  },

  // === DISTRACTION TECHNIQUES ===
  {
    id: 'alphabet-game',
    name: 'Alphabet Game',
    category: 'distraction',
    description: 'Find objects for each letter of the alphabet',
    instructions: [
      'Choose a category (colors, animals, foods, etc.)',
      'Go through the alphabet A-Z',
      'Name something in that category for each letter',
      'Can do this mentally or write it down',
      'Repeat with different categories'
    ],
    whenToUse: [
      'Waiting out a craving',
      'Feeling restless',
      'Difficulty sleeping',
      'Bored and at risk'
    ],
    difficulty: 'easy'
  },
  {
    id: 'counting-challenge',
    name: 'Counting Challenge',
    category: 'distraction',
    description: 'Engage your mind with mental math',
    instructions: [
      'Pick a number (e.g., 100)',
      'Count backwards by 7s',
      'Or count by 3s forward from 0',
      'If you mess up, start over',
      'Continue for 5-10 minutes'
    ],
    whenToUse: [
      'Racing thoughts',
      'Intrusive urges',
      'Anxiety',
      'Can\'t focus'
    ],
    difficulty: 'easy'
  },
  {
    id: 'engage-hobby',
    name: 'Engage in Hobby',
    category: 'distraction',
    description: 'Immerse yourself in a meaningful activity',
    instructions: [
      'Choose a hobby you enjoy (art, music, puzzles, reading)',
      'Set a timer for 30 minutes minimum',
      'Fully engage in the activity',
      'Notice when your mind wanders and gently refocus',
      'Celebrate completing the time'
    ],
    whenToUse: [
      'Long stretches of free time',
      'Weekend boredom',
      'After stressful event',
      'Building positive habits'
    ],
    difficulty: 'easy'
  },

  // === SELF-SOOTHING ===
  {
    id: 'comfort-object',
    name: 'Comfort Object',
    category: 'self-soothing',
    description: 'Use a meaningful object to provide comfort',
    instructions: [
      'Choose a meaningful object (photo, stone, memento)',
      'Hold it in your hands',
      'Notice its texture, weight, temperature',
      'Recall positive memories associated with it',
      'Take slow, calming breaths while holding it'
    ],
    whenToUse: [
      'Feeling lonely',
      'Missing loved ones',
      'Need for comfort',
      'Before sleep'
    ],
    difficulty: 'easy'
  },
  {
    id: 'soothing-music',
    name: 'Soothing Music',
    category: 'self-soothing',
    description: 'Use music to regulate emotions',
    instructions: [
      'Create a playlist of calming songs',
      'Find a quiet space',
      'Put on headphones if possible',
      'Close your eyes and listen',
      'Focus on the melodies and rhythms',
      'Allow emotions to flow'
    ],
    whenToUse: [
      'Feeling sad or anxious',
      'After a difficult day',
      'During relaxation time',
      'To change mood'
    ],
    difficulty: 'easy'
  },
  {
    id: 'warm-bath',
    name: 'Warm Bath/Shower',
    category: 'self-soothing',
    description: 'Use warmth and water for physical and emotional comfort',
    instructions: [
      'Prepare a warm bath or shower',
      'Set aside 15-20 minutes',
      'Add calming scents if available',
      'Focus on the sensation of warmth',
      'Practice slow breathing',
      'Imagine stress washing away'
    ],
    whenToUse: [
      'End of difficult day',
      'Muscle tension',
      'Before bed',
      'Feeling overwhelmed'
    ],
    difficulty: 'easy'
  },

  // === MINDFULNESS ===
  {
    id: 'mindful-eating',
    name: 'Mindful Eating',
    category: 'mindfulness',
    description: 'Pay full attention to the experience of eating',
    instructions: [
      'Choose a small portion of food',
      'Look at it closely - notice colors, shapes, textures',
      'Smell it before eating',
      'Take a small bite and hold it in your mouth',
      'Notice flavors, textures, temperature',
      'Chew slowly and deliberately',
      'Swallow and notice the sensation'
    ],
    whenToUse: [
      'Emotional eating urges',
      'Meal times',
      'Practicing presence',
      'Reducing mindless eating'
    ],
    difficulty: 'medium'
  },
  {
    id: 'mindful-walking',
    name: 'Mindful Walking',
    category: 'mindfulness',
    description: 'Walk with full awareness of each step',
    instructions: [
      'Find a quiet place to walk',
      'Walk slowly and deliberately',
      'Notice the sensation of each foot touching the ground',
      'Feel your weight shifting',
      'Notice your breath naturally',
      'When mind wanders, gently return focus to steps',
      'Continue for 5-15 minutes'
    ],
    whenToUse: [
      'Restlessness',
      'Need for movement',
      'Meditation alternative',
      'Clearing mind'
    ],
    difficulty: 'medium'
  },

  // === SOCIAL ===
  {
    id: 'call-support',
    name: 'Call Support Person',
    category: 'social',
    description: 'Reach out to someone who supports your recovery',
    instructions: [
      'Identify who you can call (sponsor, friend, family)',
      'Don\'t wait until crisis - call when urge starts',
      'Be honest about what you\'re experiencing',
      'Ask for what you need (listening, distraction, etc.)',
      'Thank them for their support'
    ],
    whenToUse: [
      'Experiencing cravings',
      'Feeling isolated',
      'Making difficult decision',
      'Celebrating progress'
    ],
    difficulty: 'medium'
  },
  {
    id: 'attend-meeting',
    name: 'Attend a Meeting',
    category: 'social',
    description: 'Go to a recovery support meeting',
    instructions: [
      'Look up meeting times/locations',
      'Go even if you don\'t feel like it',
      'Share if you\'re comfortable (not required)',
      'Stay for fellowship after',
      'Exchange numbers with someone',
      'Commit to next meeting'
    ],
    whenToUse: [
      'Feeling triggered',
      'Isolation',
      'After setback',
      'Regular routine maintenance'
    ],
    difficulty: 'medium'
  },

  // === PHYSICAL ===
  {
    id: 'intense-exercise',
    name: 'Intense Exercise',
    category: 'physical',
    description: 'Use physical exertion to change emotional state',
    instructions: [
      'Choose activity: running, jumping jacks, burpees, etc.',
      'Do 5-10 minutes of intense exercise',
      'Push yourself but stay safe',
      'Notice heart rate increase',
      'Focus on physical sensations',
      'Cool down with stretching'
    ],
    whenToUse: [
      'High anxiety',
      'Anger',
      'Restlessness',
      'Self-destructive urges'
    ],
    difficulty: 'easy'
  },
  {
    id: 'progressive-relaxation',
    name: 'Progressive Muscle Relaxation',
    category: 'physical',
    description: 'Systematically tense and relax muscle groups',
    instructions: [
      'Sit or lie comfortably',
      'Start with your feet - tense for 5 seconds',
      'Release and notice the difference',
      'Move to calves, then thighs',
      'Continue up through body: stomach, chest, arms, hands',
      'Finish with face and jaw',
      'Rest and notice full-body relaxation'
    ],
    whenToUse: [
      'Physical tension',
      'Before sleep',
      'Anxiety',
      'Stress'
    ],
    difficulty: 'medium'
  },

  // === COGNITIVE ===
  {
    id: 'thought-challenging',
    name: 'Challenge Negative Thoughts',
    category: 'cognitive',
    description: 'Identify and challenge unhelpful thinking patterns',
    instructions: [
      'Write down the negative thought',
      'Ask: Is this thought 100% true?',
      'What evidence supports it? What evidence contradicts it?',
      'What would I tell a friend with this thought?',
      'Create a more balanced thought',
      'Notice how you feel after reframing'
    ],
    whenToUse: [
      'Negative self-talk',
      'Rumination',
      'Self-defeating thoughts',
      'Planning for triggers'
    ],
    difficulty: 'advanced'
  },
  {
    id: 'gratitude-list',
    name: 'Gratitude List',
    category: 'cognitive',
    description: 'Shift focus to what\'s going right',
    instructions: [
      'Get paper or open notes app',
      'Write down 3-10 things you\'re grateful for',
      'Include small things (warm coffee, sunshine)',
      'Include people',
      'Include personal strengths',
      'Read list when feeling negative'
    ],
    whenToUse: [
      'Feeling negative',
      'Depression',
      'Taking recovery for granted',
      'Daily practice'
    ],
    difficulty: 'easy'
  },
  {
    id: 'urge-surfing',
    name: 'Urge Surfing',
    category: 'cognitive',
    description: 'Ride the wave of craving without acting on it',
    instructions: [
      'Notice the urge arising',
      'Don\'t try to fight it or make it go away',
      'Observe it like a wave',
      'Notice where you feel it in your body',
      'Watch it build to a peak',
      'Notice it eventually decreasing',
      'Remind yourself: urges always pass'
    ],
    whenToUse: [
      'Experiencing a craving',
      'Urge to use',
      'Any strong impulse',
      'Practicing acceptance'
    ],
    difficulty: 'advanced'
  },
  {
    id: 'opposite-action',
    name: 'Opposite Action',
    category: 'cognitive',
    description: 'Do the opposite of what the urge is telling you',
    instructions: [
      'Identify the emotion and urge (anger → yell)',
      'Recognize if action would be harmful',
      'Choose opposite action (speak calmly)',
      'Fully commit to opposite action',
      'Notice the emotion changing',
      'Reflect on outcome'
    ],
    whenToUse: [
      'Destructive urges',
      'Isolation urge',
      'Avoidance',
      'Intense emotions'
    ],
    difficulty: 'advanced'
  }
];

// Alias export for convenience
export const COPING_SKILLS = COPING_SKILLS_LIBRARY;

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: CopingSkill['category']): CopingSkill[] {
  return COPING_SKILLS_LIBRARY.filter(skill => skill.category === category);
}

/**
 * Get skills by difficulty
 */
export function getSkillsByDifficulty(difficulty: CopingSkill['difficulty']): CopingSkill[] {
  return COPING_SKILLS_LIBRARY.filter(skill => skill.difficulty === difficulty);
}

/**
 * Get skill by ID
 */
export function getSkillById(id: string): CopingSkill | undefined {
  return COPING_SKILLS_LIBRARY.find(skill => skill.id === id);
}

/**
 * Search skills by name or description
 */
export function searchSkills(query: string): CopingSkill[] {
  const lowerQuery = query.toLowerCase();
  return COPING_SKILLS_LIBRARY.filter(skill =>
    skill.name.toLowerCase().includes(lowerQuery) ||
    skill.description.toLowerCase().includes(lowerQuery)
  );
}
