import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { PlanView } from './components/PlanView';
import { RAGExplorer } from './components/RAGExplorer';
import { AgentCoach } from './components/AgentCoach';
import { WorkspaceSyncHub } from './components/WorkspaceSyncHub';
import { PythonHub } from './components/PythonHub';
import { ProfileModal } from './components/ProfileModal';
import {
  UserProfile,
  MacroTargets,
  MealItem,
  WorkoutSession,
  WeightLogEntry,
  ChatMessage,
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plan' | 'rag' | 'coach' | 'sync' | 'python'>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('equilibrium_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
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
      } catch (e) {}
    }
    return getDefaultMeals(macros);
  });

  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('equilibrium_workouts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return getDefaultWorkouts();
  });

  // Weight History
  const [weightLogs, setWeightLogs] = useState<WeightLogEntry[]>(() => {
    const saved = localStorage.getItem('equilibrium_weight_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { date: '2026-08-18', weightKg: 82.5, notes: 'Starting weigh-in' },
      { date: '2026-08-11', weightKg: 83.2 },
      { date: '2026-08-04', weightKg: 83.9 },
    ];
  });

  // Agent Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'agent',
      role: 'orchestrator',
      text: `Hello ${profile.name}! I am your Autonomous Weight Loss & Wellness Agent (Vita Agent v2.0).

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
          role: role || 'orchestrator',
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
            onLogWeight={handleLogWeight}
            onToggleMealLog={handleToggleMealLog}
            onToggleWorkoutLog={handleToggleWorkoutLog}
            onOpenSync={() => setActiveTab('sync')}
            onOpenCoach={() => setActiveTab('coach')}
            onOpenPlan={() => setActiveTab('plan')}
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
          <RAGExplorer onAskAgentAboutTopic={handleAskAgentAboutTopic} />
        )}

        {activeTab === 'coach' && (
          <AgentCoach
            profile={profile}
            macros={macros}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isSendingMessage}
            onOpenSync={() => setActiveTab('sync')}
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

        {activeTab === 'python' && (
          <PythonHub profile={profile} macros={macros} />
        )}
      </main>

      {/* Immersive UI Telemetry Footer */}
      <footer className="mt-auto shrink-0 bg-slate-900/30 border-t border-white/5 py-4 px-4 sm:px-8 text-[11px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PYTHON-AGENT_CORE_3.9 | VECTOR_DB: RAG_METABOLISM_24 | MODEL: GEMINI-3.7-FLASH</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>WORKSPACE_SYNC: ACTIVE</span>
          <span>LATENCY: 42ms</span>
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
