import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchDashboardSummary } from '../api/learner';
import { DashboardSummary } from '../types';
import { AlertCircle, Target, CheckCircle, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

const DOMAIN_HI_MAP: Record<string, string> = {
  'Survey Sampling & Estimation': 'सर्वेक्षण नमूनाकरण (Survey Sampling)',
  'National Accounts & Official Stats': 'राष्ट्रीय लेखा (National Accounts)',
  'Python for Data Analysis': 'डेटा विश्लेषण पायथन (Python)',
  'Data Quality & Metadata Frameworks': 'डेटा गुणवत्ता ढांचा (Data Quality)',
  'SQL & Relational Databases': 'एसक्यूएल डेटाबेस (SQL)',
  'GIS & Spatial Data Processing': 'जीआईएस एवं स्थानिक डेटा (GIS)',
  'Frontend Development (React/TypeScript)': 'फ़्रंटएंड विकास (React)',
  'Backend API Architecture (FastAPI/Python)': 'बैकएंड एपीआई (FastAPI)',
  'Database Engineering (PostgreSQL/SQL)': 'डेटाबेस इंजीनियरिंग (PostgreSQL)'
};

export const LearnerDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const isHi = i18n?.language?.startsWith('hi') ?? false;

  useEffect(() => {
    fetchDashboardSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!summary) {
    return (
      <div className="p-8 text-center text-red-500">
        {isHi ? 'डैशबोर्ड डेटा लोड करने में असमर्थ' : 'Failed to load dashboard'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">{t('nav.dashboard')}</h1>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Target size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t('dashboard.avgCompetency')}</p>
            <p className="text-2xl font-bold text-gray-900">{summary.overall_competency_avg.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600"><AlertCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t('dashboard.activeGaps')}</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_skill_gaps_count}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-lg text-red-600"><AlertCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t('dashboard.criticalGaps')}</p>
            <p className="text-2xl font-bold text-gray-900">{summary.high_priority_gaps_count}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg text-green-600"><CheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t('dashboard.completedAssessments')}</p>
            <p className="text-2xl font-bold text-gray-900">{summary.completed_assessments_count}</p>
          </div>
        </div>
      </div>

      {/* Competency Breakdown & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown List */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-indigo-600" /> {t('dashboard.competencyBreakdown')}
          </h2>
          <div className="space-y-4">
            {summary.completed_assessments_count > 0 ? (
              (summary.skill_gaps || []).map((gap) => {
                const deficit = gap.current_score - gap.benchmark_score;
                const isProficient = deficit >= 0;
                const isCritical = gap.current_score < 50;
                
                let statusBadge = (
                  <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
                    {isHi ? '🟢 कुशल (>75%)' : '🟢 Proficient (>75%)'}
                  </span>
                );
                if (!isProficient) {
                  if (isCritical) {
                    statusBadge = (
                      <span className="text-xs font-bold px-2.5 py-1 bg-red-100 text-red-700 rounded-full">
                        {isHi ? '🔴 गंभीर अंतर (<50%)' : '🔴 Critical Gap (<50%)'}
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="text-xs font-bold px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                        {isHi ? '🟡 मध्यम अंतर (50-75%)' : '🟡 Moderate Gap (50-75%)'}
                      </span>
                    );
                  }
                }

                const displayName = isHi && DOMAIN_HI_MAP[gap.competency_name] 
                  ? DOMAIN_HI_MAP[gap.competency_name] 
                  : gap.competency_name;

                const scorePercent = Math.min(100, Math.max(0, gap.current_score));
                const barColor = isProficient ? 'bg-green-500' : isCritical ? 'bg-red-500' : 'bg-yellow-500';

                return (
                  <div key={gap.competency_id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{displayName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {isHi ? 'वर्तमान' : 'Current'}: {gap.current_score}% / {isHi ? 'लक्ष्य' : 'Target'}: {gap.benchmark_score}%
                        </p>
                      </div>
                      {statusBadge}
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-3">
                      <div 
                        className={`absolute top-0 left-0 h-full ${barColor}`} 
                        style={{ width: `${scorePercent}%` }}
                      />
                      <div 
                        className="absolute top-0 h-full border-r-2 border-indigo-900" 
                        style={{ left: `${gap.benchmark_score}%`, zIndex: 10 }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-gray-400">0%</span>
                      <span className={`font-semibold flex items-center ${isProficient ? 'text-green-600' : 'text-red-500'}`}>
                        {isProficient ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {deficit > 0 ? '+' : ''}{deficit.toFixed(1)}% {isProficient ? (isHi ? 'अधिशेष' : 'Surplus') : (isHi ? 'कमी' : 'Deficit')}
                      </span>
                      <span className="text-gray-400">100%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500">{t('dashboard.noData')}</div>
            )}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Target className="mr-2 h-5 w-5 text-indigo-600" /> {t('dashboard.skillProfileVsBenchmark')}
          </h2>
          <div className="flex-1 min-h-[350px]">
            {summary.completed_assessments_count > 0 && (summary.skill_gaps || []).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={summary.skill_gaps.map(g => ({
                  subject: isHi && DOMAIN_HI_MAP[g.competency_name] ? DOMAIN_HI_MAP[g.competency_name].split(' ')[0] : g.competency_name,
                  Actual: g.current_score,
                  Target: g.benchmark_score
                }))} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Radar name={isHi ? 'लक्षित बेंचमार्क' : 'Required Benchmark'} dataKey="Target" stroke="#818cf8" fill="#c7d2fe" fillOpacity={0.3} />
                  <Radar name={isHi ? 'आपका स्कोर' : 'Learner Score'} dataKey="Actual" stroke="#10b981" fill="#34d399" fillOpacity={0.5} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-center p-6">
                {t('dashboard.noData')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
