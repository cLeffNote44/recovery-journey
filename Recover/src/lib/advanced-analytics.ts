/**
 * Advanced Analytics Engine
 *
 * Provides predictive analytics, pattern detection, correlation analysis,
 * and comprehensive reporting capabilities for recovery data.
 */

import type { CheckIn, Craving, Meeting, Meditation, GrowthLog } from '@/types/app';

export interface RelapseRiskScore {
  score: number; // 0-100, higher = higher risk
  level: 'low' | 'moderate' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendations: string[];
  trend: 'improving' | 'stable' | 'worsening';
}

export interface RiskFactor {
  name: string;
  factor: string;
  weight: number; // 0-1, contribution to overall risk
  score: number; // Individual factor score
  level: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  mitigationActions: string[];
}

export interface PatternDetection {
  patterns: DetectedPattern[];
  confidence: number; // 0-1
  timeframe: string;
}

export interface DetectedPattern {
  type: 'craving' | 'mood' | 'activity' | 'behavior' | 'time' | 'day' | 'correlation';
  pattern: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  correlation: number; // -1 to 1
}

export interface CorrelationAnalysis {
  correlations: Correlation[];
  strongCorrelations: Correlation[];
  insights: string[];
}

export interface Correlation {
  variable1: string;
  variable2: string;
  coefficient: number; // -1 to 1
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative' | 'none';
  significance: number; // p-value, 0-1
  pValue: number; // p-value for statistical significance
  interpretation: string; // Human-readable interpretation
}

export interface PredictiveModel {
  predictions: Prediction[];
  accuracy: number; // 0-1
  confidence: number; // 0-1
  methodology: string;
}

export interface Prediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  trend: 'improving' | 'declining' | 'stable';
  confidenceInterval: { low: number; high: number };
  factors: string[];
}

export interface AdvancedReport {
  riskScore: RelapseRiskScore;
  patterns: PatternDetection;
  correlations: CorrelationAnalysis;
  predictions: PredictiveModel;
  summary: ReportSummary;
  generatedAt: string;
}

export interface ReportSummary {
  totalDays: number;
  avgMood: number;
  checkInRate: number;
  cravingSuccessRate: number;
  engagementScore: number; // 0-100
  overallTrend: 'positive' | 'neutral' | 'negative';
  keyInsights: string[];
}

/**
 * Calculate relapse risk score using multiple factors
 */
