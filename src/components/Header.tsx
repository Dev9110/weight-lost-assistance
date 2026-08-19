import React from 'react';
import { Sparkles, Calendar, BookOpen, Bot, Flame, LogOut, Activity, Stethoscope } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: 'dashboard' | 'intake' | 'checkin' | 'plan' | 'rag' | 'coach' | 'sync';
  setActiveTab: (tab: 'dashboard' | 'intake' | 'checkin' | 'plan' | 'rag' | 'coach' | 'sync') => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenProfile: () => void;
  currentStreak: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onSignIn,
  onSignOut,
  onOpenProfile,
  currentStreak,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#05070a]/90 backdrop-blur-2xl border-b border-white/5 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-slate-950 font-black text-xl shrink-0">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-500">
                  Siemens Wellness AI
                </h1>
                <span className="hidden sm:inline-block text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  RAG + LLM CORE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
                Autonomous Personalized Wellness AI
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
            <button
              id="nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              id="nav-intake"
              onClick={() => setActiveTab('intake')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'intake'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-emerald-300 bg-emerald-950/30 border border-emerald-500/20 hover:text-white hover:bg-emerald-900/40'
                }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Personalize AI
            </button>

            <button
              id="nav-checkin"
              onClick={() => setActiveTab('checkin')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'checkin'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-cyan-300 bg-cyan-950/30 border border-cyan-500/20 hover:text-white hover:bg-cyan-900/40'
                }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
              Health Check-In
            </button>

            <button
              id="nav-coach"
              onClick={() => setActiveTab('coach')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'coach'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
            >
              <Bot className="w-3.5 h-3.5 text-teal-400" />
              AI Coach
            </button>

            <button
              id="nav-plan"
              onClick={() => setActiveTab('plan')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'plan'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
            >
              Meals & Training
            </button>

            <button
              id="nav-rag"
              onClick={() => setActiveTab('rag')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'rag'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              RAG Science
            </button>

            <button
              id="nav-sync"
              onClick={() => setActiveTab('sync')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'sync'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Sync Hub
            </button>
          </nav>

          {/* Right Status Pill & Auth Control */}
          <div className="flex items-center gap-3">
            {/* Immersive Status Pill */}
            <div className="hidden sm:flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 rounded-full py-1.5 px-3.5 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[11px] font-mono text-emerald-400 tracking-wider">AI ACTIVE</span>
              <div className="w-px h-3.5 bg-slate-800" />
              <div className="flex items-center gap-1 text-[11px] text-amber-300 font-semibold font-mono">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{currentStreak}d Streak</span>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  id="btn-user-profile-header"
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-2xl py-1.5 px-3 transition-all"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-6 h-6 rounded-full border border-emerald-500/50"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-200 hidden md:inline">
                    {user.displayName || user.email?.split('@')[0] || 'Profile'}
                  </span>
                </button>

                <button
                  id="btn-signout"
                  onClick={onSignOut}
                  className="p-2 bg-slate-900/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-2xl border border-white/5 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-signin-google"
                onClick={onSignIn}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-2xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <span>Connect Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-none text-xs border-t border-white/5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-900/40'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('intake')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${activeTab === 'intake'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/20'
              }`}
          >
            Personalize AI
          </button>
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${activeTab === 'checkin'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/20'
              }`}
          >
            Health Check-In
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${activeTab === 'coach'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-900/40'
              }`}
          >
            AI Coach
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${activeTab === 'plan'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-900/40'
              }`}
          >
            Meals & Training
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${activeTab === 'rag'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-900/40'
              }`}
          >
            RAG Science
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${activeTab === 'sync'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-900/40'
              }`}
          >
            Sync Hub
          </button>
        </div>
      </div>
    </header>
  );
};
