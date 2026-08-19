import React from 'react';
import { Sparkles, Calendar, BookOpen, Bot, Code2, RefreshCw, Flame, LogOut, ShieldCheck, Activity } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: 'dashboard' | 'plan' | 'rag' | 'coach' | 'sync' | 'python';
  setActiveTab: (tab: 'dashboard' | 'plan' | 'rag' | 'coach' | 'sync' | 'python') => void;
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
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-slate-950 font-black text-xl shrink-0">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-500">
                  VITA AGENT v2.0
                </h1>
                <span className="hidden sm:inline-block text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  RAG ENGINE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
                Autonomous Personalized Weight Management
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
            <button
              id="nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              id="nav-plan"
              onClick={() => setActiveTab('plan')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'plan'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Meals & Training
            </button>

            <button
              id="nav-coach"
              onClick={() => setActiveTab('coach')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'coach'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              AI Coach
            </button>

            <button
              id="nav-rag"
              onClick={() => setActiveTab('rag')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'rag'
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
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'sync'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar & Keep
            </button>

            <button
              id="nav-python"
              onClick={() => setActiveTab('python')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'python'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Python Hub
            </button>
          </nav>

          {/* Right Status Pill & Auth Control */}
          <div className="flex items-center gap-3">
            {/* Immersive RAG Status Pill */}
            <div className="hidden sm:flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 rounded-full py-1.5 px-3.5 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[11px] font-mono text-emerald-400 tracking-wider">RAG: ACTIVE</span>
              <div className="w-px h-3.5 bg-slate-800" />
              <div className="flex items-center gap-1 text-[11px] text-amber-300 font-semibold font-mono">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{currentStreak}d</span>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  id="btn-user-profile"
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/5 transition-all text-xs text-slate-200 shadow-md"
                  title="Edit Health Profile"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full border border-slate-700" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline font-semibold max-w-[100px] truncate text-[11px]">
                    {user.displayName?.split(' ')[0] || 'Profile'}
                  </span>
                </button>

                <button
                  id="btn-signout"
                  onClick={onSignOut}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900/80 rounded-xl transition-colors border border-transparent hover:border-white/5"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-google-signin"
                onClick={onSignIn}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-4 py-2 rounded-full text-xs shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Connect Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-1.5 scrollbar-none border-t border-white/5 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-900/40'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
              activeTab === 'plan'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-900/40'
            }`}
          >
            Meals & Training
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
              activeTab === 'coach'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-900/40'
            }`}
          >
            AI Coach
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
              activeTab === 'rag'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-900/40'
            }`}
          >
            RAG Science
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
              activeTab === 'sync'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-900/40'
            }`}
          >
            Calendar & Keep
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
              activeTab === 'python'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 bg-slate-900/40'
            }`}
          >
            Python Hub
          </button>
        </div>
      </div>
    </header>
  );
};