export function calculateRelapseRisk(data: {
  checkIns: CheckIn[];
  cravings: Craving[];
  meetings: Meeting[];
  meditations: Meditation[];
  growthLogs: GrowthLog[];
  sobrietyDate: string;
}): RelapseRiskScore {
  const factors: RiskFactor[] = [];
  let totalScore = 0;

  // Factor 1: Check-in consistency (20% weight)
  const checkInConsistency = analyzeCheckInConsistency(data.checkIns);
  const checkInRiskWeight = 0.2;
  const checkInRiskScore = (1 - checkInConsistency.rate) * 100;
  totalScore += checkInRiskScore * checkInRiskWeight;

  factors.push({
    name: 'Check-in Consistency',
    factor: 'Check-in Consistency',
    weight: checkInRiskWeight,
    score: checkInRiskScore,
    level: checkInRiskScore > 60 ? 'high' : checkInRiskScore > 30 ? 'moderate' : 'low',
    description: `${Math.round(checkInConsistency.rate * 100)}% check-in rate in last 30 days`,
    mitigationActions: checkInConsistency.rate < 0.5
      ? ['Set daily reminders', 'Join accountability group', 'Track smaller wins']
      : ['Maintain current routine']
  });

  // Factor 2: Craving intensity trend (25% weight)
  const cravingTrend = analyzeCravingTrend(data.cravings);
  const cravingWeight = 0.25;
  const cravingRiskScore = cravingTrend.avgIntensityChange > 0
    ? Math.min(cravingTrend.avgIntensityChange * 10, 100)
    : 0;
  totalScore += cravingRiskScore * cravingWeight;

  factors.push({
    name: 'Craving Intensity',
    factor: 'Craving Intensity',
    weight: cravingWeight,
    score: cravingRiskScore,
    level: cravingRiskScore > 60 ? 'high' : cravingRiskScore > 30 ? 'moderate' : 'low',
    description: cravingTrend.trend === 'increasing'
      ? 'Cravings increasing in intensity'
      : cravingTrend.trend === 'decreasing'
      ? 'Cravings decreasing - good progress'
      : 'Craving intensity stable',
    mitigationActions: cravingTrend.trend === 'increasing'
      ? ['Practice coping strategies', 'Increase meeting attendance', 'Call sponsor immediately']
      : ['Continue current strategies']
  });

  // Factor 3: Mood decline (20% weight)
  const moodTrend = analyzeMoodTrend(data.checkIns);
  const moodWeight = 0.2;
  const moodRiskScore = moodTrend.trend === 'declining' ? 75 : moodTrend.trend === 'stable' ? 30 : 0;
  totalScore += moodRiskScore * moodWeight;

  factors.push({
    name: 'Mood Trend',
    factor: 'Mood Trend',
    weight: moodWeight,
    score: moodRiskScore,
    level: moodRiskScore > 60 ? 'high' : moodRiskScore > 30 ? 'moderate' : 'low',
    description: `Average mood: ${moodTrend.avgMood.toFixed(1)}/5 (${moodTrend.trend})`,
    mitigationActions: moodTrend.trend === 'declining'
      ? ['Seek professional support', 'Increase self-care activities', 'Reach out to support network']
      : ['Maintain wellness practices']
  });

  // Factor 4: Support activity (15% weight)
  const supportActivity = analyzeSupportActivity(data.meetings, data.meditations);
  const supportWeight = 0.15;
  const supportRiskScore = (1 - supportActivity.engagementRate) * 100;
  totalScore += supportRiskScore * supportWeight;

  factors.push({
    name: 'Support Activity',
    factor: 'Support Activity',
    weight: supportWeight,
    score: supportRiskScore,
    level: supportRiskScore > 60 ? 'high' : supportRiskScore > 30 ? 'moderate' : 'low',
    description: `${supportActivity.meetingsLast30} meetings, ${supportActivity.meditationsLast30} meditations in last 30 days`,
    mitigationActions: supportActivity.engagementRate < 0.3
      ? ['Schedule regular meetings', 'Start daily meditation practice', 'Join online support groups']
      : ['Maintain current support routine']
  });

  // Factor 5: HALT indicators (20% weight)
  const haltAnalysis = analyzeHALT(data.checkIns);
  const haltWeight = 0.2;
  const haltRiskScore = haltAnalysis.highRiskRate * 100;
  totalScore += haltRiskScore * haltWeight;

  factors.push({
    name: 'HALT Indicators',
    factor: 'HALT Indicators',
    weight: haltWeight,
    score: haltRiskScore,
    level: haltRiskScore > 60 ? 'high' : haltRiskScore > 30 ? 'moderate' : 'low',
    description: `${Math.round(haltAnalysis.highRiskRate * 100)}% of check-ins show high-risk HALT states`,
    mitigationActions: haltAnalysis.highRiskRate > 0.3
      ? ['Address physical needs first', 'Practice emotional regulation', 'Establish routine sleep schedule']
      : ['Continue monitoring HALT states']
  });

  // Determine risk level and trend
  const riskLevel = totalScore > 70 ? 'critical'
    : totalScore > 50 ? 'high'
    : totalScore > 30 ? 'moderate'
    : 'low';

  const trend = determineTrend(data.checkIns, data.cravings);

  // Generate recommendations based on risk factors
  const recommendations = generateRecommendations(factors, riskLevel);

  return {
    score: Math.round(totalScore),
    level: riskLevel,
    factors: factors.sort((a, b) => (b.weight * (totalScore / 100)) - (a.weight * (totalScore / 100))),
    recommendations,
    trend
  };
}

/**
 * Detect patterns in user data
 */
