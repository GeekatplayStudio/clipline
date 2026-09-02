// src/components/intake/IntakeWizard.tsx
// Justification: 4-step progressive disclosure intake wizard implementing PRD Section 5.1 with live educational feedback.

import React, { useState } from 'react';
// Justification: React hooks for wizard state and form control.

import {
  WorkflowIntakeFormData,
  LineOfBusiness,
  ToolName,
  BuildType,
  DataCategory,
  DecisionInfluence,
  OutputAudience,
  HumanReviewFrequency,
  BuilderLiteracyTier,
} from '../../types/workflow.js';
// Justification: Domain types for intake attributes.

import { evaluateRiskTier, getEducationalCallout } from '../../engine/risk_engine.js';
// Justification: Risk engine for real-time live derivation during wizard completion.

import { workflowStore } from '../../store/workflow_store.js';
// Justification: Store for appending completed workflow.

import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
// Justification: Icons for enterprise visual clarity.

interface IntakeWizardProps {
  onWorkflowCreated: (newId: string) => void;
  onCancel: () => void;
}

// Reference arrays per PRD Section 4
const LOBS: LineOfBusiness[] = ['Rent-A-Center', 'Acima', 'Brigit', 'Mexico', 'Corporate'];
const TOOLS: ToolName[] = [
  'ChatGPT / OpenAI',
  'Claude',
  'Microsoft Copilot',
  'Google Gemini',
  'Power Automate',
  'Power BI Copilot',
  'Zapier',
  'n8n',
  'Salesforce Einstein',
  'ServiceNow Now Assist',
  'Custom API integration',
  'Other',
];
const BUILD_TYPES: BuildType[] = [
  'Prompt/chat workflow',
  'Automation (Power Automate, Zapier, n8n)',
  'Custom script',
  'Vendor AI feature',
  'Agent/multi-step',
];
const DATA_CATEGORIES: DataCategory[] = [
  'No company data',
  'Public company information',
  'Internal non-sensitive',
  'Internal confidential',
  'Employee data',
  'Customer PII',
  'Customer financial data',
  'Credit or underwriting data',
];
const DECISION_INFLUENCES: DecisionInfluence[] = [
  'No decision — informational only',
  'Internal operational decision (staffing, inventory, scheduling)',
  'Employee-affecting decision (hiring, evaluation, scheduling)',
  'Customer-affecting decision — communications',
  'Customer-affecting decision — service or account',
  'Customer-affecting decision — credit or underwriting',
];
const AUDIENCES: OutputAudience[] = ['Just me', 'My team', 'Internal broad', 'Customer-facing'];
const HUMAN_REVIEWS: HumanReviewFrequency[] = ['Every output reviewed', 'Sampled', 'None'];
const BUILDER_TIERS: BuilderLiteracyTier[] = ['Tier 1 Aware', 'Tier 2 Fluent', 'Tier 3 Builder'];

