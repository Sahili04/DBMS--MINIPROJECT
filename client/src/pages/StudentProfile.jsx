import React, { useState, useEffect } from 'react';
import { getStudentProfile, getSkills, updateStudentSkills } from '../services/api';
import { UserCheck, CheckCircle2, ShieldAlert, Sparkles, Award } from 'lucide-react';

export default function StudentProfile({ currentUser }) {
  const studentId = currentUser?.profile?.student_id;

  const [student, setStudent] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [branch, setBranch] = useState('AI & DS');
  const [cgpa, setCgpa] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!studentId) return;
      try {
        const [profRes, skillsRes] = await Promise.all([
          getStudentProfile(studentId),
          getSkills()
        ]);

        const st = profRes.data;
        setStudent(st);
        setBranch(st.branch || 'AI & DS');
        setCgpa(st.cgpa ? String(st.cgpa) : '');
        setPhone(st.phone || '');
        setSelectedSkillIds(st.skill_ids || []);
        setAllSkills(skillsRes.data);
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  const toggleSkill = (skillId) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter(id => id !== skillId));
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updateStudentSkills(studentId, {
        skill_ids: selectedSkillIds,
        branch,
        cgpa: parseFloat(cgpa),
        phone
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile skills.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile & Skills</h1>
        <p className="text-slate-500 text-xs mt-1">
          Manage your skills chips and academic details to feed the AI & DS Matching Engine.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-brand-600/30">
              {student?.name ? student.name[0].toUpperCase() : 'S'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{student?.name}</h2>
              <p className="text-xs text-slate-500">{student?.email} • Roll No: {student?.roll_no}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="AI & DS">AI & DS</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                CGPA (0 - 10)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Skill Chips Selection Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Select Technical Skills</h3>
          </div>
          <p className="text-xs text-slate-500">
            Click on skill chips to toggle them. Your selected skills directly increase your AI Skill Overlap Score (70% weightage).
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {allSkills.map((sk) => {
              const isSelected = selectedSkillIds.includes(sk.skill_id);
              return (
                <button
                  type="button"
                  key={sk.skill_id}
                  onClick={() => toggleSkill(sk.skill_id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {sk.skill_name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile and skill chips updated successfully in MySQL database!</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : 'Save Profile & Skills'}
        </button>
      </form>
    </div>
  );
}
