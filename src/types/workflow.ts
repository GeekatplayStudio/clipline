// src/types/workflow.ts
// Justification: Strict TypeScript data contracts and domain types implementing PRD Section 4 data model.

// Justification: User roles for header switcher simulating different personas in demo walkthrough.
export type UserRole = 'citizen_developer' | 'program_lead' | 'executive';

// Justification: Lines of Business representing Upbound Group corporate divisions per PRD Section 4.
export type LineOfBusiness = 'Acima' | 'Rent-A-Center' | 'Brigit' | 'Mexico' | 'Corporate';

export type LOB = LineOfBusiness;

// Justification: Standardized tool ecosystem choices including native LLMs, automation platforms, and enterprise suites.
export type ToolName =
  | 'ChatGPT / OpenAI'
  | 'Claude'
  | 'Microsoft Copilot'
  | 'Google Gemini'
  | 'Power Automate'
  | 'Power BI Copilot'
  | 'Zapier'
  | 'n8n'
  | 'Salesforce Einstein'
  | 'ServiceNow Now Assist'
  | 'Custom API integration'
  | 'Other';

// Justification: Categorization of implementation architecture from simple prompt workflows to autonomous agents.
export type BuildType =
  | 'Prompt/chat workflow'
  | 'Automation (Power Automate, Zapier, n8n)'
  | 'Custom script'
  | 'Vendor AI feature'
  | 'Agent/multi-step';

// Justification: Ordered data sensitivity tiers driving the core automated risk classification rules.
export type DataCategory =
  | 'No company data'
  | 'Public company information'
  | 'Internal non-sensitive'
  | 'Internal confidential'
  | 'Employee data'
  | 'Customer PII'
  | 'Customer financial data'
  | 'Credit or underwriting data';

// Justification: Level of autonomous decision influence - critical in consumer finance and adverse action compliance.
export type DecisionInfluence =
  | 'No decision — informational only'
  | 'Internal operational decision (staffing, inventory, scheduling)'
  | 'Employee-affecting decision (hiring, evaluation, scheduling)'
  | 'Customer-affecting decision — communications'
  | 'Customer-affecting decision — service or account'
  | 'Customer-affecting decision — credit or underwriting';

// Justification: Exposure scope of generated content.
export type OutputAudience = 'Just me' | 'My team' | 'Internal broad' | 'Customer-facing';

// Justification: Degree of human oversight over generated outputs.
export type HumanReviewFrequency = 'Every output reviewed' | 'Sampled' | 'None';

// Justification: Derived risk tiers determined by algorithmic evaluation.
export type RiskTier = 'Tier 1 Low' | 'Tier 2 Moderate' | 'Tier 3 High' | 'Tier 4 Prohibited';

// Justification: Workflow lifecycle statuses managed through governance reviews.
export type WorkflowStatus =
  'Draft' | 'Submitted' | 'In review' | 'Approved' | 'Approved with conditions' | 'Declined' | 'Retired';

// Justification: AI Literacy tiers tracked per builder.
export type BuilderLiteracyTier = 'Tier 1 Aware' | 'Tier 2 Fluent' | 'Tier 3 Builder';

// Justification: Approval routing recipient according to derived risk tier.
export type ApprovalRoute =
  | 'Auto-approved, logged'
  | 'Program lead review'
  | 'Program lead + Security + Legal/GC'
  | 'AI Working Group; presumed declined absent explicit exception';

// Justification: Result object returned by the risk calculation engine.
export interface RiskEvaluationResult {
  // Justification: Derived risk tier.
  tier: RiskTier;
  // Justification: Clear plain-language explanation of why this tier was assigned.
  reason: string;
  // Justification: Recommended governance routing path.
  routeTo: ApprovalRoute;
  // Justification: Governance review cadence in months (12, 6, or 3 months).
  reviewCadenceMonths: number;
  // Justification: Warning flags indicating mid-form callouts should trigger.
  requiresSpecialCallout: boolean;
  // Justification: Specific text for the mid-form educational warning box.
  calloutMessage?: string;
}

// Justification: The primary Workflow record structure corresponding to ServiceNow 'u_ai_workflow_registry'.
export interface Workflow {
  // Justification: Human-quotable ID formatted as 'AIW-XXXX'.
  id: string;
  // Justification: Plain-language workflow title.
  title: string;
  // Justification: Narrative description of function in builder's words.
  description: string;
  // Justification: Full name of workflow creator/owner.
  owner_name: string;
  // Justification: Title/role of the owner.
  owner_role: string;
  // Justification: Line of Business unit.
  lob: LineOfBusiness;
  // Justification: Department within the LOB.
  department: string;
  // Justification: Set of AI models and tools utilized.
  tools_used: ToolName[];
  // Justification: Architectural construction style.
  build_type: BuildType;
  // Justification: Data categories consumed by the workflow.
  data_categories: DataCategory[];
  // Justification: Impact scope on decisions.
  decision_influence: DecisionInfluence;
  // Justification: Target audience for output.
  output_audience: OutputAudience;
  // Justification: Indicates if data transits outside enterprise tenant boundary.
  data_leaves_tenant: boolean;
  // Justification: Human-in-the-loop review level.
  human_review: HumanReviewFrequency;
  // Justification: Derived risk tier (Tier 1-4).
  risk_tier: RiskTier;
  // Justification: Explainable rationale generated by derivation engine.
  risk_reason?: string;
  // Justification: Lifecycle governance status.
  status: WorkflowStatus;
  // Justification: Conditions specified when approved with stipulations.
  conditions?: string;
  // Justification: Date workflow was initially entered (YYYY-MM-DD).
  registered_date: string;
  // Justification: Auto-calculated periodic reattestation deadline.
  review_due: string;
  // Justification: Date owner last confirmed workflow accuracy.
  last_attested: string;
  // Justification: Builder's measured AI literacy standard.
  builder_tier: BuilderLiteracyTier;
  // Justification: Flag indicating whether required training is up to date.
  training_current: boolean;
}

// Justification: Form data structure during multi-step intake wizard before ID and registration dates are assigned.
export type WorkflowIntakeFormData = Omit<
  Workflow,
  'id' | 'registered_date' | 'review_due' | 'last_attested' | 'status' | 'risk_tier' | 'risk_reason'
>;
