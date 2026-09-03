// src/store/workflow_store.ts
// Justification: Reactive state store managing workflow records, role state, governance transitions, and executive metrics with local persistence.

import {
  Workflow,
  WorkflowIntakeFormData,
  WorkflowStatus,
  UserRole,
  LineOfBusiness,
  RiskTier,
} from '../types/workflow.js';
// Justification: Import domain types.

import { SEED_WORKFLOWS } from '../data/seed_workflows.js';
// Justification: Import seed dataset.

import { evaluateRiskTier, calculateReviewDueDate } from '../engine/risk_engine.js';
// Justification: Import risk calculation engine.

export interface WorkflowFilters {
  // Justification: Filter criteria for dense table view.
  lob: LineOfBusiness | 'All';
  tier: RiskTier | 'All';
  status: WorkflowStatus | 'All';
  onlyOverdue: boolean;
  onlyTrainingNotCurrent: boolean;
}

export interface ExecutiveMetrics {
  // Justification: Aggregated metrics for Executive Coverage Dashboard.
  totalRegistered: number;
  estimatedUnregistered: number;
  overdueReviewsCount: number;
  lobBreakdown: Array<{
    lob: LineOfBusiness;
    tier1: number;
    tier2: number;
    tier3: number;
    tier4: number;
    total: number;
  }>;
  literacyCoverage: Array<{
    lob: LineOfBusiness;
    currentPercentage: number;
    targetPercentage: number;
  }>;
}

const STORAGE_KEY = 'ai_citizen_developer_registry_v1';
// Justification: LocalStorage key for client-side persistence across page refreshes.

type Listener = () => void;
// Justification: Observer listener signature for reactive store subscription.

const WORKFLOW_STATUSES: ReadonlySet<WorkflowStatus> = new Set([
  'Draft',
  'Submitted',
  'In review',
  'Approved',
  'Approved with conditions',
  'Declined',
  'Retired',
]);
const LINES_OF_BUSINESS: ReadonlySet<LineOfBusiness> = new Set([
  'Acima',
  'Rent-A-Center',
  'Brigit',
  'Mexico',
  'Corporate',
]);
const RISK_TIERS: ReadonlySet<RiskTier> = new Set([
  'Tier 1 Low',
  'Tier 2 Moderate',
  'Tier 3 High',
  'Tier 4 Prohibited',
]);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function cloneWorkflow(workflow: Workflow): Workflow {
  return {
    ...workflow,
    tools_used: [...workflow.tools_used],
    data_categories: [...workflow.data_categories],
  };
}

function cloneWorkflows(workflows: readonly Workflow[]): Workflow[] {
  return workflows.map(cloneWorkflow);
}

function isWorkflow(value: unknown): value is Workflow {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.owner_name === 'string' &&
    typeof candidate.owner_role === 'string' &&
    typeof candidate.lob === 'string' &&
    LINES_OF_BUSINESS.has(candidate.lob as LineOfBusiness) &&
    typeof candidate.department === 'string' &&
    Array.isArray(candidate.tools_used) &&
    candidate.tools_used.every((item) => typeof item === 'string') &&
    typeof candidate.build_type === 'string' &&
    Array.isArray(candidate.data_categories) &&
    candidate.data_categories.every((item) => typeof item === 'string') &&
    typeof candidate.decision_influence === 'string' &&
    typeof candidate.output_audience === 'string' &&
    typeof candidate.data_leaves_tenant === 'boolean' &&
    typeof candidate.human_review === 'string' &&
    typeof candidate.risk_tier === 'string' &&
    RISK_TIERS.has(candidate.risk_tier as RiskTier) &&
    typeof candidate.status === 'string' &&
    WORKFLOW_STATUSES.has(candidate.status as WorkflowStatus) &&
    typeof candidate.registered_date === 'string' &&
    ISO_DATE_PATTERN.test(candidate.registered_date) &&
    typeof candidate.review_due === 'string' &&
    ISO_DATE_PATTERN.test(candidate.review_due) &&
    typeof candidate.last_attested === 'string' &&
    ISO_DATE_PATTERN.test(candidate.last_attested) &&
    typeof candidate.builder_tier === 'string' &&
    typeof candidate.training_current === 'boolean'
  );
}

