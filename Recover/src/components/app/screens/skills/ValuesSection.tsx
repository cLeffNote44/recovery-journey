import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, Heart } from 'lucide-react';
import { CORE_VALUES, getValuesByCategory } from '@/lib/values-and-compassion';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import type { ValueEntry } from '@/types/app';

export function ValuesSection() {
  const { skillBuilding, setSkillBuilding } = useAppData();
  const [showAdd, setShowAdd] = useState(false);
  const [customValue, setCustomValue] = useState({ value: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'relationships' | 'personal-growth' | 'contribution' | 'health' | 'integrity'>('all');

  const myValues = skillBuilding.values.sort((a, b) => b.rank - a.rank);

  const handleAddValue = (value: string, description: string) => {
    const newValue: ValueEntry = {
      id: Date.now(),
      value,
      description,
      rank: 5,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setSkillBuilding({
      ...skillBuilding,
      values: [...skillBuilding.values, newValue]
    });

    setCustomValue({ value: '', description: '' });
    setShowAdd(false);
    toast.success(`${value} added to your values!`);
  };

  const filteredValues = selectedCategory === 'all'
    ? CORE_VALUES
    : getValuesByCategory(selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1">Core Values</h3>
        <p className="text-sm text-muted-foreground">Identify what matters most to align your recovery</p>
      </div>

      {myValues.length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6" />
              <h4 className="font-semibold">Your Values</h4>
            </div>
            <div className="space-y-2">
              {myValues.slice(0, 5).map(value => (
                <div key={value.id} className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="font-medium">{value.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Explore Values</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'relationships', 'personal-growth', 'contribution', 'health', 'integrity'].map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat as any)}
                className="whitespace-nowrap"
              >
                {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredValues.map(value => {
              const hasValue = myValues.some(v => v.value === value.value);
              return (
                <Card key={value.value} className={hasValue ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{value.value}</h4>
                          <Badge variant="secondary" className="text-xs">{value.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{value.description}</p>
                        <p className="text-xs italic text-muted-foreground">"{value.recoveryConnection}"</p>
                      </div>
                      {!hasValue && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddValue(value.value, value.description)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
