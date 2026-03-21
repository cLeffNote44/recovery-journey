import { useState, useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/EmptyState';
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Repeat, Bell, X,
  Edit, Trash2, ExternalLink, Download, Smartphone, Share2
} from 'lucide-react';
import { CalendarEvent, EventType } from '@/types/app';
import { toast } from 'sonner';
import {
  getEventsForDate, getEventsInRange, formatEventTime, getRecurringDescription,
  downloadICS, getCalendarUrls
} from '@/lib/calendar-utils';

// Event type colors for visual distinction
const EVENT_TYPE_COLORS = {
  meeting: { bg: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  appointment: { bg: 'bg-green-500', light: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  reminder: { bg: 'bg-yellow-500', light: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  other: { bg: 'bg-gray-500', light: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300' }
};

export function CalendarScreen() {
  const { events, setEvents } = useAppData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ date: string; dayNumber: number } | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<CalendarEvent | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return getEventsForDate(events, dateStr);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDay({ date: dateStr, dayNumber: day });
  };

  // Get upcoming events (including recurring instances)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoMonthsLater = new Date();
    twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);

    return getEventsInRange(events, today, twoMonthsLater).slice(0, 20);
  }, [events]);

  const handleDeleteEvent = (eventId: number, specificDate?: string) => {
    const event = events.find(e => e.id === eventId);

    if (event?.recurring && specificDate) {
      // For recurring events with a specific date, add to excluded dates
      const updatedEvent = {
        ...event,
        recurring: {
          ...event.recurring,
          excludedDates: [...(event.recurring.excludedDates || []), specificDate]
        }
      };
      setEvents(events.map(e => e.id === eventId ? updatedEvent : e));
      toast.success('Event removed from this day only');
      setSelectedDay(null);
    } else if (event?.recurring) {
      // For recurring events without specific date, ask if they want to delete all
      if (confirm('Delete all occurrences of this recurring event?')) {
        setEvents(events.filter(e => e.id !== eventId));
        toast.success('Recurring event deleted');
      }
    } else {
      // For non-recurring events, just delete
      setEvents(events.filter(e => e.id !== eventId));
      toast.success('Event removed from calendar');
      setSelectedDay(null);
    }
  };

  const handleExportToCalendar = (event: CalendarEvent, type: 'google' | 'outlook' | 'yahoo' | 'ics') => {
    const urls = getCalendarUrls(event);

    if (type === 'ics') {
      downloadICS(event);
      toast.success('Calendar file downloaded! Open it to add to your calendar.');
    } else {
      window.open(urls[type], '_blank');
      toast.success('Opening calendar...');
    }

    setShowExportMenu(null);
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <Button onClick={() => setShowAddEvent(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Month Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={previousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="text-lg font-semibold">{monthName}</h3>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {dayLabels.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}

            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().getDate() === day &&
                             new Date().getMonth() === currentMonth.getMonth() &&
                             new Date().getFullYear() === currentMonth.getFullYear();

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square p-1 border rounded-lg cursor-pointer transition-all hover:border-primary hover:bg-primary/5 ${
                    isToday ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>{day}</div>
                  {dayEvents.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={`${event.id}-${idx}`}
                          className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPE_COLORS[event.type]?.bg || 'bg-gray-500'}`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[8px] text-muted-foreground">+{dayEvents.length - 3}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Upcoming Events</h3>
          <span className="text-sm text-muted-foreground">{upcomingEvents.length} events</span>
        </div>

        {upcomingEvents.map((event, idx) => (
          <Card key={`${event.id}-${idx}`} className="overflow-hidden">
            <div className={`h-1 ${EVENT_TYPE_COLORS[event.type]?.bg || 'bg-gray-500'}`} />
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                      {event.time && ` at ${formatEventTime(event.time)}`}
                    </span>
                  </div>
                  <h4 className="font-semibold">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Event type badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${EVENT_TYPE_COLORS[event.type]?.light} ${EVENT_TYPE_COLORS[event.type]?.text}`}>
                      {event.type}
                    </span>

                    {/* Recurring badge */}
                    {event.recurring && (
                      <div className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                        <Repeat className="w-3 h-3" />
                        {getRecurringDescription(event)}
                      </div>
                    )}

                    {/* Reminders badge */}
                    {event.reminders && event.reminders.length > 0 && (
                      <div className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        <Bell className="w-3 h-3" />
                        {event.reminders.length} reminder{event.reminders.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowExportMenu(event)}
                    title="Add to phone calendar"
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEvent(event.parentEventId || event.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {upcomingEvents.length === 0 && (
          <EmptyState
            icon={CalendarIcon}
            title="No Upcoming Events"
            description="Stay organized by adding important dates like meetings, therapy appointments, group sessions, or personal milestones."
            actionLabel="Add First Event"
            onAction={() => setShowAddEvent(true)}
            iconColor="text-blue-500"
          />
        )}
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <DayDetailModal
          date={selectedDay.date}
          dayNumber={selectedDay.dayNumber}
          events={events}
          onClose={() => setSelectedDay(null)}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={setEditingEvent}
          onExportEvent={setShowExportMenu}
        />
      )}

      {/* Add/Edit Event Modal */}
      {(showAddEvent || editingEvent) && (
        <EventFormModal
          event={editingEvent}
          events={events}
          setEvents={setEvents}
          onClose={() => {
            setShowAddEvent(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Export to Calendar Menu */}
      {showExportMenu && (
        <ExportCalendarModal
          event={showExportMenu}
          onClose={() => setShowExportMenu(null)}
          onExport={handleExportToCalendar}
        />
      )}
    </div>
  );
}

// Day Detail Modal Component
function DayDetailModal({
  date,
  dayNumber,
  events,
  onClose,
  onDeleteEvent,
  onEditEvent,
  onExportEvent
}: {
  date: string;
  dayNumber: number;
  events: CalendarEvent[];
  onClose: () => void;
  onDeleteEvent: (eventId: number, specificDate?: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onExportEvent: (event: CalendarEvent) => void;
}) {
  const dayEvents = getEventsForDate(events, date);
  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b">
          <CardTitle className="text-lg">{formattedDate}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No events on this day</p>
            </div>
          ) : (
            dayEvents.map((event, idx) => (
              <Card key={`${event.id}-${idx}`} className="overflow-hidden">
                <div className={`h-1 ${EVENT_TYPE_COLORS[event.type]?.bg || 'bg-gray-500'}`} />
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {event.time && (
                            <span className="text-sm font-medium text-primary">
                              {formatEventTime(event.time)}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${EVENT_TYPE_COLORS[event.type]?.light} ${EVENT_TYPE_COLORS[event.type]?.text}`}>
                            {event.type}
                          </span>
                        </div>
                        <h4 className="font-semibold mb-1">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}

                        {/* Recurring indicator */}
                        {event.recurring && (
                          <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 mt-2">
                            <Repeat className="w-3 h-3" />
                            <span>{getRecurringDescription(event)}</span>
                          </div>
                        )}

                        {/* Reminders */}
                        {event.reminders && event.reminders.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Bell className="w-3 h-3" />
                            {event.reminders.map(r => {
                              if (r.minutes === 0) return 'At time';
                              if (r.minutes < 60) return `${r.minutes}min before`;
                              if (r.minutes < 1440) return `${r.minutes / 60}hr before`;
                              return `${r.minutes / 1440}day before`;
                            }).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onExportEvent(event)}
                        className="flex-1"
                      >
                        <Smartphone className="w-3 h-3 mr-1" />
                        Add to Phone
                      </Button>
                      {event.recurring ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteEvent(event.parentEventId || event.id, date)}
                          className="flex-1"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Skip This Day
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onEditEvent(event);
                              onClose();
                            }}
                            className="flex-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteEvent(event.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Event Form Modal (Add/Edit)
function EventFormModal({
  event,
  events,
  setEvents,
  onClose
}: {
  event: CalendarEvent | null;
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  onClose: () => void;
}) {
  const isEditing = !!event;
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Form state
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(event?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(event?.time || '09:00');
  const [type, setType] = useState<EventType>(event?.type || 'other');

  // Recurring state
  const [isRecurring, setIsRecurring] = useState(!!event?.recurring);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    event?.recurring?.frequency || 'weekly'
  );
  const [recurringInterval, setRecurringInterval] = useState(event?.recurring?.interval || 1);
  const [recurringEndDate, setRecurringEndDate] = useState(event?.recurring?.endDate || '');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>(
    event?.recurring?.daysOfWeek || []
  );

  // Reminder state
  const [reminderMinutes, setReminderMinutes] = useState<number[]>(
    event?.reminders?.map(r => r.minutes) || []
  );

  const toggleDayOfWeek = (day: number) => {
    setSelectedDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleReminder = (minutes: number) => {
    setReminderMinutes(prev =>
      prev.includes(minutes) ? prev.filter(m => m !== minutes) : [...prev, minutes]
    );
  };

  const handleSubmit = () => {
    if (!title.trim() || !date) {
      toast.error('Please fill in required fields');
      return;
    }

    const eventDate = new Date(date + 'T00:00:00');
    const eventDayOfWeek = eventDate.getDay();

    // Build the event object
    const eventData: CalendarEvent = {
      id: event?.id || Date.now(),
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      type,
      reminders: reminderMinutes.length > 0 ? reminderMinutes.map(minutes => ({ minutes })) : undefined,
      recurring: isRecurring ? {
        frequency: recurringFrequency,
        interval: recurringInterval,
        endDate: recurringEndDate || undefined,
        // For weekly: use selected days, or default to the event's day
        daysOfWeek: recurringFrequency === 'weekly'
          ? (selectedDaysOfWeek.length > 0 ? selectedDaysOfWeek : [eventDayOfWeek])
          : undefined,
        // For monthly: use the day of month from the event date
        dayOfMonth: (recurringFrequency === 'monthly' || recurringFrequency === 'yearly')
          ? eventDate.getDate()
          : undefined,
        // For yearly: also store the month
        monthOfYear: recurringFrequency === 'yearly'
          ? eventDate.getMonth() + 1
          : undefined,
        excludedDates: event?.recurring?.excludedDates || []
      } : undefined
    };

    if (isEditing) {
      setEvents(events.map(e => e.id === event.id ? eventData : e));
      toast.success('Event updated!');
    } else {
      setEvents([...events, eventData]);
      const recurringText = isRecurring ? ` (${getRecurringDescription(eventData)})` : '';
      toast.success(`Event "${title}" added${recurringText}!`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-md my-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? 'Edit Event' : 'Add Event'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting, appointment, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Date *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <Select value={type} onValueChange={(value: EventType) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Meeting
                  </div>
                </SelectItem>
                <SelectItem value="appointment">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Appointment
                  </div>
                </SelectItem>
                <SelectItem value="reminder">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Reminder
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    Other
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurring Options */}
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked === true)}
              />
              <label htmlFor="recurring" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <Repeat className="w-4 h-4" />
                Recurring Event
              </label>
            </div>

            {isRecurring && (
              <div className="space-y-3 pl-6 border-l-2 border-purple-200 dark:border-purple-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Frequency</label>
                    <Select
                      value={recurringFrequency}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setRecurringFrequency(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Every</label>
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      value={recurringInterval}
                      onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                {recurringFrequency === 'weekly' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Repeat on <span className="text-muted-foreground">(defaults to event day)</span>
                    </label>
                    <div className="flex gap-1 flex-wrap">
                      {dayLabels.map((day, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant={selectedDaysOfWeek.includes(idx) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleDayOfWeek(idx)}
                          className="w-10 h-9"
                        >
                          {day[0]}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">End Date (optional)</label>
                  <Input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    min={date}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reminders */}
          <div className="space-y-3 border-t pt-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Reminders
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'At time', value: 0 },
                { label: '15 min before', value: 15 },
                { label: '30 min before', value: 30 },
                { label: '1 hour before', value: 60 },
                { label: '1 day before', value: 1440 }
              ].map(({ label, value }) => (
                <div key={value} className="flex items-center gap-2">
                  <Checkbox
                    id={`reminder-${value}`}
                    checked={reminderMinutes.includes(value)}
                    onCheckedChange={() => toggleReminder(value)}
                  />
                  <label htmlFor={`reminder-${value}`} className="text-sm cursor-pointer">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim()} className="flex-1">
              {isEditing ? 'Save Changes' : 'Add Event'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export to Calendar Modal
function ExportCalendarModal({
  event,
  onClose,
  onExport
}: {
  event: CalendarEvent;
  onClose: () => void;
  onExport: (event: CalendarEvent, type: 'google' | 'outlook' | 'yahoo' | 'ics') => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Add to Calendar
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            Add "{event.title}" to your phone's calendar app
          </p>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => onExport(event, 'google')}
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 flex items-center justify-center text-white text-xs font-bold">
              G
            </div>
            Google Calendar
            <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => onExport(event, 'outlook')}
          >
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              O
            </div>
            Outlook Calendar
            <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => onExport(event, 'yahoo')}
          >
            <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
              Y
            </div>
            Yahoo Calendar
            <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => onExport(event, 'ics')}
          >
            <div className="w-6 h-6 rounded bg-gray-600 flex items-center justify-center text-white">
              <Download className="w-3 h-3" />
            </div>
            Download .ics File
            <span className="text-xs text-muted-foreground ml-auto">Apple, Android</span>
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            The .ics file works with Apple Calendar, Samsung Calendar, and most calendar apps
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
