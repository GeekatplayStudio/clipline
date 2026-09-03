// agents/super_agent.ts
// Justification: Super Agent supervisor class that monitors sub-agents, validates step execution, and performs automated retries with exponential backoff.

import {
  AgentRole,
  ISubAgent,
  AgentTask,
  AgentExecutionContext,
  AgentExecutionRecord,
  RetryPolicy,
  VerificationResult,
} from './types.js';
import fs from 'fs';
import path from 'path';
// Justification: Imports type definitions and sub-agent contracts.

export class SuperAgent {
  // Justification: Internal registry of sub-agents indexed by role.
  private subAgents: Map<AgentRole, ISubAgent> = new Map();

  // Justification: Shared context holding execution logs and inter-agent memory.
  private context: AgentExecutionContext;

  // Justification: Default retry policy configuring max attempts and backoff factor.
  private defaultRetryPolicy: RetryPolicy = {
    maxAttempts: 3,
    initialDelayMs: 250,
    backoffFactor: 2,
  };

  // Justification: Constructor initializing execution context with workspace directory.
  constructor(workspaceRoot: string = process.cwd()) {
    this.context = {
      workspaceRoot,
      sharedMemory: new Map<string, unknown>(),
      executionLog: [],
    };
  }

  // Justification: Registers a specialized sub-agent into the supervision network.
  public registerSubAgent(agent: ISubAgent): void {
    if (this.subAgents.has(agent.role)) {
      throw new Error(`A handler is already registered for role: ${agent.role}`);
    }
    this.subAgents.set(agent.role, agent);
  }

  // Justification: Retrieves registered sub-agent by role.
  public getSubAgent(role: AgentRole): ISubAgent | undefined {
    return this.subAgents.get(role);
  }

  // Justification: Super Agent master execution loop coordinating a sequence of tasks with verification and retry loops.
  public async executePipeline(
    tasks: AgentTask[],
    retryPolicy: RetryPolicy = this.defaultRetryPolicy
  ): Promise<{ success: boolean; log: AgentExecutionRecord[] }> {
    this.validateRetryPolicy(retryPolicy);
    console.log(`\n======================================================`);
    console.log(`[VERIFICATION HARNESS] Initiating Role-Oriented Pipeline`);
    console.log(`[VERIFICATION HARNESS] Tasks: ${tasks.length} | Max Attempts: ${retryPolicy.maxAttempts}`);
    console.log(`======================================================\n`);

    for (const task of tasks) {
      const taskSuccess = await this.executeTaskWithRetry(task, retryPolicy);
      if (!taskSuccess) {
        console.error(
          `\n[SUPER AGENT CRITICAL] Pipeline halted: Task ${task.id} failed verification after retries.`
        );
        return { success: false, log: this.context.executionLog };
      }
    }

    console.log(`\n======================================================`);
    console.log(`[VERIFICATION HARNESS] All Tasks Completed and Verified Successfully`);
    console.log(`======================================================\n`);

    return { success: true, log: this.context.executionLog };
  }

  // Justification: Executes a single task under monitoring, retrying upon verification failure with backoff.
  private async executeTaskWithRetry(task: AgentTask, retryPolicy: RetryPolicy): Promise<boolean> {
    const subAgent = this.subAgents.get(task.assignedRole);
    if (!subAgent) {
      console.error(`[SUPER AGENT ERROR] No registered sub-agent for role: ${task.assignedRole}`);
      return false;
    }

    let attempt = 0;
    let delay = retryPolicy.initialDelayMs;

    while (attempt < retryPolicy.maxAttempts) {
      attempt++;
      const startedAt = new Date().toISOString();

      console.log(`\n------------------------------------------------------`);
      console.log(
        `[SUPER AGENT] Dispatching [${task.id}] -> [${task.assignedRole}] (Attempt ${attempt}/${retryPolicy.maxAttempts})`
      );
      console.log(`[SUPER AGENT] Objective: ${task.title}`);

      const record: AgentExecutionRecord = {
        taskId: task.id,
        role: task.assignedRole,
        attempt,
        startedAt,
        status: 'in_progress',
      };
      this.context.executionLog.push(record);

      try {
        // Justification: Delegate work to specialized sub-agent.
        await subAgent.execute(task, this.context);

        const missingArtifacts = task.expectedArtifacts.filter((artifact) => {
          const resolved = path.resolve(this.context.workspaceRoot, artifact);
          const relative = path.relative(this.context.workspaceRoot, resolved);
          return relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(resolved);
        });
        if (missingArtifacts.length > 0) {
          throw new Error(`Expected artifacts are missing: ${missingArtifacts.join(', ')}`);
        }

        // Justification: Super Agent runs verification hook to validate step correctness.
        console.log(`[SUPER AGENT] Running step verification for ${task.id}...`);
        const verification: VerificationResult = await task.verify(this.context);
        record.verification = verification;
        record.finishedAt = new Date().toISOString();

        if (verification.success) {
          record.status = 'completed';
          console.log(`[SUPER AGENT VERIFIED] Task ${task.id} PASSED: ${verification.message}`);
          if (verification.metrics) {
            console.log(`[SUPER AGENT METRICS]`, JSON.stringify(verification.metrics, null, 2));
          }
          return true;
        } else {
          record.status = 'verification_failed';
          console.warn(`[SUPER AGENT FAILED] Verification failed: ${verification.message}`);
          if (verification.diagnostics) {
            console.warn(`[SUPER AGENT DIAGNOSTICS]`, verification.diagnostics.join(', '));
          }

          if (attempt < retryPolicy.maxAttempts) {
            record.status = 'retrying';
            console.log(`[SUPER AGENT RETRY] Waiting ${delay}ms before retry attempt ${attempt + 1}...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= retryPolicy.backoffFactor;
          }
        }
      } catch (err: unknown) {
        record.finishedAt = new Date().toISOString();
        record.status = 'fatal_error';
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[SUPER AGENT EXCEPTION] Error during task execution: ${errorMessage}`);

        if (attempt < retryPolicy.maxAttempts) {
          console.log(`[SUPER AGENT RETRY] Retrying after uncaught error in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= retryPolicy.backoffFactor;
        }
      }
    }

    console.error(
      `[SUPER AGENT EXHAUSTED] Task ${task.id} exceeded maximum retry attempts (${retryPolicy.maxAttempts}).`
    );
    return false;
  }

  // Justification: Returns full execution context for analysis and reporting.
  public getContext(): AgentExecutionContext {
    return this.context;
  }

  private validateRetryPolicy(policy: RetryPolicy): void {
    if (!Number.isInteger(policy.maxAttempts) || policy.maxAttempts < 1) {
      throw new Error('Retry maxAttempts must be a positive integer.');
    }
    if (!Number.isFinite(policy.initialDelayMs) || policy.initialDelayMs < 0) {
      throw new Error('Retry initialDelayMs must be a non-negative finite number.');
    }
    if (!Number.isFinite(policy.backoffFactor) || policy.backoffFactor < 1) {
      throw new Error('Retry backoffFactor must be a finite number greater than or equal to 1.');
    }
  }
}
