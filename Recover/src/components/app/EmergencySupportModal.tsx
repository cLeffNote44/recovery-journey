import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, AlertCircle, Heart, Users, Globe, X, Check, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  EMERGENCY_RESOURCES,
  CRISIS_PROTOCOLS,
  GROUNDING_EXERCISES,
  getCrisisProtocol,
  getEmergencyContacts,
  getQuickDialNumbers,
  getImmediateActions,
  getTimeOfDay,
  initiateEmergencyCall,
  initiateEmergencyText,
  createEmergencyAlert,
  type EmergencyResource,
  type CrisisProtocol,
  type CrisisStep,
  type GroundingExercise,
  type EmergencyAlert
} from '@/lib/emergency-support';
import type { Contact } from '@/types/app';
import { toast } from 'sonner';

interface EmergencySupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  riskLevel?: 'critical' | 'high' | 'moderate';
  onAlertLogged?: (alert: EmergencyAlert) => void;
}

export function EmergencySupportModal({
  isOpen,
  onClose,
  contacts,
  riskLevel = 'high',
  onAlertLogged
}: EmergencySupportModalProps) {
  const [activeTab, setActiveTab] = useState<'immediate' | 'protocol' | 'resources' | 'grounding'>('immediate');
  const [selectedProtocol, setSelectedProtocol] = useState<CrisisProtocol | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [protocolStartTime, setProtocolStartTime] = useState<Date | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<GroundingExercise | null>(null);
  const [exerciseProgress, setExerciseProgress] = useState(0);
  const [notes, setNotes] = useState('');

  const emergencyContacts = getEmergencyContacts(contacts);
  const quickDialNumbers = getQuickDialNumbers();
  const timeOfDay = getTimeOfDay();
  const immediateActions = getImmediateActions(riskLevel, timeOfDay);

  useEffect(() => {
    if (isOpen) {
      // Log emergency alert when modal opens
      const alert = createEmergencyAlert(riskLevel, 'User activated emergency support');
      onAlertLogged?.(alert);
    }
  }, [isOpen, riskLevel, onAlertLogged]);

  const handleCall = (phoneNumber: string, label: string) => {
    try {
      initiateEmergencyCall(phoneNumber);
      toast.success(`Calling ${label}...`);
    } catch (error) {
      toast.error('Unable to initiate call');
    }
  };

  const handleText = (number: string) => {
    try {
      initiateEmergencyText(number, 'I need support. Can you talk?');
      toast.success('Opening messages...');
    } catch (error) {
      toast.error('Unable to send text');
    }
  };

  const startProtocol = (protocol: CrisisProtocol) => {
    setSelectedProtocol(protocol);
    setCompletedSteps(new Set());
    setProtocolStartTime(new Date());
    setActiveTab('protocol');
  };

  const toggleStepComplete = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const startGroundingExercise = (exercise: GroundingExercise) => {
    setSelectedExercise(exercise);
    setExerciseProgress(0);
    setActiveTab('grounding');

    // Simulate progress
    const interval = setInterval(() => {
      setExerciseProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast.success('Exercise complete! Well done.');
          return 100;
        }
        return prev + (100 / (exercise.duration / 1000));
      });
    }, 1000);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'hotline': return <Phone className="h-4 w-4" />;
      case 'text': return <MessageSquare className="h-4 w-4" />;
      case 'website': return <Globe className="h-4 w-4" />;
      case 'chat': return <Users className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-opacity-100 backdrop-blur-none">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className={`h-6 w-6 ${
                riskLevel === 'critical' ? 'text-red-500' :
                riskLevel === 'high' ? 'text-orange-500' :
                'text-yellow-500'
              }`} />
              <div>
                <CardTitle>Emergency Support</CardTitle>
                <CardDescription>You're not alone. Help is available right now.</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Tab Navigation */}
        <div className="border-b px-6 flex gap-2 overflow-x-auto">
          <Button
            variant={activeTab === 'immediate' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('immediate')}
            className="whitespace-nowrap"
          >
            <Phone className="h-4 w-4 mr-2" />
            Immediate Help
          </Button>
          <Button
            variant={activeTab === 'protocol' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('protocol')}
            className="whitespace-nowrap"
          >
            <Check className="h-4 w-4 mr-2" />
            Crisis Protocol
          </Button>
          <Button
            variant={activeTab === 'grounding' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('grounding')}
            className="whitespace-nowrap"
          >
            <Heart className="h-4 w-4 mr-2" />
            Grounding
          </Button>
          <Button
            variant={activeTab === 'resources' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('resources')}
            className="whitespace-nowrap"
          >
            <Globe className="h-4 w-4 mr-2" />
            Resources
          </Button>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Immediate Help Tab */}
          {activeTab === 'immediate' && (
            <div className="space-y-6">
              {/* Crisis Message */}
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  If you're in immediate danger, call 911 or go to the nearest emergency room.
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Your life matters. There are people who want to help you.
                </p>
              </div>

              {/* Quick Dial */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call for Help Now
                </h3>
                <div className="grid gap-2">
                  {quickDialNumbers.map((item) => (
                    <Button
                      key={item.number}
                      variant="outline"
                      className="w-full justify-between h-auto py-3"
                      onClick={() => handleCall(item.number, item.label)}
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">{item.label}</div>
                          <div className="text-sm text-muted-foreground">{item.number}</div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Emergency Contacts */}
              {emergencyContacts.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Your Support Network
                  </h3>
                  <div className="grid gap-2">
                    {emergencyContacts.map((contact) => (
                      <Card key={contact.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{contact.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {contact.role}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {contact.phone && (
                              <Button
                                size="sm"
                                onClick={() => handleCall(contact.phone!, contact.name)}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            {contact.phone && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleText(contact.phone!)}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Immediate Actions */}
              <div>
                <h3 className="font-semibold mb-3">Do This Right Now</h3>
                <div className="space-y-2">
                  {immediateActions.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Crisis Protocol Tab */}
          {activeTab === 'protocol' && (
            <div className="space-y-4">
              {!selectedProtocol ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Follow a structured protocol to work through this crisis safely.
                  </p>
                  <div className="space-y-3">
                    {CRISIS_PROTOCOLS.map((protocol) => (
                      <Card key={protocol.id} className="p-4 cursor-pointer hover:border-primary" onClick={() => startProtocol(protocol)}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{protocol.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {protocol.steps.length} steps • {protocol.estimatedTime}
                            </p>
                          </div>
                          <Badge variant={
                            protocol.urgency === 'immediate' ? 'destructive' :
                            protocol.urgency === 'high' ? 'default' : 'outline'
                          }>
                            {protocol.urgency}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {Math.round(protocol.effectiveness * 100)}% effective
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedProtocol.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {completedSteps.size} of {selectedProtocol.steps.length} completed
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedProtocol(null)}>
                      Change Protocol
                    </Button>
                  </div>

                  <Progress value={(completedSteps.size / selectedProtocol.steps.length) * 100} />

                  <div className="space-y-3">
                    {selectedProtocol.steps.map((step) => (
                      <Card
                        key={step.id}
                        className={`p-4 cursor-pointer transition-colors ${
                          completedSteps.has(step.id) ? 'bg-green-50 dark:bg-green-950/20 border-green-300' : ''
                        }`}
                        onClick={() => toggleStepComplete(step.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            completedSteps.has(step.id)
                              ? 'bg-green-500 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {completedSteps.has(step.id) ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <span className="text-sm font-semibold">{step.order}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${completedSteps.has(step.id) ? 'line-through text-muted-foreground' : ''}`}>
                              {step.instruction}
                            </p>
                            {step.guidance && !completedSteps.has(step.id) && (
                              <p className="text-sm text-muted-foreground mt-2">{step.guidance}</p>
                            )}
                            {step.duration && !completedSteps.has(step.id) && (
                              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {step.duration < 60 ? `${step.duration}s` : `${Math.round(step.duration / 60)}min`}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {completedSteps.size === selectedProtocol.steps.length && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-300 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Protocol Complete! 🎉
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        You did it. You worked through this crisis. That takes incredible strength.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Grounding Tab */}
          {activeTab === 'grounding' && (
            <div className="space-y-4">
              {!selectedExercise ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Grounding techniques help bring you back to the present moment.
                  </p>
                  <div className="space-y-3">
                    {GROUNDING_EXERCISES.map((exercise) => (
                      <Card key={exercise.id} className="p-4 cursor-pointer hover:border-primary" onClick={() => startGroundingExercise(exercise)}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{exercise.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {Math.round(exercise.duration / 60)} minutes
                            </p>
                          </div>
                          <Badge variant="outline">{exercise.difficulty}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{selectedExercise.name}</h3>
                    <Button variant="outline" size="sm" onClick={() => setSelectedExercise(null)}>
                      Back
                    </Button>
                  </div>

                  <Progress value={exerciseProgress} />

                  <div className="space-y-2">
                    {selectedExercise.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm">{instruction}</p>
                      </div>
                    ))}
                  </div>

                  {exerciseProgress >= 100 && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-300 rounded-lg p-4">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Great work! How do you feel now?
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                24/7 helplines and support resources
              </p>
              <div className="space-y-3">
                {EMERGENCY_RESOURCES.map((resource) => (
                  <Card key={resource.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getIconForType(resource.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{resource.name}</h4>
                          <Badge variant="outline" className="mt-1">{resource.available}</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                    <div className="flex gap-2">
                      {resource.phone && (
                        <Button size="sm" onClick={() => handleCall(resource.phone!, resource.name)}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      )}
                      {resource.text && (
                        <Button size="sm" variant="outline" onClick={() => handleText(resource.text!)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Text
                        </Button>
                      )}
                      {resource.url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-2" />
                            Visit
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Notes (optional)</h4>
            <Textarea
              placeholder="What helped? What didn't? How are you feeling now?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>

        <div className="border-t p-4 bg-muted/50">
          <p className="text-sm text-center text-muted-foreground">
            Remember: This crisis will pass. You are stronger than you know.
          </p>
        </div>
      </Card>
    </div>
  );
}
