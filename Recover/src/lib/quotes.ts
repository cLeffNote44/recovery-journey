/**
 * Comprehensive Motivational Quotes System
 * 50+ categorized quotes for recovery journey
 */

export type QuoteCategory =
  | 'recovery'
  | 'strength'
  | 'gratitude'
  | 'milestone'
  | 'difficult'
  | 'hope'
  | 'courage'
  | 'healing';

export interface Quote {
  id: string;
  text: string;
  author?: string;
  category: QuoteCategory;
}

export const QUOTES: Quote[] = [
  // ===== RECOVERY (12 quotes) =====
  {
    id: 'rec1',
    text: 'One day at a time. You\'ve got this.',
    category: 'recovery'
  },
  {
    id: 'rec2',
    text: 'Recovery is not a race. You don\'t have to feel guilty about taking your time.',
    category: 'recovery'
  },
  {
    id: 'rec3',
    text: 'Recovery is an acceptance that your life is in shambles and you have to change.',
    category: 'recovery'
  },
  {
    id: 'rec4',
    text: 'The first step towards getting somewhere is to decide you\'re not going to stay where you are.',
    author: 'J.P. Morgan',
    category: 'recovery'
  },
  {
    id: 'rec5',
    text: 'Recovery is not for people who need it. It\'s for people who want it.',
    category: 'recovery'
  },
  {
    id: 'rec6',
    text: 'You don\'t have to see the whole staircase, just take the first step.',
    author: 'Martin Luther King Jr.',
    category: 'recovery'
  },
  {
    id: 'rec7',
    text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
    author: 'Nelson Mandela',
    category: 'recovery'
  },
  {
    id: 'rec8',
    text: 'Rock bottom became the solid foundation on which I rebuilt my life.',
    author: 'J.K. Rowling',
    category: 'recovery'
  },
  {
    id: 'rec9',
    text: 'Every accomplishment starts with the decision to try.',
    category: 'recovery'
  },
  {
    id: 'rec10',
    text: 'Your past does not define your future. Your actions today do.',
    category: 'recovery'
  },
  {
    id: 'rec11',
    text: 'Recovery is about progression, not perfection.',
    category: 'recovery'
  },
  {
    id: 'rec12',
    text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
    category: 'recovery'
  },

  // ===== STRENGTH (10 quotes) =====
  {
    id: 'str1',
    text: 'You are stronger than you know, braver than you believe.',
    category: 'strength'
  },
  {
    id: 'str2',
    text: 'Fall seven times, stand up eight.',
    author: 'Japanese Proverb',
    category: 'strength'
  },
  {
    id: 'str3',
    text: 'The comeback is always stronger than the setback.',
    category: 'strength'
  },
  {
    id: 'str4',
    text: 'You didn\'t come this far to only come this far.',
    category: 'strength'
  },
  {
    id: 'str5',
    text: 'It always seems impossible until it\'s done.',
    author: 'Nelson Mandela',
    category: 'strength'
  },
  {
    id: 'str6',
    text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.',
    author: 'Ralph Waldo Emerson',
    category: 'strength'
  },
  {
    id: 'str7',
    text: 'I am not what happened to me. I am what I choose to become.',
    author: 'Carl Jung',
    category: 'strength'
  },
  {
    id: 'str8',
    text: 'Your recovery is worth fighting for, every single day.',
    category: 'strength'
  },
  {
    id: 'str9',
    text: 'Strength doesn\'t come from what you can do. It comes from overcoming the things you once thought you couldn\'t.',
    category: 'strength'
  },
  {
    id: 'str10',
    text: 'The only person you are destined to become is the person you decide to be.',
    author: 'Ralph Waldo Emerson',
    category: 'strength'
  },

  // ===== GRATITUDE (8 quotes) =====
  {
    id: 'grat1',
    text: 'Gratitude turns what we have into enough.',
    category: 'gratitude'
  },
  {
    id: 'grat2',
    text: 'When you focus on the good, the good gets better.',
    category: 'gratitude'
  },
  {
    id: 'grat3',
    text: 'The struggle you\'re in today is developing the strength you need for tomorrow.',
    category: 'gratitude'
  },
  {
    id: 'grat4',
    text: 'Be thankful for what you have; you\'ll end up having more.',
    author: 'Oprah Winfrey',
    category: 'gratitude'
  },
  {
    id: 'grat5',
    text: 'Every day may not be good, but there is something good in every day.',
    category: 'gratitude'
  },
  {
    id: 'grat6',
    text: 'Appreciate how far you\'ve come. Celebrate your progress.',
    category: 'gratitude'
  },
  {
    id: 'grat7',
    text: 'The more grateful you are, the more present you become.',
    category: 'gratitude'
  },
  {
    id: 'grat8',
    text: 'Gratitude is the wine for the soul. Go on. Get drunk.',
    author: 'Rumi',
    category: 'gratitude'
  },

  // ===== MILESTONE (8 quotes) =====
  {
    id: 'mile1',
    text: 'Celebrate every victory, no matter how small. They all count.',
    category: 'milestone'
  },
  {
    id: 'mile2',
    text: 'You\'ve earned this moment. Be proud of how far you\'ve come.',
    category: 'milestone'
  },
  {
    id: 'mile3',
    text: 'Each milestone is proof that recovery is possible. Keep going.',
    category: 'milestone'
  },
  {
    id: 'mile4',
    text: 'Success is the sum of small efforts repeated day in and day out.',
    author: 'Robert Collier',
    category: 'milestone'
  },
  {
    id: 'mile5',
    text: 'The journey of a thousand miles begins with one step.',
    author: 'Lao Tzu',
    category: 'milestone'
  },
  {
    id: 'mile6',
    text: 'You\'ve turned pain into power. That\'s something to celebrate.',
    category: 'milestone'
  },
  {
    id: 'mile7',
    text: 'Every sober day is a victory worth celebrating.',
    category: 'milestone'
  },
  {
    id: 'mile8',
    text: 'Look how far you\'ve come. Your future self will thank you.',
    category: 'milestone'
  },

  // ===== DIFFICULT MOMENTS (10 quotes) =====
  {
    id: 'diff1',
    text: 'Courage doesn\'t always roar. Sometimes it\'s the quiet voice saying, "I will try again tomorrow."',
    author: 'Mary Anne Radmacher',
    category: 'difficult'
  },
  {
    id: 'diff2',
    text: 'This too shall pass. You have weathered storms before.',
    category: 'difficult'
  },
  {
    id: 'diff3',
    text: 'You are not alone. Reach out. Connection is healing.',
    category: 'difficult'
  },
  {
    id: 'diff4',
    text: 'The pain you feel today will be the strength you feel tomorrow.',
    category: 'difficult'
  },
  {
    id: 'diff5',
    text: 'It\'s okay to not be okay. What matters is that you\'re still here, still trying.',
    category: 'difficult'
  },
  {
    id: 'diff6',
    text: 'Tough times don\'t last. Tough people do.',
    category: 'difficult'
  },
  {
    id: 'diff7',
    text: 'When you feel like giving up, remember why you held on for so long.',
    category: 'difficult'
  },
  {
    id: 'diff8',
    text: 'Your current situation is not your final destination.',
    category: 'difficult'
  },
  {
    id: 'diff9',
    text: 'Sometimes the bravest thing you can do is ask for help.',
    category: 'difficult'
  },
  {
    id: 'diff10',
    text: 'You\'ve survived 100% of your worst days. You\'re doing great.',
    category: 'difficult'
  },

  // ===== HOPE (7 quotes) =====
  {
    id: 'hope1',
    text: 'Every moment is a fresh beginning.',
    author: 'T.S. Eliot',
    category: 'hope'
  },
  {
    id: 'hope2',
    text: 'Your story isn\'t over yet.',
    category: 'hope'
  },
  {
    id: 'hope3',
    text: 'Today is another chance to get better.',
    category: 'hope'
  },
  {
    id: 'hope4',
    text: 'Hope is being able to see that there is light despite all of the darkness.',
    author: 'Desmond Tutu',
    category: 'hope'
  },
  {
    id: 'hope5',
    text: 'New beginnings are often disguised as painful endings.',
    author: 'Lao Tzu',
    category: 'hope'
  },
  {
    id: 'hope6',
    text: 'The sun will rise and we will try again.',
    category: 'hope'
  },
  {
    id: 'hope7',
    text: 'Tomorrow is a blank page. Write a good one.',
    category: 'hope'
  },

  // ===== COURAGE (6 quotes) =====
  {
    id: 'cour1',
    text: 'You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face.',
    author: 'Eleanor Roosevelt',
    category: 'courage'
  },
  {
    id: 'cour2',
    text: 'Courage is not the absence of fear, but the triumph over it.',
    author: 'Nelson Mandela',
    category: 'courage'
  },
  {
    id: 'cour3',
    text: 'It takes courage to grow up and become who you really are.',
    author: 'E.E. Cummings',
    category: 'courage'
  },
  {
    id: 'cour4',
    text: 'Be brave enough to be bad at something new.',
    category: 'courage'
  },
  {
    id: 'cour5',
    text: 'Owning our story and loving ourselves through that process is the bravest thing we\'ll ever do.',
    author: 'Brené Brown',
    category: 'courage'
  },
  {
    id: 'cour6',
    text: 'You are braver than you believe, stronger than you seem, and smarter than you think.',
    author: 'A.A. Milne',
    category: 'courage'
  },

  // ===== HEALING (6 quotes) =====
  {
    id: 'heal1',
    text: 'Healing is not linear. Be patient with yourself.',
    category: 'healing'
  },
  {
    id: 'heal2',
    text: 'You are allowed to be both a masterpiece and a work in progress simultaneously.',
    author: 'Sophia Bush',
    category: 'healing'
  },
  {
    id: 'heal3',
    text: 'Progress, not perfection.',
    category: 'healing'
  },
  {
    id: 'heal4',
    text: 'Give yourself the same compassion you would give to others.',
    category: 'healing'
  },
  {
    id: 'heal5',
    text: 'Healing takes time, and asking for help is a courageous step.',
    author: 'Mariska Hargitay',
    category: 'healing'
  },
  {
    id: 'heal6',
    text: 'You don\'t have to be perfect to be worthy of love and respect.',
    category: 'healing'
  }
];

