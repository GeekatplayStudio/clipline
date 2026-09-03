import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import path from 'path';

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface CommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
  platform?: NodeJS.Platform;
  npmExecPath?: string;
}

function npmInvocation(args: readonly string[], platform: NodeJS.Platform, npmExecPath?: string) {
  if (platform === 'win32' && npmExecPath && path.extname(npmExecPath).toLowerCase() === '.js') {
    return { command: process.execPath, args: [npmExecPath, ...args] };
  }
  return { command: platform === 'win32' ? 'npm.cmd' : 'npm', args: [...args] };
}

export function runCommand(
  command: string,
  args: readonly string[],
  options: CommandOptions = {}
): Promise<CommandResult> {
  const platform = options.platform ?? process.platform;
  const invocation =
    command === 'npm'
      ? npmInvocation(args, platform, options.npmExecPath ?? process.env.npm_execpath)
      : { command, args: [...args] };
  const spawnOptions: SpawnOptionsWithoutStdio = {
    cwd: options.cwd,
    env: options.env ?? process.env,
    windowsHide: true,
    shell: platform === 'win32' && invocation.command.toLowerCase().endsWith('.cmd'),
  };

  return new Promise((resolve, reject) => {
    const child = spawn(invocation.command, invocation.args, spawnOptions);
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = options.timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill();
        }, options.timeoutMs)
      : undefined;

    child.stdout.on('data', (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });
    child.once('error', reject);
    child.once('close', (code) => {
      if (timer) clearTimeout(timer);
      if (timedOut) return reject(new Error(`Command timed out after ${options.timeoutMs}ms: ${command}`));
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });
  });
}

export function runNpm(args: readonly string[], options: CommandOptions = {}): Promise<CommandResult> {
  return runCommand('npm', args, options);
}

export const processRunnerInternals = { npmInvocation };
