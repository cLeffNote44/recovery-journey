/**
 * Facility Screen
 *
 * Main screen for facility integration features including:
 * - Connection management with registration key
 * - Messaging with counselor
 * - Treatment plan viewer
 * - Sync status and controls
 */

import { useState, useEffect, useCallback } from 'react';
import { useFacilityStore } from '@/stores/useFacilityStore';
import { useJournalStore, useActivitiesStore, useSettingsStore } from '@/stores';
import { connectFacilityWebSocket, disconnectFacilityWebSocket } from '@/lib/facility-ws';
import {
  validateRegistrationKey,
  disconnectFromFacility,
  fetchMessages,
  sendMessage,
  markMessageAsRead,
  fetchTreatmentPlan,
  performFullSync,
  checkConnection,
} from '@/lib/facility-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Building2,
  Link2,
  Link2Off,
  MessageSquare,
  ClipboardList,
  RefreshCw,
  Send,
  User,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Loader2,
  ChevronRight,
  Shield,
} from 'lucide-react';

// ============================================================================
// CONNECTION TAB
// ============================================================================

function ConnectionTab() {
  const [registrationKey, setRegistrationKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { isConnected, connection, syncStatus } = useFacilityStore();

  const handleConnect = async () => {
    if (!registrationKey.trim()) {
      toast.error('Please enter your registration key');
      return;
    }

    setIsConnecting(true);
    const result = await validateRegistrationKey(registrationKey.trim());
    setIsConnecting(false);

    if (result.success) {
      toast.success(`Connected to ${result.connection?.facilityName}`);
      setRegistrationKey('');
    } else {
      toast.error(result.error || 'Failed to connect');
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    await disconnectFromFacility();
    setIsDisconnecting(false);
    toast.success('Disconnected from facility');
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Connect to Your Facility
            </CardTitle>
            <CardDescription>
              Enter the registration key provided by your treatment facility to
              connect your recovery app with their system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="registration-key" className="text-sm font-medium">
                Registration Key
              </label>
              <Input
                id="registration-key"
                type="text"
                placeholder="Enter your registration key"
                value={registrationKey}
                onChange={(e) => setRegistrationKey(e.target.value.toUpperCase())}
                className="font-mono"
                disabled={isConnecting}
              />
              <p className="text-xs text-muted-foreground">
                Your registration key was provided by your counselor or facility
                administrator.
              </p>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting || !registrationKey.trim()}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Connect to Facility
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Why Connect?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-0.5 text-primary" />
                <span>Send secure messages to your counselor</span>
              </li>
              <li className="flex items-start gap-2">
                <ClipboardList className="w-4 h-4 mt-0.5 text-primary" />
                <span>View your personalized treatment plan</span>
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 mt-0.5 text-primary" />
                <span>Share your progress automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 mt-0.5 text-primary" />
                <span>All data is encrypted and HIPAA compliant</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-500" />
            Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Facility</span>
              <span className="font-medium">{connection?.facilityName}</span>
            </div>
            {connection?.counselorName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Counselor</span>
                <span className="font-medium">{connection.counselorName}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Connected</span>
              <span className="text-sm">
                {connection?.connectedAt
                  ? new Date(connection.connectedAt).toLocaleDateString()
                  : 'Unknown'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="w-full text-destructive hover:text-destructive"
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <Link2Off className="w-4 h-4 mr-2" />
                  Disconnect from Facility
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last sync</span>
            <span className="text-sm">
              {syncStatus.lastSyncAt
                ? new Date(syncStatus.lastSyncAt).toLocaleString()
                : 'Never'}
            </span>
          </div>

          {(syncStatus.pendingCheckIns > 0 || syncStatus.pendingCravings > 0) && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="text-sm">
                {syncStatus.pendingCheckIns} check-ins, {syncStatus.pendingCravings}{' '}
                cravings
              </span>
            </div>
          )}

          {syncStatus.lastSyncError && (
            <div className="p-2 bg-destructive/10 rounded-md">
              <p className="text-xs text-destructive">{syncStatus.lastSyncError}</p>
            </div>
          )}

          <SyncButton />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SYNC BUTTON
// ============================================================================

function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { syncStatus } = useFacilityStore();

  // Check-ins live in the journal store and cravings in the activities store
  // (they were previously read from useRecoveryStore, which has neither — so
  // the two most clinically important data types silently never synced).
  const checkIns = useJournalStore((state) => state.checkIns);
  const cravings = useActivitiesStore((state) => state.cravings);
  const goals = useSettingsStore((state) => state.goals);
  const goalProgress = useSettingsStore((state) => state.goalProgress);

  const handleSync = async () => {
    setIsSyncing(true);

    // Get recent data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];

    const recentCheckIns = checkIns.filter((c) => c.date >= cutoffDate);
    const recentCravings = cravings.filter((c) => c.date >= cutoffDate);
    const activeGoals = goals.filter((g) => g.isActive);
    const recentProgress = goalProgress.filter((p) => p.date >= cutoffDate);

    const result = await performFullSync({
      checkIns: recentCheckIns,
      cravings: recentCravings,
      goals: activeGoals,
      goalProgress: recentProgress,
    });

    setIsSyncing(false);

    if (result.success) {
      toast.success('Data synced successfully');
    } else {
      toast.error(result.error || 'Sync failed');
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing || syncStatus.syncInProgress}
      variant="outline"
      className="w-full"
    >
      {isSyncing || syncStatus.syncInProgress ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync Now
        </>
      )}
    </Button>
  );
}

// ============================================================================
// MESSAGES TAB
// ============================================================================

function MessagesTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { messages, connection, isConnected } = useFacilityStore();

  useEffect(() => {
    if (isConnected) {
      loadMessages();
    }
  }, [isConnected]);

  const loadMessages = async () => {
    setIsLoading(true);
    await fetchMessages();
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    const result = await sendMessage(newMessage.trim());
    setIsSending(false);

    if (result.success) {
      setNewMessage('');
      toast.success('Message sent');
    } else {
      toast.error(result.error || 'Failed to send message');
    }
  };

  const handleMarkRead = async (messageId: string) => {
    await markMessageAsRead(messageId);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Messages Unavailable</h3>
          <p className="text-sm text-muted-foreground">
            Connect to your facility to send messages to your counselor.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compose Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4" />
            Message {connection?.counselorName || 'Your Counselor'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
            disabled={isSending}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={isSending || !newMessage.trim()}
              size="sm"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Conversation</CardTitle>
          <Button variant="ghost" size="sm" onClick={loadMessages}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No messages yet. Send a message to start the conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.senderType === 'patient'
                      ? 'bg-primary/10 ml-8'
                      : 'bg-muted mr-8'
                  }`}
                  onClick={() => !message.isRead && handleMarkRead(message.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {message.senderName}
                    </span>
                    <div className="flex items-center gap-2">
                      {message.priority !== 'normal' && (
                        <Badge
                          variant={
                            message.priority === 'urgent' ? 'destructive' : 'outline'
                          }
                          className="text-xs"
                        >
                          {message.priority}
                        </Badge>
                      )}
                      {!message.isRead && message.senderType !== 'patient' && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// TREATMENT PLAN TAB
// ============================================================================

function TreatmentPlanTab() {
  const [isLoading, setIsLoading] = useState(true);
  const { treatmentPlan, isConnected } = useFacilityStore();

  useEffect(() => {
    if (isConnected) {
      loadPlan();
    }
  }, [isConnected]);

  const loadPlan = async () => {
    setIsLoading(true);
    await fetchTreatmentPlan();
    setIsLoading(false);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Treatment Plan Unavailable</h3>
          <p className="text-sm text-muted-foreground">
            Connect to your facility to view your treatment plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!treatmentPlan) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">No Treatment Plan</h3>
          <p className="text-sm text-muted-foreground">
            Your counselor hasn't created a treatment plan for you yet.
          </p>
          <Button variant="outline" className="mt-4" onClick={loadPlan}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Plan Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{treatmentPlan.title}</CardTitle>
              {treatmentPlan.description && (
                <CardDescription className="mt-1">
                  {treatmentPlan.description}
                </CardDescription>
              )}
            </div>
            <Badge
              variant={
                treatmentPlan.status === 'active'
                  ? 'default'
                  : treatmentPlan.status === 'completed'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {treatmentPlan.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Started: {new Date(treatmentPlan.startDate).toLocaleDateString()}
            </div>
            {treatmentPlan.targetEndDate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Target: {new Date(treatmentPlan.targetEndDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      {treatmentPlan.phases.map((phase, phaseIndex) => (
        <Card key={phase.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                  {phaseIndex + 1}
                </span>
                {phase.name}
              </CardTitle>
              <Badge
                variant={
                  phase.status === 'completed'
                    ? 'secondary'
                    : phase.status === 'in_progress'
                    ? 'default'
                    : 'outline'
                }
                className="text-xs"
              >
                {phase.status.replace('_', ' ')}
              </Badge>
            </div>
            {phase.description && (
              <CardDescription>{phase.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {phase.goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No goals defined for this phase yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {phase.goals.map((goal) => (
                  <li key={goal.id} className="flex items-start gap-2">
                    {goal.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                    ) : goal.status === 'in_progress' ? (
                      <Clock className="w-4 h-4 mt-0.5 text-blue-500" />
                    ) : (
                      <Circle className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{goal.description}</p>
                      {goal.targetDate && (
                        <p className="text-xs text-muted-foreground">
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      )}
                      {goal.progress !== undefined && (
                        <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN SCREEN
// ============================================================================

export function FacilityScreen() {
  const { isConnected, unreadMessageCount } = useFacilityStore();
  const [activeTab, setActiveTab] = useState('connection');

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Keep a real-time connection open while linked to a facility so counselor
  // messages arrive live (instead of only on manual refresh).
  useEffect(() => {
    if (!isConnected) return;
    connectFacilityWebSocket();
    return () => disconnectFacilityWebSocket();
  }, [isConnected]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          My Facility
        </h1>
        <p className="text-muted-foreground">
          {isConnected
            ? 'Connected to your treatment facility'
            : 'Connect to your treatment facility'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connection" className="flex items-center gap-1">
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline">Connection</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Messages</span>
            {unreadMessageCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {unreadMessageCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-1">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Plan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="mt-4">
          <ConnectionTab />
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <MessagesTab />
        </TabsContent>

        <TabsContent value="plan" className="mt-4">
          <TreatmentPlanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
