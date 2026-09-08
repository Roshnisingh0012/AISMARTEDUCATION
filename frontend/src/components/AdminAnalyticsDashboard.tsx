import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Users, BookOpen, TrendingUp, AlertTriangle, Download, X, Search, ArrowUpRight, ShieldCheck } from 'lucide-react';

const API_BASE = '/api/v1/admin/analytics';
const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

interface OfficerData {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  score: number;
  band: 'critical' | 'moderate' | 'proficient';
  domainScore: string;
  recommendedAction: string;
}

const SAMPLE_OFFICERS: OfficerData[] = [
  {
    id: '1',
    name: 'Ramesh Kumar',
    email: 'learner@gov.in',
    role: 'Senior Statistical Officer (SSO)',
    department: 'Field Operations Division (FOD, MoSPI)',
    score: 44.4,
    band: 'critical',
    domainScore: 'Survey Sampling: 39.2% | National Accounts: 42.0%',
    recommendedAction: 'Mandatory enrollment in National Accounts & Survey Sampling module'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'analyst@gov.in',
    role: 'Data Analyst & Statistical Officer',
    department: 'National Accounts Division (NAD)',
    score: 68.5,
    band: 'moderate',
    domainScore: 'Python for Stats: 70.0% | SQL Databases: 65.0%',
    recommendedAction: 'Targeted intermediate assessment in Time Series & Index Numbers'
  },
  {
    id: '3',
    name: 'Amit Verma',
    email: 'dev@gov.in',
    role: 'IT & Data Engineering Specialist',
    department: 'Computer Centre (MoSPI)',
    score: 82.0,
    band: 'proficient',
    domainScore: 'FastAPI Backend: 85.0% | React Frontend: 80.0%',
    recommendedAction: 'Approve as peer mentor & conduct advanced spatial analytics workshop'
  },
  {
    id: '4',
    name: 'Sunita Rao',
    email: 'sunita.rao@mospi.gov.in',
    role: 'Field Survey Officer',
    department: 'Survey Design & Research Division (SDRD)',
    score: 41.0,
    band: 'critical',
    domainScore: 'Field Data Quality: 40.0% | Estimation: 42.0%',
    recommendedAction: 'Immediate refresher on Digital Data Collection & Metadata Standards'
  },
  {
    id: '5',
    name: 'Rajesh Patel',
    email: 'rajesh.patel@mospi.gov.in',
    role: 'Assistant Director (Training)',
    department: 'National Statistical Systems Training Academy (NSSTA)',
    score: 88.0,
    band: 'proficient',
    domainScore: 'Official Statistics: 90.0% | Sampling: 86.0%',
    recommendedAction: 'Review and calibrate AI Assessment Studio question banks'
  },
  {
    id: '6',
    name: 'Meenakshi Iyer',
    email: 'm.iyer@mospi.gov.in',
    role: 'Junior Statistical Officer (JSO)',
    department: 'Economic Statistics Division (ESD)',
    score: 58.0,
    band: 'moderate',
    domainScore: 'Index Numbers: 55.0% | GDP Computation: 61.0%',
    recommendedAction: 'Enroll in NSSTA Index Number Compilation Workshop'
  }
];

