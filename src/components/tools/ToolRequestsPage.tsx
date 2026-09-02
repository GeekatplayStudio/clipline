// src/components/tools/ToolRequestsPage.tsx
// Justification: Central hub for employee AI tool intake requests, vendor risk assessments, safety scores, and governance decisions.

import React, { useState, useEffect, useMemo } from 'react';
import { toolRequestStore } from '../../store/tool_request_store.js';
import { ToolRequest, ToolDecisionStatus, ToolCategory } from '../../types/tool_request.js';
import { UserRole, LOB } from '../../types/workflow.js';
import { ToolRequestModal } from './ToolRequestModal.js';
import { ToolAnalysisModal } from './ToolAnalysisModal.js';
import {
  Wrench,
  PlusCircle,
  Search,
  Filter,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';

interface ToolRequestsPageProps {
  currentRole: UserRole;
}

export const ToolRequestsPage: React.FC<ToolRequestsPageProps> = ({ currentRole }) => {
  const [requests, setRequests] = useState<ToolRequest[]>(toolRequestStore.getToolRequests());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ToolDecisionStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory | 'All'>('All');
  const [lobFilter, setLobFilter] = useState<LOB | 'All'>('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ToolRequest | null>(null);

  useEffect(() => {
    const unsubscribe = toolRequestStore.subscribe((updated) => {
      setRequests(updated);
      if (selectedRequest) {
        const found = updated.find((r) => r.id === selectedRequest.id);
        if (found) setSelectedRequest(found);
      }
    });
    return () => unsubscribe();
  }, [selectedRequest]);

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = requests.length;
    const approved = requests.filter(
      (r) => r.status === 'Approved' || r.status === 'Approved with Conditions'
    ).length;
    const underReview = requests.filter((r) => r.status === 'Under Review').length;
    const declined = requests.filter((r) => r.status === 'Declined' || r.status === 'Banned').length;
    const avgScore =
      total > 0
        ? Math.round(
            requests.reduce((sum, r) => sum + r.safetyAnalysis.safetyScore, 0) / total
          )
        : 0;

    return { total, approved, underReview, declined, avgScore };
  }, [requests]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
      const matchesLOB = lobFilter === 'All' || r.lob === lobFilter;

      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        r.toolName.toLowerCase().includes(q) ||
        r.vendor.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);

      return matchesStatus && matchesCategory && matchesLOB && matchesQuery;
    });
  }, [requests, statusFilter, categoryFilter, lobFilter, searchQuery]);

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
    if (score >= 65) return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-300';
    if (score >= 40) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
  };

  const getStatusClass = (status: ToolDecisionStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300';
      case 'Approved with Conditions':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300';
      case 'Under Review':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300 border-yellow-300';
      case 'Declined':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300';
      case 'Banned':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
              <Wrench className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
              Vendor Risk Management (VRM)
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Tool Intake, Safety Analysis & Certification Audit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Employee intake pipeline for software and API tools with automated ISO 42001 certification audits and threat vector assessments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request New AI Tool</span>
          </button>

          <button
            type="button"
            onClick={() => toolRequestStore.resetToDefault()}
            title="Reset Mock Tool Requests"
            className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Total Evaluated
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {metrics.total}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Software & APIs</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Approved / Permitted
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {metrics.approved}
          </span>
          <span className="text-[10px] text-emerald-600/80 block mt-0.5">With Guardrails</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Under Review
          </span>
          <span className="text-2xl font-black text-yellow-600 dark:text-yellow-400 tabular-nums">
            {metrics.underReview}
          </span>
          <span className="text-[10px] text-yellow-600/80 block mt-0.5">Pending GRC Signoff</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Declined or Banned
          </span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
            {metrics.declined}
          </span>
          <span className="text-[10px] text-rose-600/80 block mt-0.5">High Risk / Prohibited</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Average Safety Score
          </span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
            {metrics.avgScore} <span className="text-xs font-normal text-slate-400">/100</span>
          </span>
          <span className="text-[10px] text-blue-600/80 block mt-0.5">ISO 42001 Audited</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search AI tools, vendors, requesters, departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Filter className="w-3 h-3 text-slate-500" />
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Approved with Conditions">Approved with Conditions</option>
              <option value="Declined">Declined</option>
              <option value="Banned">Banned</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Code & Development">Code & Development</option>
              <option value="Content & Marketing">Content & Marketing</option>
              <option value="Research & Search">Research & Search</option>
              <option value="Meeting & Audio Transcription">Meeting Transcription</option>
              <option value="Data Analysis & BI">Data Analysis & BI</option>
              <option value="Workflow Automation">Workflow Automation</option>
              <option value="Voice & Synthetic Media">Voice & Synthetic Media</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">LOB:</span>
            <select
              value={lobFilter}
              onChange={(e) => setLobFilter(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="All">All LOBs</option>
              <option value="Acima">Acima</option>
              <option value="Rent-A-Center">Rent-A-Center</option>
              <option value="Brigit">Brigit</option>
              <option value="Corporate">Corporate</option>
              <option value="Mexico">Mexico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4 w-24">ID</th>
                <th className="py-3 px-4">Tool & Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Requester & LOB</th>
                <th className="py-3 px-4 text-center">Safety Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRequests.map((req) => {
                const score = req.safetyAnalysis.safetyScore;
                return (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {req.id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {req.toolName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {req.vendor}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-[11px]">
                        {req.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {req.requesterName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {req.lob} &bull; {req.department}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold font-mono border ${getScoreBadge(
                          score
                        )}`}
                      >
                        {score} / 100
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${getStatusClass(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(req);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Deep Analysis</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No AI tool intake requests found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Tool Modal */}
      {isSubmitModalOpen && (
        <ToolRequestModal
          onClose={() => setIsSubmitModalOpen(false)}
          onSuccess={() => setIsSubmitModalOpen(false)}
        />
      )}

      {/* Deep Analysis Modal */}
      {selectedRequest && (
        <ToolAnalysisModal
          toolRequest={selectedRequest}
          currentRole={currentRole}
          onClose={() => setSelectedRequest(null)}
          onUpdateDecision={(id, newStatus, comments) => {
            toolRequestStore.updateToolDecision(id, newStatus, comments);
          }}
        />
      )}
    </div>
  );
};
