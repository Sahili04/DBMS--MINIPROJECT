import React, { useState } from 'react';
import { Award, CheckCircle2, AlertCircle, ArrowUpDown } from 'lucide-react';

export default function PredictiveReadinessTable({ readinessData = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filtered = readinessData.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          st.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          st.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || st.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Student Placement Readiness Index</h3>
          <p className="text-xs text-slate-500">
            Explainable classification (0–100 score based on CGPA weightage, Skill coverage, Match Score average, Application activity)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="HIGH READINESS">HIGH READINESS</option>
            <option value="MEDIUM READINESS">MEDIUM READINESS</option>
            <option value="NEEDS IMPROVEMENT">NEEDS IMPROVEMENT</option>
          </select>

          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Branch & CGPA</th>
              <th className="px-4 py-3">Skill Count</th>
              <th className="px-4 py-3">Applications</th>
              <th className="px-4 py-3">Avg AI Match</th>
              <th className="px-4 py-3">Readiness Score</th>
              <th className="px-4 py-3">Classification</th>
              <th className="px-4 py-3">Explainable Factors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((st) => (
              <tr key={st.student_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3.5 font-bold text-slate-900">
                  {st.name}
                  <div className="text-[11px] font-mono font-normal text-slate-400">{st.roll_no}</div>
                </td>

                <td className="px-4 py-3.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{st.branch}</span>
                  <div className="text-[11px] text-slate-400">CGPA: {Number(st.cgpa).toFixed(2)}</div>
                </td>

                <td className="px-4 py-3.5 text-xs font-semibold text-slate-800">
                  {st.skill_count} Skills
                </td>

                <td className="px-4 py-3.5 text-xs font-semibold text-slate-800">
                  {st.app_count} Sent
                </td>

                <td className="px-4 py-3.5 font-semibold text-brand-600">
                  {st.avg_match}%
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          st.readinessScore >= 80 ? 'bg-emerald-500' :
                          st.readinessScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${st.readinessScore}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-xs text-slate-900">{st.readinessScore}%</span>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${st.badgeClass}`}>
                    {st.category}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-[11px]">
                  <div className="space-y-0.5">
                    {st.strengths.slice(0, 1).map((s, idx) => (
                      <span key={idx} className="text-emerald-700 font-medium block">
                        ✓ {s}
                      </span>
                    ))}
                    {st.growthAreas.slice(0, 1).map((g, idx) => (
                      <span key={idx} className="text-amber-700 font-medium block">
                        • {g}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
