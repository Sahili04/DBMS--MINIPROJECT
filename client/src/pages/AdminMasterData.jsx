import React, { useState, useEffect } from 'react';
import { getAllApplications } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import MatchBadge from '../components/MatchBadge';
import { Database, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function AdminMasterData() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const res = await getAllApplications();
        setApplications(res.data);
      } catch (err) {
        console.error('Failed to load master applications:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Data & Audit Browser</h1>
        <p className="text-slate-500 text-xs mt-1">
          Full system applications master table, Foreign Key joins, and trigger status updates.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">All System Applications ({applications.length})</h3>
            <p className="text-xs text-slate-500">Live multi-table SQL join across Students, Jobs, Companies, and Statuses</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">App ID</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Roll No & Branch</th>
                <th className="px-4 py-3">Applied Job Role</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Match Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {applications.map((app) => (
                <tr key={app.application_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-400">
                    #{app.application_id}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{app.student_name}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">
                    {app.roll_no} • <span className="font-medium text-slate-800">{app.branch}</span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">{app.job_title}</td>
                  <td className="px-4 py-3.5 font-semibold text-brand-600">{app.company_name}</td>
                  <td className="px-4 py-3.5">
                    <MatchBadge score={app.match_score} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={app.status_name} />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">
                    {new Date(app.applied_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