/**
 * Get quote of the day based on current date
 * Uses date as seed to ensure same quote shows all day
 */
export function getQuoteOfTheDay(): Quote {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % QUOTES.length;
  return QUOTES[index] ?? QUOTES[0]!;
}

/**
 * Get a random quote (for refresh button)
 */
export function getRandomQuote(excludeId?: string): Quote {
  const availableQuotes = excludeId
    ? QUOTES.filter(q => q.id !== excludeId)
    : QUOTES;
  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  return availableQuotes[randomIndex] ?? QUOTES[0]!;
}

/**
 * Get quotes by category
 */
export function getQuotesByCategory(category: QuoteCategory): Quote[] {
  return QUOTES.filter(q => q.category === category);
}

/**
 * Get a context-appropriate quote
 * Based on app state (e.g., milestone day, difficult moment, etc.)
 */
export function getContextualQuote(context: {
  isMilestone?: boolean;
  recentCraving?: boolean;
  longStreak?: boolean;
}): Quote {
  const { isMilestone, recentCraving, longStreak } = context;

  if (isMilestone) {
    const milestoneQuotes = getQuotesByCategory('milestone');
    const randomQuote = milestoneQuotes[Math.floor(Math.random() * milestoneQuotes.length)];
    return randomQuote ?? getQuoteOfTheDay();
  }

  if (recentCraving) {
    const difficultQuotes = getQuotesByCategory('difficult');
    const randomQuote = difficultQuotes[Math.floor(Math.random() * difficultQuotes.length)];
    return randomQuote ?? getQuoteOfTheDay();
  }

  if (longStreak) {
    const gratitudeQuotes = getQuotesByCategory('gratitude');
    const randomQuote = gratitudeQuotes[Math.floor(Math.random() * gratitudeQuotes.length)];
    return randomQuote ?? getQuoteOfTheDay();
  }

  // Default: quote of the day
  return getQuoteOfTheDay();
}

/**
 * Category metadata for UI display
 */
export const QUOTE_CATEGORIES: Record<QuoteCategory, { label: string; emoji: string; description: string }> = {
  recovery: {
    label: 'Recovery',
    emoji: '🎯',
    description: 'Quotes about the recovery journey'
  },
  strength: {
    label: 'Strength',
    emoji: '💪',
    description: 'Building inner strength and resilience'
  },
  gratitude: {
    label: 'Gratitude',
    emoji: '🙏',
    description: 'Appreciation and thankfulness'
  },
  milestone: {
    label: 'Milestones',
    emoji: '🏆',
    description: 'Celebrating achievements and progress'
  },
  difficult: {
    label: 'Tough Times',
    emoji: '🌧️',
    description: 'Support during difficult moments'
  },
  hope: {
    label: 'Hope',
    emoji: '🌟',
    description: 'Inspiring hope and possibility'
  },
  courage: {
    label: 'Courage',
    emoji: '🦁',
    description: 'Finding courage to continue'
  },
  healing: {
    label: 'Healing',
    emoji: '❤️‍🩹',
    description: 'The healing process and self-compassion'
  }
};
