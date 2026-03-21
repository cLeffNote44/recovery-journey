import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HALTCheck as HALTCheckType } from '@/types/app';
import {
  Apple, Flame, Users, Moon, AlertCircle, CheckCircle, Info
} from 'lucide-react';

/**
 * HALTCheck Component
 *
 * Interactive assessment tool for HALT (Hungry, Angry, Lonely, Tired) - four common
 * states that increase relapse risk in recovery. Users rate each factor on a scale
 * of 1-10, and receive personalized suggestions based on their responses.
 *
 * HALT is a widely-used recovery acronym that helps identify vulnerability states
 * before they become cravings or lead to relapse.
 *
 * @example
 * ```tsx
 * <HALTCheck
 *   onComplete={(haltData) => saveCheckIn({ halt: haltData })}
 *   showSuggestions={true}
 * />
 * ```
 */
interface HALTCheckProps {
  /** Callback fired when user completes the HALT check */
  onComplete?: (halt: HALTCheckType) => void;
  /** Pre-fill the form with existing HALT values (for editing) */
  initialValues?: HALTCheckType;
  /** Show personalized coping suggestions based on responses (default: true) */
  showSuggestions?: boolean;
}

const defaultHALT: HALTCheckType = {
  hungry: 5,
  angry: 5,
  lonely: 5,
  tired: 5,
};

export function HALTCheck({
  onComplete,
  initialValues,
  showSuggestions = true
}: HALTCheckProps) {
  const [halt, setHalt] = useState<HALTCheckType>(initialValues || defaultHALT);
  const [submitted, setSubmitted] = useState(false);

  const updateValue = (key: keyof HALTCheckType, value: number) => {
    setHalt({ ...halt, [key]: value });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (onComplete) {
      onComplete(halt);
    }
  };

  const getScore = () => {
    return halt.hungry + halt.angry + halt.lonely + halt.tired;
  };

  const getHighestFactors = (): Array<{ key: keyof HALTCheckType; value: number; label: string }> => {
    const factors = [
      { key: 'hungry' as const, value: halt.hungry, label: 'Hungry' },
      { key: 'angry' as const, value: halt.angry, label: 'Angry' },
      { key: 'lonely' as const, value: halt.lonely, label: 'Lonely' },
      { key: 'tired' as const, value: halt.tired, label: 'Tired' },
    ];
    return factors.filter(f => f.value >= 7).sort((a, b) => b.value - a.value);
  };

  const getSuggestions = () => {
    const high = getHighestFactors();
    const suggestions: Record<string, string[]> = {
      hungry: [
        'Eat a healthy meal or snack right now',
        'Stay hydrated - drink water',
        'Avoid sugary foods that cause energy crashes',
      ],
      angry: [
        'Take 10 deep breaths (4-4-6 pattern)',
        'Go for a walk to cool down',
        'Journal about what\'s making you angry',
        'Call your sponsor to talk it through',
      ],
      lonely: [
        'Call or text a friend from your support network',
        'Attend a meeting (online or in-person)',
        'Reach out to your sponsor',
        'Join an online recovery community chat',
      ],
      tired: [
        'Take a 20-minute nap if possible',
        'Go to bed early tonight',
        'Avoid caffeine and practice good sleep hygiene',
        'Gentle stretching or meditation',
      ],
    };

    return high.flatMap(f =>
      suggestions[f.key].map(s => ({ factor: f.label, suggestion: s }))
    );
  };

  const getTotalRiskLevel = () => {
    const score = getScore();
    if (score >= 28) return { level: 'High', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' };
    if (score >= 20) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500' };
    return { level: 'Low', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500' };
  };

  const factors = [
    { key: 'hungry' as const, label: 'Hungry', icon: Apple, desc: 'Are you physically hungry or not eating well?' },
    { key: 'angry' as const, label: 'Angry', icon: Flame, desc: 'Are you feeling angry, frustrated, or irritable?' },
    { key: 'lonely' as const, label: 'Lonely', icon: Users, desc: 'Are you feeling isolated or disconnected?' },
    { key: 'tired' as const, label: 'Tired', icon: Moon, desc: 'Are you physically exhausted or sleep-deprived?' },
  ];

  const risk = getTotalRiskLevel();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          HALT Check
        </CardTitle>
        <CardDescription>
          Rate each factor from 1 (not at all) to 10 (extremely). HALT helps identify common relapse triggers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Alert */}
        {!submitted && (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              <strong>HALT</strong> is an acronym for Hungry, Angry, Lonely, Tired - four states that increase relapse risk. Being honest about these helps prevent cravings.
            </AlertDescription>
          </Alert>
        )}

        {/* HALT Factors */}
        {factors.map((factor) => {
          const Icon = factor.icon;
          return (
            <div key={factor.key} className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <Label className="text-base font-semibold">{factor.label}</Label>
                <span className="ml-auto text-2xl font-bold text-primary">
                  {halt[factor.key]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{factor.desc}</p>
              <Slider
                value={[halt[factor.key]]}
                onValueChange={([value]) => updateValue(factor.key, value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
                disabled={submitted && !initialValues}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Not at all</span>
                <span>Extremely</span>
              </div>
            </div>
          );
        })}

        {/* Risk Level */}
        <div className={`p-4 rounded-lg border-2 ${risk.bg} ${risk.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Risk Level</p>
              <p className={`text-2xl font-bold ${risk.color}`}>{risk.level}</p>
              <p className="text-sm text-muted-foreground">Score: {getScore()}/40</p>
            </div>
            {risk.level === 'High' && (
              <AlertCircle className={`w-12 h-12 ${risk.color}`} />
            )}
            {risk.level === 'Low' && (
              <CheckCircle className={`w-12 h-12 ${risk.color}`} />
            )}
          </div>
        </div>

        {/* Suggestions */}
        {showSuggestions && submitted && getSuggestions().length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Recommended Actions
            </h4>
            {getSuggestions().map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <div className="text-xs font-semibold text-primary mt-0.5 min-w-[60px]">
                  {item.factor}:
                </div>
                <div className="text-sm">{item.suggestion}</div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        {!submitted && onComplete && (
          <Button
            onClick={handleSubmit}
            className="w-full"
            size="lg"
          >
            Complete HALT Check
          </Button>
        )}

        {submitted && (
          <Alert className="bg-green-500/10 border-green-500">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              HALT check completed! Use the suggestions above to address your needs before they become cravings.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
