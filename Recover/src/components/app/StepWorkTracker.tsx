import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { TWELVE_STEPS, StepWorkEntry, StepReflection, StepExercise } from '@/types/app';
import { CheckCircle2, Circle, Clock, BookOpen, ListChecks, Plus, X, Calendar, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

export function StepWorkTracker() {
  const { stepWork, setStepWork } = useAppData();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showAddReflection, setShowAddReflection] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [exerciseDesc, setExerciseDesc] = useState('');
  const [exerciseType, setExerciseType] = useState('');

  const completedSteps = stepWork.steps.filter(s => s.status === 'completed').length;
  const progressPercent = (completedSteps / 12) * 100;

  const updateStepStatus = (stepNumber: number, status: StepWorkEntry['status']) => {
    const updatedSteps = stepWork.steps.map(step => {
      if (step.stepNumber === stepNumber) {
        const updates: Partial<StepWorkEntry> = { status };

        if (status === 'in-progress' && !step.startDate) {
          updates.startDate = new Date().toISOString().split('T')[0];
        }

        if (status === 'completed') {
          updates.completedDate = new Date().toISOString().split('T')[0];
          // Auto-advance to next step
          if (stepNumber < 12) {
            setStepWork({
              ...stepWork,
              currentStep: stepNumber + 1
            });
          }
        }

        return { ...step, ...updates };
      }
      return step;
    });

    setStepWork({
      ...stepWork,
      steps: updatedSteps
    });

    if (status === 'completed') {
      toast.success(`Step ${stepNumber} completed! Great progress! 🎉`);
    }
  };

  const addReflection = (stepNumber: number) => {
    if (!reflectionText.trim()) {
      toast.error('Please enter a reflection');
      return;
    }

    const newReflection: StepReflection = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]!,
      content: reflectionText.trim()
    };

    const updatedSteps = stepWork.steps.map(step => {
      if (step.stepNumber === stepNumber) {
        return {
          ...step,
          reflections: [...step.reflections, newReflection]
        };
      }
      return step;
    });

    setStepWork({
      ...stepWork,
      steps: updatedSteps
    });

    setReflectionText('');
    setShowAddReflection(false);
    toast.success('Reflection added');
  };

  const addExercise = (stepNumber: number) => {
    if (!exerciseDesc.trim() || !exerciseType.trim()) {
      toast.error('Please enter exercise type and description');
      return;
    }

    const newExercise: StepExercise = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]!,
      exerciseType: exerciseType.trim(),
      description: exerciseDesc.trim(),
      completed: false
    };

    const updatedSteps = stepWork.steps.map(step => {
      if (step.stepNumber === stepNumber) {
        return {
          ...step,
          exercises: [...step.exercises, newExercise]
        };
      }
      return step;
    });

    setStepWork({
      ...stepWork,
      steps: updatedSteps
    });

    setExerciseDesc('');
    setExerciseType('');
    setShowAddExercise(false);
    toast.success('Exercise added');
  };

  const toggleExerciseComplete = (stepNumber: number, exerciseId: number) => {
    const updatedSteps = stepWork.steps.map(step => {
      if (step.stepNumber === stepNumber) {
        return {
          ...step,
          exercises: step.exercises.map(ex =>
            ex.id === exerciseId
              ? {
                  ...ex,
                  completed: !ex.completed,
                  completedDate: !ex.completed ? new Date().toISOString().split('T')[0] : undefined
                }
              : ex
          )
        };
      }
      return step;
    });

    setStepWork({
      ...stepWork,
      steps: updatedSteps
    });
  };

  const updateStepNotes = (stepNumber: number, notes: string) => {
    const updatedSteps = stepWork.steps.map(step => {
      if (step.stepNumber === stepNumber) {
        return { ...step, notes };
      }
      return step;
    });

    setStepWork({
      ...stepWork,
      steps: updatedSteps
    });
  };

  const deleteReflection = (stepNumber: number, reflectionId: number) => {
    if (!confirm('Delete this reflection?')) return;

    const updatedSteps = stepWork.steps.map(step => {
      if (step.stepNumber === stepNumber) {
        return {
          ...step,
          reflections: step.reflections.filter(r => r.id !== reflectionId)
        };
      }
      return step;
    });

    setStepWork({
      ...stepWork,
      steps: updatedSteps
    });

    toast.success('Reflection deleted');
  };

  const deleteExercise = (stepNumber: number, exerciseId: number) => {
    if (!confirm('Delete this exercise?')) return;

    const updatedSteps = stepWork.steps.map(step => {
      if (step.stepNumber === stepNumber) {
        return {
          ...step,
          exercises: step.exercises.filter(e => e.id !== exerciseId)
        };
      }
      return step;
    });

    setStepWork({
      ...stepWork,
      steps: updatedSteps
    });

    toast.success('Exercise deleted');
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            12-Step Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Steps Completed</span>
            <span className="text-2xl font-bold">{completedSteps} / 12</span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-white/20" />
          <div className="text-sm opacity-90">
            Current step: Step {stepWork.currentStep}
          </div>
        </CardContent>
      </Card>

      {/* Steps List */}
      <div className="space-y-3">
        {TWELVE_STEPS.map((stepInfo) => {
          const step = stepWork.steps.find(s => s.stepNumber === stepInfo.number)!;
          const isExpanded = expandedStep === stepInfo.number;
          const isCurrent = stepWork.currentStep === stepInfo.number;

          return (
            <Card
              key={stepInfo.number}
              className={`${
                isCurrent ? 'ring-2 ring-primary' : ''
              } ${
                step.status === 'completed' ? 'bg-green-500/5 border-green-500/30' : ''
              }`}
            >
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedStep(isExpanded ? null : stepInfo.number)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : step.status === 'in-progress' ? (
                      <Clock className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        Step {stepInfo.number}: {stepInfo.title}
                      </h3>
                      {isCurrent && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      "{stepInfo.text}"
                    </p>
                    {step.startDate && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Started: {new Date(step.startDate).toLocaleDateString()}</span>
                        {step.completedDate && (
                          <span>Completed: {new Date(step.completedDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4 border-t">
                  {/* Status Controls */}
                  <div className="flex gap-2">
                    <Button
                      variant={step.status === 'not-started' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStepStatus(stepInfo.number, 'not-started')}
                    >
                      Not Started
                    </Button>
                    <Button
                      variant={step.status === 'in-progress' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStepStatus(stepInfo.number, 'in-progress')}
                    >
                      In Progress
                    </Button>
                    <Button
                      variant={step.status === 'completed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStepStatus(stepInfo.number, 'completed')}
                    >
                      Completed
                    </Button>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      Notes
                    </label>
                    <Textarea
                      value={step.notes}
                      onChange={(e) => updateStepNotes(stepInfo.number, e.target.value)}
                      placeholder="Add your notes about this step..."
                      rows={3}
                    />
                  </div>

                  {/* Reflections */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Reflections ({step.reflections.length})
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddReflection(!showAddReflection)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    {showAddReflection && expandedStep === stepInfo.number && (
                      <div className="space-y-2 p-3 bg-muted rounded-lg">
                        <Textarea
                          value={reflectionText}
                          onChange={(e) => setReflectionText(e.target.value)}
                          placeholder="Write your reflection..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => addReflection(stepInfo.number)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddReflection(false);
                              setReflectionText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {step.reflections.map((reflection) => (
                        <div
                          key={reflection.id}
                          className="p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm">{reflection.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(reflection.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => deleteReflection(stepInfo.number, reflection.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exercises */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <ListChecks className="w-4 h-4" />
                        Exercises ({step.exercises.length})
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddExercise(!showAddExercise)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    {showAddExercise && expandedStep === stepInfo.number && (
                      <div className="space-y-2 p-3 bg-muted rounded-lg">
                        <Input
                          value={exerciseType}
                          onChange={(e) => setExerciseType(e.target.value)}
                          placeholder="Exercise type (e.g., Inventory, Amends List)"
                        />
                        <Textarea
                          value={exerciseDesc}
                          onChange={(e) => setExerciseDesc(e.target.value)}
                          placeholder="Description..."
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => addExercise(stepInfo.number)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddExercise(false);
                              setExerciseType('');
                              setExerciseDesc('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {step.exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={exercise.completed}
                              onChange={() => toggleExerciseComplete(stepInfo.number, exercise.id)}
                              className="mt-1 h-4 w-4 rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className={`text-sm font-medium ${
                                    exercise.completed ? 'line-through text-muted-foreground' : ''
                                  }`}>
                                    {exercise.exerciseType}
                                  </p>
                                  <p className={`text-sm mt-1 ${
                                    exercise.completed ? 'line-through text-muted-foreground' : ''
                                  }`}>
                                    {exercise.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(exercise.date).toLocaleDateString()}
                                    {exercise.completedDate && ` • Completed ${new Date(exercise.completedDate).toLocaleDateString()}`}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600"
                                  onClick={() => deleteExercise(stepInfo.number, exercise.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Sponsor Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Sponsor/Guide Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={stepWork.sponsorNotes || ''}
            onChange={(e) => setStepWork({ ...stepWork, sponsorNotes: e.target.value })}
            placeholder="Notes from your sponsor or recovery guide..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
