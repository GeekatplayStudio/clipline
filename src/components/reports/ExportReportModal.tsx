// src/components/reports/ExportReportModal.tsx
// Justification: Executive reporting suite with one-click export for Printable Executive Briefing, ServiceNow u_ai_workflow_registry CSV, and Audit JSON.

import React from 'react';
import { useDialog } from '../../hooks/useDialog.js';
import { Workflow } from '../../types/workflow.js';
import { getTierNumber } from '../network3d/NodeDetailOverlay.js';
import { X, Printer, FileSpreadsheet, FileJson, Info } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflows: Workflow[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  workflows,
}) => {
  const dialogRef = useDialog(onClose, isOpen);
  if (!isOpen) return null;

  const serializeCsvCell = (value: string | boolean): string => {
    let text = String(value);
    // Spreadsheet applications may execute cells beginning with these characters.
    if (/^[\t\r ]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL?.(url);
  };

  // 1. Export as ServiceNow CSV
  const handleExportCSV = () => {
    const headers = [
      'u_number',
      'u_title',
      'u_lob',
      'u_department',
      'u_owner_name',
      'u_owner_role',
      'u_risk_tier',
      'u_status',
      'u_human_review',
      'u_training_current',
      'u_review_due_date',
    ];

    const rows = workflows.map((w) => [
      w.id,
      w.title,
      w.lob,
      w.department,
      w.owner_name,
      w.owner_role,
      w.risk_tier,
      w.status,
      w.human_review,
      w.training_current ? 'Yes' : 'No',
      w.review_due,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(serializeCsvCell).join(','))
      .join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `ServiceNow_AI_Workflow_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // 2. Export as JSON Manifest
  const handleExportJSON = () => {
    const manifest = {
      exportMetadata: {
        system: 'Upbound Group AI Citizen Developer Registry',
        targetPlatform: 'ServiceNow u_ai_workflow_registry',
        timestamp: new Date().toISOString(),
        totalRecords: workflows.length,
        governanceStandard: 'Acceptable Use Policy v1.4',
        estimatedUnregistered: 142,
      },
      records: workflows,
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `AI_Registry_Audit_Manifest_${new Date().toISOString().slice(0, 10)}.json`);
  };

  // 3. Trigger Browser Print View
  const handlePrint = () => {
    window.print();
  };

  // Summary Metrics
  const t4Count = workflows.filter((w) => getTierNumber(w.risk_tier) === 4).length;
  const t3Count = workflows.filter((w) => getTierNumber(w.risk_tier) === 3).length;
  const t2Count = workflows.filter((w) => getTierNumber(w.risk_tier) === 2).length;
  const t1Count = workflows.filter((w) => getTierNumber(w.risk_tier) === 1).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-report-title"
        tabIndex={-1}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
              Governance & Compliance Reporting
            </span>
            <h3 id="export-report-title" className="text-xl font-bold text-slate-900 dark:text-white">
              Export Executive Governance Briefing
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export report"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Executive Summary Snapshot */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Executive Telemetry Overview
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="block text-lg font-black text-rose-600">{t4Count}</span>
                <span className="text-[10px] text-slate-500 font-medium">Tier 4 Prohibited</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="block text-lg font-black text-amber-600">{t3Count}</span>
                <span className="text-[10px] text-slate-500 font-medium">Tier 3 High Risk</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="block text-lg font-black text-yellow-500">{t2Count}</span>
                <span className="text-[10px] text-slate-500 font-medium">Tier 2 Moderate</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="block text-lg font-black text-emerald-600">{t1Count}</span>
                <span className="text-[10px] text-slate-500 font-medium">Tier 1 Governed</span>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 italic">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                *Estimated from tool license counts vs. registrations. In production this is the number leadership should actually care about.
              </span>
            </div>
          </div>

          {/* Export Action Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Action 1: Print / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-all hover:shadow-md cursor-pointer group"
            >
              <div className="p-2 w-fit bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                Printable Executive PDF
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Print-ready formatted document with executive summary and risk matrix.
              </p>
            </button>

            {/* Action 2: ServiceNow CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-all hover:shadow-md cursor-pointer group"
            >
              <div className="p-2 w-fit bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                ServiceNow CSV
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Field-mapped CSV formatted for direct import to u_ai_workflow_registry.
              </p>
            </button>

            {/* Action 3: Audit JSON */}
            <button
              type="button"
              onClick={handleExportJSON}
              className="p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-all hover:shadow-md cursor-pointer group"
            >
              <div className="p-2 w-fit bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                <FileJson className="w-5 h-5" />
              </div>
              <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                Audit JSON Manifest
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                 Complete point-in-time data snapshot for compliance review.
              </p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {workflows.length} records ready for extraction
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
