// agents/types.ts
// Justification: Formal type definitions and interfaces for the Super Agent and specialized sub-agent orchestration framework.

// Justification: Enumerates all specialized sub-agent roles participating in the delivery pipeline.
export type AgentRole =
  | 'super_agent'
  | 'project_manager'
  | 'system_architect'
  | 'ui_designer'
  | 'frontend_developer'
  | 'backend_developer'
  | 'qa_engineer'
  | 'doc_writer'
  | 'deployment_agent';

// Justification: Lifecycle status states for agent task tracking and verification telemetry.
export type TaskStatus =
  'pending' | 'in_progress' | 'verification_failed' | 'retrying' | 'completed' | 'fatal_error';

// Justification: Defines verification result returned by verification hooks to validate quality gates.
export interface VerificationResult {
  // Justification: Boolean indicating whether the artifact satisfies quality criteria.
  success: boolean;
  // Justification: Human-readable message explaining the pass or failure rationale.
  message: string;
  // Justification: Specific diagnostics, error messages, or missing requirements to guide retry.
  diagnostics?: string[];
  // Justification: Quantitative metrics such as test coverage percentage or bundle size.
  metrics?: Record<string, number | string | boolean>;
}

// Justification: Retry configuration for resilient execution when transient or algorithmic failures occur.
export interface RetryPolicy {
  // Justification: Maximum attempts before escalating to human operator.
  maxAttempts: number;
  // Justification: Initial delay in milliseconds before first retry.
  initialDelayMs: number;
  // Justification: Exponential multiplier applied to delay for subsequent retries.
  backoffFactor: number;
}

// Justification: Unit of work executed by a specialized sub-agent.
export interface AgentTask {
  // Justification: Unique identifier for task auditing.
  id: string;
  // Justification: Title describing the objective of this step.
  title: string;
  // Justification: Sub-agent role responsible for task execution.
  assignedRole: AgentRole;
  // Justification: Detailed instruction context provided to the agent.
  instructions: string;
  // Justification: Array of file paths or deliverables expected from this task.
  expectedArtifacts: string[];
  // Justification: Verification hook executed by the Super Agent after task completion.
  verify: (context: AgentExecutionContext) => Promise<VerificationResult>;
}

// Justification: Context object passed between sub-agents and the Super Agent supervisor.
export interface AgentExecutionContext {
  // Justification: Working directory for code operations.
  workspaceRoot: string;
  // Justification: Shared key-value store for cross-agent artifact passing.
  sharedMemory: Map<string, unknown>;
  // Justification: History of executed steps and results for audit logging.
  executionLog: AgentExecutionRecord[];
}

// Justification: Telemetry record for a single sub-agent execution pass.
export interface AgentExecutionRecord {
  // Justification: Task ID executed.
  taskId: string;
  // Justification: Sub-agent role.
  role: AgentRole;
  // Justification: Execution attempt number (1-indexed).
  attempt: number;
  // Justification: Timestamp when task started.
  startedAt: string;
  // Justification: Timestamp when task finished.
  finishedAt?: string;
  // Justification: Final task status for this attempt.
  status: TaskStatus;
  // Justification: Verification result recorded by the Super Agent.
  verification?: VerificationResult;
}

// Justification: Contract interface that every specialized sub-agent definition must implement.
export interface ISubAgent {
  // Justification: Role identifier matching AgentRole enum.
  readonly role: AgentRole;
  // Justification: Formal persona prompt establishing domain expertise and behavior boundaries.
  readonly systemPrompt: string;
  // Justification: Responsibilities and deliverables owned by this agent.
  readonly responsibilities: string[];
  // Justification: Executes the agent's assigned task logic.
  execute(task: AgentTask, context: AgentExecutionContext): Promise<void>;
}
