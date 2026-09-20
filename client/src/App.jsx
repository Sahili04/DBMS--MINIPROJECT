import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';

import StudentDashboard from './pages/StudentDashboard';
import JobListings from './pages/JobListings';
import JobDetails from './pages/JobDetails';
import StudentApplications from './pages/StudentApplications';
import StudentProfile from './pages/StudentProfile';

import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterPostJob from './pages/RecruiterPostJob';

import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import AdminMasterData from './pages/AdminMasterData';

function AppLayout({ currentUser, onLogout, children }) {
  const role = currentUser?.user?.role;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar role={role} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar currentUser={currentUser} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('placement_hub_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('placement_hub_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('placement_hub_user');
  };

  const isAuthenticated = Boolean(currentUser);
  const role = currentUser?.user?.role;

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              role === 'ADMIN' ? <Navigate to="/admin" replace /> :
              role === 'RECRUITER' ? <Navigate to="/recruiter" replace /> :
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route path="/register" element={<RegisterStudent />} />

        {/* Protected Student Routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated && role === 'STUDENT' ? (
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <StudentDashboard currentUser={currentUser} />
              </AppLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/jobs"
          element={
            isAuthenticated ? (
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <JobListings currentUser={currentUser} />
              </AppLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/jobs/:jobId"
          element={
            isAuthenticated ? (
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <JobDetails currentUser={currentUser} />
              </AppLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/my-applications"
          element={
            isAuthenticated && role === 'STUDENT' ? (
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <StudentApplications currentUser={currentUser} />
              </AppLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isAuthenticated && role === 'STUDENT' ? (
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <StudentProfile currentUser={currentUser} />
              </AppLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Protected Recruiter Routes */}
        <Route
          path="/recruiter"
          element={
            isAuthenticated && role === 'RECRUITER' ? (
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <RecruiterDashboard currentUser={currentUser} />
              </AppLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/recruiter/post-job"
          element={
            isAuthenticated && role === 'RECRUITER' ? (
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <RecruiterPostJob currentUser={currentUser} />
              </AppLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            isAuthenticated && role === 'ADMIN' ? (
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <AdminDashboard />
              </AppLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/reports"
          element={
            isAuthenticated && role === 'ADMIN' ? (
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <AdminReports />
              </AppLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/master-data"
          element={
            isAuthenticated && role === 'ADMIN' ? (
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <AdminMasterData />
              </AppLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
