import {
  DataHandlingModel,
  ToolCategory,
  ToolDecisionStatus,
  ToolRequest,
  ToolRiskLevel,
} from '../types/tool_request.js';
import { LOB } from '../types/workflow.js';

const TOOL_CATEGORIES: ReadonlySet<ToolCategory> = new Set([
  'Code & Development',
  'Content & Marketing',
  'Research & Search',
  'Meeting & Audio Transcription',
  'Data Analysis & BI',
  'Workflow Automation',
  'Voice & Synthetic Media',
]);
const LOBS: ReadonlySet<LOB> = new Set(['Acima', 'Rent-A-Center', 'Brigit', 'Mexico', 'Corporate']);
const DATA_MODELS: ReadonlySet<DataHandlingModel> = new Set([
  'Enterprise Tenant (Zero Retention)',
  'Vendor Cloud (Multi-Tenant)',
  'Public / Consumer Cloud',
  'Local Desktop / Self-Hosted',
]);
const DECISIONS: ReadonlySet<ToolDecisionStatus> = new Set([
  'Under Review',
  'Approved',
  'Approved with Conditions',
  'Declined',
  'Banned',
]);
const RISK_LEVELS: ReadonlySet<ToolRiskLevel> = new Set(['Low', 'Moderate', 'High', 'Critical']);
const THREAT_SEVERITIES = new Set(['Low', 'Medium', 'High', 'Critical']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function isCertification(value: unknown): boolean {
  return (
    isRecord(value) &&
    isNonEmptyString(value.name) &&
    typeof value.verified === 'boolean' &&
    isNonEmptyString(value.notes)
  );
}

function isThreatVector(value: unknown): boolean {
  return (
    isRecord(value) &&
    isNonEmptyString(value.category) &&
    typeof value.severity === 'string' &&
    THREAT_SEVERITIES.has(value.severity) &&
    isNonEmptyString(value.description) &&
    isNonEmptyString(value.mitigation)
  );
}

function isSafetyAnalysis(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.safetyScore === 'number' &&
    Number.isFinite(value.safetyScore) &&
    value.safetyScore >= 0 &&
    value.safetyScore <= 100 &&
    typeof value.riskLevel === 'string' &&
    RISK_LEVELS.has(value.riskLevel as ToolRiskLevel) &&
    isStringArray(value.whatItCanDo) &&
    Array.isArray(value.certifications) &&
    value.certifications.every(isCertification) &&
    Array.isArray(value.threatVectors) &&
    value.threatVectors.every(isThreatVector) &&
    (typeof value.trainsOnCustomerData === 'boolean' || value.trainsOnCustomerData === null) &&
    isNonEmptyString(value.dataRetentionPolicy) &&
    typeof value.recommendedDecision === 'string' &&
    DECISIONS.has(value.recommendedDecision as ToolDecisionStatus) &&
    isNonEmptyString(value.decisionReasoning) &&
    isStringArray(value.mandatoryGuardrails) &&
    (value.reviewedBy === undefined || isNonEmptyString(value.reviewedBy)) &&
    (value.reviewedDate === undefined || isIsoDate(value.reviewedDate))
  );
}

export function isToolRequest(value: unknown): value is ToolRequest {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.id) &&
    /^TR-\d+$/.test(value.id) &&
    isNonEmptyString(value.toolName) &&
    isNonEmptyString(value.vendor) &&
    typeof value.category === 'string' &&
    TOOL_CATEGORIES.has(value.category as ToolCategory) &&
    isNonEmptyString(value.requesterName) &&
    isNonEmptyString(value.requesterRole) &&
    typeof value.lob === 'string' &&
    LOBS.has(value.lob as LOB) &&
    isNonEmptyString(value.department) &&
    isNonEmptyString(value.intendedUseCase) &&
    typeof value.dataHandlingModel === 'string' &&
    DATA_MODELS.has(value.dataHandlingModel as DataHandlingModel) &&
    isStringArray(value.intendedDataSensitivity) &&
    isIsoDate(value.requestedDate) &&
    typeof value.status === 'string' &&
    DECISIONS.has(value.status as ToolDecisionStatus) &&
    isSafetyAnalysis(value.safetyAnalysis) &&
    (value.officialComments === undefined || isNonEmptyString(value.officialComments))
  );
}

export interface ToolRequestEnvelopeV2 {
  schemaVersion: 2;
  requests: ToolRequest[];
}

export function parseToolRequestEnvelope(value: unknown): ToolRequest[] | null {
  if (!isRecord(value) || value.schemaVersion !== 2 || !Array.isArray(value.requests)) return null;
  return value.requests.every(isToolRequest) ? value.requests : null;
}
