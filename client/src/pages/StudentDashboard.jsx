import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentProfile, getJobs, getStudentApplications } from '../services/api';
import StatCard from '../components/StatCard';
import MatchBadge from '../components/MatchBadge';
import { Award, Briefcase, CheckCircle2, Sparkles, MapPin, ArrowRight } from 'lucide-react';

export default function StudentDashboard({ currentUser }) {
  const [student, setStudent] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = currentUser?.profile?.student_id;

  useEffect(() => {
    async function fetchData() {
      if (!studentId) return;
      try {
        const [profRes, jobsRes, appsRes] = await Promise.all([
          getStudentProfile(studentId),
          getJobs({ studentId }),
          getStudentApplications(studentId)
        ]);

        setStudent(profRes.data);
        setApplications(appsRes.data);

        // Sort by AI Match score descending
        const sorted = [...jobsRes.data].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        setRecommendedJobs(sorted.slice(0, 3));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-28 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-28 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const shortlistedCount = applications.filter(a => a.status_name === 'Shortlisted' || a.status_name === 'Selected').length;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good morning, {currentUser?.user?.name || 'Student'} 👋
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Here is your placement & internship overview for {student?.branch || 'AI & DS'}.
          </p>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          Explore Matched Roles
        </Link>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Current CGPA"
          value={student?.cgpa ? Number(student.cgpa).toFixed(2) : 'N/A'}
          trend={`Branch: ${student?.branch || 'AI & DS'}`}
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Applications Sent"
          value={applications.length}
          trend="Applied via Placement Hub"
          icon={Briefcase}
          color="purple"
        />
        <StatCard
          title="Shortlisted / Offers"
          value={shortlistedCount}
          trend={`${shortlistedCount} active opportunities`}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Recommended Jobs by AI Match Score */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recommended Jobs For You</h2>
            <p className="text-xs text-slate-500">Ranked using AI & DS Job-Student Match Score</p>
          </div>
          <Link to="/jobs" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
            View All Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendedJobs.map((job) => (
            <div key={job.job_id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{job.title}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{job.company_name}</p>
                  </div>
                  <MatchBadge score={job.match_score || 0} matchDetails={job.match_details} />
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-[10px] uppercase">
                    {job.job_type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {job.skills?.slice(0, 3).map((sk, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                to={`/jobs/${job.job_id}`}
                className="w-full py-2 bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 hover:border-brand-200 rounded-xl text-xs font-semibold text-center transition-colors block"
              >
                View Job & Apply
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
