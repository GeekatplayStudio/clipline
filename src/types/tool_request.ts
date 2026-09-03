// src/types/tool_request.ts
// Justification: Strict data contracts for AI Tool intake requests, vendor safety analysis, certification checks, and risk evaluations.

import { LOB } from './workflow.js';

export type ToolCategory =
  | 'Code & Development'
  | 'Content & Marketing'
  | 'Research & Search'
  | 'Meeting & Audio Transcription'
  | 'Data Analysis & BI'
  | 'Workflow Automation'
  | 'Voice & Synthetic Media';

export type ToolRiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type ToolDecisionStatus =
  'Under Review' | 'Approved' | 'Approved with Conditions' | 'Declined' | 'Banned';

export type DataHandlingModel =
  | 'Enterprise Tenant (Zero Retention)'
  | 'Vendor Cloud (Multi-Tenant)'
  | 'Public / Consumer Cloud'
  | 'Local Desktop / Self-Hosted';

export interface VendorComplianceCertification {
  name: string; // e.g. SOC 2 Type II, ISO 27001, ISO 42001, HIPAA, GDPR/CCPA
  verified: boolean;
  notes: string;
}

export interface ThreatVector {
  category: string; // e.g. Model Training, IP Infringement, Prompt Injection, Data Egress
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  mitigation: string;
}

export interface ToolSafetyAnalysis {
  safetyScore: number; // 0 to 100
  riskLevel: ToolRiskLevel;
  whatItCanDo: string[];
  certifications: VendorComplianceCertification[];
  threatVectors: ThreatVector[];
  // null means the vendor claim has not yet been verified from evidence.
  trainsOnCustomerData: boolean | null;
  dataRetentionPolicy: string;
  recommendedDecision: ToolDecisionStatus;
  decisionReasoning: string;
  mandatoryGuardrails: string[];
  reviewedBy?: string;
  reviewedDate?: string;
}

export interface ToolRequest {
  id: string; // e.g. TR-1001
  toolName: string;
  vendor: string;
  category: ToolCategory;
  requesterName: string;
  requesterRole: string;
  lob: LOB;
  department: string;
  intendedUseCase: string;
  dataHandlingModel: DataHandlingModel;
  intendedDataSensitivity: string[];
  requestedDate: string;
  status: ToolDecisionStatus;
  safetyAnalysis: ToolSafetyAnalysis;
  officialComments?: string;
}
