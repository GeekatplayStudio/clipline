// src/data/quiz_questions.ts
// Justification: Companion Acceptable Use quiz scenarios implementing PRD Section 8 situation-based pedagogy.

export interface QuizQuestion {
  // Justification: Question unique identifier.
  id: number;
  // Justification: Realistic situation narrative.
  scenario: string;
  // Justification: The direct actionable dilemma question.
  question: string;
  // Justification: Multiple choice options.
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  // Justification: Key takeaway principle reinforcing company policy.
  keyTakeaway: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario: "You're finishing a customer's lease modification in Acima and want help drafting the confirmation SMS message.",
    question: 'Which of the following can you paste into an approved generative AI tool?',
    options: [
      {
        text: 'The full customer record including name, phone number, and modified lease balance so the model has complete context.',
        isCorrect: false,
        explanation: 'Incorrect. Customer PII and financial account balances cannot be pasted into general prompt tools without explicit security tokenization and tier approval.',
      },
      {
        text: 'A generalized template prompt with placeholders like [Customer Name] and [New Payment Amount] without real customer data.',
        isCorrect: true,
        explanation: 'Correct! Generalizing templates and using mock placeholders ensures zero customer PII leaves your authorized core systems.',
      },
      {
        text: 'The customer account number and payment schedule, as long as you delete their first and last name.',
        isCorrect: false,
        explanation: 'Incorrect. Account numbers and specific dollar balance histories remain sensitive financial data that can be re-identified.',
      },
    ],
    keyTakeaway: 'Draft templates with mock placeholders; never paste real customer financial data into prompt windows.',
  },
  {
    id: 2,
    scenario: "Your department manager gave your team licensed seats for Microsoft Copilot with enterprise tenant data protection enabled.",
    question: 'Since Microsoft Copilot is an approved enterprise tool, can you use it to summarize unredacted customer bank statements for credit verification?',
    options: [
      {
        text: 'Yes, because Copilot is an enterprise-approved tool with a corporate tenant agreement.',
        isCorrect: false,
        explanation: 'Incorrect! This is the most common mistake in enterprise AI: Tool approval is NOT data approval. Copilot may be licensed, but customer bank statements are Tier 3/4 data requiring credit risk and legal sign-off.',
      },
      {
        text: 'No. Tool approval is not data approval. Processing customer financial and credit data requires explicit workflow registration and governance review.',
        isCorrect: true,
        explanation: 'Spot on! Tool approval only approves the container. What you feed into it is governed separately by data classification policies.',
      },
      {
        text: 'Yes, as long as you do not share the generated summary with anyone outside your immediate team.',
        isCorrect: false,
        explanation: 'Incorrect. Restricting the output audience does not negate the initial processing of restricted consumer credit data.',
      },
    ],
    keyTakeaway: 'Tool approval is not data approval. A licensed tool does not grant permission to ingest credit or banking records.',
  },
  {
    id: 3,
    scenario: 'You are writing an automation script in Python that calls an OpenAI API to analyze customer churn feedback, and you test it using your personal API key on your work laptop.',
    question: 'What is the compliance violation in this scenario?',
    options: [
      {
        text: 'There is no violation as long as the Python code is open source.',
        isCorrect: false,
        explanation: 'Incorrect. Using personal consumer API keys sends corporate data outside the enterprise boundary.',
      },
      {
        text: 'Using a personal API key routes company data to a consumer endpoint without Upbound enterprise tenant privacy guarantees, causing data egress outside our tenant.',
        isCorrect: true,
        explanation: 'Correct! Personal API accounts retain data for model training and lack business associate or enterprise confidentiality terms.',
      },
      {
        text: 'Python scripts are prohibited from using AI endpoints in general.',
        isCorrect: false,
        explanation: 'Incorrect. Python scripts are permitted when using enterprise-managed credentials and registered in Tier 2/3.',
      },
    ],
    keyTakeaway: 'Never use personal AI credentials; always use enterprise-managed endpoints that enforce tenant zero-data-retention.',
  },
  {
    id: 4,
    scenario: 'You built a Power Automate flow that reads regional store appliance inventory and automatically emails store managers restocking alerts.',
    question: 'What risk tier does this workflow belong to, and does it require pre-deployment legal review?',
    options: [
      {
        text: 'Tier 1 Low risk; auto-approved and logged without requiring legal review.',
        isCorrect: true,
        explanation: 'Correct! Internal non-sensitive inventory metrics with operational team audience qualify for Tier 1 low-friction approval.',
      },
      {
        text: 'Tier 3 High risk; requires General Counsel and Information Security sign-off.',
        isCorrect: false,
        explanation: 'Incorrect. Routine internal inventory logistics do not touch consumer PII or credit decisions.',
      },
      {
        text: 'Tier 4 Prohibited; automated emails are forbidden across all stores.',
        isCorrect: false,
        explanation: 'Incorrect. Internal operational notifications are encouraged under citizen developer automation guidelines.',
      },
    ],
    keyTakeaway: 'Low-risk operational automations enjoy a low-friction, auto-approved registration path.',
  },
  {
    id: 5,
    scenario: 'An analyst creates an automated prompt to screen incoming customer hardship letters and automatically approve or deny fee waivers without human review.',
    question: 'Why does this workflow trigger Tier 3 or Tier 4 governance review?',
    options: [
      {
        text: 'Because automated decisioning that affects customer accounts or fees with zero human review introduces legal liability and regulatory exposure.',
        isCorrect: true,
        explanation: 'Correct! Any customer-affecting financial or account decision with "None" human review creates severe regulatory risk under consumer protection laws.',
      },
      {
        text: 'Because prompt workflows cannot be run more than once per day.',
        isCorrect: false,
        explanation: 'Incorrect. Frequency is not the governance trigger; decision influence and human oversight are.',
      },
      {
        text: 'Only because it was built by an analyst rather than a software engineer.',
        isCorrect: false,
        explanation: 'Incorrect. Governance rules evaluate the risk of the workflow, not the job title of the creator.',
      },
    ],
    keyTakeaway: 'Workflows influencing customer accounts without human review always require high-tier governance.',
  },
  {
    id: 6,
    scenario: 'You want to translate promotional retail signage copy from English into Spanish for stores in Mexico using Google Gemini.',
    question: 'What is the appropriate handling for this workflow?',
    options: [
      {
        text: 'Prohibited because Google Gemini is a public tool.',
        isCorrect: false,
        explanation: 'Incorrect. Marketing signage copy is public company information.',
      },
      {
        text: 'Tier 1 Low risk: Public marketing material translated with human in-store review before printing is safe and low-risk.',
        isCorrect: true,
        explanation: 'Correct! Public marketing copy poses no privacy or financial risk. Human review before printing ensures idiomatic quality.',
      },
      {
        text: 'Tier 3 High risk because cross-border data transfer laws apply to marketing slogans.',
        isCorrect: false,
        explanation: 'Incorrect. Non-sensitive public marketing text is not subject to cross-border PII restrictions.',
      },
    ],
    keyTakeaway: 'Public marketing content with human-in-the-loop review is the ideal Tier 1 citizen developer use case.',
  },
];
