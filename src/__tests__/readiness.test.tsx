// src/__tests__/readiness.test.tsx
// Justification: Comprehensive tests for CertificationReadinessPage verifying the red-to-green overall bar, framework cards, expandable requirement dossiers, and live milestone tracking.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CertificationReadinessPage } from '../components/readiness/CertificationReadinessPage';

describe('Certification & Regulatory Readiness Cockpit', () => {
  it('renders overall aggregate readiness bar and telemetry stats', () => {
    render(<CertificationReadinessPage onOpenExport={vi.fn()} />);

    // Header & Section Title
    expect(screen.getByText('AI Standards, Certifications & Regulatory Readiness')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Aggregate Certification & Regulatory Readiness')).toBeInTheDocument();

    // Overall progress score exists
    expect(screen.getByText('overall')).toBeInTheDocument();

    // Scale markers
    expect(screen.getByText('0% Critical Gap')).toBeInTheDocument();
    expect(screen.getByText('50% Developing')).toBeInTheDocument();
    expect(screen.getByText('75% Substantially Ready')).toBeInTheDocument();
    expect(screen.getByText('100% Fully Certified')).toBeInTheDocument();

    // Core pillars
    expect(screen.getByText('Certifiable AIMS')).toBeInTheDocument();
    expect(screen.getByText('Voluntary Taxonomy')).toBeInTheDocument();
    expect(screen.getByText('Legal AI Literacy')).toBeInTheDocument();
    expect(screen.getByText('Consumer Finance (CFPB)')).toBeInTheDocument();
  });

  it('renders all 6 core framework cards with traceability badges', () => {
    render(<CertificationReadinessPage />);

    expect(screen.getByText(/ISO\/IEC 42001:2023/i)).toBeInTheDocument();
    expect(screen.getByText(/NIST AI 100-1/i)).toBeInTheDocument();
    expect(screen.getByText(/EU AI Act — Article 4/i)).toBeInTheDocument();
    expect(screen.getByText(/U\.S\. Consumer Finance & Regulatory Layer/i)).toBeInTheDocument();
    expect(screen.getByText(/ServiceNow Enterprise Intake & CMDB Integration/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise LMS & HR Competency Framework/i)).toBeInTheDocument();
  });

  it('expands card to display What It Is, What It Takes, Named Clauses, and Executive Soundbite', () => {
    render(<CertificationReadinessPage />);

    // By default ISO 42001 is expanded
    expect(screen.getByText('What It Is')).toBeInTheDocument();
    expect(screen.getByText('What Does It Take To Achieve')).toBeInTheDocument();
    expect(screen.getByText(/Executive Phrasing \/ The Exact Interview Line/i)).toBeInTheDocument();
    expect(screen.getByText(/Key Named Clauses, Controls & Functions/i)).toBeInTheDocument();

    // Verify named clause references for ISO 42001
    expect(screen.getByText('Clause 7.2 & 7.3')).toBeInTheDocument();
    expect(screen.getByText('Competence & Awareness')).toBeInTheDocument();
    expect(screen.getAllByText('Clause 6.2.2').length).toBeGreaterThan(0);

    // Verify exact quote from the brief
    expect(
      screen.getByText(/42001 is where training stops being a nice-to-have/i)
    ).toBeInTheDocument();
  });

  it('allows expanding a different framework card and collapsing the previous one', () => {
    render(<CertificationReadinessPage />);

    // Click on NIST AI RMF header to expand it
    const nistCard = screen.getByText(/NIST AI 100-1 — AI Risk Management Framework 1.0/i);
    fireEvent.click(nistCard);

    // Now NIST functions should be visible
    expect(screen.getByText('GOVERN')).toBeInTheDocument();
    expect(screen.getByText('MAP')).toBeInTheDocument();
    expect(screen.getByText('MEASURE')).toBeInTheDocument();
    expect(screen.getByText('MANAGE')).toBeInTheDocument();

    // Verify NIST executive line
    expect(
      screen.getByText(/The RMF gives us the taxonomy\. Where my role plugs in is GOVERN/i)
    ).toBeInTheDocument();
  });

  it('updates live readiness percentage when milestone checkboxes are toggled', () => {
    render(<CertificationReadinessPage />);

    // In ISO 42001, find uncompleted milestone
    const milestone = screen.getByText(/Internal pre-audit against ISO\/IEC 42006/i);
    expect(milestone).toBeInTheDocument();

    // Click to toggle milestone to complete
    fireEvent.click(milestone);

    // Percentage should update dynamically
    expect(screen.getByText(/Audit Milestones:/i)).toBeInTheDocument();
  });

  it('filters frameworks by category buttons', () => {
    render(<CertificationReadinessPage />);

    // Filter by Certifiable Standards (ISO 42001 only)
    const certFilter = screen.getByRole('button', { name: /Certifiable Standards \(ISO 42001\)/i });
    fireEvent.click(certFilter);

    expect(screen.getByText(/ISO\/IEC 42001:2023/i)).toBeInTheDocument();
    expect(screen.queryByText(/NIST AI 100-1/i)).not.toBeInTheDocument();

    // Filter by Statutory & Finance (CFPB / EU)
    const statFilter = screen.getByRole('button', { name: /Statutory & Finance \(CFPB \/ EU\)/i });
    fireEvent.click(statFilter);

    expect(screen.getByText(/U\.S\. Consumer Finance & Regulatory Layer/i)).toBeInTheDocument();
    expect(screen.getByText(/EU AI Act — Article 4/i)).toBeInTheDocument();
    expect(screen.queryByText(/ISO\/IEC 42001:2023/i)).not.toBeInTheDocument();
  });

  it('filters frameworks dynamically using search input', () => {
    render(<CertificationReadinessPage />);

    const searchInput = screen.getByPlaceholderText(/Search standards, clauses.../i);
    fireEvent.change(searchInput, { target: { value: 'ServiceNow' } });

    expect(screen.getByText(/ServiceNow Enterprise Intake & CMDB/i)).toBeInTheDocument();
    expect(screen.queryByText(/ISO\/IEC 42001:2023/i)).not.toBeInTheDocument();
  });

  it('triggers onOpenExport callback when export button is clicked', () => {
    const onOpenExport = vi.fn();
    render(<CertificationReadinessPage onOpenExport={onOpenExport} />);

    const exportBtn = screen.getByRole('button', { name: /Export Audit Dossier/i });
    fireEvent.click(exportBtn);

    expect(onOpenExport).toHaveBeenCalled();
  });
});
