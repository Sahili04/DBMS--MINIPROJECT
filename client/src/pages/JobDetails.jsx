import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobDetails, submitApplication } from '../services/api';
import MatchBadge from '../components/MatchBadge';
import MatchExplanationModal from '../components/MatchExplanationModal';
import { 
  Building2, MapPin, Briefcase, Award, Calendar, CheckCircle2, 
  ArrowLeft, ShieldAlert, Sparkles, Globe 
} from 'lucide-react';

export default function JobDetails({ currentUser }) {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const studentId = currentUser?.profile?.student_id;

  const fetchJob = async () => {
    setLoading(true);
    try {
      const res = await getJobDetails(jobId, { studentId });
      setJob(res.data);
    } catch (err) {
      console.error('Failed to load job details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [jobId, studentId]);

  const handleApply = async () => {
    if (!studentId) {
      setError('Only logged-in students can apply for jobs.');
      return;
    }

    setApplying(true);
    setError('');

    try {
      await submitApplication({
        student_id: studentId,
        job_id: Number(jobId)
      });
      setSuccess(true);
      fetchJob();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-800">Job Not Found</h2>
        <Link to="/jobs" className="text-xs text-brand-600 font-semibold hover:underline mt-2 inline-block">
          Return to Jobs List
        </Link>
      </div>
    );
  }

  const match = job.match_details;

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Job Discovery
      </Link>

      {/* Main Job Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                {job.job_type}
              </span>
              {job.deadline && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Deadline: {job.deadline}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-600 mt-1 font-medium">
              <span className="flex items-center gap-1 text-brand-600 font-semibold">
                <Building2 className="w-4 h-4" /> {job.company_name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
              </span>
            </div>
          </div>

          {studentId && match && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center sm:text-right shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                AI Match Score
              </span>
              <MatchBadge score={match.overall} matchDetails={match} />
            </div>
          )}
        </div>

        {/* Job Attributes Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">Minimum CGPA</span>
            <span className="text-base font-bold text-slate-800 mt-0.5 block">{Number(job.min_cgpa).toFixed(1)} / 10.0</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">Open Positions</span>
            <span className="text-base font-bold text-slate-800 mt-0.5 block">{job.openings} Openings</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-400 font-medium block">Company Website</span>
            <span className="text-base font-semibold text-brand-600 truncate mt-0.5 block">
              {job.website || 'N/A'}
            </span>
          </div>
        </div>

        {/* Job Description */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Job Description</h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* Required Skills */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills?.map((sk) => (
              <span
                key={sk.skill_id}
                className="px-3.5 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold"
              >
                {sk.skill_name}
              </span>
            ))}
          </div>
        </div>

        {/* AI & DS Matching Score Explanation Banner */}
        {studentId && match && (
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <h4 className="font-bold text-white text-sm">AI Match Explanation</h4>
              </div>
              <button
                onClick={() => setShowExplanationModal(true)}
                className="text-xs font-medium text-brand-400 hover:text-brand-300 underline"
              >
                View Full Breakdown
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-400 block">Skill Overlap ({match.matchedSkills}/{match.totalJobSkills} Skills)</span>
                <span className="font-semibold text-white mt-0.5 block">{match.skillScore} / 70 Points</span>
              </div>
              <div>
                <span className="text-slate-400 block">CGPA Eligibility (Min {match.requiredCgpa})</span>
                <span className="font-semibold text-white mt-0.5 block">{match.cgpaScore} / 30 Points</span>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Application submitted successfully to MySQL database!</span>
          </div>
        )}

        {/* Application Action Button */}
        {studentId && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {job.has_applied ? (
              <div className="w-full py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> You Have Applied For This Role
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {applying ? 'Submitting Application...' : 'Apply Now For This Role'}
              </button>
            )}
          </div>
        )}
      </div>

      {showExplanationModal && match && (
        <MatchExplanationModal matchDetails={match} onClose={() => setShowExplanationModal(false)} />
      )}
    </div>
  );
}
