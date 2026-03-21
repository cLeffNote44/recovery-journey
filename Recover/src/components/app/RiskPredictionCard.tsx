import React, { useMemo } from 'react';
import { AlertTriangle, Shield, TrendingUp, TrendingDown, Calendar, Lightbulb, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { RiskPrediction } from '@/lib/relapse-risk-prediction';

interface RiskPredictionCardProps {
  prediction: RiskPrediction;
  onViewDetails?: () => void;
}

export function RiskPredictionCard({ prediction, onViewDetails }: RiskPredictionCardProps) {
  const { riskLevel, riskScore, confidence, timeframe, warnings, interventions } = prediction;

  // Determine colors and icons based on risk level
  const riskConfig = useMemo(() => {
    switch (riskLevel) {
      case 'critical':
        return {
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-700 dark:text-red-400',
          badgeVariant: 'destructive' as const,
          icon: <AlertTriangle className="h-5 w-5" />,
          title: 'Critical Risk Detected',
          description: 'Immediate action recommended'
        };
      case 'high':
        return {
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          textColor: 'text-orange-700 dark:text-orange-400',
          badgeVariant: 'destructive' as const,
          icon: <TrendingDown className="h-5 w-5" />,
          title: 'High Risk Alert',
          description: 'Take preventive action soon'
        };
      case 'moderate':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-700 dark:text-yellow-400',
          badgeVariant: 'outline' as const,
          icon: <Activity className="h-5 w-5" />,
          title: 'Moderate Risk',
          description: 'Stay vigilant and proactive'
        };
      default:
        return {
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-700 dark:text-green-400',
          badgeVariant: 'outline' as const,
          icon: <Shield className="h-5 w-5" />,
          title: 'Low Risk',
          description: 'Keep up the good work!'
        };
    }
  }, [riskLevel]);

  // Get top priority interventions
  const topInterventions = interventions
    .filter(i => i.priority === 'immediate' || i.priority === 'high')
    .slice(0, 3);

  return (
    <Card className={`${riskConfig.bgColor} ${riskConfig.borderColor} border-2`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={riskConfig.textColor}>
                {riskConfig.icon}
              </div>
              <CardTitle className="text-lg">{riskConfig.title}</CardTitle>
              <Badge variant={riskConfig.badgeVariant} className="ml-auto">
                {riskLevel.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>{riskConfig.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Risk Score */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Risk Score</span>
            <span className={`font-bold ${riskConfig.textColor}`}>
              {riskScore}/100
            </span>
          </div>
          <Progress value={riskScore} className="h-2" />
        </div>

        {/* Confidence & Timeframe */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Confidence</div>
            <div className="font-semibold">{Math.round(confidence * 100)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Timeframe
            </div>
            <div className="font-semibold">{timeframe}</div>
          </div>
        </div>

        {/* Top Warnings */}
        {warnings.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Key Warnings
            </h4>
            <div className="space-y-2">
              {warnings.slice(0, 2).map((warning) => (
                <div
                  key={warning.id}
                  className="text-sm p-2 rounded-md bg-background/50 border"
                >
                  <div className="font-medium mb-1">{warning.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {warning.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Interventions */}
        {topInterventions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              Recommended Actions
            </h4>
            <div className="space-y-2">
              {topInterventions.map((intervention) => (
                <div
                  key={intervention.id}
                  className="text-sm p-2 rounded-md bg-background/50 border"
                >
                  <div className="font-medium mb-1 flex items-center justify-between">
                    {intervention.title}
                    <Badge variant="outline" className="text-xs">
                      {intervention.priority}
                    </Badge>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    {intervention.actions.slice(0, 2).map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Details Button */}
        {onViewDetails && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onViewDetails}
          >
            View Detailed Analysis
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for HomeScreen
export function RiskPredictionBanner({ prediction }: { prediction: RiskPrediction }) {
  const { riskLevel, riskScore } = prediction;

  const config = useMemo(() => {
    switch (riskLevel) {
      case 'critical':
        return {
          bgColor: 'bg-red-100 dark:bg-red-950/30',
          textColor: 'text-red-900 dark:text-red-100',
          icon: <AlertTriangle className="h-5 w-5" />,
          message: 'Critical risk detected - immediate action needed'
        };
      case 'high':
        return {
          bgColor: 'bg-orange-100 dark:bg-orange-950/30',
          textColor: 'text-orange-900 dark:text-orange-100',
          icon: <TrendingDown className="h-5 w-5" />,
          message: 'High risk alert - take preventive action'
        };
      case 'moderate':
        return {
          bgColor: 'bg-yellow-100 dark:bg-yellow-950/30',
          textColor: 'text-yellow-900 dark:text-yellow-100',
          icon: <Activity className="h-5 w-5" />,
          message: 'Moderate risk - stay vigilant'
        };
      default:
        return {
          bgColor: 'bg-green-100 dark:bg-green-950/30',
          textColor: 'text-green-900 dark:text-green-100',
          icon: <TrendingUp className="h-5 w-5" />,
          message: 'Low risk - you\'re doing great!'
        };
    }
  }, [riskLevel]);

  return (
    <div className={`${config.bgColor} ${config.textColor} p-4 rounded-lg border`}>
      <div className="flex items-center gap-3">
        {config.icon}
        <div className="flex-1">
          <div className="font-semibold text-sm">{config.message}</div>
          <div className="text-xs mt-1 opacity-80">
            Risk Score: {riskScore}/100
          </div>
        </div>
      </div>
    </div>
  );
}
