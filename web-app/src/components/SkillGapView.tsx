import React, { useEffect, useState } from 'react';
import { fetchSkillGaps } from '../api/learner';
import { SkillGap } from '../types';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export const SkillGapView: React.FC = () => {
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillGaps()
      .then(setGaps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading skill gaps...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="mr-3 text-blue-600" /> Skill Gap Analysis
          </h1>
          <p className="text-gray-500 mt-2">Detailed breakdown of your current competencies vs required benchmarks.</p>
        </div>
      </div>

      <div className="space-y-6">
        {gaps.map((gap) => (
          <div key={gap.competency_id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{gap.competency_name}</h3>
                <span className={`inline-flex mt-2 text-xs font-bold px-2.5 py-1 rounded-full border ${getPriorityColor(gap.priority)}`}>
                  {gap.priority} PRIORITY
                </span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-gray-900">{gap.current_score.toFixed(1)}%</div>
                <div className="text-sm text-gray-500 font-medium">Target: {gap.benchmark_score.toFixed(1)}%</div>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="relative pt-4 pb-2">
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${gap.priority === 'HIGH' ? 'bg-red-500' : gap.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  style={{ width: `${Math.min(100, gap.current_score)}%` }}
                ></div>
              </div>
              {/* Benchmark Marker */}
              <div 
                className="absolute top-2 bottom-0 w-1 bg-blue-900 z-10 rounded-full"
                style={{ left: `${gap.benchmark_score}%` }}
                title="Benchmark Requirement"
              ></div>
            </div>

            {/* AI Reasoning */}
            <div className="mt-5 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-start">
              <TrendingUp className="text-indigo-600 mr-3 mt-1 shrink-0" size={20} />
              <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                {gap.ai_reasoning}
              </p>
            </div>
          </div>
        ))}
        {gaps.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-500">
            No competencies found. Start an assessment!
          </div>
        )}
      </div>
    </div>
  );
};
