import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const loginUser = (data) => API.post('/login', data);
export const registerStudent = (data) => API.post('/students', data);

export const getStudentProfile = (id) => API.get(`/students/${id}`);
export const updateStudentSkills = (id, data) => API.post(`/students/${id}/skills`, data);

export const getJobs = (params) => API.get('/jobs', { params });
export const getJobDetails = (id, params) => API.get(`/jobs/${id}`, { params });
export const createJob = (data) => API.post('/jobs', data);

export const submitApplication = (data) => API.post('/applications', data);
export const getStudentApplications = (studentId) => API.get(`/students/${studentId}/applications`);
export const getRecruiterJobs = (companyId) => API.get(`/companies/${companyId}/jobs`);
export const getJobApplicants = (jobId) => API.get(`/jobs/${jobId}/applicants`);
export const updateApplicationStatus = (appId, status) => API.patch(`/applications/${appId}/status`, { status });

export const getDashboardData = () => API.get('/dashboard');
export const getPlacementReports = () => API.get('/reports/placement');
export const getAllApplications = () => API.get('/applications');
export const getSkills = () => API.get('/skills');

// ADVANCED BI ANALYTICS ENDPOINTS
export const getAnalyticsOverview = (params) => API.get('/admin/analytics/overview', { params });
export const getPlacementReadiness = () => API.get('/admin/analytics/placement-readiness');
export const getPlacementInsights = () => API.get('/admin/analytics/insights');
export const exportPlacementReport = (data, config = {}) => API.post('/admin/reports/export', data, config);

export default API;
