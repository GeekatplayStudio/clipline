// src/components/quiz/KnowledgeCheck.tsx
// Justification: Companion Acceptable Use Knowledge Check implementing PRD Section 8 situation-based pedagogy.

import React, { useState } from 'react';
// Justification: React hooks for question index and scoring state.

import { QUIZ_QUESTIONS, QuizQuestion } from '../../data/quiz_questions.js';
// Justification: Scenario questions and pedagogical explanations.

import { BookOpen, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, HelpCircle } from 'lucide-react';
// Justification: Icons for enterprise visual clarity.

interface KnowledgeCheckProps {
  onComplete?: (score: number) => void;
}

export const KnowledgeCheck: React.FC<KnowledgeCheckProps> = ({ onComplete }) => {
  // Justification: Current question index in scenario chain.
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Justification: Selected answer index for current question.
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Justification: Boolean indicating whether user confirmed answer and revealed feedback.
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Justification: Running score of correctly answered scenarios.
  const [score, setScore] = useState<number>(0);

  // Justification: Flag indicating whether user completed all questions.
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentQuestion: QuizQuestion = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (idx: number) => {
    if (!isSubmitted) {
      setSelectedOption(idx);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    if (currentQuestion.options[selectedOption].isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsCompleted(true);
      if (onComplete) {
        onComplete(score);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="max-w-2xl mx-auto my-6 bg-white border border-slate-300 rounded shadow-sm">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-slate-800" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Acceptable Use Knowledge Check</h2>
            <p className="text-xs text-slate-500">
              Situational Scenarios: Applying AI Policy in Daily Practice
            </p>
          </div>
        </div>
        {!isCompleted && (
          <div className="text-xs font-mono font-bold bg-slate-200 text-slate-800 px-2.5 py-1 rounded">
            Question {currentIndex + 1} / {QUIZ_QUESTIONS.length}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {!isCompleted && (
        <div className="w-full bg-slate-200 h-1">
          <div
            className="bg-slate-900 h-1 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>
      )}

      <div className="p-6">
        {!isCompleted ? (
          <div className="space-y-5 text-xs">
            {/* The Situation Scenario Card */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                Scenario Context
              </span>
              <p className="text-slate-900 font-medium leading-relaxed text-sm">
                "{currentQuestion.scenario}"
              </p>
            </div>

            {/* The Dilemma Question */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-slate-600" />
                <span>{currentQuestion.question}</span>
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  let optionStyles = 'border-slate-300 hover:bg-slate-50';

                  if (isSubmitted) {
                    if (opt.isCorrect) {
                      optionStyles = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium';
                    } else if (isSelected && !opt.isCorrect) {
                      optionStyles = 'bg-rose-50 border-rose-400 text-rose-950';
                    } else {
                      optionStyles = 'border-slate-200 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    optionStyles = 'bg-slate-100 border-slate-900 font-medium text-slate-900';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`border rounded p-3 cursor-pointer transition-colors flex items-start space-x-3 ${optionStyles}`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isSubmitted ? (
                          opt.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isSelected ? (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300" />
                          )
                        ) : (
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-slate-900 bg-slate-900' : 'border-slate-400'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        )}
                      </div>
                      <span className="leading-relaxed flex-1">{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback on answer submitted */}
            {isSubmitted && selectedOption !== null && (
              <div
                className={`p-4 rounded border text-xs space-y-2 animate-fadeIn ${
                  currentQuestion.options[selectedOption].isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  {currentQuestion.options[selectedOption].isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Correct Analysis</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-700" />
                      <span>Policy Correction</span>
                    </>
                  )}
                </div>
                <p className="leading-relaxed">{currentQuestion.options[selectedOption].explanation}</p>
                <div className="pt-2 border-t border-slate-200/60 font-semibold text-[11px] text-slate-800">
                  Key Principle: {currentQuestion.keyTakeaway}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              {!isSubmitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className={`px-4 py-1.5 rounded text-xs font-semibold ${
                    selectedOption !== null
                      ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 flex items-center space-x-1.5"
                >
                  <span>{currentIndex + 1 < QUIZ_QUESTIONS.length ? 'Next Scenario' : 'View Results'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Final Results Screen per PRD Section 8 */
          <div className="text-center py-6 space-y-4 text-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6 text-amber-500" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Acceptable Use Knowledge Check Complete</h3>

            <div className="text-2xl font-extrabold font-mono text-slate-900">
              {score} / {QUIZ_QUESTIONS.length} Scenarios Mastered
            </div>

            <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
              {score === QUIZ_QUESTIONS.length
                ? 'Outstanding. You have demonstrated clear mastery of Upbound enterprise data boundary and workflow classification standards.'
                : 'Good review. Remember: tool approval is never data approval, and workflows that influence customer accounts without human review always require high-tier governance.'}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded p-4 text-left max-w-lg mx-auto space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                The 3 Cardinal Rules to Remember:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li>
                  <strong>Tool approval is not data approval.</strong> An enterprise license does not permit
                  uploading unredacted customer banking or credit data.
                </li>
                <li>
                  <strong>Risk tier is derived, not self-selected.</strong> Answer what the workflow touches;
                  let the system classify the compliance controls.
                </li>
                <li>
                  <strong>Customer-affecting decisions require governance.</strong> Workflows with zero human
                  review touching billing or servicing trigger high-tier review.
                </li>
              </ul>
            </div>

            <div className="pt-4 flex justify-center space-x-3">
              <button
                onClick={handleRestart}
                className="px-4 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Check</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
