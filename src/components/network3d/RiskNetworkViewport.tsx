import React, { RefObject } from 'react';
import { Workflow } from '../../types/workflow.js';
import { GraphNodeData, NodeDetailOverlay } from './NodeDetailOverlay.js';
import { Maximize2, Minimize2, RotateCw } from 'lucide-react';

interface RiskNetworkViewportProps {
  containerRef: RefObject<HTMLDivElement | null>;
  workflows: Workflow[];
  hoveredNode: GraphNodeData | null;
  hoverPos: { x: number; y: number } | null;
  autoRotate: boolean;
  isFullscreen: boolean;
  onSelectWorkflow?: (workflow: Workflow) => void;
  onToggleAutoRotate: () => void;
  onToggleFullscreen: () => void;
}

export const RiskNetworkViewport: React.FC<RiskNetworkViewportProps> = ({
  containerRef,
  workflows,
  hoveredNode,
  hoverPos,
  autoRotate,
  isFullscreen,
  onSelectWorkflow,
  onToggleAutoRotate,
  onToggleFullscreen,
}) => {
  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0a0f1d] transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[580px]'
      }`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        role="img"
        aria-label={`Interactive organizational risk topology containing ${workflows.length} workflows`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      <div className="sr-only" aria-label="Accessible workflow list">
        {workflows.map((workflow) => (
          <button key={workflow.id} type="button" onClick={() => onSelectWorkflow?.(workflow)}>
            {workflow.id}: {workflow.title}, {workflow.risk_tier}
          </button>
        ))}
      </div>

      {/* Floating HUD Tooltip */}
      <NodeDetailOverlay node={hoveredNode} position={hoverPos} onSelectWorkflow={onSelectWorkflow} />

      {/* Top Banner & Telemetry Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/80 shadow-lg pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold text-white tracking-tight">
              3D Enterprise Governance Topology
            </span>
          </div>
          <span className="text-slate-500 text-xs">|</span>
          <span className="text-xs text-slate-300 font-mono">
            {workflows.length} Nodes Governed Across 5 LOBs
          </span>
        </div>

        {/* Action Controls */}
        <div className="bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleAutoRotate()}
            title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              autoRotate ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Orbit</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleFullscreen()}
            title="Toggle Fullscreen"
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend & Navigation Guide */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-none">
        {/* Risk Color Legend */}
        <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/90 shadow-lg pointer-events-auto flex flex-wrap items-center gap-3.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            <span className="text-slate-300 font-medium">Critical / Prohibited (Red)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            <span className="text-slate-300 font-medium">Tier 3 High (Orange)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
            <span className="text-slate-300 font-medium">Tier 2 Moderate (Yellow)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="text-slate-300 font-medium">Tier 1 Governed (Green)</span>
          </div>
        </div>

        {/* Interaction Hint */}
        <div className="bg-slate-900/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono hidden md:block">
          🖱 Drag: Rotate 360° | 📜 Scroll: Zoom | 👆 Click Node: Inspect
        </div>
      </div>
    </div>
  );
};
