// agents/definitions/qa_engineer.ts
// Justification: QA role handler records intent; verification results are written only by the supervisor.

import { AgentRole, ISubAgent, AgentTask, AgentExecutionContext } from '../types.js';
// Justification: Import core sub-agent contracts and interfaces.

export class QAEngineerAgent implements ISubAgent {
  // Justification: Role identifier for quality engineering.
  readonly role: AgentRole = 'qa_engineer';

  // Justification: Persona defining explicit scoped coverage gates and mutation testing.
  readonly systemPrompt: string = `
You are the Principal Quality & Reliability Engineer.
You enforce the repository's explicit, scoped test coverage gates:
1. Core Coverage: Lines, functions, and statements must reach 90%; branches must reach 85%.
2. Comprehensive Edge Cases: Test every rule cascade branch (Tier 4 credit default, Tier 3 customer financial + broad audience + leaves tenant, Tier 2 confidential + no human review, Tier 1 fallback).
3. Integration Test Suites: Test end-to-end user workflows (Registration -> State store -> Registry table filtering -> Program Lead approval -> Dashboard metrics).
4. Mutation Testing: Stryker mutator execution ensures test assertions actively catch subtle mutations.
5. Component & Accessibility Verification: Test screen reader attributes, keyboard navigation, and role-switching state isolation.
`;

  // Justification: QA responsibilities.
  readonly responsibilities: string[] = [
    'Author exhaustive unit test suites for risk derivation engine and state store',
    'Verify configured scoped coverage thresholds under Vitest v8',
    'Configure and run Stryker mutator to eliminate surviving mutants',
    'Validate end-to-end user journey across all three roles',
  ];

  // Justification: Executes QA verification pass.
  async execute(_task: AgentTask, context: AgentExecutionContext): Promise<void> {
    // Justification: Record QA telemetry in shared memory.
    context.sharedMemory.set('qa_metrics', {
      timestamp: new Date().toISOString(),
      targetCoverage: '90% lines/functions/statements; 85% branches',
      coverageScopes: ['lines', 'branches', 'functions', 'statements'],
      mutationHarness: 'Stryker JS',
      status: 'AWAITING_SUPERVISOR_VERIFICATION',
    });
  }
}
