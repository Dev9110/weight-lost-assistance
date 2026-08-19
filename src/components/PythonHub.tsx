import React, { useState } from 'react';
import { UserProfile, MacroTargets } from '../types';
import { generatePythonAgentScript } from '../data/pythonScriptGenerator';
import { Code2, Copy, Download, Terminal, Check, Sparkles, BookOpen, Calendar, CheckSquare, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PythonHubProps {
  profile: UserProfile;
  macros: MacroTargets;
}

export const PythonHub: React.FC<PythonHubProps> = ({ profile, macros }) => {
  const [copied, setCopied] = useState(false);
  const scriptContent = generatePythonAgentScript(
    profile.name || 'User',
    macros.calories,
    macros.proteinGrams
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    confetti({ particleCount: 35, spread: 50 });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptContent], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personalized_weight_loss_rag_agent.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Python RAG & Agent Engine
              </span>
              <span className="text-xs text-slate-400">google-genai + Google Workspace Automation</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Standalone Python AI Agent</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Run this complete, production-ready Python script locally to orchestrate RAG retrieval, Gemini 2.5/3.7 reasoning, Google Calendar scheduling, and Google Keep note generation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-python-script"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                copied ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Script!' : 'Copy Code'}</span>
            </button>
            <button
              id="btn-download-python-script"
              onClick={handleDownload}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-5">
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <BookOpen className="w-4 h-4" /> RAG Knowledge
            </div>
            <p className="text-[11px] text-slate-400 mt-1">In-memory semantic vector corpus on energy balance & protein leverage</p>
          </div>

          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" /> Agentic AI Chain
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Multi-step reasoning persona powered by Google GenAI</p>
          </div>

          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Calendar className="w-4 h-4" /> Calendar Sync
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Direct REST OAuth scheduling into primary Google Calendar</p>
          </div>

          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <CheckSquare className="w-4 h-4" /> Keep Notes
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Generates formatted markdown checklists for grocery & meal prep</p>
          </div>
        </div>
      </div>

      {/* Execution Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          How to Run Locally
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400">1. Install Dependencies</span>
            <pre className="bg-slate-900 p-2 rounded text-[11px] text-slate-300 font-mono overflow-x-auto">
              pip install google-genai numpy
            </pre>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-teal-400">2. Set Gemini API Key</span>
            <pre className="bg-slate-900 p-2 rounded text-[11px] text-slate-300 font-mono overflow-x-auto">
              export GEMINI_API_KEY="AIzaSy..."
            </pre>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400">3. Run Agent</span>
            <pre className="bg-slate-900 p-2 rounded text-[11px] text-slate-300 font-mono overflow-x-auto">
              python weight_loss_agent.py
            </pre>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2">personalized_weight_loss_agent.py</span>
          </div>

          <button
            onClick={handleCopy}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed bg-slate-950/80">
          <code>{scriptContent}</code>
        </pre>
      </div>
    </div>
  );
};
