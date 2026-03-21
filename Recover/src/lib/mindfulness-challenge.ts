/**
 * 30-Day Mindfulness Challenge
 *
 * Progressive daily mindfulness exercises designed to build
 * awareness, reduce reactivity, and strengthen recovery.
 */

export interface MindfulnessDayContent {
  day: number;
  title: string;
  theme: string;
  exercise: string;
  duration: number; // minutes
  instructions: string[];
  reflection: string; // Prompt for reflection
}

export const MINDFULNESS_CHALLENGE: MindfulnessDayContent[] = [
  {
    day: 1,
    title: 'Mindful Breathing',
    theme: 'Foundation',
    exercise: 'Basic breath awareness',
    duration: 5,
    instructions: [
      'Sit comfortably with your back straight',
      'Close your eyes or keep a soft gaze downward',
      'Notice the natural flow of your breath',
      'Count 10 breaths (in and out = 1)',
      'When your mind wanders, gently return to the breath',
      'Repeat for 5 minutes'
    ],
    reflection: 'How did it feel to simply focus on your breath? What did you notice?'
  },
  {
    day: 2,
    title: 'Body Awareness',
    theme: 'Foundation',
    exercise: 'Quick body scan',
    duration: 7,
    instructions: [
      'Lie down or sit comfortably',
      'Close your eyes',
      'Bring attention to your toes',
      'Notice any sensations without judgment',
      'Slowly move attention up through each body part',
      'Pause at areas of tension and breathe into them',
      'Complete the scan at the top of your head'
    ],
    reflection: 'Which parts of your body felt tense? Which felt relaxed?'
  },
  {
    day: 3,
    title: 'Mindful Observation',
    theme: 'Awareness',
    exercise: 'Object meditation',
    duration: 5,
    instructions: [
      'Choose a small object (stone, flower, etc.)',
      'Look at it as if seeing it for the first time',
      'Notice its color, texture, shape in detail',
      'Hold it and feel its weight and temperature',
      'Observe without naming or judging',
      'Stay curious about this simple object'
    ],
    reflection: 'What new details did you notice? How does slowing down change your perception?'
  },
  {
    day: 4,
    title: 'Mindful Listening',
    theme: 'Awareness',
    exercise: 'Sound meditation',
    duration: 7,
    instructions: [
      'Sit quietly and close your eyes',
      'Notice all the sounds around you',
      'Don\'t label them - just hear them',
      'Notice sounds near and far',
      'Notice sounds appearing and disappearing',
      'When thoughts arise, return to listening',
      'Practice for 7 minutes'
    ],
    reflection: 'How many different sounds did you hear? Did this feel calming or difficult?'
  },
  {
    day: 5,
    title: 'Mindful Walking',
    theme: 'Movement',
    exercise: 'Walking meditation',
    duration: 10,
    instructions: [
      'Find a quiet path or space',
      'Walk slowly and deliberately',
      'Feel each foot touching the ground',
      'Notice your weight shifting',
      'Coordinate breath with steps if helpful',
      'When mind wanders, return focus to feet',
      'Continue for 10 minutes'
    ],
    reflection: 'How did walking slowly change your experience? What did you notice?'
  },
  {
    day: 6,
    title: 'Mindful Eating',
    theme: 'Daily Life',
    exercise: 'Eating one raisin mindfully',
    duration: 5,
    instructions: [
      'Take one raisin (or small food item)',
      'Look at it closely - notice every detail',
      'Smell it',
      'Feel its texture',
      'Place it in your mouth but don\'t chew yet',
      'Notice flavors appearing',
      'Chew slowly, noticing the act of chewing',
      'Swallow mindfully'
    ],
    reflection: 'How was this different from your usual eating? What surprised you?'
  },
  {
    day: 7,
    title: 'Gratitude Meditation',
    theme: 'Positivity',
    exercise: 'Focusing on gratitude',
    duration: 7,
    instructions: [
      'Sit comfortably and close your eyes',
      'Think of three things you\'re grateful for',
      'Really feel the gratitude in your body',
      'Notice where you feel it (chest, warmth, etc.)',
      'Visualize each thing clearly',
      'Send appreciation to these aspects of your life',
      'Sit with the feeling for a few minutes'
    ],
    reflection: 'How does focusing on gratitude feel? What did you notice in your body?'
  },
  {
    day: 8,
    title: 'Breath Counting',
    theme: 'Concentration',
    exercise: 'Advanced breath counting',
    duration: 10,
    instructions: [
      'Sit in meditation posture',
      'Count each complete breath cycle (1-10)',
      'At 10, start over at 1',
      'If you lose count, start at 1',
      'Notice the quality of each breath',
      'Continue for 10 minutes'
    ],
    reflection: 'How many times did you lose count? Did it get easier?'
  },
  {
    day: 9,
    title: 'Open Awareness',
    theme: 'Awareness',
    exercise: 'Choiceless awareness',
    duration: 7,
    instructions: [
      'Sit and close your eyes',
      'Don\'t focus on anything specific',
      'Notice whatever arises: thoughts, sounds, sensations',
      'Observe without judgment',
      'Let experiences come and go',
      'Rest in open awareness'
    ],
    reflection: 'How did it feel to not focus on anything specific? Calming or challenging?'
  },
  {
    day: 10,
    title: 'Loving-Kindness',
    theme: 'Compassion',
    exercise: 'Metta meditation - self',
    duration: 10,
    instructions: [
      'Sit comfortably',
      'Place hand on heart',
      'Repeat silently: "May I be safe. May I be happy. May I be healthy. May I live with ease."',
      'Feel the words, don\'t just recite',
      'If resistance arises, that\'s okay',
      'Return to the phrases gently',
      'Continue for 10 minutes'
    ],
    reflection: 'How did it feel to direct kindness toward yourself? Was it difficult?'
  },
  {
    day: 11,
    title: 'Emotion Observation',
    theme: 'Awareness',
    exercise: 'Noticing emotions without reactivity',
    duration: 7,
    instructions: [
      'Sit quietly',
      'Notice what emotions are present',
      'Name them: "anger," "sadness," "peace"',
      'Notice where you feel them in your body',
      'Observe without trying to change them',
      'Watch them shift and change',
      'Practice acceptance'
    ],
    reflection: 'What emotions did you notice? How do they show up in your body?'
  },
  {
    day: 12,
    title: 'Thought Watching',
    theme: 'Mind',
    exercise: 'Observing thoughts as clouds',
    duration: 10,
    instructions: [
      'Imagine thoughts as clouds passing',
      'Notice a thought arise',
      'Don\'t engage with it',
      'Watch it pass like a cloud',
      'Return to open sky of awareness',
      'Repeat with each thought',
      'Practice for 10 minutes'
    ],
    reflection: 'Could you watch thoughts without getting caught in them? What did you learn?'
  },
  {
    day: 13,
    title: 'Mindful Morning',
    theme: 'Daily Life',
    exercise: 'Morning routine mindfulness',
    duration: 10,
    instructions: [
      'Choose one morning activity',
      'Do it with complete attention',
      'Notice every detail: brushing teeth, showering, making coffee',
      'Feel the temperature, smell the scents',
      'Move slowly and deliberately',
      'When mind wanders, gently return'
    ],
    reflection: 'How did this change your morning? What did you notice?'
  },
  {
    day: 14,
    title: 'Breath and Body',
    theme: 'Integration',
    exercise: 'Coordinating breath with sensation',
    duration: 10,
    instructions: [
      'Lie down comfortably',
      'Breathe into your belly',
      'On inhale, notice expansion',
      'On exhale, notice relaxation',
      'Scan for tension',
      'Breathe into tense areas',
      'Feel your whole body breathing'
    ],
    reflection: 'How does breathing into tension change it? What shifted?'
  },
  {
    day: 15,
    title: 'Compassion for Difficulty',
    theme: 'Compassion',
    exercise: 'Self-compassion break',
    duration: 7,
    instructions: [
      'Think of a current difficulty',
      'Place hand on heart',
      'Say: "This is a moment of suffering"',
      'Say: "Suffering is part of life"',
      'Say: "May I be kind to myself"',
      'Feel the compassion you\'d offer a friend',
      'Rest in self-kindness'
    ],
    reflection: 'How did offering yourself compassion feel? What changed?'
  },
  {
    day: 16,
    title: 'Urge Surfing',
    theme: 'Recovery Skills',
    exercise: 'Riding the wave of craving',
    duration: 10,
    instructions: [
      'When an urge arises, don\'t fight it',
      'Notice where you feel it',
      'Observe it like a wave',
      'Watch it build',
      'Notice the peak',
      'Watch it gradually decrease',
      'Remind yourself: all urges pass'
    ],
    reflection: 'How long did the urge last? What did you learn about cravings?'
  },
  {
    day: 17,
    title: 'RAIN Practice',
    theme: 'Difficult Emotions',
    exercise: 'Recognize, Allow, Investigate, Nurture',
    duration: 10,
    instructions: [
      'Recognize: Name what you\'re feeling',
      'Allow: Let it be there without fixing',
      'Investigate: Where is it in your body?',
      'Nurture: Offer yourself kindness',
      'Work through each step slowly',
      'Notice any shifts'
    ],
    reflection: 'Which step was hardest? How did the emotion change through RAIN?'
  },
  {
    day: 18,
    title: 'Nature Meditation',
    theme: 'Connection',
    exercise: 'Mindfulness in nature',
    duration: 15,
    instructions: [
      'Go outside to a park or natural space',
      'Sit or walk slowly',
      'Notice the sky, trees, plants',
      'Feel the air on your skin',
      'Hear birds and wind',
      'Feel connected to the earth',
      'Stay present for 15 minutes'
    ],
    reflection: 'How does nature affect your state of mind? What did you appreciate?'
  },
  {
    day: 19,
    title: 'Loving-Kindness for Others',
    theme: 'Compassion',
    exercise: 'Metta for loved ones',
    duration: 10,
    instructions: [
      'Think of someone you care about',
      'Visualize them clearly',
      'Repeat: "May you be safe. May you be happy. May you be healthy. May you live with ease."',
      'Feel genuine care',
      'Send them these wishes',
      'Expand to more people'
    ],
    reflection: 'Who did you choose? How did it feel to wish them well?'
  },
  {
    day: 20,
    title: 'Mindful Speech',
    theme: 'Communication',
    exercise: 'Pause before speaking',
    duration: 15,
    instructions: [
      'Throughout the day, pause before speaking',
      'Ask: Is it true? Is it kind? Is it necessary?',
      'Notice the impulse to speak reactively',
      'Take one breath before responding',
      'Speak with intention',
      'Notice the results'
    ],
    reflection: 'How did pausing change your conversations? What did you notice?'
  },
  {
    day: 21,
    title: 'Forgiveness Meditation',
    theme: 'Healing',
    exercise: 'Releasing resentment',
    duration: 10,
    instructions: [
      'Sit quietly',
      'Think of someone you resent (can be yourself)',
      'Acknowledge the pain',
      'Say: "I forgive you" (even if you don\'t fully mean it yet)',
      'Notice any resistance',
      'Repeat with compassion',
      'Feel the lightness of letting go'
    ],
    reflection: 'What came up? Forgiveness is a process - how do you feel now?'
  },
  {
    day: 22,
    title: 'Stress Response',
    theme: 'Stress Management',
    exercise: 'STOP technique',
    duration: 5,
    instructions: [
      'When stressed: Stop what you\'re doing',
      'Take 3 deep breaths',
      'Observe your thoughts, feelings, sensations',
      'Proceed with intention',
      'Practice this throughout the day',
      'Notice what changes'
    ],
    reflection: 'How many times did you use STOP today? What was the result?'
  },
  {
    day: 23,
    title: 'Values Meditation',
    theme: 'Purpose',
    exercise: 'Connecting to core values',
    duration: 10,
    instructions: [
      'Sit quietly',
      'Reflect on what truly matters to you',
      'Name your top 3 values (family, integrity, health, etc.)',
      'Visualize living in alignment with each',
      'Feel the importance in your body',
      'Recommit to these values'
    ],
    reflection: 'What are your core values? How is recovery helping you honor them?'
  },
  {
    day: 24,
    title: 'Joy Practice',
    theme: 'Positivity',
    exercise: 'Savoring positive moments',
    duration: 10,
    instructions: [
      'Recall a joyful memory from recovery',
      'Visualize it in detail',
      'Notice where joy lives in your body',
      'Stay with the feeling',
      'Let it fill you completely',
      'Appreciate this positive experience'
    ],
    reflection: 'What memory did you choose? How does savoring joy feel?'
  },
  {
    day: 25,
    title: 'Acceptance Practice',
    theme: 'Acceptance',
    exercise: 'Accepting what is',
    duration: 10,
    instructions: [
      'Think of something you\'re resisting',
      'Notice the struggle',
      'Ask: What if I stopped fighting this?',
      'Practice saying "yes" to this moment',
      'Feel the relief of acceptance',
      'Acceptance doesn\'t mean giving up - it means seeing clearly'
    ],
    reflection: 'What did you practice accepting? How did resistance vs. acceptance feel?'
  },
  {
    day: 26,
    title: 'Intention Setting',
    theme: 'Purpose',
    exercise: 'Setting daily intention',
    duration: 5,
    instructions: [
      'Each morning, sit for 5 minutes',
      'Ask: What is my intention for today?',
      'Choose one word or phrase (peace, patience, kindness)',
      'Feel it in your heart',
      'Return to this intention throughout the day',
      'Notice when you forget and recommit'
    ],
    reflection: 'What was your intention? How did it guide your day?'
  },
  {
    day: 27,
    title: 'Interconnection',
    theme: 'Connection',
    exercise: 'Feeling part of something larger',
    duration: 10,
    instructions: [
      'Sit and breathe',
      'Reflect on all the people in recovery',
      'Feel part of this community',
      'Consider all beings who suffer',
      'Send compassion outward',
      'Feel the shared humanity',
      'Rest in interconnection'
    ],
    reflection: 'How does feeling connected to others change your perspective?'
  },
  {
    day: 28,
    title: 'Impermanence',
    theme: 'Wisdom',
    exercise: 'Noticing change',
    duration: 10,
    instructions: [
      'Notice that everything changes',
      'Thoughts come and go',
      'Emotions arise and pass',
      'Even cravings are temporary',
      'Find freedom in impermanence',
      'Nothing lasts forever - including suffering'
    ],
    reflection: 'How does understanding impermanence help with cravings?'
  },
  {
    day: 29,
    title: 'Wisdom & Strength',
    theme: 'Empowerment',
    exercise: 'Recognizing your resilience',
    duration: 10,
    instructions: [
      'Reflect on your recovery journey',
      'Acknowledge every challenge you\'ve faced',
      'Notice your strength',
      'Feel pride in your progress',
      'Recognize your wisdom',
      'Trust in your ability to continue'
    ],
    reflection: 'What are you most proud of? What strength have you discovered?'
  },
  {
    day: 30,
    title: 'Commitment Renewal',
    theme: 'Integration',
    exercise: 'Continuing the practice',
    duration: 15,
    instructions: [
      'Sit in meditation posture',
      'Reflect on 30 days of practice',
      'Notice what has shifted',
      'Commit to continuing mindfulness',
      'Choose practices you\'ll maintain',
      'Set intention for ongoing growth',
      'Celebrate completion!'
    ],
    reflection: 'How has this challenge changed you? What will you continue practicing?'
  }
];

/**
 * Get content for a specific day
 */
export function getMindfulnessDay(day: number): MindfulnessDayContent | undefined {
  return MINDFULNESS_CHALLENGE.find(d => d.day === day);
}

/**
 * Get challenge progress
 */
export function getChallengeProgress(completedDays: number[]): {
  totalDays: number;
  completedCount: number;
  percentComplete: number;
  daysRemaining: number;
} {
  const totalDays = 30;
  const completedCount = completedDays.length;
  const percentComplete = (completedCount / totalDays) * 100;
  const daysRemaining = totalDays - completedCount;

  return {
    totalDays,
    completedCount,
    percentComplete,
    daysRemaining
  };
}
