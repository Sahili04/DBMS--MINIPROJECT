import React from 'react';
import { Sparkles, AlertTriangle, Target, Lightbulb } from 'lucide-react';

export default function PlacementInsightsPanel({ insights = [] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Placement Intelligence & Automated Insights</h3>
            <p className="text-xs text-slate-400">Algorithmic recommendation signals computed from live MySQL tables</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
          AI & DS Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((item, idx) => {
          let icon = <Lightbulb className="w-4 h-4 text-amber-400" />;
          let border = 'border-amber-500/20 bg-amber-500/5';
          if (item.priority === 'WARNING' || item.type === 'GAP') {
            icon = <AlertTriangle className="w-4 h-4 text-rose-400" />;
            border = 'border-rose-500/20 bg-rose-500/5';
          } else if (item.type === 'OPPORTUNITY') {
            icon = <Target className="w-4 h-4 text-emerald-400" />;
            border = 'border-emerald-500/20 bg-emerald-500/5';
          }

          return (
            <div key={idx} className={`p-4 rounded-2xl border ${border} space-y-2`}>
              <div className="flex items-center gap-2">
                {icon}
                <h4 className="text-xs font-bold text-white">{item.title}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
