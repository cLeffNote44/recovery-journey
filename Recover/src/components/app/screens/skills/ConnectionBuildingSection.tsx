import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { Users, Plus, RefreshCw, Check } from 'lucide-react';
import { CONNECTION_PROMPTS, getRandomPrompt, getDailyConnectionPrompt } from '@/lib/connection-prompts';
import type { ConnectionPromptEntry } from '@/types/app';
import { toast } from 'sonner';
import { connectionBuildingSchema, validateFormWithToast } from '@/lib/validation-schemas';

export function ConnectionBuildingSection() {
  const { skillBuilding, setSkillBuilding } = useAppData();
  const [selectedType, setSelectedType] = useState<ConnectionPromptEntry['promptType']>('reach-out');
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    promptText: '',
    response: '',
    personInvolved: '',
    reflections: ''
  });

  const prompts = skillBuilding.connectionPrompts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const completedCount = prompts.filter(p => p.completed).length;

  const handleGeneratePrompt = () => {
    const prompt = getRandomPrompt(selectedType);
    setFormData({ ...formData, promptText: prompt });
    setShowAdd(true);
  };

  const handleSubmit = (completed: boolean) => {
    // Validate form data with Zod
    const validatedData = validateFormWithToast(connectionBuildingSchema, formData, toast);
    if (!validatedData) {
      return;
    }

    const newPrompt: ConnectionPromptEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]!,
      promptType: selectedType,
      ...validatedData,
      completed
    };

    setSkillBuilding({
      ...skillBuilding,
      connectionPrompts: [newPrompt, ...skillBuilding.connectionPrompts]
    });

    setFormData({ promptText: '', response: '', personInvolved: '', reflections: '' });
    setShowAdd(false);
    toast.success(completed ? 'Connection prompt completed! 🌟' : 'Prompt saved for later');
  };

  if (showAdd) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>
          ← Cancel
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Connection Building</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Prompt</label>
              <div className="p-3 bg-secondary rounded-lg text-sm">{formData.promptText}</div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Person involved (optional)</label>
              <Input
                placeholder="Who are you connecting with?"
                value={formData.personInvolved}
                onChange={(e) => setFormData({ ...formData, personInvolved: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Your response/plan</label>
              <Textarea
                placeholder="What did you do or what will you do?"
                value={formData.response}
                onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Reflections (optional)</label>
              <Textarea
                placeholder="How did it feel? What did you learn?"
                value={formData.reflections}
                onChange={(e) => setFormData({ ...formData, reflections: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSubmit(false)}
                variant="outline"
                className="flex-1"
              >
                Save for Later
              </Button>
              <Button
                onClick={() => handleSubmit(true)}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1">Connection Building</h3>
        <p className="text-sm text-muted-foreground">Strengthen relationships through intentional practice</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{prompts.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Prompts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{completedCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Completed</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose a Connection Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {CONNECTION_PROMPTS.map(template => (
            <Card
              key={template.type}
              className={`cursor-pointer transition-colors ${
                selectedType === template.type ? 'border-primary' : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedType(template.type)}
            >
              <CardContent className="p-4">
                <h4 className="font-semibold mb-1">{template.title}</h4>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </CardContent>
            </Card>
          ))}

          <Button onClick={handleGeneratePrompt} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Prompt
          </Button>
        </CardContent>
      </Card>

      {prompts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold">Recent Prompts</h4>
          {prompts.slice(0, 5).map(prompt => (
            <Card key={prompt.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {CONNECTION_PROMPTS.find(p => p.type === prompt.promptType)?.title}
                      </Badge>
                      {prompt.completed && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm mb-2">{prompt.promptText}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(prompt.date).toLocaleDateString()}
                      {prompt.personInvolved && ` • ${prompt.personInvolved}`}
                    </p>
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
