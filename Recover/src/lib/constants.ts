import { Badge } from '@/types/app';

export const MOTIVATIONAL_QUOTES = [
  "One day at a time. You've got this.",
  "Recovery is not a race. You don't have to feel guilty about taking your time.",
  "Fall seven times, stand up eight.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "Your recovery is worth fighting for, every single day.",
  "Progress, not perfection.",
  "You are stronger than you know, braver than you believe.",
  "Today is another chance to get better.",
  "Recovery is an acceptance that your life is in shambles and you have to change.",
  "The only person you are destined to become is the person you decide to be.",
  "Every moment is a fresh beginning.",
  "You didn't come this far to only come this far.",
  "The comeback is always stronger than the setback.",
  "Your story isn't over yet.",
  "Courage doesn't always roar. Sometimes it's the quiet voice saying, 'I will try again tomorrow.'"
];

export const COPING_STRATEGIES = [
  { id: 1, title: "Deep Breathing", description: "Take 10 slow, deep breaths. Inhale for 4, hold for 4, exhale for 6.", icon: "💨" },
  { id: 2, title: "Call Your Sponsor", description: "Reach out to your sponsor or a trusted person in your support network.", icon: "📞" },
  { id: 3, title: "Go for a Walk", description: "Physical movement helps. Even 5 minutes outside can shift your mindset.", icon: "🚶" },
  { id: 4, title: "Play the Tape Forward", description: "Imagine the consequences of using. Where will you be in 1 hour? 1 day? 1 week?", icon: "⏭️" },
  { id: 5, title: "HALT Check", description: "Are you Hungry, Angry, Lonely, or Tired? Address the real need.", icon: "✋" },
  { id: 6, title: "Gratitude List", description: "Write down 3 things you're grateful for right now.", icon: "🙏" },
  { id: 7, title: "Attend a Meeting", description: "Find an online or in-person meeting happening now.", icon: "👥" },
  { id: 8, title: "Read Recovery Literature", description: "Open your recovery book or app and read for 10 minutes.", icon: "📖" },
  { id: 9, title: "Distract Yourself", description: "Do something engaging: puzzle, game, music, cleaning, cooking.", icon: "🎮" },
  { id: 10, title: "Remember Your Why", description: "Look at your reasons for recovery. What do you have to lose?", icon: "❤️" }
];

