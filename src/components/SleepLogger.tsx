import React, { useState } from 'react';
import { Moon, Sparkles, BedDouble, AlertCircle, CheckCircle2, ChevronRight, Clock, BatteryCharging, Flame, ShieldAlert } from 'lucide-react';
import { UserProfile, SleepLogEntry } from '../types';
import confetti from 'canvas-confetti';

interface SleepLoggerProps {
  profile: UserProfile;
  sleepLogs: SleepLogEntry[];
  onLogSleep: (log: Omit<SleepLogEntry, 'id'>) => Promise<void>;
  onOpenCoach?: (prompt?: string) => void;
}

export const SleepLogger: React.FC<SleepLoggerProps> = ({
  profile,
  sleepLogs,
  onLogSleep,
  onOpenCoach,
}) => {
  const targetHours = profile.sleepTargetHours || profile.sleepHoursPerNight || 8.0;

  // Most recent log
  const latestLog = sleepLogs.length > 0 ? sleepLogs[0] : null;

  // Form State
  const [durationHours, setDurationHours] = useState<number>(latestLog?.durationHours || 7.5);
  const [quality, setQuality] = useState<'poor' | 'fair' | 'good' | 'deep'>(latestLog?.quality || 'good');
  const [bedTime, setBedTime] = useState<string>(latestLog?.bedTime || '23:00');
  const [wakeTime, setWakeTime] = useState<string>(latestLog?.wakeTime || '07:00');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAdvice, setActiveAdvice] = useState<{
    summary?: string;
    hormonalImpact?: string;
    actionableHygieneTips?: string[];
    appetiteCompensationAdvice?: string;
    ragCitation?: string;
  } | null>(null);

  // Quick preset hours
  const hourPresets = [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newEntry: Omit<SleepLogEntry, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      durationHours,
      quality,
      bedTime,
      wakeTime,
      notes,
    };

    try {
      // 1. Fetch AI Sleep Hygiene advice
      const res = await fetch('/api/agent/sleep-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sleepLog: newEntry,
          profile,
          recentLogs: sleepLogs.slice(0, 5),
        }),
      });
      const adviceData = await res.json();
      setActiveAdvice(adviceData);

      // 2. Save log with AI Advice
      await onLogSleep({
        ...newEntry,
        aiSleepAdvice: adviceData.summary,
      });

      if (durationHours >= targetHours) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error('Failed to log sleep advice:', err);
      await onLogSleep(newEntry);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine sleep adequacy status
  const sleepPercentage = Math.min(100, Math.round((durationHours / targetHours) * 100));
  const isDeficit = durationHours < 7.0;

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Sleep Duration & Circadian Recovery</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                AI HYGIENE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct hormonal impact on Ghrelin (hunger), Leptin (satiety) & Muscle Sparing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
          <span className="text-slate-400">Target:</span>
          <span className="text-indigo-300 font-bold">{targetHours}h / night</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Logging Form */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hours Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Duration Slept Last Night
                </label>
                <span className="text-sm font-black font-mono text-indigo-400">
                  {durationHours} Hours
                </span>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                {hourPresets.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDurationHours(h)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                      durationHours === h
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-bold shadow-md shadow-indigo-950/40'
                        : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-white/5'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>

              {/* Slider */}
              <input
                id="input-sleep-slider"
                type="range"
                min="4.0"
                max="12.0"
                step="0.25"
                value={durationHours}
                onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>4h (Severe Deficit)</span>
                <span>7.5h - 8.5h (Optimal Recovery)</span>
                <span>12h (Extended)</span>
              </div>
            </div>

            {/* Quality Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Restorative Sleep Quality
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'poor', label: 'Restless / Poor', icon: '⚡', desc: 'Frequent waking' },
                  { key: 'fair', label: 'Fair / Light', icon: '🌙', desc: 'Slight fatigue' },
                  { key: 'good', label: 'Good / Solid', icon: '✨', desc: 'Well rested' },
                  { key: 'deep', label: 'Deep / Optimal', icon: '🔋', desc: 'Peak recovery' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setQuality(item.key as any)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      quality === item.key
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                        : 'bg-slate-950/50 border-white/5 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-base mb-1">{item.icon}</div>
                    <div className="text-xs font-bold truncate">{item.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Times & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Bedtime</label>
                <input
                  id="input-sleep-bedtime"
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Wake Time</label>
                <input
                  id="input-sleep-waketime"
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <button
              id="btn-log-sleep-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-950/50 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Consulting Sleep Physiology Agent...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Log Sleep Duration & Generate AI Hygiene Protocol</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Sleep Dial & Recent History */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Visual Dial / Score Card */}
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">Circadian Recovery Index</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                durationHours >= 7.5
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : durationHours >= 6.5
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {durationHours >= 7.5 ? 'OPTIMAL ANABOLIC' : durationHours >= 6.5 ? 'MILD RESTRICTION' : 'GHRELIN SPIKE RISK'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50 mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                  durationHours >= 7.5
                    ? 'bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400'
                    : durationHours >= 6.5
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-rose-600 to-orange-500'
                }`}
                style={{ width: `${sleepPercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>{durationHours}h recorded</span>
              <span>{sleepPercentage}% of {targetHours}h goal</span>
            </div>

            {isDeficit && (
              <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>
                  Sleeping under 7 hours can elevate daytime ghrelin by ~15% and increase snack cravings. See agent tips below!
                </span>
              </div>
            )}
          </div>

          {/* Mini 7-Day Sleep Log Trend */}
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Sleep Logs</h4>
            <div className="space-y-2">
              {sleepLogs.slice(0, 4).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="font-mono text-slate-300">{entry.date}</span>
                    <span className="text-[10px] text-slate-500 capitalize">({entry.quality})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-white">{entry.durationHours} hrs</span>
                    {entry.durationHours >= targetHours ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-amber-400">-{ (targetHours - entry.durationHours).toFixed(1) }h</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Sleep Hygiene & Metabolic Advice Result Card */}
      {activeAdvice && (
        <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-purple-950/70 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <h4 className="font-bold text-white text-sm">Behavioral Agent Sleep Hygiene Prescription</h4>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              RAG EVIDENCE-GROUNDED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left: Summary & Hormonal Impact */}
            <div className="space-y-2.5">
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px] block font-bold">Assessment</span>
                <p className="text-slate-200 mt-0.5 leading-relaxed font-sans">{activeAdvice.summary}</p>
              </div>

              {activeAdvice.hormonalImpact && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
                  <span className="text-amber-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> Hormonal & Appetite Dynamics
                  </span>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">{activeAdvice.hormonalImpact}</p>
                </div>
              )}

              {activeAdvice.appetiteCompensationAdvice && (
                <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20">
                  <span className="text-emerald-300 font-mono text-[10px] uppercase font-bold">
                    🥗 Dietary Countermeasure
                  </span>
                  <p className="text-emerald-100/90 text-[11px] mt-1 leading-relaxed">
                    {activeAdvice.appetiteCompensationAdvice}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Actionable Hygiene Tips & Citation */}
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px] block font-bold mb-1.5">
                  Tonight's Sleep Hygiene Protocol
                </span>
                <ul className="space-y-1.5">
                  {(activeAdvice.actionableHygieneTips || []).map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-white/5 text-slate-200 text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {activeAdvice.ragCitation && (
                <div className="text-[10px] font-mono text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-white/5">
                  📚 {activeAdvice.ragCitation}
                </div>
              )}

              {onOpenCoach && (
                <button
                  onClick={() => onOpenCoach(`I logged ${durationHours} hours of ${quality} sleep. Can you create a tailored wind-down evening routine and adjust my meal timing today?`)}
                  className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <span>Chat with Behavioral Coach on Sleep Protocol</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