// Justification: Store class definition managing workflow state and persistence.
export class WorkflowStore {
  // Justification: Internal array of all workflow records.
  private workflows: Workflow[] = [];

  // Justification: Active simulated user role for the header switcher.
  private currentRole: UserRole = 'citizen_developer';

  // Justification: Active table filters.
  private filters: WorkflowFilters = {
    lob: 'All',
    tier: 'All',
    status: 'All',
    onlyOverdue: false,
    onlyTrainingNotCurrent: false,
  };

  // Justification: Set of registered subscriber callbacks.
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.init();
  }

  // Justification: Initializes store from localStorage or falls back to seed dataset.
  private init(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.every(isWorkflow)) {
            this.workflows = cloneWorkflows(parsed);
            return;
          }
        }
      } catch {
        // Storage may be blocked, corrupt, or unavailable. Seed data is safe.
      }
    }
    this.workflows = cloneWorkflows(SEED_WORKFLOWS);
  }

  // Justification: Persists current workflow list to localStorage.
  private persist(): void {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.workflows));
      } catch {
        // Justification: Catch quota errors silently in memory-constrained environments.
      }
    }
  }

  // Justification: Notifies all active subscribers that store state has updated.
  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  // Justification: Registers an observer callback and returns an unsubscription closure.
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Justification: Retrieves snapshot of all workflows.
  public getAllWorkflows(): Workflow[] {
    return cloneWorkflows(this.workflows);
  }

  // Justification: Gets active user role.
  public getCurrentRole(): UserRole {
    return this.currentRole;
  }

  // Justification: Switches active user role and notifies subscribers.
  public setCurrentRole(role: UserRole): void {
    this.currentRole = role;
    this.notify();
  }

  // Justification: Gets current filter settings.
  public getFilters(): WorkflowFilters {
    return { ...this.filters };
  }

  // Justification: Updates filter settings and notifies subscribers.
  public setFilters(updates: Partial<WorkflowFilters>): void {
    this.filters = { ...this.filters, ...updates };
    this.notify();
  }

  // Justification: Resets filters to default show-all state.
  public resetFilters(): void {
    this.filters = {
      lob: 'All',
      tier: 'All',
      status: 'All',
      onlyOverdue: false,
      onlyTrainingNotCurrent: false,
    };
    this.notify();
  }

  // Justification: Retrieves filtered workflows based on active filter state.
  public getFilteredWorkflows(): Workflow[] {
    const today = new Date().toISOString().split('T')[0];

    return this.workflows
      .filter((w) => {
        // Justification: Filter by Line of Business.
        if (this.filters.lob !== 'All' && w.lob !== this.filters.lob) {
          return false;
        }
        // Justification: Filter by Risk Tier.
        if (this.filters.tier !== 'All' && w.risk_tier !== this.filters.tier) {
          return false;
        }
        // Justification: Filter by Workflow Status.
        if (this.filters.status !== 'All' && w.status !== this.filters.status) {
          return false;
        }
        // Justification: Filter for overdue reattestation reviews.
        if (this.filters.onlyOverdue && w.review_due >= today) {
          return false;
        }
        // Justification: Filter for builder training not current.
        if (this.filters.onlyTrainingNotCurrent && w.training_current) {
          return false;
        }
        return true;
      })
      .map(cloneWorkflow);
  }

  // Justification: Generates the next sequential human-quotable ID (AIW-0025, AIW-0026...).
  private getNextId(): string {
    let maxNum = 0;
    for (const w of this.workflows) {
      const match = w.id.match(/AIW-(\d+)/);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextNum = maxNum + 1;
    return `AIW-${nextNum.toString().padStart(4, '0')}`;
  }

  // Justification: Adds a new workflow record created via the 4-step intake wizard.
  public addWorkflow(formData: WorkflowIntakeFormData): Workflow {
    const today = new Date().toISOString().split('T')[0];
    const riskEval = evaluateRiskTier(formData);
    const reviewDue = calculateReviewDueDate(riskEval.reviewCadenceMonths);

    // Justification: Tier 1 is auto-approved and logged per PRD; higher tiers require human governance.
    const initialStatus: WorkflowStatus = riskEval.tier === 'Tier 1 Low' ? 'Approved' : 'In review';

    const newRecord: Workflow = {
      ...formData,
      tools_used: [...formData.tools_used],
      data_categories: [...formData.data_categories],
      id: this.getNextId(),
      risk_tier: riskEval.tier,
      risk_reason: riskEval.reason,
      status: initialStatus,
      registered_date: today,
      review_due: reviewDue,
      last_attested: today,
    };

    this.workflows = [newRecord, ...this.workflows];
    this.persist();
    this.notify();
    return cloneWorkflow(newRecord);
  }

  // Justification: Updates workflow governance status (Approve, Approve with conditions, Decline).
  public updateWorkflowStatus(id: string, newStatus: WorkflowStatus, conditions?: string): boolean {
    const targetIndex = this.workflows.findIndex((w) => w.id === id);
    if (targetIndex < 0) return false;
    if (newStatus === 'Approved with conditions' && !conditions?.trim()) return false;

    const target = this.workflows[targetIndex];
    const updated: Workflow = {
      ...target,
      status: newStatus,
      conditions: newStatus === 'Approved with conditions' ? conditions?.trim() : undefined,
    };
    this.workflows = this.workflows.map((workflow, index) => (index === targetIndex ? updated : workflow));
    this.persist();
    this.notify();
    return true;
  }

  // Justification: Computes executive coverage dashboard metrics per PRD Section 5.4.
  public getExecutiveMetrics(): ExecutiveMetrics {
    const today = new Date().toISOString().split('T')[0];
    const lobs: LineOfBusiness[] = ['Acima', 'Rent-A-Center', 'Brigit', 'Mexico', 'Corporate'];

    const lobBreakdown = lobs.map((lob) => {
      const items = this.workflows.filter((w) => w.lob === lob && w.status !== 'Retired');
      const tier1 = items.filter((w) => w.risk_tier === 'Tier 1 Low').length;
      const tier2 = items.filter((w) => w.risk_tier === 'Tier 2 Moderate').length;
      const tier3 = items.filter((w) => w.risk_tier === 'Tier 3 High').length;
      const tier4 = items.filter((w) => w.risk_tier === 'Tier 4 Prohibited').length;
      return {
        lob,
        tier1,
        tier2,
        tier3,
        tier4,
        total: items.length,
      };
    });

    const activeWorkflows = this.workflows.filter((w) => w.status !== 'Retired');
    const overdueCount = activeWorkflows.filter((w) => w.review_due < today).length;

    // Justification: Realistic literacy percentages by LOB benchmarked against 80% enterprise standard.
    const literacyCoverage = [
      { lob: 'Rent-A-Center' as LineOfBusiness, currentPercentage: 84, targetPercentage: 80 },
      { lob: 'Acima' as LineOfBusiness, currentPercentage: 78, targetPercentage: 80 },
      { lob: 'Brigit' as LineOfBusiness, currentPercentage: 92, targetPercentage: 80 },
      { lob: 'Corporate' as LineOfBusiness, currentPercentage: 86, targetPercentage: 80 },
      { lob: 'Mexico' as LineOfBusiness, currentPercentage: 68, targetPercentage: 80 },
    ];

    return {
      totalRegistered: activeWorkflows.length,
      // Justification: Estimated unregistered placeholder per PRD Section 5.4.
      estimatedUnregistered: 142,
      overdueReviewsCount: overdueCount,
      lobBreakdown,
      literacyCoverage,
    };
  }

  // Justification: Resets state store back to clean 24-record seed dataset.
  public resetToSeedData(): void {
    this.workflows = cloneWorkflows(SEED_WORKFLOWS);
    this.persist();
    this.notify();
  }
}

// Justification: Export singleton instance.
export const workflowStore = new WorkflowStore();
