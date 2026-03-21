import { useState, lazy, Suspense } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Target, Brain, ChevronRight, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { StepWorkTracker } from '@/components/app/StepWorkTracker';

// Lazy load the detailed screens
const TrafficLightScreen = lazy(() => import('./prevention/TrafficLightScreen').then(m => ({ default: m.TrafficLightScreen })));
const SkillsScreen = lazy(() => import('./SkillsScreen').then(m => ({ default: m.SkillsScreen })));
const GoalsScreen = lazy(() => import('./GoalsScreen').then(m => ({ default: m.GoalsScreen })));

type PreventionSection = 'overview' | 'step-work' | 'traffic-light' | 'skills' | 'goals';

export function PreventionScreen() {
  const { relapsePlan, goals = [], stepWork } = useAppData();
  const [activeSection, setActiveSection] = useState<PreventionSection>('overview');

  // Calculate stats for preview cards
  const trafficLightProgress = () => {
    const sections = [
      relapsePlan.warningSigns.length > 0,
      relapsePlan.highRiskSituations.length > 0,
      relapsePlan.greenActions.length > 0,
      relapsePlan.yellowActions.length > 0,
      relapsePlan.redActions.length > 0
    ];
    const completed = sections.filter(Boolean).length;
    return Math.round((completed / sections.length) * 100);
  };

  const activeGoalsCount = goals.filter(g => g.isActive && !g.isCompleted).length;
  const completedGoalsCount = goals.filter(g => g.isCompleted).length;

  const completedSteps = stepWork?.steps?.filter(s => s.status === 'completed').length ?? 0;
  const inProgressSteps = stepWork?.steps?.filter(s => s.status === 'in-progress').length ?? 0;

  // Show detailed screen if not overview
  if (activeSection === 'step-work') {
    return (
      <div className="space-y-4 pb-20">
        <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
          ← Back to Prevention
        </Button>
        <StepWorkTracker />
      </div>
    );
  }

  if (activeSection === 'traffic-light') {
    return (
      <div className="space-y-4 pb-20">
        <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
          ← Back to Prevention
        </Button>
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
          <TrafficLightScreen />
        </Suspense>
      </div>
    );
  }

  if (activeSection === 'skills') {
    return (
      <div className="space-y-4 pb-20">
        <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
          ← Back to Prevention
        </Button>
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
          <SkillsScreen />
        </Suspense>
      </div>
    );
  }

  if (activeSection === 'goals') {
    return (
      <div className="space-y-4 pb-20">
        <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
          ← Back to Prevention
        </Button>
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
          <GoalsScreen />
        </Suspense>
      </div>
    );
  }

  // Overview with three preview cards
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Prevention
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tools and strategies to support your recovery
        </p>
      </div>

      {/* Step Work Preview */}
      <Card
        className="border-2 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        onClick={() => setActiveSection('step-work')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-blue-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">12-Step Work</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track your recovery program
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Steps Completed</span>
              <span className="font-semibold">{completedSteps}/12</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-gradient-to-r from-slate-600 to-gray-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps / 12) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {completedSteps}
              </div>
              <div className="text-xs font-semibold">Completed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {inProgressSteps}
              </div>
              <div className="text-xs font-semibold">In Progress</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {stepWork?.currentStep ?? 1}
              </div>
              <div className="text-xs font-semibold">Current Step</div>
            </div>
          </div>

          {/* Current Step Info */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-center">
              <span className="font-semibold">Working on:</span>{' '}
              Step {stepWork?.currentStep ?? 1} - {stepWork?.steps?.[(stepWork?.currentStep ?? 1) - 1]?.notes || 'Click to add notes'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Light System Preview */}
      <Card
        className="border-2 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        onClick={() => setActiveSection('traffic-light')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-red-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Traffic Light System</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Relapse prevention plan
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Plan Completeness</span>
              <span className="font-semibold">{trafficLightProgress()}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-gradient-to-r from-slate-600 to-gray-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${trafficLightProgress()}%` }}
              />
            </div>
          </div>

          {/* Traffic Light Zones Preview */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-2xl mb-1">🟢</div>
              <div className="text-xs font-semibold mb-1">Green Zone</div>
              <div className="text-lg font-bold text-green-600">
                {relapsePlan.greenActions.length}
              </div>
              <div className="text-xs text-muted-foreground">actions</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="text-2xl mb-1">🟡</div>
              <div className="text-xs font-semibold mb-1">Yellow Zone</div>
              <div className="text-lg font-bold text-yellow-600">
                {relapsePlan.yellowActions.length}
              </div>
              <div className="text-xs text-muted-foreground">actions</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="text-2xl mb-1">🔴</div>
              <div className="text-xs font-semibold mb-1">Red Zone</div>
              <div className="text-lg font-bold text-red-600">
                {relapsePlan.redActions.length}
              </div>
              <div className="text-xs text-muted-foreground">actions</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <div>
                <div className="font-semibold">{relapsePlan.warningSigns.length}</div>
                <div className="text-xs text-muted-foreground">Warning Signs</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <div>
                <div className="font-semibold">{relapsePlan.highRiskSituations.length}</div>
                <div className="text-xs text-muted-foreground">High-Risk Situations</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Preview */}
      <Card
        className="border-2 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        onClick={() => setActiveSection('goals')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/20">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Goals</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track progress and milestones
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {activeGoalsCount}
              </div>
              <div className="text-sm font-semibold mb-1">Active Goals</div>
              <div className="text-xs text-muted-foreground">In progress</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {completedGoalsCount}
              </div>
              <div className="text-sm font-semibold mb-1">Completed</div>
              <div className="text-xs text-muted-foreground">Achieved</div>
            </div>
          </div>

          {goals.length === 0 ? (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">
                No goals yet. Tap to create your first goal!
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {goals.filter(g => g.isActive && !g.isCompleted).slice(0, 2).map(goal => (
                <div key={goal.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{goal.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {goal.currentValue}/{goal.targetValue || '?'} {goal.targetType === 'numerical' ? '' : ''}
                    </div>
                  </div>
                </div>
              ))}
              {activeGoalsCount > 2 && (
                <div className="text-xs text-center text-muted-foreground">
                  +{activeGoalsCount - 2} more active goals
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Preview */}
      <Card
        className="border-2 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        onClick={() => setActiveSection('skills')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/20">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Skill Building</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Practice recovery skills
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-300">
              <div className="text-2xl mb-2">🧘</div>
              <div className="text-sm font-semibold">Mindfulness</div>
              <div className="text-xs text-muted-foreground">Daily practice</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-300">
              <div className="text-2xl mb-2">🤝</div>
              <div className="text-sm font-semibold">Connection</div>
              <div className="text-xs text-muted-foreground">Build relationships</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/10 border border-gray-300">
              <div className="text-2xl mb-2">💪</div>
              <div className="text-sm font-semibold">Coping Skills</div>
              <div className="text-xs text-muted-foreground">Healthy strategies</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-300">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-semibold">Trigger Mastery</div>
              <div className="text-xs text-muted-foreground">Identify & manage</div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-center text-muted-foreground">
              7 skill-building sections to strengthen your recovery
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Note */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-4">
          <p className="text-sm text-center text-muted-foreground">
            💡 Tap any card above to access the full section (4 sections available)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
