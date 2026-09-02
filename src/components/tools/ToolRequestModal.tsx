// src/components/tools/ToolRequestModal.tsx
// Justification: Interactive modal form for employees to request new AI tools with live compliance advisories.

import React, { useState } from 'react';
import { toolRequestStore } from '../../store/tool_request_store.js';
import { ToolCategory, DataHandlingModel } from '../../types/tool_request.js';
import { LOB } from '../../types/workflow.js';
import { X, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ToolRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TOOL_CATEGORIES: ToolCategory[] = [
  'Code & Development',
  'Content & Marketing',
  'Research & Search',
  'Meeting & Audio Transcription',
  'Data Analysis & BI',
  'Workflow Automation',
  'Voice & Synthetic Media',
];

const DATA_HANDLING_MODELS: DataHandlingModel[] = [
  'Enterprise Tenant (Zero Retention)',
  'Vendor Cloud (Multi-Tenant)',
  'Public / Consumer Cloud',
  'Local Desktop / Self-Hosted',
];

const DATA_CATEGORIES_OPTIONS = [
  'No company data (General knowledge only)',
  'Public company information',
  'Internal non-sensitive (Process docs, guides)',
  'Internal confidential (Strategy, plans)',
  'Employee data (HR, performance)',
  'Customer PII (Names, contact info, SSN)',
  'Customer financial data (Balances, lease history)',
  'Credit or underwriting data (Scores, approval rules)',
];

export const ToolRequestModal: React.FC<ToolRequestModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [toolName, setToolName] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState<ToolCategory>('Research & Search');
  const [requesterName, setRequesterName] = useState('');
  const [requesterRole, setRequesterRole] = useState('');
  const [lob, setLob] = useState<LOB>('Acima');
  const [department, setDepartment] = useState('');
  const [intendedUseCase, setIntendedUseCase] = useState('');
  const [dataHandlingModel, setDataHandlingModel] = useState<DataHandlingModel>(
    'Enterprise Tenant (Zero Retention)'
  );
  const [selectedSensitivities, setSelectedSensitivities] = useState<string[]>([
    'Internal non-sensitive (Process docs, guides)',
  ]);
  const [error, setError] = useState<string | null>(null);

  const toggleSensitivity = (item: string) => {
    setSelectedSensitivities((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const touchesCredit = selectedSensitivities.some((s) =>
    s.toLowerCase().includes('credit') || s.toLowerCase().includes('underwriting')
  );
  const touchesPII = selectedSensitivities.some(
    (s) => s.toLowerCase().includes('pii') || s.toLowerCase().includes('financial')
  );
  const isConsumerCloud = dataHandlingModel.includes('Public');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim() || !vendor.trim() || !requesterName.trim() || !intendedUseCase.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    toolRequestStore.addToolRequest({
      toolName: toolName.trim(),
      vendor: vendor.trim(),
      category,
      requesterName: requesterName.trim(),
      requesterRole: requesterRole.trim() || 'Team Member',
      lob,
      department: department.trim() || 'General Operations',
      intendedUseCase: intendedUseCase.trim(),
      dataHandlingModel,
      intendedDataSensitivity: selectedSensitivities,
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Request New Enterprise AI Tool
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit software or API service for security, ISO 42001, and risk analysis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Tool Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tool / Service Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Cursor IDE, Perplexity, Claude API"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Vendor / Organization *
              </label>
              <input
                type="text"
                placeholder="e.g. Anthropic, OpenAI, Microsoft"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tool Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ToolCategory)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                {TOOL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Data Handling / Tenant Model
              </label>
              <select
                value={dataHandlingModel}
                onChange={(e) => setDataHandlingModel(e.target.value as DataHandlingModel)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                {DATA_HANDLING_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Requester Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Requester Name *
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Role / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Lead Analyst"
                value={requesterRole}
                onChange={(e) => setRequesterRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Line of Business (LOB)
              </label>
              <select
                value={lob}
                onChange={(e) => setLob(e.target.value as LOB)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Acima">Acima</option>
                <option value="Rent-A-Center">Rent-A-Center</option>
                <option value="Brigit">Brigit</option>
                <option value="Corporate">Corporate</option>
                <option value="Mexico">Mexico</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Underwriting"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Use Case */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Business Problem & Intended Use Case *
            </label>
            <textarea
              rows={3}
              placeholder="Describe specifically what task this tool will perform, who uses the output, and how it improves team efficiency..."
              value={intendedUseCase}
              onChange={(e) => setIntendedUseCase(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
              required
            />
          </div>

          {/* Section 4: Data Sensitivity Multi-Select */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              What categories of data will this tool ingest or touch? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {DATA_CATEGORIES_OPTIONS.map((opt) => {
                const isSelected = selectedSensitivities.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => toggleSensitivity(opt)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 text-blue-900 dark:text-blue-200 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-400'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-[11px] leading-tight">{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic AI Safety Warning Callout */}
          {(touchesCredit || touchesPII || isConsumerCloud) && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300 block">
                  Automated Pre-Intake Governance Advisory:
                </span>
                <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed text-[11px]">
                  {touchesCredit
                    ? '⚠️ Credit & Underwriting Data is strictly regulated under CFPB Regulation B. Using non-enterprise AI models for underwriting will trigger immediate Tier 4 escalation.'
                    : touchesPII
                    ? '⚠️ Customer PII & Financial Data requires an active Zero Data Retention (ZDR) Enterprise Agreement with verified SOC 2 Type II audit before ingestion.'
                    : '⚠️ Public/Consumer cloud tools often log user prompts to retrain general foundation models. Consider Enterprise Tenant tier.'}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit for AI Governance Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