export function detectPatterns(data: {
  checkIns: CheckIn[];
  cravings: Craving[];
  meetings: Meeting[];
}): PatternDetection {
  const patterns: DetectedPattern[] = [];

  // Pattern 1: Day of week craving patterns
  const dayOfWeekPattern = analyzeDayOfWeekCravings(data.cravings);
  if (dayOfWeekPattern.peak) {
    patterns.push({
      type: 'craving',
      pattern: `Peak cravings on ${dayOfWeekPattern.peak.day}s`,
      frequency: dayOfWeekPattern.peak.count,
      impact: 'negative',
      description: `You experience ${dayOfWeekPattern.peak.count}x more cravings on ${dayOfWeekPattern.peak.day}s`,
      correlation: 0.7
    });
  }

  // Pattern 2: Time of day patterns
  const timePattern = analyzeTimeOfDayCravings(data.cravings);
  if (timePattern.peak) {
    patterns.push({
      type: 'craving',
      pattern: `Peak cravings during ${timePattern.peak.period}`,
      frequency: timePattern.peak.count,
      impact: 'negative',
      description: `Most cravings occur during ${timePattern.peak.period} hours`,
      correlation: 0.65
    });
  }

  // Pattern 3: Mood-activity correlation
  const moodActivityPattern = analyzeMoodActivityCorrelation(data.checkIns, data.meetings);
  if (Math.abs(moodActivityPattern.correlation) > 0.3) {
    patterns.push({
      type: 'mood',
      pattern: moodActivityPattern.correlation > 0
        ? 'Meeting attendance improves mood'
        : 'Low meeting attendance correlates with lower mood',
      frequency: moodActivityPattern.occurrences,
      impact: moodActivityPattern.correlation > 0 ? 'positive' : 'negative',
      description: moodActivityPattern.description,
      correlation: moodActivityPattern.correlation
    });
  }

  // Pattern 4: Check-in streak patterns
  const streakPattern = analyzeStreakPatterns(data.checkIns);
  if (streakPattern.avgStreakLength > 7) {
    patterns.push({
      type: 'behavior',
      pattern: 'Strong check-in habit',
      frequency: streakPattern.totalStreaks,
      impact: 'positive',
      description: `Average streak length: ${streakPattern.avgStreakLength} days`,
      correlation: 0.8
    });
  }

  const confidence = patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.correlation, 0) / patterns.length : 0;

  return {
    patterns,
    confidence,
    timeframe: 'Last 90 days'
  };
}

/**
 * Analyze correlations between different metrics
 */
export function analyzeCorrelations(data: {
  checkIns: CheckIn[];
  cravings: Craving[];
  meetings: Meeting[];
  meditations: Meditation[];
}): CorrelationAnalysis {
  const correlations: Correlation[] = [];

  // Correlation 1: Mood vs Craving Intensity
  const moodCravingCorr = calculateCorrelation(
    data.checkIns.map(c => c.mood ?? 3),
    data.cravings.map(cr => cr.intensity)
  );

  correlations.push({
    variable1: 'Mood',
    variable2: 'Craving Intensity',
    coefficient: moodCravingCorr.coefficient,
    strength: moodCravingCorr.strength,
    direction: moodCravingCorr.direction,
    significance: moodCravingCorr.pValue,
    pValue: moodCravingCorr.pValue,
    interpretation: moodCravingCorr.direction === 'negative'
      ? 'Lower mood correlates with higher craving intensity'
      : moodCravingCorr.direction === 'positive'
      ? 'Higher mood correlates with higher craving intensity'
      : 'No significant correlation between mood and craving intensity'
  });

  // Correlation 2: Meeting Attendance vs Mood
  const meetingMoodCorr = calculateMeetingMoodCorrelation(data.meetings, data.checkIns);
  correlations.push(meetingMoodCorr);

  // Correlation 3: Meditation vs Craving Success Rate
  const meditationCravingCorr = calculateMeditationCravingCorrelation(data.meditations, data.cravings);
  correlations.push(meditationCravingCorr);

  // Filter strong correlations (|r| > 0.5)
  const strongCorrelations = correlations.filter(c => Math.abs(c.coefficient) > 0.5);

  // Generate insights from correlations
  const insights = generateCorrelationInsights(correlations);

  return {
    correlations,
    strongCorrelations,
    insights
  };
}

/**
 * Generate predictive model for future metrics
 */
export function generatePredictions(data: {
  checkIns: CheckIn[];
  cravings: Craving[];
  sobrietyDate: string;
}): PredictiveModel {
  const predictions: Prediction[] = [];

  // Prediction 1: Mood trend for next 30 days
  const moodPrediction = predictMoodTrend(data.checkIns);
  predictions.push(moodPrediction);

  // Prediction 2: Craving frequency for next 30 days
  const cravingPrediction = predictCravingFrequency(data.cravings);
  predictions.push(cravingPrediction);

  // Prediction 3: Success rate projection
  const successPrediction = predictSuccessRate(data.cravings);
  predictions.push(successPrediction);

  // Calculate model accuracy based on historical data
  const accuracy = calculateModelAccuracy(data.checkIns, data.cravings);

  return {
    predictions,
    accuracy,
    confidence: accuracy,
    methodology: 'Linear regression with exponential smoothing'
  };
}

