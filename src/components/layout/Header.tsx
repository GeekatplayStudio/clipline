// src/components/layout/Header.tsx
// Justification: Top navigation header with persistent prototype banner, role switcher dropdown, and view navigation.

import React from 'react';
// Justification: React namespace import for component typing.

import { UserRole } from '../../types/workflow.js';
// Justification: UserRole enum for role switcher state.

import { ShieldCheck, RotateCcw, UserCheck, BookOpen, Layers, PlusCircle, BarChart3 } from 'lucide-react';
// Justification: Lucide icons for clean enterprise visual cues.

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeView: 'registry' | 'register' | 'dashboard' | 'quiz';
  onViewChange: (view: 'registry' | 'register' | 'dashboard' | 'quiz') => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeView,
  onViewChange,
  onResetData,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      {/* Justification: PRD Section 1 & Section 7 Mandate: Visible persistent banner stating prototype status. */}
      <div className="bg-slate-800 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>
            <strong>Prototype</strong> — data model exploration. Production implementation would live in ServiceNow.
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-[11px] text-slate-400">
          <span>Target: Upbound Group AI Standards Lead</span>
          <span>Role Interview Artifact</span>
        </div>
      </div>

      {/* Justification: Main header bar with title, role switcher, and quick navigation tabs. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 text-white rounded-md flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              AI Workflow Registry
            </h1>
            <p className="text-xs text-slate-500">
              Enterprise Citizen Developer Governance & Risk Tiering
            </p>
          </div>
        </div>

        {/* Justification: PRD Section 3: Role Switcher in header allowing 90-second demo through all perspectives. */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-semibold text-slate-700 whitespace-nowrap">Viewing as:</span>
            <select
              id="role-switcher-select"
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="citizen_developer">Citizen developer</option>
              <option value="program_lead">Program lead</option>
              <option value="executive">Executive / LOB leader</option>
            </select>
          </div>

          <button
            onClick={onResetData}
            title="Reset to 24 baseline seed workflows"
            className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 bg-white px-2 py-1 rounded flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Seed</span>
          </button>
        </div>
      </div>

      {/* Justification: Navigation tabs allowing rapid switching between workflow registration, inventory, dashboard, and quiz. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex space-x-1 border-t border-slate-100 text-xs font-medium">
        <button
          onClick={() => onViewChange('registry')}
          className={`py-2 px-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeView === 'registry'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Registry Inventory</span>
        </button>

        <button
          onClick={() => onViewChange('register')}
          className={`py-2 px-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeView === 'register'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Register Workflow</span>
        </button>

        <button
          onClick={() => onViewChange('dashboard')}
          className={`py-2 px-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeView === 'dashboard'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Coverage Dashboard</span>
        </button>

        <button
          onClick={() => onViewChange('quiz')}
          className={`py-2 px-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeView === 'quiz'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Acceptable Use Check</span>
        </button>
      </div>
    </header>
  );
};
