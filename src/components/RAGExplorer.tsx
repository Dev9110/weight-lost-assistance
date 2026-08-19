import React, { useState } from 'react';
import { RAG_KNOWLEDGE_BASE, searchRAGKnowledge } from '../data/ragKnowledgeBase';
import { CLINICAL_RAG_GUIDELINES, searchClinicalGuidelines } from '../data/clinicalRAGMetadata';
import { RAGDocument, ClinicalRAGGuideline } from '../types';
import {
  Search,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Zap,
  Database,
  ExternalLink,
  ShieldCheck,
  Building2,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

interface RAGExplorerProps {
  onAskAgentAboutTopic?: (topic: string) => void;
  onOpenCheckIn?: () => void;
}

export const RAGExplorer: React.FC<RAGExplorerProps> = ({ onAskAgentAboutTopic, onOpenCheckIn }) => {
  const [activeDataset, setActiveDataset] = useState<'clinical' | 'mechanisms'>('clinical');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  
  const [selectedClinicalDoc, setSelectedClinicalDoc] = useState<ClinicalRAGGuideline | null>(
    CLINICAL_RAG_GUIDELINES[0]
  );
  const [selectedMechanismDoc, setSelectedMechanismDoc] = useState<RAGDocument | null>(
    RAG_KNOWLEDGE_BASE[0]
  );

  const clinicalTopics = [
    { id: 'all', label: 'All Guidelines (20)' },
    { id: 'weight_management', label: 'Weight Management' },
    { id: 'physical_activity', label: 'Physical Activity' },
    { id: 'nutrition', label: 'Nutrition & Sugars' },
    { id: 'sleep_health', label: 'Sleep Health' },
    { id: 'insomnia_management', label: 'Insomnia & CBT-I' },
    { id: 'diabetes_management', label: 'Diabetes & CGM' },
    { id: 'diabetes_sleep_comorbidity', label: 'Diabetes & Sleep' },
    { id: 'hypertension', label: 'Hypertension / DASH' },
    { id: 'cardiovascular_health', label: "Life's Essential 8" },
    { id: 'mental_health', label: 'Mental Health' },
    { id: 'alcohol_use', label: 'Alcohol Health' },
    { id: 'cancer_screening', label: 'Cancer Screening' },
    { id: 'immunization', label: 'Immunization' },
  ];

  const mechanismCategories = [
    { id: 'all', label: 'All Mechanisms' },
    { id: 'energy_balance', label: 'Energy Balance & Deficit' },
    { id: 'macronutrients', label: 'Protein & Satiety' },
    { id: 'exercise_physiology', label: 'Resistance & NEAT' },
    { id: 'behavioral_psychology', label: 'Sleep & Habits' },
    { id: 'metabolism', label: 'Hydration & Lipolysis' },
    { id: 'supplements', label: 'Evidence Supplements' },
  ];

  // Filter clinical guidelines
  const filteredClinical = searchQuery
    ? searchClinicalGuidelines(searchQuery, { topic: selectedTopic, limit: 20 }).map((r) => r.guideline)
    : selectedTopic === 'all'
    ? CLINICAL_RAG_GUIDELINES
    : CLINICAL_RAG_GUIDELINES.filter((g) => g.topic === selectedTopic);

  // Filter physiological mechanisms
  const filteredMechanisms = searchQuery
    ? searchRAGKnowledge(searchQuery, 10).map((r) => r.document)
    : selectedTopic === 'all'
    ? RAG_KNOWLEDGE_BASE
    : RAG_KNOWLEDGE_BASE.filter((doc) => doc.category === selectedTopic);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Evidence Repository
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Corpus: 20 Clinical Guidelines + 8 Core Trials
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Evidence-Based Clinical & Research Repository
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              All nutritional strategies, deficit computations, and exercise prescriptions are grounded in peer-reviewed science and federal guidelines (NIH, CDC, WHO, ADA, AASM).
            </p>
          </div>

          {onOpenCheckIn && (
            <button
              id="btn-open-checkin-rag"
              onClick={onOpenCheckIn}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition-all shadow-lg active:scale-95 self-start sm:self-auto shrink-0"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Personal Health Check-In</span>
            </button>
          )}
        </div>

        {/* Dataset Switcher (Clinical Guidelines vs Mechanism Studies) */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-white/5 w-fit">
          <button
            onClick={() => {
              setActiveDataset('clinical');
              setSelectedTopic('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDataset === 'clinical'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Clinical Guidelines ({CLINICAL_RAG_GUIDELINES.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveDataset('mechanisms');
              setSelectedTopic('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDataset === 'mechanisms'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Physiological Mechanisms ({RAG_KNOWLEDGE_BASE.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="input-rag-search"
            type="text"
            placeholder={
              activeDataset === 'clinical'
                ? 'Search clinical guidelines (e.g. insomnia, blood pressure, DASH, diabetes CGM, portion size, sodium, CDC sleep)...'
                : 'Search physiological papers (e.g. protein leverage, sleep deprivation, NEAT, satiety index, creatine)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
          />
        </div>

        {/* Category / Topic Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
          {(activeDataset === 'clinical' ? clinicalTopics : mechanismCategories).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedTopic(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTopic === cat.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-950/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset View 1: Clinical Guidelines */}
      {activeDataset === 'clinical' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Guidelines Found ({filteredClinical.length})
              </span>
            </div>

            {filteredClinical.map((guide) => {
              const isSelected = selectedClinicalDoc?.id === guide.id;
              return (
                <div
                  key={guide.id}
                  onClick={() => setSelectedClinicalDoc(guide)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer backdrop-blur-xl ${
                    isSelected
                      ? 'bg-slate-900/80 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/40 border-white/5 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {guide.organization} ({guide.year})
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {guide.topic.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-xs leading-snug line-clamp-2">{guide.source}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {guide.knowledge_summary}
                  </p>
                </div>
              );
            })}

            {filteredClinical.length === 0 && (
              <div className="p-8 text-center bg-slate-900/40 border border-white/5 rounded-3xl text-slate-400 text-xs backdrop-blur-xl">
                No matching clinical guidelines found for "{searchQuery}".
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7">
            {selectedClinicalDoc ? (
              <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-5 sticky top-24 backdrop-blur-xl shadow-xl">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {selectedClinicalDoc.organization}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-white/5">
                        {selectedClinicalDoc.evidence_level.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {onAskAgentAboutTopic && (
                      <button
                        onClick={() => onAskAgentAboutTopic(selectedClinicalDoc.source)}
                        className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 px-3.5 py-1.5 rounded-xl transition-all shadow-md active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" /> Ask Coach
                      </button>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                    {selectedClinicalDoc.source}
                  </h2>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                    <span>Topic: <strong className="text-slate-300">{selectedClinicalDoc.topic.replace(/_/g, ' ')}</strong></span>
                    <span>•</span>
                    <span>Year: <strong className="text-slate-300">{selectedClinicalDoc.year}</strong></span>
                    <span>•</span>
                    <span>Target: <strong className="text-slate-300">{selectedClinicalDoc.population.join(', ')}</strong></span>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    Guideline Summary
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-white/5 font-sans">
                    {selectedClinicalDoc.knowledge_summary}
                  </p>
                </div>

                {/* Recommended Actions */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {selectedClinicalDoc.recommended_actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* When to Seek Care */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    When to Seek Care
                  </h4>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {selectedClinicalDoc.when_to_seek_care}
                  </p>
                </div>

                {/* Keywords & Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedClinicalDoc.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 text-slate-400 rounded-md border border-white/5">
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {selectedClinicalDoc.document_url && (
                    <a
                      href={selectedClinicalDoc.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold shrink-0"
                    >
                      <span>Primary Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Medical Disclaimer */}
                <div className="text-[10px] text-slate-500 bg-slate-950/40 p-3 rounded-xl border border-white/5 leading-relaxed">
                  <strong className="text-slate-400">Disclaimer:</strong> {selectedClinicalDoc.medical_disclaimer}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900/40 border border-white/5 rounded-3xl text-slate-400 text-xs backdrop-blur-xl">
                Select a clinical guideline from the left to view evidence and recommended actions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dataset View 2: Physiological Mechanisms */}
      {activeDataset === 'mechanisms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Document List (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center gap-1.5">
              <Database className="w-3 h-3 text-emerald-400" />
              Indexed Studies ({filteredMechanisms.length})
            </div>

            {filteredMechanisms.map((doc) => {
              const isSelected = selectedMechanismDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedMechanismDoc(doc)}
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
          </div>

          {/* Selected Document Detailed Deep Dive (Right 7 Cols) */}
          <div className="lg:col-span-7">
            {selectedMechanismDoc ? (
              <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-6 sticky top-24 backdrop-blur-xl shadow-xl">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {selectedMechanismDoc.category.replace('_', ' ')}
                    </span>
                    {onAskAgentAboutTopic && (
                      <button
                        onClick={() => onAskAgentAboutTopic(selectedMechanismDoc.title)}
                        className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 px-3.5 py-1.5 rounded-xl transition-all shadow-md active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" /> Ask Coach
                      </button>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight leading-snug">{selectedMechanismDoc.title}</h2>
                </div>

                {/* Key Clinical Takeaways */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    Key Clinical Takeaways
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {selectedMechanismDoc.keyTakeaways.map((takeaway, idx) => (
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
                    {selectedMechanismDoc.content}
                  </p>
                </div>

                {/* Peer-Reviewed Citations */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    Peer-Reviewed Citations
                  </h4>
                  <ul className="space-y-2">
                    {selectedMechanismDoc.citations.map((cite, idx) => (
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
      )}
    </div>
  );
};