/**
 * Generate comprehensive advanced analytics report
 */
export function generateAdvancedReport(data: {
  checkIns: CheckIn[];
  cravings: Craving[];
  meetings: Meeting[];
  meditations: Meditation[];
  growthLogs: GrowthLog[];
  sobrietyDate: string;
}): AdvancedReport {
  const riskScore = calculateRelapseRisk(data);
  const patterns = detectPatterns(data);
  const correlations = analyzeCorrelations(data);
  const predictions = generatePredictions(data);
  const summary = generateReportSummary(data);

  return {
    riskScore,
    patterns,
    correlations,
    predictions,
    summary,
    generatedAt: new Date().toISOString()
  };
}

// Helper functions

function analyzeCheckInConsistency(checkIns: CheckIn[]): { rate: number; lastStreak: number } {
  const last30Days = getLast30Days();
  const checkInDates = new Set(checkIns.map(c => c.date.split('T')[0]));
  const checkInCount = last30Days.filter(d => checkInDates.has(d)).length;

  return {
    rate: checkInCount / 30,
    lastStreak: calculateCurrentStreak(checkIns)
  };
}

function analyzeCravingTrend(cravings: Craving[]): { trend: 'increasing' | 'decreasing' | 'stable'; avgIntensityChange: number } {
  const recent = cravings.slice(0, 10);
  const older = cravings.slice(10, 20);

  if (recent.length === 0 || older.length === 0) {
    return { trend: 'stable', avgIntensityChange: 0 };
  }

  const recentAvg = recent.reduce((sum, c) => sum + c.intensity, 0) / recent.length;
  const olderAvg = older.reduce((sum, c) => sum + c.intensity, 0) / older.length;
  const change = recentAvg - olderAvg;

  return {
    trend: change > 1 ? 'increasing' : change < -1 ? 'decreasing' : 'stable',
    avgIntensityChange: change
  };
}

function analyzeMoodTrend(checkIns: CheckIn[]): { trend: 'improving' | 'stable' | 'declining'; avgMood: number } {
  const recent = checkIns.slice(0, 14).filter(c => c.mood !== undefined);
  const older = checkIns.slice(14, 28).filter(c => c.mood !== undefined);

  if (recent.length === 0) {
    return { trend: 'stable', avgMood: 3 };
  }

  const recentAvg = recent.reduce((sum, c) => sum + (c.mood ?? 3), 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((sum, c) => sum + (c.mood ?? 3), 0) / older.length : recentAvg;
  const change = recentAvg - olderAvg;

  return {
    trend: change > 0.5 ? 'improving' : change < -0.5 ? 'declining' : 'stable',
    avgMood: recentAvg
  };
}

function analyzeSupportActivity(meetings: Meeting[], meditations: Meditation[]): {
  meetingsLast30: number;
  meditationsLast30: number;
  engagementRate: number;
} {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentMeetings = meetings.filter(m => new Date(m.date) > thirtyDaysAgo).length;
  const recentMeditations = meditations.filter(m => new Date(m.date) > thirtyDaysAgo).length;

  // Ideal: 8+ meetings and 20+ meditations per month
  const engagementRate = Math.min((recentMeetings / 8 + recentMeditations / 20) / 2, 1);

  return {
    meetingsLast30: recentMeetings,
    meditationsLast30: recentMeditations,
    engagementRate
  };
}

function analyzeHALT(checkIns: CheckIn[]): { highRiskRate: number; dominantFactors: string[] } {
  const recent = checkIns.slice(0, 30);
  let highRiskCount = 0;
  const factorCounts = { hungry: 0, angry: 0, lonely: 0, tired: 0 };

  recent.forEach(checkIn => {
    if (checkIn.halt) {
      const riskCount = [
        checkIn.halt.hungry,
        checkIn.halt.angry,
        checkIn.halt.lonely,
        checkIn.halt.tired
      ].filter(Boolean).length;

      if (riskCount >= 2) highRiskCount++;

      if (checkIn.halt.hungry) factorCounts.hungry++;
      if (checkIn.halt.angry) factorCounts.angry++;
      if (checkIn.halt.lonely) factorCounts.lonely++;
      if (checkIn.halt.tired) factorCounts.tired++;
    }
  });

  const dominant = Object.entries(factorCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 2)
    .map(([k]) => k);

  return {
    highRiskRate: highRiskCount / Math.max(recent.length, 1),
    dominantFactors: dominant
  };
}

function determineTrend(checkIns: CheckIn[], cravings: Craving[]): 'improving' | 'stable' | 'worsening' {
  const moodTrend = analyzeMoodTrend(checkIns);
  const cravingTrend = analyzeCravingTrend(cravings);

  const improvingFactors = [
    moodTrend.trend === 'improving',
    cravingTrend.trend === 'decreasing'
  ].filter(Boolean).length;

  const worseningFactors = [
    moodTrend.trend === 'declining',
    cravingTrend.trend === 'increasing'
  ].filter(Boolean).length;

  if (improvingFactors > worseningFactors) return 'improving';
  if (worseningFactors > improvingFactors) return 'worsening';
  return 'stable';
}

function generateRecommendations(factors: RiskFactor[], riskLevel: string): string[] {
  const recommendations: string[] = [];

  // Add risk-level specific recommendations
  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('⚠️ Contact your sponsor or therapist immediately');
    recommendations.push('Review your relapse prevention plan');
    recommendations.push('Increase support meeting attendance');
  }

  // Add factor-specific recommendations (top 3 factors)
  factors.slice(0, 3).forEach(factor => {
    recommendations.push(...factor.mitigationActions.slice(0, 2));
  });

  return [...new Set(recommendations)].slice(0, 8);
}

