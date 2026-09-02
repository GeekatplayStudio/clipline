// src/components/detail/WorkflowDetailModal.tsx
// Justification: Workflow detail inspection and Program Lead governance action modal implementing PRD Section 5.3.

import React, { useState } from 'react';
// Justification: React framework and state hooks.

import { Workflow, UserRole, WorkflowStatus } from '../../types/workflow.js';
// Justification: Domain types.

import { workflowStore } from '../../store/workflow_store.js';
// Justification: Store for state transition persistence.

import {
  X,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MessageSquare,
  HelpCircle,
  FileText,
  User,
  Building,
  Wrench,
  Database,
  Eye,
} from 'lucide-react';
// Justification: Icons for enterprise visual clarity.

interface WorkflowDetailModalProps {
  workflow: Workflow;
  currentRole: UserRole;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export const WorkflowDetailModal: React.FC<WorkflowDetailModalProps> = ({
  workflow,
  currentRole,
  onClose,
  onStatusUpdated,
}) => {
  // Justification: Action form state for Program Lead decisions.
  const [conditionsInput, setConditionsInput] = useState<string>(workflow.conditions || '');
  const [showConditionsField, setShowConditionsField] = useState<boolean>(
    workflow.status === 'Approved with conditions'
  );
  const [activeTab, setActiveTab] = useState<'details' | 'support'>('details');

  // Justification: Action handler for Program Lead status transitions.
  const handleAction = (newStatus: WorkflowStatus) => {
    if (newStatus === 'Approved with conditions' && !showConditionsField) {
      setShowConditionsField(true);
      return;
    }

    workflowStore.updateWorkflowStatus(
      workflow.id,
      newStatus,
      newStatus === 'Approved with conditions' ? conditionsInput : undefined
    );
    onStatusUpdated();
  };

  // Canned Q&As demonstrating support channel integration per PRD Section 5.3
  const cannedQAs = [
    {
      q: 'Can I add ChatGPT Vision to this workflow to read paper invoice receipts?',
      a: 'If invoice receipts contain customer bank details or card numbers, that changes the data category to Customer Financial Data and requires Tier 3 security review. If it only reads merchant inventory packing slips, it remains Tier 1.',
    },
    {
      q: 'What should I do if my team wants to increase the execution volume from 10 to 5,000 runs per day?',
      a: 'High-volume batching elevates the blast radius. We recommend scheduling a 15-minute office hours review with the AI Standards Lead to confirm tenant rate limits and model fallback behavior.',
    },
    {
      q: 'Who is required to approve Tier 3 workflows before they go live?',
      a: 'Tier 3 workflows require sign-offs from the AI Program Lead, Information Security (SecOps), and Legal / General Counsel compliance leads.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col my-auto animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
              {workflow.id}
            </span>
            <h2 className="text-sm font-bold text-slate-900 truncate max-w-md">
              {workflow.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Record Details vs Ask the Program Lead */}
        <div className="px-6 border-b border-slate-200 flex space-x-4 text-xs font-medium bg-slate-50/50">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'details'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Workflow Specification</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`py-2 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'support'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Ask the Program Lead (Support)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {activeTab === 'details' ? (
            <>
              {/* Derived Tier Callout Banner with Plain-Language Reasoning */}
              <div className="p-4 rounded border border-slate-300 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-slate-700" />
                    <span className="font-bold text-slate-900 text-xs">
                      Derived Governance Tier & Rationale
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                      workflow.risk_tier === 'Tier 1 Low'
                        ? 'badge-tier1'
                        : workflow.risk_tier === 'Tier 2 Moderate'
                        ? 'badge-tier2'
                        : workflow.risk_tier === 'Tier 3 High'
                        ? 'badge-tier3'
                        : 'badge-tier4'
                    }`}
                  >
                    {workflow.risk_tier}
                  </span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {workflow.risk_reason}
                </p>
                {workflow.conditions && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-amber-900 bg-amber-50 p-2 rounded">
                    <strong>Approval Conditions:</strong> {workflow.conditions}
                  </div>
                )}
              </div>

              {/* Grid of Key Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <User className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Owner & Role</span>
                      <span className="font-medium text-slate-900">
                        {workflow.owner_name} ({workflow.owner_role})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Building className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Line of Business & Dept</span>
                      <span className="font-medium text-slate-900">
                        {workflow.lob} &middot; {workflow.department}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Wrench className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Tools Used</span>
                      <span className="font-medium text-slate-900">
                        {workflow.tools_used.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <FileText className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Build Architecture</span>
                      <span className="font-medium text-slate-900">
                        {workflow.build_type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Database className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Data Categories</span>
                      <span className="font-medium text-slate-900">
                        {workflow.data_categories.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Eye className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Decision Influence</span>
                      <span className="font-medium text-slate-900">
                        {workflow.decision_influence}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Review Due Date</span>
                      <span className="font-mono font-medium text-slate-900">
                        {workflow.review_due}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Shield className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Human Review & Tenant Boundary</span>
                      <span className="font-medium text-slate-900">
                        {workflow.human_review} &middot;{' '}
                        {workflow.data_leaves_tenant ? 'Data Leaves Tenant' : 'Tenant Protected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Block */}
              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  Builder Description
                </span>
                <p className="bg-slate-50 border border-slate-200 rounded p-3 text-slate-700 leading-relaxed">
                  {workflow.description}
                </p>
              </div>

              {/* Justification: PRD Section 5.3: Program Lead Governance Decision Actions */}
              {currentRole === 'program_lead' && (
                <div className="p-4 bg-slate-100 border border-slate-300 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                      Program Lead Governance Actions
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Current Status: <strong>{workflow.status}</strong>
                    </span>
                  </div>

                  {showConditionsField && (
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Stipulated Approval Conditions:
                      </label>
                      <input
                        type="text"
                        value={conditionsInput}
                        onChange={(e) => setConditionsInput(e.target.value)}
                        placeholder="e.g., PII tokenization mandatory; periodic sample review required"
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAction('Approved')}
                      className="px-3 py-1.5 bg-emerald-700 text-white rounded font-semibold hover:bg-emerald-800 flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleAction('Approved with conditions')}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded font-semibold hover:bg-amber-700 flex items-center space-x-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Approve with Conditions</span>
                    </button>

                    <button
                      onClick={() => handleAction('Declined')}
                      className="px-3 py-1.5 bg-rose-700 text-white rounded font-semibold hover:bg-rose-800 flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Ask the Program Lead Panel per PRD Section 5.3 */
            <div className="space-y-4">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded text-sky-900">
                <div className="flex items-center space-x-2 font-semibold">
                  <MessageSquare className="w-4 h-4 text-sky-700" />
                  <span>AI Standards Lead Consultation Channel</span>
                </div>
                <p className="text-xs text-sky-800 mt-1">
                  "You are the resource they come to when they have a question." The registry doubles as the enterprise advisory channel for citizen developers.
                </p>
              </div>

              <div className="space-y-3">
                {cannedQAs.map((item, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded bg-slate-50 space-y-1.5">
                    <div className="font-semibold text-slate-900 flex items-start space-x-2">
                      <span className="text-slate-400 font-mono">Q:</span>
                      <span>{item.q}</span>
                    </div>
                    <div className="text-slate-700 flex items-start space-x-2 pl-4">
                      <span className="text-amber-600 font-mono font-bold">A:</span>
                      <span className="leading-relaxed">{item.a}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
