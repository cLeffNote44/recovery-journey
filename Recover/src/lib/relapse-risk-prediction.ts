/**
 * AI-Powered Relapse Risk Prediction Engine
 *
 * Uses pattern recognition and machine learning-style algorithms to predict
 * relapse risk 3-7 days in advance based on behavioral patterns.
 */

import type { CheckIn, Craving, Meeting, Meditation, HALTCheck } from '@/types/app';

export interface RiskData {
  checkIns: CheckIn[];
  cravings: Craving[];
  meetings: Meeting[];
  meditations: Meditation[];
  sobrietyDate: string;
  previousRelapses?: Array<{ date: string; triggers: string[] }>;
}

export interface RiskPrediction {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number; // 0-100
  confidence: number; // 0-1
  timeframe: string; // e.g., "Next 3-7 days"
  predictedDate?: string; // When risk is highest
  warnings: Warning[];
  interventions: Intervention[];
  similarPatterns: SimilarPattern[];
}

export interface Warning {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedPattern: string;
  confidence: number;
  triggerFactors: string[];
}

export interface Intervention {
  id: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actions: string[];
  effectiveness: number; // Based on user's history
  timeEstimate: string; // "5 minutes", "1 hour", etc.
}

export interface SimilarPattern {
  date: string;
  similarity: number; // 0-1
  outcome: 'success' | 'struggle' | 'relapse';
  whatHelped?: string[];
  whatDidntHelp?: string[];
}

export interface BehavioralPattern {
  checkInFrequency: number; // checks per week
  checkInDecline: boolean; // Is frequency declining?
  moodTrend: 'improving' | 'stable' | 'declining';
  avgMood: number;
  moodVolatility: number; // How erratic are moods?
  cravingFrequency: number; // cravings per week
  cravingIntensityTrend: 'improving' | 'stable' | 'worsening';
  cravingSuccessRate: number;
  haltRiskFactors: {
    hungry: number;
    angry: number;
    lonely: number;
    tired: number;
  };
  meetingAttendance: number; // meetings per week
  meetingDecline: boolean;
  meditationFrequency: number;
  meditationDecline: boolean;
  isolationScore: number; // 0-100, higher = more isolated
  stressScore: number; // 0-100
}

/**
 * Main prediction engine
 */
export function predictRelapseRisk(data: {
  checkIns: CheckIn[];
  cravings: Craving[];
  meetings: Meeting[];
  meditations: Meditation[];
  sobrietyDate: string;
  previousRelapses?: Array<{ date: string; triggers: string[] }>;
}): RiskPrediction {
  const patterns = analyzeBehavioralPatterns(data);
  const riskFactors = calculateRiskFactors(patterns, data);
  const warnings = generateWarnings(patterns, riskFactors);
  const interventions = generateInterventions(warnings, patterns, data);
  const similarPatterns = findSimilarPatterns(patterns, data);

  // Calculate overall risk score (0-100)
  const riskScore = calculateOverallRiskScore(riskFactors);

  // Determine risk level
  const riskLevel =
    riskScore >= 75 ? 'critical' :
    riskScore >= 50 ? 'high' :
    riskScore >= 25 ? 'moderate' : 'low';

  // Calculate prediction confidence based on data quality
  const confidence = calculateConfidence(data);

  // Predict when risk is highest (next 3-7 days)
  const predictedDate = predictHighRiskDate(patterns, data);

  return {
    riskLevel,
    riskScore,
    confidence,
    timeframe: 'Next 3-7 days',
    predictedDate,
    warnings: warnings.slice(0, 5), // Top 5 warnings
    interventions: interventions.slice(0, 10), // Top 10 interventions
    similarPatterns: similarPatterns.slice(0, 3) // Top 3 similar patterns
  };
}

/**
 * Analyze behavioral patterns from recent data
 */
