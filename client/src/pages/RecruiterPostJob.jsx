import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createJob, getSkills } from '../services/api';
import { Briefcase, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function RecruiterPostJob({ currentUser }) {
  const companyId = currentUser?.profile?.company_id;
  const navigate = useNavigate();

  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    job_type: 'INTERNSHIP',
    location: 'Pune',
    min_cgpa: '7.00',
    openings: '3',
    deadline: '2026-12-31',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await getSkills();
        setAllSkills(res.data);
      } catch (err) {
        console.error('Failed to load skills:', err);
      }
    }
    fetchSkills();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSkill = (skillId) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter(id => id !== skillId));
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      setError('Company ID not found for current recruiter.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createJob({
        company_id: companyId,
        ...formData,
        min_cgpa: parseFloat(formData.min_cgpa),
        openings: parseInt(formData.openings, 10),
        skill_ids: selectedSkillIds,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/recruiter');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
      <Link to="/recruiter" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Recruiter Dashboard
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Post New Role Opening</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in details to post an internship or job role for college students.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Job opening posted successfully to MySQL! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="Python Data Analyst Intern"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Job Type *
              </label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="INTERNSHIP">INTERNSHIP</option>
                <option value="FULL_TIME">FULL_TIME</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Job Description
            </label>
            <textarea
              name="description"
              rows="3"
              placeholder="Describe key responsibilities and expectations..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                required
                placeholder="Pune / Bengaluru"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Min CGPA Cutoff
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="min_cgpa"
                value={formData.min_cgpa}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Open Positions
              </label>
              <input
                type="number"
                min="1"
                name="openings"
                value={formData.openings}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Required Skills Selection */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Required Skills for this Role
            </label>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((sk) => {
                const isSelected = selectedSkillIds.includes(sk.skill_id);
                return (
                  <button
                    type="button"
                    key={sk.skill_id}
                    onClick={() => toggleSkill(sk.skill_id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sk.skill_name}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Posting Opening...' : 'Publish Job Opening'}
          </button>
        </form>
      </div>
    </div>
  );
}
