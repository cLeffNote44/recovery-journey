/**
 * Progress Sharing System
 *
 * Generate and share recovery progress reports with sponsors, therapists,
 * or support network members.
 */

import type { AppData, Contact } from '@/types/app';
import { calculateDaysSober } from './utils-app';

export interface ProgressReport {
  id: string;
  generatedAt: string;
  period: 'week' | 'month' | 'custom';
  startDate: string;
  endDate: string;
  summary: ProgressSummary;
  metrics: ProgressMetrics;
  highlights: string[];
  challenges: string[];
  goals: GoalProgress[];
  includeDetails: boolean;
}

export interface ProgressSummary {
  totalDaysSober: number;
  periodDays: number;
  checkInCount: number;
  checkInRate: number; // percentage
  averageMood: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  cravingsOvercome: number;
  totalCravings: number;
  successRate: number;
}

export interface ProgressMetrics {
  meetings: number;
  meditations: number;
  journalEntries: number;
  goalsCompleted: number;
  activitiesLogged: number;
}

export interface GoalProgress {
  goal: string;
  status: 'completed' | 'in-progress' | 'not-started';
  progress: number; // 0-100
}

export interface ShareOptions {
  includePersonalDetails: boolean;
  includeCravingDetails: boolean;
  includeJournalEntries: boolean;
  includeMoodData: boolean;
  includeGoals: boolean;
  format: 'pdf' | 'text' | 'email';
}

/**
 * Generate a progress report for a given time period
 */
