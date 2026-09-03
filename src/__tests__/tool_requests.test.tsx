// src/__tests__/tool_requests.test.tsx
// Justification: Comprehensive test suite for employee AI tool intake, store persistence, safety scoring, threat vectors, and review actions.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { toolRequestStore } from '../store/tool_request_store';
import { ToolRequestsPage } from '../components/tools/ToolRequestsPage';
import { ToolRequestModal } from '../components/tools/ToolRequestModal';
import { ToolAnalysisModal } from '../components/tools/ToolAnalysisModal';
import { INITIAL_TOOL_REQUESTS } from '../data/mock_tool_requests';

describe('AI Tool Intake, Safety Analysis & Certification Suite', () => {
  beforeEach(() => {
    toolRequestStore.resetToDefault();
  });

  describe('toolRequestStore', () => {
    it('initializes with 7 realistic mock tool requests', () => {
      const requests = toolRequestStore.getToolRequests();
      expect(requests.length).toBe(7);
      expect(requests.some((r) => r.toolName.includes('Cursor'))).toBe(true);
      expect(requests.some((r) => r.toolName.includes('Perplexity'))).toBe(true);
      expect(requests.some((r) => r.toolName.includes('Otter.ai'))).toBe(true);
      expect(requests.some((r) => r.toolName.includes('DeepSeek'))).toBe(true);
      expect(requests.some((r) => r.toolName.includes('ElevenLabs'))).toBe(true);
    });

    it('adds a new tool request and calculates safety score automatically', () => {
      const created = toolRequestStore.addToolRequest({
        toolName: 'Claude Code CLI',
        vendor: 'Anthropic PBC',
        category: 'Code & Development',
        requesterName: 'Devon Lee',
        requesterRole: 'Principal Architect',
        lob: 'Acima',
        department: 'Engineering',
        intendedUseCase: 'Automated code review and refactoring in enterprise terminal',
        dataHandlingModel: 'Enterprise Tenant (Zero Retention)',
        intendedDataSensitivity: ['Internal Non-Sensitive'],
      });

      expect(created.id).toMatch(/^TR-\d+$/);
      expect(created.status).toBe('Under Review');
      expect(created.safetyAnalysis.safetyScore).toBeGreaterThanOrEqual(70);
      expect(toolRequestStore.getToolRequests().length).toBe(8);
    });

    it('adds a high-risk tool touching credit data and flags as critical and declined', () => {
      const highRisk = toolRequestStore.addToolRequest({
        toolName: 'Open Web DeepScorer',
        vendor: 'Unknown Cloud',
        category: 'Data Analysis & BI',
        requesterName: 'Pat Chen',
        requesterRole: 'Underwriter',
        lob: 'Acima',
        department: 'Credit Risk',
        intendedUseCase: 'Automated default probability estimation',
        dataHandlingModel: 'Public / Consumer Cloud',
        intendedDataSensitivity: ['Credit or Underwriting Data'],
      });

      expect(highRisk.safetyAnalysis.riskLevel).toBe('Critical');
      expect(highRisk.safetyAnalysis.recommendedDecision).toBe('Declined');
      expect(highRisk.safetyAnalysis.decisionReasoning).toContain('Touches underwriting/credit data');
    });

    it('adds a moderate risk tool touching PII data', () => {
      const piiTool = toolRequestStore.addToolRequest({
        toolName: 'Customer Chat Synthesizer',
        vendor: 'ChatGen Cloud',
        category: 'Content & Marketing',
        requesterName: 'Robin Lee',
        requesterRole: 'Marketing Manager',
        lob: 'Rent-A-Center',
        department: 'Support',
        intendedUseCase: 'Drafting emails to customer leads',
        dataHandlingModel: 'Vendor Cloud (Multi-Tenant)',
        intendedDataSensitivity: ['Customer PII (Names, contact info, SSN)'],
      });

      expect(piiTool.safetyAnalysis.decisionReasoning).toContain('Multi-tenant consumer cloud deployment');
    });

    it('supports subscription lifecycle and unsubscription', () => {
      let callCount = 0;
      const unsubscribe = toolRequestStore.subscribe(() => {
        callCount++;
      });
      expect(callCount).toBe(1);

      // Trigger update
      toolRequestStore.updateToolDecision('TR-1002', 'Approved');
      expect(callCount).toBe(2);

      // Unsubscribe
      unsubscribe();
      toolRequestStore.updateToolDecision('TR-1002', 'Declined');
      expect(callCount).toBe(2); // no new call
    });

    it('handles updating decisions for non-existent ID gracefully', () => {
      toolRequestStore.updateToolDecision('NON-EXISTENT', 'Approved');
      expect(toolRequestStore.getToolRequests().length).toBe(7);
    });

    it('updates tool decision status and official comments', () => {
      toolRequestStore.updateToolDecision('TR-1003', 'Approved with Conditions', 'Special sandbox only');
      const updated = toolRequestStore.getToolRequests().find((r) => r.id === 'TR-1003');
      expect(updated?.status).toBe('Approved with Conditions');
      expect(updated?.officialComments).toBe('Special sandbox only');
    });

    it('loads initial data from localStorage if stored records exist', () => {
      localStorage.removeItem('upbound_ai_tool_requests_v2');
      localStorage.setItem('upbound_ai_tool_requests_v1', JSON.stringify([INITIAL_TOOL_REQUESTS[0]]));
      const StoreClass = toolRequestStore.constructor as new () => typeof toolRequestStore;
      const rehydrated = new StoreClass();
      expect(rehydrated.getToolRequests().length).toBe(1);
      localStorage.removeItem('upbound_ai_tool_requests_v1');
    });

    it('falls back safely from corrupt persistence and returns immutable snapshots', () => {
      localStorage.setItem('upbound_ai_tool_requests_v1', '{broken');
      const StoreClass = toolRequestStore.constructor as new () => typeof toolRequestStore;
      const rehydrated = new StoreClass();
      expect(rehydrated.getToolRequests()).toHaveLength(7);

      const snapshot = rehydrated.getToolRequests();
      snapshot[0].toolName = 'Caller mutation';
      expect(rehydrated.getToolRequests()[0].toolName).not.toBe('Caller mutation');
      expect(rehydrated.updateToolDecision('missing', 'Approved')).toBe(false);
    });

    it('rejects persisted records with invalid enums, dates, and nested safety values', () => {
      const malformed = {
        ...INITIAL_TOOL_REQUESTS[0],
        category: 'INVALID',
        lob: 'INVALID',
        dataHandlingModel: 'INVALID',
        requestedDate: 'not-a-date',
        safetyAnalysis: { ...INITIAL_TOOL_REQUESTS[0].safetyAnalysis, safetyScore: 101 },
      };
      localStorage.setItem(
        'upbound_ai_tool_requests_v2',
        JSON.stringify({ schemaVersion: 2, requests: [malformed] })
      );
      const StoreClass = toolRequestStore.constructor as new () => typeof toolRequestStore;
      expect(new StoreClass().getToolRequests()).toHaveLength(7);
      localStorage.removeItem('upbound_ai_tool_requests_v2');
    });

    it('does not present inferred vendor controls as verified evidence', () => {
      const created = toolRequestStore.addToolRequest({
        toolName: 'Claimed Enterprise Tool',
        vendor: 'Example Vendor',
        category: 'Research & Search',
        requesterName: 'Reviewer',
        requesterRole: 'Analyst',
        lob: 'Corporate',
        department: 'Risk',
        intendedUseCase: 'Research',
        dataHandlingModel: 'Enterprise Tenant (Zero Retention)',
        intendedDataSensitivity: ['Internal non-sensitive'],
      });
      expect(created.safetyAnalysis.certifications.every((item) => !item.verified)).toBe(true);
      expect(created.safetyAnalysis.trainsOnCustomerData).toBeNull();
      expect(created.safetyAnalysis.dataRetentionPolicy).toContain('require evidence');
    });
  });

  describe('ToolRequestsPage Component', () => {
    it('renders KPI stats, search input, and table records', () => {
      render(<ToolRequestsPage currentRole="executive" />);

      // Headers & KPIs
      expect(screen.getByText('AI Tool Intake, Safety Analysis & Certification Audit')).toBeInTheDocument();
      expect(screen.getByText('Total Evaluated')).toBeInTheDocument();
      expect(screen.getByText('Approved / Permitted')).toBeInTheDocument();
      expect(screen.getByText('Average Safety Score')).toBeInTheDocument();

      // Tool Records in Table
      expect(screen.getByText('Cursor IDE (Enterprise)')).toBeInTheDocument();
      expect(screen.getByText('Perplexity Enterprise Pro')).toBeInTheDocument();
      expect(screen.getByText('Otter.ai Business')).toBeInTheDocument();
    });

    it('filters requests by search input', () => {
      render(<ToolRequestsPage currentRole="program_lead" />);

      const searchInput = screen.getByPlaceholderText(/Search AI tools/i);
      fireEvent.change(searchInput, { target: { value: 'Perplexity' } });

      expect(screen.getByText('Perplexity Enterprise Pro')).toBeInTheDocument();
      expect(screen.queryByText('Otter.ai Business')).not.toBeInTheDocument();
    });

    it('opens and closes tool submission modal on button click', () => {
      render(<ToolRequestsPage currentRole="citizen_developer" />);

      const requestBtn = screen.getByRole('button', { name: /Request New AI Tool/i });
      fireEvent.click(requestBtn);

      expect(screen.getByText('Request New Enterprise AI Tool')).toBeInTheDocument();

      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      expect(screen.queryByText('Request New Enterprise AI Tool')).not.toBeInTheDocument();
    });

    it('opens deep analysis modal when clicking a row', () => {
      render(<ToolRequestsPage currentRole="program_lead" />);

      const cursorRow = screen.getByText('Cursor IDE (Enterprise)');
      fireEvent.click(cursorRow);

      expect(screen.getByText('Safety & Certification Score')).toBeInTheDocument();
      expect(screen.getByText('Vendor Compliance & Statutory Certifications')).toBeInTheDocument();
      expect(
        screen.getByText('Potential Dangers, Security Vulnerabilities & Risk Vectors')
      ).toBeInTheDocument();
    });
  });

  describe('ToolRequestModal Component', () => {
    it('submits a new tool request with live advisory validation', () => {
      const onSuccess = vi.fn();
      const onClose = vi.fn();

      render(<ToolRequestModal onSuccess={onSuccess} onClose={onClose} />);

      // Fill in form
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. Cursor IDE/i), {
        target: { value: 'Synthesia Studio' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. Anthropic, OpenAI/i), {
        target: { value: 'Synthesia Ltd' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Full Name/i), { target: { value: 'Jordan Smith' } });
      fireEvent.change(screen.getByPlaceholderText(/Describe specifically what task/i), {
        target: { value: 'Creating localized store training videos in Spanish and English.' },
      });

      // Select sensitive data to trigger advisory
      const creditOption = screen.getByText(/Customer financial data/i);
      fireEvent.click(creditOption);

      expect(screen.getByText(/Automated Pre-Intake Governance Advisory:/i)).toBeInTheDocument();

      // Submit
      const submitBtn = screen.getByRole('button', { name: /Submit for AI Governance Review/i });
      fireEvent.click(submitBtn);

      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('ToolAnalysisModal Component', () => {
    it('displays comprehensive certifications, threat vectors, and lead actions', () => {
      const sample = toolRequestStore.getToolRequests()[0]; // Cursor IDE
      const onUpdateDecision = vi.fn();
      const onClose = vi.fn();

      render(
        <ToolAnalysisModal
          toolRequest={sample}
          currentRole="program_lead"
          onClose={onClose}
          onUpdateDecision={onUpdateDecision}
        />
      );

      // Verifications
      expect(screen.getByText('SOC 2 Type II')).toBeInTheDocument();
      expect(screen.getByText('Prompt / Code Leakage')).toBeInTheDocument();
      expect(screen.getByText(/Enforce "Privacy Mode" enabled by default/i)).toBeInTheDocument();
      expect(screen.getByText('Safety & Certification Score')).toBeInTheDocument();

      // Lead Action buttons
      const approveBtn = screen.getByRole('button', { name: /Approve Tool/i });
      fireEvent.click(approveBtn);

      expect(onUpdateDecision).toHaveBeenCalledWith('TR-1001', 'Approved', expect.any(String));
    });
  });
});
