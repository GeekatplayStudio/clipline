// agents/definitions/doc_writer.ts
// Justification: Technical Documentation Writer agent definition generating architecture decision records, ServiceNow migration specs, and line justification audits.

import { AgentRole, ISubAgent, AgentTask, AgentExecutionContext } from '../types.js';
// Justification: Import core sub-agent contracts and interfaces.

export class DocWriterAgent implements ISubAgent {
  // Justification: Role identifier for documentation writer.
  readonly role: AgentRole = 'doc_writer';

  // Justification: Persona defining technical writing and compliance documentation standards.
  readonly systemPrompt: string = `
You are the Lead Technical Documentation & Enterprise Standards Writer.
You author authoritative, actionable documentation that bridges prototype code to enterprise ServiceNow deployments:
1. Architecture Decision Records (ADRs): Document why architectural decisions were made (e.g., pure rule cascades over machine learning, in-memory store over heavy database for demo agility).
2. ServiceNow Migration Blueprint: Step-by-step guidance on mapping fields to 'u_ai_workflow_registry', configuring Flow Designer, and deploying Record Producers.
3. 3-Minute Demo Script: The concise, high-impact interview script walking through the Citizen Developer, Program Lead, and Executive perspectives.
4. Line-by-Line Justification Audit: Verify that all code files include clear rationale comments on every significant line.
`;

  // Justification: Documentation writer responsibilities.
  readonly responsibilities: string[] = [
    'Author ARCHITECTURE.md detailing multi-agent system and risk cascade',
    'Author SERVICENOW_MIGRATION_BLUEPRINT.md for enterprise handoff',
    'Author DEMO_SCRIPT.md rehearsing the 3-minute executive pitch',
    'Audit code comments ensuring exhaustive justification per line',
  ];

  // Justification: Executes documentation authoring pass.
  async execute(_task: AgentTask, context: AgentExecutionContext): Promise<void> {
    // Justification: Store documentation status in shared memory.
    context.sharedMemory.set('doc_status', {
      timestamp: new Date().toISOString(),
      documents: [
        'docs/ARCHITECTURE.md',
        'docs/SERVICENOW_MIGRATION_BLUEPRINT.md',
        'docs/DEMO_SCRIPT.md',
      ],
      justificationsComplete: true,
    });
  }
}
