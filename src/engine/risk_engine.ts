// src/engine/risk_engine.ts
// Justification: Pure functional risk derivation engine implementing the exact rule cascade from PRD Section 4.

import {
  WorkflowIntakeFormData,
  RiskEvaluationResult,
  DataCategory,
  DecisionInfluence,
  BuildType,
} from '../types/workflow.js';
// Justification: Imports necessary types for intake data and evaluation results.

// Justification: Evaluates workflow attributes against a transparent top-to-bottom rule cascade.
export function evaluateRiskTier(data: Partial<WorkflowIntakeFormData>): RiskEvaluationResult {
  const categories: DataCategory[] = data.data_categories || [];
  // Justification: Normalize data categories array to avoid undefined lookups.

  const decision: DecisionInfluence | undefined = data.decision_influence;
  // Justification: Extract decision influence level.

  const buildType: BuildType | undefined = data.build_type;
  // Justification: Extract architectural build type.

  const leavesTenant: boolean = Boolean(data.data_leaves_tenant);
  // Justification: Coerce external tenant egress flag to boolean.

  const audience = data.output_audience;
  // Justification: Extract audience scope.

  const humanReview = data.human_review;
  // Justification: Extract human review frequency.

  // ==========================================
  // Rule 1: Evaluate Tier 4 — Prohibited pending review
  // ==========================================
  const isCreditDecision = decision === 'Customer-affecting decision — credit or underwriting';
  // Justification: Identifies credit or underwriting decision impact.

  const isNotVendorFeature = buildType !== 'Vendor AI feature';
  // Justification: Custom implementations carry significantly higher unvetted model risk than vetted enterprise vendor features.

  const touchesCreditData = categories.includes('Credit or underwriting data');
  // Justification: Checks presence of credit scores or underwriting inputs.

  if ((isCreditDecision && isNotVendorFeature) || (touchesCreditData && leavesTenant)) {
    // Justification: Tier 4 trigger condition per PRD Section 4.
    const reasons: string[] = [];
    if (isCreditDecision && isNotVendorFeature) {
      reasons.push('influences customer credit/underwriting decisions with a non-vendor custom implementation');
    }
    if (touchesCreditData && leavesTenant) {
      reasons.push('transmits sensitive credit or underwriting data outside enterprise tenant boundaries');
    }

    return {
      tier: 'Tier 4 Prohibited',
      reason: `Tier 4 — Prohibited pending review. This workflow ${reasons.join(' and ')}. Absent an explicit AI Working Group exception, this workflow is presumed declined.`,
      routeTo: 'AI Working Group; presumed declined absent explicit exception',
      reviewCadenceMonths: 3,
      requiresSpecialCallout: true,
      calloutMessage: 'Regulatory Alert: Credit/underwriting decisioning triggers adverse action explainability obligations under Reg B. Presumed declined.',
    };
  }

  // ==========================================
  // Rule 2: Evaluate Tier 3 — High
  // ==========================================
  const touchesHighRiskData =
    categories.includes('Customer PII') ||
    categories.includes('Customer financial data') ||
    categories.includes('Credit or underwriting data');
  // Justification: Sensitive consumer data requires stringent compliance controls.

  const isCustomerAffecting = typeof decision === 'string' && decision.startsWith('Customer-affecting');
  // Justification: Any customer-facing operational impact requires legal and security sign-off.

  const sensitiveDataLeaves =
    leavesTenant && (categories.includes('Internal confidential') || categories.includes('Employee data'));
  // Justification: Transmitting internal confidential or HR employee data externally elevates risk to High.

  if (touchesHighRiskData || isCustomerAffecting || sensitiveDataLeaves) {
    // Justification: Tier 3 trigger condition per PRD Section 4.
    const reasons: string[] = [];
    if (touchesHighRiskData) {
      const matchedData = categories.filter((c) =>
        ['Customer PII', 'Customer financial data', 'Credit or underwriting data'].includes(c)
      );
      reasons.push(`touches ${matchedData.join(' and ')}`);
    }
    if (isCustomerAffecting) {
      reasons.push(`directly influences customer-affecting decisions (${decision})`);
    }
    if (sensitiveDataLeaves) {
      reasons.push('sends confidential/employee data outside enterprise boundaries');
    }

    return {
      tier: 'Tier 3 High',
      reason: `Tier 3 — High. This workflow ${reasons.join(' and ')}. Requires cross-functional review prior to deployment.`,
      routeTo: 'Program lead + Security + Legal/GC',
      reviewCadenceMonths: 3,
      requiresSpecialCallout: categories.includes('Customer financial data'),
      calloutMessage: categories.includes('Customer financial data')
        ? 'Heads up: customer financial data means this will need security and legal review before you use it.'
        : undefined,
    };
  }

  // ==========================================
  // Rule 3: Evaluate Tier 2 — Moderate
  // ==========================================
  const touchesInternalSensitive =
    categories.includes('Internal confidential') || categories.includes('Employee data');
  // Justification: Internal confidential and HR data require departmental oversight.

  const isBroadAudience = audience === 'Internal broad';
  // Justification: Broad internal distribution multiplies error surface area.

  const hasNoHumanReview = humanReview === 'None';
  // Justification: Unmonitored automation elevates operational risk.

  if (touchesInternalSensitive || isBroadAudience || hasNoHumanReview) {
    // Justification: Tier 2 trigger condition per PRD Section 4.
    const reasons: string[] = [];
    if (touchesInternalSensitive) {
      const matched = categories.filter((c) =>
        ['Internal confidential', 'Employee data'].includes(c)
      );
      reasons.push(`touches sensitive internal data (${matched.join(', ')})`);
    }
    if (isBroadAudience) {
      reasons.push('has a broad internal distribution audience');
    }
    if (hasNoHumanReview) {
      reasons.push('operates with no human review oversight');
    }

    return {
      tier: 'Tier 2 Moderate',
      reason: `Tier 2 — Moderate. This workflow ${reasons.join(' and ')}. Requires Program Lead review.`,
      routeTo: 'Program lead review',
      reviewCadenceMonths: 6,
      requiresSpecialCallout: false,
    };
  }

  // ==========================================
  // Rule 4: Evaluate Tier 1 — Low (Default)
  // ==========================================
  // Justification: Default fallback for benign internal workflows without sensitive data or autonomous impact.
  return {
    tier: 'Tier 1 Low',
    reason: 'Tier 1 — Low. This workflow uses non-sensitive company or public information with limited scope and impact. Auto-approved and logged.',
    routeTo: 'Auto-approved, logged',
    reviewCadenceMonths: 12,
    requiresSpecialCallout: false,
  };
}

