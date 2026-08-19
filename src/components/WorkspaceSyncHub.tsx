import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { WorkoutSession, MealItem, MacroTargets, KeepNote } from '../types';
import { listUpcomingEvents, batchSyncWorkoutsToCalendar, GoogleCalendarEvent } from '../services/calendarService';
import { createGroceryKeepNote, createMealPlanKeepNote, createWorkoutRoutineKeepNote, createHabitsKeepNote } from '../services/keepService';
import { Calendar, CheckSquare, Copy, ExternalLink, RefreshCw, Check, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WorkspaceSyncHubProps {
  user: User | null;
  accessToken: string | null;
  onSignIn: () => void;
  workouts: WorkoutSession[];
  meals: MealItem[];
  macros: MacroTargets;
}

export const WorkspaceSyncHub: React.FC<WorkspaceSyncHubProps> = ({
  user,
  accessToken,
  onSignIn,
  workouts,
  meals,
  macros,
}) => {
  const [activeSyncTab, setActiveSyncTab] = useState<'calendar' | 'keep'>('calendar');
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  // Keep Notes State
  const [keepNotes, setKeepNotes] = useState<KeepNote[]>(() => {
    return [
      createGroceryKeepNote(meals),
      createMealPlanKeepNote(meals, macros),
      createWorkoutRoutineKeepNote(workouts),
      createHabitsKeepNote(),
    ];
  });

  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Calendar Confirmation Modal State (Mandated for workspace mutations)
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const [isPerformingSync, setIsPerformingSync] = useState(false);

  // Load calendar events if authenticated
  const loadCalendarEvents = async () => {
    if (!accessToken) return;
    setIsLoadingCalendar(true);
    setCalendarError(null);
    try {
      const events = await listUpcomingEvents(accessToken);
      setCalendarEvents(events);
    } catch (e: any) {
      console.error('Load calendar error:', e);
      setCalendarError(e.message || 'Failed to load Google Calendar events.');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadCalendarEvents();
    }
  }, [accessToken]);

  // Handle Batch Workout Calendar Sync with Explicit User Confirmation
  const handleTriggerBatchWorkoutSync = () => {
    if (!accessToken) {
      onSignIn();
      return;
    }

    setConfirmModalData({
      isOpen: true,
      title: 'Schedule 7-Day Workouts to Google Calendar?',
      description: `This will create ${workouts.length} scheduled workout events in your primary Google Calendar with exercise breakdowns, target calorie burns, and 15-minute popup reminders.`,
      onConfirm: async () => {
        setIsPerformingSync(true);
        try {
          const now = new Date();
          // Find upcoming Monday
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(now.setDate(diff));

          await batchSyncWorkoutsToCalendar(accessToken, workouts, monday);
          confetti({ particleCount: 50, spread: 60 });
          await loadCalendarEvents();
        } catch (err: any) {
          setCalendarError(err.message);
        } finally {
          setIsPerformingSync(false);
          setConfirmModalData(null);
        }
      },
    });
  };

  const handleCopyNote = (note: KeepNote) => {
    navigator.clipboard.writeText(note.plainContent);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2500);
  };

  const toggleKeepCheckItem = (noteId: string, itemIdx: number) => {
    setKeepNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        const updatedItems = [...n.items];
        updatedItems[itemIdx] = {
          ...updatedItems[itemIdx],
          checked: !updatedItems[itemIdx].checked,
        };
        return { ...n, items: updatedItems };
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Hub Header */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Google Workspace Synchronization
              </span>
              <span className="text-xs text-slate-400 font-mono">Calendar & Keep Direct Pipeline</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Automated Fitness & Meal Scheduling</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Turn your AI nutrition and workout blueprint into real Google Calendar events and Google Keep grocery checklists.
            </p>
          </div>

          {/* Sync Tab Switcher */}
          <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-white/5 self-start sm:self-auto backdrop-blur-md">
            <button
              id="tab-sync-calendar"
              onClick={() => setActiveSyncTab('calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSyncTab === 'calendar'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Google Calendar
            </button>
            <button
              id="tab-sync-keep"
              onClick={() => setActiveSyncTab('keep')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSyncTab === 'keep'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Google Keep Notes
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: GOOGLE CALENDAR */}
      {activeSyncTab === 'calendar' && (
        <div className="space-y-6">
          {/* Auth Banner if not signed in */}
          {!user || !accessToken ? (
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 text-center space-y-4 backdrop-blur-xl shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                📅
              </div>
              <h3 className="text-lg font-bold text-white">Connect Google Calendar</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Sign in with Google to schedule workout sessions, rest days, and meal prep reminders directly onto your calendar with reminders.
              </p>
              <button
                id="btn-calendar-connect"
                onClick={onSignIn}
                className="bg-white text-slate-950 font-bold px-6 py-2.5 rounded-2xl text-xs shadow-lg hover:bg-slate-100 transition-all inline-flex items-center gap-2 active:scale-95"
              >
                <span>Authorize Google Calendar</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Connected to Google Calendar</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">Active</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  id="btn-refresh-calendar"
                  onClick={loadCalendarEvents}
                  disabled={isLoadingCalendar}
                  className="p-2.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800 text-slate-300 border border-white/5 transition-all shadow"
                  title="Refresh Calendar"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingCalendar ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
                <button
                  id="btn-schedule-weekly-calendar"
                  onClick={handleTriggerBatchWorkoutSync}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule 7-Day Routine</span>
                </button>
              </div>
            </div>
          )}

          {calendarError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs flex items-center gap-2 backdrop-blur-md">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{calendarError}</span>
            </div>
          )}

          {/* Upcoming Google Calendar Events List */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Upcoming Google Calendar Schedule
              </h3>
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                Open Google Calendar <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {isLoadingCalendar ? (
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Loading your calendar events...</span>
              </div>
            ) : calendarEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {calendarEvents.map((evt) => {
                  const startStr = evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : evt.start?.date || '';
                  return (
                    <div
                      key={evt.id}
                      className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <div className="font-bold text-white truncate">{evt.summary}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{startStr}</div>
                      </div>
                      {evt.htmlLink && (
                        <a
                          href={evt.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium shrink-0 border border-white/5 flex items-center gap-1 text-[11px] transition-colors"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-white/5 font-sans">
                {user ? 'No upcoming workouts on your calendar yet. Tap "Schedule 7-Day Routine" above!' : 'Sign in to view your scheduled workouts.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE KEEP NOTES */}
      {activeSyncTab === 'keep' && (
        <div className="space-y-6">
          {/* Keep Overview Banner */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <h3 className="font-bold text-white text-sm">Google Keep Formatted Notes & Grocery Checklists</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                One-click notes pre-formatted with Keep checklists (Produce, Lean Protein, Whole Grains, and Daily Non-Negotiable Habits).
              </p>
            </div>

            <a
              href="https://keep.google.com/"
              target="_blank"
              rel="noreferrer"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-2xl text-xs transition-all flex items-center gap-1.5 shadow self-start sm:self-auto active:scale-95"
            >
              <span>Open Google Keep</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keepNotes.map((note) => {
              const isCopied = copiedNoteId === note.id;
              return (
                <div
                  key={note.id}
                  className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{note.title}</h4>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          {note.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-950 border border-white/5 text-slate-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyNote(note)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                          isCopied
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-white/5'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied!' : 'Copy to Keep'}</span>
                      </button>
                    </div>

                    {/* Interactive Checklist in note */}
                    <div className="space-y-1.5 bg-slate-950/70 p-3.5 rounded-2xl border border-white/5 max-h-56 overflow-y-auto font-sans">
                      {note.items.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => toggleKeepCheckItem(note.id, idx)}
                          className={`flex items-center gap-2 text-xs p-1.5 rounded-xl cursor-pointer transition-colors ${
                            item.checked ? 'text-slate-500 line-through bg-slate-900/40' : 'text-slate-300 hover:bg-slate-900/80'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => {}}
                            className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 w-3.5 h-3.5 pointer-events-none"
                          />
                          <span className="truncate">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{note.items.filter((i) => i.checked).length} / {note.items.length} done</span>
                    <a
                      href="https://keep.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 font-sans"
                    >
                      Paste into Keep <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Workspace Data Mutations */}
      {confirmModalData && (
        <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">{confirmModalData.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{confirmModalData.description}</p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmModalData(null)}
                disabled={isPerformingSync}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModalData.onConfirm}
                disabled={isPerformingSync}
                className="bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-4 py-2 rounded-2xl text-xs transition-all flex items-center gap-1.5 shadow-lg disabled:opacity-50 active:scale-95"
              >
                {isPerformingSync ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{isPerformingSync ? 'Syncing...' : 'Confirm & Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
