import React, { useState } from 'react';
// Justification: React framework import.

import { ExecutiveMetrics } from '../../store/workflow_store.js';
import { LineOfBusiness, RiskTier, Workflow, WorkflowStatus } from '../../types/workflow.js';
import { ConfigurableKPIs } from './ConfigurableKPIs';
import { AnalyticsSuite } from '../analytics/AnalyticsSuite';
// Justification: Executive metrics and visual components.

import { BarChart3, AlertTriangle, CheckCircle2, Info, Layers, Download, PieChart } from 'lucide-react';
// Justification: Icons for enterprise visual clarity.

interface CoverageDashboardProps {
  metrics: ExecutiveMetrics;
  workflows?: Workflow[];
  initialTab?: 'analytics' | 'breakdown';
  onSelectWorkflow?: (workflow: Workflow) => void;
  onFilterLOB?: (lob: LineOfBusiness) => void;
  onFilterStatus?: (status: WorkflowStatus | 'All') => void;
  onFilterTier?: (tier: RiskTier | 'All') => void;
  onFilterOverdue?: () => void;
  onOpenExport?: () => void;
}

export const CoverageDashboard: React.FC<CoverageDashboardProps> = ({
  metrics,
  workflows = [],
  initialTab = 'breakdown',
  onSelectWorkflow,
  onFilterLOB,
  onFilterStatus,
  onFilterTier,
  onFilterOverdue,
  onOpenExport,
}) => {
  const [dashboardTab, setDashboardTab] = useState<'analytics' | 'breakdown'>(initialTab);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Executive Governance & Coverage Cockpit</span>
          </h2>
          <p className="text-xs text-slate-500">
            Enterprise exposure oversight, shadow IT quantification, and divisional compliance posture
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sub-tab switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setDashboardTab('analytics')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                dashboardTab === 'analytics'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Visual Analytics</span>
            </button>
            <button
              type="button"
              onClick={() => setDashboardTab('breakdown')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                dashboardTab === 'breakdown'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>LOB Exposure Bars</span>
            </button>
          </div>

          {onOpenExport && (
            <button
              type="button"
              onClick={onOpenExport}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Configurable Interactive KPIs */}
      <ConfigurableKPIs
        workflows={workflows}
        onFilterStatus={onFilterStatus}
        onFilterTier={onFilterTier}
        onFilterOverdue={onFilterOverdue}
      />

      {dashboardTab === 'analytics' ? (
        <AnalyticsSuite workflows={workflows} onSelectWorkflow={onSelectWorkflow} onFilterLOB={onFilterLOB} />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. TWO NUMBERS SIDE BY SIDE: Registered vs Estimated Unregistered + Footnote */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Registered Workflows */}
            <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Registered Workflows (Governed)
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {metrics.totalRegistered}
                </span>
                <span className="text-xs text-emerald-700 font-medium flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Active in Registry
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Workflows with assigned risk tiering and reattestation schedules.
              </p>
            </div>

            {/* Card 2: Estimated Unregistered (PRD Talking Point) */}
            <div className="bg-white border border-amber-300 rounded p-4 shadow-sm bg-amber-50/30 relative">
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider block">
                Estimated Unregistered (Shadow Exposure)
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-amber-800 font-mono">
                  ~{metrics.estimatedUnregistered}
                </span>
                <span className="text-xs text-amber-700 font-medium flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Unvetted Gap
                </span>
              </div>
              {/* Justification: PRD Section 5.4 Mandate: The exact required footnote representing an executive viewpoint */}
              <div className="mt-2 pt-2 border-t border-amber-200/80 text-[11px] text-amber-950 italic flex items-start space-x-1.5">
                <Info className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  *Estimated from tool license counts vs. registrations. In production this is the number
                  leadership should actually care about.
                </span>
              </div>
            </div>

            {/* Card 3: Review Reattestation Status */}
            <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Reattestation Review Status
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span
                  className={`text-3xl font-extrabold font-mono ${metrics.overdueReviewsCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}
                >
                  {metrics.overdueReviewsCount}
                </span>
                <span className="text-xs text-slate-600 font-medium">Overdue for Re-review</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Periodic re-attestation guarantees workflows do not drift in scope without security awareness.
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. REGISTERED WORKFLOWS BY LOB AND TIER — STACKED BAR EXPOSURE CHART       */}
          {/* ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-slate-700" />
                  <span>Registered Workflows by Line of Business & Risk Tier</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Visualizes cross-division exposure concentration across Tier 1 (Low) to Tier 4 (Prohibited).
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-3 text-[11px]">
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded bg-slate-300 inline-block" />
                  <span className="text-slate-600">Tier 1 Low</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
                  <span className="text-slate-600">Tier 2 Moderate</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded bg-orange-500 inline-block" />
                  <span className="text-slate-600">Tier 3 High</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded bg-rose-600 inline-block" />
                  <span className="text-slate-600">Tier 4 Prohibited</span>
                </div>
              </div>
            </div>

            {/* Stacked Bars */}
            <div className="space-y-3 pt-2">
              {metrics.lobBreakdown.map((item) => {
                const pctTier1 = item.total > 0 ? (item.tier1 / item.total) * 100 : 0;
                const pctTier2 = item.total > 0 ? (item.tier2 / item.total) * 100 : 0;
                const pctTier3 = item.total > 0 ? (item.tier3 / item.total) * 100 : 0;
                const pctTier4 = item.total > 0 ? (item.tier4 / item.total) * 100 : 0;

                return (
                  <div key={item.lob} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-800">{item.lob}</span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {item.total} workflows ({item.tier3 + item.tier4} high/prohibited)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-6 rounded flex overflow-hidden border border-slate-200">
                      {item.tier1 > 0 && (
                        <div
                          style={{ width: `${pctTier1}%` }}
                          title={`Tier 1 Low: ${item.tier1}`}
                          className="bg-slate-300 hover:opacity-90 flex items-center justify-center text-[10px] font-mono text-slate-800 font-bold"
                        >
                          {item.tier1}
                        </div>
                      )}
                      {item.tier2 > 0 && (
                        <div
                          style={{ width: `${pctTier2}%` }}
                          title={`Tier 2 Moderate: ${item.tier2}`}
                          className="bg-amber-400 hover:opacity-90 flex items-center justify-center text-[10px] font-mono text-amber-950 font-bold"
                        >
                          {item.tier2}
                        </div>
                      )}
                      {item.tier3 > 0 && (
                        <div
                          style={{ width: `${pctTier3}%` }}
                          title={`Tier 3 High: ${item.tier3}`}
                          className="bg-orange-500 hover:opacity-90 flex items-center justify-center text-[10px] font-mono text-white font-bold"
                        >
                          {item.tier3}
                        </div>
                      )}
                      {item.tier4 > 0 && (
                        <div
                          style={{ width: `${pctTier4}%` }}
                          title={`Tier 4 Prohibited: ${item.tier4}`}
                          className="bg-rose-600 hover:opacity-90 flex items-center justify-center text-[10px] font-mono text-white font-bold"
                        >
                          {item.tier4}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. LITERACY COVERAGE BY LOB — % OF EMPLOYEES CURRENT ON REQUIRED TRAINING */}
          {/* ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI Literacy Standard Coverage (% Trained by LOB)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Employee workforce completion against the 80% enterprise literacy benchmark target.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-600 flex items-center space-x-1">
                <span className="w-2.5 h-2.5 border-r-2 border-dashed border-slate-700 inline-block" />
                <span>Target Line: 80%</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {metrics.literacyCoverage.map((lit) => {
                const meetsTarget = lit.currentPercentage >= lit.targetPercentage;
                return (
                  <div key={lit.lob} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-800">{lit.lob}</span>
                      <span
                        className={`font-mono text-[11px] font-bold ${meetsTarget ? 'text-emerald-700' : 'text-amber-700'}`}
                      >
                        {lit.currentPercentage}% / {lit.targetPercentage}% target
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded overflow-hidden relative border border-slate-200">
                      <div
                        style={{ width: `${lit.currentPercentage}%` }}
                        className={`h-full ${meetsTarget ? 'bg-slate-800' : 'bg-amber-500'}`}
                      />
                      {/* Vertical dashed marker indicating 80% benchmark target */}
                      <div
                        style={{ left: '80%' }}
                        className="absolute top-0 bottom-0 w-0.5 border-r-2 border-dashed border-rose-600 z-10"
                        title="80% Enterprise Target Standard"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
