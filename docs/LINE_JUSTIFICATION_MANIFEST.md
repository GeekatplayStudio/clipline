# Code Line Justification Manifest & Compliance Audit

## AI Citizen Developer Registry Decision-Comment Manifest

**Standard Enforced:** Every functional code block, algorithmic decision, configuration parameter, and domain interface contains explicit inline justifications explaining the architectural, UX usability, security, and PRD requirement rationale.

---

## 1. Justification Categories & Rationale

| Category                      | Description                                                                                                                                                       | Primary Code Files                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **PRD Compliance**            | Explicitly traces back to requirements in `PRD_Citizen_Developer_Registry.md` (e.g. 4-step progressive intake, estimated unregistered footnote, 24 seed records). | `src/engine/risk_engine.ts`, `src/data/seed_workflows.ts`, `src/components/dashboard/CoverageDashboard.tsx`                  |
| **Architectural Integrity**   | Explains algorithmic decisions, pure functional rule cascades, and state immutability.                                                                            | `src/engine/risk_engine.ts`, `src/store/workflow_store.ts`, `agents/super_agent.ts`                                          |
| **Security & Regulatory**     | Highlights adverse action compliance (Reg B / FCRA), PII tokenization, customer financial record protection, and tenant egress controls.                          | `src/types/workflow.ts`, `src/engine/risk_engine.ts`, `src/data/quiz_questions.ts`                                           |
| **Human-Factors & Usability** | Details density over whitespace, humanist sans typography, tabular figures alignment, and educational real-time callouts.                                         | `src/index.css`, `tailwind.config.js`, `src/components/intake/IntakeWizard.tsx`, `src/components/registry/RegistryTable.tsx` |
| **ServiceNow Parity**         | Documents mapping to ServiceNow data conventions, table schema (`u_ai_workflow_registry`), and Flow Designer approval routing.                                    | `docs/SERVICENOW_MIGRATION_BLUEPRINT.md`, `src/types/workflow.ts`                                                            |

---

## 2. Directory Justification Audit

### `/agents` (Role-Oriented Verification Harness)

- `agents/types.ts`: Formal contracts for sub-agent roles, task tracking, retry policies, and verification hooks.
- `agents/super_agent.ts`: Master supervisor implementing step verification, error analysis, and exponential backoff retry cycles.
- `agents/definitions/`: 8 responsibility definitions used for ownership-oriented telemetry. They are not autonomous code-generation agents.
- `agents/run_pipeline.ts`: Sequential execution runner with logging, real test execution, production compilation, artifact checks, and retries.

### `/src/types`

- `src/types/workflow.ts`: Full domain contracts for `Workflow`, enums, `RiskEvaluationResult`, `UserRole`, and intake data models.

### `/src/engine`

- `src/engine/risk_engine.ts`: Pure functional risk cascade (Tier 4 Prohibited -> Tier 3 High -> Tier 2 Moderate -> Tier 1 Low) with contextual reasons, educational alerts, and month-end-safe review dates.

### `/src/data`

- `src/data/seed_workflows.ts`: Exactly 24 realistic workflows covering Acima (8), Rent-A-Center (7), Brigit (4), Corporate (4), Mexico (1) including all key interview talking points.
- `src/data/quiz_questions.ts`: 6 scenario-based questions focusing on situational application (including "Tool approval is not data approval").

### `/src/store`

- `src/store/workflow_store.ts`: Reactive state management, localStorage persistence, multi-dimensional filtering, deterministic `AIW-XXXX` ID generation, and executive metrics aggregation.

### `/src/components`

- `src/components/layout/Header.tsx`: Pinned prototype banner, title, role switcher dropdown ("Citizen developer", "Program lead", "Executive"), and quick navigation tabs.
- `src/components/intake/IntakeWizard.tsx`: 4-step progressive disclosure wizard with real-time educational callouts upon selecting sensitive data.
- `src/components/registry/RegistryTable.tsx`: High-density ServiceNow-style table with tabular numbers, muted tier badges, and filters.
- `src/components/detail/WorkflowDetailModal.tsx`: Complete record inspection, derived risk justification, approval actions (Approve, Approve with conditions, Decline), and support Q&A.
- `src/components/dashboard/CoverageDashboard.tsx`: Stacked bar chart, side-by-side KPI cards with required footnote, literacy bars with 80% target, and overdue review alerts.
- `src/components/quiz/KnowledgeCheck.tsx`: Companion interactive quiz with immediate explanation feedback and scoring.

### `/src/__tests__`

- Unit and component tests with explicit scoped coverage gates. See `docs/ENGINEERING_QUALITY.md` for exact thresholds and exclusions.
