// src/components/registry/RegistryTable.tsx
// Justification: High-density ServiceNow-style table view implementing PRD Section 5.2 with multi-dimensional filtering.

import React, { useState } from 'react';
// Justification: React framework import.

import { Workflow, LineOfBusiness, RiskTier, WorkflowStatus, UserRole } from '../../types/workflow.js';
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
} from 'lucide-react';
// Justification: Icons for enterprise visual indicators and sorting.

interface RegistryTableProps {
  workflows: Workflow[];
  filters: WorkflowFilters;
  onFilterChange: (updates: Partial<WorkflowFilters>) => void;
  onResetFilters: () => void;
  onSelectWorkflow: (workflow: Workflow) => void;
  onOpenExport?: () => void;
  currentRole: UserRole;
}

const LOBS: (LineOfBusiness | 'All')[] = ['All', 'Rent-A-Center', 'Acima', 'Brigit', 'Mexico', 'Corporate'];
const TIERS: (RiskTier | 'All')[] = [
  'All',
  'Tier 1 Low',
  'Tier 2 Moderate',
  'Tier 3 High',
  'Tier 4 Prohibited',
];
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

type SortField = 'id' | 'title' | 'owner' | 'lob' | 'tier' | 'status' | 'review_due';

export const RegistryTable: React.FC<RegistryTableProps> = ({
  workflows,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectWorkflow,
  onOpenExport,
  currentRole,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter by search term and sort
  const displayedWorkflows = React.useMemo(() => {
    let list = workflows;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (w) =>
          w.id.toLowerCase().includes(q) ||
          w.title.toLowerCase().includes(q) ||
          w.owner_name.toLowerCase().includes(q) ||
          w.lob.toLowerCase().includes(q) ||
          w.department.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') comparison = a.id.localeCompare(b.id);
      else if (sortField === 'title') comparison = a.title.localeCompare(b.title);
      else if (sortField === 'owner') comparison = a.owner_name.localeCompare(b.owner_name);
      else if (sortField === 'lob') comparison = a.lob.localeCompare(b.lob);
      else if (sortField === 'tier') comparison = a.risk_tier.localeCompare(b.risk_tier);
      else if (sortField === 'status') comparison = a.status.localeCompare(b.status);
      else if (sortField === 'review_due') comparison = a.review_due.localeCompare(b.review_due);
      return sortAsc ? comparison : -comparison;
    });
  }, [workflows, searchTerm, sortField, sortAsc]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 inline ml-1" />
      );
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-blue-600 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 inline ml-1" />
    );
  };

  return (
    <div className="space-y-3">
      {/* Justification: Filter bar with multi-criteria dropdowns and toggles */}
      <div className="bg-white border border-slate-200 rounded p-3 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <label htmlFor="workflow-search" className="sr-only">
              Search workflows
            </label>
            <input
              id="workflow-search"
              type="text"
              placeholder="Search workflows, owners, LOBs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-300 rounded text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-52 sm:w-64"
            />
          </div>

          <div className="flex items-center space-x-1 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* LOB Filter */}
          <div className="flex items-center space-x-1">
            <label htmlFor="workflow-lob-filter" className="text-slate-600 font-medium">
              LOB:
            </label>
            <select
              id="workflow-lob-filter"
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
            <label htmlFor="workflow-tier-filter" className="text-slate-600 font-medium">
              Tier:
            </label>
            <select
              id="workflow-tier-filter"
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
            <label htmlFor="workflow-status-filter" className="text-slate-600 font-medium">
              Status:
            </label>
            <select
              id="workflow-status-filter"
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

        <div className="flex items-center gap-3">
          {onOpenExport && (
            <button
              type="button"
              onClick={onOpenExport}
              className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          )}

          <button
            onClick={() => {
              setSearchTerm('');
              onResetFilters();
            }}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Justification: PRD Section 5.2: Dense Enterprise Table Layout */}
      <div className="bg-white border border-slate-200 rounded overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 uppercase tracking-wider text-[11px] font-semibold select-none">
              <th
                aria-sort={sortField === 'id' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                className="px-3 py-2 w-24 group"
              >
                <button
                  type="button"
                  onClick={() => handleSort('id')}
                  className="w-full text-left hover:text-slate-900"
                >
                  <span>ID</span> {renderSortIcon('id')}
                </button>
              </th>
              <th
                aria-sort={sortField === 'title' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                className="px-3 py-2 group"
              >
                <button
                  type="button"
                  onClick={() => handleSort('title')}
                  className="w-full text-left hover:text-slate-900"
                >
                  <span>Workflow Title</span> {renderSortIcon('title')}
                </button>
              </th>
              <th
                aria-sort={sortField === 'owner' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                className="px-3 py-2 w-36 group"
              >
                <button
                  type="button"
                  onClick={() => handleSort('owner')}
                  className="w-full text-left hover:text-slate-900"
                >
                  <span>Owner</span> {renderSortIcon('owner')}
                </button>
              </th>
              <th
                aria-sort={sortField === 'lob' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                className="px-3 py-2 w-32 group"
              >
                <button
                  type="button"
                  onClick={() => handleSort('lob')}
                  className="w-full text-left hover:text-slate-900"
                >
                  <span>LOB</span> {renderSortIcon('lob')}
                </button>
              </th>
              <th
                aria-sort={sortField === 'tier' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                className="px-3 py-2 w-32 group"
              >
                <button
                  type="button"
                  onClick={() => handleSort('tier')}
                  className="w-full text-left hover:text-slate-900"
                >
                  <span>Derived Tier</span> {renderSortIcon('tier')}
                </button>
              </th>
              <th
                aria-sort={sortField === 'status' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                className="px-3 py-2 w-28 group"
              >
                <button
                  type="button"
                  onClick={() => handleSort('status')}
                  className="w-full text-left hover:text-slate-900"
                >
                  <span>Status</span> {renderSortIcon('status')}
                </button>
              </th>
              <th
                aria-sort={sortField === 'review_due' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                className="px-3 py-2 w-28 group"
              >
                <button
                  type="button"
                  onClick={() => handleSort('review_due')}
                  className="w-full text-left hover:text-slate-900"
                >
                  <span>Review Due</span> {renderSortIcon('review_due')}
                </button>
              </th>
              <th className="px-2 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {displayedWorkflows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p className="font-medium text-slate-700">
                    {searchTerm
                      ? `No workflows match "${searchTerm}".`
                      : filters.lob !== 'All'
                        ? `No workflows registered for ${filters.lob} yet.`
                        : 'No workflows match the active filter criteria.'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
                </td>
              </tr>
            ) : (
              displayedWorkflows.map((w) => {
                const isOverdue = w.review_due < today && w.status !== 'Retired';
                const trainingMissing = !w.training_current;

                return (
                  <tr
                    key={w.id}
                    onClick={() => onSelectWorkflow(w)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectWorkflow(w);
                      }
                    }}
                    tabIndex={0}
                    aria-label={`Open workflow ${w.id}: ${w.title}`}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    {/* ID: Tabular monospace font */}
                    <td className="table-cell-dense font-mono font-medium text-slate-700">{w.id}</td>

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
                    <td className="table-cell-dense text-slate-600 truncate">{w.owner_name}</td>

                    {/* LOB */}
                    <td className="table-cell-dense text-slate-700 font-medium">{w.lob}</td>

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
