// src/__tests__/workflow_store.test.ts
// Unit and integration coverage for workflow-store invariants and failure modes.

import { describe, it, expect, beforeEach, vi } from 'vitest';
// Justification: Vitest testing assertions, hooks, and spy utilities.

import { workflowStore } from '../store/workflow_store.js';
// Justification: Target store singleton under test.

import { WorkflowIntakeFormData } from '../types/workflow.js';
// Justification: Domain type for mock workflow payload.

describe('WorkflowStore Reactive State & Governance Actions', () => {
  beforeEach(() => {
    // Reset store before each test to maintain clean test isolation
    workflowStore.resetToSeedData();
    workflowStore.resetFilters();
    workflowStore.setCurrentRole('citizen_developer');
  });

  // =========================================================================
  // INITIALIZATION & SNAPSHOT TESTS
  // =========================================================================
  it('initializes with 24 baseline seed workflows per PRD Section 6', () => {
    const all = workflowStore.getAllWorkflows();
    expect(all.length).toBe(24);
    expect(all.some((w) => w.id === 'AIW-0001')).toBe(true);
    expect(all.some((w) => w.id === 'AIW-0008')).toBe(true); // Talking point record
    expect(all.some((w) => w.id === 'AIW-0009')).toBe(true); // Tier 4 record
  });

  // =========================================================================
  // ROLE SWITCHING TESTS
  // =========================================================================
  it('manages user role transitions and notifies registered subscribers', () => {
    let notified = false;
    const unsubscribe = workflowStore.subscribe(() => {
      notified = true;
    });

    expect(workflowStore.getCurrentRole()).toBe('citizen_developer');
    workflowStore.setCurrentRole('program_lead');
    expect(workflowStore.getCurrentRole()).toBe('program_lead');
    expect(notified).toBe(true);

    // Test unsubscription
    notified = false;
    unsubscribe();
    workflowStore.setCurrentRole('executive');
    expect(workflowStore.getCurrentRole()).toBe('executive');
    expect(notified).toBe(false);
  });

  // =========================================================================
  // FILTERING LOGIC TESTS
  // =========================================================================
  it('filters workflows accurately across all dimensions', () => {
    // Filter by Line of Business
    workflowStore.setFilters({ lob: 'Rent-A-Center' });
    const racItems = workflowStore.getFilteredWorkflows();
    expect(racItems.length).toBe(7);
    expect(racItems.every((w) => w.lob === 'Rent-A-Center')).toBe(true);

    // Filter by Risk Tier
    workflowStore.setFilters({ lob: 'All', tier: 'Tier 4 Prohibited' });
    const tier4Items = workflowStore.getFilteredWorkflows();
    expect(tier4Items.length).toBe(1);
    expect(tier4Items[0].id).toBe('AIW-0009');

    // Filter by Status
    workflowStore.setFilters({ tier: 'All', status: 'Retired' });
    const retiredItems = workflowStore.getFilteredWorkflows();
    expect(retiredItems.length).toBe(1);
    expect(retiredItems[0].status).toBe('Retired');

    // Filter by Review Overdue
    workflowStore.setFilters({ status: 'All', onlyOverdue: true });
    const overdueItems = workflowStore.getFilteredWorkflows();
    expect(overdueItems.length).toBeGreaterThan(0);
    const today = new Date().toISOString().split('T')[0];
    expect(overdueItems.every((w) => w.review_due < today)).toBe(true);

    // Filter by Training Not Current
    workflowStore.setFilters({ onlyOverdue: false, onlyTrainingNotCurrent: true });
    const trainingItems = workflowStore.getFilteredWorkflows();
    expect(trainingItems.length).toBeGreaterThan(0);
    expect(trainingItems.every((w) => w.training_current === false)).toBe(true);

    // Reset filters
    workflowStore.resetFilters();
    expect(workflowStore.getFilteredWorkflows().length).toBe(24);
  });

  // =========================================================================
  // ADD WORKFLOW & AUTO-TIERING TESTS
  // =========================================================================
  it('adds a Tier 1 workflow and marks it auto-approved', () => {
    const payload: WorkflowIntakeFormData = {
      title: 'Store HVAC filter replacement schedule alert',
      description: 'Sends maintenance reminders to store managers.',
      owner_name: 'John Miller',
      owner_role: 'Operations Coordinator',
      lob: 'Rent-A-Center',
      department: 'Store Operations',
      tools_used: ['Microsoft Copilot'],
      build_type: 'Prompt/chat workflow',
      data_categories: ['Internal non-sensitive'],
      decision_influence: 'Internal operational decision (staffing, inventory, scheduling)',
      output_audience: 'My team',
      data_leaves_tenant: false,
      human_review: 'Every output reviewed',
      builder_tier: 'Tier 1 Aware',
      training_current: true,
    };

    const newRecord = workflowStore.addWorkflow(payload);
    expect(newRecord.id).toBe('AIW-0025');
    expect(newRecord.risk_tier).toBe('Tier 1 Low');
    expect(newRecord.status).toBe('Approved'); // Auto-approved for Tier 1
    expect(workflowStore.getAllWorkflows().length).toBe(25);
  });

  it('adds a Tier 3 workflow and sets initial status to In review', () => {
    const payload: WorkflowIntakeFormData = {
      title: 'Customer repayment plan chatbot',
      description: 'Drafts lease restructuring options.',
      owner_name: 'Sarah Connor',
      owner_role: 'Collections Specialist',
      lob: 'Acima',
      department: 'Collections',
      tools_used: ['ChatGPT / OpenAI'],
      build_type: 'Automation (Power Automate, Zapier, n8n)',
      data_categories: ['Customer financial data'],
      decision_influence: 'Customer-affecting decision — communications',
      output_audience: 'Customer-facing',
      data_leaves_tenant: true,
      human_review: 'Sampled',
      builder_tier: 'Tier 2 Fluent',
      training_current: true,
    };

    const newRecord = workflowStore.addWorkflow(payload);
    expect(newRecord.risk_tier).toBe('Tier 3 High');
    expect(newRecord.status).toBe('In review');
    expect(newRecord.review_due).toBeDefined();

    // Call addWorkflow again to exercise maxNum comparison branches
    const secondRecord = workflowStore.addWorkflow(payload);
    expect(secondRecord.id).toBe('AIW-0026');
  });

  // =========================================================================
  // STATUS TRANSITION & APPROVAL ACTIONS
  // =========================================================================
  it('allows Program Lead to approve with conditions or decline records', () => {
    // Approve with conditions
    const success = workflowStore.updateWorkflowStatus(
      'AIW-0008',
      'Approved with conditions',
      'Requires human-in-the-loop review on every message sent to delinquent accounts'
    );
    expect(success).toBe(true);

    const record = workflowStore.getAllWorkflows().find((w) => w.id === 'AIW-0008');
    expect(record?.status).toBe('Approved with conditions');
    expect(record?.conditions).toContain('Requires human-in-the-loop');

    // Decline
    workflowStore.updateWorkflowStatus('AIW-0008', 'Declined');
    const updated = workflowStore.getAllWorkflows().find((w) => w.id === 'AIW-0008');
    expect(updated?.status).toBe('Declined');

    // Non-existent ID returns false
    expect(workflowStore.updateWorkflowStatus('AIW-9999', 'Approved')).toBe(false);
  });

  it('keeps snapshots immutable and restores pristine seed records', () => {
    const snapshot = workflowStore.getAllWorkflows();
    const original = snapshot.find((workflow) => workflow.id === 'AIW-0008');
    expect(original).toBeDefined();
    original!.title = 'Caller mutation';
    expect(workflowStore.getAllWorkflows().find((workflow) => workflow.id === 'AIW-0008')?.title).not.toBe(
      'Caller mutation'
    );

    workflowStore.updateWorkflowStatus('AIW-0008', 'Declined');
    workflowStore.resetToSeedData();
    expect(workflowStore.getAllWorkflows().find((workflow) => workflow.id === 'AIW-0008')?.status).toBe(
      'In review'
    );
    expect(workflowStore.updateWorkflowStatus('AIW-0008', 'Approved with conditions', '  ')).toBe(false);
  });

  it('falls back when stored JSON has the wrong schema', async () => {
    window.localStorage.setItem('ai_citizen_developer_registry_v1', JSON.stringify([{ id: 123 }]));
    const { WorkflowStore } = await import('../store/workflow_store.js');
    expect(new WorkflowStore().getAllWorkflows()).toHaveLength(24);
  });

  // =========================================================================
  // EXECUTIVE METRICS & FOOTNOTES TESTS
  // =========================================================================
  it('calculates executive coverage metrics with exact PRD requirements', () => {
    const metrics = workflowStore.getExecutiveMetrics();

    // 23 active records (1 is retired)
    expect(metrics.totalRegistered).toBe(23);
    // PRD Section 5.4 required estimated unregistered number
    expect(metrics.estimatedUnregistered).toBe(142);
    expect(metrics.overdueReviewsCount).toBeGreaterThanOrEqual(1);

    // LOB breakdown includes all 5 business units
    expect(metrics.lobBreakdown.length).toBe(5);
    const acimaStats = metrics.lobBreakdown.find((b) => b.lob === 'Acima');
    expect(acimaStats?.tier4).toBe(1); // Score applications default record

    // Literacy coverage targets 80% enterprise standard
    expect(metrics.literacyCoverage.every((l) => l.targetPercentage === 80)).toBe(true);
  });

  // =========================================================================
  // LOCALSTORAGE ERROR RESILIENCE & INIT COVERAGE
  // =========================================================================
  it('handles localStorage exceptions gracefully without breaking memory state', () => {
    const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    // Should not throw
    expect(() => workflowStore.resetToSeedData()).not.toThrow();

    setItemSpy.mockRestore();
  });

  it('restores stored workflows from localStorage when present upon instantiation', async () => {
    const mockRecord = {
      id: 'AIW-0099',
      title: 'Locally cached workflow',
      description: 'Test',
      owner_name: 'Tester',
      owner_role: 'Lead',
      lob: 'Acima' as const,
      department: 'QA',
      tools_used: ['Claude' as const],
      build_type: 'Custom script' as const,
      data_categories: ['Internal non-sensitive' as const],
      decision_influence: 'No decision — informational only' as const,
      output_audience: 'Just me' as const,
      data_leaves_tenant: false,
      human_review: 'Every output reviewed' as const,
      risk_tier: 'Tier 1 Low' as const,
      status: 'Approved' as const,
      registered_date: '2026-01-01',
      review_due: '2027-01-01',
      last_attested: '2026-01-01',
      builder_tier: 'Tier 1 Aware' as const,
      training_current: true,
    };

    window.localStorage.setItem('ai_citizen_developer_registry_v1', JSON.stringify([mockRecord]));
    // Dynamically import fresh store
    const { WorkflowStore } = await import('../store/workflow_store.js');
    const freshStore = new WorkflowStore();
    expect(freshStore.getAllWorkflows().length).toBe(1);
    expect(freshStore.getAllWorkflows()[0].id).toBe('AIW-0099');
  });

  it('falls back to seed data when localStorage contains corrupted non-JSON data', async () => {
    window.localStorage.setItem('ai_citizen_developer_registry_v1', '{corrupt json');
    const { WorkflowStore } = await import('../store/workflow_store.js');
    const fallbackStore = new WorkflowStore();
    expect(fallbackStore.getAllWorkflows().length).toBe(24);
  });

  it('handles irregular non-standard IDs when calculating next sequential ID', async () => {
    const irregularRecord = {
      id: 'CUSTOM_IRREGULAR_ID',
      title: 'Irregular ID record',
      description: 'Test',
      owner_name: 'Tester',
      owner_role: 'Lead',
      lob: 'Acima' as const,
      department: 'QA',
      tools_used: ['Claude' as const],
      build_type: 'Custom script' as const,
      data_categories: ['Internal non-sensitive' as const],
      decision_influence: 'No decision — informational only' as const,
      output_audience: 'Just me' as const,
      data_leaves_tenant: false,
      human_review: 'Every output reviewed' as const,
      risk_tier: 'Tier 1 Low' as const,
      status: 'Approved' as const,
      registered_date: '2026-01-01',
      review_due: '2027-01-01',
      last_attested: '2026-01-01',
      builder_tier: 'Tier 1 Aware' as const,
      training_current: true,
    };

    window.localStorage.setItem('ai_citizen_developer_registry_v1', JSON.stringify([irregularRecord]));
    const { WorkflowStore } = await import('../store/workflow_store.js');
    const storeWithIrregular = new WorkflowStore();
    const created = storeWithIrregular.addWorkflow({
      title: 'New after irregular',
      description: 'Test',
      owner_name: 'Tester',
      owner_role: 'Lead',
      lob: 'Acima',
      department: 'QA',
      tools_used: ['Claude'],
      build_type: 'Custom script',
      data_categories: ['Internal non-sensitive'],
      decision_influence: 'No decision — informational only',
      output_audience: 'Just me',
      data_leaves_tenant: false,
      human_review: 'Every output reviewed',
      builder_tier: 'Tier 1 Aware',
      training_current: true,
    });

    expect(created.id).toBe('AIW-0001');
  });
});
