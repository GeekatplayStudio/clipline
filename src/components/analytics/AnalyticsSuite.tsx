// src/components/analytics/AnalyticsSuite.tsx
// Justification: Interactive animated visual charts suite including risk tier donut sweep, department risk heatmaps, and velocity comparisons.

import React, { useState, useMemo } from 'react';
import { Workflow } from '../../types/workflow.js';
import { getTierNumber } from '../network3d/NodeDetailOverlay.js';
import { ShieldAlert, AlertTriangle, BarChart3, Info } from 'lucide-react';

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
  const [activeTier, setActiveTier] = useState<number | null>(null);

  // Compute tier metrics
  const tierCounts = useMemo(() => {
    return {
      t4: workflows.filter((w) => getTierNumber(w.risk_tier) === 4).length,
      t3: workflows.filter((w) => getTierNumber(w.risk_tier) === 3).length,
      t2: workflows.filter((w) => getTierNumber(w.risk_tier) === 2).length,
      t1: workflows.filter((w) => getTierNumber(w.risk_tier) === 1).length,
      total: workflows.length,
    };
  }, [workflows]);

  // Compute LOB x Department Matrix for Heatmap
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

    const matrix: Record<string, Record<string, { count: number; maxTier: number; workflows: Workflow[] }>> = {};

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

  // Donut chart math
  const total = tierCounts.total || 1;
  const p4 = (tierCounts.t4 / total) * 100;
  const p3 = (tierCounts.t3 / total) * 100;
  const p2 = (tierCounts.t2 / total) * 100;
  const p1 = (tierCounts.t1 / total) * 100;

  // Perimeter for r=38 is 2 * PI * 38 ≈ 238.76
  const circumference = 2 * Math.PI * 38;
  const offset4 = 0;
  const offset3 = -((p4 / 100) * circumference);
  const offset2 = -(((p4 + p3) / 100) * circumference);
  const offset1 = -(((p4 + p3 + p2) / 100) * circumference);

  return (
    <div className="space-y-6">
      {/* Top Grid: Animated Risk Donut + Governed vs Shadow Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Animated Multi-Tier Exposure Donut */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Risk Tier Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Functional risk cascade allocation across all active records
              </p>
            </div>
            <span className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-100 dark:text-slate-800"
                />

                {/* Tier 1 Low Risk Ring (Emerald) */}
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

                {/* Tier 2 Moderate Risk Ring (Yellow) */}
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

                {/* Tier 3 High Risk Ring (Orange) */}
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

                {/* Tier 4 Prohibited Ring (Crimson) */}
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

              {/* Center Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {activeTier ? (activeTier === 4 ? tierCounts.t4 : activeTier === 3 ? tierCounts.t3 : activeTier === 2 ? tierCounts.t2 : tierCounts.t1) : tierCounts.total}
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {activeTier ? `Tier ${activeTier}` : 'Total Active'}
                </span>
              </div>
            </div>

            {/* Interactive Legend List */}
            <div className="space-y-2.5 w-full">
              <div
                onMouseEnter={() => setActiveTier(4)}
                onMouseLeave={() => setActiveTier(null)}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                  activeTier === 4 ? 'bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
                  activeTier === 3 ? 'bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
                  activeTier === 2 ? 'bg-yellow-50 dark:bg-yellow-950/40 ring-1 ring-yellow-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
                  activeTier === 1 ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
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

        {/* Card 2: Governed vs. Estimated Unregistered (The Shadow IT Footnote Metric) */}
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

            {/* Visual Ratio Bar */}
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

              {/* Progress Track */}
              <div className="w-full h-5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex shadow-inner">
                <div
                  style={{ width: `${(workflows.length / (workflows.length + 142)) * 100}%` }}
                  className="bg-blue-600 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-1000"
                  title="Registered & Governed"
                ></div>
                <div
                  style={{ width: `${(142 / (workflows.length + 142)) * 100}%` }}
                  className="bg-amber-500/80 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-1000"
                  title="Estimated Unregistered"
                ></div>
              </div>

              {/* Target Indicator */}
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>Current Coverage: 14.5%</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  FY26 Target: 75% Governed
                </span>
              </div>
            </div>
          </div>

          {/* Required PRD Footnote */}
          <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              *Estimated from tool license counts vs. registrations. In production this is the number leadership should actually care about.
            </p>
          </div>
        </div>
      </div>

      {/* Heatmap: Division x Department Risk Density */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
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

        {/* Matrix Grid */}
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
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
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

                    // Color determination
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
    </div>
  );
};
