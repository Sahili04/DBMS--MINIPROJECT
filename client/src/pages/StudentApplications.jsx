import React, { useState, useEffect } from 'react';
import { getStudentApplications } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import MatchBadge from '../components/MatchBadge';
import { FileText, Clock, Building2, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function StudentApplications({ currentUser }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = currentUser?.profile?.student_id;

  useEffect(() => {
    async function fetchApps() {
      if (!studentId) return;
      try {
        const res = await getStudentApplications(studentId);
        setApplications(res.data);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Job Applications</h1>
        <p className="text-slate-500 text-xs mt-1">
          Track real-time application status and status change history logged in MySQL.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Applications Submitted Yet</h3>
          <p className="text-xs text-slate-500 mt-1">Explore job openings to apply for internships & roles.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Role & Company</th>
                  <th className="px-6 py-4">AI Match Score</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Status History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{app.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {app.company_name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {app.location}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <MatchBadge score={app.match_score} />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={app.status_name} />
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      {app.history && app.history.length > 0 ? (
                        <div className="space-y-1">
                          {app.history.map((h, idx) => (
                            <div key={idx} className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                              <span>{h.old_status} → <strong className="text-slate-700">{h.new_status}</strong></span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Initial submission</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
