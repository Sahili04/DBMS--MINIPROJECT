import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../services/api';
import MatchBadge from '../components/MatchBadge';
import { Search, MapPin, Briefcase, Filter, Sparkles, Building2 } from 'lucide-react';

export default function JobListings({ currentUser }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [minCgpaFilter, setMinCgpaFilter] = useState('');

  const studentId = currentUser?.profile?.student_id;

  const fetchFilteredJobs = async () => {
    setLoading(true);
    try {
      const res = await getJobs({
        q: query,
        location: locationFilter,
        type: typeFilter,
        minCgpa: minCgpaFilter,
        studentId
      });
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredJobs();
  }, [locationFilter, typeFilter, minCgpaFilter, studentId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFilteredJobs();
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discover Opportunities</h1>
        <p className="text-slate-500 text-xs mt-1">
          Explore internships & full-time roles with instant AI & DS Match Score ranking.
        </p>
      </div>

      {/* Search Bar & Multi-Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search jobs, roles, companies or required skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-500 mr-2">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-2 focus:ring-brand-500 transition-all"
          >
            <option value="">All Locations</option>
            <option value="Pune">Pune</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mumbai">Mumbai</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-2 focus:ring-brand-500 transition-all"
          >
            <option value="">All Job Types</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="FULL_TIME">Full Time</option>
          </select>

          <select
            value={minCgpaFilter}
            onChange={(e) => setMinCgpaFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-2 focus:ring-brand-500 transition-all"
          >
            <option value="">Any CGPA Cutoff</option>
            <option value="7.0">Min CGPA ≤ 7.0</option>
            <option value="7.5">Min CGPA ≤ 7.5</option>
            <option value="8.0">Min CGPA ≤ 8.0</option>
          </select>

          {(locationFilter || typeFilter || minCgpaFilter || query) && (
            <button
              onClick={() => {
                setQuery('');
                setLocationFilter('');
                setTypeFilter('');
                setMinCgpaFilter('');
              }}
              className="text-xs text-rose-600 font-medium hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Job Openings Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or resetting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.job_id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{job.title}</h3>
                    <p className="text-xs font-semibold text-brand-600 mt-0.5">{job.company_name}</p>
                  </div>
                  {studentId && (
                    <MatchBadge score={job.match_score || 0} matchDetails={job.match_details} />
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 my-3">{job.description}</p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-4">
                  <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 uppercase font-medium text-[10px]">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {job.job_type}
                  </span>
                  <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-slate-600 font-medium">
                    Min CGPA: {Number(job.min_cgpa).toFixed(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {job.skills?.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Openings: <strong className="text-slate-700 font-semibold">{job.openings}</strong>
                </span>
                <Link
                  to={`/jobs/${job.job_id}`}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  View Details & Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
