// src/components/analytics/AnalyticsSuite.tsx
// Justification: Comprehensive animated visual charts suite offering multiple analytical perspectives:
// 1. Risk Tier Donut & Radial Gauges, 2. Decision & Data Flow Cascade, 3. Division x Department Heatmap,
// 4. 5-Axis AI Literacy Radar against 80% benchmark, 5. Tool Ecosystem & Horizon Velocity.

import React, { useState, useMemo } from 'react';
import { Workflow } from '../../types/workflow.js';
import { getTierNumber } from '../network3d/NodeDetailOverlay.js';
import {
  ShieldAlert,
  AlertTriangle,
  BarChart3,
  Info,
  PieChart,
  Layers,
  GitFork,
  Compass,
  Wrench,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export type AnalyticsViewMode =
  | 'overview'
  | 'decision_flow'
  | 'heatmap'
  | 'literacy_radar'
  | 'tools_velocity';

interface AnalyticsSuiteProps {
  workflows: Workflow[];
  onSelectWorkflow?: (workflow: Workflow) => void;
  onFilterLOB?: (lob: string) => void;
}

export const AnalyticsSuite: React.FC<AnalyticsSuiteProps> = ({
  workflows,
  onSelectWorkflow,
  onFilterLOB,
}) => {
  const [viewMode, setViewMode] = useState<AnalyticsViewMode>('overview');
  const [activeTier, setActiveTier] = useState<number | null>(null);

  // 1. Tier Metrics
  const tierCounts = useMemo(() => {
    return {
      t4: workflows.filter((w) => getTierNumber(w.risk_tier) === 4).length,
      t3: workflows.filter((w) => getTierNumber(w.risk_tier) === 3).length,
      t2: workflows.filter((w) => getTierNumber(w.risk_tier) === 2).length,
      t1: workflows.filter((w) => getTierNumber(w.risk_tier) === 1).length,
      total: workflows.length,
    };
  }, [workflows]);

  // 2. Heatmap Matrix
  const heatmapData = useMemo(() => {
    const lobs = ['Acima', 'Rent-A-Center', 'Brigit', 'Corporate', 'Mexico'];
    const departments = [
      'Underwriting',
      'Collections',
      'Marketing',
      'Store Operations',
      'HR',
      'Customer Support',
    ];

    const matrix: Record<
      string,
      Record<string, { count: number; maxTier: number; workflows: Workflow[] }>
    > = {};

    lobs.forEach((lob) => {
      matrix[lob] = {};
      departments.forEach((dept) => {
        const matches = workflows.filter(
          (w) =>
            w.lob === lob &&
            (w.department.toLowerCase().includes(dept.toLowerCase()) ||
              dept.toLowerCase().includes(w.department.toLowerCase()))
        );
        const maxTier = matches.reduce((max, w) => Math.max(max, getTierNumber(w.risk_tier)), 0);
        matrix[lob][dept] = {
          count: matches.length,
          maxTier,
          workflows: matches,
        };
      });
    });

    return { lobs, departments, matrix };
  }, [workflows]);

  // 3. Tool Ecosystem Frequency
  const toolStats = useMemo(() => {
    const counts: Record<string, number> = {};
    workflows.forEach((w) => {
      w.tools_used.forEach((tool) => {
        counts[tool] = (counts[tool] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([tool, count]) => ({ tool, count }))
      .sort((a, b) => b.count - a.count);
  }, [workflows]);

  // 4. Reattestation Timeline Horizon
  const timelineStats = useMemo(() => {
    const today = new Date().getTime();
    let overdue = 0;
    let due30 = 0;
    let due90 = 0;
    let due180Plus = 0;

    workflows.forEach((w) => {
      const dueDate = new Date(w.review_due).getTime();
      const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays < 0 && w.status !== 'Retired') overdue++;
      else if (diffDays <= 30) due30++;
      else if (diffDays <= 90) due90++;
      else due180Plus++;
    });

    return { overdue, due30, due90, due180Plus };
  }, [workflows]);

  // 5. 5-Axis Literacy Radar Coordinates (Acima, Rent-A-Center, Brigit, Corporate, Mexico)
  const radarData = useMemo(() => {
    const lobs = [
      { name: 'Acima', current: 72, target: 80, angle: 0 },
      { name: 'Rent-A-Center', current: 85, target: 80, angle: 72 },
      { name: 'Brigit', current: 65, target: 80, angle: 144 },
      { name: 'Corporate', current: 91, target: 80, angle: 216 },
      { name: 'Mexico', current: 78, target: 80, angle: 288 },
    ];

    const cx = 150;
    const cy = 150;
    const maxRadius = 100;

    // Helper to polar coordinates
    const toCoords = (percent: number, angleDeg: number) => {
      const angleRad = ((angleDeg - 90) * Math.PI) / 180;
      const r = (percent / 100) * maxRadius;
      return {
        x: cx + r * Math.cos(angleRad),
        y: cy + r * Math.sin(angleRad),
      };
    };

    const currentPoints = lobs
      .map((l) => {
        const pt = toCoords(l.current, l.angle);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');

    const targetPoints = lobs
      .map((l) => {
        const pt = toCoords(l.target, l.angle);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');

    return { lobs, currentPoints, targetPoints, cx, cy, maxRadius };
  }, []);

  // Donut chart math
  const total = tierCounts.total || 1;
  const p4 = (tierCounts.t4 / total) * 100;
  const p3 = (tierCounts.t3 / total) * 100;
  const p2 = (tierCounts.t2 / total) * 100;
  const p1 = (tierCounts.t1 / total) * 100;

  const circumference = 2 * Math.PI * 38;
  const offset4 = 0;
  const offset3 = -((p4 / 100) * circumference);
  const offset2 = -(((p4 + p3) / 100) * circumference);
  const offset1 = -(((p4 + p3 + p2) / 100) * circumference);

  return (
    <div className="space-y-6">
      {/* Visual Analytics View Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Executive Overview & Heatmap</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('decision_flow')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'decision_flow'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Decision & Data Flow</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'heatmap'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Divisional Heatmap</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('literacy_radar')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'literacy_radar'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>AI Literacy 5-Axis Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('tools_velocity')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'tools_velocity'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Tool Ecosystem & Horizon</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono px-3">
          {workflows.length} Governed Workflows Analyzed
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: RISK EXPOSURE, DONUT SWEEP & RADIAL GAUGES */}
      {/* ========================================================================= */}
      {viewMode === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Donut Card */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Risk Tier Distribution
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Functional risk cascade allocation across active records
                  </p>
                </div>
                <span className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                  <BarChart3 className="w-4 h-4" />
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                <div className="relative w-44 h-44 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-slate-100 dark:text-slate-800"
                    />

                    {/* Tier 1 Low */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="12"
                      strokeDasharray={`${(p1 / 100) * circumference} ${circumference}`}
                      strokeDashoffset={offset1}
                      className="transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                      onMouseEnter={() => setActiveTier(1)}
                      onMouseLeave={() => setActiveTier(null)}
                    />

                    {/* Tier 2 Moderate */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#eab308"
                      strokeWidth="12"
                      strokeDasharray={`${(p2 / 100) * circumference} ${circumference}`}
                      strokeDashoffset={offset2}
                      className="transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                      onMouseEnter={() => setActiveTier(2)}
                      onMouseLeave={() => setActiveTier(null)}
                    />

                    {/* Tier 3 High */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#f97316"
                      strokeWidth="12"
                      strokeDasharray={`${(p3 / 100) * circumference} ${circumference}`}
                      strokeDashoffset={offset3}
                      className="transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                      onMouseEnter={() => setActiveTier(3)}
                      onMouseLeave={() => setActiveTier(null)}
                    />

                    {/* Tier 4 Prohibited */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#f43f5e"
                      strokeWidth="12"
                      strokeDasharray={`${(p4 / 100) * circumference} ${circumference}`}
                      strokeDashoffset={offset4}
                      className="transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                      onMouseEnter={() => setActiveTier(4)}
                      onMouseLeave={() => setActiveTier(null)}
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {activeTier
                        ? activeTier === 4
                          ? tierCounts.t4
                          : activeTier === 3
                          ? tierCounts.t3
                          : activeTier === 2
                          ? tierCounts.t2
                          : tierCounts.t1
                        : tierCounts.total}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {activeTier ? `Tier ${activeTier}` : 'Total Active'}
                    </span>
                  </div>
                </div>

                {/* Interactive Legend */}
                <div className="space-y-2.5 w-full">
                  <div
                    onMouseEnter={() => setActiveTier(4)}
                    onMouseLeave={() => setActiveTier(null)}
                    className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      activeTier === 4
                        ? 'bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Tier 4 Prohibited
                      </span>
                    </div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      {tierCounts.t4} ({Math.round(p4)}%)
                    </span>
                  </div>

                  <div
                    onMouseEnter={() => setActiveTier(3)}
                    onMouseLeave={() => setActiveTier(null)}
                    className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      activeTier === 3
                        ? 'bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Tier 3 High Risk
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      {tierCounts.t3} ({Math.round(p3)}%)
                    </span>
                  </div>

                  <div
                    onMouseEnter={() => setActiveTier(2)}
                    onMouseLeave={() => setActiveTier(null)}
                    className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      activeTier === 2
                        ? 'bg-yellow-50 dark:bg-yellow-950/40 ring-1 ring-yellow-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Tier 2 Moderate
                      </span>
                    </div>
                    <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 tabular-nums">
                      {tierCounts.t2} ({Math.round(p2)}%)
                    </span>
                  </div>

                  <div
                    onMouseEnter={() => setActiveTier(1)}
                    onMouseLeave={() => setActiveTier(null)}
                    className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      activeTier === 1
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Tier 1 Low Risk
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {tierCounts.t1} ({Math.round(p1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shadow IT Gap Card */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Enterprise Coverage Ratio & Shadow IT Gap
                  </h3>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    License Telemetry vs Registry
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Comparing workflows registered in ServiceNow against active AI tool seats (GitHub Copilot, OpenAI, Claude, Microsoft Copilot).
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-end text-sm">
                    <div>
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                        {workflows.length}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1.5">
                        Governed Registrations (14.5%)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                        ~142
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1.5">
                        Estimated Unregistered (85.5%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex shadow-inner">
                    <div
                      style={{
                        width: `${(workflows.length / (workflows.length + 142)) * 100}%`,
                      }}
                      className="bg-blue-600 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-1000"
                    />
                    <div
                      style={{ width: `${(142 / (workflows.length + 142)) * 100}%` }}
                      className="bg-amber-500/80 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-1000"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Current Coverage: 14.5%</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      FY26 Target: 75% Governed
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  *Estimated from tool license counts vs. registrations. In production this is the number leadership should actually care about.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Radial Gauges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Tier 4 Prohibited Workflows</span>
              </div>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                {tierCounts.t4}
              </div>
              <p className="text-[10px] text-rose-500/80 mt-1">Autonomous Credit / Underwriting</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Tier 3 High Risk Workflows</span>
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                {tierCounts.t3}
              </div>
              <p className="text-[10px] text-amber-500/80 mt-1">Customer PII / Financial Impact</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/60 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Tier 2 Moderate Workflows</span>
              </div>
              <div className="text-3xl font-black text-yellow-600 dark:text-yellow-400 tabular-nums">
                {tierCounts.t2}
              </div>
              <p className="text-[10px] text-yellow-500/80 mt-1">Internal Confidential / Broad</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tier 1 Governed Workflows</span>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {tierCounts.t1}
              </div>
              <p className="text-[10px] text-emerald-500/80 mt-1">Non-Sensitive Personal Productivity</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DECISION & DATA FLOW CASCADE (SANKEY / FUNNEL) */}
      {/* ========================================================================= */}
      {viewMode === 'decision_flow' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitFork className="w-4 h-4 text-blue-600" />
              <span>Data Sensitivity & Decision Influence Risk Cascade</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualizing how input data categories and autonomous decision impacts mathematically drive assigned risk tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Column 1: Input Data Categories */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-1">
                1. Data Category Ingested
              </span>
              {[
                { label: 'Credit / Underwriting Data', count: 1, tier: 4, color: 'border-rose-500 bg-rose-50/40 text-rose-700' },
                { label: 'Customer Financial Data', count: 5, tier: 3, color: 'border-amber-500 bg-amber-50/40 text-amber-700' },
                { label: 'Customer PII (SSN, DOB)', count: 4, tier: 3, color: 'border-amber-500 bg-amber-50/40 text-amber-700' },
                { label: 'Employee / HR Data', count: 4, tier: 2, color: 'border-yellow-500 bg-yellow-50/40 text-yellow-700' },
                { label: 'Internal Confidential', count: 4, tier: 2, color: 'border-yellow-500 bg-yellow-50/40 text-yellow-700' },
                { label: 'Internal Non-Sensitive', count: 5, tier: 1, color: 'border-emerald-500 bg-emerald-50/40 text-emerald-700' },
                { label: 'Public Company Info', count: 1, tier: 1, color: 'border-emerald-500 bg-emerald-50/40 text-emerald-700' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-all hover:scale-102 ${item.color}`}
                >
                  <span>{item.label}</span>
                  <span className="font-mono font-bold">{item.count}</span>
                </div>
              ))}
            </div>

            {/* Column 2: Decision Influence */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-1">
                2. Decision Impact Scope
              </span>
              {[
                { label: 'Credit or Underwriting Decision', count: 1, tier: 4, color: 'border-rose-500 bg-rose-50/40 text-rose-700' },
                { label: 'Customer Service or Account Action', count: 4, tier: 3, color: 'border-amber-500 bg-amber-50/40 text-amber-700' },
                { label: 'Customer Communications', count: 3, tier: 3, color: 'border-amber-500 bg-amber-50/40 text-amber-700' },
                { label: 'Employee Affecting (Hiring, Eval)', count: 3, tier: 2, color: 'border-yellow-500 bg-yellow-50/40 text-yellow-700' },
                { label: 'Internal Operational (Staffing, Inv)', count: 5, tier: 2, color: 'border-yellow-500 bg-yellow-50/40 text-yellow-700' },
                { label: 'No Decision — Informational Only', count: 8, tier: 1, color: 'border-emerald-500 bg-emerald-50/40 text-emerald-700' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-all hover:scale-102 ${item.color}`}
                >
                  <span>{item.label}</span>
                  <span className="font-mono font-bold">{item.count}</span>
                </div>
              ))}
            </div>

            {/* Column 3: Resulting Governance Tier */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-1">
                3. Assigned Governance Route
              </span>
              {[
                {
                  tier: 'Tier 4 Prohibited',
                  route: 'Presumed Declined; AI Working Group Exception Only',
                  review: 'Immediate Block',
                  color: 'bg-rose-500 text-white',
                },
                {
                  tier: 'Tier 3 High Risk',
                  route: 'Program Lead + Security + Legal/GC Review',
                  review: 'Every 3 Months',
                  color: 'bg-amber-500 text-white',
                },
                {
                  tier: 'Tier 2 Moderate',
                  route: 'Program Lead Review',
                  review: 'Every 6 Months',
                  color: 'bg-yellow-400 text-slate-900 font-bold',
                },
                {
                  tier: 'Tier 1 Governed',
                  route: 'Auto-Approved, Logged in Registry',
                  review: 'Every 12 Months',
                  color: 'bg-emerald-500 text-white',
                },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl text-xs space-y-1 shadow-sm transition-transform hover:scale-102 ${t.color}`}
                >
                  <div className="font-black text-sm">{t.tier}</div>
                  <div className="opacity-90">{t.route}</div>
                  <div className="text-[10px] opacity-75 font-mono pt-1">
                    Reattestation Cycle: {t.review}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: DIVISION & DEPARTMENT HEATMAP */}
      {/* ========================================================================= */}
      {(viewMode === 'overview' || viewMode === 'heatmap') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Division &bull; Department Risk Density Heatmap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Color intensity indicates highest active risk tier; numbers indicate total citizen automations.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-800"></span> None</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Low</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-400"></span> Med</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Prohibited</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4 w-40">Division</th>
                  {heatmapData.departments.map((dept) => (
                    <th key={dept} className="py-3 px-3 text-center min-w-[110px]">
                      {dept}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {heatmapData.lobs.map((lob) => (
                  <tr key={lob} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      <button
                        type="button"
                        onClick={() => onFilterLOB && onFilterLOB(lob)}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                      >
                        {lob}
                      </button>
                    </td>
                    {heatmapData.departments.map((dept) => {
                      const cell = heatmapData.matrix[lob][dept];
                      const hasWorkflows = cell.count > 0;
                      const maxTier = cell.maxTier;

                      let bgClass = 'bg-slate-50 dark:bg-slate-800/40 text-slate-400';
                      if (hasWorkflows) {
                        if (maxTier === 4) bgClass = 'bg-rose-500 text-white font-bold shadow-sm';
                        else if (maxTier === 3) bgClass = 'bg-amber-500 text-white font-bold shadow-sm';
                        else if (maxTier === 2) bgClass = 'bg-yellow-400 text-slate-900 font-bold shadow-sm';
                        else bgClass = 'bg-emerald-500 text-white font-bold shadow-sm';
                      }

                      return (
                        <td key={dept} className="py-2.5 px-3 text-center">
                          <div
                            className={`w-full py-2 rounded-lg flex items-center justify-center gap-1 transition-transform hover:scale-105 cursor-pointer ${bgClass}`}
                            title={`${lob} - ${dept}: ${cell.count} workflows (Max Tier: ${maxTier || 'None'})`}
                            onClick={() => {
                              if (cell.workflows[0] && onSelectWorkflow) {
                                onSelectWorkflow(cell.workflows[0]);
                              }
                            }}
                          >
                            <span className="tabular-nums font-mono">{cell.count}</span>
                            {maxTier === 4 && <ShieldAlert className="w-3 h-3 text-white" />}
                            {maxTier === 3 && <AlertTriangle className="w-3 h-3 text-white" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: 5-AXIS AI LITERACY POLAR / RADAR CHART */}
      {/* ========================================================================= */}
      {viewMode === 'literacy_radar' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>AI Literacy 5-Axis Polar Radar against 80% Benchmark</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Measures current employee workforce training completion rates across all 5 Upbound operating divisions against the 80% enterprise standard.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span> Current Completion
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500"></span> 80% Target Line
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* SVG Polar Radar */}
            <div className="md:col-span-6 flex justify-center py-4">
              <svg viewBox="0 0 300 300" className="w-72 h-72">
                {/* Concentric Rings (20%, 40%, 60%, 80%, 100%) */}
                {[20, 40, 60, 80, 100].map((ring) => (
                  <circle
                    key={ring}
                    cx={radarData.cx}
                    cy={radarData.cy}
                    r={(ring / 100) * radarData.maxRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={ring === 80 ? '2' : '1'}
                    strokeDasharray={ring === 80 ? '4 2' : undefined}
                    className={
                      ring === 80
                        ? 'text-rose-400 dark:text-rose-500'
                        : 'text-slate-200 dark:text-slate-800'
                    }
                  />
                ))}

                {/* 5 Radial Axes */}
                {radarData.lobs.map((lob, i) => {
                  const rad = ((lob.angle - 90) * Math.PI) / 180;
                  const ex = radarData.cx + radarData.maxRadius * Math.cos(rad);
                  const ey = radarData.cy + radarData.maxRadius * Math.sin(rad);
                  return (
                    <g key={i}>
                      <line
                        x1={radarData.cx}
                        y1={radarData.cy}
                        x2={ex}
                        y2={ey}
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-700"
                        strokeWidth="1"
                      />
                      <text
                        x={radarData.cx + (radarData.maxRadius + 18) * Math.cos(rad)}
                        y={radarData.cy + (radarData.maxRadius + 18) * Math.sin(rad)}
                        fontSize="10"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        className="fill-slate-700 dark:fill-slate-300 font-bold"
                      >
                        {lob.name}
                      </text>
                    </g>
                  );
                })}

                {/* Target Polygon (80% Benchmark) */}
                <polygon
                  points={radarData.targetPoints}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* Current Completion Polygon */}
                <polygon
                  points={radarData.currentPoints}
                  fill="rgba(59, 130, 246, 0.25)"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />

                {/* Data Points */}
                {radarData.lobs.map((lob, i) => {
                  const rad = ((lob.angle - 90) * Math.PI) / 180;
                  const r = (lob.current / 100) * radarData.maxRadius;
                  const px = radarData.cx + r * Math.cos(rad);
                  const py = radarData.cy + r * Math.sin(rad);
                  return (
                    <circle
                      key={i}
                      cx={px}
                      cy={py}
                      r="4"
                      className="fill-blue-600 stroke-white stroke-2"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Division Comparison Breakdown */}
            <div className="md:col-span-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-1">
                LOB Training Completion vs. 80% Benchmark
              </span>

              {radarData.lobs.map((l) => {
                const meets = l.current >= l.target;
                return (
                  <div key={l.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{l.name}</span>
                      <span className={`font-mono font-bold ${meets ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {l.current}% / {l.target}% target
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      <div
                        style={{ width: `${l.current}%` }}
                        className={`h-full rounded-full ${meets ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                      <div
                        style={{ left: '80%' }}
                        className="absolute top-0 bottom-0 w-0.5 border-r border-dashed border-rose-600 z-10"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: TOOL ECOSYSTEM & REATTESTATION HORIZON */}
      {/* ========================================================================= */}
      {viewMode === 'tools_velocity' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Tool Ecosystem Distribution */}
            <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>Approved AI Tool Adoption Velocity</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tool distribution across registered citizen developer workflows
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {toolStats.map((t) => (
                  <div key={t.tool} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-800 dark:text-slate-200">{t.tool}</span>
                      <span className="font-mono text-slate-500">{t.count} workflows</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <div
                        style={{ width: `${(t.count / workflows.length) * 100}%` }}
                        className="h-full rounded-full bg-blue-600 transition-all duration-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reattestation Horizon Timeline */}
            <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Periodic Reattestation Horizon</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Governance review deadlines across the next 12 months
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Overdue for Review</span>
                  </div>
                  <span className="text-xl font-black text-rose-700 dark:text-rose-400 tabular-nums font-mono">
                    {timelineStats.overdue}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span>Due in &le; 30 Days</span>
                  </div>
                  <span className="text-xl font-black text-amber-700 dark:text-amber-400 tabular-nums font-mono">
                    {timelineStats.due30}
                  </span>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                    <Clock className="w-4 h-4" />
                    <span>Due in 31–90 Days</span>
                  </div>
                  <span className="text-xl font-black text-blue-700 dark:text-blue-400 tabular-nums font-mono">
                    {timelineStats.due90}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Compliant (&gt; 90 Days)</span>
                  </div>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums font-mono">
                    {timelineStats.due180Plus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
