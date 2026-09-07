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
}

export const SkillAssessment: React.FC<Props> = ({ quizId, questions, onClose, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 min per question
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultResponse | null>(null);
  const { t, i18n } = useTranslation();

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  
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
      alert('Failed to submit assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return <AssessmentResultModal result={result} onClose={onClose} />;
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{t('quiz_runner.skillAssessment')}</h2>
        <div className="flex items-center text-red-600 font-mono font-medium bg-red-50 px-3 py-1 rounded-full">
          <Clock size={16} className="mr-2" />
          {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{t('quiz_runner.question')} {currentIndex + 1} {t('quiz_runner.of')} {questions.length}</span>
          <span>{Math.round(progress)}% {t('quiz_runner.completed')}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 min-h-[200px]">
        <h3 className="text-xl font-medium text-gray-900 mb-6">
          {isHi && currentQ.question_text_hi ? currentQ.question_text_hi : currentQ.question_text}
        </h3>
        <div className="space-y-3">
          {(isHi && currentQ.options_hi ? currentQ.options_hi : currentQ.options).map((opt, idx) => (
            <label 
              key={idx} 
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${
                answers[currentQ.id] === idx ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input 
                type="radio" 
                name={`q-${currentQ.id}`} 
                className="w-5 h-5 text-blue-600"
                checked={answers[currentQ.id] === idx}
                onChange={() => handleSelect(idx)}
              />
              <span className="ml-3 text-gray-800">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between border-t pt-6">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-6 py-2 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center"
        >
          <ChevronLeft size={18} className="mr-1" /> {t('quiz_runner.previous')}
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length !== questions.length}
            className="px-6 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? '...' : <><Send size={18} className="mr-2" /> {t('quiz_runner.submitAssessment')}</>}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center"
          >
            {t('quiz_runner.next')} <ChevronRight size={18} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};
