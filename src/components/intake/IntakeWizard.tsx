// src/components/intake/IntakeWizard.tsx
// Justification: 4-step progressive disclosure intake wizard implementing PRD Section 5.1 with live educational feedback.

import React, { useState } from 'react';
// Justification: React hooks for wizard state and form control.

import { WorkflowIntakeFormData } from '../../types/workflow.js';
// Justification: Domain types for intake attributes.

import { workflowStore } from '../../store/workflow_store.js';
// Justification: Store for appending completed workflow.

import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { IntakeWizardFields } from './IntakeWizardFields.js';
// Justification: Icons for enterprise visual clarity.

interface IntakeWizardProps {
  onWorkflowCreated: (newId: string) => void;
  onCancel: () => void;
}

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
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Register an AI Workflow</h2>
          <p className="text-xs text-slate-500">Intake and transparent risk tiering governance</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-500">Step</span>
          <span className="font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">{step} / 4</span>
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
        <IntakeWizardFields step={step} error={error} formData={formData} setFormData={setFormData} />

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
