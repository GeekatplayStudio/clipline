// src/__tests__/rich_ui_features.test.tsx
// Justification: Comprehensive tests covering 3D overlay telemetry, AnalyticsSuite, ConfigurableKPIs, ExportReportModal, and table sorting/search.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { workflowStore } from '../store/workflow_store';
import { NodeDetailOverlay, GraphNodeData, getTierNumber } from '../components/network3d/NodeDetailOverlay';
import { AnalyticsSuite } from '../components/analytics/AnalyticsSuite';
import { ConfigurableKPIs } from '../components/dashboard/ConfigurableKPIs';
import { ExportReportModal } from '../components/reports/ExportReportModal';
import { RegistryTable } from '../components/registry/RegistryTable';
import { Workflow } from '../types/workflow';

describe('Rich UI & 3D Visualization Suite', () => {
  let sampleWorkflows: Workflow[];

  beforeEach(() => {
    workflowStore.resetToSeedData();
    sampleWorkflows = workflowStore.getAllWorkflows();
  });

  // 1. NodeDetailOverlay
  describe('NodeDetailOverlay Component', () => {
    it('returns null when node or position is null', () => {
      const { container } = render(
        <NodeDetailOverlay node={null} position={null} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders employee node telemetry with manager, department, and risk badge', () => {
      const workflow = sampleWorkflows[0];
      const node: GraphNodeData = {
        id: `emp-${workflow.id}`,
        name: `${workflow.owner_name} (${workflow.owner_role})`,
        type: 'employee',
        lob: workflow.lob,
        department: workflow.department,
        manager: 'Sarah Jenkins (VP Operations)',
        workflow,
        riskTier: getTierNumber(workflow.risk_tier),
        overdue: false,
        trainingLapsed: false,
      };

      render(
        <NodeDetailOverlay
          node={node}
          position={{ x: 100, y: 100 }}
          onSelectWorkflow={vi.fn()}
        />
      );

      expect(screen.getByText('Citizen Developer')).toBeInTheDocument();
      expect(screen.getByText(node.name)).toBeInTheDocument();
      expect(screen.getByText(/Manager\/Lead: Sarah Jenkins/i)).toBeInTheDocument();
      expect(screen.getByText(workflow.title)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`Due: ${workflow.review_due}`, 'i'))).toBeInTheDocument();
    });

    it('renders tier 4 prohibited badge correctly for prohibited workflow', () => {
      const t4Workflow = sampleWorkflows.find((w) => w.risk_tier === 'Tier 4 Prohibited') || sampleWorkflows[0];
      const node: GraphNodeData = {
        id: `emp-${t4Workflow.id}`,
        name: t4Workflow.owner_name,
        type: 'employee',
        workflow: { ...t4Workflow, risk_tier: 'Tier 4 Prohibited' },
        riskTier: 4,
      };

      render(
        <NodeDetailOverlay
          node={node}
          position={{ x: 200, y: 200 }}
        />
      );

      expect(screen.getByText('Tier 4 Prohibited')).toBeInTheDocument();
    });

    it('triggers onSelectWorkflow when Inspect Full Dossier button is clicked', () => {
      const onSelect = vi.fn();
      const workflow = sampleWorkflows[0];
      const node: GraphNodeData = {
        id: `emp-${workflow.id}`,
        name: workflow.owner_name,
        type: 'employee',
        workflow,
        riskTier: 1,
      };

      render(
        <NodeDetailOverlay
          node={node}
          position={{ x: 150, y: 150 }}
          onSelectWorkflow={onSelect}
        />
      );

      const inspectBtn = screen.getByText(/Inspect in Registry/i);
      fireEvent.click(inspectBtn);
      expect(onSelect).toHaveBeenCalledWith(workflow);
    });
  });

  // 2. AnalyticsSuite
  describe('AnalyticsSuite Component', () => {
    it('renders risk tier distribution donut and shadow IT ratio bar', () => {
      render(<AnalyticsSuite workflows={sampleWorkflows} />);

      expect(screen.getByText('Risk Tier Distribution')).toBeInTheDocument();
      expect(screen.getByText('Tier 4 Prohibited')).toBeInTheDocument();
      expect(screen.getByText('Tier 3 High Risk')).toBeInTheDocument();
      expect(screen.getByText('Tier 2 Moderate')).toBeInTheDocument();
      expect(screen.getByText('Tier 1 Low Risk')).toBeInTheDocument();

      // Shadow IT comparison
      expect(screen.getByText('Enterprise Coverage Ratio & Shadow IT Gap')).toBeInTheDocument();
      expect(screen.getByText('~142')).toBeInTheDocument();
      expect(
        screen.getByText(
          /\*Estimated from tool license counts vs\. registrations\. In production this is the number leadership should actually care about\./i
        )
      ).toBeInTheDocument();
    });

    it('renders department risk heatmap matrix with interactive LOB and cell triggers', () => {
      const onFilterLOB = vi.fn();
      const onSelectWorkflow = vi.fn();

      render(
        <AnalyticsSuite
          workflows={sampleWorkflows}
          onFilterLOB={onFilterLOB}
          onSelectWorkflow={onSelectWorkflow}
        />
      );

      expect(screen.getByText(/Division.*Department Risk Density Heatmap/i)).toBeInTheDocument();
      expect(screen.getByText('Acima')).toBeInTheDocument();
      expect(screen.getByText('Rent-A-Center')).toBeInTheDocument();

      // Click Acima LOB filter button
      fireEvent.click(screen.getByText('Acima'));
      expect(onFilterLOB).toHaveBeenCalledWith('Acima');
    });
  });

  // 3. ConfigurableKPIs
  describe('ConfigurableKPIs Component', () => {
    it('renders configurable executive metric cards and allows toggling widgets', () => {
      render(<ConfigurableKPIs workflows={sampleWorkflows} />);

      expect(screen.getByText('Governed')).toBeInTheDocument();
      expect(screen.getByText('Prohibited')).toBeInTheDocument();

      // Open config tray
      const configBtn = screen.getByText('Configure Widgets');
      fireEvent.click(configBtn);

      expect(screen.getByText('Toggle Cards:')).toBeInTheDocument();
      expect(screen.getByText('Total Governed Registrations')).toBeInTheDocument();

      // Toggle off Tier 4 card
      const toggleButtons = screen.getAllByRole('button', { name: /Tier 4 Prohibited Alerts/i });
      fireEvent.click(toggleButtons[0]);

      // Click Reset Default
      const resetBtn = screen.getByText('Reset Default');
      fireEvent.click(resetBtn);
      expect(screen.getByText('Tier 4 Prohibited Alerts')).toBeInTheDocument();
    });

    it('calls filter callbacks when cards are clicked', () => {
      const onFilterTier = vi.fn();
      const onFilterStatus = vi.fn();

      render(
        <ConfigurableKPIs
          workflows={sampleWorkflows}
          onFilterTier={onFilterTier}
          onFilterStatus={onFilterStatus}
        />
      );

      // Click Prohibited Card
      fireEvent.click(screen.getByText('Prohibited'));
      expect(onFilterTier).toHaveBeenCalledWith(4);

      // Click High Risk Card
      fireEvent.click(screen.getByText('High Risk'));
      expect(onFilterTier).toHaveBeenCalledWith(3);
    });
  });

  // 4. ExportReportModal
  describe('ExportReportModal Component', () => {
    it('does not render when isOpen is false', () => {
      const { container } = render(
        <ExportReportModal isOpen={false} onClose={vi.fn()} workflows={sampleWorkflows} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal with summary and download triggers when isOpen is true', () => {
      const onClose = vi.fn();
      // Mock window.URL and window.print
      window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      window.print = vi.fn();

      render(
        <ExportReportModal isOpen={true} onClose={onClose} workflows={sampleWorkflows} />
      );

      expect(screen.getByText('Export Executive Governance Briefing')).toBeInTheDocument();
      expect(screen.getByText('Printable Executive PDF')).toBeInTheDocument();
      expect(screen.getByText('ServiceNow CSV')).toBeInTheDocument();
      expect(screen.getByText('Audit JSON Manifest')).toBeInTheDocument();

      // Click print
      fireEvent.click(screen.getByText('Printable Executive PDF'));
      expect(window.print).toHaveBeenCalled();

      // Click CSV
      fireEvent.click(screen.getByText('ServiceNow CSV'));
      expect(window.URL.createObjectURL).toHaveBeenCalled();

      // Click JSON
      fireEvent.click(screen.getByText('Audit JSON Manifest'));
      expect(window.URL.createObjectURL).toHaveBeenCalled();

      // Click Close
      fireEvent.click(screen.getByText('Close'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  // 5. RegistryTable Sorting & Search
  describe('RegistryTable Sorting & Search Component', () => {
    it('allows searching workflows dynamically', () => {
      render(
        <RegistryTable
          workflows={sampleWorkflows}
          filters={workflowStore.getFilters()}
          onFilterChange={vi.fn()}
          onResetFilters={vi.fn()}
          onSelectWorkflow={vi.fn()}
          currentRole="program_lead"
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search workflows, owners, LOBs.../i);
      fireEvent.change(searchInput, { target: { value: 'AIW-0001' } });

      expect(screen.getByText('AIW-0001')).toBeInTheDocument();
      expect(screen.queryByText('AIW-0002')).not.toBeInTheDocument();
    });

    it('allows sorting columns by clicking headers', () => {
      render(
        <RegistryTable
          workflows={sampleWorkflows}
          filters={workflowStore.getFilters()}
          onFilterChange={vi.fn()}
          onResetFilters={vi.fn()}
          onSelectWorkflow={vi.fn()}
          currentRole="program_lead"
        />
      );

      // Click Workflow Title header to sort
      const titleHeader = screen.getByText('Workflow Title');
      fireEvent.click(titleHeader);

      // Click ID header to sort
      const idHeader = screen.getByText('ID');
      fireEvent.click(idHeader);
      // Toggle ascending/descending
      fireEvent.click(idHeader);

      expect(screen.getByText('AIW-0001')).toBeInTheDocument();
    });
  });
});
