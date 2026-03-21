import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Heart, Wind, Users, Target, Sparkles, BookOpen } from 'lucide-react';
import { MindfulnessChallengeSection } from './skills/MindfulnessChallengeSection';
import { CopingSkillsSection } from './skills/CopingSkillsSection';
import { TriggerMasterySection } from './skills/TriggerMasterySection';
import { ConnectionBuildingSection } from './skills/ConnectionBuildingSection';
import { BreathingExercisesSection } from './skills/BreathingExercisesSection';
import { ValuesSection } from './skills/ValuesSection';
import { SelfCompassionSection } from './skills/SelfCompassionSection';

export function SkillsScreen() {
  const [activeSection, setActiveSection] = useState('overview');
  const { meditations, cravings, gratitude } = useAppData();

  // Overview stats - using existing data from context
  const mindfulnessDaysCompleted = meditations.length;
  const triggerExercisesCount = cravings.length;
  const connectionPromptsCompleted = 0; // To be implemented
  const breathingSessionsCount = meditations.filter(m => m.type === 'Breathing Exercise').length;
  const valuesIdentified = 0; // To be implemented
  const compassionPractices = gratitude.length;

  if (activeSection !== 'overview') {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setActiveSection('overview')}>
            ← Back
          </Button>
          <h2 className="text-2xl font-bold">Skill Building</h2>
        </div>

        {activeSection === 'mindfulness' && <MindfulnessChallengeSection />}
        {activeSection === 'coping' && <CopingSkillsSection />}
        {activeSection === 'triggers' && <TriggerMasterySection />}
        {activeSection === 'connection' && <ConnectionBuildingSection />}
        {activeSection === 'breathing' && <BreathingExercisesSection />}
        {activeSection === 'values' && <ValuesSection />}
        {activeSection === 'compassion' && <SelfCompassionSection />}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Skill Building</h2>
      </div>

      <Card className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white border-0">
        <CardContent className="p-6">
          <div className="text-4xl mb-3">🧠</div>
          <h3 className="text-xl font-bold mb-2">Build Recovery Skills</h3>
          <p className="text-sm opacity-90">
            Evidence-based practices to strengthen your recovery, manage cravings, and build lasting change.
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{mindfulnessDaysCompleted}</div>
            <div className="text-xs text-muted-foreground mt-1">Mindful Days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{triggerExercisesCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Trigger Work</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{valuesIdentified}</div>
            <div className="text-xs text-muted-foreground mt-1">Core Values</div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Modules */}
      <div className="space-y-3">
        {/* 30-Day Mindfulness Challenge */}
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSection('mindfulness')}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">30-Day Mindfulness Challenge</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Progressive mindfulness practices to build awareness and reduce reactivity
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(mindfulnessDaysCompleted / 30) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{mindfulnessDaysCompleted}/30</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coping Skills Library */}
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSection('coping')}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">Coping Skills Library</h3>
                <p className="text-sm text-muted-foreground">
                  20+ evidence-based techniques for managing cravings, stress, and difficult emotions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trigger Mastery */}
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSection('triggers')}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">Trigger Mastery</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Identify and understand your triggers to build resilience
                </p>
                <div className="text-sm text-muted-foreground">
                  {triggerExercisesCount} exercises completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Building */}
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSection('connection')}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">Connection Building</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Strengthen relationships and build healthy social connections
                </p>
                <div className="text-sm text-muted-foreground">
                  {connectionPromptsCompleted} prompts completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breathing Exercises */}
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSection('breathing')}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Wind className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">Breathing Exercises</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Evidence-based breathing techniques for stress and craving management
                </p>
                <div className="text-sm text-muted-foreground">
                  {breathingSessionsCount} sessions completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values Clarification */}
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSection('values')}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">Values Clarification</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Identify your core values and align your recovery with what matters most
                </p>
                <div className="text-sm text-muted-foreground">
                  {valuesIdentified} values identified
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Self-Compassion */}
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSection('compassion')}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-pink-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">Self-Compassion</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Practice self-kindness and overcome shame with proven compassion exercises
                </p>
                <div className="text-sm text-muted-foreground">
                  {compassionPractices} practices completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="p-5">
          <h4 className="font-semibold mb-2">💡 Why Skill Building?</h4>
          <p className="text-sm text-muted-foreground">
            Recovery is more than abstinence—it's about building a life you don't need to escape from.
            These evidence-based practices help you manage cravings, process emotions, strengthen relationships,
            and create lasting change.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
