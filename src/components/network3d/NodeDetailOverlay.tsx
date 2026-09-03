// src/components/network3d/NodeDetailOverlay.tsx
// Justification: Floating 3D HUD glassmorphic card presenting real-time telemetry of hovered organizational and citizen developer nodes.

import React from 'react';
import { LineOfBusiness, Workflow, RiskTier } from '../../types/workflow.js';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  User,
  Building2,
  Layers,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export function getTierNumber(tier: RiskTier): 1 | 2 | 3 | 4 {
  if (tier === 'Tier 4 Prohibited') return 4;
  if (tier === 'Tier 3 High') return 3;
  if (tier === 'Tier 2 Moderate') return 2;
  return 1;
}

export interface GraphNodeData {
  id: string;
  name: string;
  type: 'enterprise' | 'lob' | 'department' | 'employee';
  lob?: LineOfBusiness;
  department?: string;
  manager?: string;
  workflow?: Workflow;
  riskTier?: 1 | 2 | 3 | 4;
  overdue?: boolean;
  trainingLapsed?: boolean;
  workflowCount?: number;
  avgRisk?: number;
}

interface NodeDetailOverlayProps {
  node: GraphNodeData | null;
  position: { x: number; y: number } | null;
  onSelectWorkflow?: (workflow: Workflow) => void;
}

export const NodeDetailOverlay: React.FC<NodeDetailOverlayProps> = ({ node, position, onSelectWorkflow }) => {
  if (!node || !position) return null;

  // Determine risk badge styling
  const getBadge = () => {
    if (node.type === 'employee' && node.workflow) {
      const tierNum = getTierNumber(node.workflow.risk_tier);
      if (tierNum === 4 || node.overdue || node.trainingLapsed) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-600/50">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            {tierNum === 4 ? 'Tier 4 Prohibited' : node.overdue ? 'Review Overdue' : 'Training Lapsed'}
          </span>
        );
      }
      if (tierNum === 3) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-600/50">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Tier 3 High Risk
          </span>
        );
      }
      if (tierNum === 2) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-950/80 text-yellow-300 border border-yellow-600/50">
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            Tier 2 Moderate
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Tier 1 Governed
        </span>
      );
    }

    if (node.type === 'lob' || node.type === 'department') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-600">
          <Layers className="w-3 h-3" />
          {node.workflowCount ?? 0} Workflows Governed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-600/50">
        Enterprise Center of Excellence
      </span>
    );
  };

  // Adjust card placement to not overflow window boundary
  const cardWidth = 320;
  const left = Math.min(Math.max(16, position.x + 16), window.innerWidth - cardWidth - 24);
  const top = Math.min(Math.max(80, position.y - 40), window.innerHeight - 300);

  return (
    <div
      className="fixed z-50 pointer-events-auto transition-all duration-150 ease-out"
      style={{ left: `${left}px`, top: `${top}px`, width: `${cardWidth}px` }}
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-4 shadow-2xl border border-slate-700/80 ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              {node.type === 'employee'
                ? 'Citizen Developer'
                : node.type === 'department'
                  ? 'Department Hub'
                  : node.type === 'lob'
                    ? 'Business Division'
                    : 'Enterprise Hub'}
            </div>
            <h4 className="text-base font-bold text-white tracking-tight leading-tight">{node.name}</h4>
          </div>
          {getBadge()}
        </div>

        {/* Details based on node type */}
        {node.type === 'employee' && node.workflow && (
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {node.workflow.lob} &bull; {node.workflow.department}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Manager/Lead: {node.manager || 'LOB AI Program Sponsor'}</span>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-2.5 mt-2 border border-slate-700/60">
              <div className="font-semibold text-white mb-1 line-clamp-1">{node.workflow.title}</div>
              <p className="text-slate-400 line-clamp-2 text-[11px] leading-relaxed mb-2">
                {node.workflow.description}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-700/60 text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Due: {node.workflow.review_due}
                </span>
                <span
                  className={
                    node.workflow.training_current
                      ? 'text-emerald-400 font-medium'
                      : 'text-rose-400 font-medium'
                  }
                >
                  {node.workflow.training_current ? '✓ Training Active' : '⚠ Training Lapsed'}
                </span>
              </div>
            </div>

            {onSelectWorkflow && (
              <button
                type="button"
                onClick={() => onSelectWorkflow(node.workflow!)}
                className="w-full mt-2 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <span>Inspect in Registry</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {(node.type === 'lob' || node.type === 'department') && (
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Total Workflows:</span>
              <span className="font-bold text-white">{node.workflowCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Divisional Tier Exposure:</span>
              <span className="font-semibold text-amber-400">{(node.avgRisk ?? 1.5).toFixed(1)} / 4.0</span>
            </div>
            <p className="text-[11px] text-slate-400 italic pt-1">
              Click node in 3D canvas to isolate and filter this division's workflows.
            </p>
          </div>
        )}

        {node.type === 'enterprise' && (
          <div className="text-xs text-slate-300 space-y-1.5">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Upbound Group Enterprise AI Governance Core connecting all 5 operating divisions, departments,
              and citizen developers.
            </p>
            <div className="pt-1 text-[11px] text-blue-400 font-medium">
              Rotate, drag, and zoom to explore organizational compliance topology.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
