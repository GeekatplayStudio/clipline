// src/types/readiness.ts
// Justification: Strict data contracts for enterprise certification readiness, regulatory frameworks, and milestone tracking.

export type FrameworkCategory = 'certifiable' | 'voluntary' | 'regulatory' | 'systems';

export type ReadinessStatus = 'critical_gap' | 'in_progress' | 'substantially_ready' | 'audit_ready';

export interface FrameworkMilestone {
  id: string;
  label: string;
  completed: boolean;
  clauseRef?: string;
  notes?: string;
}

export interface CertificationFramework {
  id: string;
  name: string;
  code: string;
  category: FrameworkCategory;
  categoryLabel: string;
  status: ReadinessStatus;
  progressPercentage: number; // 0 to 100
  targetDate: string;
  leadOwner: string;
  summary: string;
  whatItIs: string;
  whyItMatters: string;
  whatItTakes: string[];
  keyClausesOrFunctions: {
    ref: string;
    name: string;
    description: string;
    hook: string;
  }[];
  executiveLine: string;
  milestones: FrameworkMilestone[];
  auditArtifacts: string[];
}