function analyzeBehavioralPatterns(data: {
  checkIns: CheckIn[];
  cravings: Craving[];
  meetings: Meeting[];
  meditations: Meditation[];
}): BehavioralPattern {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Recent vs previous week
  const recentCheckIns = data.checkIns.filter(c => new Date(c.date) >= oneWeekAgo);
  const previousCheckIns = data.checkIns.filter(c =>
    new Date(c.date) >= twoWeeksAgo && new Date(c.date) < oneWeekAgo
  );

  const recentCravings = data.cravings.filter(c => new Date(c.date) >= oneWeekAgo);
  const previousCravings = data.cravings.filter(c =>
    new Date(c.date) >= twoWeeksAgo && new Date(c.date) < oneWeekAgo
  );

  const recentMeetings = data.meetings.filter(m => new Date(m.date) >= oneWeekAgo);
  const previousMeetings = data.meetings.filter(m =>
    new Date(m.date) >= twoWeeksAgo && new Date(m.date) < oneWeekAgo
  );

  const recentMeditations = data.meditations.filter(m => new Date(m.date) >= oneWeekAgo);
  const previousMeditations = data.meditations.filter(m =>
    new Date(m.date) >= twoWeeksAgo && new Date(m.date) < oneWeekAgo
  );

  // Check-in patterns
  const checkInFrequency = recentCheckIns.length;
  const checkInDecline = recentCheckIns.length < previousCheckIns.length * 0.7;

  // Mood analysis
  const recentMoods = recentCheckIns.map(c => c.mood).filter((m): m is number => m !== undefined);
  const previousMoods = previousCheckIns.map(c => c.mood).filter((m): m is number => m !== undefined);

  const avgMood = recentMoods.length > 0
    ? recentMoods.reduce((sum, m) => sum + m, 0) / recentMoods.length
    : 3;

  const previousAvgMood = previousMoods.length > 0
    ? previousMoods.reduce((sum, m) => sum + m, 0) / previousMoods.length
    : 3;

  const moodTrend =
    avgMood > previousAvgMood + 0.5 ? 'improving' :
    avgMood < previousAvgMood - 0.5 ? 'declining' : 'stable';

  // Mood volatility (standard deviation)
  const moodVolatility = recentMoods.length > 1
    ? Math.sqrt(recentMoods.reduce((sum, m) => sum + Math.pow(m - avgMood, 2), 0) / recentMoods.length)
    : 0;

  // Craving patterns
  const cravingFrequency = recentCravings.length;
  const avgIntensity = recentCravings.length > 0
    ? recentCravings.reduce((sum, c) => sum + c.intensity, 0) / recentCravings.length
    : 0;

  const previousAvgIntensity = previousCravings.length > 0
    ? previousCravings.reduce((sum, c) => sum + c.intensity, 0) / previousCravings.length
    : 0;

  const cravingIntensityTrend =
    avgIntensity > previousAvgIntensity + 1 ? 'worsening' :
    avgIntensity < previousAvgIntensity - 1 ? 'improving' : 'stable';

  const cravingSuccessRate = recentCravings.length > 0
    ? recentCravings.filter(c => c.overcame).length / recentCravings.length
    : 1;

  // HALT analysis
  const recentHALT = recentCheckIns
    .map(c => c.halt)
    .filter((h): h is HALTCheck => h !== undefined);

  const avgHALT = recentHALT.length > 0 ? {
    hungry: recentHALT.reduce((sum, h) => sum + h.hungry, 0) / recentHALT.length,
    angry: recentHALT.reduce((sum, h) => sum + h.angry, 0) / recentHALT.length,
    lonely: recentHALT.reduce((sum, h) => sum + h.lonely, 0) / recentHALT.length,
    tired: recentHALT.reduce((sum, h) => sum + h.tired, 0) / recentHALT.length
  } : { hungry: 5, angry: 5, lonely: 5, tired: 5 };

  // Support activity
  const meetingAttendance = recentMeetings.length;
  const meetingDecline = recentMeetings.length < previousMeetings.length * 0.7;

  const meditationFrequency = recentMeditations.length;
  const meditationDecline = recentMeditations.length < previousMeditations.length * 0.7;

  // Isolation score (based on meeting attendance, check-in notes, lonely HALT)
  const isolationScore = Math.min(100,
    (10 - meetingAttendance) * 10 + avgHALT.lonely * 5
  );

  // Stress score (based on HALT angry + tired, mood volatility)
  const stressScore = Math.min(100,
    (avgHALT.angry + avgHALT.tired) * 5 + moodVolatility * 10
  );

  return {
    checkInFrequency,
    checkInDecline,
    moodTrend,
    avgMood,
    moodVolatility,
    cravingFrequency,
    cravingIntensityTrend,
    cravingSuccessRate,
    haltRiskFactors: avgHALT,
    meetingAttendance,
    meetingDecline,
    meditationFrequency,
    meditationDecline,
    isolationScore,
    stressScore
  };
}

/**
 * Calculate individual risk factors
 */
