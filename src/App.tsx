// src/App.tsx
// Justification: Top-level application shell orchestrating role state, view transitions, and modal workflows.

import React, { useState, useEffect } from 'react';
// Justification: React framework and lifecycle hooks.

import { workflowStore } from './store/workflow_store.js';
// Justification: Central reactive state store.

import { Workflow, UserRole } from './types/workflow.js';
// Justification: Domain type contracts.

import { Header } from './components/layout/Header.js';
// Justification: Top navigation header with prototype banner and role switcher.

import { RegistryTable } from './components/registry/RegistryTable.js';
// Justification: Dense ServiceNow-style table view.

import { IntakeWizard } from './components/intake/IntakeWizard.js';
// Justification: 4-step progressive disclosure registration form.

import { CoverageDashboard } from './components/dashboard/CoverageDashboard.js';
// Justification: Executive coverage dashboard.

import { KnowledgeCheck } from './components/quiz/KnowledgeCheck.js';
// Justification: Acceptable use companion knowledge check.

import { WorkflowDetailModal } from './components/detail/WorkflowDetailModal.js';
// Justification: Detailed workflow inspection and Program Lead action modal.

export const App: React.FC = () => {
  // Justification: Role state initialized from reactive store.
  const [currentRole, setCurrentRole] = useState<UserRole>(workflowStore.getCurrentRole());

  // Justification: Active view state: 'registry' | 'register' | 'dashboard' | 'quiz'.
  const [activeView, setActiveView] = useState<'registry' | 'register' | 'dashboard' | 'quiz'>('registry');

  // Justification: Workflows array updated reactively from store subscription.
  const [workflows, setWorkflows] = useState<Workflow[]>(workflowStore.getFilteredWorkflows());

  // Justification: Active filters state.
  const [filters, setFilters] = useState(workflowStore.getFilters());

  // Justification: Currently inspected workflow modal target.
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Justification: Subscribe to store state changes.
  useEffect(() => {
    const unsubscribe = workflowStore.subscribe(() => {
      setCurrentRole(workflowStore.getCurrentRole());
      setFilters(workflowStore.getFilters());
      setWorkflows(workflowStore.getFilteredWorkflows());

      // Justification: Keep selected workflow synchronized if it was updated in modal.
      if (selectedWorkflow) {
        const updated = workflowStore.getAllWorkflows().find((w) => w.id === selectedWorkflow.id);
        if (updated) setSelectedWorkflow(updated);
      }
    });
    return unsubscribe;
  }, [selectedWorkflow]);

  // Justification: Handle role switching from header dropdown.
  const handleRoleChange = (newRole: UserRole) => {
    workflowStore.setCurrentRole(newRole);
    // Justification: Automatically navigate to executive dashboard when switching to Executive role.
    if (newRole === 'executive') {
      setActiveView('dashboard');
    } else if (newRole === 'program_lead') {
      setActiveView('registry');
    }
  };

  // Justification: Handle filter modifications from table controls.
  const handleFilterChange = (updates: Partial<typeof filters>) => {
    workflowStore.setFilters(updates);
  };

  // Justification: Reset filters back to default show-all state.
  const handleResetFilters = () => {
    workflowStore.resetFilters();
  };

  // Justification: Callback when a new workflow is registered through the 4-step wizard.
  const handleWorkflowCreated = (newId: string) => {
    const created = workflowStore.getAllWorkflows().find((w) => w.id === newId);
    if (created) {
      setSelectedWorkflow(created);
    }
    setActiveView('registry');
  };

  // Justification: Reset all store workflows back to baseline 24-record seed.
  const handleResetSeed = () => {
    workflowStore.resetToSeedData();
    workflowStore.resetFilters();
    setSelectedWorkflow(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* Pinned Top Navigation with Persistent Prototype Banner */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeView={activeView}
        onViewChange={setActiveView}
        onResetData={handleResetSeed}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        {activeView === 'registry' && (
          <RegistryTable
            workflows={workflows}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onSelectWorkflow={(w) => setSelectedWorkflow(w)}
            currentRole={currentRole}
          />
        )}

        {activeView === 'register' && (
          <IntakeWizard
            onWorkflowCreated={handleWorkflowCreated}
            onCancel={() => setActiveView('registry')}
          />
        )}

        {activeView === 'dashboard' && (
          <CoverageDashboard metrics={workflowStore.getExecutiveMetrics()} />
        )}

        {activeView === 'quiz' && (
          <KnowledgeCheck
            onComplete={() => {
              // Stay on results screen
            }}
          />
        )}
      </main>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <WorkflowDetailModal
          workflow={selectedWorkflow}
          currentRole={currentRole}
          onClose={() => setSelectedWorkflow(null)}
          onStatusUpdated={() => {
            // Updated via store subscription
          }}
        />
      )}

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-400 font-mono">
        Citizen Developer Registry Prototype &middot; Target ServiceNow Ingestion Spec &middot; Upbound Group Standards
      </footer>
    </div>
  );
};
