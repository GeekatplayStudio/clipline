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

import { ExportReportModal } from './components/reports/ExportReportModal.js';
// Justification: Executive governance export modal for Printable PDF, ServiceNow CSV, and JSON audit manifests.

import { CertificationReadinessPage } from './components/readiness/CertificationReadinessPage.js';
// Justification: Executive certification and regulatory readiness cockpit benchmarking ISO 42001, NIST RMF, EU AI Act, and CFPB.

import { ToolRequestsPage } from './components/tools/ToolRequestsPage.js';
// Justification: Employee AI tool intake catalog, vendor safety analysis, and certification audit cockpit.

import { SettingsModal } from './components/settings/SettingsModal.js';
// Justification: User configuration modal for theme mode and overlay glossary help.

import { OverlayHelpHUD } from './components/help/OverlayHelpHUD.js';
// Justification: Interactive mouse-over HUD displaying deep governance definitions.
import { LoginScreen } from './components/auth/LoginScreen.js';
import { hasPersistentAccess, revokeAccess } from './auth/access_control.js';

interface RegistryApplicationProps {
  onLogout: () => void;
}

const RegistryApplication: React.FC<RegistryApplicationProps> = ({ onLogout }) => {
  // Justification: Role state initialized from reactive store.
  const [currentRole, setCurrentRole] = useState<UserRole>(workflowStore.getCurrentRole());

  // Start in the consolidated visual analytics cockpit.
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  // Justification: Workflows array updated reactively from store subscription.
  const [workflows, setWorkflows] = useState<Workflow[]>(workflowStore.getFilteredWorkflows());

  // Justification: Active filters state.
  const [filters, setFilters] = useState(workflowStore.getFilters());

  // Justification: Currently inspected workflow modal target.
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Justification: Export executive report modal visibility.
  const [showExportModal, setShowExportModal] = useState(false);

  // Justification: System configuration & overlay help modal visibility.
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Justification: Subscribe to store state changes.
  useEffect(() => {
    const unsubscribe = workflowStore.subscribe(() => {
      setCurrentRole(workflowStore.getCurrentRole());
      setFilters(workflowStore.getFilters());
      setWorkflows(workflowStore.getFilteredWorkflows());

      // Justification: Keep selected workflow synchronized if it was updated in modal.
      setSelectedWorkflow((selected) => {
        if (!selected) return null;
        return workflowStore.getAllWorkflows().find((w) => w.id === selected.id) ?? null;
      });
    });

    return () => unsubscribe();
  }, []);

  // Justification: Handle role switcher in header.
  const handleRoleChange = (newRole: UserRole) => {
    workflowStore.setCurrentRole(newRole);
  };

  // Justification: Handle filter changes from table or dashboard.
  const handleFilterChange = (newFilters: Parameters<typeof workflowStore.setFilters>[0]) => {
    workflowStore.setFilters(newFilters);
  };

  // Justification: Reset filters back to default show-all state.
  const handleResetFilters = () => {
    workflowStore.resetFilters();
  };

  // Justification: Post-creation workflow callback.
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
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Pinned Top Navigation with Persistent Prototype Banner */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeView={activeView}
        onViewChange={setActiveView}
        onResetData={handleResetSeed}
        onOpenExport={() => setShowExportModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        {/* Registry Table View */}
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
            onFilterLOB={(lob) => handleFilterChange({ lob })}
            onFilterStatus={(status) => {
              handleFilterChange({ status });
              setActiveView('registry');
            }}
            onFilterTier={(tier) => {
              handleFilterChange({ tier });
              setActiveView('registry');
            }}
            onFilterOverdue={() => {
              handleFilterChange({ onlyOverdue: true });
              setActiveView('registry');
            }}
            onOpenExport={() => setShowExportModal(true)}
          />
        )}

        {/* 4. AI Tool Intake & Safety Analysis */}
        {activeView === 'tools' && <ToolRequestsPage currentRole={currentRole} />}

        {/* 5. Standards & Certifications */}
        {activeView === 'readiness' && (
          <CertificationReadinessPage onOpenExport={() => setShowExportModal(true)} />
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
        workflows={workflowStore.getAllWorkflows()}
      />

      {/* System Settings & Overlay Help Modal */}
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

      {/* Interactive Mouse-Over Governance Overlay Help HUD */}
      <OverlayHelpHUD />

      {/* Enterprise Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3 text-center text-xs text-slate-400 font-mono">
        Citizen Developer Registry Prototype &middot; Target ServiceNow Ingestion Spec &middot; Upbound Group
        Standards
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(hasPersistentAccess);

  if (!isAuthenticated) {
    return <LoginScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <RegistryApplication
      onLogout={() => {
        revokeAccess();
        setIsAuthenticated(false);
      }}
    />
  );
};
