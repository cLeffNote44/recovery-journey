import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertTriangle, Plus, X, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';

const TRAFFIC_LIGHT_INFO = {
  green: {
    title: 'Green Zone - Stable',
    description: 'Daily maintenance actions to stay healthy',
    color: 'from-slate-500/20 to-gray-500/20 border-green-500/30',
    icon: '🟢',
    examples: [
      'Attend regular meetings',
      'Daily meditation',
      'Call sponsor weekly',
      'Exercise regularly',
      'Maintain sleep schedule'
    ]
  },
  yellow: {
    title: 'Yellow Zone - Caution',
    description: 'Actions when warning signs appear',
    color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    icon: '🟡',
    examples: [
      'Increase meeting attendance',
      'Daily contact with sponsor',
      'Journal about feelings',
      'Practice HALT checks',
      'Avoid high-risk situations'
    ]
  },
  red: {
    title: 'Red Zone - Emergency',
    description: 'Immediate actions for crisis situations',
    color: 'from-slate-500/20 to-gray-500/20 border-red-500/30',
    icon: '🔴',
    examples: [
      'Call sponsor immediately',
      'Call 988 or crisis line',
      'Go to a meeting now',
      'Remove yourself from situation',
      'Call emergency contact'
    ]
  }
};

export function TrafficLightScreen() {
  const { relapsePlan, setRelapsePlan, contacts } = useAppData();
  const [activeSection, setActiveSection] = useState<'overview' | 'warning' | 'situations' | 'actions'>('overview');
  const [showAddModal, setShowAddModal] = useState<{
    type: 'warningSigns' | 'highRiskSituations' | 'greenActions' | 'yellowActions' | 'redActions' | null;
    title: string;
  }>({ type: null, title: '' });
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (!showAddModal.type || !newItem.trim()) {
      toast.error('Please enter a value');
      return;
    }

    const updatedPlan = {
      ...relapsePlan,
      [showAddModal.type]: [...relapsePlan[showAddModal.type], newItem.trim()]
    };
    setRelapsePlan(updatedPlan);
    toast.success('Added successfully');
    setNewItem('');
    setShowAddModal({ type: null, title: '' });
  };

  const handleRemoveItem = (type: keyof typeof relapsePlan, index: number) => {
    const updatedPlan = {
      ...relapsePlan,
      [type]: relapsePlan[type].filter((_, i) => i !== index)
    };
    setRelapsePlan(updatedPlan);
    toast.success('Removed');
  };

  const calculateCompleteness = () => {
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

  const completeness = calculateCompleteness();

  // Add Item Modal Component
  const renderModal = () => {
    if (!showAddModal.type) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{showAddModal.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newItem">Description</Label>
                <Textarea
                  id="newItem"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Enter details..."
                  rows={3}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddItem} className="flex-1">
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal({ type: null, title: '' });
                    setNewItem('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (activeSection === 'overview') {
    return (
      <>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Traffic Light System
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your personalized relapse prevention plan
              </p>
            </div>
          </div>

        {/* Completeness Card */}
        <Card className="border-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">Plan Completeness</h3>
                <p className="text-sm text-muted-foreground">
                  {completeness === 100 ? 'Your plan is complete!' : 'Add more items to strengthen your plan'}
                </p>
              </div>
              <div className="text-3xl font-bold text-blue-600">{completeness}%</div>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-gradient-to-r from-slate-600 to-gray-700 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Traffic Light System Overview */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Traffic Light Zones
          </h3>
          <div className="space-y-3">
            {(Object.keys(TRAFFIC_LIGHT_INFO) as Array<keyof typeof TRAFFIC_LIGHT_INFO>).map((zone) => {
              const info = TRAFFIC_LIGHT_INFO[zone];
              const actionKey = `${zone}Actions` as keyof typeof relapsePlan;
              const actionCount = relapsePlan[actionKey].length;

              return (
                <Card
                  key={zone}
                  className={`border-2 bg-gradient-to-br ${info.color} cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => setActiveSection('actions')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{info.icon}</span>
                          <h4 className="font-semibold">{info.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{info.description}</p>
                        <div className="text-xs text-muted-foreground">
                          {actionCount} {actionCount === 1 ? 'action' : 'actions'} defined
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card
            className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-amber-500/20 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveSection('warning')}
          >
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <h4 className="font-semibold mb-1">Warning Signs</h4>
              <p className="text-2xl font-bold">{relapsePlan.warningSigns.length}</p>
              <p className="text-xs text-muted-foreground">identified</p>
            </CardContent>
          </Card>

          <Card
            className="border-2 border-red-500/30 bg-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveSection('situations')}
          >
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <h4 className="font-semibold mb-1">High-Risk</h4>
              <p className="text-2xl font-bold">{relapsePlan.highRiskSituations.length}</p>
              <p className="text-xs text-muted-foreground">situations</p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contacts Quick Access */}
        {contacts.length > 0 && (
          <Card className="border-2 border-blue-500/30 bg-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contacts.slice(0, 3).map((contact) => (
                <Button
                  key={contact.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => contact.phone && (window.location.href = `tel:${contact.phone}`)}
                  disabled={!contact.phone}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">{contact.name}</div>
                    <div className="text-xs text-muted-foreground">{contact.role}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-muted">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              About the Traffic Light System
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              A relapse prevention plan helps you identify early warning signs and take action before a crisis occurs.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Recognize personal warning signs</li>
              <li>• Identify high-risk situations to avoid</li>
              <li>• Create action plans for each risk level</li>
              <li>• Practice your plan regularly</li>
            </ul>
          </CardContent>
        </Card>
        </div>
        {renderModal()}
      </>
    );
  }

  if (activeSection === 'warning') {
    return (
      <>
        <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
            ← Back
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              Warning Signs
            </h2>
            <p className="text-sm text-muted-foreground">
              Early indicators that you may be at risk
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddModal({ type: 'warningSigns', title: 'Add Warning Sign' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        <Card className="bg-muted">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">What are warning signs?</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Warning signs are thoughts, feelings, or behaviors that may indicate you're at increased risk for relapse.
            </p>
            <p className="text-sm font-medium mb-1">Common examples:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Isolating from support network</li>
              <li>• Skipping meetings</li>
              <li>• Romanticizing past use</li>
              <li>• Increased stress or anxiety</li>
              <li>• Changes in sleep or eating</li>
              <li>• Dishonesty with self or others</li>
            </ul>
          </CardContent>
        </Card>

        {relapsePlan.warningSigns.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No warning signs yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add personal warning signs to help you stay aware and take early action
              </p>
              <Button
                onClick={() => setShowAddModal({ type: 'warningSigns', title: 'Add Warning Sign' })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Warning Sign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {relapsePlan.warningSigns.map((sign, index) => (
              <Card key={index} className="border-2 border-orange-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertCircle className="w-5 h-5 mt-0.5 text-orange-500 flex-shrink-0" />
                      <p className="flex-1">{sign}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem('warningSigns', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
        {renderModal()}
      </>
    );
  }

  if (activeSection === 'situations') {
    return (
      <>
        <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
            ← Back
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              High-Risk Situations
            </h2>
            <p className="text-sm text-muted-foreground">
              Situations to avoid or prepare for
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddModal({ type: 'highRiskSituations', title: 'Add High-Risk Situation' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        <Card className="bg-muted">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">What are high-risk situations?</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Places, people, or circumstances that increase your vulnerability to relapse.
            </p>
            <p className="text-sm font-medium mb-1">Common examples:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Bars or clubs</li>
              <li>• Old using friends</li>
              <li>• Parties where substances present</li>
              <li>• High-stress work situations</li>
              <li>• Certain neighborhoods or locations</li>
              <li>• Being alone for extended periods</li>
            </ul>
          </CardContent>
        </Card>

        {relapsePlan.highRiskSituations.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No high-risk situations identified</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Identify situations that pose the highest risk so you can avoid or prepare for them
              </p>
              <Button
                onClick={() => setShowAddModal({ type: 'highRiskSituations', title: 'Add High-Risk Situation' })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Situation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {relapsePlan.highRiskSituations.map((situation, index) => (
              <Card key={index} className="border-2 border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertTriangle className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" />
                      <p className="flex-1">{situation}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem('highRiskSituations', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
        {renderModal()}
      </>
    );
  }

  if (activeSection === 'actions') {
    return (
      <>
        <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
            ← Back
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Action Plans
            </h2>
            <p className="text-sm text-muted-foreground">
              What to do at each risk level
            </p>
          </div>
        </div>

        <Card className="bg-muted">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Traffic Light System</h4>
            <p className="text-sm text-muted-foreground">
              Create specific actions for each zone to help you respond appropriately to different levels of risk.
            </p>
          </CardContent>
        </Card>

        {/* Green Zone */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-2xl">🟢</span>
                {TRAFFIC_LIGHT_INFO.green.title}
              </h3>
              <p className="text-sm text-muted-foreground">{TRAFFIC_LIGHT_INFO.green.description}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddModal({ type: 'greenActions', title: 'Add Green Zone Action' })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {relapsePlan.greenActions.length === 0 ? (
            <Card className={`border-2 ${TRAFFIC_LIGHT_INFO.green.color}`}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">No actions yet. Try these:</p>
                <ul className="text-sm space-y-1">
                  {TRAFFIC_LIGHT_INFO.green.examples.map((example, i) => (
                    <li key={i}>• {example}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {relapsePlan.greenActions.map((action, index) => (
                <Card key={index} className={`border-2 ${TRAFFIC_LIGHT_INFO.green.color}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <p className="text-sm">{action}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem('greenActions', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Yellow Zone */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-2xl">🟡</span>
                {TRAFFIC_LIGHT_INFO.yellow.title}
              </h3>
              <p className="text-sm text-muted-foreground">{TRAFFIC_LIGHT_INFO.yellow.description}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddModal({ type: 'yellowActions', title: 'Add Yellow Zone Action' })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {relapsePlan.yellowActions.length === 0 ? (
            <Card className={`border-2 ${TRAFFIC_LIGHT_INFO.yellow.color}`}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">No actions yet. Try these:</p>
                <ul className="text-sm space-y-1">
                  {TRAFFIC_LIGHT_INFO.yellow.examples.map((example, i) => (
                    <li key={i}>• {example}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {relapsePlan.yellowActions.map((action, index) => (
                <Card key={index} className={`border-2 ${TRAFFIC_LIGHT_INFO.yellow.color}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <p className="text-sm">{action}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem('yellowActions', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Red Zone */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-2xl">🔴</span>
                {TRAFFIC_LIGHT_INFO.red.title}
              </h3>
              <p className="text-sm text-muted-foreground">{TRAFFIC_LIGHT_INFO.red.description}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddModal({ type: 'redActions', title: 'Add Red Zone Action' })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {relapsePlan.redActions.length === 0 ? (
            <Card className={`border-2 ${TRAFFIC_LIGHT_INFO.red.color}`}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">No actions yet. Try these:</p>
                <ul className="text-sm space-y-1">
                  {TRAFFIC_LIGHT_INFO.red.examples.map((example, i) => (
                    <li key={i}>• {example}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {relapsePlan.redActions.map((action, index) => (
                <Card key={index} className={`border-2 ${TRAFFIC_LIGHT_INFO.red.color}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm">{action}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem('redActions', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        </div>
        {renderModal()}
      </>
    );
  }

  return null;
}
