// src/types/config.ts
// Justification: Strict TypeScript data contracts for UI configuration, theme state, and interactive overlay help.

export type ThemeMode = 'light' | 'dark' | 'system';
export type HelpDetailLevel = 'standard' | 'detailed';

export interface AppConfig {
  theme: ThemeMode;
  overlayHelpEnabled: boolean;
  overlayDetailLevel: HelpDetailLevel;
  animationsEnabled: boolean;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  aliases: string[];
  category:
    'Governance Tier' | 'Enterprise Structure' | 'Regulatory Standard' | 'Risk & Compliance' | 'Architecture';
  shortDefinition: string;
  detailedExplanation: string;
  upboundContext: string;
  governanceImplication: string;
  regulatoryReference?: string;
}
