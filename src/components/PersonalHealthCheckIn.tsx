import React, { useState } from 'react';
import {
  UserProfile,
  PersonalHealthCheckInInput,
  PersonalizedGuidanceResult,
  ClinicalRAGGuideline,
  CheckInPromptQAPair,
} from '../types';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Activity,
  Moon,
  ExternalLink,
  BookOpen,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Stethoscope,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Copy,
  Check,
  Zap,
  HelpCircle,
  Bookmark,
  FileText,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PersonalHealthCheckInProps {
  currentProfile?: UserProfile;
  onApplyProfileChanges?: (changes: Partial<UserProfile>) => void;
  onOpenCoachWithContext?: (prompt: string) => void;
  onOpenSyncHub?: () => void;
}

export const PersonalHealthCheckIn: React.FC<PersonalHealthCheckInProps> = ({
  currentProfile,
  onApplyProfileChanges,
  onOpenCoachWithContext,
  onOpenSyncHub,
}) => {
  // Input form state matching the reference layout
  const [formData, setFormData] = useState<PersonalHealthCheckInInput>({
    age: currentProfile?.age || 30,
    sex: (currentProfile?.gender as any) || 'female',
    height: currentProfile?.heightCm || 170,
    heightUnit: 'cm',
    weight: currentProfile?.currentWeightKg || 70,
    weightUnit: 'kg',
    lifestylePreferences: ['Low-sodium', 'Shift worker'],
    symptomsNarrative: 'Recently I have 3 weeks of insomnia, and high blood pressure or feeling dizzy and tired entire day.',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [guidanceResult, setGuidanceResult] = useState<PersonalizedGuidanceResult | null>(null);
  const [expandedGuidelineId, setExpandedGuidelineId] = useState<string | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);

  // Interactive Prompt & Response Follow-Up State
  const [followUpPromptInput, setFollowUpPromptInput] = useState('');
  const [isAnsweringFollowUp, setIsAnsweringFollowUp] = useState(false);
  const [promptQAList, setPromptQAList] = useState<CheckInPromptQAPair[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTabPromptView, setActiveTabPromptView] = useState<'clinical_report' | 'prompt_qa' | 'all_guidelines'>('clinical_report');

  const defaultPreferenceOptions = [
    'Vegetarian',
    'Vegan',
    'Low-sodium',
    'Halal',
    'No gym access',
    'Shift worker',
    'Low-carb',
    'Keto',
    'Gluten-free',
    'Intermittent fasting',
  ];

  const highYieldPromptSuggestions = [
    'How should I adjust my diet & sodium intake if my blood pressure feels elevated?',
    'What evidence-based CBT-I techniques can I start tonight for sleep onset insomnia?',
    'How much protein do I need per meal to preserve lean muscle and suppress ghrelin?',
    'Is 16:8 intermittent fasting safe with my current BMI & routine?',
    'What should I eat when late-night stress cravings hit without spiking insulin?',
  ];

  const togglePreference = (pref: string) => {
    setFormData((prev) => {
      const exists = prev.lifestylePreferences.includes(pref);
      return {
        ...prev,
        lifestylePreferences: exists
          ? prev.lifestylePreferences.filter((p) => p !== pref)
          : [...prev.lifestylePreferences, pref],
      };
    });
  };

  const handleAddCustomPreference = () => {
    if (!customTagInput.trim()) return;
    if (!formData.lifestylePreferences.includes(customTagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        lifestylePreferences: [...prev.lifestylePreferences, customTagInput.trim()],
      }));
    }
    setCustomTagInput('');
    setShowCustomTagInput(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/rag/personalized-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to generate personalized guidance');
      }

      const data = await res.json();
      setGuidanceResult(data);
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error('Personalized check-in submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskFollowUpPrompt = async (promptText?: string) => {
    const questionToAsk = promptText || followUpPromptInput;
    if (!questionToAsk.trim() || isAnsweringFollowUp) return;

    setIsAnsweringFollowUp(true);
    if (!promptText) setFollowUpPromptInput('');

    try {
      const res = await fetch('/api/rag/checkin-prompt-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionToAsk,
          bmi: guidanceResult?.bmiAssessment?.bmi,
          lifestylePreferences: formData.lifestylePreferences,
          symptomsNarrative: formData.symptomsNarrative,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to answer prompt');
      }

      const qaData: CheckInPromptQAPair = await res.json();
      setPromptQAList((prev) => [qaData, ...prev]);
      setActiveTabPromptView('prompt_qa');
    } catch (err) {
      console.error('Follow-up prompt error:', err);
    } finally {
      setIsAnsweringFollowUp(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleApplyToHealthProfile = () => {
    if (!onApplyProfileChanges) return;

    const parsedHeight = parseFloat(String(formData.height)) || 170;
    const heightCm = formData.heightUnit === 'in' ? parsedHeight * 2.54 : parsedHeight;
    const parsedWeight = parseFloat(String(formData.weight)) || 70;
    const currentWeightKg = formData.weightUnit === 'lbs' ? parsedWeight * 0.45359237 : parsedWeight;

    onApplyProfileChanges({
      age: parseInt(String(formData.age), 10) || 30,
      gender: formData.sex === 'female' || formData.sex === 'male' ? formData.sex : 'other',
      heightCm: Math.round(heightCm),
      currentWeightKg: parseFloat(currentWeightKg.toFixed(1)),
      allergies: formData.lifestylePreferences,
      specialNotes: formData.symptomsNarrative,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-1.5 pt-2 pb-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase tracking-widest font-bold">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Clinical RAG Triage & Prompt Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Personal Health Check-In
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Tell us about your symptoms, routine, and questions to receive instant evidence-backed clinical responses
        </p>
      </div>

      {/* Main Check-In Form Card (Matching Reference Layout) */}
      <div className="max-w-2xl mx-auto bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
        {/* Step Indicator Header */}
        <div className="flex items-start gap-3 pb-2 border-b border-white/5">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Personal Health Check-In
            </h2>
            <p className="text-xs text-slate-400">
              Fill in your vitals and describe how you've been feeling to generate clinical RAG triage
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Age & Sex */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="10"
                max="110"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 32"
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Sex assigned at birth
              </label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="intersex">Intersex</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Row 2: Height with Unit Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Height
            </label>
            <div className="flex rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 focus-within:border-emerald-500 transition-colors">
              <input
                type="number"
                step="0.1"
                min="50"
                max="260"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder={formData.heightUnit === 'cm' ? '170' : '67'}
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none"
                required
              />
              <div className="flex bg-slate-900 border-l border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, heightUnit: 'cm' })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    formData.heightUnit === 'cm'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, heightUnit: 'in' })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    formData.heightUnit === 'in'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  in
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Weight with Unit Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Weight
            </label>
            <div className="flex rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 focus-within:border-emerald-500 transition-colors">
              <input
                type="number"
                step="0.1"
                min="20"
                max="400"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder={formData.weightUnit === 'kg' ? '70' : '154'}
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none"
                required
              />
              <div className="flex bg-slate-900 border-l border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weightUnit: 'kg' })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    formData.weightUnit === 'kg'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weightUnit: 'lbs' })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    formData.weightUnit === 'lbs'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  lbs
                </button>
              </div>
            </div>
          </div>

          {/* Row 4: Lifestyle & Dietary Preferences Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Lifestyle & Dietary Preferences
              </label>
              <span className="text-[11px] text-slate-500">
                {formData.lifestylePreferences.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {defaultPreferenceOptions.map((opt) => {
                const isSelected = formData.lifestylePreferences.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => togglePreference(opt)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                        : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    <span>{opt}</span>
                  </button>
                );
              })}

              {formData.lifestylePreferences
                .filter((p) => !defaultPreferenceOptions.includes(p))
                .map((custom) => (
                  <button
                    key={custom}
                    type="button"
                    onClick={() => togglePreference(custom)}
                    className="text-xs px-3 py-1.5 rounded-full border bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span>{custom}</span>
                  </button>
                ))}

              {showCustomTagInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    placeholder="e.g. Pescatarian"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomPreference();
                      }
                    }}
                    className="bg-slate-950 border border-emerald-500/50 rounded-full px-3 py-1 text-xs text-white focus:outline-none w-32"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPreference}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold px-2"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomTagInput(true)}
                  className="text-xs px-3 py-1.5 rounded-full border border-dashed border-white/20 text-slate-400 hover:text-white hover:border-emerald-500/50 transition-colors"
                >
                  + Custom Tag
                </button>
              )}
            </div>
          </div>

          {/* Row 5: Symptoms Narrative Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              How have you been feeling lately? (User Prompt & Symptoms)
            </label>
            <p className="text-[11px] text-slate-400 leading-normal">
              Describe symptoms, energy levels, sleep disruptions, blood pressure sensations, or questions you have.
            </p>
            <textarea
              rows={4}
              value={formData.symptomsNarrative}
              onChange={(e) => setFormData({ ...formData, symptomsNarrative: e.target.value })}
              placeholder="e.g., Recently I have 3 weeks of insomnia, high blood pressure or feeling dizzy and tired entire day. I want advice on how to improve."
              className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
            />

            {/* Quick Sample Prompts */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Sample Prompts:</span>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    symptomsNarrative:
                      'Recently I have 3 weeks of insomnia, high blood pressure or feeling dizzy and tired entire day.',
                  })
                }
                className="text-[11px] text-emerald-400/80 hover:text-emerald-300 underline font-sans"
              >
                Insomnia & BP concern
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    symptomsNarrative:
                      'Intense evening sugar cravings after dinner, brain fog around 3 PM, and trouble waking up early.',
                  })
                }
                className="text-[11px] text-emerald-400/80 hover:text-emerald-300 underline font-sans"
              >
                Cravings & 3 PM crash
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    symptomsNarrative:
                      'Joint stiffness in knees when running, sedentary desk job for 9 hours, seeking low-impact calorie burn.',
                  })
                }
                className="text-[11px] text-emerald-400/80 hover:text-emerald-300 underline font-sans"
              >
                Sedentary & joint fatigue
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              id="btn-submit-health-checkin"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>Cross-Referencing 20 Clinical Guidelines...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Analyze Symptoms & Generate Clinical Guidance</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* STEP 2: Response & Prompt Insights Section */}
      {guidanceResult && (
        <div className="max-w-4xl mx-auto space-y-6 pt-4 animate-fade-in">
          {/* Sub-Navigation Tabs for Prompt Response & Clinical Results */}
          <div className="flex items-center justify-center">
            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <button
                id="tab-view-clinical-report"
                onClick={() => setActiveTabPromptView('clinical_report')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTabPromptView === 'clinical_report'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Clinical Triage & Plan</span>
              </button>

              <button
                id="tab-view-prompt-qa"
                onClick={() => setActiveTabPromptView('prompt_qa')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTabPromptView === 'prompt_qa'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Prompt Responses & Follow-Up Q&A ({promptQAList.length})</span>
              </button>

              <button
                id="tab-view-all-guidelines"
                onClick={() => setActiveTabPromptView('all_guidelines')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTabPromptView === 'all_guidelines'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Evidence Guidelines ({guidanceResult.matchedGuidelines.length})</span>
              </button>
            </div>
          </div>

          {/* TOP CARD: USER PROMPT & CLINICAL INTENT BREAKDOWN */}
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-2xl shadow-2xl space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                    User Prompt & Intent Analysis
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Parsed Biomarkers & Clinical Objectives
                  </h3>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/5 self-start sm:self-auto">
                {formData.age}yo • {formData.sex} • BMI {guidanceResult.bmiAssessment?.bmi}
              </span>
            </div>

            {/* User Submitted Prompt Quote */}
            <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-cyan-400" />
                <span>Your Submitted Symptoms & Notes:</span>
              </div>
              <p className="text-xs text-slate-200 italic font-sans leading-relaxed">
                "{formData.symptomsNarrative || 'General wellness & metabolic review.'}"
              </p>
            </div>

            {/* Extracted Intent Pillars */}
            {guidanceResult.promptIntentAnalysis && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                    Primary Concern
                  </span>
                  <p className="text-xs font-semibold text-white">
                    {guidanceResult.promptIntentAnalysis.primaryConcern}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                    Target Physiological Goal
                  </span>
                  <p className="text-xs text-slate-200">
                    {guidanceResult.promptIntentAnalysis.physiologicalGoal}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                    Identified Stressors
                  </span>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {guidanceResult.promptIntentAnalysis.identifiedStressors.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-900 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: CLINICAL TRIAGE & PLAN */}
          {activeTabPromptView === 'clinical_report' && (
            <div className="space-y-6 animate-fade-in">
              {/* DIRECT AI CLINICAL DOCTOR & COACH RESPONSE */}
              {guidanceResult.directPromptResponse && (
                <div className="bg-slate-900/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Direct Clinical Doctor & Coach Response</h4>
                        <p className="text-[11px] text-slate-400">Synthesized using NIH, WHO, ADA & AASM clinical protocols</p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleCopyText(guidanceResult.directPromptResponse || '', 'direct-clinical-response')
                      }
                      className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-all"
                    >
                      {copiedId === 'direct-clinical-response' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Response</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 font-sans">
                    <p className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/20">
                      {guidanceResult.directPromptResponse}
                    </p>
                  </div>
                </div>
              )}

              {/* Executive Overview & BMI Card */}
              <div className="bg-slate-900/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Clinical Synthesis Ready
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Grounded in {guidanceResult.matchedGuidelines.length} Authoritative Guidelines
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Personalized Clinical & Lifestyle Evaluation
                    </h3>
                  </div>

                  {/* BMI Assessment Badge */}
                  {guidanceResult.bmiAssessment && (
                    <div className="flex items-center gap-3 bg-slate-950/80 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono font-semibold">
                          Calculated BMI
                        </div>
                        <div className="text-base font-black text-emerald-400">
                          {guidanceResult.bmiAssessment.bmi}
                        </div>
                      </div>
                      <div className="w-px h-7 bg-slate-800" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono font-semibold">
                          Status
                        </div>
                        <div className="text-xs font-bold text-white">
                          {guidanceResult.bmiAssessment.category}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Executive Summary */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {guidanceResult.executiveSummary}
                </p>

                {/* Waist Circumference Warning Notice if applicable */}
                {guidanceResult.bmiAssessment?.waistWarning && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <span className="font-bold text-amber-300">Cardiometabolic Risk Marker:</span>{' '}
                      {guidanceResult.bmiAssessment.waistWarning}
                    </p>
                  </div>
                )}

                {/* Symptom Triaging & Red Flag Alert Box */}
                <div
                  className={`p-5 rounded-2xl border space-y-3 ${
                    guidanceResult.symptomTriaging.urgencyLevel === 'high_consult_physician'
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : guidanceResult.symptomTriaging.urgencyLevel === 'moderate'
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-sm text-white">Symptom Triaging & Red Flag Monitoring</h4>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-300">
                    {guidanceResult.symptomTriaging.analysis}
                  </p>

                  {guidanceResult.symptomTriaging.whenToSeekCareAlerts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                        When to Seek Healthcare Consultation:
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {guidanceResult.symptomTriaging.whenToSeekCareAlerts.map((alert, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{alert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Evidence-Based Protocols Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Nutrition Actions */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Heart className="w-4 h-4" />
                      <h5 className="font-bold text-xs text-white">Nutrition Targets</h5>
                    </div>
                    <ul className="space-y-2 text-[11px] text-slate-300">
                      {guidanceResult.evidenceBasedPlan.nutritionRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Physical Activity */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-2.5">
                    <div className="flex items-center gap-2 text-teal-400">
                      <Activity className="w-4 h-4" />
                      <h5 className="font-bold text-xs text-white">Physical Activity</h5>
                    </div>
                    <ul className="space-y-2 text-[11px] text-slate-300">
                      {guidanceResult.evidenceBasedPlan.physicalActivityRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sleep & Behavioral */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-2.5">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Moon className="w-4 h-4" />
                      <h5 className="font-bold text-xs text-white">Sleep & Behavior</h5>
                    </div>
                    <ul className="space-y-2 text-[11px] text-slate-300">
                      {guidanceResult.evidenceBasedPlan.sleepAndBehavioralAdvice.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Medical Disclaimer Callout */}
                <div className="text-[10px] text-slate-400 bg-slate-950/60 p-3.5 rounded-2xl border border-white/5 font-sans leading-relaxed">
                  <span className="font-bold text-slate-300">Medical Disclaimer:</span>{' '}
                  {guidanceResult.medicalDisclaimer}
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    id="btn-apply-checkin-profile"
                    onClick={handleApplyToHealthProfile}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    <span>Apply Values to My Profile</span>
                  </button>

                  <button
                    onClick={() => setActiveTabPromptView('prompt_qa')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                    <span>Ask Follow-Up Prompt to RAG Engine</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE PROMPT RESPONSES & LIVE Q&A */}
          {activeTabPromptView === 'prompt_qa' && (
            <div className="space-y-6 animate-fade-in">
              {/* Interactive Follow-Up Prompt Console */}
              <div className="bg-slate-900/70 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Ask Follow-Up Questions on Your Health Check-In</h3>
                      <p className="text-xs text-slate-400">
                        Query the 20 Clinical Guidelines with your BMI, symptoms, and lifestyle context
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 font-bold">
                    DUAL RAG ENGINE
                  </span>
                </div>

                {/* Quick One-Tap Prompt Bubbles */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                    High-Yield Clinical Prompts:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {highYieldPromptSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAskFollowUpPrompt(sug)}
                        disabled={isAnsweringFollowUp}
                        className="text-left text-xs bg-slate-950/80 hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 px-3.5 py-2 rounded-2xl transition-all shadow-sm active:scale-98 disabled:opacity-50"
                      >
                        💡 {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt Input Field */}
                <div className="space-y-2 pt-2">
                  <div className="flex rounded-2xl overflow-hidden border border-white/10 bg-slate-950/90 focus-within:border-cyan-500 transition-colors p-1">
                    <input
                      type="text"
                      value={followUpPromptInput}
                      onChange={(e) => setFollowUpPromptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAskFollowUpPrompt();
                        }
                      }}
                      placeholder="Ask any question about your check-in, symptoms, or dietary adjustments..."
                      className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none placeholder:text-slate-500"
                    />
                    <button
                      onClick={() => handleAskFollowUpPrompt()}
                      disabled={!followUpPromptInput.trim() || isAnsweringFollowUp}
                      className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shrink-0"
                    >
                      {isAnsweringFollowUp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>Ask RAG</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Q&A Response Cards Log */}
                {promptQAList.length > 0 ? (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Prompt Response History ({promptQAList.length})
                      </span>
                      <button
                        onClick={() => setPromptQAList([])}
                        className="text-[11px] text-slate-500 hover:text-slate-300 font-mono"
                      >
                        Clear History
                      </button>
                    </div>

                    <div className="space-y-4">
                      {promptQAList.map((qa) => (
                        <div
                          key={qa.id}
                          className="bg-slate-950/90 border border-white/10 rounded-2xl p-5 space-y-3.5 shadow-lg"
                        >
                          {/* Question header */}
                          <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-2.5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 font-bold">
                                  USER PROMPT
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{qa.timestamp}</span>
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                                {qa.question}
                              </p>
                            </div>

                            <button
                              onClick={() => handleCopyText(qa.answer, qa.id)}
                              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                              title="Copy Answer"
                            >
                              {copiedId === qa.id ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* AI Clinical Answer */}
                          <div className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                            <p>{qa.answer}</p>
                          </div>

                          {/* Actionable Next Steps Checklist */}
                          {qa.actionableNextSteps && qa.actionableNextSteps.length > 0 && (
                            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                                Actionable Clinical Steps:
                              </div>
                              <ul className="space-y-1 text-xs text-slate-300">
                                {qa.actionableNextSteps.map((step, sIdx) => (
                                  <li key={sIdx} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Guideline Sources Badges */}
                          {qa.matchedGuidelineSources && qa.matchedGuidelineSources.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-mono text-slate-500 uppercase">Citations:</span>
                              {qa.matchedGuidelineSources.map((src, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/20"
                                >
                                  {src}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border-t border-white/5 text-slate-500 space-y-1">
                    <MessageSquare className="w-6 h-6 mx-auto opacity-30" />
                    <p className="text-xs">No follow-up questions asked yet.</p>
                    <p className="text-[11px] text-slate-600">
                      Click any prompt bubble above or type your question to receive instant clinical guidance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MATCHED CLINICAL GUIDELINES ACCORDION */}
          {activeTabPromptView === 'all_guidelines' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Matched Clinical Guidelines & Evidence Citations ({guidanceResult.matchedGuidelines.length})</span>
              </div>

              <div className="space-y-3">
                {guidanceResult.matchedGuidelines.map((guide) => {
                  const isExpanded = expandedGuidelineId === guide.id;
                  return (
                    <div
                      key={guide.id}
                      className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-2.5 transition-all"
                    >
                      <div
                        onClick={() => setExpandedGuidelineId(isExpanded ? null : guide.id)}
                        className="flex items-start justify-between gap-3 cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              {guide.organization} ({guide.year})
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md">
                              {guide.evidence_level.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                              {guide.topic.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h6 className="text-xs font-bold text-white">{guide.source}</h6>
                        </div>

                        <button className="text-slate-400 hover:text-white p-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {guide.knowledge_summary}
                      </p>

                      {isExpanded && (
                        <div className="pt-3 space-y-3 border-t border-white/5 text-xs text-slate-300">
                          <div>
                            <div className="font-bold text-slate-200 text-[11px] mb-1">
                              Actionable Clinical Recommendations:
                            </div>
                            <ul className="space-y-1 pl-3 list-disc text-slate-300 text-[11px]">
                              {guide.recommended_actions.map((act, i) => (
                                <li key={i}>{act}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] font-mono font-bold text-amber-300 uppercase mb-0.5">
                              When to Seek Care:
                            </div>
                            <div className="text-[11px] text-slate-300">{guide.when_to_seek_care}</div>
                          </div>

                          {guide.document_url && (
                            <a
                              href={guide.document_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                            >
                              <span>Read Primary Guideline at {guide.organization}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
