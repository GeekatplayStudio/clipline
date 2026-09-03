// src/components/readiness/CertificationReadinessPage.tsx
// Justification: Executive certification and regulatory readiness cockpit showing overall red-to-green progress, framework cards, expandable requirement dossiers, and interactive milestone auditing.

import React, { useState, useMemo } from 'react';
import { INITIAL_FRAMEWORKS } from '../../data/readiness_frameworks';
import { CertificationFramework, FrameworkCategory } from '../../types/readiness';
import { Award, FileText, Search } from 'lucide-react';
import { FrameworkCards } from './FrameworkCards.js';
import { getProgressBadge, getProgressColor } from './readinessPresentation.js';

interface CertificationReadinessPageProps {
  onOpenExport?: () => void;
}

export const CertificationReadinessPage: React.FC<CertificationReadinessPageProps> = ({ onOpenExport }) => {
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

  // Filter frameworks
  const filteredFrameworks = useMemo(() => {
    return frameworks.filter((fw) => {
      const matchesCategory = selectedCategory === 'all' || fw.category === selectedCategory;
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
            Audit-ready benchmarking against ISO 42001 (AIMS), NIST AI RMF 1.0, EU AI Act Article 4, and U.S.
            Consumer Finance Statutes.
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
              Cumulative compliance score across certifiable systems, voluntary taxonomies, statutory finance
              rules, and LMS competency integration.
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
            <span className="text-lg font-bold text-slate-900 dark:text-white">ISO 42001: 68%</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-0.5">
              Target: Q4 2026 Audit
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Voluntary Taxonomy
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">NIST AI RMF: 82%</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
              G-M-M-M Mapped
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Legal AI Literacy
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">EU AI Act Art 4: 90%</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
              Enforceable Since Feb 2025
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Consumer Finance (CFPB)
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Reg B / Adverse: 74%</span>
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

      <FrameworkCards
        frameworks={filteredFrameworks}
        expandedId={expandedId}
        onToggleFramework={(frameworkId) =>
          setExpandedId((current) => (current === frameworkId ? null : frameworkId))
        }
        onToggleMilestone={handleToggleMilestone}
      />
    </div>
  );
};
