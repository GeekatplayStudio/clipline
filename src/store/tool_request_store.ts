// src/store/tool_request_store.ts
// Justification: Reactive state store for AI tool intake requests and safety analysis evaluations.

import { ToolRequest, ToolDecisionStatus, ToolSafetyAnalysis } from '../types/tool_request.js';
import { INITIAL_TOOL_REQUESTS } from '../data/mock_tool_requests.js';
import { isToolRequest, parseToolRequestEnvelope, ToolRequestEnvelopeV2 } from './tool_request_schema.js';

type Listener = (requests: ToolRequest[]) => void;

function cloneRequest(request: ToolRequest): ToolRequest {
  return {
    ...request,
    intendedDataSensitivity: [...request.intendedDataSensitivity],
    safetyAnalysis: {
      ...request.safetyAnalysis,
      whatItCanDo: [...request.safetyAnalysis.whatItCanDo],
      certifications: request.safetyAnalysis.certifications.map((certification) => ({ ...certification })),
      threatVectors: request.safetyAnalysis.threatVectors.map((threat) => ({ ...threat })),
      mandatoryGuardrails: [...request.safetyAnalysis.mandatoryGuardrails],
    },
  };
}

function cloneRequests(requests: readonly ToolRequest[]): ToolRequest[] {
  return requests.map(cloneRequest);
}

