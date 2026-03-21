import { useState, useEffect, useMemo } from 'react';
import { useRecoveryStore } from '@/stores/useRecoveryStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useActivitiesStore } from '@/stores/useActivitiesStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HALTCheck } from '@/components/HALTCheck';
import { HomeScreenSkeleton } from '@/components/LoadingSkeletons';
import { BadgesScreen } from './BadgesScreen';
import {
  Calendar, CheckCircle, Heart, Flame,
  Shield, DollarSign, Trophy, Moon, Sun, RefreshCw, X
} from 'lucide-react';
import { calculateDaysSober, calculateStreak, getMilestone, getMoodTrend, calculateTotalSavings, calculateTotalSoberDaysThisYear, calculateTotalRecoveryDays } from '@/lib/utils';
import { MOOD_EMOJIS } from '@/lib/constants';
import { celebrate } from '@/lib/celebrations';
import { calculateBadgeProgress, getRecentlyEarnedBadges, getBadgeTierColor } from '@/lib/badges';
import { predictRelapseRisk } from '@/lib/relapse-risk-prediction';
import { RiskPredictionCard } from '../RiskPredictionCard';
import { InsightCards } from '../InsightCards';
import type { HALTCheck as HALTCheckType } from '@/types/app';
import { toast } from 'sonner';
import { getQuoteOfTheDay } from '@/lib/quotes';

