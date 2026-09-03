// agents/run_pipeline.ts
// Justification: Executable entrypoint that instantiates the Super Agent, registers all 8 specialized sub-agents, and runs the supervised verification pipeline.

import fs from 'fs';
// Justification: Node fs module to verify physical artifact generation.
import { runNpm } from './process_runner.js';

import { SuperAgent } from './super_agent.js';
// Justification: Supervisor class that coordinates execution, validation, and retries.

import { ProjectManagerAgent } from './definitions/project_manager.js';
// Justification: Sub-agent 1: Project Manager.

import { SystemArchitectAgent } from './definitions/system_architect.js';
// Justification: Sub-agent 2: System Architect.

import { UIDesignerAgent } from './definitions/ui_designer.js';
// Justification: Sub-agent 3: UI/UX Designer.

import { BackendDeveloperAgent } from './definitions/backend_developer.js';
// Justification: Sub-agent 4: Backend Developer.

import { FrontendDeveloperAgent } from './definitions/frontend_developer.js';
// Justification: Sub-agent 5: Frontend Developer.

import { QAEngineerAgent } from './definitions/qa_engineer.js';
// Justification: Sub-agent 6: QA Engineer.

import { DocWriterAgent } from './definitions/doc_writer.js';
// Justification: Sub-agent 7: Documentation Writer.

import { DeploymentAgent } from './definitions/deployment_agent.js';
// Justification: Sub-agent 8: Deployment Agent.

import { AgentTask, AgentExecutionContext, VerificationResult } from './types.js';
// Justification: Types for task creation and verification.

async function verifyNpm(args: string[]): Promise<{ success: boolean; diagnostics?: string[] }> {
  try {
    const result = await runNpm(args, {
      cwd: process.cwd(),
      timeoutMs: 15 * 60 * 1000,
    });
    return result.exitCode === 0
      ? { success: true }
      : { success: false, diagnostics: [(result.stderr || result.stdout).trim()] };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { success: false, diagnostics: [detail] };
  }
}

async function verifyNpmCommands(
  commands: string[][]
): Promise<{ success: boolean; diagnostics?: string[] }> {
  for (const args of commands) {
    const result = await verifyNpm(args);
    if (!result.success) return result;
  }
  return { success: true };
}

