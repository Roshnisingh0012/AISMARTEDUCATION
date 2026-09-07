import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { DocUploadModal } from '@/components/DocUploadModal';
import { QuizReviewEditor } from '@/components/QuizReviewEditor';
import { SkillAssessment } from '@/components/SkillAssessment';
import { fetchAvailableAssessments, fetchQuizQuestions } from '@/api/learner';
import { QuizAvailable, QuizQuestionPublic } from '@/types';
import { PlusCircle, PlayCircle, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function QuizView() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Admin State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reviewQuizId, setReviewQuizId] = useState<string | null>(null);

  // Learner State
  const [assessments, setAssessments] = useState<QuizAvailable[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionPublic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.appRole !== 'admin' && !activeQuizId) {
      setLoading(true);
      fetchAvailableAssessments()
        .then(setAssessments)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user?.appRole, activeQuizId]);

  const handleStartQuiz = async (quizId: string) => {
    setLoading(true);
    try {
      const qs = await fetchQuizQuestions(quizId);
      setQuestions(qs);
      setActiveQuizId(quizId);
    } catch (e) {
      console.error(e);
      alert('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.appRole === 'admin') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('quiz_management.title')}</h2>
            <p className="text-gray-500 mt-1">{t('quiz_management.subtitle')}</p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <PlusCircle size={20} />
            <span>Generate New Quiz</span>
          </button>
        </div>

        {reviewQuizId ? (
          <QuizReviewEditor 
            quizId={reviewQuizId} 
            onPublished={() => setReviewQuizId(null)} 
          />
        ) : (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm text-gray-500">
            No quiz is currently being reviewed. Click the button above to generate a new one!
          </div>
        )}

        {showUploadModal && (
          <DocUploadModal 
            competencies={[{id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'Python'}, {id: '4f6a9e8b-3c2d-1a9b-8e7c-6d5b4a3f2e1d', name: 'Data Science'}]} 
            onClose={() => setShowUploadModal(false)}
            onSuccess={(qId) => {
              setShowUploadModal(false);
              setReviewQuizId(qId);
            }}
          />
        )}
      </div>
    );
  }

  // Learner View
  if (activeQuizId && questions.length > 0) {
    return (
      <SkillAssessment 
        quizId={activeQuizId} 
        questions={questions} 
        onClose={() => setActiveQuizId(null)} 
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <BookOpen size={24} className="text-blue-600" />
          <span>{t('quizzes.title')}</span>
        </h2>
        <p className="text-gray-500 mt-1">{t('quizzes.subtitle')}</p>
      </div>

      {loading ? (
        <div className="text-center p-12"><div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : assessments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm text-gray-500">
          No assessments are currently available for you.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map(q => (
            <div key={q.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{q.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{q.description}</p>
              <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-4">
                <span>{q.difficulty}</span>
                <span>{q.passing_score}% {t('quizzes.passingScore')}</span>
              </div>
              <button 
                onClick={() => handleStartQuiz(q.id)}
                className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 rounded-lg font-bold flex justify-center items-center space-x-2 transition"
              >
                <PlayCircle size={18} />
                <span>{t('quizzes.startAssessment')}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
