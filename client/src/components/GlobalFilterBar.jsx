import React from 'react';
import { Filter, Search, RotateCcw } from 'lucide-react';

export default function GlobalFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  companies = []
}) {
  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Placement Decision Intelligence Slicers
            </h3>
            <p className="text-[11px] text-slate-400">All BI dashboards, charts & readiness indices update live</p>
          </div>
        </div>

        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Slicer 1: Branch */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Academic Branch
          </label>
          <select
            value={filters.branch}
            onChange={(e) => onFilterChange('branch', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="ALL">All Branches</option>
            <option value="AI & DS">AI & DS</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
          </select>
        </div>

        {/* Slicer 2: Job Type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Job Type Category
          </label>
          <select
            value={filters.jobType}
            onChange={(e) => onFilterChange('jobType', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="ALL">All Job Types</option>
            <option value="INTERNSHIP">INTERNSHIP</option>
            <option value="FULL_TIME">FULL_TIME</option>
          </select>
        </div>

        {/* Slicer 3: Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Application Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Slicer 4: Company */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Recruiting Company
          </label>
          <select
            value={filters.companyId}
            onChange={(e) => onFilterChange('companyId', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="ALL">All Companies</option>
            {companies.map((c) => (
              <option key={c.company_id} value={c.company_id}>
                {c.company_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80 text-xs">
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
            <span>Min Student CGPA:</span>
            <span className="text-brand-400 font-bold">{filters.minCgpa}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={filters.minCgpa}
            onChange={(e) => onFilterChange('minCgpa', e.target.value)}
            className="w-full accent-brand-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
            <span>Min AI Match Score:</span>
            <span className="text-brand-400 font-bold">{filters.minMatch}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={filters.minMatch}
            onChange={(e) => onFilterChange('minMatch', e.target.value)}
            className="w-full accent-brand-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
            <span>Search Filter</span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate, role, company..."
              value={filters.q}
              onChange={(e) => onFilterChange('q', e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
