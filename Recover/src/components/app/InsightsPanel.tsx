import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp, Lightbulb, Trophy, Clock, AlertTriangle } from 'lucide-react';
import type { Insight, CravingPattern, MoodTrend, SuccessMetrics } from '@/lib/analytics-engine';

interface InsightsPanelProps {
  insights: Insight[];
  cravingPatterns: CravingPattern;
  moodTrend: MoodTrend;
  successMetrics: SuccessMetrics;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function InsightsPanel({ insights, cravingPatterns, moodTrend, successMetrics }: InsightsPanelProps) {
  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return <Trophy className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-blue-500" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/50 bg-green-500/10';
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'tip':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'achievement':
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const getMoodTrendIcon = () => {
    switch (moodTrend.trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      case 'stable':
        return '➡️';
    }
  };

  const getMoodTrendColor = () => {
    switch (moodTrend.trend) {
      case 'improving':
        return 'text-green-500';
      case 'declining':
        return 'text-red-500';
      case 'stable':
        return 'text-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Key Insights
          </h3>
          {insights.map(insight => (
            <Card key={insight.id} className={`border-2 ${getInsightColor(insight.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                          Recommendations:
                        </p>
                        <ul className="text-sm space-y-1">
                          {insight.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mood Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Mood Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Trend</p>
              <p className={`text-2xl font-bold capitalize ${getMoodTrendColor()}`}>
                {getMoodTrendIcon()} {moodTrend.trend}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Recent Average</p>
              <p className="text-2xl font-bold">
                {moodTrend.recentAvg.toFixed(1)}/5
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">{moodTrend.prediction}</p>
          </div>

          {moodTrend.recommendations.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Recommendations:</p>
              <ul className="space-y-1">
                {moodTrend.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Success Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Recent Success Rate</p>
              <p className="text-3xl font-bold text-green-500">
                {successMetrics.recentSuccessRate.toFixed(0)}%
              </p>
            </div>
            <div className={`p-4 rounded-lg ${
              successMetrics.improvement >= 0
                ? 'bg-gray-100'
                : 'bg-gray-100'
            }`}>
              <p className="text-sm text-muted-foreground mb-1">Improvement</p>
              <p className={`text-3xl font-bold ${
                successMetrics.improvement >= 0 ? 'text-blue-500' : 'text-orange-500'
              }`}>
                {successMetrics.improvement >= 0 ? '+' : ''}
                {successMetrics.improvement.toFixed(0)}%
              </p>
            </div>
          </div>

          {successMetrics.strongestStrategies.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2 text-green-500">
                ✓ Your Strongest Strategies:
              </p>
              <ul className="space-y-1">
                {successMetrics.strongestStrategies.map((strategy, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {successMetrics.weakestAreas.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2 text-yellow-500">
                ⚠ Areas to Strengthen:
              </p>
              <ul className="space-y-1">
                {successMetrics.weakestAreas.map((area, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span className="text-yellow-500">⚠</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Craving Patterns */}
      {cravingPatterns.topTriggers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Craving Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Peak Times */}
            {cravingPatterns.peakTimes.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Peak Craving Times:</p>
                <div className="flex flex-wrap gap-2">
                  {cravingPatterns.peakTimes.map((time, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-medium"
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day of Week Pattern */}
            {cravingPatterns.dayOfWeek.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-3">Cravings by Day of Week:</p>
                <div className="space-y-2">
                  {cravingPatterns.dayOfWeek.slice(0, 3).map((day, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{DAYS_OF_WEEK[day.day]}</span>
                        <span className="text-muted-foreground">{day.count} cravings</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-slate-600 to-gray-700"
                          style={{
                            width: `${(day.count / cravingPatterns.dayOfWeek[0].count) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Triggers */}
            <div>
              <p className="text-sm font-semibold mb-3">Most Common Triggers:</p>
              <div className="space-y-3">
                {cravingPatterns.topTriggers.slice(0, 3).map((trigger, i) => (
                  <div key={i} className="border border-border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{trigger.trigger}</p>
                      <span className="text-xs text-muted-foreground">
                        {trigger.count} times
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            trigger.successRate >= 70
                              ? 'bg-green-500'
                              : trigger.successRate >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${trigger.successRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {trigger.successRate.toFixed(0)}% success
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            {cravingPatterns.riskFactors.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-2">Risk Factors Identified:</p>
                    <ul className="space-y-1">
                      {cravingPatterns.riskFactors.map((factor, i) => (
                        <li key={i} className="text-sm">• {factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