export const AdminAnalyticsDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [demand, setDemand] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive Drilldown Modal State
  const [drilldownType, setDrilldownType] = useState<'learners' | 'competency' | 'assessments' | null>(null);
  const [filterBand, setFilterBand] = useState<'all' | 'critical' | 'moderate' | 'proficient'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { t, i18n } = useTranslation();
  const isHi = i18n?.language?.startsWith('hi') ?? false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oRes, dRes, sRes] = await Promise.all([
          axios.get(`${API_BASE}/overview`, getHeaders()),
          axios.get(`${API_BASE}/department-breakdown`, getHeaders()),
          axios.get(`${API_BASE}/skill-demand`, getHeaders())
        ]);
        setOverview(oRes.data);
        setDepartments(dRes.data);
        setDemand(sRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = () => {
    const dataStr = JSON.stringify({ overview, departments, demand, personnel: SAMPLE_OFFICERS }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workforce_analytics_report.json';
    link.click();
  };

  const filteredOfficers = SAMPLE_OFFICERS.filter((officer) => {
    const matchesFilter = filterBand === 'all' || officer.band === filterBand;
    const matchesSearch = officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          officer.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="p-12 text-center text-gray-500 font-medium">{isHi ? 'विश्लेषण डेटा लोड हो रहा है...' : 'Compiling Analytics Data...'}</div>;
  }
  if (!overview) {
    return <div className="p-12 text-center text-red-500 font-medium">{isHi ? 'एनालिटिक्स लोड करने में असमर्थ' : 'Failed to load analytics.'}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
          <p className="text-gray-500 mt-1">{t('admin.subtitle')}</p>
        </div>
        <button 
          onClick={handleExport} 
          className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition"
        >
          <Download size={18} className="mr-2" /> {t('admin.exportReport')}
        </button>
      </div>

      {/* Interactive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Learners */}
        <div 
          onClick={() => { setDrilldownType('learners'); setFilterBand('all'); }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:shadow-md hover:border-blue-300 transition group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-500 uppercase flex items-center">
              <Users size={18} className="mr-2 text-blue-600" /> {t('admin.totalLearners')}
            </span>
            <ArrowUpRight size={18} className="text-gray-400 group-hover:text-blue-600 transition" />
          </div>
          <span className="text-4xl font-black text-gray-900 mt-3">{overview.total_learners}</span>
          <span className="text-xs text-blue-600 font-semibold mt-2 flex items-center">
            {isHi ? '👆 विस्तृत अधिकारी सूची देखने हेतु क्लिक करें' : '👆 Click to drill down into officer roster'}
          </span>
        </div>

        {/* Card 2: Avg Competency */}
        <div 
          onClick={() => { setDrilldownType('competency'); setFilterBand('critical'); }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:shadow-md hover:border-green-300 transition group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-500 uppercase flex items-center">
              <TrendingUp size={18} className="mr-2 text-green-600" /> {t('admin.avgCompetency')}
            </span>
            <ArrowUpRight size={18} className="text-gray-400 group-hover:text-green-600 transition" />
          </div>
          <span className="text-4xl font-black text-blue-600 mt-3">{overview.average_org_competency.toFixed(1)}%</span>
          <span className="text-xs text-green-600 font-semibold mt-2 flex items-center">
            {isHi ? '👆 कौशल बैंड एवं जोखिम वितरण देखें' : '👆 Click to inspect competency bands'}
          </span>
        </div>

        {/* Card 3: Active Assessments */}
        <div 
          onClick={() => { setDrilldownType('assessments'); setFilterBand('all'); }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:shadow-md hover:border-indigo-300 transition group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-500 uppercase flex items-center">
              <BookOpen size={18} className="mr-2 text-indigo-600" /> {t('admin.activeAssessments')}
            </span>
            <ArrowUpRight size={18} className="text-gray-400 group-hover:text-indigo-600 transition" />
          </div>
          <span className="text-4xl font-black text-indigo-600 mt-3">{overview.active_assessments}</span>
          <span className="text-xs text-indigo-600 font-semibold mt-2 flex items-center">
            {isHi ? '👆 मूल्यांकन स्थिति एवं परिणाम देखें' : '👆 Click to inspect assessment logs'}
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <ShieldCheck className="text-blue-600 mr-2" size={20} /> {t('admin.deptBreakdown')}
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="avg_score" fill="#3b82f6" radius={[6, 6, 0, 0]} name={isHi ? 'औसत स्कोर (%)' : 'Avg Score (%)'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Demand Radar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <AlertTriangle className="text-orange-500 mr-2" size={20} /> {t('admin.trainingDemand')}
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={demand}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#4b5563', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar name={isHi ? 'कौशल अंतर का आकार (%)' : 'Skill Deficit (%)'} dataKey="gap_size" stroke="#f97316" fill="#fb923c" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Personnel Drilldown Modal */}
      {drilldownType && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="text-blue-600" size={22} />
                  {t('admin.drilldownTitle')}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isHi ? 'अधिकारियों का कैडर-वार दक्षता स्कोर और अनुशंसित प्रशिक्षण कार्रवाई' : 'Cadre-wise officer competency breakdown and targeted intervention actions'}
                </p>
              </div>
              <button 
                onClick={() => setDrilldownType(null)} 
                className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setFilterBand('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterBand === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {t('admin.filterAll')}
                </button>
                <button
                  onClick={() => setFilterBand('critical')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterBand === 'critical' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  🔴 {t('admin.filterCritical')}
                </button>
                <button
                  onClick={() => setFilterBand('moderate')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterBand === 'moderate' ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  🟡 {t('admin.filterModerate')}
                </button>
                <button
                  onClick={() => setFilterBand('proficient')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterBand === 'proficient' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  🟢 {t('admin.filterProficient')}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={isHi ? 'नाम या ईमेल खोजें...' : 'Search officer or email...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Drilldown Table */}
            <div className="overflow-y-auto p-4 flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pl-2">{t('admin.officerName')}</th>
                    <th className="pb-3">{t('admin.roleCadre')}</th>
                    <th className="pb-3">{t('admin.competencyBand')}</th>
                    <th className="pb-3">{t('admin.score')}</th>
                    <th className="pb-3 pr-2">{t('admin.recommendedAction')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredOfficers.map((officer) => (
                    <tr key={officer.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 pl-2">
                        <div className="font-bold text-gray-900">{officer.name}</div>
                        <div className="text-[11px] text-gray-500">{officer.email}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-gray-800">{officer.role}</div>
                        <div className="text-[11px] text-gray-500">{officer.department}</div>
                      </td>
                      <td className="py-3">
                        {officer.band === 'critical' && (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold">
                            🔴 {isHi ? 'गंभीर (<50%)' : 'Critical (<50%)'}
                          </span>
                        )}
                        {officer.band === 'moderate' && (
                          <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold">
                            🟡 {isHi ? 'मध्यम (50-75%)' : 'Moderate (50-75%)'}
                          </span>
                        )}
                        {officer.band === 'proficient' && (
                          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                            🟢 {isHi ? 'कुशल (>75%)' : 'Proficient (>75%)'}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="font-black text-sm text-gray-900">{officer.score.toFixed(1)}%</span>
                        <div className="text-[10px] text-gray-500 mt-0.5">{officer.domainScore}</div>
                      </td>
                      <td className="py-3 pr-2">
                        <span className="text-gray-700 bg-blue-50/70 border border-blue-100 rounded-lg px-2.5 py-1 inline-block">
                          {officer.recommendedAction}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredOfficers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        {isHi ? 'कोई अधिकारी नहीं मिला' : 'No officers match the selected filter criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setDrilldownType(null)} 
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl text-xs transition"
              >
                {t('admin.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
