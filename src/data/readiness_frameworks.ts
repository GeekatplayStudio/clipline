// src/data/readiness_frameworks.ts
// Justification: Curated baseline certification frameworks and regulatory standards based on the Upbound Group AI Standards Brief.

import { CertificationFramework } from '../types/readiness';

export const INITIAL_FRAMEWORKS: CertificationFramework[] = [
  {
    id: 'iso-42001',
    name: 'ISO/IEC 42001:2023 — AI Management System (AIMS)',
    code: 'ISO 42001',
    category: 'certifiable',
    categoryLabel: 'Certifiable International Standard',
    status: 'substantially_ready',
    progressPercentage: 68,
    targetDate: 'Q4 2026',
    leadOwner: 'Head of AI & Information Security',
    summary:
      'The premier international certifiable management system standard for AI. Requires formal external accredited audit, PDCA lifecycle, and verified workforce competence.',
    whatItIs:
      'Published December 2023, ISO/IEC 42001 is the world’s first certifiable standard for an AI Management System. Unlike NIST (which is voluntary), an accredited body audits your organization and issues an enforceable certification. Follows standard ISO harmonized clause skeleton (like ISO 27001 and ISO 9001).',
    whyItMatters:
      'Clause 7.2 (Competence) and Clause 7.3 (Awareness) mandate role-specific, tracked training evidence. If an auditor asks for proof that the workforce is competent for AI roles, documented training records and registry entries are the primary auditable artifacts.',
    whatItTakes: [
      'Establish formal AI Policy approved by executive leadership (Clause 5.2).',
      'Define AI system inventory and objectives baseline in ServiceNow (Clause 6.2.2).',
      'Provide verified evidence of role-based competence and ongoing awareness (Clause 7.2 & 7.3).',
      'Conduct internal audits against Annex A controls (e.g., A.7.4, A.9.2) and management reviews (Clause 9.2 & 9.3).',
      'Demonstrate documented corrective action procedures for unapproved shadow AI instances (Clause 10.1).',
    ],
    keyClausesOrFunctions: [
      {
        ref: 'Clause 4',
        name: 'Context & Scope',
        description: 'Defines AIMS boundary across Acima, Rent-A-Center, Brigit, Mexico, and Corporate.',
        hook: 'Ensures citizen automations are explicitly inside the governance boundary, not ignored as shadow IT.',
      },
      {
        ref: 'Clause 6.2.2',
        name: 'AI System Inventory',
        description: 'Documented inventory of AI systems, capabilities, and dependencies.',
        hook: 'Directly fulfilled by the ServiceNow AI Citizen Developer Registry.',
      },
      {
        ref: 'Clause 7.2 & 7.3',
        name: 'Competence & Awareness',
        description: 'Mandatory proof that persons doing work under organizational control are competent and aware of AI risks.',
        hook: 'This is the education and training mandate: tracked, role-specific certifications.',
      },
      {
        ref: 'Clause 9 & 10',
        name: 'Performance & Improvement',
        description: 'Monitoring, internal audits, management reviews, and nonconformity management.',
        hook: 'Quarterly ELT dashboards and periodic reattestation cycles satisfy continuous evaluation.',
      },
    ],
    executiveLine:
      '"42001 is where training stops being a nice-to-have. Clause 7.2 is competence and 7.3 is awareness — when an auditor arrives, the only acceptable evidence is documented, tracked, role-specific training. That is exactly the artifact our registry and LMS produces. We build tracking to be audit-ready from day one, because retrofitting evidence is miserable."',
    milestones: [
      { id: 'm1', label: 'AI Management System (AIMS) scope defined across all LOBs', completed: true, clauseRef: 'Clause 4.3' },
      { id: 'm2', label: 'ServiceNow AI Workflow inventory operational (u_ai_workflow_registry)', completed: true, clauseRef: 'Clause 6.2.2' },
      { id: 'm3', label: 'Acceptable Use training assigned via LMS with verifiable completion', completed: true, clauseRef: 'Clause 7.3' },
      { id: 'm4', label: 'Role-based proficiency assessments for citizen developers (Tier 3 Builder)', completed: false, clauseRef: 'Clause 7.2' },
      { id: 'm5', label: 'Internal pre-audit against ISO/IEC 42006 accreditation criteria', completed: false, clauseRef: 'Clause 9.2' },
    ],
    auditArtifacts: [
      'Executive-approved Enterprise AI Acceptable Use Policy v1.4',
      'ServiceNow CMDB AI Workflow Registry export (24 governed records)',
      'LMS LMS-to-HRIS role-level completion records & assessment grades',
      'Quarterly Executive Leadership Team (ELT) Governance Dashboards',
    ],
  },
  {
    id: 'nist-ai-rmf',
    name: 'NIST AI 100-1 — AI Risk Management Framework 1.0',
    code: 'NIST AI RMF',
    category: 'voluntary',
    categoryLabel: 'U.S. National Voluntary Taxonomy',
    status: 'substantially_ready',
    progressPercentage: 82,
    targetDate: 'Q3 2026',
    leadOwner: 'AI Working Group / Governance Lead',
    summary:
      'The foundational voluntary U.S. federal taxonomy for enterprise AI risk. Focuses on the four core cross-cutting functions: GOVERN, MAP, MEASURE, MANAGE (G-M-M-M).',
    whatItIs:
      'Published by the National Institute of Standards and Technology in January 2023 under the National AI Initiative Act of 2020. Voluntary, sector-agnostic, and self-attested. It is the universal lingua franca spoken by legal teams, CISOs, regulators, and external auditors in the United States.',
    whyItMatters:
      'Workforce competence and risk culture are named outcomes inside GOVERN-3 and GOVERN-4. The citizen developer registry is a genuine MAP artifact (inventory). The literacy assessments are MEASURE outputs, and the citizen developer guardrails are MANAGE controls.',
    whatItTakes: [
      'Operationalize the NIST AI RMF Playbook (~140 pages of concrete suggested actions).',
      'Align GenAI usage with the NIST Generative AI Profile (NIST AI 600-1) covering 12 GenAI risks (confabulation, privacy leakage, harmful bias).',
      'Embed the seven trustworthiness characteristics: valid/reliable, safe, secure/resilient, accountable/transparent, explainable, privacy-enhanced, and fair.',
      'Maintain an unbroken inventory mapping all active workflows, dependencies, and owners.',
    ],
    keyClausesOrFunctions: [
      {
        ref: 'GOVERN',
        name: 'Leadership, Culture & Competence',
        description: 'Cultivating risk culture, workforce competence (GOVERN-3/4), accountability, and vendor risk.',
        hook: 'Training lives directly inside GOVERN. People competence is an explicit control.',
      },
      {
        ref: 'MAP',
        name: 'Context & Categorization',
        description: 'Establishing context: what AI systems exist, who is affected, intended use, and potential negative impacts.',
        hook: 'The citizen developer registry is the primary enterprise MAP inventory artifact.',
      },
      {
        ref: 'MEASURE',
        name: 'Testing, Evaluation & Tracking',
        description: 'Qualitative and quantitative metrics for trustworthiness, risk exposure, and effectiveness.',
        hook: 'Literacy assessment scores and periodic reattestation rates provide verified MEASURE outputs.',
      },
      {
        ref: 'MANAGE',
        name: 'Risk Prioritization & Response',
        description: 'Applying guardrails, allocation of resources, incident response, and continuous treatment.',
        hook: 'Automated 4-tier risk routing and auto-decline of prohibited Tier 4 workflows.',
      },
    ],
    executiveLine:
      '"The RMF gives us the taxonomy. Where my role plugs in is GOVERN — workforce competence and risk culture are named outcomes in that function, not afterthoughts — and MAP, because a citizen developer registry is genuinely an AI system inventory. If we\'re not registering what people build, our MAP function has a hole in it and nobody knows how big."',
    milestones: [
      { id: 'n1', label: 'Four core functions (G-M-M-M) mapped to Upbound operating model', completed: true, clauseRef: 'Core Functions' },
      { id: 'n2', label: 'NIST AI 600-1 GenAI Profile risks integrated into intake classification', completed: true, clauseRef: 'Profile 600-1' },
      { id: 'n3', label: 'Trustworthiness characteristics checklist added to intake wizard', completed: true, clauseRef: 'Section 1.2' },
      { id: 'n4', label: 'RMF Playbook suggested actions cataloged for citizen developer support', completed: false, clauseRef: 'Playbook Ops' },
    ],
    auditArtifacts: [
      'NIST AI RMF 1.0 Function Crosswalk Spreadsheet',
      'Self-Attestation Statement of Alignment for ELT',
      'Risk Classification Engine logic (PRD Section 4 rules)',
    ],
  },
  {
    id: 'eu-ai-act',
    name: 'EU AI Act — Article 4 (AI Literacy) & Deployer Duties',
    code: 'EU AI Act',
    category: 'regulatory',
    categoryLabel: 'Global Regulatory Benchmark',
    status: 'audit_ready',
    progressPercentage: 90,
    targetDate: 'Active Since Feb 2025',
    leadOwner: 'AI Standards & Training Lead',
    summary:
      'Binding statutory requirement across all AI deployers. Article 4 legally mandates workforce AI literacy proportionate to role and context.',
    whatItIs:
      'The European Union Artificial Intelligence Act entered into force August 1, 2024. Article 4 took direct effect on 2 February 2025, legally requiring deployers and providers to ensure a sufficient level of AI literacy among their staff and contractors. General transparency (Article 50) took effect August 2026, while Annex III high-risk deadlines were moved to December 2027 under the Digital Omnibus.',
    whyItMatters:
      'Even though Upbound operates primarily in the U.S., Mexico, and Puerto Rico, Article 4 is the global benchmark U.S. state and federal regulators copy. Building role-based literacy standards that satisfy Article 4 insulates Upbound against upcoming domestic mandates.',
    whatItTakes: [
      'Documented, mandatory AI Literacy training tailored by role (Store Associates, Financial Analysts, Engineers).',
      'Ban on prohibited practices (subliminal manipulation, social scoring, biometric classification).',
      'Transparency notices for customer-facing AI interactions (Article 50 disclosure).',
      'Deployer human oversight protocol for high-influence workflows.',
    ],
    keyClausesOrFunctions: [
      {
        ref: 'Article 4',
        name: 'Workforce AI Literacy',
        description: 'Legal mandate requiring organizations to ensure staff possess technical knowledge, education, and context-specific training.',
        hook: 'The legal foundation of this entire job description — active since Feb 2025.',
      },
      {
        ref: 'Article 50',
        name: 'Transparency Duties',
        description: 'Mandatory disclosure when customers interact with chatbots or consume AI-generated media.',
        hook: 'Enforced via intake wizard output audience classification ("Customer-facing").',
      },
      {
        ref: 'Annex III',
        name: 'High-Risk Systems (Dec 2027)',
        description: 'Stringent conformity assessments and logging for credit scoring and employment decisions.',
        hook: 'Upbound Tier 3 & Tier 4 classifications preemptively enforce Annex III requirements.',
      },
    ],
    executiveLine:
      '"The Act doesn\'t bind Upbound directly on today\'s footprint, but Article 4 is worth knowing because it\'s the first time a regulator has written AI literacy into law as an obligation of the deploying organization, not the vendor. If I build role-based literacy standards that would satisfy an Article 4 review, we\'re ahead of whatever the U.S. equivalent turns out to be, and we\'re not rebuilding in two years."',
    milestones: [
      { id: 'e1', label: 'Article 4 Literacy Curriculum structured into 3 distinct tiers', completed: true, clauseRef: 'Article 4' },
      { id: 'e2', label: 'Prohibited AI practices hard-blocked in Registry intake logic', completed: true, clauseRef: 'Article 5' },
      { id: 'e3', label: 'Chatbot and generated content disclosure standards established', completed: true, clauseRef: 'Article 50' },
      { id: 'e4', label: 'Deployer human-in-the-loop oversight cadence tracking', completed: true, clauseRef: 'Article 26' },
    ],
    auditArtifacts: [
      'Article 4 AI Literacy Standard Curriculum Syllabus',
      'Prohibited AI Criteria Table & Intake Auto-Declination Rules',
      'Annual Employee Attestation Log',
    ],
  },
  {
    id: 'us-consumer-finance',
    name: 'U.S. Consumer Finance & Regulatory Layer (CFPB / ECOA / Reg B)',
    code: 'Consumer Finance',
    category: 'regulatory',
    categoryLabel: 'U.S. Federal & State Statutory Mandates',
    status: 'substantially_ready',
    progressPercentage: 74,
    targetDate: 'Immediate Compliance',
    leadOwner: 'General Counsel / Chief Compliance Officer',
    summary:
      'Consumer protection statutes governing credit, underwriting, and collections across Rent-A-Center, Acima, and Brigit.',
    whatItIs:
      'The consumer financial protection framework consisting of CFPB enforcement under UDAAP, Equal Credit Opportunity Act (ECOA / Regulation B), Fair Credit Reporting Act (FCRA), and Federal Reserve supervisory guidance SR 11-7 on Model Risk Management (MRM).',
    whyItMatters:
      'Under Regulation B, creditors must provide specific, accurate principal reasons for adverse action (denial of credit or lease). Black-box or citizen-built AI models are explicitly disallowed by the CFPB as an excuse for vague denials. If a citizen developer touches underwriting or collections, explainability is a legal requirement.',
    whatItTakes: [
      'Enforce zero automated citizen developer credit underwriting without formal Model Risk Management (MRM) validation.',
      'Mandatory explainability checks for any model output informing adverse customer actions.',
      'Strict testing for disparate impact and proxy variables (race, gender, protected classes).',
      'Robust data handling and fraud mitigation following Upbound’s Q2 2026 lease-to-own disclosures.',
    ],
    keyClausesOrFunctions: [
      {
        ref: 'ECOA / Reg B',
        name: 'Adverse Action Notices',
        description: 'Mandatory disclosure of specific principal reasons for credit or lease denial.',
        hook: 'Prevents citizen developers from quietly deploying unexplainable underwriting scoring tools.',
      },
      {
        ref: 'CFPB UDAAP',
        name: 'Unfair, Deceptive, or Abusive Practices',
        description: 'Catch-all regulatory authority for misleading customer communications or automated collections.',
        hook: 'Intake wizard flags customer-facing collections workflows for mandatory Legal/GC review.',
      },
      {
        ref: 'SR 11-7',
        name: 'Model Risk Management',
        description: 'Supervisory guidance on model development, implementation, use, and effective challenge.',
        hook: 'Provides the formal validation standard separating simple prompt aids from governed financial models.',
      },
    ],
    executiveLine:
      '"The thing that makes this a regulated-industry training problem rather than a generic one is adverse action. Under Reg B you owe a customer specific principal reasons for a denial. If a citizen developer builds a workflow that touches underwriting or collections, we\'ve quietly created an explainability requirement they probably don\'t know exists. That\'s precisely why the registry captures what decision the workflow touches, not just what tool it uses."',
    milestones: [
      { id: 'f1', label: 'Intake Wizard requires explicit decision influence declaration', completed: true, clauseRef: 'Reg B § 1002.9' },
      { id: 'f2', label: 'Automatic Tier 4 flag on credit underwriting or customer financial data', completed: true, clauseRef: 'CFPB Circular 2022-03' },
      { id: 'f3', label: 'Mandatory Human-in-the-Loop review cadence validation', completed: true, clauseRef: 'SR 11-7 Guidance' },
      { id: 'f4', label: 'Disparate impact & proxy variable training module for financial analysts', completed: false, clauseRef: 'ECOA § 1002.4' },
    ],
    auditArtifacts: [
      'Adverse Action Compliance Checklist for Citizen Workflows',
      'Model Risk Management (MRM) Tier Escalation Path',
      'Underwriting Guardrail Guidelines for Acima and Rent-A-Center',
    ],
  },
  {
    id: 'servicenow-cmdb',
    name: 'ServiceNow Enterprise Intake & CMDB Integration',
    code: 'ServiceNow AIMS',
    category: 'systems',
    categoryLabel: 'Enterprise Platform Architecture',
    status: 'audit_ready',
    progressPercentage: 92,
    targetDate: 'Q3 2026',
    leadOwner: 'IT Service Management & AI Working Group',
    summary:
      'ServiceNow CMDB configuration management architecture hosting the u_ai_workflow_registry table, automated record producers, and conditional routing.',
    whatItIs:
      'Production deployment on ServiceNow using a dedicated Record Producer in the Service Catalog. Connects Flow Designer approval chains with conditional logic feeding the central `u_ai_workflow_registry` table.',
    whyItMatters:
      'The citizen developer registry acts as an enterprise Configuration Management Database (CMDB) for AI workflows. It ensures automated intake doesn’t ask technical questions requesters can’t answer, but instead derives risk tiers mathematically.',
    whatItTakes: [
      'Field mapping between prototype schema and ServiceNow `u_ai_workflow_registry`.',
      'Flow Designer multi-tier approval chains (Program Lead -> Security -> Legal/GC -> AI Working Group).',
      'Automated SLA monitoring and periodic reattestation triggers (12 mo, 6 mo, 3 mo).',
      'ServiceNow Service Catalog item published for all 2,400+ store and corporate locations.',
    ],
    keyClausesOrFunctions: [
      {
        ref: 'Table Schema',
        name: 'u_ai_workflow_registry',
        description: 'Underlying data table storing workflow IDs, risk tiers, review dates, and tool telemetry.',
        hook: 'Complete 1-to-1 parity with this prototype data model.',
      },
      {
        ref: 'Record Producer',
        name: 'AI Workflow Intake Form',
        description: 'Low-friction form converting plain-English employee descriptions into classified records.',
        hook: 'Calculates risk tier mathematically behind the scenes rather than asking users to self-classify.',
      },
      {
        ref: 'Flow Designer',
        name: 'Approval Chain Engine',
        description: 'Automated routing based on risk tier and data sensitivity.',
        hook: 'Enforces the governance boundary with zero manual administrative overhead.',
      },
    ],
    executiveLine:
      '"What I care about isn\'t the platform, it\'s the form design. Intake forms fail when they ask for things the requester doesn\'t know how to answer. If we ask a merchandising analyst to classify their own data sensitivity, we\'ll get garbage. The form asks \'what are you trying to do\' and lets the logic derive the risk tier. Then training and intake reinforce each other — you learn the categories in the module, and the form uses the exact same words."',
    milestones: [
      { id: 's1', label: 'ServiceNow schema u_ai_workflow_registry fully specified', completed: true, clauseRef: 'CMDB Spec' },
      { id: 's2', label: '4-Tier conditional risk evaluation algorithm verified (PRD Section 4)', completed: true, clauseRef: 'Intake Engine' },
      { id: 's3', label: 'CSV and JSON export modules formatted for ServiceNow bulk import', completed: true, clauseRef: 'Import Set' },
      { id: 's4', label: 'Automated reattestation notification flow designed in Flow Designer', completed: true, clauseRef: 'Scheduled Job' },
    ],
    auditArtifacts: [
      'ServiceNow Table Ingestion Specification (Table Schema v1.0)',
      'ServiceNow Import Set sample CSV payload',
      'Flow Designer Multi-Tier Approval Chain Diagram',
    ],
  },
  {
    id: 'lms-hr-architecture',
    name: 'Enterprise LMS & HR Competency Framework (3-Tier Model)',
    code: 'LMS & HRIS',
    category: 'systems',
    categoryLabel: 'Talent Architecture & Competency Model',
    status: 'in_progress',
    progressPercentage: 62,
    targetDate: 'Q4 2026',
    leadOwner: 'AI Standards & Training Lead / HR L&D',
    summary:
      'Integration of AI literacy standards into HR job profiles, Workday LMS assignment rules, Day One onboarding, and proficiency leveling.',
    whatItIs:
      'Embedding AI literacy as a core competency within Upbound’s existing HR competency model and job architecture. Utilizes an LMS (e.g. Workday Learning or Cornerstone) with xAPI/LRS standards to track completion, applied assessments, and annual reattestation.',
    whyItMatters:
      'Training programs die when they invent a parallel structure. By integrating directly into HR job profiles, leveling, and performance frameworks, AI literacy becomes an enduring capability that survives administrative turnover. The three-tier model ensures relevance for retail associates up to software engineers.',
    whatItTakes: [
      'Map AI literacy competencies onto HR’s existing 4-5 point proficiency scale.',
      'Deploy 6-minute retail-focused Acceptable Use module into Day One onboarding for store associates.',
      'Establish xAPI/LRS tracking for applied citizen developer sandbox achievements.',
      'Audit HRIS population and job profile clean-up to ensure accurate assignment rules.',
    ],
    keyClausesOrFunctions: [
      {
        ref: 'Tier 1 Aware',
        name: 'All Employees (Retail & Corp)',
        description: 'Acceptable Use. What you may and may not put into an AI tool. Recognizing hallucinations. Who to ask.',
        hook: '6-minute job aid and Day One onboarding requirement; completion + scenario check.',
      },
      {
        ref: 'Tier 2 Fluent',
        name: 'Business & Professional Roles',
        description: 'Effective prompting, verification habits, identifying appropriate workflows, escalation rules.',
        hook: 'Applied exercises for marketing, store ops, and financial analysts.',
      },
      {
        ref: 'Tier 3 Builder',
        name: 'Citizen Developers & Engineers',
        description: 'Building with AI, data handling, testing, documentation, and mandatory registration duty.',
        hook: 'Prerequisite for registering automations in ServiceNow; verified through attestation.',
      },
    ],
    executiveLine:
      '"I built and ran an enterprise LMS at Hughes for eight years. What that taught me is that the platform is never the hard part. The hard part is that completion data is only as good as the population data feeding it. If the HRIS job profiles are messy, your dashboard says 94% complete and it\'s fiction. That\'s why HR partnership isn\'t a side item — it\'s load-bearing. AI literacy must live inside HR\'s existing competency model, not as an isolated training initiative with an eighteen-month shelf life."',
    milestones: [
      { id: 'l1', label: '3-Tier Literacy model defined: Tier 1 Aware, Tier 2 Fluent, Tier 3 Builder', completed: true, clauseRef: 'Competency Model' },
      { id: 'l2', label: '6-minute Acceptable Use scenario module prototyped for store associates', completed: true, clauseRef: 'Onboarding Module' },
      { id: 'l3', label: 'HRIS job profile mapping to dynamic learning assignment rules', completed: false, clauseRef: 'HRIS Integration' },
      { id: 'l4', label: 'xAPI / LRS completion tracking pipeline for sandbox prompt exercises', completed: false, clauseRef: 'xAPI Telemetry' },
    ],
    auditArtifacts: [
      'Upbound 3-Tier AI Competency Specification & Proficiency Scale',
      'Acceptable Use Knowledge Check Scenario Bank',
      'Hughes LMS Transferable Architecture Case Study',
    ],
  },
];
