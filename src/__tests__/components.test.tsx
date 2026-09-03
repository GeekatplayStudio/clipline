// src/__tests__/components.test.tsx
// Justification: Component integration tests verifying the user experience across all three persona views.

import { describe, it, expect, beforeEach } from 'vitest';
// Justification: Vitest test methods.

import { render, screen, fireEvent } from '@testing-library/react';
// Justification: React Testing Library utilities for user interaction simulation.

import { Header } from '../components/layout/Header.js';
import { RegistryTable } from '../components/registry/RegistryTable.js';
import { IntakeWizard } from '../components/intake/IntakeWizard.js';
import { CoverageDashboard } from '../components/dashboard/CoverageDashboard.js';
import { KnowledgeCheck } from '../components/quiz/KnowledgeCheck.js';
import { WorkflowDetailModal } from '../components/detail/WorkflowDetailModal.js';
import { workflowStore } from '../store/workflow_store.js';

describe('Citizen Developer Registry UI Components', () => {
  beforeEach(() => {
    workflowStore.resetToSeedData();
    workflowStore.resetFilters();
  });

  // =========================================================================
  // HEADER COMPONENT TESTS
  // =========================================================================
  it('renders the persistent prototype banner with required ServiceNow positioning', () => {
    render(
      <Header
        currentRole="citizen_developer"
        onRoleChange={() => {}}
        activeView="registry"
        onViewChange={() => {}}
        onResetData={() => {}}
      />
    );

    expect(screen.getByText(/data model exploration/i)).toBeInTheDocument();
    expect(screen.getByText(/Viewing as:/i)).toBeInTheDocument();
    expect(screen.queryByText('3D Organizational Web')).not.toBeInTheDocument();
  });

  it('triggers role change callback when role dropdown value changes', () => {
    let selectedRole = 'citizen_developer';
    render(
      <Header
        currentRole="citizen_developer"
        onRoleChange={(r) => {
          selectedRole = r;
        }}
        activeView="registry"
        onViewChange={() => {}}
        onResetData={() => {}}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'program_lead' } });
    expect(selectedRole).toBe('program_lead');
  });

  // =========================================================================
  // REGISTRY TABLE COMPONENT TESTS
  // =========================================================================
  it('renders dense table rows with correct column headers and handles row click', () => {
    let clickedWorkflow: unknown = null;
    const workflows = workflowStore.getFilteredWorkflows();

    render(
      <RegistryTable
        workflows={workflows}
        filters={workflowStore.getFilters()}
        onFilterChange={() => {}}
        onResetFilters={() => {}}
        onSelectWorkflow={(w) => {
          clickedWorkflow = w;
        }}
        currentRole="citizen_developer"
      />
    );

    // Header assertions
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Workflow Title')).toBeInTheDocument();
    expect(screen.getByText('Derived Tier')).toBeInTheDocument();

    // Verify presence of talking point workflow
    const rowTitle = screen.getByText('Draft responses to customer payment inquiries');
    expect(rowTitle).toBeInTheDocument();

    // Click row
    fireEvent.click(rowTitle);
    expect(clickedWorkflow).not.toBeNull();
  });

  // =========================================================================
  // INTAKE WIZARD TESTS & LIVE DERIVATION CALLOUT
  // =========================================================================
  it('progresses through the 4-step wizard, displays live educational callout, and submits', () => {
    let createdId = '';
    render(
      <IntakeWizard
        onWorkflowCreated={(id) => {
          createdId = id;
        }}
        onCancel={() => {}}
      />
    );

    // Step 1: Fill in title and description
    expect(screen.getByText(/Register an AI Workflow/i)).toBeInTheDocument();
    const titleInput = screen.getByPlaceholderText(/e\.g\., Weekly store performance summary/i);
    const descInput = screen.getByPlaceholderText(/What does it do, in your own words\?/i);

    fireEvent.change(titleInput, { target: { value: 'New Test Automation' } });
    fireEvent.change(descInput, { target: { value: 'Test description for unit testing' } });

    // Click Continue to Step 2
    fireEvent.click(screen.getByText('Continue'));

    // Step 2: What data does it touch?
    expect(screen.getByText(/What data does this workflow touch\?/i)).toBeInTheDocument();

    // Tick "Customer financial data" to test mid-form educational warning callout
    const financialCheckbox = screen.getByLabelText(/Customer financial data/i);
    fireEvent.click(financialCheckbox);

    // Verify educational warning appears immediately
    expect(
      screen.getByText(/Heads up: customer financial data means this will need security and legal review/i)
    ).toBeInTheDocument();

    // Click Continue to Step 3
    fireEvent.click(screen.getByText('Continue'));

    // Step 3: Decision influence & audience
    expect(screen.getByText(/Decision Influence/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Continue'));

    // Step 4: Tools & derived tier banner
    expect(screen.getByText(/Tools Used/i)).toBeInTheDocument();
    expect(screen.getByText(/Transparent Derived Risk Assessment/i)).toBeInTheDocument();

    // Submit workflow
    fireEvent.click(screen.getByText(/Submit Workflow Registration/i));
    expect(createdId).toMatch(/^AIW-\d{4}$/);
  });

  // =========================================================================
  // EXECUTIVE COVERAGE DASHBOARD TESTS
  // =========================================================================
  it('renders executive metrics, stacked exposure bars, and the required footnote', () => {
    const metrics = workflowStore.getExecutiveMetrics();
    render(<CoverageDashboard metrics={metrics} onOpenExport={() => {}} />);

    // KPI cards
    expect(screen.getByText(/Registered Workflows \(Governed\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated Unregistered \(Shadow Exposure\)/i)).toBeInTheDocument();
    expect(screen.getByText('~142')).toBeInTheDocument();

    // Required PRD Section 5.4 footnote
    expect(
      screen.getByText(
        /\*Estimated from tool license counts vs\. registrations\. In production this is the number leadership should actually care about\./i
      )
    ).toBeInTheDocument();

    // Literacy standard
    expect(screen.getByText(/AI Literacy Standard Coverage/i)).toBeInTheDocument();
    expect(screen.getByText(/Target Line: 80%/i)).toBeInTheDocument();

    const lobTab = screen.getByRole('button', { name: /LOB Exposure Bars/i });
    const networkTab = screen.getByRole('button', { name: /3D Organizational Web/i });
    const exportButton = screen.getByRole('button', { name: /Export Report/i });
    expect(lobTab.compareDocumentPosition(networkTab) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(networkTab.compareDocumentPosition(exportButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  // =========================================================================
  // WORKFLOW DETAIL MODAL & PROGRAM LEAD ACTIONS
  // =========================================================================
  it('renders workflow details, support Q&A, and Program Lead approval action controls', () => {
    const record = workflowStore.getAllWorkflows().find((w) => w.id === 'AIW-0008')!;
    let updated = false;

    render(
      <WorkflowDetailModal
        workflow={record}
        currentRole="program_lead"
        onClose={() => {}}
        onStatusUpdated={() => {
          updated = true;
        }}
      />
    );

    // Record details
    expect(screen.getByText('Draft responses to customer payment inquiries')).toBeInTheDocument();
    expect(screen.getByText(/Derived Governance Tier & Rationale/i)).toBeInTheDocument();

    // Program Lead action buttons
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Approve with Conditions')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();

    // Click Approve
    fireEvent.click(screen.getByText('Approve'));
    expect(updated).toBe(true);

    // Support tab
    fireEvent.click(screen.getByText(/Ask the Program Lead/i));
    expect(screen.getByText(/AI Standards Lead Consultation Channel/i)).toBeInTheDocument();
    expect(screen.getByText(/Can I add ChatGPT Vision to this workflow/i)).toBeInTheDocument();
  });

  // =========================================================================
  // ACCEPTABLE USE KNOWLEDGE CHECK TESTS
  // =========================================================================
  it('allows answering situational quiz scenarios with immediate explanatory feedback', () => {
    render(<KnowledgeCheck />);

    expect(screen.getByText(/Acceptable Use Knowledge Check/i)).toBeInTheDocument();
    expect(screen.getByText(/Question 1 \//i)).toBeInTheDocument();

    // Select the first option
    const option = screen.getByText(/A generalized template prompt with placeholders/i);
    fireEvent.click(option);

    // Confirm answer
    fireEvent.click(screen.getByText('Confirm Answer'));

    // Feedback should be visible
    expect(screen.getByText(/Correct Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Key Principle:/i)).toBeInTheDocument();
  });
});
