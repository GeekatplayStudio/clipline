// src/App.tsx
// Justification: Top-level application shell orchestrating role state, 3D Web visualization, executive analytics, split cockpit, and ServiceNow modal workflows.

import React, { useState, useEffect } from 'react';
// Justification: React framework and lifecycle hooks.

import { workflowStore } from './store/workflow_store.js';
// Justification: Central reactive state store.

import { Workflow, UserRole } from './types/workflow.js';
// Justification: Domain type contracts.

import { Header, AppView } from './components/layout/Header.js';
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

import { RiskNetwork3D } from './components/network3d/RiskNetwork3D.js';
// Justification: Three.js interactive 3D organizational risk web visualizer.

import { ExportReportModal } from './components/reports/ExportReportModal.js';
// Justification: Executive governance export modal for Printable PDF, ServiceNow CSV, and JSON audit manifests.

import { CertificationReadinessPage } from './components/readiness/CertificationReadinessPage.js';
// Justification: Executive certification and regulatory readiness cockpit benchmarking ISO 42001, NIST RMF, EU AI Act, and CFPB.

import { ToolRequestsPage } from './components/tools/ToolRequestsPage.js';
// Justification: Employee AI tool intake catalog, vendor safety analysis, and certification audit cockpit.

export const App: React.FC = () => {
  // Justification: Role state initialized from reactive store.
  const [currentRole, setCurrentRole] = useState<UserRole>(workflowStore.getCurrentRole());

  // Justification: Active view state: 'network3d' | 'registry' | 'dashboard' | 'split' | 'register' | 'quiz'.
  const [activeView, setActiveView] = useState<AppView>('network3d');

  // Justification: Workflows array updated reactively from store subscription.
  const [workflows, setWorkflows] = useState<Workflow[]>(workflowStore.getFilteredWorkflows());

  // Justification: Active filters state.
  const [filters, setFilters] = useState(workflowStore.getFilters());

  // Justification: Currently inspected workflow modal target.
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Justification: Export executive report modal visibility.
  const [showExportModal, setShowExportModal] = useState(false);

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
    // Justification: Automatically navigate to appropriate view when switching roles.
    if (newRole === 'executive') {
      setActiveView('network3d');
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
        onOpenExport={() => setShowExportModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        {/* 1. 3D Organizational Risk Web Visualizer */}
        {activeView === 'network3d' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                  3D Organizational Risk Web
                </h2>
                <p className="text-xs text-slate-500">
                  Interactive multi-layer enterprise topology. Rotate, zoom, pan, and hover nodes to inspect citizen automations, manager hierarchies, and risk tiers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="text-xs self-start sm:self-auto bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-300 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Export Briefing
              </button>
            </div>

            <RiskNetwork3D
              workflows={workflows}
              onSelectWorkflow={(w) => setSelectedWorkflow(w)}
              onFilterLOB={(lob) => handleFilterChange({ lob: lob as any })}
            />
          </div>
        )}

        {/* 2. Registry Table View */}
        {activeView === 'registry' && (
          <RegistryTable
            workflows={workflows}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onSelectWorkflow={(w) => setSelectedWorkflow(w)}
            onOpenExport={() => setShowExportModal(true)}
            currentRole={currentRole}
          />
        )}

        {/* 3. Executive Coverage & Analytics Dashboard */}
        {activeView === 'dashboard' && (
          <CoverageDashboard
            metrics={workflowStore.getExecutiveMetrics()}
            workflows={workflows}
            onSelectWorkflow={(w) => setSelectedWorkflow(w)}
            onFilterLOB={(lob) => handleFilterChange({ lob: lob as any })}
            onOpenExport={() => setShowExportModal(true)}
          />
        )}

        {/* 4. AI Tool Intake & Safety Analysis */}
        {activeView === 'tools' && (
          <ToolRequestsPage currentRole={currentRole} />
        )}

        {/* 5. Standards & Certifications */}
        {activeView === 'readiness' && (
          <CertificationReadinessPage
            onOpenExport={() => setShowExportModal(true)}
          />
        )}

        {/* 6. 4-Step Progressive Intake Wizard */}
        {activeView === 'register' && (
          <IntakeWizard
            onWorkflowCreated={handleWorkflowCreated}
            onCancel={() => setActiveView('registry')}
          />
        )}

        {/* 7. Acceptable Use Companion Knowledge Check */}
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

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        workflows={workflows}
      />

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-400 font-mono">
        Citizen Developer Registry Prototype &middot; Target ServiceNow Ingestion Spec &middot; Upbound Group Standards
      </footer>
    </div>
  );
};
