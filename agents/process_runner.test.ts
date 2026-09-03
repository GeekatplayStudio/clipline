import { describe, expect, it } from 'vitest';
import { processRunnerInternals, runCommand } from './process_runner.js';

describe('cross-platform process runner', () => {
  it('uses Node to execute npm-cli.js on Windows instead of spawning npm.cmd directly', () => {
    const invocation = processRunnerInternals.npmInvocation(
      ['run', 'test'],
      'win32',
      'C:\\node\\node_modules\\npm\\bin\\npm-cli.js'
    );
    expect(invocation.command).toBe(process.execPath);
    expect(invocation.args.slice(1)).toEqual(['run', 'test']);
  });

  it('captures output and exit codes', async () => {
    const result = await runCommand(process.execPath, ['-e', 'process.stdout.write("ready")']);
    expect(result).toEqual({ exitCode: 0, stdout: 'ready', stderr: '' });
  });

  it('terminates commands that exceed their timeout', async () => {
    await expect(
      runCommand(process.execPath, ['-e', 'setTimeout(() => {}, 1000)'], { timeoutMs: 20 })
    ).rejects.toThrow(/timed out/);
  });
});
