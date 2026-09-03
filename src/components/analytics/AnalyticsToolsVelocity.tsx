import React, { useMemo } from 'react';
import { Workflow } from '../../types/workflow.js';
import { AlertTriangle, CheckCircle2, Clock, Wrench } from 'lucide-react';

export const AnalyticsToolsVelocity: React.FC<{ workflows: Workflow[] }> = ({ workflows }) => {
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
  return (
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
  );
};
