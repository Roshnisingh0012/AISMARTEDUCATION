import React, { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '../api/learner';
import { DashboardSummary } from '../types';
import { AlertCircle, Target, BookOpen, CheckCircle } from 'lucide-react';

export const LearnerDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!summary) return <div className="p-8 text-center text-red-500">Failed to load dashboard</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Learner Dashboard</h1>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Target size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Overall Competency</p>
            <p className="text-2xl font-bold text-gray-900">{summary.overall_competency_avg.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600"><AlertCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Skill Gaps</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_skill_gaps_count}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-lg text-red-600"><AlertCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Critical Gaps</p>
            <p className="text-2xl font-bold text-gray-900">{summary.high_priority_gaps_count}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg text-green-600"><CheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed Quizzes</p>
            <p className="text-2xl font-bold text-gray-900">{summary.completed_assessments_count}</p>
          </div>
        </div>
      </div>

      {/* Recommended Courses Carousel/Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BookOpen className="mr-2" /> Top Recommended Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summary.recent_recommendations.map(course => (
            <div key={course.course_id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
              <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">{course.level}</span>
              <h3 className="font-bold text-lg mt-3 text-gray-800">{course.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{course.provider}</p>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 italic border-l-4 border-indigo-400">
                "{course.reason}"
              </div>
              <button 
                onClick={() => window.open(course.external_url || '#', '_blank')}
                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
              >
                Enroll Now
              </button>
            </div>
          ))}
          {summary.recent_recommendations.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-xl">
              No recommendations at this time. You're fully caught up!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
