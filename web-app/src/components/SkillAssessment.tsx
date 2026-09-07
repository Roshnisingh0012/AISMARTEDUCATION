import React, { useState, useEffect } from 'react';
import { QuizQuestionPublic, AnswerSubmission, QuizResultResponse } from '../types';
import { submitQuiz } from '../api/learner';
import { ChevronLeft, ChevronRight, Send, Clock } from 'lucide-react';
import { AssessmentResultModal } from './AssessmentResultModal';

interface Props {
  quizId: string;
  questions: QuizQuestionPublic[];
  onClose: () => void;
}

export const SkillAssessment: React.FC<Props> = ({ quizId, questions, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 min per question
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultResponse | null>(null);

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

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
        <h2 className="text-xl font-bold text-gray-800">Skill Assessment</h2>
        <div className="flex items-center text-red-600 font-mono font-medium bg-red-50 px-3 py-1 rounded-full">
          <Clock size={16} className="mr-2" />
          {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 min-h-[200px]">
        <h3 className="text-xl font-medium text-gray-900 mb-6">{currentQ.question_text}</h3>
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => (
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

      {/* Controls */}
      <div className="flex justify-between items-center border-t pt-6">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(i => i - 1)}
          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          <ChevronLeft size={20} className="mr-1" /> Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-70"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assessment'} <Send size={18} className="ml-2" />
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(i => i + 1)}
            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            Next <ChevronRight size={20} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};
