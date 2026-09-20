import React from 'react';
import { Database, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';


export default function DataQualityCard({ quality }) {
  if (!quality) return null;

  const { profileCompletenessPct, jobSkillCoveragePct, matchScoreIntegrityPct } = quality;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Database Data Quality Index</h3>
            <p className="text-xs text-slate-500">Real-time database record integrity & completeness</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
          HEALTHY
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <div className="flex justify-between font-semibold text-slate-700 mb-1">
            <span>Student Profiles with Skills Tagged</span>
            <span className="text-brand-600 font-bold">{profileCompletenessPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-brand-600 h-full rounded-full" style={{ width: `${profileCompletenessPct}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between font-semibold text-slate-700 mb-1">
            <span>Job Openings with Skills Mapped</span>
            <span className="text-purple-600 font-bold">{jobSkillCoveragePct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${jobSkillCoveragePct}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between font-semibold text-slate-700 mb-1">
            <span>Application AI Match Score Validity</span>
            <span className="text-emerald-600 font-bold">{matchScoreIntegrityPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${matchScoreIntegrityPct}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