export function generateProgressReport(
  data: AppData,
  period: 'week' | 'month' | 'custom',
  customStartDate?: string,
  customEndDate?: string,
  options: Partial<ShareOptions> = {}
): ProgressReport {
  const now = new Date();
  const endDate = customEndDate ? new Date(customEndDate) : now;

  let startDate: Date;
  if (period === 'custom' && customStartDate) {
    startDate = new Date(customStartDate);
  } else if (period === 'week') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Filter data for the period
  const periodCheckIns = data.checkIns.filter(c => {
    const date = new Date(c.date);
    return date >= startDate && date <= endDate;
  });

  const periodCravings = data.cravings.filter(c => {
    const date = new Date(c.date);
    return date >= startDate && date <= endDate;
  });

  const periodMeetings = data.meetings.filter(m => {
    const date = new Date(m.date);
    return date >= startDate && date <= endDate;
  });

  const periodMeditations = data.meditations.filter(m => {
    const date = new Date(m.date);
    return date >= startDate && date <= endDate;
  });

  const periodGratitude = data.gratitude.filter(g => {
    const date = new Date(g.date);
    return date >= startDate && date <= endDate;
  });

  // Calculate summary
  const totalDaysSober = calculateDaysSober(data.sobrietyDate);
  const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const checkInRate = (periodCheckIns.length / periodDays) * 100;

  const moodsWithValues = periodCheckIns.filter(c => c.mood);
  const averageMood = moodsWithValues.length > 0
    ? moodsWithValues.reduce((sum, c) => sum + (c.mood || 0), 0) / moodsWithValues.length
    : 0;

  // Calculate mood trend
  const firstHalfMoods = moodsWithValues.slice(0, Math.floor(moodsWithValues.length / 2));
  const secondHalfMoods = moodsWithValues.slice(Math.floor(moodsWithValues.length / 2));
  const firstHalfAvg = firstHalfMoods.length > 0
    ? firstHalfMoods.reduce((sum, c) => sum + (c.mood || 0), 0) / firstHalfMoods.length
    : 0;
  const secondHalfAvg = secondHalfMoods.length > 0
    ? secondHalfMoods.reduce((sum, c) => sum + (c.mood || 0), 0) / secondHalfMoods.length
    : 0;

  let moodTrend: 'improving' | 'stable' | 'declining';
  if (secondHalfAvg > firstHalfAvg + 0.3) moodTrend = 'improving';
  else if (secondHalfAvg < firstHalfAvg - 0.3) moodTrend = 'declining';
  else moodTrend = 'stable';

  const cravingsOvercome = periodCravings.filter(c => c.overcame).length;
  const totalCravings = periodCravings.length;
  const successRate = totalCravings > 0 ? (cravingsOvercome / totalCravings) * 100 : 100;

  const summary: ProgressSummary = {
    totalDaysSober,
    periodDays,
    checkInCount: periodCheckIns.length,
    checkInRate,
    averageMood,
    moodTrend,
    cravingsOvercome,
    totalCravings,
    successRate
  };

  // Calculate metrics
  const metrics: ProgressMetrics = {
    meetings: periodMeetings.length,
    meditations: periodMeditations.length,
    journalEntries: periodGratitude.length,
    goalsCompleted: 0, // Will calculate from goals
    activitiesLogged: periodCheckIns.length + periodMeetings.length + periodMeditations.length
  };

  // Generate highlights
  const highlights: string[] = [];
  if (checkInRate >= 80) highlights.push(`Maintained ${Math.round(checkInRate)}% check-in consistency`);
  if (successRate >= 80) highlights.push(`${Math.round(successRate)}% success rate managing cravings`);
  if (periodMeetings.length >= 3) highlights.push(`Attended ${periodMeetings.length} support meetings`);
  if (periodMeditations.length >= 5) highlights.push(`Completed ${periodMeditations.length} meditation sessions`);
  if (moodTrend === 'improving') highlights.push('Overall mood trending upward');
  if (totalDaysSober >= 30 && totalDaysSober < 37) highlights.push('Reached 30 days sober milestone!');
  if (totalDaysSober >= 90 && totalDaysSober < 97) highlights.push('Reached 90 days sober milestone!');

  // Generate challenges
  const challenges: string[] = [];
  if (checkInRate < 50) challenges.push('Check-in consistency could be improved');
  if (successRate < 60 && totalCravings > 0) challenges.push('Craving management needs attention');
  if (periodMeetings.length === 0) challenges.push('No support meetings attended this period');
  if (moodTrend === 'declining') challenges.push('Mood trending downward - reach out for support');
  if (averageMood < 3) challenges.push('Average mood is low - prioritize self-care');

  // Process goals
  const goals: GoalProgress[] = (data.goals || []).map(goal => {
    const completed = goal.completed || false;
    const status = completed ? 'completed' : 'in-progress';
    const progress = completed ? 100 : 50; // Simplified
    return {
      goal: goal.description,
      status,
      progress
    };
  });

  if (options.includeGoals !== false) {
    metrics.goalsCompleted = goals.filter(g => g.status === 'completed').length;
  }

  return {
    id: `report_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    generatedAt: new Date().toISOString(),
    period,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    summary,
    metrics,
    highlights,
    challenges,
    goals: options.includeGoals !== false ? goals : [],
    includeDetails: options.includePersonalDetails !== false
  };
}

/**
 * Format report as plain text for sharing
 */
export function formatReportAsText(report: ProgressReport): string {
  const { summary, metrics, highlights, challenges, goals } = report;

  const startDate = new Date(report.startDate).toLocaleDateString();
  const endDate = new Date(report.endDate).toLocaleDateString();

  let text = `RECOVERY PROGRESS REPORT\n`;
  text += `${startDate} - ${endDate}\n`;
  text += `${'='.repeat(50)}\n\n`;

  text += `SUMMARY\n`;
  text += `${'─'.repeat(50)}\n`;
  text += `Days Sober: ${summary.totalDaysSober} days\n`;
  text += `Period: ${summary.periodDays} days\n`;
  text += `Check-ins: ${summary.checkInCount} (${Math.round(summary.checkInRate)}% consistency)\n`;
  text += `Average Mood: ${summary.averageMood.toFixed(1)}/5 (${summary.moodTrend})\n`;
  text += `Cravings: ${summary.cravingsOvercome}/${summary.totalCravings} overcome (${Math.round(summary.successRate)}%)\n\n`;

  text += `ACTIVITY METRICS\n`;
  text += `${'─'.repeat(50)}\n`;
  text += `Support Meetings: ${metrics.meetings}\n`;
  text += `Meditations: ${metrics.meditations}\n`;
  text += `Journal Entries: ${metrics.journalEntries}\n`;
  text += `Goals Completed: ${metrics.goalsCompleted}\n`;
  text += `Total Activities: ${metrics.activitiesLogged}\n\n`;

  if (highlights.length > 0) {
    text += `HIGHLIGHTS ✓\n`;
    text += `${'─'.repeat(50)}\n`;
    highlights.forEach(h => {
      text += `• ${h}\n`;
    });
    text += `\n`;
  }

  if (challenges.length > 0) {
    text += `AREAS FOR GROWTH\n`;
    text += `${'─'.repeat(50)}\n`;
    challenges.forEach(c => {
      text += `• ${c}\n`;
    });
    text += `\n`;
  }

  if (goals.length > 0) {
    text += `GOALS\n`;
    text += `${'─'.repeat(50)}\n`;
    goals.forEach(g => {
      const statusIcon = g.status === 'completed' ? '✓' : '○';
      text += `${statusIcon} ${g.goal} (${g.progress}%)\n`;
    });
    text += `\n`;
  }

  text += `${'='.repeat(50)}\n`;
  text += `Generated: ${new Date(report.generatedAt).toLocaleString()}\n`;
  text += `\nKeep going - you're doing great! 💪\n`;

  return text;
}

/**
 * Format report as HTML for email
 */
export function formatReportAsHTML(report: ProgressReport): string {
  const { summary, metrics, highlights, challenges, goals } = report;

  const startDate = new Date(report.startDate).toLocaleDateString();
  const endDate = new Date(report.endDate).toLocaleDateString();

  let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #8b5cf6; border-bottom: 3px solid #8b5cf6; padding-bottom: 10px; }
    h2 { color: #6366f1; margin-top: 30px; }
    .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
    .highlights { background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; }
    .challenges { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
    ul { list-style: none; padding-left: 0; }
    li { padding: 5px 0; }
    li:before { content: "• "; color: #8b5cf6; font-weight: bold; }
    .goal { background: white; padding: 10px; margin: 5px 0; border-radius: 4px; border: 1px solid #e5e7eb; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <h1>Recovery Progress Report</h1>
  <p><strong>${startDate} - ${endDate}</strong></p>

  <div class="summary">
    <div class="metric">
      <div class="metric-label">Days Sober</div>
      <div class="metric-value">${summary.totalDaysSober}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Check-in Rate</div>
      <div class="metric-value">${Math.round(summary.checkInRate)}%</div>
    </div>
    <div class="metric">
      <div class="metric-label">Avg Mood</div>
      <div class="metric-value">${summary.averageMood.toFixed(1)}/5</div>
    </div>
    <div class="metric">
      <div class="metric-label">Craving Success</div>
      <div class="metric-value">${Math.round(summary.successRate)}%</div>
    </div>
  </div>

  <h2>Activity Metrics</h2>
  <ul>
    <li>Support Meetings: ${metrics.meetings}</li>
    <li>Meditations: ${metrics.meditations}</li>
    <li>Journal Entries: ${metrics.journalEntries}</li>
    <li>Goals Completed: ${metrics.goalsCompleted}</li>
  </ul>
`;

  if (highlights.length > 0) {
    html += `
  <h2>Highlights</h2>
  <div class="highlights">
    <ul>
      ${highlights.map(h => `<li>${h}</li>`).join('')}
    </ul>
  </div>
`;
  }

  if (challenges.length > 0) {
    html += `
  <h2>Areas for Growth</h2>
  <div class="challenges">
    <ul>
      ${challenges.map(c => `<li>${c}</li>`).join('')}
    </ul>
  </div>
`;
  }

  if (goals.length > 0) {
    html += `
  <h2>Goals</h2>
  ${goals.map(g => `
    <div class="goal">
      <strong>${g.status === 'completed' ? '✓' : '○'} ${g.goal}</strong>
      <span style="float: right; color: #6b7280;">${g.progress}%</span>
    </div>
  `).join('')}
`;
  }

  html += `
  <div class="footer">
    Generated: ${new Date(report.generatedAt).toLocaleString()}<br>
    Keep going - you're doing great! 💪
  </div>
</body>
</html>
`;

  return html;
}

/**
 * Share report via email (opens default email client)
 */
export function shareViaEmail(report: ProgressReport, recipient: Contact): void {
  const subject = encodeURIComponent(`Recovery Progress Report - ${new Date(report.endDate).toLocaleDateString()}`);
  const body = encodeURIComponent(formatReportAsText(report));

  const mailtoLink = `mailto:${recipient.email}?subject=${subject}&body=${body}`;
  window.open(mailtoLink, '_self');
}

/**
 * Download report as text file
 */
export function downloadReportAsText(report: ProgressReport): void {
  const text = formatReportAsText(report);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `recovery-progress-${new Date(report.endDate).toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy report to clipboard
 */
export async function copyReportToClipboard(report: ProgressReport): Promise<boolean> {
  const text = formatReportAsText(report);

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
