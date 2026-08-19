import React, { useState } from 'react';
import { UserProfile, MacroTargets, MealItem, WorkoutSession, WeightLogEntry, SleepLogEntry } from '../types';
import { calculateTargetDate } from '../utils/healthCalculators';
import {
  Droplet,
  Flame,
  Target,
  Scale,
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  ArrowRight,
  Zap,
  Sparkles,
  Activity,
  FileText,
  Check,
  Cpu,
  Stethoscope,
  Bot,
  Send,
  RefreshCw,
  Copy,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { SleepLogger } from './SleepLogger';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';

interface DashboardProps {
  profile: UserProfile;
  macros: MacroTargets;
  meals: MealItem[];
  workouts: WorkoutSession[];
  weightLogs: WeightLogEntry[];
  sleepLogs: SleepLogEntry[];
  onLogWeight: (weight: number, notes?: string) => void;
  onLogSleep: (log: Omit<SleepLogEntry, 'id'>) => Promise<void>;
  onToggleMealLog: (mealId: string) => void;
  onToggleWorkoutLog: (workoutId: string) => void;
  onOpenSync: () => void;
  onOpenCoach: (prefilledPrompt?: string) => void;
  onOpenPlan: () => void;
  onOpenIntake: () => void;
  onOpenCheckIn?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  macros,
  meals,
  workouts,
  weightLogs,
  sleepLogs,
  onLogWeight,
  onLogSleep,
  onToggleMealLog,
  onToggleWorkoutLog,
  onOpenSync,
  onOpenCoach,
  onOpenPlan,
  onOpenIntake,
  onOpenCheckIn,
}) => {
  const [newWeightInput, setNewWeightInput] = useState<string>('');
  const [waterLiters, setWaterLiters] = useState<number>(1.75);

  // Quick Dashboard AI Prompt State
  const [dashboardPrompt, setDashboardPrompt] = useState<string>('');
  const [isAskingDashboardAi, setIsAskingDashboardAi] = useState<boolean>(false);
  const [dashboardAiResponse, setDashboardAiResponse] = useState<string | null>(null);
  const [dashboardAiFollowUps, setDashboardAiFollowUps] = useState<string[]>([]);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  const targetDateInfo = calculateTargetDate(
    profile.currentWeightKg,
    profile.goalWeightKg,
    profile.targetLossPaceKgPerWeek
  );

  // Compute total logged meals calories and macros
  const loggedMeals = meals.filter((m) => m.logged);
  const consumedCalories = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const consumedProtein = loggedMeals.reduce((acc, m) => acc + m.protein, 0);
  const consumedCarbs = loggedMeals.reduce((acc, m) => acc + m.carbs, 0);
  const consumedFat = loggedMeals.reduce((acc, m) => acc + m.fat, 0);

  const caloriePercentage = Math.min(100, Math.round((consumedCalories / macros.calories) * 100));
  const remainingCalories = Math.max(0, macros.calories - consumedCalories);

  // BMI Calculation
  const heightM = profile.heightCm / 100;
  const bmi = (profile.currentWeightKg / (heightM * heightM)).toFixed(1);

  const handleAddWater = (amountLiters: number) => {
    const updated = Math.min(5.0, Math.round((waterLiters + amountLiters) * 100) / 100);
    setWaterLiters(updated);
    if (updated >= profile.waterGoalLiters && waterLiters < profile.waterGoalLiters) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeightInput);
    if (!isNaN(val) && val > 30 && val < 300) {
      onLogWeight(val);
      setNewWeightInput('');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    }
  };

  const handleQuickDashboardAsk = async (queryText?: string) => {
    const textToSend = (queryText || dashboardPrompt).trim();
    if (!textToSend || isAskingDashboardAi) return;

    setIsAskingDashboardAi(true);
    setDashboardPrompt('');

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          profile,
          macros,
          role: 'orchestrator',
        }),
      });
      const data = await res.json();
      setDashboardAiResponse(data.reply || 'Personalized guidance generated.');
      setDashboardAiFollowUps(data.suggestedFollowUps || []);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
      setDashboardAiResponse(
        `For your target of ${profile.goalWeightKg} kg, maintain a ${macros.deficit} kcal deficit, hit ${macros.proteinGrams}g protein, and log 8,000+ steps.`
      );
    } finally {
      setIsAskingDashboardAi(false);
    }
  };

  const copyAiResponse = () => {
    if (!dashboardAiResponse) return;
    navigator.clipboard.writeText(dashboardAiResponse);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section: Agent Logic Engine & Top Stat Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Autonomous Agent Logic Engine Card */}
        <div className="lg:col-span-4 bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-emerald-400">
            <Cpu className="w-20 h-20" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Personalized AI Core
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-4">
              <p className="text-xs leading-relaxed text-emerald-100/90 italic font-sans">
                "Calibrated deficit for {profile.name}: targeting -{profile.targetLossPaceKgPerWeek} kg/wk with {macros.proteinGrams}g Protein ({profile.dietPreference.replace('_', ' ')} protocol). Next resistance split synced to Google Calendar."
              </p>
            </div>

            {/* Live Telemetry Status Feeds */}
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between items-center text-slate-400">
                <span>Diet Protocol:</span>
                <span className="text-emerald-400 font-bold uppercase">{profile.dietPreference.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Metabolic Deficit:</span>
                <span className="text-amber-400 font-bold">-{macros.deficit} kcal/day</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>RAG Scientific Evidence:</span>
                <span className="text-cyan-400 font-bold">20 GUIDELINES INDEXED</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenCoach()}
              className="py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-slate-950 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Full AI Coach</span>
            </button>
            <button
              onClick={onOpenIntake}
              className="py-2.5 bg-slate-950/80 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Adjust Criteria</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hero Metrics 3-Card Strip */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Current Weight Card */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Current Weight</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black tracking-tighter text-white">{profile.currentWeightKg}</span>
                  <span className="text-sm text-slate-500 font-semibold font-mono">kg</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981] rounded-full"
                    style={{ width: `${Math.min(100, (profile.goalWeightKg / profile.currentWeightKg) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-emerald-400 mt-2 font-medium">Goal: {profile.goalWeightKg} kg (BMI {bmi})</p>
              </div>
            </div>

            {/* Calorie Target Card */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Calorie Target</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black tracking-tighter text-white">{macros.calories}</span>
                  <span className="text-sm text-slate-500 font-semibold font-mono">kcal</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] rounded-full" />
                </div>
                <p className="text-[10px] text-emerald-400 mt-2 font-medium">-{macros.deficit} kcal deficit vs TDEE ({macros.tdee})</p>
              </div>
            </div>

            {/* Weekly Streak Card */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Milestone Horizon</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black tracking-tighter text-white">{targetDateInfo.weeksRemaining}</span>
                  <span className="text-sm text-slate-500 font-semibold font-mono">weeks</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-amber-500 shadow-[0_0_8px_#f59e0b] rounded-full" />
                </div>
                <p className="text-[10px] text-cyan-400 mt-2 font-medium truncate">Est: {targetDateInfo.projectedDateString}</p>
              </div>
            </div>
          </div>

          {/* Quick Dual Cards: Google Calendar Next Event & Keep Quick Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Google Calendar Sync Card */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Google Calendar</h3>
                  </div>
                  <button onClick={onOpenSync} className="text-[11px] font-mono text-cyan-400 hover:underline">
                    SYNC ALL &rarr;
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-tight">Upper Body Hypertrophy</p>
                      <p className="text-[10px] text-slate-400">Target: Chest & Back • 45m</p>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                      07:30
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 flex justify-between items-center opacity-70">
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-tight">Zone 2 Recovery Walk</p>
                      <p className="text-[10px] text-slate-400">Step Target: 8,500 Steps</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg">
                      18:00
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Keep Insights Card */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Keep Insights</h3>
                  </div>
                  <button onClick={onOpenSync} className="text-[11px] font-mono text-amber-400 hover:underline">
                    EXPORT &rarr;
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-2xl p-3.5">
                    <p className="text-[9px] text-yellow-300/80 font-mono mb-1">RAG PROTOCOL SYNC</p>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      High-Protein Breakfast: Greek yogurt with chia seeds stabilizes ghrelin and delays appetite 4+ hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Integrated Interactive Dashboard AI Coach Console */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 backdrop-blur-2xl shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Interactive Personalized AI Engine</h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ask anything about your calories, workout schedule, food swaps, or sleep recovery.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenCoach()}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20 transition-all self-start sm:self-auto"
          >
            <span>Open Dedicated AI Coach</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Prompt Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 text-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Quick Ask:</span>
          </span>
          {[
            `How should I hit ${macros.proteinGrams}g protein today?`,
            `What is my optimal deficit for ${profile.goalWeightKg} kg target?`,
            `Give me a high-satiety evening snack under 150 kcal.`,
            `How to avoid weight loss plateaus?`,
          ].map((promptText, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleQuickDashboardAsk(promptText)}
              disabled={isAskingDashboardAi}
              className="px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-emerald-950/50 text-slate-300 hover:text-emerald-200 border border-white/5 whitespace-nowrap transition-all text-xs active:scale-95 disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="flex gap-2">
          <input
            id="input-dashboard-ai"
            type="text"
            placeholder="Type your health or nutrition question (e.g. 'Can I swap oats for eggs at breakfast?')..."
            value={dashboardPrompt}
            onChange={(e) => setDashboardPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickDashboardAsk()}
            disabled={isAskingDashboardAi}
            className="flex-1 bg-slate-950/90 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
          />
          <button
            id="btn-dashboard-ai-send"
            onClick={() => handleQuickDashboardAsk()}
            disabled={isAskingDashboardAi || !dashboardPrompt.trim()}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-slate-950 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-40 shrink-0"
          >
            {isAskingDashboardAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Ask AI</span>
          </button>
        </div>

        {/* Live Inline AI Response View */}
        {dashboardAiResponse && (
          <div className="bg-slate-950/90 border border-emerald-500/20 rounded-2xl p-5 space-y-3 mt-2 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
                  Personalized AI Response
                </span>
              </div>
              <button
                onClick={copyAiResponse}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/5"
              >
                {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="prose prose-invert prose-xs max-w-none text-slate-200 font-sans leading-relaxed">
              <ReactMarkdown>{dashboardAiResponse}</ReactMarkdown>
            </div>

            {/* Follow-up Prompts if returned */}
            {dashboardAiFollowUps.length > 0 && (
              <div className="pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Suggested Follow-ups:</span>
                {dashboardAiFollowUps.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickDashboardAsk(f)}
                    className="text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[11px] transition-all"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dual Interactive Banners: Health Check-In & Comprehensive AI Personalization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Clinical RAG Health Check-In */}
        <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950/60 border border-cyan-500/20 rounded-3xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-bold flex items-center gap-1">
                <Stethoscope className="w-3 h-3" />
                Clinical RAG Engine
              </span>
              <span className="text-[10px] text-slate-400 font-mono">20 Guidelines</span>
            </div>
            <h3 className="text-sm font-bold text-white">Personal Health Check-In</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Describe symptoms, sleep disruptions, or blood pressure concerns to receive instant evidence-backed guidance from NIH, WHO, ADA & AASM.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">Symptom triaging & BMI</span>
            <button
              id="btn-dashboard-open-checkin"
              onClick={onOpenCheckIn}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950/40 active:scale-95"
            >
              <span>Start Check-In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Comprehensive Multi-Agent Macro Plan */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950/60 border border-emerald-500/20 rounded-3xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Tailored AI Plan
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Multi-Agent</span>
            </div>
            <h3 className="text-sm font-bold text-white">Comprehensive Transformation Hub</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Generate custom meal recipes, equipment-matched workout splits, grocery checklists, and behavioral craving strategies.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">Full recipe & workout split</span>
            <button
              id="btn-dashboard-open-intake"
              onClick={onOpenIntake}
              className="bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95"
            >
              <span>Personalize My Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Nutrition Rings & Metabolic Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calorie & Macro Target Breakdown (8 columns) */}
        <div className="lg:col-span-8 bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">Daily Calorie & Macro Budget</h2>
                <p className="text-xs text-slate-400">Track logged meals against your metabolic targets</p>
              </div>
            </div>
            <button
              onClick={onOpenPlan}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
            >
              View Full Menu <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Calorie Progress Bar */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-3xl font-black tracking-tight text-white">{consumedCalories}</span>
                <span className="text-xs text-slate-400 ml-1.5 font-mono">/ {macros.calories} kcal consumed</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 font-mono">{remainingCalories} kcal remaining</span>
                <div className="text-[11px] text-slate-500 font-mono">TDEE Baseline: {macros.tdee} kcal</div>
              </div>
            </div>

            <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#10b981]"
                style={{ width: `${caloriePercentage}%` }}
              />
            </div>
          </div>

          {/* Macronutrient Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Protein */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  🥩 Protein (MPS)
                </span>
                <span className="text-slate-300 font-mono">{consumedProtein}/{macros.proteinGrams}g</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-300 shadow-[0_0_6px_#f43f5e]"
                  style={{ width: `${Math.min(100, (consumedProtein / macros.proteinGrams) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">High leucine for muscle preservation</p>
            </div>

            {/* Carbs */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  🌾 Complex Carbs
                </span>
                <span className="text-slate-300 font-mono">{consumedCarbs}/{macros.carbsGrams}g</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300 shadow-[0_0_6px_#f59e0b]"
                  style={{ width: `${Math.min(100, (consumedCarbs / (macros.carbsGrams || 1)) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">Glycogen storage & energy</p>
            </div>

            {/* Fats */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-teal-400 flex items-center gap-1.5">
                  🥑 Healthy Fats
                </span>
                <span className="text-slate-300 font-mono">{consumedFat}/{macros.fatGrams}g</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full transition-all duration-300 shadow-[0_0_6px_#2dd4bf]"
                  style={{ width: `${Math.min(100, (consumedFat / macros.fatGrams) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">Hormone & lipid balance</p>
            </div>
          </div>

          {/* Today's Meals Quick Check-off */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Today's Meals (Tap to mark eaten)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => onToggleMealLog(meal.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    meal.logged
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-slate-950/50 border-white/5 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {meal.logged ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate capitalize">{meal.type}: {meal.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {meal.calories} kcal • {meal.protein}g Protein
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-white/5 shrink-0">
                    {meal.satietyIndex.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Hydration & Weight Logger (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Hydration Tracker */}
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Hydration Kinetic Goal</h3>
                  <p className="text-[11px] text-slate-400">Enhances cellular lipolysis</p>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-400 font-mono">{waterLiters.toFixed(2)} / {profile.waterGoalLiters} L</span>
            </div>

            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-blue-400 rounded-full transition-all duration-300 shadow-[0_0_8px_#38bdf8]"
                style={{ width: `${Math.min(100, (waterLiters / profile.waterGoalLiters) * 100)}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-add-water-250"
                onClick={() => handleAddWater(0.25)}
                className="flex-1 py-2 px-3 bg-slate-950/60 hover:bg-slate-800 border border-white/5 rounded-xl text-xs font-semibold text-sky-300 transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> +250 mL
              </button>
              <button
                id="btn-add-water-500"
                onClick={() => handleAddWater(0.5)}
                className="flex-1 py-2 px-3 bg-slate-950/60 hover:bg-slate-800 border border-white/5 rounded-xl text-xs font-semibold text-sky-300 transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> +500 mL
              </button>
            </div>
            <p className="text-[11px] text-slate-500 italic text-center">
              Preloading 500 mL water 20m before meals increases lipolytic rate.
            </p>
          </div>

          {/* Quick Morning Weight Logger */}
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Log Morning Weight</h3>
                <p className="text-[11px] text-slate-400">Post-washroom, fasted baseline</p>
              </div>
            </div>

            <form onSubmit={handleWeightSubmit} className="flex gap-2">
              <input
                id="input-weight"
                type="number"
                step="0.1"
                placeholder={`e.g. ${profile.currentWeightKg}`}
                value={newWeightInput}
                onChange={(e) => setNewWeightInput(e.target.value)}
                className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                id="btn-log-weight"
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95"
              >
                Record
              </button>
            </form>

            {/* Recent Weight Log History */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recent Weigh-Ins</div>
              {weightLogs.slice(0, 3).map((log, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1.5 px-3 rounded-xl bg-slate-950/40 border border-white/5 font-mono">
                  <span className="text-slate-400">{log.date}</span>
                  <span className="font-bold text-white">{log.weightKg} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Duration & Circadian Recovery Section */}
      <SleepLogger
        profile={profile}
        sleepLogs={sleepLogs}
        onLogSleep={onLogSleep}
        onOpenCoach={onOpenCoach}
      />
    </div>
  );
};
