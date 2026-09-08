import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { DocUploadModal } from '@/components/DocUploadModal';
import { QuizReviewEditor } from '@/components/QuizReviewEditor';
import { SkillAssessment } from '@/components/SkillAssessment';
import { fetchAvailableAssessments, fetchQuizQuestions } from '@/api/learner';
import { QuizAvailable, QuizQuestionPublic } from '@/types';
import { PlusCircle, PlayCircle, BookOpen, Clock, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function QuizView() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isHi = i18n?.language?.startsWith('hi') ?? false;
  
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
      alert(isHi ? 'प्रश्नोत्तरी लोड करने में विफल।' : 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.appRole === 'admin') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('quiz_management.title')}</h2>
            <p className="text-gray-500 mt-1 text-sm">{t('quiz_management.subtitle')}</p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center space-x-2 shadow-sm transition"
          >
            <PlusCircle size={20} />
            <span>{t('quiz_management.generateNew')}</span>
          </button>
        </div>

        {reviewQuizId ? (
          <QuizReviewEditor 
            quizId={reviewQuizId} 
            onPublished={() => setReviewQuizId(null)} 
          />
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm text-gray-500">
            {isHi ? 'वर्तमान में कोई क्विज़ समीक्षाधीन नहीं है। नया क्विज़ बनाने के लिए ऊपर दिए गए बटन पर क्लिक करें!' : 'No quiz is currently being reviewed. Click the button above to generate a new one!'}
          </div>
        )}

        {showUploadModal && (
          <DocUploadModal 
            competencies={[{id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'Survey Sampling & Estimation'}, {id: '4f6a9e8b-3c2d-1a9b-8e7c-6d5b4a3f2e1d', name: 'National Accounts'}]} 
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <BookOpen size={26} className="text-blue-600" />
          <span>{t('quizzes.title')}</span>
        </h2>
        <p className="text-gray-500 mt-1 text-sm">{t('quizzes.subtitle')}</p>
      </div>

      {loading ? (
        <div className="text-center p-12">
          <div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <div className="text-gray-500 text-sm">{isHi ? 'मूल्यांकन लोड हो रहे हैं...' : 'Loading assessments...'}</div>
        </div>
      ) : assessments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm text-gray-500">
          {t('quizzes.noAssessments')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map(q => (
            <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                    {q.difficulty || 'Intermediate'}
                  </span>
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Award size={14} className="text-amber-500" /> {q.passing_score}% {t('quizzes.passingScore')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">{q.title}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{q.description || 'Evaluate role competencies and identify learning needs.'}</p>
              </div>
              <button 
                onClick={() => handleStartQuiz(q.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold flex justify-center items-center space-x-2 transition shadow-sm"
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