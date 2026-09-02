// src/store/tool_request_store.ts
// Justification: Reactive state store for AI tool intake requests and safety analysis evaluations.

import { ToolRequest, ToolDecisionStatus, ToolSafetyAnalysis } from '../types/tool_request.js';
import { INITIAL_TOOL_REQUESTS } from '../data/mock_tool_requests.js';

type Listener = (requests: ToolRequest[]) => void;

class ToolRequestStore {
  private requests: ToolRequest[] = [];
  private listeners: Set<Listener> = new Set();
  private readonly storageKey = 'upbound_ai_tool_requests_v1';

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.requests = JSON.parse(stored);
        return;
      }
    }
    this.requests = [...INITIAL_TOOL_REQUESTS];
  }

  private save(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.requests));
    }
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((l) => l([...this.requests]));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener([...this.requests]);
    return () => this.listeners.delete(listener);
  }

  public getToolRequests(): ToolRequest[] {
    return [...this.requests];
  }

  public addToolRequest(
    newRequest: Omit<ToolRequest, 'id' | 'requestedDate' | 'status' | 'safetyAnalysis'>
  ): ToolRequest {
    const nextId = `TR-${1000 + this.requests.length + 1}`;
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
    return record;
  }

  public updateToolDecision(
    id: string,
    newStatus: ToolDecisionStatus,
    comments?: string
  ): void {
    this.requests = this.requests.map((req) => {
      if (req.id !== id) return req;
      return {
        ...req,
        status: newStatus,
        officialComments: comments || req.officialComments,
        safetyAnalysis: {
          ...req.safetyAnalysis,
          reviewedBy: 'AI Working Group / Program Lead',
          reviewedDate: new Date().toISOString().split('T')[0],
        },
      };
    });
    this.save();
  }

  public resetToDefault(): void {
    this.requests = [...INITIAL_TOOL_REQUESTS];
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.storageKey);
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
    const isEnterprise = model.includes('Enterprise');
    const touchesCredit = sensitivities.some((s) => s.toLowerCase().includes('credit') || s.toLowerCase().includes('underwriting'));
    const touchesPII = sensitivities.some((s) => s.toLowerCase().includes('pii') || s.toLowerCase().includes('financial'));

    if (isEnterprise) score += 15;
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
        { name: 'SOC 2 Type II', verified: isEnterprise, notes: isEnterprise ? 'Required for corporate approval' : 'Unverified on public consumer tier' },
        { name: 'ISO 27001', verified: isEnterprise, notes: 'Information security standard' },
        { name: 'GDPR / CCPA', verified: true, notes: 'Data privacy standard terms apply' },
      ],
      threatVectors: [
        {
          category: 'Data Egress & Isolation Boundary',
          severity: touchesPII || touchesCredit ? 'High' : 'Low',
          description: touchesPII
            ? 'Sensitive customer financial or PII data may route through external model inference without adequate tenant guarantees.'
            : 'Operational prompts processed through vendor API endpoints.',
          mitigation: isEnterprise
            ? 'Enforce Zero Data Retention agreement and enterprise SSO.'
            : 'Must upgrade to enterprise commercial tier before ingesting company records.',
        },
      ],
      trainsOnCustomerData: !isEnterprise,
      dataRetentionPolicy: isEnterprise
        ? 'Zero Data Retention under Enterprise DPA.'
        : 'Vendor may retain prompt interactions for platform quality review.',
      recommendedDecision:
        clampedScore >= 75
          ? 'Approved with Conditions'
          : clampedScore >= 50
          ? 'Under Review'
          : 'Declined',
      decisionReasoning: `Automated assessment calculated a safety score of ${clampedScore}/100. ${
        touchesCredit
          ? 'Warning: Touches underwriting/credit data which carries strict explainability and adverse action restrictions.'
          : isEnterprise
          ? 'Enterprise tenant protections offer viable risk isolation.'
          : 'Multi-tenant consumer cloud deployment poses data leakage concerns.'
      }`,
      mandatoryGuardrails: [
        'Adhere to Upbound Group AI Acceptable Use Policy.',
        touchesPII ? 'Customer PII and bank details strictly prohibited without Data Governance sign-off.' : 'Verify AI output before using in business decisions.',
      ],
    };
  }
}

export const toolRequestStore = new ToolRequestStore();
