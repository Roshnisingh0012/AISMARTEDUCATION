import React, { useState, useEffect } from 'react';
import { QuizQuestionPublic, AnswerSubmission, QuizResultResponse } from '../types';
import { submitQuiz } from '../api/learner';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Send, Clock } from 'lucide-react';
import { AssessmentResultModal } from './AssessmentResultModal';

interface Props {
  quizId: string;
  questions: QuizQuestionPublic[];
  onClose: () => void;
  onComplete?: () => void;
  onNavigatePathway?: () => void;
}

export const SkillAssessment: React.FC<Props> = ({ 
  quizId, 
  questions, 
  onClose, 
  onComplete,
  onNavigatePathway 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 min per question
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultResponse | null>(null);
  const { t, i18n } = useTranslation();

  const currentQ = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  
  const isHi = i18n?.language?.startsWith('hi') ?? false;

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelect = (idx: number) => {
    setAnswers({ ...answers, [currentQ.id]: idx });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const submission: AnswerSubmission[] = Object.entries(answers).map(([qId, idx]) => ({
      question_id: qId,
      selected_option_index: idx
    }));
    try {
      const res = await submitQuiz(quizId, submission);
      setResult(res);
      if (onComplete) onComplete();
    } catch (e) {
      console.error(e);
      alert(isHi ? 'मूल्यांकन सबमिट करने में विफल।' : 'Failed to submit assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <AssessmentResultModal 
        result={result} 
        onClose={onClose} 
        onNavigatePathway={onNavigatePathway} 
      />
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-4 border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('quiz_runner.skillAssessment')}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isHi ? 'प्रश्नों का उत्तर दें व अपनी दक्षता का मूल्यांकन करें' : 'Answer all questions to map your proficiency'}
          </p>
        </div>
        <div className="flex items-center text-rose-600 font-mono font-bold bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-full text-sm shadow-sm">
          <Clock size={16} className="mr-1.5" />
          {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 font-semibold mb-2">
          <span>{t('quiz_runner.question')} {currentIndex + 1} {t('quiz_runner.of')} {questions.length}</span>
          <span>{Math.round(progress)}% {t('quiz_runner.completed')}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 min-h-[200px]">
        <h3 className="text-lg font-bold text-gray-900 mb-5 leading-relaxed">
          {isHi && currentQ.question_text_hi ? currentQ.question_text_hi : currentQ.question_text}
        </h3>
        <div className="space-y-3">
          {(isHi && currentQ.options_hi ? currentQ.options_hi : currentQ.options).map((opt, idx) => (
            <label 
              key={idx} 
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${
                answers[currentQ.id] === idx 
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm' 
                  : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <input 
                type="radio" 
                name={`q-${currentQ.id}`} 
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                checked={answers[currentQ.id] === idx}
                onChange={() => handleSelect(idx)}
              />
              <span className="ml-3 text-sm font-medium text-gray-800">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between border-t border-gray-100 pt-5">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-5 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center transition"
        >
          <ChevronLeft size={16} className="mr-1" /> {t('quiz_runner.previous')}
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length !== questions.length}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 flex items-center shadow transition"
          >
            {isSubmitting ? '...' : <><Send size={15} className="mr-1.5" /> {t('quiz_runner.submitAssessment')}</>}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center shadow transition"
          >
            {t('quiz_runner.next')} <ChevronRight size={16} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};
