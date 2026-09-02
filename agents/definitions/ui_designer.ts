// agents/definitions/ui_designer.ts
// Justification: UI/UX Designer agent definition applying human-factors research, enterprise scannability, and restrained color tiering.

import { AgentRole, ISubAgent, AgentTask, AgentExecutionContext } from '../types.js';
// Justification: Import core sub-agent contracts and interfaces.

export class UIDesignerAgent implements ISubAgent {
  // Justification: Role identifier for UI/UX design.
  readonly role: AgentRole = 'ui_designer';

  // Justification: Persona defining the visual and interaction standards per PRD Section 7.
  readonly systemPrompt: string = `
You are the Lead Enterprise Usability & Human-Factors Designer.
You reject generic consumer SaaS tropes (sparklines, rounded card grids, bright gradient hero sections).
Instead, you implement high-density, presentation-ready enterprise ergonomics:
1. Information Density: Governance professionals need to scan exceptions; use tight tabular rows and tabular numeral figures.
2. Restrained Palette: Muted severity scale (slate -> amber -> rust -> deep red) that avoids pure green so low-risk is never mistaken for 'safe'.
3. Educational Intake: The 4-step progressive disclosure wizard provides immediate educational feedback when high-risk options are clicked.
4. Executive Presentation: Dashboard renders high-contrast stacked bars and clear side-by-side KPI cards with required explanatory footnotes.
5. WCAG 2.1 AA Accessibility: High contrast ratios, accessible focus rings, and explicit keyboard accessibility.
`;

  // Justification: UI/UX responsibilities.
  readonly responsibilities: string[] = [
    'Define design tokens and Tailwind utility mappings for enterprise density',
    'Design the 4-step progressive disclosure wizard layout with mid-form warnings',
    'Design the dense ServiceNow-style table view with tabular numbers',
    'Design the Executive Coverage Dashboard and Companion Quiz layouts',
  ];

  // Justification: Executes UI designer specification.
  async execute(_task: AgentTask, context: AgentExecutionContext): Promise<void> {
    // Justification: Publish design specifications into shared agent memory.
    context.sharedMemory.set('ui_design_tokens', {
      timestamp: new Date().toISOString(),
      typography: 'Inter with JetBrains Mono for IDs',
      palette: {
        neutral: 'Slate 50 to 950',
        tier1: 'Muted Slate (#f1f5f9 / #334155)',
        tier2: 'Subdued Amber (#fef3c7 / #92400e)',
        tier3: 'Rust Orange (#ffedd5 / #9a3412)',
        tier4: 'Deep Crimson (#ffe4e6 / #9f1239)',
      },
      scannabilityPrinciple: 'Density over whitespace; tabular figures for alignment',
    });
  }
}
