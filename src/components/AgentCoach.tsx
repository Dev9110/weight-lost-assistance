import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, MacroTargets, ChatMessage } from '../types';
import { Bot, Send, Sparkles, User, BookOpen, ChevronDown, ChevronUp, Camera, Check, RefreshCw, Zap, Cpu } from 'lucide-react';

interface AgentCoachProps {
  profile: UserProfile;
  macros: MacroTargets;
  messages: ChatMessage[];
  onSendMessage: (text: string, role?: string) => Promise<void>;
  isLoading: boolean;
  onOpenSync: () => void;
}

export const AgentCoach: React.FC<AgentCoachProps> = ({
  profile,
  macros,
  messages,
  onSendMessage,
  isLoading,
  onOpenSync,
}) => {
  const [inputText, setInputText] = useState('');
  const [activeRole, setActiveRole] = useState<'orchestrator' | 'nutritionist' | 'fitness' | 'behavioral'>('orchestrator');
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealDescription, setMealDescription] = useState('');
  const [mealAnalysisResult, setMealAnalysisResult] = useState<any>(null);
  const [isAnalyzingMeal, setIsAnalyzingMeal] = useState(false);
  const [expandedReasoningMap, setExpandedReasoningMap] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text, activeRole);
  };

  const handlePromptChipClick = (prompt: string) => {
    setInputText(prompt);
  };

  const toggleReasoning = (msgId: string) => {
    setExpandedReasoningMap((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
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
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingMeal(false);
    }
  };

  const agentDescriptions = {
    orchestrator: {
      name: 'Master Health Orchestrator',
      desc: 'Coordinates holistic health, deficit progression & multi-agent synthesis',
      icon: '👑',
    },
    nutritionist: {
      name: 'Clinical Nutritionist Agent',
      desc: 'Specializes in macronutrient splits, satiety index, recipes & Keep grocery lists',
      icon: '🥗',
    },
    fitness: {
      name: 'Exercise Physiologist Agent',
      desc: 'Designs progressive resistance training, Zone 2 cardio & Calendar scheduling',
      icon: '🏋️‍♂️',
    },
    behavioral: {
      name: 'Behavioral Psychologist Agent',
      desc: 'Guides habit stacking, emotional eating cognitive reframing & sleep optimization',
      icon: '🧠',
    },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Agent Coach Header & Persona Selector */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Multi-Agent Reasoning Core
              </span>
              <span className="text-xs text-slate-400 font-mono">Grounded in RAG Clinical Vector Corpus</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">AI Health Coaching Team</h1>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous reasoning agents citing peer-reviewed evidence for nutrition and training.
            </p>
          </div>

          {/* Quick Action: Meal Analyzer Modal Opener */}
          <button
            id="btn-open-meal-analyzer"
            onClick={() => setShowMealModal(true)}
            className="flex items-center gap-2 bg-slate-950/70 hover:bg-slate-800 border border-white/5 text-cyan-300 font-semibold px-4 py-2 rounded-2xl text-xs transition-all shadow-md self-start lg:self-auto active:scale-95"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Analyze Meal & Satiety</span>
          </button>
        </div>

        {/* Persona Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-5">
          {(['orchestrator', 'nutritionist', 'fitness', 'behavioral'] as const).map((role) => {
            const info = agentDescriptions[role];
            const isSelected = activeRole === role;
            return (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`p-3.5 rounded-2xl border text-left transition-all backdrop-blur-md ${
                  isSelected
                    ? 'bg-slate-850/90 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-950/50 border-white/5 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{info.icon}</span>
                  <span className="text-xs font-bold text-white truncate">{info.name.split(' ')[0]}</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{info.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl flex flex-col h-[580px] shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Chat Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const hasReasoning = msg.reasoningSteps && msg.reasoningSteps.length > 0;
            const isReasoningExpanded = expandedReasoningMap[msg.id] ?? false;

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-slate-950 flex items-center justify-center font-bold text-base shrink-0 shadow-lg shadow-emerald-950/40">
                    🤖
                  </div>
                )}

                <div className={`max-w-2xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Agentic Reasoning Accordion (For AI responses) */}
                  {!isUser && hasReasoning && (
                    <div className="bg-slate-950/80 border border-white/5 rounded-2xl overflow-hidden text-xs backdrop-blur-md">
                      <button
                        onClick={() => toggleReasoning(msg.id)}
                        className="w-full px-3.5 py-2.5 bg-slate-900/60 hover:bg-slate-850/80 flex items-center justify-between text-slate-300 transition-colors font-mono text-[10px]"
                      >
                        <span className="flex items-center gap-2 text-emerald-400">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>AGENTIC REASONING & RAG RETRIEVAL ({msg.reasoningSteps?.length} STEPS)</span>
                        </span>
                        {isReasoningExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {isReasoningExpanded && (
                        <div className="p-3.5 space-y-2.5 border-t border-white/5 bg-slate-950/90 font-mono">
                          {msg.reasoningSteps?.map((step, idx) => (
                            <div key={idx} className="border-l-2 border-emerald-500/60 pl-3 space-y-0.5">
                              <div className="font-bold text-[11px] text-emerald-300">{step.agentName}</div>
                              <div className="text-[11px] text-slate-400 font-sans">{step.thought}</div>
                              {step.ragSourcesUsed && (
                                <div className="text-[10px] text-cyan-400 flex items-center gap-1 pt-0.5">
                                  <BookOpen className="w-3 h-3" /> Sources: {step.ragSourcesUsed.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-3xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-tr-none shadow-md shadow-emerald-950/30'
                        : 'bg-slate-950/70 border border-white/5 text-slate-200 rounded-tl-none space-y-2.5 backdrop-blur-md'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Scientific RAG Citations */}
                    {!isUser && msg.ragCitations && msg.ragCitations.length > 0 && (
                      <div className="pt-2.5 border-t border-white/5 space-y-1.5 font-mono">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-emerald-400" /> Grounded Citations
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.ragCitations.map((c, i) => (
                            <span
                              key={i}
                              title={c.snippet}
                              className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900/90 text-emerald-300 border border-white/5 font-sans"
                            >
                              📚 {c.title} ({c.source})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 border border-white/5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-400 font-mono">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center animate-spin">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="bg-slate-950/70 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 animate-pulse text-[11px]">
                Multi-Agent pipeline is executing RAG vector search & reasoning...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Pre-made Prompt Chips */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          <span className="text-slate-400 font-bold uppercase text-[9px] font-mono shrink-0">Prompts:</span>
          {[
            'How to break a weight loss plateau?',
            'High-protein meal under 500 kcal',
            'How does sleep affect fat loss hormones?',
            'Best workout split for fat loss',
            'How to stop evening snacking cravings?',
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptChipClick(chip)}
              className="px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/5 whitespace-nowrap transition-all text-xs active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3.5 bg-slate-950/90 border-t border-white/5 flex gap-2">
          <input
            id="input-agent-chat"
            type="text"
            placeholder={`Ask your ${agentDescriptions[activeRole].name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
          />
          <button
            id="btn-send-agent"
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-5 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Meal Photo / Description Analyzer Modal */}
      {showMealModal && (
        <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Gemini AI Meal & Satiety Analyzer</h3>
              </div>
              <button
                onClick={() => setShowMealModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
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
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/5 space-y-3.5">
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
