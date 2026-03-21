import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { EmptyState } from '@/components/EmptyState';
import { Target, Plus, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import type { TriggerExerciseEntry } from '@/types/app';
import { triggerExerciseSchema, validateFormWithToast } from '@/lib/validation-schemas';

export function TriggerMasterySection() {
  const { skillBuilding, setSkillBuilding } = useAppData();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<TriggerExerciseEntry | null>(null);
  const [formData, setFormData] = useState({
    trigger: '',
    triggerIntensity: 5,
    thoughts: '',
    feelings: '',
    physicalSensations: '',
    urgeLevel: 5,
    copingStrategy: '',
    outcome: '',
    lessonsLearned: ''
  });

  const handleSubmit = () => {
    // Validate form data with Zod
    const validatedData = validateFormWithToast(triggerExerciseSchema, formData, toast);
    if (!validatedData) {
      return;
    }

    const newExercise: TriggerExerciseEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]!,
      ...validatedData
    };

    setSkillBuilding({
      ...skillBuilding,
      triggerExercises: [newExercise, ...skillBuilding.triggerExercises]
    });

    setFormData({
      trigger: '',
      triggerIntensity: 5,
      thoughts: '',
      feelings: '',
      physicalSensations: '',
      urgeLevel: 5,
      copingStrategy: '',
      outcome: '',
      lessonsLearned: ''
    });

    setShowAdd(false);
    toast.success('Trigger exercise saved! 🎯');
  };

  const exercises = skillBuilding.triggerExercises.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const avgTriggerIntensity = exercises.length > 0
    ? Math.round((exercises.reduce((sum, e) => sum + e.triggerIntensity, 0) / exercises.length) * 10) / 10
    : 0;

  const avgUrgeLevel = exercises.length > 0
    ? Math.round((exercises.reduce((sum, e) => sum + e.urgeLevel, 0) / exercises.length) * 10) / 10
    : 0;

  if (selectedExercise) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setSelectedExercise(null)}>
          ← Back to List
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Trigger Analysis • {new Date(selectedExercise.date).toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Trigger</h4>
              <p className="text-sm">{selectedExercise.trigger}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Intensity:</span>
                <div className="flex-1 max-w-32 bg-secondary rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${selectedExercise.triggerIntensity * 10}%` }}
                  />
                </div>
                <span>{selectedExercise.triggerIntensity}/10</span>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <h4 className="font-semibold mb-2">Thoughts</h4>
                <p className="text-sm text-muted-foreground">{selectedExercise.thoughts}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Feelings</h4>
                <p className="text-sm text-muted-foreground">{selectedExercise.feelings}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Physical Sensations</h4>
                <p className="text-sm text-muted-foreground">{selectedExercise.physicalSensations}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Urge Level</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${selectedExercise.urgeLevel * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{selectedExercise.urgeLevel}/10</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Coping Strategy Used</h4>
                <p className="text-sm text-muted-foreground">{selectedExercise.copingStrategy}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Outcome</h4>
                <p className="text-sm text-muted-foreground">{selectedExercise.outcome}</p>
              </div>

              {selectedExercise.lessonsLearned && (
                <div>
                  <h4 className="font-semibold mb-2">Lessons Learned</h4>
                  <p className="text-sm text-muted-foreground">{selectedExercise.lessonsLearned}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showAdd) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>
          ← Cancel
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>New Trigger Exercise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">What triggered you?</label>
              <Input
                placeholder="Describe the trigger..."
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">
                Trigger Intensity ({formData.triggerIntensity}/10)
              </label>
              <Slider
                value={[formData.triggerIntensity]}
                onValueChange={(value) => setFormData({ ...formData, triggerIntensity: value[0] })}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">What thoughts came up?</label>
              <Textarea
                placeholder="e.g., 'I can't handle this', 'One time won't hurt'..."
                value={formData.thoughts}
                onChange={(e) => setFormData({ ...formData, thoughts: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">What feelings did you notice?</label>
              <Textarea
                placeholder="e.g., Anxious, angry, lonely, overwhelmed..."
                value={formData.feelings}
                onChange={(e) => setFormData({ ...formData, feelings: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Physical sensations?</label>
              <Textarea
                placeholder="e.g., Racing heart, tightness in chest, sweating..."
                value={formData.physicalSensations}
                onChange={(e) => setFormData({ ...formData, physicalSensations: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">
                Urge Level ({formData.urgeLevel}/10)
              </label>
              <Slider
                value={[formData.urgeLevel]}
                onValueChange={(value) => setFormData({ ...formData, urgeLevel: value[0] })}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">What coping strategy did you use?</label>
              <Textarea
                placeholder="Describe what you did to manage..."
                value={formData.copingStrategy}
                onChange={(e) => setFormData({ ...formData, copingStrategy: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">What was the outcome?</label>
              <Textarea
                placeholder="What happened? Did the urge pass?"
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Lessons learned (optional)</label>
              <Textarea
                placeholder="What did you learn from this experience?"
                value={formData.lessonsLearned}
                onChange={(e) => setFormData({ ...formData, lessonsLearned: e.target.value })}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
            >
              Save Exercise
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Trigger Mastery</h3>
          <p className="text-sm text-muted-foreground">Understand your triggers and build resilience</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Exercise
        </Button>
      </div>

      {exercises.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{exercises.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Exercises</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{avgUrgeLevel}</div>
              <div className="text-xs text-muted-foreground mt-1">Avg Urge Level</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-2">💡 Why Track Triggers?</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Understanding your triggers helps you recognize patterns and develop effective coping strategies.
            This exercise helps you respond mindfully instead of reacting automatically.
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• Identify warning signs before cravings become intense</p>
            <p>• Notice the connection between thoughts, feelings, and urges</p>
            <p>• Build confidence in your ability to manage triggers</p>
          </div>
        </CardContent>
      </Card>

      {exercises.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No trigger exercises yet"
          description="Start documenting your triggers to build awareness and resilience"
          actionLabel="Start First Exercise"
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <div className="space-y-3">
          {exercises.map(exercise => (
            <Card
              key={exercise.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedExercise(exercise)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{exercise.trigger}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(exercise.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-orange-600">{exercise.triggerIntensity}</div>
                      <div className="text-muted-foreground">Trigger</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-600">{exercise.urgeLevel}</div>
                      <div className="text-muted-foreground">Urge</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