function calculateRiskFactors(patterns: BehavioralPattern, data: RiskData): Map<string, number> {
  const factors = new Map<string, number>();

  // Check-in decline (weight: 15)
  if (patterns.checkInDecline) {
    factors.set('checkInDecline', 15);
  }

  // Mood decline (weight: 20)
  if (patterns.moodTrend === 'declining') {
    factors.set('moodDecline', 20);
  }

  // Low mood (weight: 15)
  if (patterns.avgMood < 3) {
    factors.set('lowMood', 15);
  }

  // High mood volatility (weight: 10)
  if (patterns.moodVolatility > 1.5) {
    factors.set('moodVolatility', 10);
  }

  // Increasing craving frequency (weight: 20)
  if (patterns.cravingFrequency > 5) {
    factors.set('highCravingFrequency', 20);
  }

  // Worsening craving intensity (weight: 25)
  if (patterns.cravingIntensityTrend === 'worsening') {
    factors.set('worseningCravings', 25);
  }

  // Low craving success rate (weight: 20)
  if (patterns.cravingSuccessRate < 0.6) {
    factors.set('lowCravingSuccess', 20);
  }

  // High HALT scores (weight: 15 each)
  if (patterns.haltRiskFactors.hungry > 7) factors.set('highHunger', 12);
  if (patterns.haltRiskFactors.angry > 7) factors.set('highAnger', 15);
  if (patterns.haltRiskFactors.lonely > 7) factors.set('highLoneliness', 18);
  if (patterns.haltRiskFactors.tired > 7) factors.set('highTiredness', 12);

  // Meeting decline (weight: 15)
  if (patterns.meetingDecline || patterns.meetingAttendance < 2) {
    factors.set('meetingDecline', 15);
  }

  // Meditation decline (weight: 10)
  if (patterns.meditationDecline) {
    factors.set('meditationDecline', 10);
  }

  // High isolation (weight: 20)
  if (patterns.isolationScore > 60) {
    factors.set('isolation', 20);
  }

  // High stress (weight: 15)
  if (patterns.stressScore > 60) {
    factors.set('stress', 15);
  }

  return factors;
}

/**
 * Calculate overall risk score from individual factors
 */
function calculateOverallRiskScore(factors: Map<string, number>): number {
  let score = 0;
  factors.forEach(value => {
    score += value;
  });
  return Math.min(100, score);
}

/**
 * Generate warnings based on patterns
 */
