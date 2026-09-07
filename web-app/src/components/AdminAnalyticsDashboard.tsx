import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Users, BookOpen, TrendingUp, AlertTriangle, Download } from 'lucide-react';

const API_BASE = '/api/v1/admin/analytics';
const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const AdminAnalyticsDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [demand, setDemand] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    const dataStr = JSON.stringify({ overview, departments, demand }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workforce_analytics.json';
    link.click();
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Compiling Analytics Data...</div>;
  if (!overview) return <div className="p-12 text-center text-red-500">Failed to load analytics.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workforce Analytics</h1>
          <p className="text-gray-500 mt-1">Organization-wide competency insights and training demand.</p>
        </div>
        <button onClick={handleExport} className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition">
          <Download size={18} className="mr-2" /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 uppercase flex items-center"><Users size={16} className="mr-2"/> Total Learners</span>
          <span className="text-4xl font-black text-gray-900 mt-3">{overview.total_learners}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 uppercase flex items-center"><TrendingUp size={16} className="mr-2"/> Avg Competency</span>
          <span className="text-4xl font-black text-blue-600 mt-3">{overview.average_org_competency.toFixed(1)}%</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 uppercase flex items-center"><BookOpen size={16} className="mr-2"/> Active Assessments</span>
          <span className="text-4xl font-black text-indigo-600 mt-3">{overview.active_assessments}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Competency by Department</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="avg_score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Demand Radar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <AlertTriangle className="text-orange-500 mr-2" size={20} /> Critical Training Demand
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={demand}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                <Radar name="Gap Size (%)" dataKey="gap_size" stroke="#f97316" fill="#fb923c" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
