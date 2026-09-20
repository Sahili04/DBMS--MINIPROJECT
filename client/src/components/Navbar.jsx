import React from 'react';
import { Bell, User, LogOut, GraduationCap, Building2, ShieldCheck } from 'lucide-react';

export default function Navbar({ currentUser, onLogout }) {
  const roleBadges = {
    STUDENT: { label: 'Student', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: GraduationCap },
    RECRUITER: { label: 'Recruiter', class: 'bg-purple-50 text-purple-700 border-purple-200', icon: Building2 },
    ADMIN: { label: 'Admin', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ShieldCheck },
  };

  const badge = roleBadges[currentUser?.user?.role] || roleBadges.STUDENT;
  const RoleIcon = badge.icon;

  return (
    <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-30 flex items-center justify-between px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-slate-800 hidden sm:block">
          AI-Based Internship & Placement System
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full"></span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm border border-slate-200">
            {currentUser?.user?.name ? currentUser.user.name[0].toUpperCase() : 'U'}
          </div>

          <div className="hidden md:block">
            <div className="text-sm font-medium text-slate-800 leading-none">{currentUser?.user?.name || 'User'}</div>
            <div className="mt-1 flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.class}`}>
                <RoleIcon className="w-2.5 h-2.5 mr-1" />
                {badge.label}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
