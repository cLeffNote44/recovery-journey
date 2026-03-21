import { forwardRef, useMemo } from 'react';
import { calculateDaysSober, calculateStreak, getMilestone, calculateTotalSavings } from '@/lib/utils';
import { BADGES } from '@/lib/constants';
import type { AppData } from '@/types/app';
import { ReportOptions, getDateRangeDescription, filterByDateRange } from '@/lib/pdf-generator';

// Simple CSS-based chart components for PDF rendering
function MoodTrendChart({ checkIns }: { checkIns: { date: string; mood?: number }[] }) {
  // Get last 14 days of mood data
  const recentCheckIns = checkIns
    .filter(c => c.mood !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14);

  if (recentCheckIns.length < 3) return null;

  const maxMood = 10;

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-lg mb-4 text-gray-900">Mood Trend (Last 14 Days)</h3>
      <div className="flex items-end gap-1 h-32 bg-gray-50 p-4 rounded-lg">
        {recentCheckIns.map((checkIn, i) => {
          const height = ((checkIn.mood || 0) / maxMood) * 100;
          const color = (checkIn.mood || 0) >= 7 ? 'bg-green-500' : (checkIn.mood || 0) >= 4 ? 'bg-yellow-500' : 'bg-red-500';
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full ${color} rounded-t`}
                style={{ height: `${height}%`, minHeight: '4px' }}
              />
              <span className="text-xs text-gray-500 mt-1">
                {new Date(checkIn.date).getDate()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Low (1)</span>
        <span>High (10)</span>
      </div>
    </div>
  );
}

function CravingIntensityChart({ cravings }: { cravings: { date: string; intensity: number }[] }) {
  // Get last 14 days of craving data
  const recentCravings = cravings
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14);

  if (recentCravings.length < 3) return null;

  const maxIntensity = 10;

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-lg mb-4 text-gray-900">Craving Intensity Trend</h3>
      <div className="flex items-end gap-1 h-32 bg-gray-50 p-4 rounded-lg">
        {recentCravings.map((craving, i) => {
          const height = (craving.intensity / maxIntensity) * 100;
          const color = craving.intensity <= 3 ? 'bg-green-500' : craving.intensity <= 6 ? 'bg-yellow-500' : 'bg-red-500';
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full ${color} rounded-t`}
                style={{ height: `${height}%`, minHeight: '4px' }}
              />
              <span className="text-xs text-gray-500 mt-1">
                {new Date(craving.date).getDate()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Low (1)</span>
        <span>High (10)</span>
      </div>
    </div>
  );
}

function WeeklyActivityChart({ data }: { data: { day: string; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-lg mb-4 text-gray-900">Weekly Activity Distribution</h3>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-12">{item.day}</span>
            <div className="flex-1 bg-gray-100 rounded h-6 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium w-8 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessRateChart({ rate, total }: { rate: number; total: number }) {
  return (
    <div className="mb-8">
      <h3 className="font-semibold text-lg mb-4 text-gray-900">Craving Success Rate</h3>
      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
          style={{ width: `${rate}%` }}
        />
      </div>
      <div className="flex justify-between text-sm mt-2">
        <span className="text-gray-600">{Math.round(rate * total / 100)} overcome</span>
        <span className="font-bold text-green-600">{rate}%</span>
        <span className="text-gray-600">{total} total</span>
      </div>
    </div>
  );
}

interface PDFReportProps {
  data: AppData;
  options: ReportOptions;
}

/**
 * PDF Report Component
 * This component renders a printable/PDF-exportable recovery journey report
 */
export const PDFReport = forwardRef<HTMLDivElement, PDFReportProps>(
  ({ data, options }, ref) => {
    const daysSober = calculateDaysSober(data.sobrietyDate);
    const streak = calculateStreak(data.checkIns);
    const milestone = getMilestone(daysSober);
    const totalSavings = calculateTotalSavings(daysSober, data.costPerDay);

    // Filter data by date range
    const filteredCheckIns = filterByDateRange(data.checkIns, options);
    const filteredCravings = filterByDateRange(data.cravings, options);
    const filteredMeetings = filterByDateRange(data.meetings, options);
    const filteredGrowthLogs = filterByDateRange(data.growthLogs, options);
    const filteredGratitude = filterByDateRange(data.gratitude, options);
    const filteredMeditations = filterByDateRange(data.meditations, options);

    // Calculate stats
    const cravingsOvercome = filteredCravings.filter(c => c.overcame).length;
    const successRate = filteredCravings.length > 0
      ? Math.round((cravingsOvercome / filteredCravings.length) * 100)
      : 0;

    // Get unlocked badges
    const unlockedBadges = BADGES.filter(badge =>
      data.unlockedBadges.includes(badge.id)
    );

    const dateRange = getDateRangeDescription(options);

    // Calculate weekly activity distribution
    const weeklyActivity = useMemo(() => {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const counts = new Array(7).fill(0);

      filteredCheckIns.forEach(c => {
        const day = new Date(c.date).getDay();
        counts[day]++;
      });

      return dayNames.map((day, i) => ({ day, count: counts[i] }));
    }, [filteredCheckIns]);

    return (
      <div ref={ref} className="bg-white text-gray-900 p-12 max-w-4xl mx-auto">
        {/* Cover Page */}
        <div className="mb-12 text-center">
          <div className="text-6xl mb-4">💪</div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            Recover Report
          </h1>
          <p className="text-xl text-gray-600 mb-8">{dateRange}</p>
          <div className="text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-12 border-t-4 border-blue-500 pt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Summary Statistics</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-100 to-blue-100 p-6 rounded-lg">
              <div className="text-4xl font-bold text-purple-700 mb-2">{daysSober}</div>
              <div className="text-sm font-medium text-gray-700">Days Sober</div>
              <div className="text-xs text-gray-600 mt-1">{milestone.text}</div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-lg">
              <div className="text-4xl font-bold text-green-700 mb-2">{streak}</div>
              <div className="text-sm font-medium text-gray-700">Check-in Streak</div>
              <div className="text-xs text-gray-600 mt-1">Consecutive days</div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-red-100 p-6 rounded-lg">
              <div className="text-4xl font-bold text-orange-700 mb-2">{successRate}%</div>
              <div className="text-sm font-medium text-gray-700">Success Rate</div>
              <div className="text-xs text-gray-600 mt-1">{cravingsOvercome}/{filteredCravings.length} cravings overcome</div>
            </div>
            {data.costPerDay > 0 && (
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 rounded-lg">
                <div className="text-4xl font-bold text-blue-700 mb-2">${totalSavings.toFixed(0)}</div>
                <div className="text-sm font-medium text-gray-700">Money Saved</div>
                <div className="text-xs text-gray-600 mt-1">${data.costPerDay}/day × {daysSober} days</div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Activity Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="text-2xl font-bold text-gray-900">{filteredCheckIns.length}</div>
              <div className="text-sm text-gray-600">Daily Check-ins</div>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="text-2xl font-bold text-gray-900">{filteredMeetings.length}</div>
              <div className="text-sm text-gray-600">Meetings Attended</div>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="text-2xl font-bold text-gray-900">{filteredMeditations.length}</div>
              <div className="text-sm text-gray-600">Meditations</div>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="text-2xl font-bold text-gray-900">{filteredGratitude.length}</div>
              <div className="text-sm text-gray-600">Gratitude Entries</div>
            </div>
          </div>
        </div>

        {/* Visual Analytics Section */}
        <div className="mb-12 page-break-before">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Visual Analytics</h2>

          {/* Success Rate Chart */}
          {filteredCravings.length > 0 && (
            <SuccessRateChart rate={successRate} total={filteredCravings.length} />
          )}

          {/* Mood Trend Chart */}
          {filteredCheckIns.length >= 3 && (
            <MoodTrendChart checkIns={filteredCheckIns} />
          )}

          {/* Craving Intensity Chart */}
          {filteredCravings.length >= 3 && (
            <CravingIntensityChart cravings={filteredCravings} />
          )}

          {/* Weekly Activity Chart */}
          {filteredCheckIns.length > 0 && (
            <WeeklyActivityChart data={weeklyActivity} />
          )}
        </div>

        {/* Badge Achievements */}
        {unlockedBadges.length > 0 && (
          <div className="mb-12 page-break-before">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Badge Achievements</h2>
            <div className="grid grid-cols-3 gap-4">
              {unlockedBadges.map(badge => (
                <div key={badge.id} className="border-2 border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className="font-semibold text-sm text-gray-900">{badge.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{badge.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Growth Logs */}
        {options.includeGrowthLogs && filteredGrowthLogs.length > 0 && (
          <div className="mb-12 page-break-before">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Growth & Learning</h2>
            <div className="space-y-4">
              {filteredGrowthLogs.slice(0, 10).map(log => (
                <div key={log.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(log.date).toLocaleDateString()}
                  </div>
                  <div className="font-semibold text-gray-900">{log.title}</div>
                  <div className="text-sm text-gray-700 mt-1">{log.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gratitude Entries */}
        {options.includeGratitude && filteredGratitude.length > 0 && (
          <div className="mb-12 page-break-before">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Gratitude Journal</h2>
            <div className="space-y-3">
              {filteredGratitude.slice(0, 15).map(entry => (
                <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-700">{entry.entry}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Craving Analysis */}
        {filteredCravings.length > 0 && (
          <div className="mb-12 page-break-before">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Craving Analysis</h2>
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-900">Top Triggers</h3>
              <div className="space-y-2">
                {Object.entries(
                  filteredCravings.reduce((acc, craving) => {
                    acc[craving.trigger] = (acc[craving.trigger] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([trigger, count]) => (
                    <div key={trigger} className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-900">{trigger}</span>
                      <span className="font-semibold text-gray-700">{count} times</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-700">
                <strong>Average Intensity:</strong>{' '}
                {filteredCravings.length > 0
                  ? (
                      filteredCravings.reduce((sum, c) => sum + c.intensity, 0) /
                      filteredCravings.length
                    ).toFixed(1)
                  : 0}
                /10
              </div>
            </div>
          </div>
        )}

        {/* Reasons for Sobriety */}
        {data.reasonsForSobriety.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Why</h2>
            <div className="space-y-3">
              {data.reasonsForSobriety.map(reason => (
                <div key={reason.id} className="bg-purple-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-gray-900">{reason.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t-2 border-gray-200 text-center text-sm text-gray-500">
          <p>Generated by Recover App</p>
          <p className="mt-2">Keep going. One day at a time. 💪</p>
        </div>

        {/* CSS for printing */}
        <style>{`
          @media print {
            .page-break-before {
              page-break-before: always;
            }
          }
        `}</style>
      </div>
    );
  }
);

PDFReport.displayName = 'PDFReport';
