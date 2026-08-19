import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, MacroTargets, ChatMessage } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  User,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Camera,
  Check,
  RefreshCw,
  Zap,
  Cpu,
  Copy,
  Calendar,
  Heart,
  Stethoscope,
  Activity,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';

interface AgentCoachProps {
  profile: UserProfile;
  macros: MacroTargets;
  messages: ChatMessage[];
  onSendMessage: (text: string, role?: string) => Promise<void>;
  isLoading: boolean;
  onOpenSync: () => void;
  onOpenIntake?: () => void;
}

export const AgentCoach: React.FC<AgentCoachProps> = ({
  profile,
  macros,
  messages,
  onSendMessage,
  isLoading,
  onOpenSync,
  onOpenIntake,
}) => {
  const [inputText, setInputText] = useState('');
  const [activeRole, setActiveRole] = useState<'orchestrator' | 'nutritionist' | 'fitness' | 'behavioral' | 'doctor'>('orchestrator');
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealDescription, setMealDescription] = useState('');
  const [mealAnalysisResult, setMealAnalysisResult] = useState<any>(null);
  const [isAnalyzingMeal, setIsAnalyzingMeal] = useState(false);
  const [expandedReasoningMap, setExpandedReasoningMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;
    setInputText('');
    await onSendMessage(textToSend, activeRole);
  };

  const handlePromptChipClick = (prompt: string) => {
    handleSend(undefined, prompt);
  };

  const toggleReasoning = (msgId: string) => {
    setExpandedReasoningMap((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => {
      const next = !prev[stepKey];
      if (next) {
        confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
      }
      return { ...prev, [stepKey]: next };
    });
  };

  const handleAnalyzeMeal = async () => {
    if (!mealDescription.trim()) return;
    setIsAnalyzingMeal(true);
    try {
      const res = await fetch('/api/agent/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: mealDescription }),
      });
      const data = await res.json();
      setMealAnalysisResult(data);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingMeal(false);
    }
  };

  const agentDescriptions = {
    orchestrator: {
      name: 'Master Health Orchestrator',
      desc: 'Holistic synthesis of caloric deficit, weekly progression & multi-agent balance',
      icon: '👑',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    nutritionist: {
      name: 'Clinical Nutritionist Agent',
      desc: 'Specializes in protein leverage, satiety index, glycemic load & meal adjustments',
      icon: '🥗',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    fitness: {
      name: 'Exercise Physiologist Agent',
      desc: 'Progressive resistance training, NEAT elevation, hypertrophy & muscle sparing',
      icon: '🏋️‍♂️',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    behavioral: {
      name: 'Behavioral Psychologist Agent',
      desc: 'Habit loop architecture, emotional craving reframing & circadian sleep optimization',
      icon: '🧠',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    doctor: {
      name: 'Clinical Health Specialist',
      desc: 'Blood pressure sensations, metabolic syndrome markers & clinical triage',
      icon: '🩺',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  };

  const contextualPrompts = [
    `How should I adjust my ${profile.dietPreference.replace('_', ' ')} meals to hit ${macros.proteinGrams}g protein?`,
    `My current weight is ${profile.currentWeightKg}kg. How do we reach ${profile.goalWeightKg}kg by week ${Math.ceil((profile.currentWeightKg - profile.goalWeightKg) / (profile.targetLossPaceKgPerWeek || 0.5))}?`,
    `What are low-calorie satiety hacks for evening sugar cravings?`,
    `How does sleeping ${profile.sleepHoursPerNight || 7}h affect my ghrelin and fat loss?`,
    `Give me a 3-day workout split using my available equipment.`,
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Agent Coach Header & Persona Selector */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-2xl shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Interactive LLM Coaching Core
              </span>
              <span className="text-xs text-slate-400 font-mono">Grounded in 20 Clinical Guidelines</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">AI Health Coaching Team</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Interactive multi-agent specialists responding in real time to your specific profile criteria and questions.
            </p>
          </div>

          {/* Quick Action: Meal Analyzer Modal Opener */}
          <div className="flex items-center gap-2">
            <button
              id="btn-open-meal-analyzer"
              onClick={() => setShowMealModal(true)}
              className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold px-4 py-2.5 rounded-2xl text-xs transition-all shadow-md self-start lg:self-auto active:scale-95"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Analyze Food / Meal</span>
            </button>
            {onOpenIntake && (
              <button
                onClick={onOpenIntake}
                className="flex items-center gap-2 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-bold px-4 py-2.5 rounded-2xl text-xs transition-all active:scale-95"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Adjust Criteria</span>
              </button>
            )}
          </div>
        </div>

        {/* Live User Criteria Context Bar */}
        <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400">
              User: <strong className="text-white font-sans">{profile.name}</strong> ({profile.age}yo, {profile.gender})
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              Vitals: <strong className="text-emerald-400">{profile.currentWeightKg} kg</strong> → <strong className="text-cyan-400">{profile.goalWeightKg} kg</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              Target: <strong className="text-amber-300">{macros.calories} kcal</strong> (-{macros.deficit} deficit)
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              Protein: <strong className="text-emerald-300">{macros.proteinGrams}g</strong>
            </span>
          </div>

          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {profile.dietPreference.replace('_', ' ')}
          </span>
        </div>

        {/* Persona Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {(Object.keys(agentDescriptions) as Array<keyof typeof agentDescriptions>).map((roleKey) => {
            const role = agentDescriptions[roleKey];
            const isSelected = activeRole === roleKey;
            return (
              <button
                key={roleKey}
                onClick={() => setActiveRole(roleKey)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{role.icon}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
                <div>
                  <div className="font-bold text-xs leading-tight">{role.name.replace(' Agent', '')}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{role.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Chat Stream */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        {/* Chat Feed Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-base">{agentDescriptions[activeRole].icon}</span>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {agentDescriptions[activeRole].name}
              </h3>
              <p className="text-[11px] text-slate-400">{agentDescriptions[activeRole].desc}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            GEMINI-3.7-FLASH
          </span>
        </div>

        {/* Message Bubble Feed */}
        <div className="p-4 sm:p-6 flex-1 space-y-6 overflow-y-auto max-h-[560px]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div className={`space-y-3 max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble Card */}
                  <div
                    className={`rounded-3xl p-5 shadow-xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-slate-950 font-medium rounded-tr-none shadow-emerald-950/40'
                        : 'bg-slate-950/90 border border-white/10 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                            {msg.role ? agentDescriptions[msg.role as keyof typeof agentDescriptions]?.name || 'Coach' : 'Vita AI Coach'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Formatted Content */}
                    <div className="prose prose-invert prose-xs max-w-none text-slate-100 font-sans space-y-2 leading-relaxed">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>

                    {/* Agent Multi-Step Reasoning Trace Drawer */}
                    {!isUser && msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <button
                          onClick={() => toggleReasoning(msg.id)}
                          className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-400 hover:text-emerald-300 font-bold"
                        >
                          <Cpu className="w-3 h-3" />
                          <span>
                            {expandedReasoningMap[msg.id]
                              ? 'Hide Agentic Thought Trace'
                              : `View Agentic Reasoning (${msg.reasoningSteps.length} Steps)`}
                          </span>
                          {expandedReasoningMap[msg.id] ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {expandedReasoningMap[msg.id] && (
                          <div className="mt-2.5 space-y-2 bg-slate-900/90 rounded-2xl p-3.5 border border-white/5">
                            {msg.reasoningSteps.map((step, sIdx) => (
                              <div key={sIdx} className="space-y-0.5">
                                <div className="text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  <span>{step.agentName}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 pl-3 leading-relaxed font-sans">{step.thought}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Grounded RAG Citations */}
                    {!isUser && msg.ragCitations && msg.ragCitations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Grounded In:</span>
                        {msg.ragCitations.map((cit, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/20"
                            title={cit.snippet}
                          >
                            {cit.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-400 font-mono animate-fade-in">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center animate-spin">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="bg-slate-950/80 px-4 py-3 rounded-2xl rounded-tl-none border border-white/10 animate-pulse text-[11px] text-slate-300">
                Synthesizing user input criteria & executing Gemini RAG reasoning...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Contextual High-Yield Prompt Suggestions */}
        <div className="px-4 py-3 bg-slate-950/90 border-t border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-slate-400 font-bold uppercase text-[9px] font-mono shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Suggested:</span>
          </span>
          {contextualPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptChipClick(chip)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-200 border border-white/5 whitespace-nowrap transition-all text-xs active:scale-95 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3.5 sm:p-4 bg-slate-950 border-t border-white/5 flex gap-2">
          <input
            id="input-agent-chat"
            type="text"
            placeholder={`Ask ${agentDescriptions[activeRole].name} about your criteria, meals, workouts...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-900/90 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
          />
          <button
            id="btn-send-agent"
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-5 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Meal Photo / Description Analyzer Modal */}
      {showMealModal && (
        <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Gemini AI Meal & Satiety Analyzer</h3>
              </div>
              <button
                onClick={() => setShowMealModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Describe your meal or snack to calculate estimated calories, macros, and hunger-suppression rating.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Grilled chicken breast (200g) with 1 cup steamed broccoli, 1/2 sweet potato, and 1 tbsp olive oil dressing"
              value={mealDescription}
              onChange={(e) => setMealDescription(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
            />

            <button
              onClick={handleAnalyzeMeal}
              disabled={isAnalyzingMeal || !mealDescription.trim()}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isAnalyzingMeal ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-300" />}
              <span>{isAnalyzingMeal ? 'Analyzing Nutritional Values...' : 'Analyze Nutritional Breakdown'}</span>
            </button>

            {mealAnalysisResult && (
              <div className="bg-slate-950/90 p-5 rounded-2xl border border-white/5 space-y-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{mealAnalysisResult.mealName}</h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 uppercase border border-emerald-500/20">
                      {mealAnalysisResult.satietyRating} Satiety Rating
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-300 font-mono">{mealAnalysisResult.estimatedCalories} kcal</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-900/90 p-2 rounded-xl border border-white/5">
                    <div className="text-[9px] text-slate-400 uppercase">Protein</div>
                    <div className="font-bold text-rose-400">{mealAnalysisResult.protein}g</div>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-xl border border-white/5">
                    <div className="text-[9px] text-slate-400 uppercase">Carbs</div>
                    <div className="font-bold text-amber-400">{mealAnalysisResult.carbs}g</div>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-xl border border-white/5">
                    <div className="text-[9px] text-slate-400 uppercase">Fat</div>
                    <div className="font-bold text-teal-400">{mealAnalysisResult.fat}g</div>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-xl border border-white/5">
                    <div className="text-[9px] text-slate-400 uppercase">Fiber</div>
                    <div className="font-bold text-emerald-400">{mealAnalysisResult.fiber || 5}g</div>
                  </div>
                </div>

                {mealAnalysisResult.feedback && (
                  <div className="space-y-1 text-xs text-slate-300 font-sans">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Coach Feedback:</div>
                    {mealAnalysisResult.feedback.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px]">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