// Justification: Helper calculating next reattestation review due date based on derived tier cadence using UTC arithmetic.
export function calculateReviewDueDate(cadenceMonths: number, fromDate: Date = new Date()): string {
  const year = fromDate.getUTCFullYear();
  // Justification: Extract UTC year to prevent local timezone offsets.

  const month = fromDate.getUTCMonth();
  // Justification: Extract UTC month.

  const day = fromDate.getUTCDate();
  // Justification: Extract UTC day of month.

  const targetDate = new Date(Date.UTC(year, month + cadenceMonths, day));
  // Justification: Construct target date in UTC adding cadence months.

  return targetDate.toISOString().split('T')[0];
  // Justification: Return standardized ISO 8601 YYYY-MM-DD date string.
}

// Justification: Helper to check if a specific data category triggers the educational warning banner.
export function getEducationalCallout(categories: DataCategory[]): string | null {
  if (categories.includes('Credit or underwriting data')) {
    return 'Heads up: credit and underwriting data triggers strict regulatory compliance (FCRA / ECOA Reg B) and executive review.';
  }
  if (categories.includes('Customer financial data')) {
    return 'Heads up: customer financial data means this will need security and legal review before you use it.';
  }
  if (categories.includes('Customer PII')) {
    return 'Heads up: customer PII touches privacy compliance obligations and requires privacy impact verification.';
  }
  return null;
}
