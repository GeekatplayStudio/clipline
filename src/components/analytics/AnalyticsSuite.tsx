// src/components/analytics/AnalyticsSuite.tsx
// Justification: Comprehensive animated visual charts suite offering multiple analytical perspectives:
// 1. Risk Tier Donut & Radial Gauges, 2. Decision & Data Flow Cascade, 3. Division x Department Heatmap,
// 4. 5-Axis AI Literacy Radar against 80% benchmark, 5. Tool Ecosystem & Horizon Velocity.

import React, { useState } from 'react';
import { LineOfBusiness, Workflow } from '../../types/workflow.js';
import { Compass, GitFork, Layers, PieChart, Wrench } from 'lucide-react';
import { AnalyticsOverview } from './AnalyticsOverview.js';
import { AnalyticsDecisionFlow } from './AnalyticsDecisionFlow.js';
import { AnalyticsHeatmap } from './AnalyticsHeatmap.js';
import { AnalyticsLiteracyRadar } from './AnalyticsLiteracyRadar.js';
import { AnalyticsToolsVelocity } from './AnalyticsToolsVelocity.js';

export type AnalyticsViewMode =
  'overview' | 'decision_flow' | 'heatmap' | 'literacy_radar' | 'tools_velocity';

interface AnalyticsSuiteProps {
  workflows: Workflow[];
  onSelectWorkflow?: (workflow: Workflow) => void;
  onFilterLOB?: (lob: LineOfBusiness) => void;
}

export const AnalyticsSuite: React.FC<AnalyticsSuiteProps> = ({
  workflows,
  onSelectWorkflow,
  onFilterLOB,
}) => {
  const [viewMode, setViewMode] = useState<AnalyticsViewMode>('overview');
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

      {viewMode === 'overview' && <AnalyticsOverview workflows={workflows} />}
      {viewMode === 'decision_flow' && <AnalyticsDecisionFlow />}
      {(viewMode === 'overview' || viewMode === 'heatmap') && (
        <AnalyticsHeatmap
          workflows={workflows}
          onSelectWorkflow={onSelectWorkflow}
          onFilterLOB={onFilterLOB}
        />
      )}
      {viewMode === 'literacy_radar' && <AnalyticsLiteracyRadar />}
      {viewMode === 'tools_velocity' && <AnalyticsToolsVelocity workflows={workflows} />}
    </div>
  );
};
