import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecruiterJobs, getJobApplicants, updateApplicationStatus } from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import MatchBadge from '../components/MatchBadge';
import { Briefcase, Users, PlusCircle, Building2, MapPin, CheckCircle2 } from 'lucide-react';

export default function RecruiterDashboard({ currentUser }) {
  const companyId = currentUser?.profile?.company_id;
  const companyName = currentUser?.profile?.company_name || 'Recruiter';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      if (!companyId) return;
      try {
        const res = await getRecruiterJobs(companyId);
        setJobs(res.data);
        if (res.data.length > 0) {
          setSelectedJobId(res.data[0].job_id);
        }
      } catch (err) {
        console.error('Failed to load recruiter jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [companyId]);

  useEffect(() => {
    async function fetchApplicants() {
      if (!selectedJobId) return;
      try {
        const res = await getJobApplicants(selectedJobId);
        setApplicants(res.data);
      } catch (err) {
        console.error('Failed to load job applicants:', err);
      }
    }
    fetchApplicants();
  }, [selectedJobId]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      // Refresh applicants list
      const res = await getJobApplicants(selectedJobId);
      setApplicants(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const totalApplicantsCount = jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{companyName} Dashboard</h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage posted openings, review applicants ranked by AI Match Score, and update status.
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Post New Opening
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Active Openings" value={jobs.length} icon={Briefcase} color="purple" />
        <StatCard title="Total Applications Received" value={totalApplicantsCount} icon={Users} color="blue" />
        <StatCard title="Company Location" value={currentUser?.profile?.location || 'Pune'} icon={Building2} color="emerald" />
      </div>

      {/* Posted Roles Tabs & Applicants Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3">Select Job Opening</h3>
          {jobs.length === 0 ? (
            <p className="text-xs text-slate-500">No jobs posted yet. Click 'Post New Opening' to create one.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {jobs.map((j) => (
                <button
                  key={j.job_id}
                  onClick={() => setSelectedJobId(j.job_id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedJobId === j.job_id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {j.title} ({j.applicant_count} Applicants)
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Applicants Table */}
        {selectedJobId && (
          <div>
            <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Applicants Ranked by AI Match Score ({applicants.length})
              </h4>
            </div>

            {applicants.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500">No applications received yet for this role.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Roll No & Branch</th>
                      <th className="px-4 py-3">CGPA</th>
                      <th className="px-4 py-3">AI Match Score</th>
                      <th className="px-4 py-3">Current Status</th>
                      <th className="px-4 py-3">Update Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {applicants.map((app) => (
                      <tr key={app.application_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          {app.student_name}
                          <div className="text-[11px] font-normal text-slate-400">{app.email}</div>
                        </td>

                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          {app.roll_no} • <span className="font-medium text-slate-800">{app.branch}</span>
                        </td>

                        <td className="px-4 py-3.5 text-xs font-semibold text-slate-800">
                          {Number(app.cgpa).toFixed(2)}
                        </td>

                        <td className="px-4 py-3.5">
                          <MatchBadge score={app.match_score} />
                        </td>

                        <td className="px-4 py-3.5">
                          <StatusBadge status={app.status_name} />
                        </td>

                        <td className="px-4 py-3.5">
                          <select
                            value={app.status_name}
                            onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                            className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview">Interview</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
