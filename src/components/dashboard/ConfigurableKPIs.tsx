// src/components/dashboard/ConfigurableKPIs.tsx
// Justification: Configurable executive metric widget cards with customizable ordering, visibility toggles, and click-to-filter reactivity.

import React, { useState } from 'react';
import { Workflow } from '../../types/workflow.js';
import { getTierNumber } from '../network3d/NodeDetailOverlay.js';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Clock,
  GraduationCap,
  EyeOff,
  Settings2,
  Check,
  RotateCcw,
} from 'lucide-react';

export interface KPIConfig {
  id: string;
  title: string;
  visible: boolean;
}

interface ConfigurableKPIsProps {
  workflows: Workflow[];
  onFilterStatus?: (status: string | null) => void;
  onFilterTier?: (tier: number | null) => void;
}

export const ConfigurableKPIs: React.FC<ConfigurableKPIsProps> = ({
  workflows,
  onFilterStatus,
  onFilterTier,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  // Initial Widget Configurations
  const [cards, setCards] = useState<KPIConfig[]>([
    { id: 'total', title: 'Total Governed Registrations', visible: true },
    { id: 't4', title: 'Tier 4 Prohibited Alerts', visible: true },
    { id: 't3', title: 'Tier 3 High Risk Queues', visible: true },
    { id: 'overdue', title: 'Overdue Reattestations', visible: true },
    { id: 'training', title: 'Owners with Lapsed Literacy', visible: true },
    { id: 'shadow', title: 'Estimated Unregistered Workflows', visible: true },
  ]);

  // Derived metrics
  const total = workflows.length;
  const t4Count = workflows.filter((w) => getTierNumber(w.risk_tier) === 4).length;
  const t3Count = workflows.filter((w) => getTierNumber(w.risk_tier) === 3).length;
  const overdueCount = workflows.filter((w) => w.status === 'In review').length;
  const trainingLapsedCount = workflows.filter((w) => !w.training_current).length;

  const toggleVisibility = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    );
  };

  const resetConfig = () => {
    setCards((prev) => prev.map((c) => ({ ...c, visible: true })));
  };

  return (
    <div className="space-y-3">
      {/* Widget Customizer Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Executive Telemetry KPIs
        </span>
        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Configure Widgets</span>
        </button>
      </div>

      {/* Configuration Tray */}
      {showConfig && (
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">
              Toggle Cards:
            </span>
            {cards.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleVisibility(c.id)}
                className={`px-3 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  c.visible
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-300 dark:border-slate-700'
                }`}
              >
                {c.visible && <Check className="w-3 h-3" />}
                <span>{c.title}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetConfig}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Default</span>
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Governed */}
        {cards.find((c) => c.id === 'total')?.visible && (
          <div
            onClick={() => onFilterStatus && onFilterStatus(null)}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all shadow-sm cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Governed</span>
              <FileCheck2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums group-hover:text-blue-600 transition-colors">
              {total}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              ServiceNow Registry
            </div>
          </div>
        )}

        {/* Tier 4 Prohibited */}
        {cards.find((c) => c.id === 't4')?.visible && (
          <div
            onClick={() => onFilterTier && onFilterTier(4)}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:border-rose-500 transition-all shadow-sm cursor-pointer group"
          >
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
              <span className="text-[11px] font-medium">Prohibited</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
              {t4Count}
            </div>
            <div className="text-[10px] text-rose-500/80 font-mono mt-0.5">
              Requires Intervention
            </div>
          </div>
        )}

        {/* Tier 3 High Risk */}
        {cards.find((c) => c.id === 't3')?.visible && (
          <div
            onClick={() => onFilterTier && onFilterTier(3)}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 hover:border-amber-500 transition-all shadow-sm cursor-pointer group"
          >
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
              <span className="text-[11px] font-medium">High Risk</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {t3Count}
            </div>
            <div className="text-[10px] text-amber-500/80 font-mono mt-0.5">
              Legal & Security Review
            </div>
          </div>
        )}

        {/* Overdue */}
        {cards.find((c) => c.id === 'overdue')?.visible && (
          <div
            onClick={() => onFilterStatus && onFilterStatus('in_review')}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 transition-all shadow-sm cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-medium">In Review / Overdue</span>
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-black text-orange-500 tabular-nums">
              {overdueCount}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Pending Reattestation
            </div>
          </div>
        )}

        {/* Training Lapsed */}
        {cards.find((c) => c.id === 'training')?.visible && (
          <div
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Training Lapsed</span>
              <GraduationCap className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
              {trainingLapsedCount}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Needs Acceptable Use
            </div>
          </div>
        )}

        {/* Estimated Unregistered Shadow IT */}
        {cards.find((c) => c.id === 'shadow')?.visible && (
          <div
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Shadow IT Gap</span>
              <EyeOff className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-700 dark:text-slate-300 tabular-nums">
              ~142*
            </div>
            <div className="text-[10px] text-slate-400 italic font-mono mt-0.5 truncate">
              Tool licenses vs reg
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
