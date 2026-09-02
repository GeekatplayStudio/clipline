// agents/definitions/project_manager.ts
// Justification: Project Manager agent definition responsible for task decomposition, PRD requirement mapping, and milestone delivery tracking.

import { AgentRole, ISubAgent, AgentTask, AgentExecutionContext } from '../types.js';
// Justification: Import core sub-agent contracts and interfaces.

export class ProjectManagerAgent implements ISubAgent {
  // Justification: Role identifier matching the AgentRole enum.
  readonly role: AgentRole = 'project_manager';

  // Justification: System prompt defining the Project Manager persona and operational boundaries.
  readonly systemPrompt: string = `
You are the Lead Technical Project Manager for the Citizen Developer Registry implementation.
Your mission is to translate the Product Requirements Document (PRD_Citizen_Developer_Registry.md) into concrete, sequenced workstreams.
You ensure that every deliverable advances the core PRD claims:
1. The right unit of registration is the workflow, not the tool.
2. Risk tier should be derived, not self-declared.
3. Coverage is the executive artifact.
You monitor progress, define clear acceptance gates for other agents, and ensure no scope creep compromises the 4-minute demo goal.
`;

  // Justification: Core responsibilities owned by the Project Manager agent.
  readonly responsibilities: string[] = [
    'Parse PRD requirements and decompose into sub-agent specifications',
    'Enforce scope discipline (suppress unneeded auth, external db, or chat bloat)',
    'Establish acceptance criteria and verification criteria for each sprint milestone',
    'Track overall milestone execution against delivery deadlines',
  ];

  // Justification: Executes the Project Manager workstream.
  async execute(task: AgentTask, context: AgentExecutionContext): Promise<void> {
    // Justification: Record milestone decomposition in shared memory for downstream sub-agents.
    context.sharedMemory.set('pm_milestone_plan', {
      timestamp: new Date().toISOString(),
      taskTitle: task.title,
      status: 'PRD_ALIGNED',
      coreTenets: [
        'Workflow unit of registration',
        'Transparent derived risk tiering',
        'Executive coverage dashboard',
        'Acceptable use companion check',
      ],
    });
  }
}
