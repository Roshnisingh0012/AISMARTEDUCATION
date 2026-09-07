import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import LoginView from '@/views/LoginView';
import Sidebar, { type TabId } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import PathwayView from '@/views/PathwayView';
import QuizView from '@/views/QuizView';
import { LearnerDashboard } from '@/components/LearnerDashboard';
import { AdminAnalyticsDashboard } from '@/components/AdminAnalyticsDashboard';
import { AIAssistantWidget } from '@/components/AIAssistantWidget';

function Shell() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<TabId>('profile');

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
