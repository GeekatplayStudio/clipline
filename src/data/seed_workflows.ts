import { Workflow } from '../types/workflow.js';
import { RAC_WORKFLOWS } from './seed_workflows_rac.js';
import { ACIMA_WORKFLOWS } from './seed_workflows_acima.js';
import { BRIGIT_WORKFLOWS } from './seed_workflows_brigit.js';
import { CORPORATE_WORKFLOWS } from './seed_workflows_corporate.js';
import { MEXICO_WORKFLOWS } from './seed_workflows_mexico.js';

/** Baseline demo records, grouped by business unit for maintainability. */
export const SEED_WORKFLOWS: Workflow[] = [
  ...RAC_WORKFLOWS,
  ...ACIMA_WORKFLOWS,
  ...BRIGIT_WORKFLOWS,
  ...CORPORATE_WORKFLOWS,
  ...MEXICO_WORKFLOWS,
];
