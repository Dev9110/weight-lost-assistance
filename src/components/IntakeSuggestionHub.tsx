import React, { useState } from 'react';
import {
  UserProfile,
  UserIntakeDetails,
  AISuggestionResponse,
  ActivityLevel,
  DietPreference,
} from '../types';
import {
  Sparkles,
  User,
  Scale,
  Activity,
  Utensils,
  Dumbbell,
  Brain,
  CheckCircle2,
  Calendar,
  BookOpen,
  Copy,
  ChevronRight,
  RefreshCw,
  Flame,
  Clock,
  Check,
  Zap,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  TrendingDown,
  Moon,
  Plus,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IntakeSuggestionHubProps {
  currentProfile: UserProfile;
  onApplyPlan: (suggestion: AISuggestionResponse, updatedProfile: UserProfile) => void;
  onScheduleCalendar: () => void;
  onExportKeep: () => void;
  onOpenCoach: (initialContextPrompt?: string) => void;
}

export const IntakeSuggestionHub: React.FC<IntakeSuggestionHubProps> = ({
  currentProfile,
  onApplyPlan,
  onScheduleCalendar,
  onExportKeep,
  onOpenCoach,
}) => {
  const [formStep, setFormStep] = useState<'form' | 'results'>('form');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Form State initialized with current user profile or smart defaults
  const [formData, setFormData] = useState<UserIntakeDetails>({
    name: currentProfile.name || 'Viyasan',
    age: currentProfile.age || 26,
    gender: currentProfile.gender || 'male',
    heightCm: currentProfile.heightCm || 178,
    currentWeightKg: currentProfile.currentWeightKg || 82.5,
    goalWeightKg: currentProfile.goalWeightKg || 74.0,
    targetLossPaceKgPerWeek: currentProfile.targetLossPaceKgPerWeek || 0.5,
    activityLevel: currentProfile.activityLevel || 'moderate',
    dietPreference: currentProfile.dietPreference || 'high_protein',
    dailyRoutine: 'desk_job',
    sleepHoursPerNight: 7.5,
    primaryChallenges: ['Late-night snacking & sweet cravings', 'Lack of time for daily meal prep'],
    favoriteFoods: ['Grilled Chicken', 'Blueberries', 'Greek Yogurt', 'Avocado', 'Dark Chocolate', 'Quinoa'],
    allergies: currentProfile.allergies || ['Shellfish'],
    equipmentAvailable: 'dumbbells_home',
    workoutDurationMinutes: 40,
    workoutDaysPerWeek: 4,
    specialNotes: 'Focus on keeping hunger low while losing fat and preserving muscle.',
  });

  const [newFavoriteFood, setNewFavoriteFood] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [suggestionResult, setSuggestionResult] = useState<AISuggestionResponse | null>(null);

  // Quick preset foods
  const commonFavoriteFoods = [
    'Chicken Breast',
    'Salmon',
    'Eggs',
    'Greek Yogurt',
    'Blueberries',
    'Oats',
    'Sweet Potato',
    'Dark Chocolate',
    'Almonds',
    'Rice Bowl',
    'Tofu',
    'Steak',
  ];

  // Common obstacles
  const obstacleOptions = [
    'Late-night snacking & sweet cravings',
    'Lack of time for daily meal prep',
    'Frequent social dining / dining out',
    'Joint pain / require low-impact workouts',
    'High stress / emotional comfort eating',
    'Hit a weight loss plateau / slow metabolism',
    'Low energy in the afternoons',
  ];

  const handleToggleChallenge = (challenge: string) => {
    setFormData((prev) => {
      const exists = prev.primaryChallenges.includes(challenge);
      return {
        ...prev,
        primaryChallenges: exists
          ? prev.primaryChallenges.filter((c) => c !== challenge)
          : [...prev.primaryChallenges, challenge],
      };
    });
  };

  const handleAddFavoriteFood = (food: string) => {
    const trimmed = food.trim();
    if (!trimmed || formData.favoriteFoods.includes(trimmed)) return;
    setFormData((prev) => ({
      ...prev,
      favoriteFoods: [...prev.favoriteFoods, trimmed],
    }));
    setNewFavoriteFood('');
  };

  const handleRemoveFavoriteFood = (food: string) => {
    setFormData((prev) => ({
      ...prev,
      favoriteFoods: prev.favoriteFoods.filter((f) => f !== food),
    }));
  };

  const handleAddAllergy = (allergy: string) => {
    const trimmed = allergy.trim();
    if (!trimmed || formData.allergies.includes(trimmed)) return;
    setFormData((prev) => ({
      ...prev,
      allergies: [...prev.allergies, trimmed],
    }));
    setNewAllergy('');
  };

  const handleRemoveAllergy = (allergy: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergy),
    }));
  };

  // Submit Intake Form to AI Suggestion Engine
  const handleGenerateSuggestions = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setAppliedSuccess(false);

    try {
      const res = await fetch('/api/agent/personalized-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }

      const data: AISuggestionResponse = await res.json();
      setSuggestionResult(data);
      setFormStep('results');
      confetti({ particleCount: 60, spread: 70 });
    } catch (err) {
      console.error('Error generating suggestion:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToDashboard = () => {
    if (!suggestionResult) return;
    const updatedProfile: UserProfile = {
      ...currentProfile,
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      heightCm: formData.heightCm,
      currentWeightKg: formData.currentWeightKg,
      goalWeightKg: formData.goalWeightKg,
      targetLossPaceKgPerWeek: formData.targetLossPaceKgPerWeek,
      activityLevel: formData.activityLevel,
      dietPreference: formData.dietPreference,
      allergies: formData.allergies,
      dailyCalorieLimit: suggestionResult.macroTargets.calories,
      waterGoalLiters: suggestionResult.macroTargets.waterLiters,
      favoriteFoods: formData.favoriteFoods,
      primaryChallenges: formData.primaryChallenges,
      dailyRoutine: formData.dailyRoutine,
      sleepHoursPerNight: formData.sleepHoursPerNight,
      workoutDurationMinutes: formData.workoutDurationMinutes,
      workoutDaysPerWeek: formData.workoutDaysPerWeek,
    };

    onApplyPlan(suggestionResult, updatedProfile);
    setAppliedSuccess(true);
    confetti({ particleCount: 80, spread: 90 });
    setTimeout(() => setAppliedSuccess(false), 4000);
  };

  const handleCopySummary = () => {
    if (!suggestionResult) return;
    const text = `🎯 PERSONALIZED WEIGHT LOSS STRATEGY FOR ${formData.name.toUpperCase()}
• Current: ${formData.currentWeightKg} kg | Goal: ${formData.goalWeightKg} kg (-${formData.targetLossPaceKgPerWeek} kg/wk)
• Daily Target: ${suggestionResult.macroTargets.calories} kcal (Deficit: ${suggestionResult.executiveSummary.dailyDeficit} kcal/day)
• Macros: ${suggestionResult.macroTargets.proteinGrams}g Protein | ${suggestionResult.macroTargets.carbsGrams}g Carbs | ${suggestionResult.macroTargets.fatGrams}g Fat | ${suggestionResult.macroTargets.fiberGrams}g Fiber
• Steps: ${suggestionResult.macroTargets.dailyStepsTarget.toLocaleString()} steps/day | Water: ${suggestionResult.macroTargets.waterLiters}L

🍽️ NUTRITION: ${suggestionResult.nutritionStrategy.headline}
${suggestionResult.nutritionStrategy.whyThisWorks}

🏋️‍♂️ TRAINING: ${suggestionResult.fitnessStrategy.headline}
Split: ${suggestionResult.fitnessStrategy.splitType}

🧠 BEHAVIORAL PROTOCOL:
Challenge: ${suggestionResult.behavioralProtocol.primaryChallengeAddressed}
Coping Strategy: ${suggestionResult.behavioralProtocol.psychologicalCopingTechnique}
`;

    navigator.clipboard.writeText(text);
    setCopiedNotification('Full Plan Summary');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Header */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-full border border-emerald-500/20">
                Personalized AI Intake & Blueprint Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">Agentic RAG Synthesis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Personalized Assessment & Strategy
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Input your personal health metrics, daily lifestyle routine, favorite foods, and obstacles. Our multi-agent team will synthesize a tailored meal blueprint, workout split, and behavioral protocol.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {formStep === 'results' && (
              <button
                id="btn-edit-intake"
                onClick={() => setFormStep('form')}
                className="bg-slate-950/70 hover:bg-slate-800 text-slate-200 border border-white/10 font-bold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-2 shadow active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Adjust Intake Details</span>
              </button>
            )}

            <button
              id="btn-trigger-intake-submit"
              onClick={handleGenerateSuggestions}
              disabled={isGenerating}
              className="bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-6 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-300" />}
              <span>{isGenerating ? 'Synthesizing with RAG...' : formStep === 'form' ? 'Generate AI Suggestions' : 'Regenerate Suggestions'}</span>
            </button>
          </div>
        </div>

        {copiedNotification && (
          <div className="mt-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 backdrop-blur-md">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Copied {copiedNotification} to clipboard!</span>
          </div>
        )}

        {appliedSuccess && (
          <div className="mt-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-100 text-xs px-4 py-3 rounded-2xl flex items-center justify-between backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2.5 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Personalized AI suggestions successfully applied to your Live Dashboard, Meal Plan, and Workouts!</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">Live Updated</span>
          </div>
        )}
      </div>

      {/* FORM VIEW: Insert Personal Details */}
      {formStep === 'form' && (
        <form onSubmit={handleGenerateSuggestions} className="space-y-6">
          {/* STEP 1: Body Metrics & Goals */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">1. Body Metrics & Weight Loss Goal</h3>
                <p className="text-[11px] text-slate-400">Used for Mifflin-St Jeor metabolic BMR & calorie deficit calculation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                  placeholder="e.g. Alex"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Age</label>
                <input
                  type="number"
                  min="16"
                  max="99"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 28 })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Biological Sex</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                >
                  <option value="male">Male (Mifflin +5 formula)</option>
                  <option value="female">Female (Mifflin -161 formula)</option>
                  <option value="other">Other / Neutral</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Height (cm)</label>
                <input
                  type="number"
                  min="120"
                  max="230"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 175 })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="35"
                  max="300"
                  value={formData.currentWeightKg}
                  onChange={(e) => setFormData({ ...formData, currentWeightKg: parseFloat(e.target.value) || 80 })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Target Goal Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="35"
                  max="300"
                  value={formData.goalWeightKg}
                  onChange={(e) => setFormData({ ...formData, goalWeightKg: parseFloat(e.target.value) || 72 })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                  required
                />
              </div>
            </div>

            {/* Target Pace Slider */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Desired Weight Loss Rate per Week</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">
                  -{formData.targetLossPaceKgPerWeek} kg / week (Deficit: ~{Math.round((formData.targetLossPaceKgPerWeek * 7700) / 7)} kcal/day)
                </span>
              </div>
              <input
                type="range"
                min="0.25"
                max="1.0"
                step="0.05"
                value={formData.targetLossPaceKgPerWeek}
                onChange={(e) => setFormData({ ...formData, targetLossPaceKgPerWeek: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.25 kg/wk (Gentle & Muscle-Preserving)</span>
                <span>0.50 kg/wk (Clinical Gold Standard)</span>
                <span>1.0 kg/wk (Aggressive)</span>
              </div>
            </div>
          </div>

          {/* STEP 2: Lifestyle, Routine & Sleep */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">2. Lifestyle, Daily Routine & Sleep</h3>
                <p className="text-[11px] text-slate-400">Calibrates your Non-Exercise Activity Thermogenesis (NEAT) & recovery hormones</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">General Activity Level</label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                >
                  <option value="sedentary">Sedentary (Desk job, &lt; 5k steps)</option>
                  <option value="light">Light (1-3 workout days, 6k-8k steps)</option>
                  <option value="moderate">Moderate (3-5 training days, 8k-10k steps)</option>
                  <option value="heavy">Heavy (6-7 intense training days)</option>
                  <option value="athlete">Athlete / Physically Demanding Job</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Daily Work Style / Routine</label>
                <select
                  value={formData.dailyRoutine}
                  onChange={(e) => setFormData({ ...formData, dailyRoutine: e.target.value as any })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                >
                  <option value="desk_job">Desk / Remote Work (Seated most of day)</option>
                  <option value="standing_light">Standing / Walking (Retail, Teacher, Nurse)</option>
                  <option value="active_labor">Active Labor / Trades</option>
                  <option value="shift_work">Rotating / Night Shift Work</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Avg Sleep (hours/night)</label>
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <input
                    type="number"
                    step="0.5"
                    min="4"
                    max="12"
                    value={formData.sleepHoursPerNight}
                    onChange={(e) => setFormData({ ...formData, sleepHoursPerNight: parseFloat(e.target.value) || 7 })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Dietary Style & Favorite Foods */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">3. Dietary Preferences & Favorite Foods</h3>
                <p className="text-[11px] text-slate-400">The AI will build delicious meals around the foods you love while respecting exclusions</p>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Diet Pattern</label>
              <select
                value={formData.dietPreference}
                onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value as DietPreference })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans text-xs"
              >
                <option value="high_protein">High-Protein Balanced (Optimal Muscle Protein Synthesis & Fullness)</option>
                <option value="mediterranean">Mediterranean (Rich in Extra Virgin Olive Oil, Omega-3s & Whole Grains)</option>
                <option value="low_carb">Low-Carb / Ketogenic (Glycemic Control & Fat Adaptation)</option>
                <option value="plant_based">Plant-Based / Vegan (High Dietary Fiber & Legumes)</option>
                <option value="intermittent_fasting">16:8 Intermittent Fasting Window</option>
              </select>
            </div>

            {/* Favorite Foods Tags */}
            <div className="space-y-2 text-xs">
              <label className="block text-slate-400 font-mono font-bold uppercase text-[10px]">
                Your Favorite Foods & Cravings (AI will integrate these)
              </label>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {commonFavoriteFoods.map((food, idx) => {
                  const isSelected = formData.favoriteFoods.includes(food);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => (isSelected ? handleRemoveFavoriteFood(food) : handleAddFavoriteFood(food))}
                      className={`text-[11px] px-3 py-1 rounded-xl transition-all border flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-slate-700'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3 text-slate-500" />}
                      <span>{food}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Add Food */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Type any other favorite food (e.g. Sourdough, Dark Berries, Lentil curry)..."
                  value={newFavoriteFood}
                  onChange={(e) => setNewFavoriteFood(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFavoriteFood(newFavoriteFood);
                    }
                  }}
                  className="flex-1 bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
                <button
                  type="button"
                  onClick={() => handleAddFavoriteFood(newFavoriteFood)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-4 py-2 rounded-2xl text-xs font-bold transition-all border border-white/5 active:scale-95"
                >
                  Add Food
                </button>
              </div>

              {/* Active Selected Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.favoriteFoods.map((food, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2"
                  >
                    <span>{food}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFavoriteFood(food)}
                      className="text-emerald-400 hover:text-rose-400 font-bold"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Allergies / Dislikes */}
            <div className="space-y-2 text-xs pt-2 border-t border-white/5">
              <label className="block text-slate-400 font-mono font-bold uppercase text-[10px]">
                Allergies or Foods to Exclude
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Shellfish, Peanuts, Dairy, Mushrooms"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAllergy(newAllergy);
                    }
                  }}
                  className="flex-1 bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
                <button
                  type="button"
                  onClick={() => handleAddAllergy(newAllergy)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-4 py-2 rounded-2xl text-xs font-bold transition-all border border-white/5 active:scale-95"
                >
                  Add Exclusion
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {formData.allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2"
                  >
                    <span>{allergy}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(allergy)}
                      className="text-rose-400 hover:text-white font-bold"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 4: Primary Obstacles & Workout Environment */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">4. Primary Obstacles & Workout Environment</h3>
                <p className="text-[11px] text-slate-400">Our Behavioral Agent and Exercise Physiologist will target these specifically</p>
              </div>
            </div>

            {/* Obstacle Checkbox Cards */}
            <div className="space-y-2 text-xs">
              <label className="block text-slate-400 font-mono font-bold uppercase text-[10px]">
                Select Your Biggest Weight Loss Obstacles
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {obstacleOptions.map((obs, idx) => {
                  const isChecked = formData.primaryChallenges.includes(obs);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleChallenge(obs)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isChecked
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                          : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-lg flex items-center justify-center border text-xs shrink-0 ${
                          isChecked ? 'bg-rose-500 border-rose-500 text-slate-950' : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{obs}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workout Equipment & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Equipment Available</label>
                <select
                  value={formData.equipmentAvailable}
                  onChange={(e) => setFormData({ ...formData, equipmentAvailable: e.target.value as any })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                >
                  <option value="dumbbells_home">Home Dumbbells & Mat</option>
                  <option value="full_gym">Full Commercial Gym</option>
                  <option value="bodyweight_only">Bodyweight / Calisthenics</option>
                  <option value="bands_mat">Resistance Bands & Mat</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Workout Days / Week</label>
                <select
                  value={formData.workoutDaysPerWeek}
                  onChange={(e) => setFormData({ ...formData, workoutDaysPerWeek: parseInt(e.target.value, 10) || 4 })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                >
                  <option value="3">3 Days (Full Body Routine)</option>
                  <option value="4">4 Days (Upper / Lower Split)</option>
                  <option value="5">5 Days (Push / Pull / Legs)</option>
                  <option value="6">6 Days (Advanced Hypertrophy)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">Time Per Session (Mins)</label>
                <select
                  value={formData.workoutDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, workoutDurationMinutes: parseInt(e.target.value, 10) || 45 })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                >
                  <option value="30">30 Minutes (High-Efficiency)</option>
                  <option value="45">45 Minutes (Standard Optimal)</option>
                  <option value="60">60 Minutes (Comprehensive)</option>
                </select>
              </div>
            </div>

            {/* Special Notes */}
            <div className="text-xs pt-1">
              <label className="block text-slate-400 font-mono font-bold mb-1.5 uppercase text-[10px]">
                Special Goals or Context (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Wedding in 3 months, prefer quick 15-min lunches, bad left knee..."
                value={formData.specialNotes}
                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>
          </div>

          {/* Bottom Submit CTA */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all flex items-center gap-2.5 shadow-xl shadow-emerald-950/50 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-emerald-300" />}
              <span>{isGenerating ? 'AI Agents Synthesizing Personalized Plan...' : 'Generate My Evidence-Based Suggestions'}</span>
            </button>
          </div>
        </form>
      )}

      {/* RESULTS VIEW: The AI-Generated Personalized Suggestions Showcase */}
      {formStep === 'results' && suggestionResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Executive Assessment Card */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Executive Metabolic Roadmap
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Tailored for {formData.name}</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Your Autonomous Weight Loss Architecture</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {suggestionResult.executiveSummary.overview}
                </p>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-apply-suggestion-plan"
                  onClick={handleApplyToDashboard}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-5 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95"
                >
                  <Zap className="w-4 h-4 text-emerald-300" />
                  <span>Apply Plan to Dashboard</span>
                </button>

                <button
                  onClick={handleCopySummary}
                  className="bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-white/10 font-bold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Summary</span>
                </button>
              </div>
            </div>

            {/* Metabolic Stat Cards Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Daily Calories</span>
                <div className="text-xl font-black text-amber-300 font-mono mt-0.5">
                  {suggestionResult.macroTargets.calories} <span className="text-xs font-normal text-slate-400">kcal</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">-{suggestionResult.executiveSummary.dailyDeficit} kcal deficit</span>
              </div>

              <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Protein Target</span>
                <div className="text-xl font-black text-rose-400 font-mono mt-0.5">
                  {suggestionResult.macroTargets.proteinGrams} <span className="text-xs font-normal text-slate-400">g</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">~2.0g/kg lean sparing</span>
              </div>

              <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Carbohydrates</span>
                <div className="text-xl font-black text-cyan-300 font-mono mt-0.5">
                  {suggestionResult.macroTargets.carbsGrams} <span className="text-xs font-normal text-slate-400">g</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Low-GI fuel</span>
              </div>

              <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Healthy Fats</span>
                <div className="text-xl font-black text-teal-300 font-mono mt-0.5">
                  {suggestionResult.macroTargets.fatGrams} <span className="text-xs font-normal text-slate-400">g</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Hormone balance</span>
              </div>

              <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Daily Steps Target</span>
                <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                  {suggestionResult.macroTargets.dailyStepsTarget.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">NEAT driver</span>
              </div>

              <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Target Timeline</span>
                <div className="text-xl font-black text-white font-mono mt-0.5">
                  ~{suggestionResult.executiveSummary.estimatedWeeksToGoal} <span className="text-xs font-normal text-slate-400">wks</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">To {formData.goalWeightKg} kg</span>
              </div>
            </div>
          </div>

          {/* 3-Column Multi-Agent Suggestions Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMN 1: NUTRITION STRATEGY */}
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Nutrition Suggestion</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Clinical Nutritionist Agent</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white text-xs">{suggestionResult.nutritionStrategy.headline}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {suggestionResult.nutritionStrategy.whyThisWorks}
                  </p>
                </div>

                {/* Suggested Meals List */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Sample Meal Blueprint</div>
                  {suggestionResult.nutritionStrategy.suggestedMeals.map((meal, idx) => (
                    <div key={idx} className="bg-slate-950/70 p-3.5 rounded-2xl border border-white/5 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-xs capitalize">
                          {meal.type}: {meal.name}
                        </span>
                        <span className="font-mono text-amber-300 text-[11px] font-bold">{meal.calories} kcal</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span className="text-rose-400">{meal.protein}g P</span>
                        <span className="text-cyan-400">{meal.carbs}g C</span>
                        <span className="text-teal-400">{meal.fat}g F</span>
                        <span className="text-slate-500">• {meal.prepTimeMinutes}m prep</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic line-clamp-1">
                        Ingredients: {meal.ingredients.slice(0, 3).join(', ')}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={onExportKeep}
                  className="w-full bg-slate-950/70 hover:bg-slate-800 text-amber-300 border border-white/5 font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Export Grocery List to Keep</span>
                </button>
              </div>
            </div>

            {/* COLUMN 2: WORKOUT & TRAINING STRATEGY */}
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                  <div className="w-9 h-9 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Training Suggestion</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Exercise Physiologist Agent</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white text-xs">{suggestionResult.fitnessStrategy.headline}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Split: <span className="text-emerald-400 font-mono">{suggestionResult.fitnessStrategy.splitType}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {suggestionResult.fitnessStrategy.neatRecommendations}
                  </p>
                </div>

                {/* Workout Sessions */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Weekly Workout Schedule</div>
                  {suggestionResult.fitnessStrategy.weeklySessions.map((wo, idx) => (
                    <div key={idx} className="bg-slate-950/70 p-3.5 rounded-2xl border border-white/5 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-xs">{wo.dayOfWeek}: {wo.title}</span>
                        <span className="font-mono text-emerald-400 text-[10px]">{wo.durationMinutes} mins</span>
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        {wo.exercises.slice(0, 3).map((ex, i) => (
                          <div key={i} className="flex justify-between">
                            <span>• {ex.name}</span>
                            <span className="font-mono text-slate-500">{ex.sets} × {ex.repsOrDuration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <button
                  onClick={onScheduleCalendar}
                  className="w-full bg-slate-950/70 hover:bg-slate-800 text-rose-300 border border-white/5 font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule to Google Calendar</span>
                </button>
              </div>
            </div>

            {/* COLUMN 3: BEHAVIORAL PROTOCOL & RAG GROUNDING */}
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                  <div className="w-9 h-9 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/20">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Behavioral & Craving Protocol</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Behavioral Psychologist Agent</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    Targeting: {suggestionResult.behavioralProtocol.primaryChallengeAddressed}
                  </span>
                  <p className="text-[11px] text-slate-200 mt-2 font-medium bg-slate-950/70 p-3 rounded-xl border border-white/5 leading-relaxed">
                    💡 {suggestionResult.behavioralProtocol.psychologicalCopingTechnique}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Actionable Habit Anchors</div>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {suggestionResult.behavioralProtocol.actionableHabits.map((habit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{habit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sleep Tip */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-[11px] text-cyan-200 flex items-start gap-2">
                  <Moon className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{suggestionResult.behavioralProtocol.sleepOptimizationTip}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <button
                  onClick={() => onOpenCoach(`I just generated my personalized suggestion plan based on my ${formData.currentWeightKg}kg weight and goal of ${formData.goalWeightKg}kg. Can we dive deeper into my nutrition and workout strategy?`)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow active:scale-95"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Ask Coach About This Plan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scientific RAG Grounding & Multi-Agent Reasoning Trace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RAG Grounding */}
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Scientific RAG Vector Evidence Grounding
                </h3>
              </div>
              <div className="space-y-2">
                {suggestionResult.ragEvidenceGrounding.map((rag, idx) => (
                  <div key={idx} className="bg-slate-950/70 p-3.5 rounded-2xl border border-white/5 text-xs space-y-1">
                    <div className="font-bold text-white">{rag.paperTitle}</div>
                    <div className="text-[11px] text-emerald-300 font-mono">Citation: {rag.citation}</div>
                    <p className="text-[11px] text-slate-300">{rag.clinicalTakeaway}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Thought Trace */}
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Multi-Agent Reasoning Trace
                </h3>
              </div>
              <div className="space-y-2">
                {suggestionResult.agentThoughtTrace.map((trace, idx) => (
                  <div key={idx} className="bg-slate-950/70 p-3 rounded-2xl border border-white/5 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">[{trace.agentName}]</span>
                    <p className="text-slate-300 font-sans mt-0.5 text-[11px]">{trace.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
