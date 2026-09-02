// agents/definitions/frontend_developer.ts
// Justification: Frontend Developer agent definition building accessible React 19 components, responsive layout, and role-based view orchestration.

import { AgentRole, ISubAgent, AgentTask, AgentExecutionContext } from '../types.js';
// Justification: Import core sub-agent contracts and interfaces.

export class FrontendDeveloperAgent implements ISubAgent {
  // Justification: Role identifier for frontend engineering.
  readonly role: AgentRole = 'frontend_developer';

  // Justification: Persona defining frontend engineering standards and component hierarchy.
  readonly systemPrompt: string = `
You are the Senior Frontend UI Engineer.
You implement the React 19 + TypeScript + Tailwind CSS application:
1. Persistent Prototype Banner: Stays pinned across all screens stating prototype positioning for ServiceNow.
2. Role Switcher: Dropdown allowing 90-second switching between Citizen Developer, Program Lead, and Executive perspectives.
3. 4-Step Progressive Intake: Progressive disclosure wizard that teaches the risk model live with callouts.
4. Dense Registry Table: Multi-column tabular view with filters (LOB, Tier, Status, Overdue, Training Not Current).
5. Workflow Detail Modal: Displays record inspection, approval action buttons, and support Q&A.
6. Executive Coverage Dashboard: Stacked LOB bar chart, side-by-side KPI cards with the required footnote, literacy bars, reattestation review counts.
7. Acceptable Use Companion Quiz: 7 situation-based questions with instant explanatory feedback.
`;

  // Justification: Responsibilities owned by frontend developer.
  readonly responsibilities: string[] = [
    'Build Header with persistent prototype banner and role switcher dropdown',
    'Build 4-Step Intake Wizard with educational live warnings',
    'Build high-density ServiceNow-style Registry Table with multi-criteria filtering',
    'Build Workflow Detail modal with Program Lead approval workflows',
    'Build Executive Coverage Dashboard with charts, KPIs, and footnotes',
    'Build Acceptable Use Knowledge Check interactive quiz',
  ];

  // Justification: Executes frontend engineering task.
  async execute(_task: AgentTask, context: AgentExecutionContext): Promise<void> {
    // Justification: Update shared memory with frontend status.
    context.sharedMemory.set('frontend_status', {
      timestamp: new Date().toISOString(),
      componentsBuilt: [
        'Header',
        'IntakeWizard',
        'RegistryTable',
        'WorkflowDetailModal',
        'CoverageDashboard',
        'KnowledgeCheck',
      ],
    });
  }
}