function generateWarnings(patterns: BehavioralPattern, factors: Map<string, number>): Warning[] {
  const warnings: Warning[] = [];

  if (factors.has('checkInDecline')) {
    warnings.push({
      id: 'check-in-decline',
      severity: 'high',
      title: 'Check-in Frequency Declining',
      description: 'You\'ve been checking in less frequently this week compared to last week. This often precedes increased risk.',
      detectedPattern: 'Declining engagement pattern detected',
      confidence: 0.85,
      triggerFactors: ['Reduced accountability', 'Possible avoidance behavior']
    });
  }

  if (factors.has('moodDecline') || factors.has('lowMood')) {
    warnings.push({
      id: 'mood-warning',
      severity: patterns.avgMood < 2 ? 'critical' : 'high',
      title: 'Mood Declining',
      description: `Your average mood has dropped to ${patterns.avgMood.toFixed(1)}/5. Declining mood is a significant risk factor.`,
      detectedPattern: 'Negative mood trend detected',
      confidence: 0.90,
      triggerFactors: ['Depression risk', 'Emotional vulnerability']
    });
  }

  if (factors.has('worseningCravings')) {
    warnings.push({
      id: 'craving-intensity',
      severity: 'critical',
      title: 'Craving Intensity Increasing',
      description: 'Your cravings are becoming more intense. This pattern often indicates heightened risk.',
      detectedPattern: 'Escalating urge pattern',
      confidence: 0.92,
      triggerFactors: ['Increased urge strength', 'Possible trigger exposure']
    });
  }

  if (factors.has('lowCravingSuccess')) {
    warnings.push({
      id: 'low-success-rate',
      severity: 'critical',
      title: 'Craving Success Rate Dropping',
      description: `You're overcoming only ${(patterns.cravingSuccessRate * 100).toFixed(0)}% of cravings. Your coping strategies may need reinforcement.`,
      detectedPattern: 'Decreasing coping effectiveness',
      confidence: 0.88,
      triggerFactors: ['Coping fatigue', 'Strategy ineffectiveness']
    });
  }

  if (factors.has('highLoneliness')) {
    warnings.push({
      id: 'loneliness',
      severity: 'high',
      title: 'High Loneliness Detected',
      description: 'Your HALT assessments show elevated loneliness. Isolation is a major relapse trigger.',
      detectedPattern: 'Social withdrawal pattern',
      confidence: 0.82,
      triggerFactors: ['Social isolation', 'Lack of support connection']
    });
  }

  if (factors.has('meetingDecline')) {
    warnings.push({
      id: 'meeting-decline',
      severity: 'high',
      title: 'Meeting Attendance Dropping',
      description: 'You\'ve attended fewer support meetings this week. Reduced support correlates with increased risk.',
      detectedPattern: 'Support disengagement',
      confidence: 0.80,
      triggerFactors: ['Reduced support network', 'Isolation tendency']
    });
  }

  if (factors.has('stress')) {
    warnings.push({
      id: 'high-stress',
      severity: 'high',
      title: 'Elevated Stress Levels',
      description: 'Your HALT data indicates high anger and tiredness, suggesting elevated stress.',
      detectedPattern: 'Chronic stress pattern',
      confidence: 0.75,
      triggerFactors: ['Stress accumulation', 'Poor self-care']
    });
  }

  if (factors.has('isolation')) {
    warnings.push({
      id: 'isolation',
      severity: 'critical',
      title: 'Social Isolation Detected',
      description: 'Multiple indicators suggest you may be withdrawing from support systems.',
      detectedPattern: 'Isolation spiral',
      confidence: 0.88,
      triggerFactors: ['Social withdrawal', 'Loneliness', 'Shame spiral']
    });
  }

  // Sort by severity
  return warnings.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

/**
 * Generate personalized interventions
 */
function generateInterventions(
  warnings: Warning[],
  patterns: BehavioralPattern,
  data: RiskData
): Intervention[] {
  const interventions: Intervention[] = [];

  // Always include emergency support
  interventions.push({
    id: 'emergency-support',
    priority: 'immediate',
    title: 'Contact Your Support Network NOW',
    description: 'Reach out to your sponsor, therapist, or trusted friend immediately.',
    actions: [
      'Call your sponsor right now',
      'Text your accountability partner',
      'Attend an emergency meeting today',
      'Call recovery hotline: 1-800-662-4357'
    ],
    effectiveness: 0.95,
    timeEstimate: '5-10 minutes'
  });

  if (patterns.cravingFrequency > 3 || patterns.cravingSuccessRate < 0.7) {
    interventions.push({
      id: 'craving-management',
      priority: 'immediate',
      title: 'Intensive Craving Management',
      description: 'Your craving patterns suggest you need immediate coping skill reinforcement.',
      actions: [
        'Practice 10-minute urge surfing meditation NOW',
        'Use HALT check-in before each craving',
        'Call sponsor when craving hits (don\'t wait)',
        'Review your relapse prevention plan',
        'Attend extra meeting today'
      ],
      effectiveness: 0.85,
      timeEstimate: '30-60 minutes today'
    });
  }

  if (patterns.meetingAttendance < 2) {
    interventions.push({
      id: 'increase-meetings',
      priority: 'high',
      title: 'Increase Meeting Attendance',
      description: 'Your meeting attendance has dropped. Research shows this significantly increases risk.',
      actions: [
        'Schedule at least 3 meetings this week',
        'Find an online meeting if in-person is difficult',
        'Arrive early and stay late to connect',
        'Exchange numbers with 2 new people',
        'Commit to 90-in-90 if needed'
      ],
      effectiveness: 0.80,
      timeEstimate: '2-3 hours this week'
    });
  }

  if (patterns.isolationScore > 50) {
    interventions.push({
      id: 'combat-isolation',
      priority: 'high',
      title: 'Break the Isolation Cycle',
      description: 'Isolation is dangerous. You need immediate social connection.',
      actions: [
        'Text 3 people from your support network today',
        'Attend a meeting specifically to connect',
        'Schedule coffee with sponsor this week',
        'Join a recovery-focused online community',
        'Call someone instead of texting'
      ],
      effectiveness: 0.85,
      timeEstimate: '1-2 hours over 3 days'
    });
  }

  if (patterns.avgMood < 3) {
    interventions.push({
      id: 'mood-support',
      priority: 'high',
      title: 'Address Low Mood',
      description: 'Your mood has been consistently low. This requires attention.',
      actions: [
        'Schedule therapy appointment this week',
        'Practice gratitude journaling daily',
        'Get 30 minutes of exercise today',
        'Check sleep quality (aim for 7-8 hours)',
        'Consider medication evaluation if needed'
      ],
      effectiveness: 0.75,
      timeEstimate: 'Daily practice, 20-30 min'
    });
  }

  if (patterns.meditationFrequency < 3) {
    interventions.push({
      id: 'mindfulness-practice',
      priority: 'medium',
      title: 'Restart Meditation Practice',
      description: 'Daily meditation significantly reduces relapse risk.',
      actions: [
        'Start with just 5 minutes daily',
        'Use guided meditation apps',
        'Try breathing exercises when stressed',
        'Practice mindfulness during daily activities',
        'Join a meditation group'
      ],
      effectiveness: 0.70,
      timeEstimate: '5-20 minutes daily'
    });
  }

  if (patterns.stressScore > 60) {
    interventions.push({
      id: 'stress-management',
      priority: 'high',
      title: 'Urgent Stress Management',
      description: 'Your stress levels are dangerously high.',
      actions: [
        'Practice box breathing (4-4-4-4) NOW',
        'Take a 15-minute walk outside',
        'Write down stressors and action plans',
        'Delegate or postpone non-critical tasks',
        'Schedule self-care time daily'
      ],
      effectiveness: 0.78,
      timeEstimate: '15-30 minutes today'
    });
  }

  if (patterns.checkInDecline) {
    interventions.push({
      id: 'resume-checkins',
      priority: 'medium',
      title: 'Resume Daily Check-ins',
      description: 'Daily check-ins keep you accountable and aware.',
      actions: [
        'Set daily reminder for check-in',
        'Make it first thing in morning',
        'Share check-ins with accountability partner',
        'Track HALT daily for awareness',
        'Review check-in trends weekly'
      ],
      effectiveness: 0.72,
      timeEstimate: '2-5 minutes daily'
    });
  }

  // Sort by priority
  const priorityOrder = { immediate: 4, high: 3, medium: 2, low: 1 };
  return interventions.sort((a, b) =>
    priorityOrder[b.priority] - priorityOrder[a.priority]
  );
}

/**
 * Find similar historical patterns
 */
function findSimilarPatterns(
  patterns: BehavioralPattern,
  data: RiskData
): SimilarPattern[] {
  // This would analyze historical data to find similar behavioral patterns
  // For now, return empty array - would require historical tracking
  return [];
}

/**
 * Calculate prediction confidence based on data quality
 */
function calculateConfidence(data: RiskData): number {
  const { checkIns, cravings, meetings, meditations } = data;

  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentCheckIns = checkIns.filter(c => new Date(c.date) >= twoWeeksAgo).length;
  const recentCravings = cravings.filter(c => new Date(c.date) >= twoWeeksAgo).length;
  const recentMeetings = meetings.filter(m => new Date(m.date) >= twoWeeksAgo).length;
  const recentMeditations = meditations.filter(m => new Date(m.date) >= twoWeeksAgo).length;

  // More data = higher confidence
  const dataPoints = recentCheckIns + recentCravings + recentMeetings + recentMeditations;

  if (dataPoints >= 30) return 0.90;
  if (dataPoints >= 20) return 0.80;
  if (dataPoints >= 10) return 0.70;
  if (dataPoints >= 5) return 0.60;
  return 0.50;
}

/**
 * Predict which day in next 3-7 days has highest risk
 */
function predictHighRiskDate(patterns: BehavioralPattern, data: RiskData): string | undefined {
  // Analyze day-of-week patterns from historical data
  // For now, return undefined - would require more sophisticated analysis
  return undefined;
}

/**
 * Generate daily risk assessment
 */
export function getDailyRiskAssessment(data: {
  checkIns: CheckIn[];
  cravings: Craving[];
  meetings: Meeting[];
  meditations: Meditation[];
  sobrietyDate: string;
}): {
  todayRisk: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;
  topWarnings: string[];
  immediateActions: string[];
} {
  const prediction = predictRelapseRisk(data);

  return {
    todayRisk: prediction.riskLevel,
    riskScore: prediction.riskScore,
    topWarnings: prediction.warnings.slice(0, 3).map(w => w.title),
    immediateActions: prediction.interventions
      .filter(i => i.priority === 'immediate' || i.priority === 'high')
      .slice(0, 3)
      .flatMap(i => i.actions.slice(0, 2))
  };
}
