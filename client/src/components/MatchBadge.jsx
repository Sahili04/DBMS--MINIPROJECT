import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import MatchExplanationModal from './MatchExplanationModal';

export default function MatchBadge({ score, matchDetails }) {
  const [showModal, setShowModal] = useState(false);

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  if (score >= 90) bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
  else if (score >= 70) bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
  else if (score >= 50) bgClass = 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <>
      <div className="inline-flex items-center gap-1.5">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${bgClass}`}>
          <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-500 animate-pulse" />
          {score}% Match
        </span>
        {matchDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="text-slate-400 hover:text-brand-600 transition-colors p-1"
            title="View Match Score Breakdown"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {showModal && matchDetails && (
        <MatchExplanationModal matchDetails={matchDetails} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
