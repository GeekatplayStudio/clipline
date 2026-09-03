import { describe, expect, it, vi } from 'vitest';
import { SuperAgent } from './super_agent.js';
import { AgentTask, ISubAgent, RetryPolicy } from './types.js';

const noDelay: RetryPolicy = { maxAttempts: 3, initialDelayMs: 0, backoffFactor: 1 };

function handler(execute: ISubAgent['execute'] = async () => undefined): ISubAgent {
  return { role: 'qa_engineer', systemPrompt: 'test handler', responsibilities: [], execute };
}

function task(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'TEST-1',
    title: 'Test task',
    assignedRole: 'qa_engineer',
    instructions: 'verify',
    expectedArtifacts: [],
    verify: async () => ({ success: true, message: 'ok' }),
    ...overrides,
  };
}

describe('SuperAgent verification harness', () => {
  it('retries verification failures and records every attempt', async () => {
    const supervisor = new SuperAgent(process.cwd());
    const execute = vi.fn(async () => undefined);
    let checks = 0;
    supervisor.registerSubAgent(handler(execute));
    const result = await supervisor.executePipeline(
      [task({ verify: async () => ({ success: ++checks === 3, message: 'checked' }) })],
      noDelay
    );
    expect(result.success).toBe(true);
    expect(execute).toHaveBeenCalledTimes(3);
    expect(result.log.map((record) => record.status)).toEqual(['retrying', 'retrying', 'completed']);
    expect(result.log.every((record) => Boolean(record.finishedAt))).toBe(true);
  });

  it('retries exceptions and retains fatal error telemetry', async () => {
    const supervisor = new SuperAgent(process.cwd());
    supervisor.registerSubAgent(
      handler(async () => {
        throw new Error('boom');
      })
    );
    const result = await supervisor.executePipeline([task()], { ...noDelay, maxAttempts: 2 });
    expect(result.success).toBe(false);
    expect(result.log).toHaveLength(2);
    expect(result.log.every((record) => record.status === 'fatal_error')).toBe(true);
  });

  it('rejects duplicate handlers and invalid retry policies', async () => {
    const supervisor = new SuperAgent();
    supervisor.registerSubAgent(handler());
    expect(() => supervisor.registerSubAgent(handler())).toThrow(/already registered/);
    await expect(
      supervisor.executePipeline([], { maxAttempts: 0, initialDelayMs: 0, backoffFactor: 1 })
    ).rejects.toThrow(/maxAttempts/);
  });

  it('fails safely when a handler or declared artifact is missing', async () => {
    const missingHandler = await new SuperAgent().executePipeline([task()], noDelay);
    expect(missingHandler.success).toBe(false);

    const supervisor = new SuperAgent(process.cwd());
    supervisor.registerSubAgent(handler());
    const result = await supervisor.executePipeline(
      [task({ expectedArtifacts: ['definitely-not-present.test-artifact'] })],
      { ...noDelay, maxAttempts: 1 }
    );
    expect(result.success).toBe(false);
    expect(result.log[0].status).toBe('fatal_error');
  });
});
