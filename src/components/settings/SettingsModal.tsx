// src/components/settings/SettingsModal.tsx
// Justification: Interactive settings drawer/modal providing theme selection, overlay help toggling, and accessibility configuration.

import React, { useState, useEffect } from 'react';
import { configStore } from '../../store/config_store.js';
import { AppConfig } from '../../types/config.js';
import {
  X,
  Settings,
  Sun,
  Moon,
  Laptop,
  HelpCircle,
  RotateCcw,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<AppConfig>(configStore.getConfig());

  useEffect(() => {
    const unsubscribe = configStore.subscribe(setConfig);
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl shadow-sm">
              <Settings className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Platform Configurations & Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Appearance, interactive overlay glossary, and accessibility controls
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* ========================================================================= */}
          {/* 1. THEME SELECTION */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Appearance & Color Theme</span>
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Current: <strong>{config.theme.toUpperCase()}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Light Mode */}
              <button
                type="button"
                onClick={() => configStore.setTheme('light')}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  config.theme === 'light'
                    ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-600 text-blue-900 dark:text-blue-200 shadow-sm font-bold ring-1 ring-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span>Light Mode</span>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => configStore.setTheme('dark')}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  config.theme === 'dark'
                    ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-600 text-blue-900 dark:text-blue-200 shadow-sm font-bold ring-1 ring-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                <span>Dark Mode</span>
              </button>

              {/* System Mode */}
              <button
                type="button"
                onClick={() => configStore.setTheme('system')}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  config.theme === 'system'
                    ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-600 text-blue-900 dark:text-blue-200 shadow-sm font-bold ring-1 ring-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Laptop className="w-5 h-5 text-slate-500" />
                <span>System Sync</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. INTERACTIVE OVERLAY HELP (USER REQUEST) */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Interactive Mouse-Over Overlay Help</span>
                  {config.overlayHelpEnabled && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  When enabled, hovering your mouse over any term, acronym, division name (e.g. <strong>LOB</strong>, <strong>Acima</strong>), or risk status (e.g. <strong>Governed</strong>, <strong>Tier 4 Prohibited</strong>) triggers a floating governance explanation HUD.
                </p>
              </div>

              {/* Big Switch Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={config.overlayHelpEnabled}
                onClick={() => configStore.setOverlayHelp(!config.overlayHelpEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.overlayHelpEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    config.overlayHelpEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Detail Level Selector (if enabled) */}
            {config.overlayHelpEnabled && (
              <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                  Overlay Explanation Depth:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => configStore.setOverlayDetailLevel('standard')}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      config.overlayDetailLevel === 'standard'
                        ? 'bg-white dark:bg-slate-800 border-blue-500 font-bold text-blue-900 dark:text-blue-200'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="block text-xs">Standard Overview</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Quick definitions and Upbound context
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => configStore.setOverlayDetailLevel('detailed')}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      config.overlayDetailLevel === 'detailed'
                        ? 'bg-white dark:bg-slate-800 border-blue-500 font-bold text-blue-900 dark:text-blue-200'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="block text-xs">Deep Executive Dossier</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Includes ISO/NIST/CFPB statutory citations
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Test Hover Sample Tags */}
            <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1.5">
                Hover Test Playground:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  data-help-id="lob"
                  className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-bold cursor-help hover:ring-1 hover:ring-blue-500"
                >
                  LOB (Line of Business)
                </span>
                <span
                  data-help-id="governed"
                  className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-bold cursor-help hover:ring-1 hover:ring-emerald-500"
                >
                  Governed
                </span>
                <span
                  data-help-id="tier4"
                  className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 font-bold cursor-help hover:ring-1 hover:ring-rose-500"
                >
                  Tier 4 Prohibited
                </span>
                <span
                  data-help-id="shadow_it"
                  className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-bold cursor-help hover:ring-1 hover:ring-amber-500"
                >
                  Shadow IT
                </span>
                <span
                  data-help-id="iso42001"
                  className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 font-bold cursor-help hover:ring-1 hover:ring-purple-500"
                >
                  ISO 42001
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. PERFORMANCE & ACCESSIBILITY */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              <span>Animations & Performance</span>
            </h4>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Smooth Micro-Animations
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enable animated chart sweeps and 3D web orbit damping
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={config.animationsEnabled}
                onClick={() => configStore.setAnimations(!config.animationsEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.animationsEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    config.animationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            type="button"
            onClick={() => configStore.resetToDefaults()}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
