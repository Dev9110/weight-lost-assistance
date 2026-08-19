import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { PlanView } from './components/PlanView';
import { RAGExplorer } from './components/RAGExplorer';
import { AgentCoach } from './components/AgentCoach';
import { WorkspaceSyncHub } from './components/WorkspaceSyncHub';
import { ProfileModal } from './components/ProfileModal';
import { IntakeSuggestionHub } from './components/IntakeSuggestionHub';
import { PersonalHealthCheckIn } from './components/PersonalHealthCheckIn';
import {
  UserProfile,
  MacroTargets,
  MealItem,
  WorkoutSession,
  WeightLogEntry,
  SleepLogEntry,
  ChatMessage,
  AISuggestionResponse,
} from './types';
import {
  calculateMacros,
  getDefaultMeals,
  getDefaultWorkouts,
} from './utils/healthCalculators';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';
import confetti from 'canvas-confetti';

export function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'intake' | 'checkin' | 'plan' | 'rag' | 'coach' | 'sync'>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('equilibrium_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return {
      name: 'Viyasan',
      age: 26,
      gender: 'male',
      currentWeightKg: 82.5,
      goalWeightKg: 74.0,
      heightCm: 178,
      activityLevel: 'moderate',
      dietPreference: 'high_protein',
      targetLossPaceKgPerWeek: 0.5,
      allergies: ['Shellfish'],
      waterGoalLiters: 3.0,
      dailyCalorieLimit: 1950,
      healthConditions: [],
    };
  });

  // Calculate dynamic macros
  const macros: MacroTargets = calculateMacros(profile);

  // Meals & Workouts
  const [meals, setMeals] = useState<MealItem[]>(() => {
    const saved = localStorage.getItem('equilibrium_meals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return getDefaultMeals(macros);
  });

  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('equilibrium_workouts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return getDefaultWorkouts();
  });

  // Weight History
  const [weightLogs, setWeightLogs] = useState<WeightLogEntry[]>(() => {
    const saved = localStorage.getItem('equilibrium_weight_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return [
      { date: '2026-08-18', weightKg: 82.5, notes: 'Starting weigh-in' },
      { date: '2026-08-11', weightKg: 83.2 },
      { date: '2026-08-04', weightKg: 83.9 },
    ];
  });

  // Sleep Duration & Recovery History
  const [sleepLogs, setSleepLogs] = useState<SleepLogEntry[]>(() => {
    const saved = localStorage.getItem('equilibrium_sleep_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return [
      {
        id: 'sleep-init-1',
        date: '2026-08-18',
        durationHours: 7.5,
        quality: 'good',
        bedTime: '23:15',
        wakeTime: '06:45',
        notes: 'Felt well-rested, morning natural light exposure',
        aiSleepAdvice: 'Solid 7.5h duration supports optimal leptin/ghrelin balance and muscular recovery.',
      },
      {
        id: 'sleep-init-2',
        date: '2026-08-17',
        durationHours: 8.0,
        quality: 'deep',
        bedTime: '22:45',
        wakeTime: '06:45',
        notes: 'Deep sleep, cool bedroom 18°C',
        aiSleepAdvice: '8.0h restorative window triggered peak Slow-Wave Sleep growth hormone release.',
      },
      {
        id: 'sleep-init-3',
        date: '2026-08-16',
        durationHours: 6.25,
        quality: 'fair',
        bedTime: '00:15',
        wakeTime: '06:30',
        notes: 'Late screen exposure before sleep',
        aiSleepAdvice: 'Mild sleep deficit. Compensated with higher protein satiety and 500ml water pre-meals.',
      },
    ];
  });

  // Agent Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'agent',
      role: 'orchestrator',
      text: `Hello ${profile.name}! I am your Autonomous Weight Loss & Wellness Agent (Siemens Wellness AI Agent).

Based on your current weight of **${profile.currentWeightKg} kg** and target of **${profile.goalWeightKg} kg**, we have established a **${macros.deficit} kcal/day** caloric deficit targeting **${macros.calories} kcal** with **${macros.proteinGrams}g Protein** (2.0g/kg lean mass).

Systems Ready:
- 📊 **Agent Logic Engine**: Live tracking of calories, macros, hydration kinetic goals, and weigh-in vectors.
- 🍽️ **High-Satiety Nutrition & Workouts**: Macronutrient distribution with low-GI foods and resistance training.
- 📚 **RAG Scientific Knowledge Base**: Grounded in indexed clinical sports nutrition literature.
- 📅 **Google Calendar & Keep Sync**: Autonomous scheduling of training sessions & Keep grocery checklists.
- 🐍 **Python AI Agent Hub**: Standalone multi-agent Python engine with REST APIs.

What would you like to optimize today?`,
      timestamp: new Date().toISOString(),
      reasoningSteps: [
        {
          agentName: 'Master Orchestrator',
          thought: 'Initialized multi-agent pipeline with user profile targets & Mifflin-St Jeor metabolic calibration.',
        },
        {
          agentName: 'Nutritionist Agent',
          thought: 'Allocated high leucine protein thresholds (2.0g/kg) and fiber targets for gastric fullness.',
          ragSourcesUsed: ['Protein Leverage Hypothesis', 'Thermic Effect of Food & Lean Mass Sparing'],
        },
      ],
    },
  ]);

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser, token) => {
        setUser(authenticatedUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('equilibrium_user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('equilibrium_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('equilibrium_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('equilibrium_weight_logs', JSON.stringify(weightLogs));
  }, [weightLogs]);

  useEffect(() => {
    localStorage.setItem('equilibrium_sleep_logs', JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  // Auth Handlers
  const handleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        confetti({ particleCount: 40, spread: 60 });
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  // Weight Logging Handler
  const handleLogWeight = (newWeight: number, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: WeightLogEntry = {
      date: today,
      weightKg: newWeight,
      notes,
    };
    setWeightLogs([newEntry, ...weightLogs.filter((l) => l.date !== today)]);
    setProfile({ ...profile, currentWeightKg: newWeight });
  };

  // Sleep Logging Handler
  const handleLogSleep = async (entry: Omit<SleepLogEntry, 'id'>) => {
    const newEntry: SleepLogEntry = {
      ...entry,
      id: `sleep-${Date.now()}`,
    };
    setSleepLogs((prev) => [newEntry, ...prev.filter((l) => l.date !== entry.date)]);
  };

  // Meal & Workout toggles
  const handleToggleMealLog = (mealId: string) => {
    setMeals(meals.map((m) => (m.id === mealId ? { ...m, logged: !m.logged } : m)));
  };

  const handleToggleWorkoutLog = (workoutId: string) => {
    setWorkouts(workouts.map((w) => (w.id === workoutId ? { ...w, completed: !w.completed } : w)));
  };

  // Chat message sender
  const handleSendMessage = async (text: string, role?: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsSendingMessage(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          profile,
          macros,
          role: role || 'orchestrator',
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        role: (role as any) || 'orchestrator',
        text: data.reply || 'I am ready to help you optimize your health.',
        timestamp: new Date().toISOString(),
        reasoningSteps: data.reasoningSteps,
        ragCitations: data.ragCitations,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: 'For sustainable weight loss, maintain your 300-500 kcal deficit, ensure 1.8-2.2g protein/kg, prioritize 8,000 daily steps, and ensure 7.5+ hours of sleep.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Regenerate plan with Gemini
  const handleRegenerateWithAI = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/agent/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, macros }),
      });
      const data = await res.json();
      if (data.meals && Array.isArray(data.meals) && data.meals.length > 0) {
        const mapped = data.meals.map((m: any, idx: number) => ({
          ...m,
          id: `ai-meal-${idx}-${Date.now()}`,
          logged: false,
        }));
        setMeals(mapped);
      }
    } catch (e) {
      console.error('Regenerate plan error:', e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleAskAgentAboutTopic = (topic: string) => {
    setActiveTab('coach');
    handleSendMessage(`Explain the scientific mechanisms behind "${topic}" and how I can apply it to my weight loss plan.`);
  };

  // Apply Full AI Intake Suggestion
  const handleApplySuggestedPlan = (suggestion: AISuggestionResponse, updatedProfile: UserProfile) => {
    // 1. Update Profile
    setProfile(updatedProfile);
    localStorage.setItem('equilibrium_user_profile', JSON.stringify(updatedProfile));

    // 2. Update Meals from suggestions if available
    if (suggestion.nutritionStrategy?.suggestedMeals && suggestion.nutritionStrategy.suggestedMeals.length > 0) {
      const mappedMeals: MealItem[] = suggestion.nutritionStrategy.suggestedMeals.map((m, idx) => ({
        ...m,
        id: `ai-suggested-meal-${idx}-${Date.now()}`,
        logged: false,
      }));
      setMeals(mappedMeals);
      localStorage.setItem('equilibrium_meals', JSON.stringify(mappedMeals));
    }

    // 3. Update Workouts from suggestions if available
    if (suggestion.fitnessStrategy?.weeklySessions && suggestion.fitnessStrategy.weeklySessions.length > 0) {
      const mappedWorkouts: WorkoutSession[] = suggestion.fitnessStrategy.weeklySessions.map((w, idx) => ({
        ...w,
        id: `ai-suggested-wo-${idx}-${Date.now()}`,
        completed: false,
        syncedToCalendar: false,
      }));
      setWorkouts(mappedWorkouts);
      localStorage.setItem('equilibrium_workouts', JSON.stringify(mappedWorkouts));
    }

    // 4. Append celebration message to Coach
    const confirmationMsg: ChatMessage = {
      id: `msg-applied-${Date.now()}`,
      sender: 'agent',
      role: 'orchestrator',
      text: `🎉 **New Personalized Blueprint Activated for ${updatedProfile.name}!**

I have re-calibrated your entire dashboard, metabolic target (${suggestion.macroTargets.calories} kcal, ${suggestion.macroTargets.proteinGrams}g Protein), custom meals, and training split according to your intake assessment.

- 🥗 **Nutrition Strategy**: ${suggestion.nutritionStrategy.headline}
- 🏋️‍♂️ **Workout Protocol**: ${suggestion.fitnessStrategy.headline}
- 🧠 **Behavioral Focus**: ${suggestion.behavioralProtocol.primaryChallengeAddressed}

You can sync your training sessions to Google Calendar or export your grocery list to Google Keep anytime!`,
      timestamp: new Date().toISOString(),
      reasoningSteps: suggestion.agentThoughtTrace.map((t) => ({
        agentName: t.agentName as any,
        thought: t.reasoning,
      })),
    };
    setMessages((prev) => [...prev, confirmationMsg]);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Ambient Glow Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onOpenProfile={() => setIsProfileOpen(true)}
        currentStreak={7}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            macros={macros}
            meals={meals}
            workouts={workouts}
            weightLogs={weightLogs}
            sleepLogs={sleepLogs}
            onLogWeight={handleLogWeight}
            onLogSleep={handleLogSleep}
            onToggleMealLog={handleToggleMealLog}
            onToggleWorkoutLog={handleToggleWorkoutLog}
            onOpenSync={() => setActiveTab('sync')}
            onOpenCoach={(prompt) => {
              setActiveTab('coach');
              if (prompt) handleSendMessage(prompt);
            }}
            onOpenPlan={() => setActiveTab('plan')}
            onOpenIntake={() => setActiveTab('intake')}
            onOpenCheckIn={() => setActiveTab('checkin')}
          />
        )}

        {activeTab === 'intake' && (
          <IntakeSuggestionHub
            currentProfile={profile}
            onApplyPlan={handleApplySuggestedPlan}
            onScheduleCalendar={() => setActiveTab('sync')}
            onExportKeep={() => setActiveTab('sync')}
            onOpenCoach={(prompt) => {
              setActiveTab('coach');
              if (prompt) handleSendMessage(prompt);
            }}
          />
        )}

        {activeTab === 'checkin' && (
          <PersonalHealthCheckIn
            currentProfile={profile}
            onApplyProfileChanges={(changes) => {
              const updated = { ...profile, ...changes };
              setProfile(updated);
              localStorage.setItem('equilibrium_user_profile', JSON.stringify(updated));
              const newMacros = calculateMacros(updated);
              setMeals(getDefaultMeals(newMacros));
            }}
            onOpenCoachWithContext={(prompt) => {
              setActiveTab('coach');
              handleSendMessage(prompt);
            }}
            onOpenSyncHub={() => setActiveTab('sync')}
          />
        )}

        {activeTab === 'plan' && (
          <PlanView
            profile={profile}
            macros={macros}
            meals={meals}
            workouts={workouts}
            onSyncCalendar={() => setActiveTab('sync')}
            onExportKeepGrocery={() => setActiveTab('sync')}
            onExportKeepMeals={() => setActiveTab('sync')}
            onExportKeepWorkouts={() => setActiveTab('sync')}
            onRegenerateWithAI={handleRegenerateWithAI}
            isGenerating={isGeneratingPlan}
          />
        )}

        {activeTab === 'rag' && (
          <RAGExplorer
            onAskAgentAboutTopic={handleAskAgentAboutTopic}
            onOpenCheckIn={() => setActiveTab('checkin')}
          />
        )}

        {activeTab === 'coach' && (
          <AgentCoach
            profile={profile}
            macros={macros}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isSendingMessage}
            onOpenSync={() => setActiveTab('sync')}
            onOpenIntake={() => setActiveTab('intake')}
          />
        )}

        {activeTab === 'sync' && (
          <WorkspaceSyncHub
            user={user}
            accessToken={accessToken}
            onSignIn={handleSignIn}
            workouts={workouts}
            meals={meals}
            macros={macros}
          />
        )}
      </main>

      {/* Immersive UI Telemetry Footer */}
      <footer className="mt-auto shrink-0 bg-slate-900/30 border-t border-white/5 py-4 px-4 sm:px-8 text-[11px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>MULTI-AGENT AI CORE | RAG CLINICAL CORPUS: 20 GUIDELINES | GEMINI-3.7-FLASH</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>WORKSPACE_SYNC: ACTIVE</span>
          <span>CALIBRATION: REAL-TIME</span>
        </div>
      </footer>

      {/* Health Profile Customizer Modal */}
      <ProfileModal
        profile={profile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSave={(updated) => {
          setProfile(updated);
          const newMacros = calculateMacros(updated);
          setMeals(getDefaultMeals(newMacros));
        }}
      />
    </div>
  );
}
export default App;
