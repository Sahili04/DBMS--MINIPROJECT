import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import API from '../services/api';

export default function ExportCenterModal({ filters, onClose }) {
  const [reportType, setReportType] = useState('Placement Summary Report');
  const [format, setFormat] = useState('CSV');
  const [generating, setGenerating] = useState(false);
  const [reportResult, setReportResult] = useState(null);

  const handleExport = async () => {
    setGenerating(true);

    try {
      if (format === 'CSV') {
        const response = await API.post('/admin/reports/export', {
          reportType,
          format: 'CSV',
          ...filters
        }, { responseType: 'blob' });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `placement_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        onClose();
      } else {
        const res = await API.post('/admin/reports/export', {
          reportType,
          format,
          ...filters
        });
        setReportResult(res.data);
      }
    } catch (err) {
      alert('Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Placement Intelligence Export Center</h3>
              <p className="text-xs text-slate-500">Generate executive summary & data reports</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!reportResult ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                <option value="Placement Summary Report">Placement Summary Report</option>
                <option value="Student Readiness Analytics Report">Student Readiness Analytics Report</option>
                <option value="Company Hiring Statistics Report">Company Hiring Statistics Report</option>
                <option value="Skill Demand Gap Report">Skill Demand Gap Report</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['CSV', 'Excel', 'PDF'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`py-2.5 px-3 rounded-xl font-bold border text-center transition-all ${
                      format === f
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
              <span className="font-semibold text-slate-800 block mb-1">Preserved Dashboard Slicers:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Branch: {filters.branch}</li>
                <li>Job Type: {filters.jobType}</li>
                <li>Status: {filters.status}</li>
              </ul>
            </div>

            <button
              onClick={handleExport}
              disabled={generating}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {generating ? 'Generating Analytics Report...' : 'Generate & Download Report'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-semibold">Report Generated Successfully!</span>
            </div>

            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Dynamic Analytical Conclusion</h4>
              <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">{reportResult.conclusion}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Close Dialog
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
