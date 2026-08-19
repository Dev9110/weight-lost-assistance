import { CalendarEventPayload, WorkoutSession } from '../types';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

/**
 * Lists upcoming calendar events for the user's primary calendar
 */
export async function listUpcomingEvents(
  accessToken: string,
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> {
  const now = timeMin || new Date().toISOString();
  let url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    now
  )}&singleEvents=true&orderBy=startTime&maxResults=25`;

  if (timeMax) {
    url += `&timeMax=${encodeURIComponent(timeMax)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Google Calendar API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || '(Untitled Event)',
    description: item.description || '',
    start: item.start || {},
    end: item.end || {},
    htmlLink: item.htmlLink,
  }));
}

/**
 * Creates a single event on the user's primary calendar
 */
export async function createCalendarEvent(
  accessToken: string,
  payload: CalendarEventPayload
): Promise<GoogleCalendarEvent> {
  const body = {
    summary: payload.summary,
    description: payload.description,
    start: {
      dateTime: payload.startDateTime,
    },
    end: {
      dateTime: payload.endDateTime,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
        { method: 'popup', minutes: 60 },
      ],
    },
    colorId: payload.eventType === 'workout' ? '10' : payload.eventType === 'meal_prep' ? '2' : '5', // Green / Sage
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create calendar event: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Deletes a calendar event (requires user confirmation before calling)
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete calendar event`);
  }
}

/**
 * Batch syncs weekly workouts to Google Calendar
 */
export async function batchSyncWorkoutsToCalendar(
  accessToken: string,
  workouts: WorkoutSession[],
  startMondayDate: Date
): Promise<{ successCount: number; errors: string[] }> {
  let successCount = 0;
  const errors: string[] = [];

  const dayMap: Record<string, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };

  for (const workout of workouts) {
    const dayOffset = dayMap[workout.dayOfWeek] ?? 0;
    const sessionDate = new Date(startMondayDate);
    sessionDate.setDate(sessionDate.getDate() + dayOffset);

    // Parse scheduled time e.g. "07:30"
    const [hours, minutes] = (workout.scheduledTime || '07:30').split(':').map(Number);
    sessionDate.setHours(hours || 7, minutes || 30, 0, 0);

    const endDate = new Date(sessionDate);
    endDate.setMinutes(endDate.getMinutes() + (workout.durationMinutes || 45));

    const exerciseList = workout.exercises
      .map((ex, idx) => `${idx + 1}. ${ex.name} - ${ex.sets} sets × ${ex.repsOrDuration} (Rest: ${ex.restSeconds}s)`)
      .join('\n');

    const payload: CalendarEventPayload = {
      summary: `🏋️ ${workout.title}`,
      description: `Target Calories: ~${workout.estimatedCaloriesBurn} kcal\nDuration: ${workout.durationMinutes} mins\nFocus: ${workout.type.toUpperCase()}\n\nExercises:\n${exerciseList}\n\nScheduled by AI Weight Loss Coach`,
      startDateTime: sessionDate.toISOString(),
      endDateTime: endDate.toISOString(),
      eventType: 'workout',
    };

    try {
      await createCalendarEvent(accessToken, payload);
      successCount++;
    } catch (e: any) {
      errors.push(`${workout.title}: ${e.message}`);
    }
  }

  return { successCount, errors };
}
