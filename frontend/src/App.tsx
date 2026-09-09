import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import LoginView from '@/views/LoginView';
import Sidebar, { type TabId } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import PathwayView from '@/views/PathwayView';
import QuizView from '@/views/QuizView';
import { LearnerDashboard } from '@/components/LearnerDashboard';
import { AdminAnalyticsDashboard } from '@/components/AdminAnalyticsDashboard';
import { AIAssistantWidget } from '@/components/AIAssistantWidget';
import { SkillAssessment } from '@/components/SkillAssessment';
import { fetchBaselineDiagnostic, fetchQuizQuestions, fetchAvailableAssessments } from '@/api/learner';
import { QuizQuestionPublic } from '@/types';
import { Sparkles, ShieldAlert, PlayCircle, Award, Target, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Shell() {
  const { user, loading, updateUser } = useAuth();
  const [tab, setTab] = useState<TabId>('profile');
  const { t, i18n } = useTranslation();
  const isHi = i18n?.language?.startsWith('hi') ?? false;

  // Diagnostic State
  const [showDiagnosticPrompt, setShowDiagnosticPrompt] = useState(false);
  const [diagnosticQuizId, setDiagnosticQuizId] = useState<string | null>(null);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<QuizQuestionPublic[]>([]);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  useEffect(() => {
    const handleTabChange = (e: any) => {
      if (e.detail) {
        setTab(e.detail as TabId);
      }
    };
    window.addEventListener('change-app-tab', handleTabChange);
    return () => window.removeEventListener('change-app-tab', handleTabChange);
  }, []);

  // Detect mandatory diagnostic state for fresh registrations
  useEffect(() => {
    if (user && user.appRole === 'learner' && !user.has_completed_diagnostic) {
      setShowDiagnosticPrompt(true);
    } else {
      setShowDiagnosticPrompt(false);
    }
  }, [user?.appRole, user?.has_completed_diagnostic]);

  const handleStartDiagnostic = async () => {
    setDiagnosticLoading(true);
    try {
      let qId = '';
      try {
        const diagInfo = await fetchBaselineDiagnostic();
        qId = diagInfo.id;
      } catch (err) {
        const avail = await fetchAvailableAssessments();
        if (avail.length > 0) {
          qId = avail[0].id;
        }
      }

      if (qId) {
        const qs = await fetchQuizQuestions(qId);
        setDiagnosticQuizId(qId);
        setDiagnosticQuestions(qs);
      } else {
        alert(isHi ? 'डायग्नोस्टिक प्रश्न लोड नहीं हो सके।' : 'Could not load diagnostic questions.');
      }
    } catch (e) {
      console.error(e);
      alert(isHi ? 'डायग्नोस्टिक लोड करने में त्रुटि।' : 'Error loading diagnostic.');
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleDiagnosticComplete = () => {
    if (updateUser) {
      updateUser({ has_completed_diagnostic: true });
    }
    setDiagnosticQuizId(null);
    setShowDiagnosticPrompt(false);
    setTab('pathway');
  };

  if (loading) {
    if (!localStorage.getItem('token')) {
      return <LoginView />;
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="flex items-center gap-3 text-ink-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          <span className="text-sm font-medium">Loading StatCompetency AI...</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginView />;

  // Admins land on analytics; learners land on profile.
  const effectiveTab = user.appRole === 'admin' && tab === 'profile' ? 'admin' : tab;

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar active={effectiveTab} onChange={setTab} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar active={effectiveTab} onChange={setTab} />
        <main className="flex-1 px-5 py-6 lg:px-8 relative">
          
          {/* Mandatory Baseline Diagnostic Intercept Modal */}
          {showDiagnosticPrompt && !diagnosticQuizId && (
            <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 text-center relative overflow-hidden border border-amber-200">
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
                
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-100 text-amber-700 mb-5 shadow-inner">
                  <Sparkles className="h-8 w-8 text-amber-600" />
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
                  {isHi ? 'अनिवार्य प्रारंभिक आधारभूत मूल्यांकन' : 'Mandatory Baseline Competency Diagnostic'}
                </div>

                <h2 className="text-2xl font-black text-gray-900 leading-snug">
                  {isHi 
                    ? `स्वागत है! ${user.jobRole || 'सांख्यिकीय अधिकारी'} प्रारंभिक क्षमता मूल्यांकन` 
                    : `Welcome! Mandatory ${user.jobRole || 'Official'} Baseline Diagnostic`}
                </h2>

                <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                  {isHi 
                    ? 'अपनी भूमिका के अनुरूप व्यक्तिगत शिक्षण पथ व कौशल अंतराल बेंचमार्क सक्रिय करने के लिए यह 5 मिनट का प्रारंभिक मूल्यांकन पूरा करें।'
                    : 'To calibrate your role competency benchmarks and generate AI course recommendations, please complete this initial baseline assessment.'}
                </p>

                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-gray-100 text-left space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2 font-semibold text-gray-800">
                    <Target size={15} className="text-blue-600" />
                    <span>{isHi ? 'लक्षित कैडर:' : 'Target Role'}: {user.jobRole || 'Senior Statistical Officer'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={15} className="text-amber-500" />
                    <span>{isHi ? 'समय अवधि: 5-10 मिनट (5 बहुविकल्पीय प्रश्न)' : 'Duration: 5-10 Mins (5 Role-Specific MCQs)'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-emerald-500" />
                    <span>{isHi ? 'परिणाम: स्वचालित व्यक्तिगत शिक्षण पथ निर्माण' : 'Outcome: Instant Personalized Course Pathways'}</span>
                  </div>
                </div>

                <button
                  onClick={handleStartDiagnostic}
                  disabled={diagnosticLoading}
                  className="mt-7 w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-sm"
                >
                  <PlayCircle size={18} />
                  <span>
                    {diagnosticLoading 
                      ? (isHi ? 'प्रश्नावली तैयार की जा रही है...' : 'Calibrating Diagnostic...') 
                      : (isHi ? 'आधारभूत मूल्यांकन अभी प्रारंभ करें' : 'Start Baseline Diagnostic Now')}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Active Diagnostic Quiz View */}
          {diagnosticQuizId && diagnosticQuestions.length > 0 && (
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-50 overflow-y-auto p-4 flex items-center justify-center">
              <div className="w-full max-w-3xl">
                <SkillAssessment
                  quizId={diagnosticQuizId}
                  questions={diagnosticQuestions}
                  onClose={() => {
                    setDiagnosticQuizId(null);
                  }}
                  onComplete={handleDiagnosticComplete}
                  onNavigatePathway={() => {
                    handleDiagnosticComplete();
                  }}
                />
              </div>
            </div>
          )}

          <div key={effectiveTab} className="animate-fadeIn">
            {effectiveTab === 'profile' && <LearnerDashboard />}
            {effectiveTab === 'pathway' && <PathwayView />}
            {effectiveTab === 'quiz' && <QuizView />}
            {effectiveTab === 'admin' && <AdminAnalyticsDashboard />}
          </div>
          <AIAssistantWidget />
        </main>
        <footer className="px-5 py-4 border-t border-ink-200 text-center text-[11px] text-ink-400 lg:px-8">
          StatCompetency AI - AI Skill Intelligence &amp; Competency Platform - Integrated
          with iGOT Karmayogi &amp; NSSTA - For Official Statistics
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

export default App;