export function HomeScreen() {
  // Zustand stores
  const sobrietyDate = useRecoveryStore((state) => state.sobrietyDate);
  const setSobrietyDate = useRecoveryStore((state) => state.setSobrietyDate);
  const unlockedBadges = useRecoveryStore((state) => state.unlockedBadges);
  const costPerDay = useRecoveryStore((state) => state.costPerDay);
  const reasonsForSobriety = useRecoveryStore((state) => state.reasonsForSobriety);
  const cleanPeriods = useRecoveryStore((state) => state.cleanPeriods);
  const relapses = useRecoveryStore((state) => state.relapses);

  const checkIns = useJournalStore((state) => state.checkIns);
  const setCheckIns = useJournalStore((state) => state.setCheckIns);
  const meditations = useJournalStore((state) => state.meditations);
  const meetings = useJournalStore((state) => state.meetings);
  const gratitude = useJournalStore((state) => state.gratitude);
  const growthLogs = useJournalStore((state) => state.growthLogs);
  const challenges = useJournalStore((state) => state.challenges);

  const cravings = useActivitiesStore((state) => state.cravings);

  const darkMode = useSettingsStore((state) => state.darkMode);
  const setDarkMode = useSettingsStore((state) => state.setDarkMode);
  const celebrationsEnabled = useSettingsStore((state) => state.celebrationsEnabled);
  const sleepEntries = useSettingsStore((state) => state.sleepEntries);
  const exerciseEntries = useSettingsStore((state) => state.exerciseEntries);

  // Get current quote (temporary - will be refactored)
  const currentQuote = useMemo(() => getQuoteOfTheDay(), []);
  const refreshQuote = () => {
    // Quote refresh logic will be added later
  };

  // No loading state needed with Zustand (instant)
  const loading = false;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInMood, setCheckInMood] = useState<number | null>(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [showHALT, setShowHALT] = useState(false);
  const [haltData, setHaltData] = useState<HALTCheckType | null>(null);
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  // Memoize expensive calculations to prevent unnecessary recalculations
  const daysSober = useMemo(() => calculateDaysSober(sobrietyDate), [sobrietyDate]);
  const totalRecoveryDays = useMemo(() => calculateTotalRecoveryDays(sobrietyDate, cleanPeriods || []), [sobrietyDate, cleanPeriods]);
  const streak = useMemo(() => calculateStreak(checkIns), [checkIns]);
  const totalSoberDaysThisYear = useMemo(() => calculateTotalSoberDaysThisYear(checkIns), [checkIns]);
  const milestone = useMemo(() => getMilestone(daysSober), [daysSober]);
  const moodTrend = useMemo(() => getMoodTrend(checkIns), [checkIns]);
  const totalSavings = useMemo(() => calculateTotalSavings(totalRecoveryDays, costPerDay), [totalRecoveryDays, costPerDay]);

  const hasCheckedInToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return checkIns.some(c => c.date === today);
  }, [checkIns]);

  // Calculate badge progress
  const badgeProgress = useMemo(() => calculateBadgeProgress({
    sobrietyDate,
    checkIns,
    meditations,
    meetings,
    cravings,
    gratitude,
    growthLogs,
    challenges,
    unlockedBadges
  }), [sobrietyDate, checkIns, meditations, meetings, cravings, gratitude, growthLogs, challenges, unlockedBadges]);

  const recentBadges = useMemo(() => getRecentlyEarnedBadges(badgeProgress, 5), [badgeProgress]);

  // Calculate risk prediction
  const riskPrediction = useMemo(() => {
    try {
      return predictRelapseRisk({
        checkIns,
        cravings,
        meetings,
        meditations,
        sobrietyDate
      });
    } catch (error) {
      console.error('Risk prediction error:', error);
      return null;
    }
  }, [checkIns, cravings, meetings, meditations, sobrietyDate]);

  // Celebrate milestone days
  useEffect(() => {
    if (!celebrationsEnabled) return;

    const milestoneDays = [7, 30, 60, 90, 180, 365, 730, 1095];
    const isMilestoneDay = milestoneDays.includes(daysSober);

    // Check if we've already celebrated today
    const today = new Date().toISOString().split('T')[0];
    const celebratedToday = localStorage.getItem(`celebrated_${today}`);

    if (isMilestoneDay && !celebratedToday && daysSober > 0) {
      // Delay celebration slightly to let the page load
      setTimeout(() => {
        celebrate('milestone');
        localStorage.setItem(`celebrated_${today}`, 'true');
      }, 1000);
    }
  }, [daysSober, celebrationsEnabled]);

  const handleCheckIn = () => {
    const newCheckIn = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      mood: checkInMood || undefined,
      notes: checkInNotes || undefined,
      halt: haltData || undefined
    };
    const newCheckIns = [...checkIns, newCheckIn];
    setCheckIns(newCheckIns);

    // Show success message
    const newStreak = calculateStreak(newCheckIns);
    if (newStreak === 7 || newStreak === 30 || newStreak === 90 || newStreak === 100) {
      toast.success(`Amazing! You've hit a ${newStreak}-day streak! 🔥`);
    } else {
      toast.success('Daily check-in complete! Keep it up! ✓');
    }

    // Celebrate check-in completion
    if (celebrationsEnabled) {
      // Celebrate streak milestones
      if (newStreak === 7 || newStreak === 30 || newStreak === 90 || newStreak === 100) {
        setTimeout(() => celebrate('streak'), 300);
      } else {
        // Regular check-in celebration
        setTimeout(() => celebrate('checkIn'), 300);
      }
    }

    setShowCheckInModal(false);
    setCheckInMood(null);
    setCheckInNotes('');
    setShowHALT(false);
    setHaltData(null);
  };

  // Show loading skeleton while data is loading
  if (loading) {
    return <HomeScreenSkeleton />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
            Recover
          </h1>
          <p className="text-sm text-muted-foreground mt-1">One day at a time</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sobriety Progress Card - Dual Counter */}
      <Card className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white border-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              <span className="font-semibold text-lg">Your Progress</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-8"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {showDatePicker ? 'Close' : 'Edit Date'}
            </Button>
          </div>

          {showDatePicker && (
            <div className="mb-6 pb-6 border-b border-white/20">
              <label className="text-sm opacity-90 mb-2 block">Sobriety Start Date</label>
              <Input
                type="date"
                value={sobrietyDate}
                onChange={(e) => {
                  setSobrietyDate(e.target.value);
                  setShowDatePicker(false);
                  toast.success('Sobriety date updated');
                }}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
              />
            </div>
          )}

          {/* Triple Counter Display */}
          <div className="grid grid-cols-3 gap-3">
            {/* Current Clean Period */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-300" />
                <span className="text-xs font-medium opacity-90">Current</span>
              </div>
              <div className="text-4xl font-black mb-1 bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent">
                {daysSober}
              </div>
              <div className="text-xs opacity-75">
                days clean
              </div>
            </div>

            {/* Total Recovery Days */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-medium opacity-90">Total</span>
              </div>
              <div className="text-4xl font-black mb-1 bg-gradient-to-br from-white to-yellow-200 bg-clip-text text-transparent">
                {totalRecoveryDays}
              </div>
              <div className="text-xs opacity-75">
                recovery days
              </div>
            </div>

            {/* Check-In Streak */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-xs font-medium opacity-90">Streak</span>
              </div>
              <div className="text-4xl font-black mb-1 bg-gradient-to-br from-white to-orange-200 bg-clip-text text-transparent">
                {streak}
              </div>
              <div className="text-xs opacity-75">
                check-ins
              </div>
            </div>
          </div>

          {/* Milestone Badge */}
          <div className="mt-4 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-full py-2 px-4 border border-white/20">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">{milestone.text}</span>
          </div>

          {/* Motivational Message */}
          {streak > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm opacity-90 italic">
                {streak >= 30
                  ? "Outstanding dedication! You're building an incredible foundation."
                  : streak >= 7
                  ? "You're doing amazing! Keep up the great work."
                  : "Every day is a victory. You've got this!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Check-In */}
      <Card className={`border-2 ${hasCheckedInToday ? 'border-green-500/30 bg-green-500/5' : 'border-green-500/50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className={`w-5 h-5 ${hasCheckedInToday ? 'text-green-500' : 'text-green-500'}`} />
            Daily Check-In
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasCheckedInToday ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-lg font-semibold text-green-600 mb-1">
                Checked In Today!
              </p>
              <p className="text-sm text-muted-foreground">
                Great job maintaining your streak!
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Complete your daily check-in to maintain your streak!
              </p>
              <Button
                onClick={() => setShowCheckInModal(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
              >
                Check In Now
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Motivational Quote */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700">
        <CardContent className="p-8">
          <div className="flex items-start justify-end mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (typeof refreshQuote === 'function') {
                  refreshQuote();
                }
              }}
              className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Get new quote"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-serif italic leading-relaxed text-slate-800 dark:text-slate-100 tracking-wide" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
              "{currentQuote.text}"
            </p>
            {currentQuote.author && (
              <p className="text-base font-serif text-slate-600 dark:text-slate-400 text-right" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                — {currentQuote.author}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Prediction Card */}
      {riskPrediction && riskPrediction.riskLevel !== 'low' && (
        <RiskPredictionCard prediction={riskPrediction} />
      )}

      {/* Pattern Insights */}
      <InsightCards
        cravings={cravings}
        checkIns={checkIns}
        meetings={meetings}
        sleepEntries={sleepEntries}
        exerciseEntries={exerciseEntries}
        relapses={relapses}
      />

      {/* Cost Savings */}
      {costPerDay > 0 && (
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-6 h-6" />
              <span className="font-semibold">Money Saved</span>
            </div>
            <div className="text-4xl font-black mb-1">${totalSavings.toFixed(2)}</div>
            <div className="text-sm opacity-90">
              Saving ${costPerDay}/day × {totalRecoveryDays} days
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reasons for Sobriety */}
      {reasonsForSobriety.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-500" />
              Your Why
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reasonsForSobriety.slice(0, 3).map(reason => (
                <div key={reason.id} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{reason.text}</p>
                </div>
              ))}
              {reasonsForSobriety.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{reasonsForSobriety.length - 3} more reasons
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setShowBadgesModal(true)}
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBadges.slice(0, 3).map(({ badge }) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="text-3xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{badge.name}</p>
                      {badge.tier && (
                        <span className={`text-xs ${getBadgeTierColor(badge.tier)}`}>
                          {badge.tier.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
              {recentBadges.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{recentBadges.length - 3} more badges earned
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Daily Check-In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
                <div className="flex gap-2 justify-center">
                  {MOOD_EMOJIS.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setCheckInMood(mood.value)}
                      className={`text-4xl p-2 rounded-lg transition-all ${
                        checkInMood === mood.value
                          ? 'bg-primary/20 scale-110'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Textarea
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="How's your day going?"
                  rows={3}
                />
              </div>

              {/* HALT Assessment Toggle */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setShowHALT(!showHALT)}
                  className="w-full"
                >
                  {showHALT ? '✓ HALT Assessment Included' : '+ Add HALT Assessment (Recommended)'}
                </Button>
              </div>

              {/* HALT Component */}
              {showHALT && (
                <div className="border-t pt-4">
                  <HALTCheck
                    onComplete={(halt) => setHaltData(halt)}
                    initialValues={haltData || undefined}
                    showSuggestions={false}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCheckInModal(false);
                    setCheckInMood(null);
                    setCheckInNotes('');
                    setShowHALT(false);
                    setHaltData(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckIn}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  Complete Check-In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Badges Modal */}
      {showBadgesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] bg-background rounded-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Achievements</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBadgesModal(false)}
                aria-label="Close badges"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <BadgesScreen />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