class ToolRequestStore {
  private requests: ToolRequest[] = [];
  private listeners: Set<Listener> = new Set();
  private readonly storageKey = 'upbound_ai_tool_requests_v2';
  private readonly legacyStorageKey = 'upbound_ai_tool_requests_v1';

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          const requests = parseToolRequestEnvelope(parsed);
          if (requests) {
            this.requests = cloneRequests(requests);
            return;
          }
        }
        const legacy = window.localStorage.getItem(this.legacyStorageKey);
        if (legacy) {
          const parsed: unknown = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.every(isToolRequest)) {
            this.requests = cloneRequests(parsed);
            this.persistEnvelope();
            window.localStorage.removeItem(this.legacyStorageKey);
            return;
          }
        }
      } catch {
        // Invalid, blocked, or outdated browser data must not prevent app loading.
      }
    }
    this.requests = cloneRequests(INITIAL_TOOL_REQUESTS);
  }

  private save(): void {
    if (typeof window !== 'undefined') {
      try {
        this.persistEnvelope();
      } catch {
        // Preserve the in-memory session if storage is unavailable or full.
      }
    }
    this.notify();
  }

  private persistEnvelope(): void {
    const envelope: ToolRequestEnvelopeV2 = { schemaVersion: 2, requests: this.requests };
    window.localStorage.setItem(this.storageKey, JSON.stringify(envelope));
  }

  private notify(): void {
    this.listeners.forEach((l) => l(cloneRequests(this.requests)));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(cloneRequests(this.requests));
    return () => this.listeners.delete(listener);
  }

  public getToolRequests(): ToolRequest[] {
    return cloneRequests(this.requests);
  }

  public addToolRequest(
    newRequest: Omit<ToolRequest, 'id' | 'requestedDate' | 'status' | 'safetyAnalysis'>
  ): ToolRequest {
    const maxId = this.requests.reduce((maximum, request) => {
      const match = /^TR-(\d+)$/.exec(request.id);
      return match ? Math.max(maximum, Number(match[1])) : maximum;
    }, 1000);
    const nextId = `TR-${maxId + 1}`;
    const today = new Date().toISOString().split('T')[0];

    // Auto-generate realistic AI Safety Analysis based on input parameters
    const safety = this.evaluateToolSafety(
      newRequest.toolName,
      newRequest.vendor,
      newRequest.dataHandlingModel,
      newRequest.intendedDataSensitivity
    );

    const record: ToolRequest = {
      ...newRequest,
      id: nextId,
      requestedDate: today,
      status: 'Under Review',
      safetyAnalysis: safety,
    };

    this.requests = [record, ...this.requests];
    this.save();
    return cloneRequest(record);
  }

  public updateToolDecision(id: string, newStatus: ToolDecisionStatus, comments?: string): boolean {
    if (!this.requests.some((request) => request.id === id)) return false;
    this.requests = this.requests.map((req) => {
      if (req.id !== id) return req;
      return {
        ...req,
        status: newStatus,
        officialComments: comments?.trim() || undefined,
        safetyAnalysis: {
          ...req.safetyAnalysis,
          reviewedBy: 'AI Working Group / Program Lead',
          reviewedDate: new Date().toISOString().split('T')[0],
        },
      };
    });
    this.save();
    return true;
  }

  public resetToDefault(): void {
    this.requests = cloneRequests(INITIAL_TOOL_REQUESTS);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(this.storageKey);
        window.localStorage.removeItem(this.legacyStorageKey);
      } catch {
        // Reset still succeeds in memory when browser storage is unavailable.
      }
    }
    this.save();
  }

  /**
   * Evaluates safety score and threat vectors automatically
   */
  private evaluateToolSafety(
    _toolName: string,
    vendor: string,
    model: string,
    sensitivities: string[]
  ): ToolSafetyAnalysis {
    let score = 75;
    const claimsEnterpriseControls = model.includes('Enterprise');
    const touchesCredit = sensitivities.some(
      (s) => s.toLowerCase().includes('credit') || s.toLowerCase().includes('underwriting')
    );
    const touchesPII = sensitivities.some(
      (s) => s.toLowerCase().includes('pii') || s.toLowerCase().includes('financial')
    );

    if (claimsEnterpriseControls) score += 15;
    else score -= 15;

    if (touchesCredit) score -= 40;
    if (touchesPII) score -= 20;

    const clampedScore = Math.max(15, Math.min(95, score));
    const riskLevel =
      clampedScore >= 80 ? 'Low' : clampedScore >= 65 ? 'Moderate' : clampedScore >= 40 ? 'High' : 'Critical';

    return {
      safetyScore: clampedScore,
      riskLevel,
      whatItCanDo: [
        `AI assistance capabilities provided by ${vendor}`,
        'Automated task completion and context processing',
        'Natural language generation and productivity acceleration',
      ],
      certifications: [
        { name: 'SOC 2 Type II', verified: false, notes: 'Unverified: obtain and review the vendor report.' },
        {
          name: 'ISO 27001',
          verified: false,
          notes: 'Unverified: obtain a current certificate and scope statement.',
        },
        { name: 'GDPR / CCPA', verified: false, notes: 'Unverified: legal and privacy review required.' },
      ],
      threatVectors: [
        {
          category: 'Data Egress & Isolation Boundary',
          severity: touchesPII || touchesCredit ? 'High' : 'Low',
          description: touchesPII
            ? 'Sensitive customer financial or PII data may route through external model inference without adequate tenant guarantees.'
            : 'Operational prompts processed through vendor API endpoints.',
          mitigation: claimsEnterpriseControls
            ? 'Verify Zero Data Retention contract terms and enforce enterprise SSO.'
            : 'Must upgrade to enterprise commercial tier before ingesting company records.',
        },
      ],
      trainsOnCustomerData: null,
      dataRetentionPolicy: claimsEnterpriseControls
        ? 'Requester claims enterprise controls; retention terms require evidence review.'
        : 'Unknown until vendor terms and the applicable service tier are reviewed.',
      recommendedDecision:
        clampedScore >= 75 ? 'Approved with Conditions' : clampedScore >= 50 ? 'Under Review' : 'Declined',
      decisionReasoning: `Automated assessment calculated a safety score of ${clampedScore}/100. ${
        touchesCredit
          ? 'Warning: Touches underwriting/credit data which carries strict explainability and adverse action restrictions.'
          : claimsEnterpriseControls
            ? 'Claimed enterprise protections reduce preliminary risk but require evidence verification.'
            : 'Multi-tenant consumer cloud deployment poses data leakage concerns.'
      }`,
      mandatoryGuardrails: [
        'Adhere to Upbound Group AI Acceptable Use Policy.',
        touchesPII
          ? 'Customer PII and bank details strictly prohibited without Data Governance sign-off.'
          : 'Verify AI output before using in business decisions.',
      ],
    };
  }
}

export const toolRequestStore = new ToolRequestStore();
