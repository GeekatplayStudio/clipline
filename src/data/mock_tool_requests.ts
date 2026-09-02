// src/data/mock_tool_requests.ts
// Justification: Realistic mockup requests for AI tool evaluation featuring comprehensive security, compliance, certification, threat vector, and decision analyses.

import { ToolRequest } from '../types/tool_request.js';

export const INITIAL_TOOL_REQUESTS: ToolRequest[] = [
  {
    id: 'TR-1001',
    toolName: 'Cursor IDE (Enterprise)',
    vendor: 'Anysphere Inc. / Anthropic Integration',
    category: 'Code & Development',
    requesterName: 'Alex Rivera',
    requesterRole: 'Senior Staff Software Engineer',
    lob: 'Corporate',
    department: 'Platform Engineering',
    intendedUseCase:
      'AI-assisted code completion, refactoring, and automated test generation to accelerate internal software delivery.',
    dataHandlingModel: 'Enterprise Tenant (Zero Retention)',
    intendedDataSensitivity: ['Internal Non-Sensitive', 'Internal Confidential'],
    requestedDate: '2026-08-14',
    status: 'Approved with Conditions',
    officialComments:
      'Approved for engineering staff provided Privacy Mode is permanently locked via MDM and zero customer financial tokens enter codebase.',
    safetyAnalysis: {
      safetyScore: 88,
      riskLevel: 'Low',
      whatItCanDo: [
        'Multi-file codebase indexing and semantic search',
        'Real-time code generation and automated unit test authoring',
        'Terminal command explanation and syntax error remediation',
        'Direct integration with Anthropic Claude 3.5 Sonnet under enterprise terms',
      ],
      certifications: [
        { name: 'SOC 2 Type II', verified: true, notes: 'Annual audit verified; zero data retention clause active.' },
        { name: 'ISO 27001', verified: true, notes: 'Enterprise tenant isolation certified.' },
        { name: 'ISO 42001 (AIMS)', verified: false, notes: 'Vendor has self-attested alignment but no external audit.' },
        { name: 'GDPR / CCPA Compliant', verified: true, notes: 'Full DPA with standard contractual clauses executed.' },
      ],
      threatVectors: [
        {
          category: 'Prompt / Code Leakage',
          severity: 'Medium',
          description: 'Developers could inadvertently send hardcoded API secrets or database credentials into model context.',
          mitigation: 'Enforce pre-commit TruffleHog secret scanning and automated secret redaction before telemetry egress.',
        },
        {
          category: 'Software Vulnerabilities',
          severity: 'Medium',
          description: 'AI-generated code may contain subtle logic bugs, OWASP Top 10 vulnerabilities, or hallucinated npm packages.',
          mitigation: 'Mandatory peer review and SonarQube static analysis before any AI-generated PR can be merged to main.',
        },
      ],
      trainsOnCustomerData: false,
      dataRetentionPolicy: 'Zero Data Retention (ZDR) guarantee under Business Agreement.',
      recommendedDecision: 'Approved with Conditions',
      decisionReasoning:
        'Cursor provides transformative developer velocity. Because the enterprise tier offers strict Zero Data Retention and SOC 2 Type II certification, code leakage is mitigated. However, mandatory peer code review and local privacy locks must be enforced.',
      mandatoryGuardrails: [
        'Enforce "Privacy Mode" enabled by default via IT mobile device management (MDM).',
        'Zero customer PII, payment tokens, or production database credentials may be opened in the IDE workspace.',
        'All AI-generated code must pass standard automated security linting (SonarQube) and human peer review.',
      ],
      reviewedBy: 'Head of Information Security & Program Lead',
      reviewedDate: '2026-08-18',
    },
  },
  {
    id: 'TR-1002',
    toolName: 'Perplexity Enterprise Pro',
    vendor: 'Perplexity AI, Inc.',
    category: 'Research & Search',
    requesterName: 'Elena Rostova',
    requesterRole: 'Director of Strategic Planning',
    lob: 'Corporate',
    department: 'Corporate Strategy & Finance',
    intendedUseCase:
      'Executive research, competitor lease-to-own market analysis, statutory regulatory scanning, and cited citation summaries.',
    dataHandlingModel: 'Enterprise Tenant (Zero Retention)',
    intendedDataSensitivity: ['Public Company Information', 'Internal Non-Sensitive'],
    requestedDate: '2026-08-20',
    status: 'Approved',
    officialComments: 'Approved for strategic research across all corporate analysts.',
    safetyAnalysis: {
      safetyScore: 92,
      riskLevel: 'Low',
      whatItCanDo: [
        'Real-time web search synthesis with academic and regulatory source citations',
        'Multi-model switching (GPT-4o, Claude 3.5 Sonnet) under unified corporate billing',
        'Collection spaces with team-based permission access control',
        'Exporting verifiable cited research briefs for executive leadership',
      ],
      certifications: [
        { name: 'SOC 2 Type II', verified: true, notes: 'Verified compliance under enterprise agreement.' },
        { name: 'ISO 27001', verified: true, notes: 'Cloud infrastructure verified.' },
        { name: 'GDPR / CCPA', verified: true, notes: 'Data privacy agreement with opt-out clause active.' },
      ],
      threatVectors: [
        {
          category: 'Hallucination / Confabulation',
          severity: 'Low',
          description: 'Search answers might synthesize conflicting market figures if citations are not verified.',
          mitigation: 'Interface enforces mandatory inline citation clicks to verify primary sources.',
        },
      ],
      trainsOnCustomerData: false,
      dataRetentionPolicy: 'Enterprise searches are never retained or used to train public models.',
      recommendedDecision: 'Approved',
      decisionReasoning:
        'Vendor holds clean SOC 2 Type II certification and guarantees zero model training on corporate search queries. Excellent utility for market intelligence without touching customer data.',
      mandatoryGuardrails: [
        'Restricted to public market research and process documentation.',
        'Do not paste non-public lease portfolio performance metrics or unreleased earnings previews.',
      ],
      reviewedBy: 'AI Working Group',
      reviewedDate: '2026-08-22',
    },
  },
  {
    id: 'TR-1003',
    toolName: 'Otter.ai Business',
    vendor: 'Otter.ai Inc.',
    category: 'Meeting & Audio Transcription',
    requesterName: 'Marcus Vance',
    requesterRole: 'Regional Retail Operations Lead',
    lob: 'Rent-A-Center',
    department: 'Store Operations',
    intendedUseCase:
      'Transcribing regional store manager conference calls and store associate operational training sessions.',
    dataHandlingModel: 'Vendor Cloud (Multi-Tenant)',
    intendedDataSensitivity: ['Internal Confidential', 'Customer Financial Data'],
    requestedDate: '2026-08-25',
    status: 'Declined',
    officialComments:
      'Declined due to multi-tenant audio storage and severe risk of recording customer credit and lease discussions.',
    safetyAnalysis: {
      safetyScore: 42,
      riskLevel: 'High',
      whatItCanDo: [
        'Automated Zoom/Teams meeting bot joins and records audio streams',
        'Speaker diarization and real-time meeting transcription',
        'AI meeting summarization and action item extraction',
      ],
      certifications: [
        { name: 'SOC 2 Type II', verified: true, notes: 'Standard cloud compliance.' },
        { name: 'ISO 27001', verified: false, notes: 'Not certified.' },
        { name: 'HIPAA', verified: false, notes: 'Not signed under standard business tier.' },
      ],
      threatVectors: [
        {
          category: 'Uncontrolled Audio Egress',
          severity: 'Critical',
          description:
            'Store managers occasionally discuss escalated customer lease accounts, collections calls, and customer financial hardship on regional calls.',
          mitigation: 'Otter stores raw unencrypted audio on vendor infrastructure without tenant isolation.',
        },
        {
          category: 'Passive Eavesdropping Risk',
          severity: 'High',
          description:
            'Autonomous bot joins calls automatically upon calendar sync without human participant awareness, creating two-party consent wiretapping exposures in multiple states.',
          mitigation: 'Cannot be easily mitigated on retail field devices.',
        },
      ],
      trainsOnCustomerData: true,
      dataRetentionPolicy: 'Transcripts and audio retained on vendor servers for transcription model improvements.',
      recommendedDecision: 'Declined',
      decisionReasoning:
        'Otter.ai retains meeting audio on multi-tenant cloud storage and permits data usage for internal algorithm tuning under standard terms. In retail operations where customer credit and account issues are discussed, this creates immediate GLBA and state two-party consent wiretap liability.',
      mandatoryGuardrails: [
        'Employees must use approved Microsoft Teams Copilot (Enterprise Tenant) for meeting transcription instead.',
      ],
      reviewedBy: 'General Counsel & Chief Information Security Officer',
      reviewedDate: '2026-08-28',
    },
  },
  {
    id: 'TR-1004',
    toolName: 'DeepSeek Coder / Public API',
    vendor: 'DeepSeek AI',
    category: 'Code & Development',
    requesterName: 'Devon Wright',
    requesterRole: 'Machine Learning Analyst',
    lob: 'Acima',
    department: 'Underwriting Analytics',
    intendedUseCase:
      'Low-cost code generation and statistical script translation for lease default analysis models.',
    dataHandlingModel: 'Public / Consumer Cloud',
    intendedDataSensitivity: ['Credit or Underwriting Data', 'Internal Confidential'],
    requestedDate: '2026-08-29',
    status: 'Declined',
    officialComments:
      'Declined and blocked on corporate network. Data handling terms and cross-border data transfer violate corporate risk policy.',
    safetyAnalysis: {
      safetyScore: 28,
      riskLevel: 'Critical',
      whatItCanDo: [
        'High-performance open-weight code generation',
        'Mathematical reasoning and Python script optimization',
      ],
      certifications: [
        { name: 'SOC 2 Type II', verified: false, notes: 'No independent verification available.' },
        { name: 'ISO 27001', verified: false, notes: 'Unverified.' },
        { name: 'GDPR / CCPA DPA', verified: false, notes: 'No enforceable U.S. commercial enterprise agreement.' },
      ],
      threatVectors: [
        {
          category: 'Cross-Border Sovereign Data Egress',
          severity: 'Critical',
          description:
            'API calls route to infrastructure outside U.S. jurisdiction without binding enterprise Data Protection Addendum (DPA).',
          mitigation: 'Violates Upbound Information Security Data Classification Standard.',
        },
        {
          category: 'Model Retraining Exposure',
          severity: 'Critical',
          description: 'Public API inputs may be logged and integrated into subsequent public model checkpoints.',
          mitigation: 'Strictly prohibited from ingesting proprietary Acima scoring algorithms.',
        },
      ],
      trainsOnCustomerData: true,
      dataRetentionPolicy: 'Data retention terms are unverified and subject to foreign jurisdiction.',
      recommendedDecision: 'Declined',
      decisionReasoning:
        'DeepSeek lacks enterprise SOC 2 Type II compliance, enforceable enterprise tenant isolation, and clear contractual indemnification. Ingesting underwriting scripts into foreign-hosted servers represents an unacceptable regulatory risk under FTC and CFPB guidance.',
      mandatoryGuardrails: [
        'Use corporate-approved Azure OpenAI or AWS Bedrock Claude instances instead.',
      ],
      reviewedBy: 'AI Working Group & Cyber Risk Lead',
      reviewedDate: '2026-08-30',
    },
  },
  {
    id: 'TR-1005',
    toolName: 'Midjourney v6.1 (Commercial Tier)',
    vendor: 'Midjourney, Inc.',
    category: 'Content & Marketing',
    requesterName: 'Chloe Bennett',
    requesterRole: 'Creative Director',
    lob: 'Rent-A-Center',
    department: 'Marketing & Brand Strategy',
    intendedUseCase:
      'Generating moodboards, seasonal retail promotional concepts, and social media background visual assets.',
    dataHandlingModel: 'Vendor Cloud (Multi-Tenant)',
    intendedDataSensitivity: ['Public Company Information'],
    requestedDate: '2026-08-31',
    status: 'Approved with Conditions',
    officialComments:
      'Approved for internal creative concepting only. Direct customer-facing publication requires Legal IP clearance.',
    safetyAnalysis: {
      safetyScore: 74,
      riskLevel: 'Moderate',
      whatItCanDo: [
        'Photorealistic visual rendering from natural language prompts',
        'Style transfer and composition exploration for advertising campaigns',
        'Upscaling and aspect ratio re-framing for store display formats',
      ],
      certifications: [
        { name: 'SOC 2 Type II', verified: false, notes: 'Not certified for data security.' },
        { name: 'Commercial IP Indemnity', verified: true, notes: 'Standard commercial tier terms.' },
      ],
      threatVectors: [
        {
          category: 'Copyright / IP Infringement Risk',
          severity: 'High',
          description:
            'Generative imagery models face active copyright class-action litigation regarding training data provenance.',
          mitigation: 'Prohibit prompts that reference copyrighted artists or competing corporate brand characters.',
        },
        {
          category: 'Public Visibility on Discord',
          severity: 'Medium',
          description: 'Non-stealth plans display prompts and generated images in public Discord channels.',
          mitigation: 'Must purchase Pro/Mega tier with "Stealth Mode" permanently enabled.',
        },
      ],
      trainsOnCustomerData: false,
      dataRetentionPolicy: 'Prompts stored on Midjourney servers; stealth mode prevents public showcase.',
      recommendedDecision: 'Approved with Conditions',
      decisionReasoning:
        'Useful for creative prototyping. Permitted under strict conditions that stealth mode is paid for and output is used strictly as inspiration or internal mockups, never as final trademarked collateral without Legal review.',
      mandatoryGuardrails: [
        'Mandatory Stealth Mode enabled to prevent public broadcast of promotional concepts.',
        'Zero depiction of company executives, store employees, or real customer likenesses.',
        'Final advertising assets must be cleared by Upbound Marketing Legal counsel before publication.',
      ],
      reviewedBy: 'Brand Legal & AI Standards Lead',
      reviewedDate: '2026-09-01',
    },
  },
  {
    id: 'TR-1006',
    toolName: 'ElevenLabs Voice Engine',
    vendor: 'ElevenLabs, Inc.',
    category: 'Voice & Synthetic Media',
    requesterName: 'Jason Todd',
    requesterRole: 'Collections Workflow Specialist',
    lob: 'Acima',
    department: 'Collections & Customer Recovery',
    intendedUseCase:
      'Synthesizing personalized automated voice calls to notify customers of overdue lease installments.',
    dataHandlingModel: 'Vendor Cloud (Multi-Tenant)',
    intendedDataSensitivity: ['Customer PII', 'Customer Financial Data'],
    requestedDate: '2026-09-01',
    status: 'Banned',
    officialComments:
      'Categorically BANNED across all Upbound operations. Synthetic voice outreach in collections violates CFPB UDAAP rules and state anti-robocall statutes.',
    safetyAnalysis: {
      safetyScore: 15,
      riskLevel: 'Critical',
      whatItCanDo: [
        'Cloning realistic human voices with 1-minute audio training samples',
        'Generating dynamic text-to-speech audio with conversational inflection',
        'Automating outbound voice drops to consumer telephone numbers',
      ],
      certifications: [
        { name: 'SOC 2 Type II', verified: true, notes: 'Standard cloud compliance.' },
        { name: 'TCPA Safe Harbor', verified: false, notes: 'Non-compliant.' },
      ],
      threatVectors: [
        {
          category: 'Severe Regulatory Non-Compliance (CFPB / FCC)',
          severity: 'Critical',
          description:
            'FCC ruled AI-generated voices in robocalls illegal under TCPA without prior express consent. CFPB interprets synthetic debt collection voice outreach as deceptive and abusive (UDAAP).',
          mitigation: 'Cannot be mitigated. Statutorily non-compliant.',
        },
        {
          category: 'Reputational & Impersonation Exposure',
          severity: 'Critical',
          description:
            'Risk of synthetic voice being perceived as predatory or intimidating to vulnerable consumers.',
          mitigation: 'Direct violation of Upbound Code of Conduct.',
        },
      ],
      trainsOnCustomerData: true,
      dataRetentionPolicy: 'Voice models stored on vendor servers.',
      recommendedDecision: 'Banned',
      decisionReasoning:
        'Synthetic voice generation in debt collection is a Tier 4 Prohibited activity. The FCC has banned synthetic voice robocalls without explicit consent, and the CFPB considers artificial collections calls an abusive practice. Banned permanently.',
      mandatoryGuardrails: [
        'Outbound automated voice synthesis is prohibited by executive order.',
        'Human retail and collections agents only.',
      ],
      reviewedBy: 'Chief Legal Officer & Head of AI Governance',
      reviewedDate: '2026-09-02',
    },
  },
  {
    id: 'TR-1007',
    toolName: 'Notion AI (Enterprise Workspace)',
    vendor: 'Notion Labs, Inc.',
    category: 'Workflow Automation',
    requesterName: 'Samantha Green',
    requesterRole: 'HR Operations Manager',
    lob: 'Brigit',
    department: 'People Operations',
    intendedUseCase:
      'Drafting internal onboarding checklists, job descriptions, and summarizing team policy documentation.',
    dataHandlingModel: 'Enterprise Tenant (Zero Retention)',
    intendedDataSensitivity: ['Internal Non-Sensitive', 'Employee Data'],
    requestedDate: '2026-09-02',
    status: 'Approved with Conditions',
    officialComments:
      'Approved for documentation and process synthesis. Strictly prohibited from ingesting compensation, disciplinary, or medical records.',
    safetyAnalysis: {
      safetyScore: 82,
      riskLevel: 'Low',
      whatItCanDo: [
        'Workspace Q&A semantic search across approved team wiki pages',
        'Summarizing long meeting notes and action plan drafting',
        'Translating documentation between English and Spanish for non-US teams',
      ],
      certifications: [
        { name: 'SOC 2 Type II', verified: true, notes: 'Verified annually.' },
        { name: 'ISO 27001', verified: true, notes: 'Certified.' },
        { name: 'GDPR / CCPA', verified: true, notes: 'Compliant DPA.' },
      ],
      threatVectors: [
        {
          category: 'Internal Over-Permissioning',
          severity: 'Medium',
          description:
            'Employees might accidentally index sensitive HR compensation spreadsheets into Notion AI search context.',
          mitigation: 'Enforce strict workspace page permissions and separate HR database partitions.',
        },
      ],
      trainsOnCustomerData: false,
      dataRetentionPolicy: 'Enterprise plan features Zero Data Retention for model inference.',
      recommendedDecision: 'Approved with Conditions',
      decisionReasoning:
        'Notion AI has strong enterprise tenant controls with Zero Data Retention on enterprise plans. Safe for internal operations and team documentation when sensitive compensation files are partitioned.',
      mandatoryGuardrails: [
        'Zero employee health records, SSNs, or salary matrices may be stored in indexed workspace databases.',
        'Must utilize Enterprise plan with enterprise SSO and auditing enabled.',
      ],
      reviewedBy: 'AI Program Lead',
      reviewedDate: '2026-09-02',
    },
  },
];
