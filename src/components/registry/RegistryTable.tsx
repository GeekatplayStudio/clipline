// src/components/registry/RegistryTable.tsx
// Justification: High-density ServiceNow-style table view implementing PRD Section 5.2 with multi-dimensional filtering.

import React from 'react';
// Justification: React framework import.

import {
  Workflow,
  LineOfBusiness,
  RiskTier,
  WorkflowStatus,
  UserRole,
} from '../../types/workflow.js';
// Justification: Domain types.

import { WorkflowFilters } from '../../store/workflow_store.js';
// Justification: Filter interface.

import {
  Filter,
  AlertCircle,
  Clock,
  GraduationCap,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
// Justification: Icons for enterprise visual indicators.

interface RegistryTableProps {
  workflows: Workflow[];
  filters: WorkflowFilters;
  onFilterChange: (updates: Partial<WorkflowFilters>) => void;
  onResetFilters: () => void;
  onSelectWorkflow: (workflow: Workflow) => void;
  currentRole: UserRole;
}

const LOBS: (LineOfBusiness | 'All')[] = ['All', 'Rent-A-Center', 'Acima', 'Brigit', 'Mexico', 'Corporate'];
const TIERS: (RiskTier | 'All')[] = ['All', 'Tier 1 Low', 'Tier 2 Moderate', 'Tier 3 High', 'Tier 4 Prohibited'];
const STATUSES: (WorkflowStatus | 'All')[] = [
  'All',
  'Draft',
  'Submitted',
  'In review',
  'Approved',
  'Approved with conditions',
  'Declined',
  'Retired',
];

export const RegistryTable: React.FC<RegistryTableProps> = ({
  workflows,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectWorkflow,
  currentRole,
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-3">
      {/* Justification: Filter bar with multi-criteria dropdowns and toggles */}
      <div className="bg-white border border-slate-200 rounded p-3 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* LOB Filter */}
          <div className="flex items-center space-x-1">
            <label className="text-slate-600 font-medium">LOB:</label>
            <select
              value={filters.lob}
              onChange={(e) => onFilterChange({ lob: e.target.value as LineOfBusiness | 'All' })}
              className="border border-slate-300 rounded px-2 py-1 bg-slate-50 text-slate-800 focus:outline-none"
            >
              {LOBS.map((lob) => (
                <option key={lob} value={lob}>
                  {lob}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Filter */}
          <div className="flex items-center space-x-1">
            <label className="text-slate-600 font-medium">Tier:</label>
            <select
              value={filters.tier}
              onChange={(e) => onFilterChange({ tier: e.target.value as RiskTier | 'All' })}
              className="border border-slate-300 rounded px-2 py-1 bg-slate-50 text-slate-800 focus:outline-none"
            >
              {TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1">
            <label className="text-slate-600 font-medium">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value as WorkflowStatus | 'All' })}
              className="border border-slate-300 rounded px-2 py-1 bg-slate-50 text-slate-800 focus:outline-none"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle: Review Overdue */}
          <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-700 hover:bg-slate-100">
            <input
              type="checkbox"
              checked={filters.onlyOverdue}
              onChange={(e) => onFilterChange({ onlyOverdue: e.target.checked })}
              className="rounded text-slate-900 focus:ring-0"
            />
            <Clock className="w-3 h-3 text-rose-600" />
            <span>Review Overdue</span>
          </label>

          {/* Toggle: Owner Training Not Current */}
          <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-700 hover:bg-slate-100">
            <input
              type="checkbox"
              checked={filters.onlyTrainingNotCurrent}
              onChange={(e) => onFilterChange({ onlyTrainingNotCurrent: e.target.checked })}
              className="rounded text-slate-900 focus:ring-0"
            />
            <GraduationCap className="w-3 h-3 text-amber-600" />
            <span>Training Not Current</span>
          </label>
        </div>

        <button
          onClick={onResetFilters}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 underline"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Clear Filters</span>
        </button>
      </div>

      {/* Justification: PRD Section 5.2: Dense Enterprise Table Layout */}
      <div className="bg-white border border-slate-200 rounded overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
              <th className="px-3 py-2 w-24">ID</th>
              <th className="px-3 py-2">Workflow Title</th>
              <th className="px-3 py-2 w-36">Owner</th>
              <th className="px-3 py-2 w-32">LOB</th>
              <th className="px-3 py-2 w-32">Derived Tier</th>
              <th className="px-3 py-2 w-28">Status</th>
              <th className="px-3 py-2 w-28">Review Due</th>
              <th className="px-2 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {workflows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p className="font-medium text-slate-700">
                    {filters.lob !== 'All'
                      ? `No workflows registered for ${filters.lob} yet. That's either good news or a discovery problem.`
                      : 'No workflows match the active filter criteria.'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your filters or register a new workflow.
                  </p>
                </td>
              </tr>
            ) : (
              workflows.map((w) => {
                const isOverdue = w.review_due < today && w.status !== 'Retired';
                const trainingMissing = !w.training_current;

                return (
                  <tr
                    key={w.id}
                    onClick={() => onSelectWorkflow(w)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    {/* ID: Tabular monospace font */}
                    <td className="table-cell-dense font-mono font-medium text-slate-700">
                      {w.id}
                    </td>

                    {/* Title + Sub-indicators */}
                    <td className="table-cell-dense font-medium text-slate-900">
                      <div className="flex items-center space-x-2">
                        <span className="truncate max-w-xs sm:max-w-md">{w.title}</span>
                        {trainingMissing && (
                          <span
                            title="Owner training not current"
                            className="flex-shrink-0 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 font-normal"
                          >
                            Training Pending
                          </span>
                        )}
                        {w.human_review === 'None' && w.risk_tier !== 'Tier 1 Low' && (
                          <span
                            title="Operating with zero human review"
                            className="flex-shrink-0 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-800 font-normal"
                          >
                            No Human Review
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="table-cell-dense text-slate-600 truncate">
                      {w.owner_name}
                    </td>

                    {/* LOB */}
                    <td className="table-cell-dense text-slate-700 font-medium">
                      {w.lob}
                    </td>

                    {/* Derived Tier Badge */}
                    <td className="table-cell-dense">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          w.risk_tier === 'Tier 1 Low'
                            ? 'badge-tier1'
                            : w.risk_tier === 'Tier 2 Moderate'
                            ? 'badge-tier2'
                            : w.risk_tier === 'Tier 3 High'
                            ? 'badge-tier3'
                            : 'badge-tier4'
                        }`}
                      >
                        {w.risk_tier}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="table-cell-dense">
                      <span
                        className={`inline-block text-[11px] font-medium ${
                          w.status === 'Approved'
                            ? 'text-emerald-700'
                            : w.status === 'Approved with conditions'
                            ? 'text-amber-700'
                            : w.status === 'In review'
                            ? 'text-sky-700'
                            : w.status === 'Declined'
                            ? 'text-rose-700 font-semibold'
                            : 'text-slate-500'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>

                    {/* Review Due Date */}
                    <td className="table-cell-dense font-mono">
                      <span className={isOverdue ? 'text-rose-700 font-bold' : 'text-slate-600'}>
                        {w.review_due}
                      </span>
                      {isOverdue && (
                        <span className="block text-[10px] text-rose-600 uppercase font-sans font-bold">
                          Overdue
                        </span>
                      )}
                    </td>

                    {/* Navigation arrow */}
                    <td className="table-cell-dense text-slate-400 group-hover:text-slate-700 text-right pr-3">
                      <ChevronRight className="w-3.5 h-3.5 inline" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Dense Table Footer summary */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <div>
            Showing <strong>{workflows.length}</strong> workflow records
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {currentRole === 'program_lead'
              ? 'Program Lead View: Click any row to review or approve'
              : 'Citizen Developer View: Read-only governance inventory'}
          </div>
        </div>
      </div>
    </div>
  );
};