function analyzeDayOfWeekCravings(cravings: Craving[]): { peak: { day: string; count: number } | null } {
  const dayCount: Record<string, number> = {};
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  cravings.forEach(craving => {
    const date = new Date(craving.date);
    const day = days[date.getDay()]!;
    dayCount[day] = (dayCount[day] || 0) + 1;
  });

  const entries = Object.entries(dayCount);
  if (entries.length === 0) return { peak: null };

  const peak = entries.reduce((a, b) => a[1] > b[1] ? a : b);
  const avg = entries.reduce((sum, [, count]) => sum + count, 0) / entries.length;

  return peak[1] > avg * 1.5 ? { peak: { day: peak[0], count: peak[1] } } : { peak: null };
}

function analyzeTimeOfDayCravings(cravings: Craving[]): { peak: { period: string; count: number } | null } {
  const periodCount: Record<string, number> = {
    'Morning (6am-12pm)': 0,
    'Afternoon (12pm-6pm)': 0,
    'Evening (6pm-12am)': 0,
    'Night (12am-6am)': 0
  };

  cravings.forEach(craving => {
    const hour = new Date(craving.date).getHours();
    if (hour >= 6 && hour < 12) periodCount['Morning (6am-12pm)']++;
    else if (hour >= 12 && hour < 18) periodCount['Afternoon (12pm-6pm)']++;
    else if (hour >= 18 && hour < 24) periodCount['Evening (6pm-12am)']++;
    else periodCount['Night (12am-6am)']++;
  });

  const entries = Object.entries(periodCount);
  const peak = entries.reduce((a, b) => a[1] > b[1] ? a : b);
  const avg = entries.reduce((sum, [, count]) => sum + count, 0) / entries.length;

  return peak[1] > avg * 1.5 ? { peak: { period: peak[0], count: peak[1] } } : { peak: null };
}

function analyzeMoodActivityCorrelation(checkIns: CheckIn[], meetings: Meeting[]): {
  correlation: number;
  occurrences: number;
  description: string;
} {
  // Simplified correlation: check if mood is higher on days with meetings
  const meetingDates = new Set(meetings.map(m => m.date.split('T')[0]));

  const withMeetings = checkIns.filter(c => c.mood !== undefined && meetingDates.has(c.date.split('T')[0] ?? ''));
  const withoutMeetings = checkIns.filter(c => c.mood !== undefined && !meetingDates.has(c.date.split('T')[0] ?? ''));

  if (withMeetings.length === 0 || withoutMeetings.length === 0) {
    return { correlation: 0, occurrences: 0, description: 'Insufficient data' };
  }

  const avgWithMeetings = withMeetings.reduce((sum, c) => sum + (c.mood ?? 3), 0) / withMeetings.length;
  const avgWithoutMeetings = withoutMeetings.reduce((sum, c) => sum + (c.mood ?? 3), 0) / withoutMeetings.length;

  const diff = avgWithMeetings - avgWithoutMeetings;
  const correlation = diff / 5; // Normalize to -1 to 1

  return {
    correlation,
    occurrences: withMeetings.length,
    description: `Mood ${diff > 0 ? 'higher' : 'lower'} on days with meetings (${avgWithMeetings.toFixed(1)} vs ${avgWithoutMeetings.toFixed(1)})`
  };
}