export const IntakeWizard: React.FC<IntakeWizardProps> = ({ onWorkflowCreated, onCancel }) => {
  // Justification: Track current wizard step (1 to 4).
  const [step, setStep] = useState<number>(1);

  // Justification: Comprehensive intake form state initialized with realistic defaults.
  const [formData, setFormData] = useState<WorkflowIntakeFormData>({
    title: '',
    description: '',
    owner_name: 'Current User',
    owner_role: 'Operations Analyst',
    lob: 'Rent-A-Center',
    department: 'Operations',
    tools_used: ['Microsoft Copilot'],
    build_type: 'Prompt/chat workflow',
    data_categories: ['Internal non-sensitive'],
    decision_influence: 'Internal operational decision (staffing, inventory, scheduling)',
    output_audience: 'My team',
    data_leaves_tenant: false,
    human_review: 'Every output reviewed',
    conditions: '',
    builder_tier: 'Tier 2 Fluent',
    training_current: true,
  });

  // Justification: Validation error message state.
  const [error, setError] = useState<string | null>(null);

  // Justification: Dynamic live evaluation computed on current form values.
  const liveEvaluation = evaluateRiskTier(formData);
  const educationalCallout = getEducationalCallout(formData.data_categories);

  // Justification: Toggles data category multi-selection checkboxes.
  const handleDataCategoryToggle = (category: DataCategory) => {
    setFormData((prev) => {
      const exists = prev.data_categories.includes(category);
      let updated: DataCategory[];
      if (exists) {
        updated = prev.data_categories.filter((c) => c !== category);
        if (updated.length === 0) updated = ['No company data'];
      } else {
        updated = category === 'No company data'
          ? ['No company data']
          : [...prev.data_categories.filter((c) => c !== 'No company data'), category];
      }
      return { ...prev, data_categories: updated };
    });
  };

  // Justification: Toggles tools used multi-selection checkboxes.
  const handleToolToggle = (tool: ToolName) => {
    setFormData((prev) => {
      const exists = prev.tools_used.includes(tool);
      const updated = exists
        ? prev.tools_used.filter((t) => t !== tool)
        : [...prev.tools_used, tool];
      return { ...prev, tools_used: updated.length > 0 ? updated : [tool] };
    });
  };

  // Justification: Step validation logic preventing forward navigation on invalid states.
  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setError('Please enter a plain-language title for this workflow.');
        return false;
      }
      if (!formData.description.trim()) {
        setError('Please enter a short description of what the workflow accomplishes.');
        return false;
      }
      if (!formData.owner_name.trim()) {
        setError('Please provide the owner name.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (formData.data_categories.length === 0) {
        setError('Please select at least one data category.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  // Justification: Final submission handler invoking store addWorkflow.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const newRecord = workflowStore.addWorkflow(formData);
    onWorkflowCreated(newRecord.id);
  };

  return (
    <div className="max-w-3xl mx-auto my-6 bg-white border border-slate-300 rounded shadow-sm">
      {/* Justification: Form Header with step progression indicator per PRD Section 5.1 layout */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Register an AI Workflow
          </h2>
          <p className="text-xs text-slate-500">
            Intake and transparent risk tiering governance
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-500">Step</span>
          <span className="font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
            {step} / 4
          </span>
        </div>
      </div>

      {/* Justification: Step progress bar */}
      <div className="w-full bg-slate-200 h-1">
        <div
          className="bg-slate-900 h-1 transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: What is it? Title, description, owner, LOB, department            */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Workflow Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Weekly store performance summary"
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Use a plain-language name describing the actual job to be done.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Description <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does it do, in your own words?"
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Owner Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Owner Role
                </label>
                <input
                  type="text"
                  value={formData.owner_role}
                  onChange={(e) => setFormData({ ...formData, owner_role: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Line of Business (LOB) <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.lob}
                  onChange={(e) => setFormData({ ...formData, lob: e.target.value as LineOfBusiness })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white"
                >
                  {LOBS.map((lob) => (
                    <option key={lob} value={lob}>
                      {lob}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Builder AI Literacy Tier
              </label>
              <select
                value={formData.builder_tier}
                onChange={(e) => setFormData({ ...formData, builder_tier: e.target.value as BuilderLiteracyTier })}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white"
              >
                {BUILDER_TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: What data does it touch? (Ordered by sensitivity + Live Callout)   */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                What data does this workflow touch?
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Select everything that applies. Ordered from lowest to highest sensitivity.
              </p>
            </div>

            <div className="space-y-2 border border-slate-200 rounded p-3 bg-slate-50">
              {DATA_CATEGORIES.map((cat) => {
                const isChecked = formData.data_categories.includes(cat);
                const isHighRisk = ['Customer PII', 'Customer financial data', 'Credit or underwriting data'].includes(cat);
                return (
                  <label
                    key={cat}
                    className={`flex items-start space-x-2.5 p-2 rounded cursor-pointer transition-colors ${
                      isChecked
                        ? isHighRisk
                          ? 'bg-rose-50/70 border border-rose-200'
                          : 'bg-white border border-slate-300'
                        : 'hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleDataCategoryToggle(cat)}
                      className="mt-0.5 rounded text-slate-900 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className={`font-medium ${isHighRisk ? 'text-rose-900' : 'text-slate-800'}`}>
                        {cat}
                      </span>
                      {isHighRisk && (
                        <span className="ml-2 inline-block px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[10px] rounded font-mono">
                          Sensitive
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Justification: PRD Section 5.1 Mandate: Live mid-form educational warning callout */}
            {educationalCallout && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs flex items-start space-x-3 transition-all animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-semibold">Educational Callout:</strong> {educationalCallout}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: What does it do with the output? (Decision, Audience, Review)      */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Decision Influence <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.decision_influence}
                onChange={(e) => setFormData({ ...formData, decision_influence: e.target.value as DecisionInfluence })}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white"
              >
                {DECISION_INFLUENCES.map((dec) => (
                  <option key={dec} value={dec}>
                    {dec}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                This field determines adverse action and consumer regulatory exposure.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Output Audience
              </label>
              <select
                value={formData.output_audience}
                onChange={(e) => setFormData({ ...formData, output_audience: e.target.value as OutputAudience })}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white"
              >
                {AUDIENCES.map((aud) => (
                  <option key={aud} value={aud}>
                    {aud}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Human Review Oversight
              </label>
              <select
                value={formData.human_review}
                onChange={(e) => setFormData({ ...formData, human_review: e.target.value as HumanReviewFrequency })}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white"
              >
                {HUMAN_REVIEWS.map((hr) => (
                  <option key={hr} value={hr}>
                    {hr}
                  </option>
                ))}
              </select>
              {formData.human_review === 'None' && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  Notice: Operating with 'None' human review elevates the risk tier.
                </p>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.data_leaves_tenant}
                  onChange={(e) => setFormData({ ...formData, data_leaves_tenant: e.target.checked })}
                  className="mt-0.5 rounded text-slate-900 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-900">
                    Does data leave our approved enterprise tenant boundary?
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Check if you send prompts to non-enterprise APIs, personal consumer accounts, or unapproved third-party servers.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: How is it built? Tools, build type -> Derived Tier Explanation   */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Tools Used (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-slate-200 rounded p-3 bg-slate-50">
                {TOOLS.map((tool) => {
                  const isChecked = formData.tools_used.includes(tool);
                  return (
                    <label
                      key={tool}
                      className={`flex items-center space-x-2 p-1.5 rounded cursor-pointer ${
                        isChecked ? 'bg-white border border-slate-300' : 'hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToolToggle(tool)}
                        className="rounded text-slate-900 focus:ring-0"
                      />
                      <span className="text-slate-800 truncate">{tool}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Build Architecture Type
              </label>
              <select
                value={formData.build_type}
                onChange={(e) => setFormData({ ...formData, build_type: e.target.value as BuildType })}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white"
              >
                {BUILD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>

            {/* Justification: PRD Section 4 & Section 5.1: The Live Derived Risk Tier Explanation Callout */}
            <div className="border border-slate-300 rounded p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-slate-700" />
                  <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                    Transparent Derived Risk Assessment
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-xs rounded border font-bold ${
                    liveEvaluation.tier === 'Tier 1 Low'
                      ? 'badge-tier1'
                      : liveEvaluation.tier === 'Tier 2 Moderate'
                      ? 'badge-tier2'
                      : liveEvaluation.tier === 'Tier 3 High'
                      ? 'badge-tier3'
                      : 'badge-tier4'
                  }`}
                >
                  {liveEvaluation.tier}
                </span>
              </div>

              <div>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {liveEvaluation.reason}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Approval Route: </span>
                  <span className="font-semibold text-slate-800">{liveEvaluation.routeTo}</span>
                </div>
                <div>
                  <span className="text-slate-500">Reattestation Cadence: </span>
                  <span className="font-semibold text-slate-800">Every {liveEvaluation.reviewCadenceMonths} Months</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls Navigation Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 flex items-center space-x-1"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 flex items-center space-x-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Submit Workflow Registration</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
