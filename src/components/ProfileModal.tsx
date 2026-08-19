import React, { useState } from 'react';
import { UserProfile, ActivityLevel, DietPreference } from '../types';
import { calculateMacros } from '../utils/healthCalculators';
import { User, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [newAllergy, setNewAllergy] = useState('');

  if (!isOpen) return null;

  const currentCalculatedMacros = calculateMacros(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    confetti({ particleCount: 40, spread: 60 });
    onClose();
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    setFormData((prev) => ({
      ...prev,
      allergies: [...(prev.allergies || []), newAllergy.trim()],
    }));
    setNewAllergy('');
  };

  const handleRemoveAllergy = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      allergies: (prev.allergies || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-2xl my-8">
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Health Profile & Metabolic Calculator</h2>
              <p className="text-xs text-slate-400 font-mono">Calibrates BMR, TDEE, macronutrients & RAG agent context</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Row 1: Name, Age, Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 font-mono text-[11px] uppercase tracking-wider">Your Name</label>
              <input
                id="profile-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5 font-mono text-[11px] uppercase tracking-wider">Age (years)</label>
              <input
                id="profile-age"
                type="number"
                min="16"
                max="99"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 30 })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5 font-mono text-[11px] uppercase tracking-wider">Biological Sex</label>
              <select
                id="profile-gender"
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

          {/* Row 2: Height, Current Weight, Goal Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 font-mono text-[11px] uppercase tracking-wider">Height (cm)</label>
              <input
                id="profile-height"
                type="number"
                min="100"
                max="240"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 175 })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5 font-mono text-[11px] uppercase tracking-wider">Current Weight (kg)</label>
              <input
                id="profile-current-weight"
                type="number"
                step="0.1"
                min="35"
                max="300"
                value={formData.currentWeightKg}
                onChange={(e) => setFormData({ ...formData, currentWeightKg: parseFloat(e.target.value) || 80 })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5 font-mono text-[11px] uppercase tracking-wider">Goal Weight (kg)</label>
              <input
                id="profile-goal-weight"
                type="number"
                step="0.1"
                min="35"
                max="300"
                value={formData.goalWeightKg}
                onChange={(e) => setFormData({ ...formData, goalWeightKg: parseFloat(e.target.value) || 70 })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>
          </div>

          {/* Row 3: Activity Level & Diet Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 font-mono text-[11px] uppercase tracking-wider">Activity Level</label>
              <select
                id="profile-activity"
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
              >
                <option value="sedentary">Sedentary (Desk job, minimal exercise)</option>
                <option value="light">Light (1-3 days exercise/wk, 6k steps)</option>
                <option value="moderate">Moderate (3-5 days training, 8k-10k steps)</option>
                <option value="heavy">Heavy (6-7 days intense training)</option>
                <option value="athlete">Athlete (2x/day training or physical job)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5 font-mono text-[11px] uppercase tracking-wider">Dietary Preference</label>
              <select
                id="profile-diet"
                value={formData.dietPreference}
                onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value as DietPreference })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
              >
                <option value="high_protein">High-Protein Balanced (Optimal MPS)</option>
                <option value="mediterranean">Mediterranean (Omega-3s, Heart Health)</option>
                <option value="low_carb">Low-Carb / Ketogenic (Insulin Control)</option>
                <option value="plant_based">Plant-Based / Vegan (High Fiber)</option>
                <option value="intermittent_fasting">16:8 Intermittent Fasting</option>
              </select>
            </div>
          </div>

          {/* Row 4: Water Goal & Sleep Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 font-mono text-[11px] uppercase tracking-wider">
                Daily Hydration Goal (Liters)
              </label>
              <input
                id="profile-water"
                type="number"
                step="0.25"
                min="1.0"
                max="8.0"
                value={formData.waterGoalLiters || 3.0}
                onChange={(e) => setFormData({ ...formData, waterGoalLiters: parseFloat(e.target.value) || 3.0 })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5 font-mono text-[11px] uppercase tracking-wider">
                Target Sleep Duration (Hours/Night)
              </label>
              <input
                id="profile-sleep-target"
                type="number"
                step="0.5"
                min="5.0"
                max="12.0"
                value={formData.sleepTargetHours || formData.sleepHoursPerNight || 8.0}
                onChange={(e) => setFormData({ ...formData, sleepTargetHours: parseFloat(e.target.value) || 8.0, sleepHoursPerNight: parseFloat(e.target.value) || 8.0 })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>
          </div>

          {/* Target Weekly Pace Slider */}
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-xs">Target Loss Pace per Week</span>
              <span className="font-mono font-extrabold text-emerald-400 text-sm">
                -{formData.targetLossPaceKgPerWeek} kg / week
              </span>
            </div>
            <input
              id="profile-pace"
              type="range"
              min="0.25"
              max="1.0"
              step="0.05"
              value={formData.targetLossPaceKgPerWeek}
              onChange={(e) => setFormData({ ...formData, targetLossPaceKgPerWeek: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.25 kg (Gentle)</span>
              <span>0.50 kg (Recommended)</span>
              <span>1.0 kg (Aggressive)</span>
            </div>
          </div>

          {/* Live Calculated Stats Preview */}
          <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">BMR (Base)</div>
              <div className="font-bold text-white text-sm mt-0.5">{currentCalculatedMacros.bmr} kcal</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">TDEE (Maint.)</div>
              <div className="font-bold text-cyan-300 text-sm mt-0.5">{currentCalculatedMacros.tdee} kcal</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Daily Target</div>
              <div className="font-extrabold text-amber-300 text-sm mt-0.5">{currentCalculatedMacros.calories} kcal</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Protein Target</div>
              <div className="font-bold text-rose-300 text-sm mt-0.5">{currentCalculatedMacros.proteinGrams}g</div>
            </div>
          </div>

          {/* Allergies and Exclusions */}
          <div className="space-y-2">
            <label className="block text-slate-400 font-bold font-mono text-[11px] uppercase tracking-wider">
              Food Allergies / Disliked Ingredients
            </label>
            <div className="flex gap-2">
              <input
                id="input-new-allergy"
                type="text"
                placeholder="e.g. Peanuts, Shellfish, Dairy, Cilantro"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                className="flex-1 bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl text-xs transition-all border border-white/5 active:scale-95"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(formData.allergies || []).map((allergy, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-950 border border-white/10 text-slate-300 text-xs flex items-center gap-2"
                >
                  <span>{allergy}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(idx)}
                    className="text-slate-400 hover:text-rose-400 font-bold text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-profile"
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-6 py-2.5 rounded-2xl text-xs transition-all shadow-lg active:scale-95"
            >
              Save Profile & Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
