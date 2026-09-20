import React from 'react';
import { CheckCircle2, Clock, XCircle, Award, Calendar } from 'lucide-react';

export default function StatusBadge({ status }) {
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <Clock className="w-3.5 h-3.5 mr-1" />;

  switch (status) {
    case 'Applied':
      colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
      icon = <Clock className="w-3.5 h-3.5 mr-1" />;
      break;
    case 'Shortlisted':
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      break;
    case 'Interview':
      colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
      icon = <Calendar className="w-3.5 h-3.5 mr-1" />;
      break;
    case 'Selected':
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      icon = <Award className="w-3.5 h-3.5 mr-1 text-emerald-600" />;
      break;
    case 'Rejected':
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
      icon = <XCircle className="w-3.5 h-3.5 mr-1" />;
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${colorClass}`}>
      {icon}
      {status}
    </span>
  );
}
