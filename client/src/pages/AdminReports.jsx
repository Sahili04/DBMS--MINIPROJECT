import React, { useState, useEffect } from 'react';
import { getPlacementReports } from '../services/api';
import StatCard from '../components/StatCard';
import { BarChart3, Award, Users, CheckCircle2, Building2 } from 'lucide-react';

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await getPlacementReports();
        setReports(res.data);
      } catch (err) {
        console.error('Failed to load placement reports:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const { totalStudents, placedStudents, placementPercentage, avgMatchScore, companyStats } = reports;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Reports & Analytics</h1>
        <p className="text-slate-500 text-xs mt-1">
          Aggregated DBMS statistical metrics powered by SQL views and aggregation queries.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Registered Students" value={totalStudents} icon={Users} color="blue" />
        <StatCard title="Placed / Selected Students" value={placedStudents} icon={CheckCircle2} color="emerald" />
        <StatCard title="Placement Percentage" value={`${placementPercentage}%`} icon={Award} color="purple" />
        <StatCard title="Average AI Match Score" value={`${avgMatchScore}%`} icon={BarChart3} color="amber" />
      </div>

      {/* Detailed Company-wise Placement Report */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Company-Wise Hiring Summary</h3>
            <p className="text-xs text-slate-500">View performance breakdown across corporate recruiters</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Company Name</th>
                <th className="px-4 py-3">Total Applications</th>
                <th className="px-4 py-3">Hired / Selected</th>
                <th className="px-4 py-3">Avg Applicant Match Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {companyStats?.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {row.company_name}
                  </td>
                  <td className="px-4 py-3.5 font-medium">{row.total_applications}</td>
                  <td className="px-4 py-3.5 font-semibold text-emerald-600">{row.selected_students}</td>
                  <td className="px-4 py-3.5 font-semibold text-brand-600">{row.average_match_score || '0.00'}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
