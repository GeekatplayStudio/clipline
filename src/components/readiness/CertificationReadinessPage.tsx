// src/components/readiness/CertificationReadinessPage.tsx
// Justification: Executive certification and regulatory readiness cockpit showing overall red-to-green progress, framework cards, expandable requirement dossiers, and interactive milestone auditing.

import React, { useState, useMemo } from 'react';
import { INITIAL_FRAMEWORKS } from '../../data/readiness_frameworks';
import { CertificationFramework, FrameworkCategory } from '../../types/readiness';
import {
  ShieldCheck,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  CheckSquare,
  Square,
  Quote,
  Layers,
  Sparkles,
  Target,
  Clock,
  UserCheck,
} from 'lucide-react';

interface CertificationReadinessPageProps {
  onOpenExport?: () => void;
}

export const CertificationReadinessPage: React.FC<CertificationReadinessPageProps> = ({
  onOpenExport,
}) => {
  const [frameworks, setFrameworks] = useState<CertificationFramework[]>(INITIAL_FRAMEWORKS);
  const [expandedId, setExpandedId] = useState<string | null>('iso-42001'); // Default expand ISO 42001
  const [selectedCategory, setSelectedCategory] = useState<FrameworkCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Toggle milestone completion
  const handleToggleMilestone = (frameworkId: string, milestoneId: string) => {
    setFrameworks((prev) =>
      prev.map((fw) => {
        if (fw.id !== frameworkId) return fw;

        const updatedMilestones = fw.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );

        // Recalculate percentage based on milestones
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const newPercentage = Math.round((completedCount / updatedMilestones.length) * 100);

        return {
          ...fw,
          milestones: updatedMilestones,
          progressPercentage: newPercentage,
          status:
            newPercentage >= 90
              ? 'audit_ready'
              : newPercentage >= 70
              ? 'substantially_ready'
              : newPercentage >= 50
              ? 'in_progress'
              : 'critical_gap',
        };
      })
    );
  };

  // Compute Overall Aggregate Progress (Red to Green)
  const overallProgress = useMemo(() => {
    const total = frameworks.reduce((acc, fw) => acc + fw.progressPercentage, 0);
    return Math.round(total / frameworks.length);
  }, [frameworks]);

  // Color helper for progress
  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'from-emerald-500 to-teal-500';
    if (percent >= 60) return 'from-yellow-400 to-amber-500';
    if (percent >= 40) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-600';
  };

  const getProgressBadge = (percent: number) => {
    if (percent >= 85) {
      return {
        label: 'Audit Ready',
        color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300',
      };
    }
    if (percent >= 70) {
      return {
        label: 'Substantially Ready',
        color: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300',
      };
    }
    if (percent >= 50) {
      return {
        label: 'In Progress',
        color: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-300',
      };
    }
    return {
      label: 'Critical Gap',
      color: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300',
    };
  };

  // Filter frameworks
  const filteredFrameworks = useMemo(() => {
    return frameworks.filter((fw) => {
      const matchesCategory =
        selectedCategory === 'all' || fw.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        fw.name.toLowerCase().includes(q) ||
        fw.code.toLowerCase().includes(q) ||
        fw.summary.toLowerCase().includes(q) ||
        fw.whatItIs.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [frameworks, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Banner & Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
              Governance, Risk & Compliance (GRC)
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Standards, Certifications & Regulatory Readiness
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit-ready benchmarking against ISO 42001 (AIMS), NIST AI RMF 1.0, EU AI Act Article 4, and U.S. Consumer Finance Statutes.
          </p>
        </div>

        {onOpenExport && (
          <button
            type="button"
            onClick={onOpenExport}
            className="text-xs self-start sm:self-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold px-3 py-1.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Audit Dossier</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP EXECUTIVE RED-TO-GREEN OVERALL READINESS BAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enterprise Aggregate Certification & Regulatory Readiness
              </h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getProgressBadge(overallProgress).color}`}
              >
                {getProgressBadge(overallProgress).label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cumulative compliance score across certifiable systems, voluntary taxonomies, statutory finance rules, and LMS competency integration.
            </p>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {overallProgress}%
            </span>
            <span className="text-xs text-slate-400 font-medium">overall</span>
          </div>
        </div>

        {/* The Continuous Red-to-Green Gradient Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 relative shadow-inner">
            <div
              style={{ width: `${overallProgress}%` }}
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(overallProgress)} transition-all duration-700 ease-out shadow-sm`}
            />
          </div>

          {/* Scale Markers */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-0.5">
            <span className="text-rose-500 font-semibold">0% Critical Gap</span>
            <span className="text-amber-500 font-semibold">50% Developing</span>
            <span className="text-blue-500 font-semibold">75% Substantially Ready</span>
            <span className="text-emerald-500 font-semibold">100% Fully Certified</span>
          </div>
        </div>

        {/* 4 Summary Telemetry Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Certifiable AIMS
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ISO 42001: 68%
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-0.5">
              Target: Q4 2026 Audit
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Voluntary Taxonomy
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              NIST AI RMF: 82%
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
              G-M-M-M Mapped
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Legal AI Literacy
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              EU AI Act Art 4: 90%
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
              Enforceable Since Feb 2025
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Consumer Finance (CFPB)
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Reg B / Adverse: 74%
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">
              Strict Explainability Notice
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Frameworks ({frameworks.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('certifiable')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'certifiable'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Certifiable Standards (ISO 42001)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('voluntary')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'voluntary'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Voluntary Taxonomies (NIST RMF)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('regulatory')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'regulatory'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Statutory & Finance (CFPB / EU)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('systems')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'systems'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Core Systems (ServiceNow & LMS)
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search standards, clauses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FRAMEWORK CARDS WITH EXPANDABLE DOSSIERS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {filteredFrameworks.map((fw) => {
          const isExpanded = expandedId === fw.id;
          const badge = getProgressBadge(fw.progressPercentage);

          return (
            <div
              key={fw.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all overflow-hidden"
            >
              {/* Card Header (Always Visible) */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : fw.id)}
                className="p-5 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
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

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {fw.name}
                    </h4>

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
                    <span className="hidden sm:inline">
                      {isExpanded ? 'Collapse' : 'Explain & Details'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* EXPANDABLE SECTION ("expandible down to explane what it is and what does it take") */}
              {/* ===================================================================== */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-6 animate-in slide-in-from-top-2 duration-200">
                  {/* Meta Bar */}
                  <div className="flex flex-wrap items-center gap-6 py-2 px-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Target className="w-3.5 h-3.5 text-blue-500" />
                      <span><strong>Target Window:</strong> {fw.targetDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span><strong>Lead Accountable:</strong> {fw.leadOwner}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span><strong>Audit Milestones:</strong> {fw.milestones.filter((m) => m.completed).length} / {fw.milestones.length} Completed</span>
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
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                          What It Is
                        </h5>
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
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {c.name}
                          </span>
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
                      <span className="text-xs text-slate-400">
                        Click checkbox to update live readiness
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {fw.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleToggleMilestone(fw.id, m.id)}
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
                            <span className={m.completed ? 'font-medium' : ''}>
                              {m.label}
                            </span>
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
    </div>
  );
};