export const BADGES: Badge[] = [
  // === RECOVERY MILESTONES ===
  { id: '24h', name: '24 Hours Strong', description: 'First full day sober', icon: '🌅', requirement: 1, tier: 'bronze', category: 'recovery' },
  { id: '1week', name: 'One Week Warrior', description: '7 days of sobriety', icon: '⭐', requirement: 7, tier: 'bronze', category: 'recovery' },
  { id: '30days', name: '30-Day Champion', description: 'One month sober', icon: '🏆', requirement: 30, tier: 'silver', category: 'recovery' },
  { id: '60days', name: '60-Day Hero', description: 'Two months strong', icon: '💪', requirement: 60, tier: 'silver', category: 'recovery' },
  { id: '90days', name: '90-Day Legend', description: 'Three months of recovery', icon: '👑', requirement: 90, tier: 'gold', category: 'recovery' },
  { id: '6months', name: 'Half-Year Milestone', description: '6 months sober', icon: '🎖️', requirement: 180, tier: 'gold', category: 'recovery' },
  { id: '1year', name: 'One Year Anniversary', description: 'Full year of sobriety', icon: '🎂', requirement: 365, tier: 'platinum', category: 'recovery' },
  { id: '2years', name: 'Two Year Triumph', description: '2 years of sustained recovery', icon: '🌟', requirement: 730, tier: 'platinum', category: 'recovery' },
  { id: '5years', name: 'Five Year Legend', description: '5 incredible years sober', icon: '💎', requirement: 1825, tier: 'diamond', category: 'recovery' },
  { id: '10years', name: 'Decade of Recovery', description: '10 amazing years of sobriety', icon: '👸', requirement: 3650, tier: 'diamond', category: 'recovery' },

  // === ENGAGEMENT BADGES ===
  { id: 'checkin50', name: 'Consistent Checker', description: '50 check-ins completed', icon: '✅', requirement: 50, type: 'checkins', tier: 'bronze', category: 'engagement' },
  { id: 'checkin100', name: 'Check-In Master', description: '100 check-ins completed', icon: '💯', requirement: 100, type: 'checkins', tier: 'silver', category: 'engagement' },
  { id: 'checkin500', name: 'Dedication Pro', description: '500 check-ins completed', icon: '🎯', requirement: 500, type: 'checkins', tier: 'gold', category: 'engagement' },
  { id: 'checkin1000', name: 'Ultimate Commitment', description: '1000 check-ins milestone', icon: '🏅', requirement: 1000, type: 'checkins', tier: 'platinum', category: 'engagement' },
  { id: 'streak7', name: 'Week Streaker', description: '7-day check-in streak', icon: '🔥', requirement: 7, type: 'streak', tier: 'bronze', category: 'engagement' },
  { id: 'streak30', name: 'Streak Superstar', description: '30-day check-in streak', icon: '⚡', requirement: 30, type: 'streak', tier: 'silver', category: 'engagement' },
  { id: 'streak100', name: 'Century Streaker', description: '100-day check-in streak', icon: '💥', requirement: 100, type: 'streak', tier: 'gold', category: 'engagement' },
  { id: 'streak365', name: 'Year-Long Dedication', description: '365-day check-in streak', icon: '🌈', requirement: 365, type: 'streak', tier: 'platinum', category: 'engagement' },

  // === WELLNESS BADGES ===
  { id: 'meditation1', name: 'Mindfulness Starter', description: 'First meditation session', icon: '🧘', requirement: 1, type: 'meditations', tier: 'bronze', category: 'wellness', secret: true },
  { id: 'meditation25', name: 'Mindful Beginner', description: '25 meditation sessions', icon: '🧘‍♀️', requirement: 25, type: 'meditations', tier: 'bronze', category: 'wellness' },
  { id: 'meditation50', name: 'Zen Practitioner', description: '50 meditation sessions', icon: '☮️', requirement: 50, type: 'meditations', tier: 'silver', category: 'wellness' },
  { id: 'meditation100', name: 'Meditation Master', description: '100 meditation sessions', icon: '🕉️', requirement: 100, type: 'meditations', tier: 'gold', category: 'wellness' },
  { id: 'meeting10', name: 'Meeting Newcomer', description: '10 meetings attended', icon: '👥', requirement: 10, type: 'meetings', tier: 'bronze', category: 'wellness' },
  { id: 'meeting25', name: 'Meeting Regular', description: '25 meetings attended', icon: '🤝', requirement: 25, type: 'meetings', tier: 'bronze', category: 'wellness' },
  { id: 'meeting100', name: 'Community Champion', description: '100 meetings attended', icon: '👨‍👩‍👧‍👦', requirement: 100, type: 'meetings', tier: 'silver', category: 'wellness' },
  { id: 'meeting500', name: 'Fellowship Master', description: '500 meetings attended', icon: '🏛️', requirement: 500, type: 'meetings', tier: 'platinum', category: 'wellness' },

  // === PERSONAL GROWTH BADGES ===
  { id: 'gratitude1', name: 'First Gratitude', description: 'Your first gratitude entry', icon: '💖', requirement: 1, type: 'gratitude', tier: 'bronze', category: 'growth', secret: true },
  { id: 'gratitude30', name: 'Grateful Heart', description: '30 gratitude entries', icon: '💝', requirement: 30, type: 'gratitude', tier: 'bronze', category: 'growth' },
  { id: 'gratitude100', name: 'Gratitude Champion', description: '100 gratitude entries', icon: '💗', requirement: 100, type: 'gratitude', tier: 'silver', category: 'growth' },
  { id: 'gratitude365', name: 'Year of Thankfulness', description: '365 gratitude entries', icon: '🌺', requirement: 365, type: 'gratitude', tier: 'platinum', category: 'growth' },
  { id: 'growth10', name: 'Growth Seeker', description: '10 growth log entries', icon: '🌱', requirement: 10, type: 'growth-logs', tier: 'bronze', category: 'growth' },
  { id: 'growth50', name: 'Personal Developer', description: '50 growth log entries', icon: '🌿', requirement: 50, type: 'growth-logs', tier: 'silver', category: 'growth' },
  { id: 'growth100', name: 'Transformation Master', description: '100 growth log entries', icon: '🌳', requirement: 100, type: 'growth-logs', tier: 'gold', category: 'growth' },
  { id: 'challenge10', name: 'Challenge Acceptor', description: '10 challenges overcome', icon: '💪', requirement: 10, type: 'challenges', tier: 'bronze', category: 'growth' },
  { id: 'challenge50', name: 'Obstacle Crusher', description: '50 challenges overcome', icon: '🦾', requirement: 50, type: 'challenges', tier: 'silver', category: 'growth' },

  // === CRISIS MANAGEMENT BADGES ===
  { id: 'craving1', name: 'First Victory', description: 'Overcame your first craving', icon: '⚔️', requirement: 1, type: 'cravings', tier: 'bronze', category: 'crisis', secret: true },
  { id: 'craving10', name: 'Urge Defender', description: 'Overcame 10 cravings', icon: '🛡️', requirement: 10, type: 'cravings', tier: 'bronze', category: 'crisis' },
  { id: 'craving25', name: 'Urge Warrior', description: 'Overcame 25 cravings', icon: '⚔️', requirement: 25, type: 'cravings', tier: 'silver', category: 'crisis' },
  { id: 'craving50', name: 'Temptation Slayer', description: 'Overcame 50 cravings', icon: '🗡️', requirement: 50, type: 'cravings', tier: 'gold', category: 'crisis' },
  { id: 'craving100', name: 'Invincible Mind', description: 'Overcame 100 cravings', icon: '🏰', requirement: 100, type: 'cravings', tier: 'platinum', category: 'crisis' },

  // === SPECIAL / SECRET BADGES ===
  { id: 'earlybird', name: 'Early Bird', description: 'Checked in before 7 AM', icon: '🌅', requirement: 1, tier: 'bronze', category: 'special', secret: true },
  { id: 'nightowl', name: 'Night Owl', description: 'Checked in after 11 PM', icon: '🦉', requirement: 1, tier: 'bronze', category: 'special', secret: true },
  { id: 'perfectweek', name: 'Perfect Week', description: 'Completed all activities for 7 days straight', icon: '✨', requirement: 7, tier: 'gold', category: 'special', secret: true },
  { id: 'centurion', name: 'The Centurion', description: 'Reached 100 in every category', icon: '💫', requirement: 100, tier: 'diamond', category: 'special', secret: true },
  { id: 'allbadges', name: 'Badge Collector', description: 'Unlocked all non-secret badges', icon: '🏆', requirement: 1, tier: 'platinum', category: 'special', secret: true }
];

export const MOOD_EMOJIS = [
  { value: 1, emoji: '😢', label: 'Very Bad', color: 'text-red-500' },
  { value: 2, emoji: '😟', label: 'Bad', color: 'text-orange-500' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'text-yellow-500' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'text-green-500' },
  { value: 5, emoji: '😄', label: 'Great', color: 'text-emerald-500' }
];