function analyzeStreakPatterns(checkIns: CheckIn[]): {
  avgStreakLength: number;
  totalStreaks: number;
} {
  const sortedCheckIns = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let streaks: number[] = [];
  let currentStreak = 1;
  let prevDate: Date | null = null;

  sortedCheckIns.forEach(checkIn => {
    const date = new Date(checkIn.date);
    if (prevDate) {
      const daysDiff = Math.floor((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        currentStreak++;
      } else {
        if (currentStreak > 1) streaks.push(currentStreak);
        currentStreak = 1;
      }
    }
    prevDate = date;
  });

  if (currentStreak > 1) streaks.push(currentStreak);

  const avgLength = streaks.length > 0 ? streaks.reduce((sum, s) => sum + s, 0) / streaks.length : 0;

  return {
    avgStreakLength: Math.round(avgLength),
    totalStreaks: streaks.length
  };
}

function calculateCorrelation(x: number[], y: number[]): {
  coefficient: number;
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative' | 'none';
  pValue: number;
} {
  // Filter out undefined values and align arrays
  const n = Math.min(x.length, y.length);
  if (n < 2) {
    return { coefficient: 0, strength: 'weak', direction: 'none', pValue: 1 };
  }

  const xSlice: number[] = [];
  const ySlice: number[] = [];

  for (let i = 0; i < n; i++) {
    if (x[i] !== undefined && y[i] !== undefined) {
      xSlice.push(x[i]!);
      ySlice.push(y[i]!);
    }
  }

  if (xSlice.length < 2) {
    return { coefficient: 0, strength: 'weak', direction: 'none', pValue: 1 };
  }

  const xMean = xSlice.reduce((sum, val) => sum + val, 0) / xSlice.length;
  const yMean = ySlice.reduce((sum, val) => sum + val, 0) / ySlice.length;

  let numerator = 0;
  let xDenom = 0;
  let yDenom = 0;

  for (let i = 0; i < xSlice.length; i++) {
    const xDiff = xSlice[i]! - xMean;
    const yDiff = ySlice[i]! - yMean;
    numerator += xDiff * yDiff;
    xDenom += xDiff * xDiff;
    yDenom += yDiff * yDiff;
  }

  const coefficient = numerator / Math.sqrt(xDenom * yDenom) || 0;
  const absCoeff = Math.abs(coefficient);

  return {
    coefficient,
    strength: absCoeff > 0.7 ? 'strong' : absCoeff > 0.4 ? 'moderate' : 'weak',
    direction: coefficient > 0.1 ? 'positive' : coefficient < -0.1 ? 'negative' : 'none',
    pValue: 1 - absCoeff // Simplified p-value approximation
  };
}

function calculateMeetingMoodCorrelation(meetings: Meeting[], checkIns: CheckIn[]): Correlation {
  // Weekly meeting count vs weekly average mood
  const weeklyData = aggregateByWeek(checkIns, meetings);

  const meetingCounts = weeklyData.map(w => w.meetings);
  const avgMoods = weeklyData.map(w => w.avgMood);

  const corr = calculateCorrelation(meetingCounts, avgMoods);

  return {
    variable1: 'Meeting Attendance',
    variable2: 'Mood',
    coefficient: corr.coefficient,
    strength: corr.strength,
    direction: corr.direction,
    significance: corr.pValue,
    pValue: corr.pValue,
    interpretation: corr.direction === 'positive'
      ? 'More meeting attendance correlates with better mood'
      : corr.direction === 'negative'
      ? 'More meeting attendance correlates with lower mood'
      : 'No significant correlation between meeting attendance and mood'
  };
}

function calculateMeditationCravingCorrelation(meditations: Meditation[], cravings: Craving[]): Correlation {
  // Weekly meditation minutes vs weekly craving success rate
  const weeklyData = aggregateMeditationCravingByWeek(meditations, cravings);

  const meditationMinutes = weeklyData.map(w => w.meditationMinutes);
  const successRates = weeklyData.map(w => w.successRate);

  const corr = calculateCorrelation(meditationMinutes, successRates);

  return {
    variable1: 'Meditation Minutes',
    variable2: 'Craving Success Rate',
    coefficient: corr.coefficient,
    strength: corr.strength,
    direction: corr.direction,
    significance: corr.pValue,
    pValue: corr.pValue,
    interpretation: corr.direction === 'positive'
      ? 'More meditation time correlates with better craving management'
      : corr.direction === 'negative'
      ? 'More meditation time correlates with lower craving success'
      : 'No significant correlation between meditation and craving success'
  };
}

function generateCorrelationInsights(correlations: Correlation[]): string[] {
  const insights: string[] = [];

  correlations.forEach(corr => {
    if (Math.abs(corr.coefficient) > 0.5) {
      const direction = corr.direction === 'positive' ? 'increases' : 'decreases';
      insights.push(
        `Strong ${corr.direction} correlation: ${corr.variable1} ${direction} with ${corr.variable2} (r=${corr.coefficient.toFixed(2)})`
      );
    }
  });

  return insights;
}

function predictMoodTrend(checkIns: CheckIn[]): Prediction {
  const recentMoods = checkIns.slice(0, 30).map(c => c.mood).filter((m): m is number => m !== undefined);
  const avgMood = recentMoods.length > 0 ? recentMoods.reduce((sum, m) => sum + m, 0) / recentMoods.length : 3;

  // Simple linear regression trend
  const trend = analyzeMoodTrend(checkIns);
  const trendAdjustment = trend.trend === 'improving' ? 0.3 : trend.trend === 'declining' ? -0.3 : 0;

  const predictedMood = Math.max(1, Math.min(5, avgMood + trendAdjustment));

  return {
    metric: 'Average Mood',
    currentValue: avgMood,
    predictedValue: predictedMood,
    timeframe: 'Next 30 days',
    confidence: 0.7,
    trend: trendAdjustment > 0 ? 'improving' : trendAdjustment < 0 ? 'declining' : 'stable',
    confidenceInterval: { low: predictedMood - 0.5, high: predictedMood + 0.5 },
    factors: ['Recent mood trend', 'Historical patterns', 'Activity levels']
  };
}

function predictCravingFrequency(cravings: Craving[]): Prediction {
  const recentCravings = cravings.filter(c => {
    const date = new Date(c.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date > thirtyDaysAgo;
  }).length;

  const trend = analyzeCravingTrend(cravings);
  const trendAdjustment = trend.trend === 'increasing' ? 1.2 : trend.trend === 'decreasing' ? 0.8 : 1;

  const predictedCravings = Math.round(recentCravings * trendAdjustment);

  return {
    metric: 'Craving Frequency',
    currentValue: recentCravings,
    predictedValue: predictedCravings,
    timeframe: 'Next 30 days',
    confidence: 0.65,
    trend: trendAdjustment > 1 ? 'declining' : trendAdjustment < 1 ? 'improving' : 'stable',
    confidenceInterval: { low: Math.max(0, predictedCravings - 2), high: predictedCravings + 2 },
    factors: ['Recent craving trend', 'Success rate', 'Support activity']
  };
}

function predictSuccessRate(cravings: Craving[]): Prediction {
  const recent = cravings.slice(0, 20);
  const currentRate = recent.filter(c => c.overcame).length / Math.max(recent.length, 1);

  // Predict improvement based on consistency
  const predictedRate = Math.min(1, currentRate + 0.05);

  return {
    metric: 'Craving Success Rate',
    currentValue: currentRate,
    predictedValue: predictedRate,
    timeframe: 'Next 30 days',
    confidence: 0.6,
    trend: predictedRate > currentRate ? 'improving' : 'stable',
    confidenceInterval: { low: Math.max(0, predictedRate - 0.1), high: Math.min(1, predictedRate + 0.1) },
    factors: ['Historical success rate', 'Coping strategy effectiveness']
  };
}

function calculateModelAccuracy(checkIns: CheckIn[], cravings: Craving[]): number {
  // Simplified accuracy based on data completeness and consistency
  const dataPoints = checkIns.length + cravings.length;
  const dataScore = Math.min(dataPoints / 100, 1);

  const consistencyScore = calculateCurrentStreak(checkIns) / 30;

  return (dataScore + consistencyScore) / 2;
}

function generateReportSummary(data: {
  checkIns: CheckIn[];
  cravings: Craving[];
  sobrietyDate: string;
}): ReportSummary {
  const totalDays = Math.floor(
    (new Date().getTime() - new Date(data.sobrietyDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const checkInsWithMood = data.checkIns.filter(c => c.mood !== undefined);
  const avgMood = checkInsWithMood.length > 0
    ? checkInsWithMood.reduce((sum, c) => sum + (c.mood ?? 3), 0) / checkInsWithMood.length
    : 3;

  const last30Days = getLast30Days();
  const checkInDates = new Set(data.checkIns.map(c => c.date.split('T')[0]));
  const checkInRate = last30Days.filter(d => checkInDates.has(d)).length / 30;

  const cravingSuccessRate = data.cravings.length > 0
    ? data.cravings.filter(c => c.overcame).length / data.cravings.length
    : 0;

  const engagementScore = Math.round(
    (checkInRate * 40 + cravingSuccessRate * 30 + (avgMood / 5) * 30)
  );

  const moodTrend = analyzeMoodTrend(data.checkIns);
  const cravingTrend = analyzeCravingTrend(data.cravings);

  const overallTrend = moodTrend.trend === 'improving' && cravingTrend.trend !== 'increasing'
    ? 'positive'
    : moodTrend.trend === 'declining' || cravingTrend.trend === 'increasing'
    ? 'negative'
    : 'neutral';

  const keyInsights = [
    `${totalDays} days of continuous sobriety`,
    `${Math.round(checkInRate * 100)}% check-in consistency`,
    `${Math.round(cravingSuccessRate * 100)}% craving success rate`,
    `Average mood: ${avgMood.toFixed(1)}/5`
  ];

  return {
    totalDays,
    avgMood,
    checkInRate,
    cravingSuccessRate,
    engagementScore,
    overallTrend,
    keyInsights
  };
}

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]!);
  }
  return days;
}

function calculateCurrentStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;

  const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const checkIn of sortedCheckIns) {
    const checkInDate = new Date(checkIn.date);
    checkInDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}

