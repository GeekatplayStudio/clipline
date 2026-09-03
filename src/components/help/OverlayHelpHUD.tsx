// src/components/help/OverlayHelpHUD.tsx
// Justification: Interactive mouse-over help HUD providing rich governance dossiers and definitions across the application.

import React, { useState, useEffect } from 'react';
import { configStore } from '../../store/config_store.js';
import { AppConfig, GlossaryTerm } from '../../types/config.js';
import { HELP_GLOSSARY, findGlossaryTerm } from '../../data/help_glossary.js';
import { BookOpen, Sparkles, HelpCircle, X, ShieldAlert, Layers } from 'lucide-react';

export const OverlayHelpHUD: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(configStore.getConfig());
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(null);
  const [hudPosition, setHudPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const unsubscribe = configStore.subscribe(setConfig);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!config.overlayHelpEnabled) {
      setActiveTerm(null);
      return;
    }

    let currentMatchedElement: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      let matchedTerm: GlossaryTerm | null = null;
      let matchedElement: HTMLElement | null = null;

      // Traverse up to 3 parent levels to find matching term or data attributes
      let depth = 0;
      while (target && depth < 3) {
        // 1. Explicit data attributes
        const explicitId = target.getAttribute('data-help-id');
        if (explicitId) {
          const found = HELP_GLOSSARY.find((g) => g.id === explicitId);
          if (found) {
            matchedTerm = found;
            matchedElement = target;
            break;
          }
        }

        // 2. Search element text or label (avoid large blocks)
        const textContent = (target.innerText || target.textContent || '').trim();
        if (textContent.length > 0 && textContent.length < 80) {
          const found = findGlossaryTerm(textContent);
          if (found) {
            matchedTerm = found;
            matchedElement = target;
            break;
          }
        }

        // 3. Search element title or aria-label
        const ariaOrTitle = target.getAttribute('aria-label') || target.getAttribute('title');
        if (ariaOrTitle) {
          const found = findGlossaryTerm(ariaOrTitle);
          if (found) {
            matchedTerm = found;
            matchedElement = target;
            break;
          }
        }

        target = target.parentElement;
        depth++;
      }

      if (matchedTerm && matchedElement) {
        currentMatchedElement = matchedElement;
        setActiveTerm(matchedTerm);

        // Position HUD safely within viewport
        const padding = 20;
        const hudWidth = 360;
        const hudHeight = 240;

        let posX = e.clientX + 16;
        let posY = e.clientY + 16;

        if (posX + hudWidth > window.innerWidth - padding) {
          posX = e.clientX - hudWidth - 16;
        }
        if (posY + hudHeight > window.innerHeight - padding) {
          posY = e.clientY - hudHeight - 16;
        }

        setHudPosition({
          x: Math.max(padding, posX),
          y: Math.max(padding, posY),
        });
      } else {
        // User moved mouse onto background or non-matching element: dismiss HUD immediately
        currentMatchedElement = null;
        setActiveTerm(null);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      // If mouse left the window entirely
      if (!e.relatedTarget) {
        currentMatchedElement = null;
        setActiveTerm(null);
        return;
      }

      // If mouse moved out of the currently inspected element
      if (currentMatchedElement) {
        const nextTarget = e.relatedTarget as Node | null;
        if (!nextTarget || !currentMatchedElement.contains(nextTarget)) {
          currentMatchedElement = null;
          setActiveTerm(null);
        }
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [config.overlayHelpEnabled]);

  if (!config.overlayHelpEnabled) return null;

  return (
    <>
      {/* Persistent Floating Indicator Pill in Bottom-Right */}
      <div className="fixed bottom-4 right-4 z-40 bg-blue-600/90 hover:bg-blue-600 text-white px-3.5 py-2 rounded-full shadow-xl border border-blue-400/50 backdrop-blur-md flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>Overlay Help Active: Hover any element, label, or LOB tag</span>
        <button
          type="button"
          onClick={() => configStore.setOverlayHelp(false)}
          title="Turn off Overlay Help"
          className="ml-1 p-1 hover:bg-blue-700/80 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic Floating HUD Card near Cursor */}
      {activeTerm && (
        <div
          style={{ left: `${hudPosition.x}px`, top: `${hudPosition.y}px` }}
          className="fixed z-50 w-88 bg-white/95 dark:bg-slate-900/95 border border-blue-500/40 dark:border-blue-400/30 rounded-2xl shadow-2xl p-4 text-xs backdrop-blur-md pointer-events-none transition-all duration-75 animate-in zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2.5">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                {activeTerm.category}
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{activeTerm.term}</span>
              </h4>
            </div>
            <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">
                What is this?
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                {config.overlayDetailLevel === 'detailed'
                  ? activeTerm.detailedExplanation
                  : activeTerm.shortDefinition}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-500" />
                <span>Upbound Group Context:</span>
              </span>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-snug">
                {activeTerm.upboundContext}
              </p>
            </div>

            {config.overlayDetailLevel === 'detailed' && (
              <div className="p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                <span className="font-bold text-amber-900 dark:text-amber-300 block text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Governance Rule & Reference:</span>
                </span>
                <p className="text-amber-800 dark:text-amber-200 text-[11px] mt-0.5 leading-snug">
                  {activeTerm.governanceImplication}
                </p>
                {activeTerm.regulatoryReference && (
                  <span className="block mt-1 font-mono text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                    Ref: {activeTerm.regulatoryReference}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
