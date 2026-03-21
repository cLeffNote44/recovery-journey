import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wind, Play } from 'lucide-react';
import { BREATHING_EXERCISES } from '@/lib/breathing-exercises';
import { EmptyState } from '@/components/EmptyState';

export function BreathingExercisesSection() {
  const { skillBuilding } = useAppData();
  const [selectedExercise, setSelectedExercise] = useState<typeof BREATHING_EXERCISES[0] | null>(null);

  const sessions = skillBuilding.breathingExercises;

  if (selectedExercise) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setSelectedExercise(null)}>
          ← Back
        </Button>

        <Card className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white border-0">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold mb-2">{selectedExercise.name}</h3>
            <p className="text-sm opacity-90">{selectedExercise.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Practice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Pattern</h4>
              <div className="flex gap-2 text-sm">
                <Badge>Inhale: {selectedExercise.pattern.inhale}s</Badge>
                {selectedExercise.pattern.hold && <Badge>Hold: {selectedExercise.pattern.hold}s</Badge>}
                <Badge>Exhale: {selectedExercise.pattern.exhale}s</Badge>
                {selectedExercise.pattern.holdAfterExhale && <Badge>Hold: {selectedExercise.pattern.holdAfterExhale}s</Badge>}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Instructions</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {selectedExercise.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {selectedExercise.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Best For</h4>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.bestFor.map((use, idx) => (
                  <Badge key={idx} variant="outline">{use}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1">Breathing Exercises</h3>
        <p className="text-sm text-muted-foreground">Evidence-based techniques for stress and craving management</p>
      </div>

      {sessions.length > 0 && (
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{sessions.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Sessions Completed</div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {BREATHING_EXERCISES.map(exercise => (
          <Card
            key={exercise.type}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelectedExercise(exercise)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  exercise.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-900/30' :
                  exercise.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <Wind className={`w-6 h-6 ${
                    exercise.difficulty === 'beginner' ? 'text-green-600 dark:text-green-400' :
                    exercise.difficulty === 'intermediate' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{exercise.name}</h4>
                    <Badge variant="secondary" className="text-xs">{exercise.difficulty}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Recommended: {Math.floor(exercise.duration / 60)} minutes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
