import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Users, BookOpen, TrendingUp, AlertTriangle, Download, X, Search, 
  ArrowUpRight, ShieldCheck, FileText, Printer, CheckCircle2, AlertCircle
} from 'lucide-react';

const API_BASE = '/api/v1/admin/analytics';
const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

interface OfficerData {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  role?: string;
  cadre?: string;
  job_role?: string;
  department: string;
  score?: number;
  current_score?: number;
  avg_score?: number;
  band?: string;
  competency_band?: string;
  domainScore?: string;
  recommendedAction?: string;
  recommended_action?: string;
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
  const [roleMetrics, setRoleMetrics] = useState<any>(null);
  const [officers, setOfficers] = useState<OfficerData[]>(SAMPLE_OFFICERS);
  const [loading, setLoading] = useState(true);
  
  // Interactive Drilldown Modal State
  const [drilldownType, setDrilldownType] = useState<'learners' | 'competency' | 'assessments' | null>(null);
  const [filterBand, setFilterBand] = useState<'all' | 'critical' | 'moderate' | 'proficient'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Comprehensive Workforce Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);

  const { t, i18n } = useTranslation();
  const isHi = i18n?.language?.startsWith('hi') ?? false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oRes, dRes, sRes, offRes, rRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/overview`, getHeaders()),
          axios.get(`${API_BASE}/department-breakdown`, getHeaders()),
          axios.get(`${API_BASE}/skill-demand`, getHeaders()),
          axios.get(`${API_BASE}/officers`, getHeaders()),
          axios.get(`${API_BASE}/role-metrics`, getHeaders())
        ]);
        if (oRes.status === 'fulfilled') setOverview(oRes.value.data);
        if (dRes.status === 'fulfilled') setDepartments(dRes.value.data);
        if (sRes.status === 'fulfilled') setDemand(sRes.value.data);
        if (rRes.status === 'fulfilled') setRoleMetrics(rRes.value.data);
        if (offRes.status === 'fulfilled' && Array.isArray(offRes.value.data)) {
          if (offRes.value.data.length > 0) {
            setOfficers(offRes.value.data);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = () => {
    const dataStr = JSON.stringify({ overview, departments, demand, roleMetrics, personnel: officers }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workforce_analytics_report.json';
    link.click();
  };

  const filteredOfficers = officers.filter((officer) => {
    const officerBand = officer.band || officer.competency_band || 'critical';
    const matchesFilter = filterBand === 'all' || 
                          officerBand.toLowerCase() === filterBand.toLowerCase() ||
                          (filterBand === 'critical' && officerBand === 'Not Assessed');

    const nameStr = (officer.name || officer.full_name || '').toLowerCase();
    const emailStr = (officer.email || '').toLowerCase();
    const roleStr = (officer.role || officer.cadre || officer.job_role || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search || nameStr.includes(search) || emailStr.includes(search) || roleStr.includes(search);
    
    return matchesFilter && matchesSearch;
  });

  // Calculate critical, moderate, proficient counts for summary
  const criticalCount = officers.filter(o => (o.band || o.competency_band || 'critical').toLowerCase() === 'critical' || (o.score ?? 0) < 50).length;
  const moderateCount = officers.filter(o => (o.band || o.competency_band) === 'moderate' || ((o.score ?? 0) >= 50 && (o.score ?? 0) <= 75)).length;
  const proficientCount = officers.filter(o => (o.band || o.competency_band) === 'proficient' || (o.score ?? 0) > 75).length;

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
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => setShowReportModal(true)} 
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-sm hover:shadow transition"
          >
            <FileText size={18} className="mr-2" /> 
            {isHi ? '📊 व्यापक कार्यबल रिपोर्ट' : '📊 View Comprehensive Analytics Report'}
          </button>
          <button 
            onClick={handleExport} 
            className="flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl shadow-sm transition border border-gray-200"
          >
            <Download size={18} className="mr-2" /> {t('admin.exportReport')}
          </button>
        </div>
      </div>

      {/* Interactive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Learners */}
        <div 
          onClick={() => { setDrilldownType('learners'); setFilterBand('all'); }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:shadow-md hover:border-blue-300 transition group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.totalLearners')}</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">{overview.total_learners}</h3>
            </div>
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition">
              <Users size={26} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-blue-600 font-semibold">
            <span>{isHi ? 'कार्मिक सूची देखें' : 'View Personnel Roster'}</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* Card 2: Active Assessments */}
        <div 
          onClick={() => { setDrilldownType('assessments'); setFilterBand('all'); }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:shadow-md hover:border-indigo-300 transition group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.activeAssessments')}</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">{overview.active_assessments}</h3>
            </div>
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition">
              <BookOpen size={26} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-indigo-600 font-semibold">
            <span>{isHi ? 'मूल्यांकन बैंक प्रबंधित करें' : 'Manage Assessment Banks'}</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* Card 3: Org Competency */}
        <div 
          onClick={() => { setDrilldownType('competency'); setFilterBand('all'); }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:shadow-md hover:border-emerald-300 transition group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.avgCompetency')}</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">
                {overview.average_org_competency?.toFixed(1) || 0.0}%
              </h3>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition">
              <TrendingUp size={26} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-emerald-600 font-semibold">
            <span>{isHi ? 'कौशल बेंचमार्क विश्लेषण' : 'View Skill Deficit Breakdown'}</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <ShieldCheck className="text-blue-600 mr-2" size={20} /> {t('admin.deptCompetency')}
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis dataKey="department" type="category" tick={{ fill: '#4b5563', fontSize: 11 }} width={120} />
                <Tooltip 
                  formatter={(val: number) => [`${val.toFixed(1)}%`, isHi ? 'औसत स्कोर' : 'Avg Score']} 
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '12px', border: 'none' }} 
                />
                <Bar dataKey="avg_score" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={20} />
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

      {/* Feature 1: Comprehensive Unified Workforce Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:max-h-none print:w-full">
            {/* Modal Top Bar */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white print:bg-none print:text-gray-900 print:border-b-2 print:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur ring-1 ring-white/20 print:hidden">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {isHi ? 'राष्ट्रीय सांख्यिकी कार्यबल क्षमता रिपोर्ट' : 'Executive Workforce Competency & Skill Intelligence Report'}
                  </h2>
                  <p className="text-xs text-blue-200 print:text-gray-600 mt-0.5">
                    Ministry of Statistics &amp; Programme Implementation (MoSPI) · Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition shadow"
                >
                  <Printer size={16} className="mr-1.5" />
                  {isHi ? 'प्रिंट / पीडीएफ डाउनलोड' : 'Print / Download PDF Summary'}
                </button>
                <button 
                  onClick={() => setShowReportModal(false)} 
                  className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body - Printable Executive Table */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1 text-gray-800">
              {/* Executive Metrics Overview Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-xs uppercase tracking-wider text-gray-700">
                  {isHi ? 'कार्यकारी सारांश मेट्रिक्स' : 'Executive Summary Consolidation Table'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white">
                  {/* Metric 1 */}
                  <div className="p-4 space-y-1">
                    <div className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
                      <Users size={16} className="text-blue-600" />
                      {isHi ? 'कुल पंजीकृत व सक्रिय कार्मिक' : 'Total Registered Personnel'}
                    </div>
                    <div className="text-2xl font-black text-gray-900">{overview.total_learners}</div>
                    <p className="text-[11px] text-gray-500">
                      {officers.length} {isHi ? 'कार्मिक डेटाबेस में रिकॉर्ड' : 'personnel live in database records'}
                    </p>
                  </div>
                  {/* Metric 2 */}
                  <div className="p-4 space-y-1">
                    <div className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
                      <BookOpen size={16} className="text-indigo-600" />
                      {isHi ? 'सक्रिय मूल्यांकन बैंक' : 'Active Role Assessment Banks'}
                    </div>
                    <div className="text-2xl font-black text-gray-900">{overview.active_assessments}</div>
                    <p className="text-[11px] text-gray-500">
                      {isHi ? 'सांख्यिकीय व तकनीकी कैडर हेतु सक्रिय' : 'Calibrated across official statistical & tech cadres'}
                    </p>
                  </div>
                  {/* Metric 3 */}
                  <div className="p-4 space-y-1">
                    <div className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
                      <TrendingUp size={16} className="text-emerald-600" />
                      {isHi ? 'संगठनात्मक औसत दक्षता' : 'Departmental Average Competency'}
                    </div>
                    <div className="text-2xl font-black text-emerald-600">
                      {(overview.average_org_competency || 0).toFixed(1)}%
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {proficientCount} {isHi ? 'कुशल' : 'Proficient'} · {moderateCount} {isHi ? 'मध्यम' : 'Moderate'} · {criticalCount} {isHi ? 'गंभीर अंतर' : 'Critical Gaps'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Departmental & Cadre Risk Level Table */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600" />
                  {isHi ? 'विभाग-वार दक्षता एवं जोखिम स्तर विश्लेषण' : 'Departmental Competency & Workforce Risk Breakdown'}
                </h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">{isHi ? 'विभाग / प्रभाग' : 'Department / Division'}</th>
                        <th className="py-2.5 px-4">{isHi ? 'औसत दक्षता स्कोर' : 'Average Competency'}</th>
                        <th className="py-2.5 px-4">{isHi ? 'जोखिम स्थिति' : 'Workforce Risk Status'}</th>
                        <th className="py-2.5 px-4">{isHi ? 'अनुशंसित हस्तक्षेप' : 'Targeted Recommended Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {departments.map((dept, idx) => {
                        const score = dept.avg_score || 0;
                        const isCrit = score < 50;
                        const isMod = score >= 50 && score <= 75;
                        return (
                          <tr key={idx} className="hover:bg-gray-50/60 transition">
                            <td className="py-3 px-4 font-bold text-gray-900">{dept.department}</td>
                            <td className="py-3 px-4 font-mono font-bold text-gray-800">{score.toFixed(1)}%</td>
                            <td className="py-3 px-4">
                              {isCrit ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                                  🔴 {isHi ? 'गंभीर जोखिम (<50%)' : 'Critical Deficit (<50%)'}
                                </span>
                              ) : isMod ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-800">
                                  🟡 {isHi ? 'मध्यम (50-75%)' : 'Moderate (50-75%)'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                                  🟢 {isHi ? 'कुशल (>75%)' : 'Proficient (>75%)'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {isCrit 
                                ? (isHi ? 'अनिवार्य आधारभूत क्षमता मॉड्यूल में नामांकन' : 'Mandatory enrollment in foundational training modules')
                                : isMod 
                                ? (isHi ? 'लक्षित कौशल प्रमाणन व मध्यवर्ती कार्यशाला' : 'Targeted intermediate skill assessment and workshops')
                                : (isHi ? 'उन्नत कार्यशाला व सहकर्मी मेंटरशिप' : 'Advanced technical workshops and peer mentoring')}
                            </td>
                          </tr>
                        );
                      })}
                      {departments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-gray-500">
                            {isHi ? 'विभागीय डेटा संकलित किया जा रहा है' : 'Departmental benchmark records compiling...'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Priority Skill Deficit & Training Demand */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-500" />
                  {isHi ? 'शीर्ष कौशल अंतर एवं प्रशिक्षण मांग (iGOT / NSSTA)' : 'Priority Skill Deficits & Training Demand (iGOT / NSSTA)'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {demand.map((item, idx) => (
                    <div key={idx} className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-gray-900">{item.skill}</div>
                        <div className="text-[11px] text-gray-500">{isHi ? 'आवश्यक सुधार अंतर' : 'Calculated Deficit Gap'}: {item.gap_size.toFixed(1)}%</div>
                      </div>
                      <span className="px-2.5 py-1 bg-orange-200/80 text-orange-900 rounded-lg text-xs font-bold">
                        {isHi ? 'उच्च प्राथमिकता' : 'High Priority'}
                      </span>
                    </div>
                  ))}
                  {demand.length === 0 && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 col-span-2 text-center">
                      {isHi ? 'कोई गंभीर कौशल अंतर नहीं पाया गया' : 'No critical skill deficit recorded.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Report Footer / Signature Area */}
              <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-500">
                <div>
                  <p className="font-semibold text-gray-700">StatCompetency AI Intelligence Engine</p>
                  <p>Certified for Official Statistical Training Governance &amp; Decision Support</p>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                  <p className="text-gray-400">MoSPI Portal · Document Ref: STAT-COMP-2026</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center print:hidden">
              <span className="text-xs text-gray-500">
                {isHi ? 'पूर्ण रिपोर्ट प्रिंट करने के लिए प्रिंट बटन का उपयोग करें' : 'Click Print to export as a formatted PDF.'}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center transition"
                >
                  <Printer size={16} className="mr-1.5" />
                  {isHi ? 'प्रिंट / पीडीएफ' : 'Print / Download PDF'}
                </button>
                <button 
                  onClick={() => setShowReportModal(false)} 
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl text-xs transition"
                >
                  {t('admin.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  {filteredOfficers.map((officer) => {
                    const displayName = officer.name || officer.full_name || officer.email.split('@')[0];
                    const displayRole = officer.role || officer.cadre || officer.job_role || 'Statistical Officer';
                    const displayScore = (officer.score ?? officer.current_score ?? officer.avg_score ?? 0);
                    const displayBand = officer.band || officer.competency_band || 'critical';
                    const displayAction = officer.recommendedAction || officer.recommended_action || 'Complete Baseline Assessment';
                    const displayDomain = officer.domainScore || 'Assessment pending';

                    return (
                      <tr key={officer.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3 pl-2">
                          <div className="font-bold text-gray-900">{displayName}</div>
                          <div className="text-[11px] text-gray-500">{officer.email}</div>
                        </td>
                        <td className="py-3">
                          <div className="font-medium text-gray-800">{displayRole}</div>
                          <div className="text-[11px] text-gray-500">{officer.department}</div>
                        </td>
                        <td className="py-3">
                          {displayBand === 'critical' ? (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold">
                              🔴 {isHi ? 'गंभीर (<50%)' : 'Critical (<50%)'}
                            </span>
                          ) : displayBand === 'moderate' ? (
                            <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold">
                              🟡 {isHi ? 'मध्यम (50-75%)' : 'Moderate (50-75%)'}
                            </span>
                          ) : displayBand === 'proficient' ? (
                            <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                              🟢 {isHi ? 'कुशल (>75%)' : 'Proficient (>75%)'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-bold">
                              ⚪ {isHi ? 'अमूल्यांकित' : 'Not Assessed'}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="font-black text-sm text-gray-900">{displayScore.toFixed(1)}%</span>
                          <div className="text-[10px] text-gray-500 mt-0.5">{displayDomain}</div>
                        </td>
                        <td className="py-3 pr-2">
                          <span className="text-gray-700 bg-blue-50/70 border border-blue-100 rounded-lg px-2.5 py-1 inline-block">
                            {displayAction}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
