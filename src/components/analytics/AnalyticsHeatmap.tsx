import React, { useMemo } from 'react';
import { LineOfBusiness, Workflow } from '../../types/workflow.js';
import { getTierNumber } from '../network3d/NodeDetailOverlay.js';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface AnalyticsHeatmapProps {
  workflows: Workflow[];
  onSelectWorkflow?: (workflow: Workflow) => void;
  onFilterLOB?: (lob: LineOfBusiness) => void;
}

export const AnalyticsHeatmap: React.FC<AnalyticsHeatmapProps> = ({
  workflows,
  onSelectWorkflow,
  onFilterLOB,
}) => {
  // 2. Heatmap Matrix
  const heatmapData = useMemo(() => {
    const lobs: LineOfBusiness[] = ['Acima', 'Rent-A-Center', 'Brigit', 'Corporate', 'Mexico'];
    const departments = [
      'Underwriting',
      'Collections',
      'Marketing',
      'Store Operations',
      'HR',
      'Customer Support',
    ];

    const matrix = Object.fromEntries(lobs.map((lob) => [lob, {}])) as Record<
      LineOfBusiness,
      Record<string, { count: number; maxTier: number; workflows: Workflow[] }>
    >;

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
  return (
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
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-800"></span> None
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-yellow-400"></span> Med
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Prohibited
          </span>
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
  );
};
