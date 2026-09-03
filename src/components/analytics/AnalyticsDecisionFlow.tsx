import React from 'react';
import { GitFork } from 'lucide-react';

export const AnalyticsDecisionFlow: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
    <div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <GitFork className="w-4 h-4 text-blue-600" />
        <span>Data Sensitivity & Decision Influence Risk Cascade</span>
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Visualizing how input data categories and autonomous decision impacts mathematically drive assigned
        risk tiers.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
      {/* Column 1: Input Data Categories */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-1">
          1. Data Category Ingested
        </span>
        {[
          {
            label: 'Credit / Underwriting Data',
            count: 1,
            tier: 4,
            color: 'border-rose-500 bg-rose-50/40 text-rose-700',
          },
          {
            label: 'Customer Financial Data',
            count: 5,
            tier: 3,
            color: 'border-amber-500 bg-amber-50/40 text-amber-700',
          },
          {
            label: 'Customer PII (SSN, DOB)',
            count: 4,
            tier: 3,
            color: 'border-amber-500 bg-amber-50/40 text-amber-700',
          },
          {
            label: 'Employee / HR Data',
            count: 4,
            tier: 2,
            color: 'border-yellow-500 bg-yellow-50/40 text-yellow-700',
          },
          {
            label: 'Internal Confidential',
            count: 4,
            tier: 2,
            color: 'border-yellow-500 bg-yellow-50/40 text-yellow-700',
          },
          {
            label: 'Internal Non-Sensitive',
            count: 5,
            tier: 1,
            color: 'border-emerald-500 bg-emerald-50/40 text-emerald-700',
          },
          {
            label: 'Public Company Info',
            count: 1,
            tier: 1,
            color: 'border-emerald-500 bg-emerald-50/40 text-emerald-700',
          },
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
          {
            label: 'Credit or Underwriting Decision',
            count: 1,
            tier: 4,
            color: 'border-rose-500 bg-rose-50/40 text-rose-700',
          },
          {
            label: 'Customer Service or Account Action',
            count: 4,
            tier: 3,
            color: 'border-amber-500 bg-amber-50/40 text-amber-700',
          },
          {
            label: 'Customer Communications',
            count: 3,
            tier: 3,
            color: 'border-amber-500 bg-amber-50/40 text-amber-700',
          },
          {
            label: 'Employee Affecting (Hiring, Eval)',
            count: 3,
            tier: 2,
            color: 'border-yellow-500 bg-yellow-50/40 text-yellow-700',
          },
          {
            label: 'Internal Operational (Staffing, Inv)',
            count: 5,
            tier: 2,
            color: 'border-yellow-500 bg-yellow-50/40 text-yellow-700',
          },
          {
            label: 'No Decision — Informational Only',
            count: 8,
            tier: 1,
            color: 'border-emerald-500 bg-emerald-50/40 text-emerald-700',
          },
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
            <div className="text-[10px] opacity-75 font-mono pt-1">Reattestation Cycle: {t.review}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
