import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, FileText, UserCheck, 
  BarChart3, Settings, Sparkles, Building, Database, LogOut
} from 'lucide-react';

export default function Sidebar({ role, onLogout }) {
  const studentNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Find Jobs', path: '/jobs', icon: Briefcase },
    { name: 'My Applications', path: '/my-applications', icon: FileText },
    { name: 'My Profile & Skills', path: '/profile', icon: UserCheck },
  ];

  const recruiterNav = [
    { name: 'Recruiter Dashboard', path: '/recruiter', icon: LayoutDashboard },
    { name: 'Post New Role', path: '/recruiter/post-job', icon: Briefcase },
  ];

  const adminNav = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Placement Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Master Data & Audit', path: '/admin/master-data', icon: Database },
  ];

  let navItems = studentNav;
  if (role === 'RECRUITER') navItems = recruiterNav;
  if (role === 'ADMIN') navItems = adminNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">Placement Hub</h1>
            <span className="text-[10px] text-brand-400 font-medium uppercase tracking-wider">AI & DS System</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/recruiter' || item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
