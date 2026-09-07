import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { LearnerDashboard } from './components/LearnerDashboard'
import { AIAssistantWidget } from './components/AIAssistantWidget'
import { AdminAnalyticsDashboard } from './components/AdminAnalyticsDashboard'
import { DocUploadModal } from './components/DocUploadModal'
import { QuizReviewEditor } from './components/QuizReviewEditor'
import { Login } from './components/Login'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8 items-center">
                <span className="text-xl font-bold text-blue-600">AI Skill Platform</span>
                <Link to="/learner" className="text-gray-700 hover:text-blue-600 font-medium">Learner Portal</Link>
                <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium">Admin Portal</Link>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium text-sm border-l pl-4 border-gray-300">Login</Link>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="flex-1 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/learner" element={<LearnerDashboard />} />
            <Route path="/admin" element={<AdminAnalyticsDashboard />} />
            <Route path="/admin/generate" element={<DocUploadModal competencies={[{id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'Python'}]} onClose={() => {}} onSuccess={() => {}} />} />
            <Route path="/" element={
              <div className="text-center mt-20">
                <h1 className="text-4xl font-black text-gray-900 mb-6">Welcome to AI Skill Intelligence</h1>
                <div className="space-x-4">
                  <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition inline-block shadow-sm">Sign In to Continue</Link>
                </div>
              </div>
            } />
          </Routes>
        </main>
        
        <AIAssistantWidget />
      </div>
    </BrowserRouter>
  )
}

export default App
