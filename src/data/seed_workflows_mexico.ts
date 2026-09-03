import { Workflow } from '../types/workflow.js';

export const MEXICO_WORKFLOWS: Workflow[] = [
  {
    // Justification: PRD Required Example #5: Mexico translation showing thought given to non-US footprint.
    id: 'AIW-0024',
    title: 'Translate store signage copy to Spanish',
    description:
      'Translates English promotional POS posters and seasonal banners into localized Mexican Spanish idioms.',
    owner_name: 'Mateo Hernandez',
    owner_role: 'Regional Marketing Coordinator',
    lob: 'Mexico',
    department: 'Retail Marketing',
    tools_used: ['Google Gemini'],
    build_type: 'Prompt/chat workflow',
    data_categories: ['Internal non-sensitive'],
    decision_influence: 'No decision — informational only',
    output_audience: 'Customer-facing',
    data_leaves_tenant: true,
    human_review: 'Every output reviewed',
    risk_tier: 'Tier 1 Low',
    risk_reason: 'Tier 1 — Low. Promotional signage translation with full human review before printing.',
    status: 'Approved',
    registered_date: '2026-01-22',
    review_due: '2027-01-22',
    last_attested: '2026-01-22',
    builder_tier: 'Tier 1 Aware',
    training_current: true,
  },
];
