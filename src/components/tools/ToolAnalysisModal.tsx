// src/components/tools/ToolAnalysisModal.tsx
// Justification: In-depth AI safety, certification audit, threat vector, and governance decision analysis dossier for evaluated tools.

import React, { useState } from 'react';
import { useDialog } from '../../hooks/useDialog';
import { ToolRequest, ToolDecisionStatus } from '../../types/tool_request.js';
import { UserRole } from '../../types/workflow.js';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Building,
  User,
} from 'lucide-react';

interface ToolAnalysisModalProps {
  toolRequest: ToolRequest;
  currentRole: UserRole;
  onClose: () => void;
  onUpdateDecision: (id: string, newStatus: ToolDecisionStatus, comments?: string) => void;
}

export const ToolAnalysisModal: React.FC<ToolAnalysisModalProps> = ({
  toolRequest,
  currentRole,
  onClose,
  onUpdateDecision,
}) => {
  const dialogRef = useDialog(onClose);
  const [leadComments, setLeadComments] = useState(toolRequest.officialComments || '');
  const [selectedDecision, setSelectedDecision] = useState<ToolDecisionStatus>(toolRequest.status);

  const { safetyAnalysis } = toolRequest;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 from-emerald-500 to-teal-500';
    if (score >= 65) return 'text-yellow-500 from-yellow-500 to-amber-500';
    if (score >= 40) return 'text-amber-500 from-amber-500 to-orange-500';
    return 'text-rose-500 from-rose-500 to-red-600';
  };

  const getStatusBadge = (status: ToolDecisionStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300';
      case 'Approved with Conditions':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300';
      case 'Under Review':
        return 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-300';
      case 'Declined':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300';
      case 'Banned':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const handleSaveDecision = (status: ToolDecisionStatus) => {
    setSelectedDecision(status);
    onUpdateDecision(toolRequest.id, status, leadComments);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tool-analysis-title"
        tabIndex={-1}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                {toolRequest.id}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {toolRequest.category}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(selectedDecision)}`}
              >
                {selectedDecision}
              </span>
            </div>

            <h3
              id="tool-analysis-title"
              className="text-xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              {toolRequest.toolName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vendor: <strong>{toolRequest.vendor}</strong> &bull; Tenant Model:{' '}
              {toolRequest.dataHandlingModel}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close tool analysis"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>
                <strong>Requester:</strong> {toolRequest.requesterName}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                <strong>LOB:</strong> {toolRequest.lob} ({toolRequest.department})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>
                <strong>Requested:</strong> {toolRequest.requestedDate}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-500" />
              <span>
                <strong>Model Training:</strong>{' '}
                {safetyAnalysis.trainsOnCustomerData === null
                  ? 'Unverified'
                  : safetyAnalysis.trainsOnCustomerData
                    ? '⚠️ Yes'
                    : 'No — verified claim required'}
              </span>
            </div>
          </div>

          {/* Intended Use Case */}
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl space-y-1">
            <span className="font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider text-[10px]">
              Intended Business Purpose:
            </span>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
              {toolRequest.intendedUseCase}
            </p>
          </div>

          {/* ========================================================================= */}
          {/* 1. SAFETY SCORE & CERTIFICATION CHECKLIST */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Safety Score Meter */}
            <div className="md:col-span-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Safety & Certification Score
              </span>

              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    className="text-slate-100 dark:text-slate-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={getScoreColor(safetyAnalysis.safetyScore).split(' ')[0]}
                    strokeDasharray={`${safetyAnalysis.safetyScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                    {safetyAnalysis.safetyScore}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">/ 100</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Overall Risk: {safetyAnalysis.riskLevel}
                </span>
                <span className="text-[11px] text-slate-500">{safetyAnalysis.dataRetentionPolicy}</span>
              </div>
            </div>

            {/* Certifications Held */}
            <div className="md:col-span-8 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>Vendor Compliance & Statutory Certifications</span>
                </h4>
                <span className="text-[11px] text-slate-400">Audited Proof</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {safetyAnalysis.certifications.map((cert, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                      cert.verified
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {cert.verified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block">{cert.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        {cert.notes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. CAPABILITIES ("WHAT IT CAN DO") */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Core Capabilities ("What It Can Do")</span>
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {safetyAnalysis.whatItCanDo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ========================================================================= */}
          {/* 3. POTENTIAL DANGERS & THREAT VECTORS */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Potential Dangers, Security Vulnerabilities & Risk Vectors</span>
            </h4>

            <div className="space-y-3">
              {safetyAnalysis.threatVectors.map((threat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {threat.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        threat.severity === 'Critical'
                          ? 'bg-rose-500 text-white'
                          : threat.severity === 'High'
                            ? 'bg-amber-500 text-white'
                            : threat.severity === 'Medium'
                              ? 'bg-yellow-400 text-slate-900'
                              : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Severity: {threat.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                    {threat.description}
                  </p>
                  <div className="pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    &bull; Concrete Mitigation: {threat.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. AI WORKING GROUP DECISION & MANDATORY GUARDRAILS */}
          {/* ========================================================================= */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>AI Working Group Governance Recommendation</span>
              </h4>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Recommended: {safetyAnalysis.recommendedDecision}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                Justification & Reasoning:
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {safetyAnalysis.decisionReasoning}
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                Mandatory Operational Guardrails:
              </span>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                {safetyAnalysis.mandatoryGuardrails.map((g, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. PROGRAM LEAD / EXECUTIVE DECISION ACTIONS */}
          {/* ========================================================================= */}
          {(currentRole === 'program_lead' || currentRole === 'executive') && (
            <div className="p-5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Program Lead & GRC Authority Actions</span>
                </span>
                <span className="text-[11px] text-blue-700 dark:text-blue-300">
                  Role: {currentRole === 'program_lead' ? 'Program Lead' : 'Executive Leader'}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Official Decision Comments / Stipulations:
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter specific approval stipulations, tenant requirements, or decline rationale..."
                  value={leadComments}
                  onChange={(e) => setLeadComments(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSaveDecision('Approved')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Approve Tool
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDecision('Approved with Conditions')}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Approve with Conditions
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDecision('Declined')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Decline Tool
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDecision('Banned')}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Ban & Block
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
