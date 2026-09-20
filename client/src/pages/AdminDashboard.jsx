import React, { useState, useEffect } from 'react';
import { 
  getAnalyticsOverview, getPlacementReadiness, getPlacementInsights, getDashboardData 
} from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import MatchBadge from '../components/MatchBadge';
import GlobalFilterBar from '../components/GlobalFilterBar';
import DataQualityCard from '../components/DataQualityCard';
import PlacementInsightsPanel from '../components/PlacementInsightsPanel';
import PredictiveReadinessTable from '../components/PredictiveReadinessTable';
import ExportCenterModal from '../components/ExportCenterModal';

import { 
  Users, Building2, Briefcase, FileText, CheckCircle2, Award, 
  RotateCw, Sparkles, Target, Activity, Download, Layers
} from 'lucide-react';

import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
        <p className="font-semibold text-slate-200 mb-1">{label || payload[0].name}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-slate-300 my-0.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
            <span className="capitalize">{entry.name}:</span>
            <span className="font-bold text-white">{entry.value} {unit}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Slicers Filter State
  const [filters, setFilters] = useState({
    branch: 'ALL',
    jobType: 'ALL',
    status: 'ALL',
    companyId: 'ALL',
    minCgpa: '0',
    minMatch: '0',
    q: ''
  });

  // Analytics API Data States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [readinessData, setReadinessData] = useState([]);
  const [insightsData, setInsightsData] = useState([]);
  const [baseDashboardData, setBaseDashboardData] = useState(null);

  const fetchAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const [overviewRes, readinessRes, insightsRes, baseRes] = await Promise.all([
        getAnalyticsOverview(filters),
        getPlacementReadiness(),
        getPlacementInsights(),
        getDashboardData()
      ]);

      setAnalyticsData(overviewRes.data);
      setReadinessData(readinessRes.data);
      setInsightsData(insightsRes.data);
      setBaseDashboardData(baseRes.data);
    } catch (err) {
      console.error('Failed to load placement analytics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  useEffect(() => {
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAnalytics();
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      branch: 'ALL',
      jobType: 'ALL',
      status: 'ALL',
      companyId: 'ALL',
      minCgpa: '0',
      minMatch: '0',
      q: ''
    });
  };

  // Cross-filtering click handler on charts
  const handleBarChartClick = (dataState) => {
    if (dataState && dataState.activePayload && dataState.activePayload.length) {
      const clickedName = dataState.activePayload[0].payload.name || dataState.activePayload[0].payload.branch;
      if (clickedName === 'AI & DS' || clickedName === 'CSE' || clickedName === 'IT') {
        handleFilterChange('branch', clickedName);
      } else if (clickedName === 'Applied' || clickedName === 'Shortlisted' || clickedName === 'Interview' || clickedName === 'Selected' || clickedName === 'Rejected') {
        handleFilterChange('status', clickedName);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-28 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-28 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-28 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const { kpis, matchDistribution, funnel, dataQuality, applications } = analyticsData || {};
  const { skillGap, branchDistribution, statusChart } = baseDashboardData || {};

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Executive Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Intelligence & Decision Dashboard</h1>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Live MySQL Decision Support System • Real-Time Database Analytics • AIDS Job-Student Matching Intelligence
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-500 animate-spin' : 'text-slate-400'}`} />
            Auto 10s Live Sync
          </label>

          <button
            onClick={fetchAnalytics}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Data
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/30 transition-all"
          >
            <Download className="w-4 h-4" /> Export Report & Executive Summary
          </button>
        </div>
      </div>

      {/* Global Slicer Bar */}
      <GlobalFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        companies={baseDashboardData?.companyReport || []}
      />

      {/* Automated Placement Intelligence Insights */}
      <PlacementInsightsPanel insights={insightsData} />

      {/* Dynamically Sliced KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Overall Placement Selection Rate"
          value={`${kpis?.placementRate || 0}%`}
          trend={`${kpis?.selectedCount || 0} Placed Candidates`}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Filtered Applications"
          value={kpis?.totalApplications || 0}
          trend={`From ${kpis?.totalStudents || 0} Total Registered Students`}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Shortlisted / In Process"
          value={kpis?.shortlistedCount || 0}
          trend="Candidates progressing in funnel"
          icon={CheckCircle2}
          color="purple"
        />
        <StatCard
          title="Average AI Match Score"
          value={`${kpis?.avgMatchScore || 0}%`}
          trend="Filtered cohort job match index"
          icon={Target}
          color="amber"
        />
      </div>

      {/* Advanced Recharts Analytical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Recruitment Conversion Funnel */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Candidate Recruitment Funnel</h3>
              <p className="text-xs text-slate-500">Stage conversion: Applied → Shortlisted → Interview → Selected</p>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700">
              Funnel Analytics
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" onClick={handleBarChartClick}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} name="Candidates in Stage" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Skill Demand vs Student Supply Gap Analysis */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Skill Gap Analysis (Demand vs Supply)</h3>
              <p className="text-xs text-slate-500">Market Job Requirements vs Student Skill Availability</p>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700">
              AIDS Skill Gap
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillGap}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="jobDemand" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Job Requirements" />
                <Bar dataKey="studentSupply" fill="#10b981" radius={[6, 6, 0, 0]} name="Student Skill Supply" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Match Score Distribution Histogram */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Match Score Distribution Histogram</h3>
              <p className="text-xs text-slate-500">Distribution of candidate job match score ranges</p>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700">
              Score Buckets
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matchDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Applications in Range" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Branch Placement Performance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Branch Placement Performance</h3>
              <p className="text-xs text-slate-500">Total Students vs Placed Students by Academic Branch</p>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              Branch Metrics
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchDistribution} onClick={handleBarChartClick}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="totalStudents" fill="#94a3b8" radius={[6, 6, 0, 0]} name="Total Students" />
                <Bar dataKey="placedStudents" fill="#10b981" radius={[6, 6, 0, 0]} name="Placed Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Student Placement Readiness Index Table */}
      <PredictiveReadinessTable readinessData={readinessData} />

      {/* Data Quality & Sliced Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DataQualityCard quality={dataQuality} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sliced Applications Result ({applications?.length || 0} Records)
              </h3>
              <p className="text-xs text-slate-500">Live query result for active slicer selections</p>
            </div>
          </div>

          {applications?.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500">No applications match the current slicer selections.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-80 custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 bg-white">
                  <tr>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Job & Type</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Match</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {applications?.map((app) => (
                    <tr key={app.application_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{app.student_name}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800">{app.branch}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-xs">
                        {app.job_title}
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-600 text-xs">{app.company_name}</td>
                      <td className="px-4 py-3">
                        <MatchBadge score={app.match_score} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status_name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Export Center Modal */}
      {showExportModal && (
        <ExportCenterModal filters={filters} onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
}