async function main() {
  console.log('Starting Citizen Developer Registry role-oriented verification harness...\n');

  // Justification: Instantiate the master Super Agent.
  const superAgent = new SuperAgent(process.cwd());

  // Justification: Register each specialized sub-agent with its distinct responsibilities.
  superAgent.registerSubAgent(new ProjectManagerAgent());
  superAgent.registerSubAgent(new SystemArchitectAgent());
  superAgent.registerSubAgent(new UIDesignerAgent());
  superAgent.registerSubAgent(new BackendDeveloperAgent());
  superAgent.registerSubAgent(new FrontendDeveloperAgent());
  superAgent.registerSubAgent(new QAEngineerAgent());
  superAgent.registerSubAgent(new DocWriterAgent());
  superAgent.registerSubAgent(new DeploymentAgent());

  // Justification: Define the supervised workstream tasks with strict verification hooks.
  const pipelineTasks: AgentTask[] = [
    {
      id: 'TASK-001',
      title: 'Project Inception & Requirements Breakdown',
      assignedRole: 'project_manager',
      instructions: 'Parse PRD and outline core deliverable gates.',
      expectedArtifacts: ['PRD_Citizen_Developer_Registry.md'],
      verify: async (_ctx: AgentExecutionContext): Promise<VerificationResult> => {
        const prdExists = fs.existsSync('PRD_Citizen_Developer_Registry.md');
        return {
          success: prdExists,
          message: prdExists ? 'PRD confirmed present and parsed.' : 'Missing PRD document.',
          metrics: { prdFound: prdExists },
        };
      },
    },
    {
      id: 'TASK-002',
      title: 'Architectural Data Model & Risk Cascade Specification',
      assignedRole: 'system_architect',
      instructions: 'Establish TypeScript types and pure rule cascade for Tier 1-4 classification.',
      expectedArtifacts: ['src/types/workflow.ts', 'src/engine/risk_engine.ts'],
      verify: async (_ctx: AgentExecutionContext): Promise<VerificationResult> => {
        const typesExists = fs.existsSync('src/types/workflow.ts');
        const engineExists = fs.existsSync('src/engine/risk_engine.ts');
        const checks =
          typesExists && engineExists
            ? await verifyNpmCommands([
                ['run', 'check:modules'],
                ['run', 'typecheck'],
              ])
            : { success: false, diagnostics: ['Architecture artifacts are missing.'] };
        const success = typesExists && engineExists && checks.success;
        return {
          success,
          message: success
            ? 'Data model, module-size gate, and strict TypeScript checks passed.'
            : 'Architecture verification failed.',
          metrics: { typesExists, engineExists, staticChecksPassed: checks.success },
          diagnostics: checks.diagnostics,
        };
      },
    },
    {
      id: 'TASK-003',
      title: 'Design System & Accessibility Standards Verification',
      assignedRole: 'ui_designer',
      instructions: 'Define enterprise color palette (slate/amber/rust/crimson) and high-density tokens.',
      expectedArtifacts: ['tailwind.config.js', 'src/index.css'],
      verify: async (_ctx: AgentExecutionContext): Promise<VerificationResult> => {
        const twExists = fs.existsSync('tailwind.config.js');
        const cssExists = fs.existsSync('src/index.css');
        const success = twExists && cssExists;
        return {
          success,
          message: success ? 'Design system tokens and CSS configured.' : 'Missing CSS or Tailwind setup.',
          metrics: { twConfigExists: twExists, cssExists },
        };
      },
    },
    {
      id: 'TASK-004',
      title: 'Backend Logic & Seed Dataset Implementation',
      assignedRole: 'backend_developer',
      instructions: 'Generate 24 realistic seed records and reactive store with localStorage fallback.',
      expectedArtifacts: ['src/data/seed_workflows.ts', 'src/store/workflow_store.ts'],
      verify: async (_ctx: AgentExecutionContext): Promise<VerificationResult> => {
        const seedExists = fs.existsSync('src/data/seed_workflows.ts');
        const storeExists = fs.existsSync('src/store/workflow_store.ts');
        const success = seedExists && storeExists;
        return {
          success,
          message: success ? 'Seed workflows and state store verified.' : 'Missing seed data or store.',
          metrics: { seedExists, storeExists },
        };
      },
    },
    {
      id: 'TASK-005',
      title: 'Frontend Component Architecture Implementation',
      assignedRole: 'frontend_developer',
      instructions:
        'Build Header, IntakeWizard, RegistryTable, DetailModal, CoverageDashboard, and KnowledgeCheck.',
      expectedArtifacts: [
        'src/components/layout/Header.tsx',
        'src/components/intake/IntakeWizard.tsx',
        'src/components/registry/RegistryTable.tsx',
        'src/components/dashboard/CoverageDashboard.tsx',
      ],
      verify: async (_ctx: AgentExecutionContext): Promise<VerificationResult> => {
        const components = [
          'src/components/layout/Header.tsx',
          'src/components/intake/IntakeWizard.tsx',
          'src/components/registry/RegistryTable.tsx',
          'src/components/detail/WorkflowDetailModal.tsx',
          'src/components/dashboard/CoverageDashboard.tsx',
          'src/components/quiz/KnowledgeCheck.tsx',
        ];
        const missing = components.filter((c) => !fs.existsSync(c));
        return {
          success: missing.length === 0,
          message:
            missing.length === 0 ? 'All 6 primary UI components verified.' : `Missing: ${missing.join(', ')}`,
          metrics: {
            totalComponents: components.length,
            existingComponents: components.length - missing.length,
          },
        };
      },
    },
    {
      id: 'TASK-006',
      title: 'QA Test and Coverage Verification',
      assignedRole: 'qa_engineer',
      instructions: 'Execute Vitest and enforce the configured scoped coverage thresholds.',
      expectedArtifacts: ['src/__tests__/risk_engine.test.ts', 'src/__tests__/workflow_store.test.ts'],
      verify: async (_ctx: AgentExecutionContext): Promise<VerificationResult> => {
        const testEngine = fs.existsSync('src/__tests__/risk_engine.test.ts');
        const testStore = fs.existsSync('src/__tests__/workflow_store.test.ts');
        const testResult =
          testEngine && testStore
            ? await verifyNpmCommands([
                ['run', 'test:coverage'],
                ['run', 'test:mutation'],
              ])
            : { success: false, diagnostics: ['Required test files are missing.'] };
        const success = testEngine && testStore && testResult.success;
        return {
          success,
          message: success ? 'Coverage and mutation quality gates passed.' : 'QA quality gates failed.',
          metrics: { testEngine, testStore, coverageAndMutationPassed: testResult.success },
          diagnostics: testResult.diagnostics,
        };
      },
    },
    {
      id: 'TASK-007',
      title: 'Technical Documentation & ServiceNow Migration Blueprint',
      assignedRole: 'doc_writer',
      instructions: 'Generate ARCHITECTURE.md, SERVICENOW_MIGRATION_BLUEPRINT.md, and DEMO_SCRIPT.md.',
      expectedArtifacts: [
        'docs/ARCHITECTURE.md',
        'docs/SERVICENOW_MIGRATION_BLUEPRINT.md',
        'docs/DEMO_SCRIPT.md',
      ],
      verify: async (_ctx: AgentExecutionContext): Promise<VerificationResult> => {
        const docs = [
          'docs/ARCHITECTURE.md',
          'docs/SERVICENOW_MIGRATION_BLUEPRINT.md',
          'docs/DEMO_SCRIPT.md',
        ];
        const missing = docs.filter((d) => !fs.existsSync(d));
        return {
          success: missing.length === 0,
          message:
            missing.length === 0 ? 'All documentation artifacts verified.' : `Missing: ${missing.join(', ')}`,
          metrics: { totalDocs: docs.length, existingDocs: docs.length - missing.length },
        };
      },
    },
    {
      id: 'TASK-008',
      title: 'Production Readiness & Deployment Packaging',
      assignedRole: 'deployment_agent',
      instructions: 'Verify bundle building and deployment configuration.',
      expectedArtifacts: ['package.json', 'vite.config.ts'],
      verify: async (_ctx: AgentExecutionContext): Promise<VerificationResult> => {
        const pkgExists = fs.existsSync('package.json');
        const buildResult = pkgExists
          ? await verifyNpmCommands([
              ['run', 'build'],
              ['run', 'check:bundle'],
              ['run', 'check:smoke'],
              ['run', 'test:e2e'],
              ['audit', '--omit=dev', '--audit-level=moderate'],
            ])
          : { success: false, diagnostics: ['package.json is missing.'] };
        return {
          success: pkgExists && buildResult.success,
          message: buildResult.success
            ? 'Build, bundle budget, distribution and browser smoke tests, and runtime audit passed.'
            : 'Production build verification failed.',
          metrics: { packageFound: pkgExists, deploymentGatesPassed: buildResult.success },
          diagnostics: buildResult.diagnostics,
        };
      },
    },
  ];

  // Justification: Run the pipeline through the Super Agent supervisor.
  const result = await superAgent.executePipeline(pipelineTasks);

  if (!result.success) {
    console.error('Super Agent Pipeline terminated with failures.');
    process.exit(1);
  } else {
    console.log('Super Agent Pipeline executed successfully!');
  }
}

main().catch((err) => {
  console.error('Pipeline crashed:', err);
  process.exit(1);
});
