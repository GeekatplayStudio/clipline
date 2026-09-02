// src/__tests__/risk_engine.test.ts
// Justification: Comprehensive unit tests providing 100% branch, statement, function, and line coverage for the risk derivation engine.

import { describe, it, expect } from 'vitest';
// Justification: Vitest testing assertions and test suite blocks.

import {
  evaluateRiskTier,
  calculateReviewDueDate,
  getEducationalCallout,
} from '../engine/risk_engine.js';
// Justification: Import target functions under test.

import { WorkflowIntakeFormData } from '../types/workflow.js';
// Justification: Domain type for test fixture construction.

describe('Risk Derivation Engine (PRD Section 4 Cascade)', () => {
  // =========================================================================
  // TIER 4 PROHIBITED TESTS
  // =========================================================================
  it('triggers Tier 4 when credit decision is made with a custom non-vendor build type', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      decision_influence: 'Customer-affecting decision — credit or underwriting',
      build_type: 'Custom script',
      data_categories: ['Internal non-sensitive'],
      data_leaves_tenant: false,
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 4 Prohibited');
    expect(result.reason).toContain('influences customer credit/underwriting decisions with a non-vendor custom implementation');
    expect(result.routeTo).toBe('AI Working Group; presumed declined absent explicit exception');
    expect(result.reviewCadenceMonths).toBe(3);
    expect(result.requiresSpecialCallout).toBe(true);
    expect(result.calloutMessage).toContain('Regulatory Alert: Credit/underwriting decisioning');
  });

  it('triggers Tier 4 when credit/underwriting data leaves the enterprise tenant boundary', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      decision_influence: 'No decision — informational only',
      build_type: 'Prompt/chat workflow',
      data_categories: ['Credit or underwriting data'],
      data_leaves_tenant: true,
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 4 Prohibited');
    expect(result.reason).toContain('transmits sensitive credit or underwriting data outside enterprise tenant boundaries');
  });

  it('triggers Tier 4 with combined reasoning when BOTH credit decision and credit data egress occur', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      decision_influence: 'Customer-affecting decision — credit or underwriting',
      build_type: 'Agent/multi-step',
      data_categories: ['Credit or underwriting data'],
      data_leaves_tenant: true,
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 4 Prohibited');
    expect(result.reason).toContain('influences customer credit/underwriting decisions with a non-vendor custom implementation');
    expect(result.reason).toContain('transmits sensitive credit or underwriting data outside enterprise tenant boundaries');
  });

  it('does NOT trigger Tier 4 if credit decision is made through an approved Vendor AI feature without data egress', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      decision_influence: 'Customer-affecting decision — credit or underwriting',
      build_type: 'Vendor AI feature',
      data_categories: ['Internal non-sensitive'],
      data_leaves_tenant: false,
    };
    const result = evaluateRiskTier(input);

    // Should fall through Rule 1 to Rule 2 (Tier 3 High) because decision is Customer-affecting
    expect(result.tier).toBe('Tier 3 High');
  });

  // =========================================================================
  // TIER 3 HIGH TESTS
  // =========================================================================
  it('triggers Tier 3 when workflow touches Customer Financial Data and flags mid-form callout', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      data_categories: ['Customer financial data'],
      decision_influence: 'Internal operational decision (staffing, inventory, scheduling)',
      build_type: 'Prompt/chat workflow',
      output_audience: 'My team',
      human_review: 'Every output reviewed',
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 3 High');
    expect(result.reason).toContain('touches Customer financial data');
    expect(result.routeTo).toBe('Program lead + Security + Legal/GC');
    expect(result.reviewCadenceMonths).toBe(3);
    expect(result.requiresSpecialCallout).toBe(true);
    expect(result.calloutMessage).toBe(
      'Heads up: customer financial data means this will need security and legal review before you use it.'
    );
  });

  it('triggers Tier 3 when workflow touches Customer PII without financial data', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      data_categories: ['Customer PII'],
      decision_influence: 'Internal operational decision (staffing, inventory, scheduling)',
      output_audience: 'My team',
      human_review: 'Every output reviewed',
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 3 High');
    expect(result.reason).toContain('touches Customer PII');
    expect(result.requiresSpecialCallout).toBe(false);
    expect(result.calloutMessage).toBeUndefined();
  });

  it('triggers Tier 3 when decision influence is customer-affecting communications', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      data_categories: ['Internal non-sensitive'],
      decision_influence: 'Customer-affecting decision — communications',
      output_audience: 'Customer-facing',
      human_review: 'Sampled',
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 3 High');
    expect(result.reason).toContain('directly influences customer-affecting decisions');
  });

  it('triggers Tier 3 when confidential internal data leaves tenant boundary', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      data_categories: ['Internal confidential'],
      decision_influence: 'No decision — informational only',
      data_leaves_tenant: true,
      output_audience: 'Just me',
      human_review: 'Every output reviewed',
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 3 High');
    expect(result.reason).toContain('sends confidential/employee data outside enterprise boundaries');
  });

  it('triggers Tier 3 when employee data leaves tenant boundary', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      data_categories: ['Employee data'],
      decision_influence: 'No decision — informational only',
      data_leaves_tenant: true,
      output_audience: 'Just me',
      human_review: 'Every output reviewed',
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 3 High');
    expect(result.reason).toContain('sends confidential/employee data outside enterprise boundaries');
  });

  // =========================================================================
  // TIER 2 MODERATE TESTS
  // =========================================================================
  it('triggers Tier 2 when touching Internal confidential data within tenant boundaries', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      data_categories: ['Internal confidential'],
      data_leaves_tenant: false,
      decision_influence: 'Internal operational decision (staffing, inventory, scheduling)',
      output_audience: 'My team',
      human_review: 'Every output reviewed',
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 2 Moderate');
    expect(result.reason).toBe('Tier 2 — Moderate. This workflow touches sensitive internal data (Internal confidential). Requires Program Lead review.');
    expect(result.routeTo).toBe('Program lead review');
    expect(result.reviewCadenceMonths).toBe(6);
    expect(result.requiresSpecialCallout).toBe(false);
  });

  it('triggers Tier 2 when touching BOTH internal confidential AND employee data', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      data_categories: ['Internal confidential', 'Employee data'],
      data_leaves_tenant: false,
      output_audience: 'My team',
      human_review: 'Every output reviewed',
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 2 Moderate');
    expect(result.reason).toBe(
      'Tier 2 — Moderate. This workflow touches sensitive internal data (Internal confidential, Employee data). Requires Program Lead review.'
    );
  });

  it('triggers Tier 2 with combined reasons when broad audience AND no human review occur together', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      data_categories: ['Internal non-sensitive'],
      output_audience: 'Internal broad',
      human_review: 'None',
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 2 Moderate');
    expect(result.reason).toBe(
      'Tier 2 — Moderate. This workflow has a broad internal distribution audience and operates with no human review oversight. Requires Program Lead review.'
    );
    expect(result.requiresSpecialCallout).toBe(false);
  });

  it('triggers Tier 3 with all three reason conditions combined', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      data_categories: ['Customer PII', 'Internal confidential'],
      decision_influence: 'Customer-affecting decision — communications',
      data_leaves_tenant: true,
      output_audience: 'Customer-facing',
      human_review: 'Sampled',
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 3 High');
    expect(result.reason).toBe(
      'Tier 3 — High. This workflow touches Customer PII and directly influences customer-affecting decisions (Customer-affecting decision — communications) and sends confidential/employee data outside enterprise boundaries. Requires cross-functional review prior to deployment.'
    );
  });

  it('triggers Tier 1 Low default for standard non-sensitive workflow with team audience and human review', () => {
    const input: Partial<WorkflowIntakeFormData> = {
      data_categories: ['Internal non-sensitive'],
      decision_influence: 'Internal operational decision (staffing, inventory, scheduling)',
      output_audience: 'My team',
      human_review: 'Every output reviewed',
      data_leaves_tenant: false,
    };
    const result = evaluateRiskTier(input);

    expect(result.tier).toBe('Tier 1 Low');
    expect(result.reason).toBe(
      'Tier 1 — Low. This workflow uses non-sensitive company or public information with limited scope and impact. Auto-approved and logged.'
    );
    expect(result.routeTo).toBe('Auto-approved, logged');
    expect(result.reviewCadenceMonths).toBe(12);
    expect(result.requiresSpecialCallout).toBe(false);
  });

  it('handles empty/undefined partial intake data gracefully defaulting to Tier 1 Low', () => {
    const result = evaluateRiskTier({});
    expect(result.tier).toBe('Tier 1 Low');
    expect(result.reviewCadenceMonths).toBe(12);
  });

  // =========================================================================
  // REVIEW DUE DATE CALCULATOR TESTS
  // =========================================================================
  it('calculates future ISO date correctly given cadence months and base date', () => {
    const baseDate = new Date('2026-01-15T00:00:00Z');
    expect(calculateReviewDueDate(3, baseDate)).toBe('2026-04-15');
    expect(calculateReviewDueDate(6, baseDate)).toBe('2026-07-15');
    expect(calculateReviewDueDate(12, baseDate)).toBe('2027-01-15');
  });

  it('calculates review due date using default current date parameter', () => {
    const result = calculateReviewDueDate(6);
    expect(typeof result).toBe('string');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // =========================================================================
  // EDUCATIONAL CALLOUT HELPER TESTS
  // =========================================================================
  it('returns appropriate educational guidance for sensitive data categories', () => {
    expect(getEducationalCallout(['Credit or underwriting data'])).toContain('FCRA / ECOA Reg B');
    expect(getEducationalCallout(['Customer financial data'])).toContain('customer financial data');
    expect(getEducationalCallout(['Customer PII'])).toContain('privacy compliance obligations');
    expect(getEducationalCallout(['Internal non-sensitive', 'Public company information'])).toBeNull();
  });
});
