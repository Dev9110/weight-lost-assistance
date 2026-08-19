import React, { useState } from 'react';
import {
  UserProfile,
  PersonalHealthCheckInInput,
  PersonalizedGuidanceResult,
  ClinicalRAGGuideline,
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
          <span>Clinical RAG Triage Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Personal Health Check-In
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Tell us about yourself so we can match you with relevant, evidence-based guidance
        </p>
      </div>

      {/* Main Check-In Form Card (Faithfully matching Image Reference) */}
      <div className="max-w-2xl mx-auto bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
        {/* Step Indicator Header */}
        <div className="flex items-start gap-3 pb-2 border-b border-white/5">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Tell Us About Yourself</h2>
            <p className="text-xs text-slate-400">profile details and how you've been feeling</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Age & Sex */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Age */}
            <div className="space-y-1.5">
              <label htmlFor="checkin-age" className="block text-xs font-semibold text-slate-300">
                Age
              </label>
              <input
                id="checkin-age"
                type="number"
                min="10"
                max="120"
                placeholder="e.g. 30"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
              />
            </div>

            {/* Sex */}
            <div className="space-y-1.5">
              <label htmlFor="checkin-sex" className="block text-xs font-semibold text-slate-300">
                Sex
              </label>
              <div className="relative">
                <select
                  id="checkin-sex"
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none font-sans"
                >
                  <option value="">Select...</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="intersex">Intersex / Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Height & Weight with Integrated Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Height */}
            <div className="space-y-1.5">
              <label htmlFor="checkin-height" className="block text-xs font-semibold text-slate-300">
                Height
              </label>
              <div className="flex rounded-2xl border border-white/10 bg-slate-950/80 overflow-hidden focus-within:border-emerald-500 transition-colors">
                <input
                  id="checkin-height"
                  type="number"
                  step="0.1"
                  placeholder="170"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="flex-1 bg-transparent px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                />
                <select
                  id="checkin-height-unit"
                  value={formData.heightUnit}
                  onChange={(e) => setFormData({ ...formData, heightUnit: e.target.value as any })}
                  className="bg-slate-900/90 text-slate-300 text-xs px-3 py-2 border-l border-white/10 focus:outline-none font-mono"
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label htmlFor="checkin-weight" className="block text-xs font-semibold text-slate-300">
                Weight
              </label>
              <div className="flex rounded-2xl border border-white/10 bg-slate-950/80 overflow-hidden focus-within:border-emerald-500 transition-colors">
                <input
                  id="checkin-weight"
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="flex-1 bg-transparent px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                />
                <select
                  id="checkin-weight-unit"
                  value={formData.weightUnit}
                  onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value as any })}
                  className="bg-slate-900/90 text-slate-300 text-xs px-3 py-2 border-l border-white/10 focus:outline-none font-mono"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dietary / Lifestyle Preferences Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Dietary / Lifestyle Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {defaultPreferenceOptions.map((pref) => {
                const isSelected = formData.lifestylePreferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => togglePreference(pref)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                        : 'bg-slate-950/70 text-slate-400 hover:text-white border border-white/10 hover:border-slate-700'
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}

              {/* Custom tags added by user */}
              {formData.lifestylePreferences
                .filter((p) => !defaultPreferenceOptions.includes(p))
                .map((customPref) => (
                  <button
                    key={customPref}
                    type="button"
                    onClick={() => togglePreference(customPref)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  >
                    {customPref} ✕
                  </button>
                ))}

              {/* Add custom preference button */}
              {showCustomTagInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="e.g. Night shift"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomPreference();
                      }
                    }}
                    className="bg-slate-950 border border-emerald-500/50 text-xs text-white px-2.5 py-1 rounded-xl focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPreference}
                    className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-1 rounded-lg"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomTagInput(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-300 border border-dashed border-slate-700 hover:border-slate-500"
                >
                  + Add other
                </button>
              )}
            </div>
          </div>

          {/* Narrative Symptom Textarea */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="checkin-symptoms" className="block text-xs font-semibold text-slate-300">
                How have you been feeling?
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {formData.symptomsNarrative.length} / 500
              </span>
            </div>

            <textarea
              id="checkin-symptoms"
              rows={4}
              maxLength={500}
              placeholder="Recently I have 3 weeks of insomnia, and high blood pressure or feeling dizzy and tired entire day."
              value={formData.symptomsNarrative}
              onChange={(e) => setFormData({ ...formData, symptomsNarrative: e.target.value })}
              className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans resize-none leading-relaxed"
            />

            <p className="text-[11px] text-slate-400">
              This helps us search relevant health guidance for you
            </p>

            {/* Tip Box matching reference style */}
            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-3.5 text-xs text-cyan-200/90 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <span className="font-bold text-cyan-300">Tip:</span> Mention how long a symptom has lasted, how often it happens, and anything that makes it better or worse — e.g. <span className="italic">"3 weeks,"</span> <span className="italic">"every night,"</span> <span className="italic">"worse after coffee."</span>
              </p>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            id="btn-get-guidance"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Searching Clinical RAG & Synthesizing Guidance...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Get My Personalized Guidance</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Guidance Assessment Results Section */}
      {guidanceResult && (
        <div className="max-w-4xl mx-auto space-y-6 pt-4 animate-fade-in">
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

            {/* Matched Clinical Guidelines Accordion */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Matched Clinical Guidelines & Evidence Citations</span>
              </div>

              <div className="space-y-2.5">
                {guidanceResult.matchedGuidelines.map((guide) => {
                  const isExpanded = expandedGuidelineId === guide.id;
                  return (
                    <div
                      key={guide.id}
                      className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 space-y-2 transition-all"
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

            {/* Medical Disclaimer Callout */}
            <div className="text-[10px] text-slate-400 bg-slate-950/60 p-3.5 rounded-2xl border border-white/5 font-sans leading-relaxed">
              <span className="font-bold text-slate-300">Medical Disclaimer:</span>{' '}
              {guidanceResult.medicalDisclaimer}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                id="btn-apply-checkin-profile"
                onClick={handleApplyToHealthProfile}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Apply Values to My Profile</span>
              </button>

              {onOpenCoachWithContext && (
                <button
                  id="btn-consult-coach-checkin"
                  onClick={() =>
                    onOpenCoachWithContext(
                      `I completed my Personal Health Check-In. My BMI is ${guidanceResult.bmiAssessment?.bmi}, and I noted symptoms: "${formData.symptomsNarrative}". Can we adjust my meal and workout plan according to the matched clinical guidelines?`
                    )
                  }
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-white/10 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Discuss Plan with AI Health Coach</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
