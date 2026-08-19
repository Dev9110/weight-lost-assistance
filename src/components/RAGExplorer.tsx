import React, { useState } from 'react';
import { RAG_KNOWLEDGE_BASE, searchRAGKnowledge } from '../data/ragKnowledgeBase';
import { RAGDocument } from '../types';
import { Search, BookOpen, CheckCircle2, Lightbulb, Zap, Database } from 'lucide-react';

interface RAGExplorerProps {
  onAskAgentAboutTopic?: (topic: string) => void;
}

export const RAGExplorer: React.FC<RAGExplorerProps> = ({ onAskAgentAboutTopic }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<RAGDocument | null>(RAG_KNOWLEDGE_BASE[0]);

  const categories = [
    { id: 'all', label: 'All Research' },
    { id: 'energy_balance', label: 'Energy Balance & Deficit' },
    { id: 'macronutrients', label: 'Protein & Satiety' },
    { id: 'exercise_physiology', label: 'Resistance & NEAT' },
    { id: 'behavioral_psychology', label: 'Sleep & Habits' },
    { id: 'metabolism', label: 'Hydration & Lipolysis' },
    { id: 'supplements', label: 'Evidence Supplements' },
  ];

  const searchResults = searchQuery
    ? searchRAGKnowledge(searchQuery, 10).map((r) => r.document)
    : RAG_KNOWLEDGE_BASE;

  const filteredDocs = selectedCategory === 'all'
    ? searchResults
    : searchResults.filter((doc) => doc.category === selectedCategory);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            RAG Knowledge Engine
          </span>
          <span className="text-xs text-slate-400 font-mono">Corpus: 24 Clinical Studies Indexed</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Evidence-Based Research Repository</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Every meal recommendation, deficit target, and workout in this app is grounded in peer-reviewed clinical literature.
        </p>

        {/* Search Bar */}
        <div className="mt-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="input-rag-search"
            type="text"
            placeholder="Search clinical topics (e.g. protein leverage, sleep deprivation, NEAT, satiety index, creatine)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-950/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Document List & Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center gap-1.5">
            <Database className="w-3 h-3 text-emerald-400" />
            Indexed Studies ({filteredDocs.length})
          </div>

          {filteredDocs.map((doc) => {
            const isSelected = selectedDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer backdrop-blur-xl ${
                  isSelected
                    ? 'bg-slate-900/80 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-900/40 border-white/5 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {doc.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{doc.citations.length} Citations</span>
                </div>
                <h3 className="font-bold text-white text-xs leading-snug line-clamp-2">{doc.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{doc.summary}</p>
              </div>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="p-8 text-center bg-slate-900/40 border border-white/5 rounded-3xl text-slate-400 text-xs backdrop-blur-xl">
              No matching scientific papers found for "{searchQuery}".
            </div>
          )}
        </div>

        {/* Selected Document Detailed Deep Dive (Right 7 Cols) */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-6 sticky top-24 backdrop-blur-xl shadow-xl">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {selectedDoc.category.replace('_', ' ')}
                  </span>
                  {onAskAgentAboutTopic && (
                    <button
                      onClick={() => onAskAgentAboutTopic(selectedDoc.title)}
                      className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 px-3.5 py-1.5 rounded-xl transition-all shadow-md active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5" /> Ask Coach
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight leading-snug">{selectedDoc.title}</h2>
              </div>

              {/* Key Clinical Takeaways */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  Key Clinical Takeaways
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {selectedDoc.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Scientific Content */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Biological Mechanisms & Evidence
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-white/5 font-sans">
                  {selectedDoc.content}
                </p>
              </div>

              {/* Peer-Reviewed Citations */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  Peer-Reviewed Citations
                </h4>
                <ul className="space-y-2">
                  {selectedDoc.citations.map((cite, idx) => (
                    <li key={idx} className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-start gap-2 font-mono">
                      <span className="font-bold text-emerald-400 shrink-0">[{idx + 1}]</span>
                      <span className="italic font-sans">{cite}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/40 border border-white/5 rounded-3xl text-slate-400 text-xs backdrop-blur-xl">
              Select a research paper from the left to view evidence and citations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
