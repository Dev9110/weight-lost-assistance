import React, { useState } from 'react';
import { UserProfile, MacroTargets, MealItem, WorkoutSession } from '../types';
import { Calendar, ShoppingBag, BookOpen, Clock, Dumbbell, Sparkles, Check, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlanViewProps {
  profile: UserProfile;
  macros: MacroTargets;
  meals: MealItem[];
  workouts: WorkoutSession[];
  onSyncCalendar: () => void;
  onExportKeepGrocery: () => void;
  onExportKeepMeals: () => void;
  onExportKeepWorkouts: () => void;
  onRegenerateWithAI: () => Promise<void>;
  isGenerating: boolean;
}

export const PlanView: React.FC<PlanViewProps> = ({
  profile,
  macros,
  meals,
  workouts,
  onSyncCalendar,
  onExportKeepGrocery,
  onExportKeepMeals,
  onExportKeepWorkouts,
  onRegenerateWithAI,
  isGenerating,
}) => {
  const [activePlanTab, setActivePlanTab] = useState<'meals' | 'workouts'>('meals');
  const [expandedMealId, setExpandedMealId] = useState<string | null>(meals[0]?.id || null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const toggleMealExpand = (id: string) => {
    setExpandedMealId(expandedMealId === id ? null : id);
  };

  const handleCopyRecipe = (meal: MealItem) => {
    const text = `🍽️ ${meal.name} (${meal.calories} kcal | ${meal.protein}g Protein | ${meal.carbs}g Carbs | ${meal.fat}g Fat)
Ingredients:
${meal.ingredients.map((i) => `• ${i}`).join('\n')}

Instructions:
${meal.instructions.map((ins, idx) => `${idx + 1}. ${ins}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(meal.name);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Personalized Blueprint
            </span>
            <span className="text-xs text-slate-400 capitalize font-mono">{profile.dietPreference.replace('_', ' ')} • {macros.calories} kcal</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Nutrition & Resistance Architecture</h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded in scientific energy balance, synchronized with Google Calendar & Keep.
          </p>
        </div>

        {/* Tab Switcher & AI Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
            <button
              id="tab-plan-meals"
              onClick={() => setActivePlanTab('meals')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activePlanTab === 'meals'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Meal Plan
            </button>
            <button
              id="tab-plan-workouts"
              onClick={() => setActivePlanTab('workouts')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activePlanTab === 'workouts'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              Workouts (7d)
            </button>
          </div>

          <button
            id="btn-ai-regenerate"
            onClick={async () => {
              await onRegenerateWithAI();
              confetti({ particleCount: 40, spread: 60 });
            }}
            disabled={isGenerating}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-4 py-2 rounded-2xl text-xs shadow-lg shadow-emerald-900/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isGenerating ? 'Synthesizing...' : 'AI Remix'}</span>
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 backdrop-blur-md">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Copied recipe for "{copiedNotification}" to clipboard!</span>
        </div>
      )}

      {/* SECTION 1: MEALS TAB */}
      {activePlanTab === 'meals' && (
        <div className="space-y-6">
          {/* Quick Export Cards for Keep */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-5 backdrop-blur-xl flex items-center justify-between shadow-lg">
              <div>
                <h4 className="font-bold text-white text-xs">Keep Grocery Shopping List</h4>
                <p className="text-[11px] text-slate-400">All whole-food ingredients categorized for Google Keep</p>
              </div>
              <button
                id="btn-export-keep-grocery"
                onClick={onExportKeepGrocery}
                className="bg-slate-950/70 hover:bg-slate-800 border border-white/5 text-cyan-300 font-semibold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                Keep Checklist
              </button>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-5 backdrop-blur-xl flex items-center justify-between shadow-lg">
              <div>
                <h4 className="font-bold text-white text-xs">Keep Daily Meal & Macro Note</h4>
                <p className="text-[11px] text-slate-400">Structured daily meals with calories and prep instructions</p>
              </div>
              <button
                id="btn-export-keep-meals"
                onClick={onExportKeepMeals}
                className="bg-slate-950/70 hover:bg-slate-800 border border-white/5 text-amber-300 font-semibold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Keep Note
              </button>
            </div>
          </div>

          {/* Meal List Cards */}
          <div className="grid grid-cols-1 gap-4">
            {meals.map((meal) => {
              const isExpanded = expandedMealId === meal.id;
              return (
                <div
                  key={meal.id}
                  className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl transition-all"
                >
                  <div
                    onClick={() => toggleMealExpand(meal.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-850/30 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-center text-xl shrink-0">
                        {meal.type === 'breakfast' ? '🍳' : meal.type === 'lunch' ? '🥗' : meal.type === 'dinner' ? '🍲' : '🥜'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {meal.type}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" /> {meal.prepTimeMinutes}m prep
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-base mt-0.5">{meal.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Macro Pills */}
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {meal.calories} kcal
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {meal.protein}g P
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20 hidden sm:inline-block">
                          {meal.carbs}g C
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-white/5 hidden sm:inline-block">
                          {meal.fat}g F
                        </span>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Recipe & Ingredients View */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-3 border-t border-white/5 bg-slate-950/50 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ingredients */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                            Whole Food Ingredients
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {meal.ingredients.map((ing, idx) => (
                              <li key={idx} className="flex items-center gap-2.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] shrink-0" />
                                <span>{ing}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                            Step-by-Step Preparation
                          </h4>
                          <ol className="space-y-1.5 text-xs text-slate-300">
                            {meal.instructions.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="font-mono font-bold text-slate-500 shrink-0">{idx + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      {/* Footer Tags & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {meal.tags.map((tag, idx) => (
                            <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => handleCopyRecipe(meal)}
                          className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-white/5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy Recipe
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: WORKOUTS TAB */}
      {activePlanTab === 'workouts' && (
        <div className="space-y-6">
          {/* Top Calendar & Keep Action Bar */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Google Calendar & Google Keep Sync</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Automatically schedule these workout routines and recovery walk reminders into your Google Calendar.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-sync-calendar-plan"
                onClick={onSyncCalendar}
                className="bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-4 py-2 rounded-2xl text-xs transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                Schedule to Calendar
              </button>
              <button
                id="btn-export-keep-workouts"
                onClick={onExportKeepWorkouts}
                className="bg-slate-950/70 hover:bg-slate-800 text-slate-200 border border-white/5 font-semibold px-3.5 py-2 rounded-2xl text-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-teal-400" />
                Keep Routine
              </button>
            </div>
          </div>

          {/* 7-Day Workout Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {workout.dayOfWeek}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {workout.scheduledTime || '07:30 AM'}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base mt-1">{workout.title}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-300 font-mono block">~{workout.estimatedCaloriesBurn} kcal</span>
                    <span className="text-[11px] text-slate-500 font-mono">{workout.durationMinutes} mins</span>
                  </div>
                </div>

                {/* Exercises List */}
                <div className="space-y-2.5 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exercise Progression</div>
                  <div className="space-y-2">
                    {workout.exercises.map((ex, idx) => (
                      <div key={idx} className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-white">{ex.name}</span>
                          <span className="font-mono font-bold text-emerald-400">{ex.sets} sets × {ex.repsOrDuration}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-mono">
                          <span>Target: {ex.targetMuscle}</span>
                          <span>Rest: {ex.restSeconds}s</span>
                        </div>
                        {ex.instructions && (
                          <p className="text-[10px] text-slate-400 italic mt-1.5 border-t border-white/5 pt-1 font-sans">
                            {ex.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
