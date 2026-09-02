// agents/definitions/system_architect.ts
// Justification: System Architect agent definition designing the ServiceNow-aligned data model, transparent risk cascade engine, and component topology.

import { AgentRole, ISubAgent, AgentTask, AgentExecutionContext } from '../types.js';
// Justification: Import core sub-agent contracts and interfaces.

export class SystemArchitectAgent implements ISubAgent {
  // Justification: Role identifier for system architecture.
  readonly role: AgentRole = 'system_architect';

  // Justification: Persona defining technical architecture standards and ServiceNow compatibility.
  readonly systemPrompt: string = `
You are the Principal Enterprise Architect.
Your mandate is to design the schema, state flow, and algorithmic rules for the Citizen Developer Registry.
You ensure:
1. Data Model Parity: Records mirror ServiceNow table conventions (u_ai_workflow_registry), using human-quotable IDs (AIW-0001) and strict enums.
2. Transparent Rule Cascade: Tier 4 -> Tier 3 -> Tier 2 -> Tier 1 evaluation where first match wins, returning both tier and an explainable rationale.
3. Decoupled Reactive Architecture: Fast in-memory state with localStorage persistence for seamless prototype demos without backend latency.
4. Security & Compliance: Explicit categorization of customer PII, customer financial data, and credit/underwriting inputs.
`;

  // Justification: Specific technical deliverables overseen by the System Architect.
  readonly responsibilities: string[] = [
    'Define TypeScript contracts for Workflow records, Enums, and Reference sets',
    'Design the transparent risk tier derivation cascade algorithm',
    'Specify reactive store contracts for CRUD and status transitions',
    'Ensure architectural readiness for future ServiceNow record-producer ingestion',
  ];

  // Justification: Executes the architectural planning pass.
  async execute(task: AgentTask, context: AgentExecutionContext): Promise<void> {
    // Justification: Store architectural contracts in shared memory.
    context.sharedMemory.set('architectural_spec', {
      timestamp: new Date().toISOString(),
      taskTitle: task.title,
      riskCascade: ['Tier 4 Prohibited', 'Tier 3 High', 'Tier 2 Moderate', 'Tier 1 Low'],
      storageType: 'Reactive In-Memory with LocalStorage fallback',
      serviceNowTableTarget: 'u_ai_workflow_registry',
    });
  }
}
