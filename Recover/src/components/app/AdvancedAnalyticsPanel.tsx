/**
 * Advanced Analytics Panel
 *
 * Displays comprehensive analytics including:
 * - Relapse risk scoring
 * - Pattern detection
 * - Correlation analysis
 * - Predictive models
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Clock, Calendar, Activity, Brain, Target, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import {
  calculateRelapseRisk,
  detectPatterns,
  analyzeCorrelations,
  generatePredictions
} from '@/lib/advanced-analytics';
import type { CheckIn, Craving, Meeting, Meditation, GrowthLog } from '@/types/app';

interface AdvancedAnalyticsPanelProps {
  checkIns: CheckIn[];
  cravings: Craving[];
  meetings: Meeting[];
  meditations: Meditation[];
  growthLogs: GrowthLog[];
  sobrietyDate: string;
}

export function AdvancedAnalyticsPanel({
  checkIns,
  cravings,
  meetings,
  meditations,
  growthLogs,
  sobrietyDate
}: AdvancedAnalyticsPanelProps) {

  // Calculate all analytics
  const riskScore = useMemo(() =>
    calculateRelapseRisk({ checkIns, cravings, meetings, meditations, growthLogs, sobrietyDate }),
    [checkIns, cravings, meetings, meditations, growthLogs, sobrietyDate]
  );

  const patterns = useMemo(() =>
    detectPatterns({ checkIns, cravings, meetings }),
    [checkIns, cravings, meetings]
  );

  const correlations = useMemo(() =>
    analyzeCorrelations({ checkIns, cravings, meetings, meditations }),
    [checkIns, cravings, meetings, meditations]
  );

  const predictions = useMemo(() =>
    generatePredictions({ checkIns, cravings, sobrietyDate }),
    [checkIns, cravings, sobrietyDate]
  );

  // Risk level styling
  const riskConfig = {
    low: {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      icon: CheckCircle2,
      label: 'Low Risk',
      description: 'You\'re doing great! Keep up the good work.'
    },
    moderate: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      icon: Info,
      label: 'Moderate Risk',
      description: 'Stay vigilant and maintain your support activities.'
    },
    high: {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      icon: AlertCircle,
      label: 'High Risk',
      description: 'Consider increasing support activities and reaching out.'
    },
    critical: {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      icon: AlertTriangle,
      label: 'Critical Risk',
      description: 'Please reach out to your support network immediately.'
    }
  };

  const currentRisk = riskConfig[riskScore.level];
  const RiskIcon = currentRisk.icon;

  return (
    <div className="space-y-6">
      {/* Relapse Risk Score */}
      <Card className={`border-2 ${currentRisk.borderColor}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Relapse Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Score Display */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <RiskIcon className={`w-12 h-12 ${currentRisk.color}`} />
              <div>
                <div className="text-5xl font-bold">{riskScore.score}</div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
            </div>

            <div className={`inline-block px-4 py-2 rounded-full ${currentRisk.bgColor} ${currentRisk.color} font-semibold`}>
              {currentRisk.label}
            </div>

            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {currentRisk.description}
            </p>

            <Progress value={riskScore.score} className="h-3" />
          </div>

          {/* Risk Factors Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Risk Factors</h4>
            {riskScore.factors.map((factor, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{factor.name}</span>
                  <span className={`font-semibold ${
                    factor.level === 'high' || factor.level === 'critical' ? 'text-red-600' :
                    factor.level === 'moderate' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {factor.score.toFixed(1)}
                  </span>
                </div>
                <Progress value={factor.score} className="h-2" />
                <p className="text-xs text-muted-foreground">{factor.description}</p>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {riskScore.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Detected Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {patterns.patterns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keep logging data to detect patterns in your recovery journey.
            </p>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                <strong>Confidence:</strong> {(patterns.confidence * 100).toFixed(1)}% • {patterns.timeframe}
              </div>

              <div className="grid gap-3">
                {patterns.patterns.map((pattern, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-950 dark:to-blue-950">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {pattern.type === 'time' && <Clock className="w-4 h-4 text-blue-600" />}
                        {pattern.type === 'day' && <Calendar className="w-4 h-4 text-blue-600" />}
                        {pattern.type === 'correlation' && <TrendingUp className="w-4 h-4 text-green-600" />}
                        <span className="font-semibold text-sm capitalize">{pattern.type} Pattern</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-black/20">
                        {(pattern.correlation * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <p className="text-sm mb-2">{pattern.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold">Frequency:</span>
                      <span>{pattern.frequency} occurrences</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Correlation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Correlation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {correlations.strongCorrelations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No strong correlations detected yet. Continue logging to reveal connections.
            </p>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Found {correlations.strongCorrelations.length} strong correlation{correlations.strongCorrelations.length !== 1 ? 's' : ''}
              </div>

              <div className="grid gap-3">
                {correlations.strongCorrelations.map((corr, index) => {
                  const isPositive = corr.direction === 'positive';
                  const Icon = isPositive ? TrendingUp : TrendingDown;

                  return (
                    <div key={index} className={`p-3 rounded-lg border ${
                      isPositive
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950'
                        : 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                          <span className="font-semibold text-sm">{corr.variable1} ↔ {corr.variable2}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold capitalize">{corr.strength}</div>
                          <div className="text-xs text-muted-foreground">{(Math.abs(corr.coefficient) * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{corr.interpretation}</p>
                      <div className="text-xs text-muted-foreground">
                        Statistical significance: p = {corr.pValue.toFixed(3)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Key Insights */}
              {correlations.insights.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-sm">Key Insights</h4>
                  <ul className="space-y-1">
                    {correlations.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Predictive Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            30-Day Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictions.predictions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Need more data to generate predictions. Keep tracking your progress!
            </p>
          ) : (
            <div className="grid gap-4">
              {predictions.predictions.map((prediction, index) => {
                const trendIcon = prediction.trend === 'improving' ? TrendingUp :
                                 prediction.trend === 'declining' ? TrendingDown :
                                 Activity;
                const trendColor = prediction.trend === 'improving' ? 'text-green-600' :
                                  prediction.trend === 'declining' ? 'text-red-600' :
                                  'text-blue-600';

                return (
                  <div key={index} className="p-4 rounded-lg border bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {React.createElement(trendIcon, { className: `w-5 h-5 ${trendColor}` })}
                        <span className="font-semibold">{prediction.metric}</span>
                      </div>
                      <span className={`text-sm capitalize ${trendColor} font-semibold`}>
                        {prediction.trend}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Current</div>
                        <div className="text-xl font-bold">{prediction.currentValue.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Predicted (30d)</div>
                        <div className="text-xl font-bold">{prediction.predictedValue.toFixed(1)}</div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">
                      Confidence: {(prediction.confidence * 100).toFixed(0)}% •
                      Range: {prediction.confidenceInterval.low.toFixed(1)} - {prediction.confidenceInterval.high.toFixed(1)}
                    </div>

                    {prediction.factors.length > 0 && (
                      <div className="text-xs">
                        <span className="font-semibold">Key factors: </span>
                        <span className="text-muted-foreground">{prediction.factors.join(', ')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Model Info */}
          {predictions.predictions.length > 0 && (
            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
              <p className="font-semibold mb-1">About these predictions:</p>
              <p>Predictions are generated using machine learning analysis of your historical data.
              They show likely trends if you maintain similar patterns. Your actual results may vary
              based on your actions and circumstances.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
