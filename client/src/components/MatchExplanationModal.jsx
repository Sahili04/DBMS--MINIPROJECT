import React from 'react';
import { X, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function MatchExplanationModal({ matchDetails, onClose }) {
  if (!matchDetails) return null;

  const { overall, skillScore, cgpaScore, matchedSkills, totalJobSkills, studentCgpa, requiredCgpa, cgpaSatisfied } = matchDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Why this match?</h3>
              <p className="text-xs text-slate-500">AI & DS Rule-Based Matching Algorithm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Match Score</span>
            <div className="text-3xl font-bold text-brand-600 mt-1">{overall}%</div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between p-3 rounded-lg bg-slate-50">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-slate-700">Skill Match (70% Max)</div>
                  <div className="text-xs text-slate-500">
                    {matchedSkills} of {totalJobSkills} required skills matched
                  </div>
                </div>
              </div>
              <div className="font-semibold text-slate-800">{skillScore} / 70</div>
            </div>

            <div className="flex items-start justify-between p-3 rounded-lg bg-slate-50">
              <div className="flex items-start gap-2.5">
                {cgpaSatisfied ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="font-medium text-slate-700">CGPA Eligibility (30% Max)</div>
                  <div className="text-xs text-slate-500">
                    Your CGPA ({studentCgpa}) vs Min Required ({requiredCgpa})
                  </div>
                </div>
              </div>
              <div className="font-semibold text-slate-800">{cgpaScore} / 30</div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
