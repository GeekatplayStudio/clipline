import React from 'react';
import { CertificationFramework } from '../../types/readiness.js';
import {
  BookOpen,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Quote,
  ShieldCheck,
  Sparkles,
  Square,
  Target,
  UserCheck,
} from 'lucide-react';
import { getProgressBadge, getProgressColor } from './readinessPresentation.js';

interface FrameworkCardsProps {
  frameworks: CertificationFramework[];
  expandedId: string | null;
  onToggleFramework: (frameworkId: string) => void;
  onToggleMilestone: (frameworkId: string, milestoneId: string) => void;
}

export const FrameworkCards: React.FC<FrameworkCardsProps> = ({
  frameworks,
  expandedId,
  onToggleFramework,
  onToggleMilestone,
}) => (
  <>
    {/* ========================================================================= */}
    {/* 2. FRAMEWORK CARDS WITH EXPANDABLE DOSSIERS */}
    {/* ========================================================================= */}
    <div className="space-y-4">
      {frameworks.map((fw) => {
        const isExpanded = expandedId === fw.id;
        const badge = getProgressBadge(fw.progressPercentage);

        return (
          <div
            key={fw.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all overflow-hidden"
          >
            {/* Card Header (Always Visible) */}
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => onToggleFramework(fw.id)}
              className="w-full text-left p-5 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {fw.code}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-medium">
                      {fw.categoryLabel}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{fw.name}</h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 max-w-3xl">
                    {fw.summary}
                  </p>
                </div>
              </div>

              {/* Progress bar and toggle button */}
              <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="w-44 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">Readiness</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {fw.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div
                      style={{ width: `${fw.progressPercentage}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(fw.progressPercentage)} transition-all duration-500`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span className="hidden sm:inline">{isExpanded ? 'Collapse' : 'Explain & Details'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {/* ===================================================================== */}
            {/* EXPANDABLE SECTION ("expandible down to explane what it is and what does it take") */}
            {/* ===================================================================== */}
            {isExpanded && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-6 animate-in slide-in-from-top-2 duration-200">
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center gap-6 py-2 px-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    <span>
                      <strong>Target Window:</strong> {fw.targetDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      <strong>Lead Accountable:</strong> {fw.leadOwner}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      <strong>Audit Milestones:</strong> {fw.milestones.filter((m) => m.completed).length} /{' '}
                      {fw.milestones.length} Completed
                    </span>
                  </div>
                </div>

                {/* Two Column Grid: What it is & What it takes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Block 1: What It Is */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-md">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">What It Is</h5>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {fw.whatItIs}
                    </p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                        Why It Matters To Upbound:
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {fw.whyItMatters}
                      </p>
                    </div>
                  </div>

                  {/* Block 2: What Does It Take */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-md">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        What Does It Take To Achieve
                      </h5>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {fw.whatItTakes.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Key Clauses & Functions Breakdown Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>Key Named Clauses, Controls & Functions</span>
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {fw.keyClausesOrFunctions.map((c, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-1.5"
                      >
                        <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[11px] block">
                          {c.ref}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          {c.description}
                        </p>
                        <div className="pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          &bull; Hook: {c.hook}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Milestones Checklist */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                      <span>Interactive Implementation Milestones</span>
                    </h5>
                    <span className="text-xs text-slate-400">Click checkbox to update live readiness</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {fw.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => onToggleMilestone(fw.id, m.id)}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          m.completed
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-slate-900 dark:text-slate-100'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {m.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className={m.completed ? 'font-medium' : ''}>{m.label}</span>
                        </div>

                        {m.clauseRef && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                            {m.clauseRef}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* The Executive Soundbite / Phrasing */}
                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    <Quote className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Executive Phrasing / The Exact Interview Line</span>
                  </div>
                  <p className="text-xs text-blue-950 dark:text-blue-100 italic font-serif leading-relaxed">
                    {fw.executiveLine}
                  </p>
                </div>

                {/* Audit Artifacts */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Verifiable Audit Artifacts:
                  </span>
                  {fw.auditArtifacts.map((art, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-mono"
                    >
                      📄 {art}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </>
);