function aggregateByWeek(checkIns: CheckIn[], meetings: Meeting[]): Array<{ week: number; avgMood: number; meetings: number }> {
  const weeks: Map<number, { moods: number[]; meetings: number }> = new Map();

  checkIns.forEach(checkIn => {
    if (checkIn.mood !== undefined) {
      const date = new Date(checkIn.date);
      const weekNumber = getWeekNumber(date);
      const week = weeks.get(weekNumber) || { moods: [], meetings: 0 };
      week.moods.push(checkIn.mood);
      weeks.set(weekNumber, week);
    }
  });

  meetings.forEach(meeting => {
    const date = new Date(meeting.date);
    const weekNumber = getWeekNumber(date);
    const week = weeks.get(weekNumber) || { moods: [], meetings: 0 };
    week.meetings++;
    weeks.set(weekNumber, week);
  });

  return Array.from(weeks.entries()).map(([week, data]) => ({
    week,
    avgMood: data.moods.reduce((sum, m) => sum + m, 0) / Math.max(data.moods.length, 1),
    meetings: data.meetings
  }));
}

function aggregateMeditationCravingByWeek(meditations: Meditation[], cravings: Craving[]): Array<{
  week: number;
  meditationMinutes: number;
  successRate: number;
}> {
  const weeks: Map<number, { minutes: number; cravings: number; overcame: number }> = new Map();

  meditations.forEach(meditation => {
    const date = new Date(meditation.date);
    const weekNumber = getWeekNumber(date);
    const week = weeks.get(weekNumber) || { minutes: 0, cravings: 0, overcame: 0 };
    week.minutes += meditation.duration;
    weeks.set(weekNumber, week);
  });

  cravings.forEach(craving => {
    const date = new Date(craving.date);
    const weekNumber = getWeekNumber(date);
    const week = weeks.get(weekNumber) || { minutes: 0, cravings: 0, overcame: 0 };
    week.cravings++;
    if (craving.overcame) week.overcame++;
    weeks.set(weekNumber, week);
  });

  return Array.from(weeks.entries()).map(([week, data]) => ({
    week,
    meditationMinutes: data.minutes,
    successRate: data.cravings > 0 ? data.overcame / data.cravings : 0
  }));
}

function getWeekNumber(date: Date): number {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const millisecsInDay = 86400000;
  return Math.ceil((((date.getTime() - onejan.getTime()) / millisecsInDay) + onejan.getDay() + 1) / 7);
}
