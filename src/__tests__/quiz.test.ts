// src/__tests__/quiz.test.ts
// Justification: Unit and pedagogical scenario tests for the Acceptable Use Knowledge Check per PRD Section 8.

import { describe, it, expect } from 'vitest';
// Justification: Vitest test methods.

import { QUIZ_QUESTIONS } from '../data/quiz_questions.js';
// Justification: The quiz scenario dataset.

describe('Acceptable Use Knowledge Check Scenarios (PRD Section 8)', () => {
  it('contains at least 6 situation-based questions with single correct answers and explanations', () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(6);

    QUIZ_QUESTIONS.forEach((q) => {
      expect(q.scenario.length).toBeGreaterThan(15);
      expect(q.question.length).toBeGreaterThan(10);
      expect(q.options.length).toBeGreaterThanOrEqual(3);

      const correctOptions = q.options.filter((o) => o.isCorrect);
      expect(correctOptions.length).toBe(1);

      q.options.forEach((opt) => {
        expect(opt.explanation.length).toBeGreaterThan(10);
      });

      expect(q.keyTakeaway.length).toBeGreaterThan(10);
    });
  });

  it('includes the mandatory cardinal scenario: tool approval is not data approval', () => {
    const cardinalQuestion = QUIZ_QUESTIONS.find((q) =>
      q.question.includes('Since Microsoft Copilot is an approved enterprise tool')
    );
    expect(cardinalQuestion).toBeDefined();

    const correctOption = cardinalQuestion?.options.find((o) => o.isCorrect);
    expect(correctOption?.text).toContain('Tool approval is not data approval');
    expect(cardinalQuestion?.keyTakeaway).toContain('Tool approval is not data approval');
  });

  it('reinforces placeholder drafting over pasting real customer financial data', () => {
    const q1 = QUIZ_QUESTIONS[0];
    const correctOpt = q1.options.find((o) => o.isCorrect);
    expect(correctOpt?.text).toContain('A generalized template prompt with placeholders');
  });
});
