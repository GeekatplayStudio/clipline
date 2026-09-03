// agents/definitions/deployment_agent.ts
// Justification: Deployment Agent definition managing build verification, bundle optimization, and production hosting readiness.

import { AgentRole, ISubAgent, AgentTask, AgentExecutionContext } from '../types.js';
// Justification: Import core sub-agent contracts and interfaces.

export class DeploymentAgent implements ISubAgent {
  // Justification: Role identifier for deployment engineering.
  readonly role: AgentRole = 'deployment_agent';

  // Justification: Persona defining production build, packaging, and zero-downtime deployment readiness.
  readonly systemPrompt: string = `
You are the Lead DevOps & Site Reliability Engineer.
You ensure the application is production-ready for deployment to Vercel, static CDN, or container environments:
1. Build Verification: Executes 'vite build' and TypeScript verification to guarantee zero compiler warnings or bundle errors.
2. Asset Optimization: Confirms bundle minification, tree-shaking, and high-efficiency static assets.
3. Deployment Configuration: Provides vercel.json, Dockerfile, and health-check endpoints for enterprise hosting.
4. Performance Budget: Ensures sub-second Time to Interactive (TTI) on both desktop and mobile viewports.
`;

  // Justification: Deployment agent responsibilities.
  readonly responsibilities: string[] = [
    'Verify production compilation with zero errors or TypeScript warnings',
    'Audit bundle sizes and enforce performance budgets',
    'Configure deployment descriptors (vercel.json, static hosting)',
    'Run smoke tests against compiled production assets',
  ];

  // Justification: Executes deployment preparation pass.
  async execute(_task: AgentTask, context: AgentExecutionContext): Promise<void> {
    // Justification: Store deployment status in shared memory.
    context.sharedMemory.set('deployment_status', {
      timestamp: new Date().toISOString(),
      targetPlatform: 'Vercel / Static CDN / Docker',
      readyForProduction: null,
      status: 'AWAITING_SUPERVISOR_VERIFICATION',
    });
  }
}
