require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { query, get, run } = require('./db/db');

const app = express();
app.use(cors());
app.use(express.json());

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ---------------------------------------------------------------------
// MATCH SCORE CALCULATION ALGORITHM
// ---------------------------------------------------------------------
async function calculateMatchScore(studentId, jobId) {
  const student = await get('SELECT cgpa FROM students WHERE student_id=?', [studentId]);
  const studentCgpa = student ? student.cgpa : 0;
  
  const job = await get('SELECT min_cgpa FROM jobs WHERE job_id=?', [jobId]);
  const requiredCgpa = job ? job.min_cgpa : 0;

  const totalJobSkillsRow = await get('SELECT COUNT(*) AS c FROM job_skills WHERE job_id=?', [jobId]);
  const totalJobSkills = totalJobSkillsRow ? totalJobSkillsRow.c : 0;

  const matchedSkillsRow = await get(`
    SELECT COUNT(*) AS c
    FROM job_skills js
    JOIN student_skills ss ON ss.skill_id = js.skill_id
    WHERE js.job_id=? AND ss.student_id=?
  `, [jobId, studentId]);
  const matchedSkills = matchedSkillsRow ? matchedSkillsRow.c : 0;

  let skillScore = 0;
  if (totalJobSkills === 0) {
    skillScore = 70;
  } else {
    skillScore = (matchedSkills / totalJobSkills) * 70;
  }

  let cgpaScore = 0;
  if (studentCgpa >= requiredCgpa) {
    cgpaScore = 30;
  } else {
    cgpaScore = Math.max(0, 30 - ((requiredCgpa - studentCgpa) * 20));
  }

  const overall = Number(Math.min(100, skillScore + cgpaScore).toFixed(2));
  return {
    overall,
    skillScore: Number(skillScore.toFixed(2)),
    cgpaScore: Number(cgpaScore.toFixed(2)),
    matchedSkills,
    totalJobSkills,
    studentCgpa,
    requiredCgpa,
    cgpaSatisfied: studentCgpa >= requiredCgpa
  };
}

// Helper to log application status change to history
async function updateApplicationStatus(applicationId, newStatusName) {
  const statusRow = await get('SELECT status_id FROM application_status WHERE status_name=?', [newStatusName]);
  if (!statusRow) throw new Error('Invalid status name');

  const appRow = await get(`
    SELECT a.status_id, old_s.status_name AS old_status_name
    FROM applications a
    JOIN application_status old_s ON a.status_id = old_s.status_id
    WHERE a.application_id=?
  `, [applicationId]);

  if (!appRow) throw new Error('Application not found');

  const oldStatusName = appRow.old_status_name;
  const newStatusId = statusRow.status_id;

  await run('UPDATE applications SET status_id=?, updated_at=CURRENT_TIMESTAMP WHERE application_id=?',
    [newStatusId, applicationId]);

  if (oldStatusName !== newStatusName) {
    await run('INSERT INTO application_history(application_id, old_status, new_status) VALUES(?,?,?)',
      [applicationId, oldStatusName, newStatusName]);
  }
}

// ---------------------------------------------------------------------
// API ENDPOINTS
// ---------------------------------------------------------------------

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await get('SELECT 1');
    res.json({ ok: true, message: 'Database connected successfully' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await get(
      'SELECT user_id, name, email, role FROM users WHERE email=? AND password_hash=?',
      [email, hashPassword(password)]
    );
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await get('SELECT student_id, roll_no, branch, cgpa, graduation_year, phone FROM students WHERE user_id=?', [user.user_id]);
    } else if (user.role === 'RECRUITER') {
      profile = await get('SELECT company_id, company_name, location, website FROM companies WHERE recruiter_user_id=?', [user.user_id]);
    }

    res.json({ user, profile });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// STUDENT REGISTRATION
app.post('/api/students', async (req, res) => {
  try {
    const { name, email, password, roll_no, branch, cgpa, graduation_year, phone } = req.body;
    if (!name || !email || !password || !roll_no || !branch || !cgpa || !graduation_year) {
      return res.status(400).json({ error: 'All required student fields must be filled' });
    }

    const existingUser = await get('SELECT user_id FROM users WHERE email=?', [email]);
    if (existingUser) return res.status(400).json({ error: 'Email is already registered' });

    const existingRoll = await get('SELECT student_id FROM students WHERE roll_no=?', [roll_no]);
    if (existingRoll) return res.status(400).json({ error: 'Roll number is already registered' });

    const uRes = await run(
      'INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,"STUDENT")',
      [name, email, hashPassword(password)]
    );
    const userId = uRes.lastID;

    const sRes = await run(
      'INSERT INTO students(user_id,roll_no,branch,cgpa,graduation_year,phone) VALUES(?,?,?,?,?,?)',
      [userId, roll_no, branch, cgpa, graduation_year, phone || null]
    );

    res.status(201).json({
      message: 'Student registered successfully',
      user_id: userId,
      student_id: sRes.lastID
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET STUDENT BY ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await get(`
      SELECT s.student_id, s.user_id, u.name, u.email, s.roll_no, s.branch, s.cgpa,
             s.graduation_year, s.phone,
             GROUP_CONCAT(sk.skill_name) AS skills_str
      FROM students s JOIN users u ON s.user_id=u.user_id
      LEFT JOIN student_skills ss ON s.student_id=ss.student_id
      LEFT JOIN skills sk ON ss.skill_id=sk.skill_id
      WHERE s.student_id=? GROUP BY s.student_id`, [req.params.id]);
    
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    const skillsList = student.skills_str ? student.skills_str.split(',') : [];
    const skillRows = await query('SELECT skill_id FROM student_skills WHERE student_id=?', [req.params.id]);
    student.skill_ids = skillRows.map(r => r.skill_id);
    student.skills = skillsList;
    delete student.skills_str;

    res.json(student);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// UPDATE STUDENT SKILLS & PROFILE
app.post('/api/students/:id/skills', async (req, res) => {
  try {
    const studentId = req.params.id;
    const { skill_ids, branch, cgpa, phone } = req.body;

    if (branch || cgpa || phone) {
      await run('UPDATE students SET branch=COALESCE(?, branch), cgpa=COALESCE(?, cgpa), phone=COALESCE(?, phone) WHERE student_id=?',
        [branch || null, cgpa || null, phone || null, studentId]);
    }

    if (Array.isArray(skill_ids)) {
      await run('DELETE FROM student_skills WHERE student_id=?', [studentId]);
      for (const skillId of skill_ids) {
        await run('INSERT INTO student_skills(student_id, skill_id) VALUES(?,?)', [studentId, skillId]);
      }
    }

    res.json({ message: 'Profile and skills updated successfully' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET JOBS LIST (WITH FILTERS & MATCH SCORE IF STUDENT ID PROVIDED)
app.get('/api/jobs', async (req, res) => {
  try {
    const { q = '', location = '', type = '', minCgpa = '', studentId = '' } = req.query;

    let sql = `
      SELECT j.job_id, j.company_id, j.title, j.description, j.job_type, j.location,
             j.min_cgpa, j.openings, j.deadline, j.created_at, c.company_name
      FROM jobs j JOIN companies c ON j.company_id=c.company_id
      WHERE (j.title LIKE ? OR j.description LIKE ? OR c.company_name LIKE ?)
    `;
    const params = [`%${q}%`, `%${q}%`, `%${q}%`];

    if (location) { sql += ' AND j.location=?'; params.push(location); }
    if (type) { sql += ' AND j.job_type=?'; params.push(type); }
    if (minCgpa) { sql += ' AND j.min_cgpa <= ?'; params.push(Number(minCgpa)); }

    sql += ' ORDER BY j.created_at DESC';
    const jobs = await query(sql, params);

    for (const job of jobs) {
      const skillsRows = await query(`
        SELECT sk.skill_name
        FROM job_skills js JOIN skills sk ON js.skill_id=sk.skill_id
        WHERE js.job_id=?`, [job.job_id]);
      job.skills = skillsRows.map(s => s.skill_name);

      if (studentId) {
        const matchData = await calculateMatchScore(studentId, job.job_id);
        job.match_score = matchData.overall;
        job.match_details = matchData;
      }
    }

    res.json(jobs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET SINGLE JOB DETAILS
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { studentId } = req.query;
    const job = await get(`
      SELECT j.job_id, j.company_id, j.title, j.description, j.job_type, j.location,
             j.min_cgpa, j.openings, j.deadline, j.created_at, c.company_name, c.website
      FROM jobs j JOIN companies c ON j.company_id=c.company_id
      WHERE j.job_id=?`, [req.params.id]);

    if (!job) return res.status(404).json({ error: 'Job not found' });

    const skillsRows = await query(`
      SELECT sk.skill_id, sk.skill_name
      FROM job_skills js JOIN skills sk ON js.skill_id=sk.skill_id
      WHERE js.job_id=?`, [job.job_id]);
    job.skills = skillsRows;

    if (studentId) {
      job.match_details = await calculateMatchScore(studentId, job.job_id);
      job.match_score = job.match_details.overall;

      const appRow = await get('SELECT application_id, status_id FROM applications WHERE student_id=? AND job_id=?', [studentId, job.job_id]);
      job.has_applied = Boolean(appRow);
    }

    res.json(job);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST NEW JOB (RECRUITER)
app.post('/api/jobs', async (req, res) => {
  try {
    const { company_id, title, description, job_type, location, min_cgpa, openings, deadline, skill_ids } = req.body;
    if (!company_id || !title || !job_type || !location) {
      return res.status(400).json({ error: 'Company, Title, Job Type, and Location are required' });
    }

    const jRes = await run(`
      INSERT INTO jobs(company_id, title, description, job_type, location, min_cgpa, openings, deadline)
      VALUES(?,?,?,?,?,?,?,?)`,
      [company_id, title, description || '', job_type, location, min_cgpa || 0, openings || 1, deadline || null]
    );

    const jobId = jRes.lastID;
    if (Array.isArray(skill_ids)) {
      for (const skillId of skill_ids) {
        await run('INSERT INTO job_skills(job_id, skill_id) VALUES(?,?)', [jobId, skillId]);
      }
    }

    res.status(201).json({ message: 'Job posted successfully', job_id: jobId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// SUBMIT APPLICATION
app.post('/api/applications', async (req, res) => {
  try {
    const { student_id, job_id } = req.body;
    if (!student_id || !job_id) {
      return res.status(400).json({ error: 'Student ID and Job ID are required' });
    }

    const existing = await get('SELECT application_id FROM applications WHERE student_id=? AND job_id=?', [student_id, job_id]);
    if (existing) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    const matchData = await calculateMatchScore(student_id, job_id);
    const statusRow = await get("SELECT status_id FROM application_status WHERE status_name='Applied'");
    const statusId = statusRow ? statusRow.status_id : 1;

    const aRes = await run(
      'INSERT INTO applications(student_id, job_id, match_score, status_id) VALUES(?,?,?,?)',
      [student_id, job_id, matchData.overall, statusId]
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      application_id: aRes.lastID,
      match_score: matchData.overall
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET STUDENT APPLICATIONS (MY APPLICATIONS PAGE)
app.get('/api/students/:id/applications', async (req, res) => {
  try {
    const rows = await query(`
      SELECT a.application_id, a.job_id, j.title, c.company_name, c.location,
             a.match_score, s.status_name, a.applied_at, a.updated_at
      FROM applications a
      JOIN jobs j ON a.job_id=j.job_id
      JOIN companies c ON j.company_id=c.company_id
      JOIN application_status s ON a.status_id=s.status_id
      WHERE a.student_id=? ORDER BY a.applied_at DESC`, [req.params.id]);

    for (const row of rows) {
      const history = await query(`
        SELECT old_status, new_status, changed_at
        FROM application_history
        WHERE application_id=? ORDER BY changed_at ASC`, [row.application_id]);
      row.history = history;
    }

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET RECRUITER POSTED JOBS
app.get('/api/companies/:companyId/jobs', async (req, res) => {
  try {
    const jobs = await query(`
      SELECT j.job_id, j.title, j.job_type, j.location, j.openings, j.created_at,
             COUNT(a.application_id) AS applicant_count
      FROM jobs j
      LEFT JOIN applications a ON j.job_id=a.job_id
      WHERE j.company_id=?
      GROUP BY j.job_id ORDER BY j.created_at DESC`, [req.params.companyId]);
    res.json(jobs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET RECRUITER APPLICANTS FOR A JOB
app.get('/api/jobs/:jobId/applicants', async (req, res) => {
  try {
    const applicants = await query(`
      SELECT a.application_id, a.student_id, u.name AS student_name, u.email,
             s.roll_no, s.branch, s.cgpa, s.phone, a.match_score,
             st.status_name, a.applied_at
      FROM applications a
      JOIN students s ON a.student_id=s.student_id
      JOIN users u ON s.user_id=u.user_id
      JOIN application_status st ON a.status_id=st.status_id
      WHERE a.job_id=? ORDER BY a.match_score DESC`, [req.params.jobId]);

    res.json(applicants);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// UPDATE APPLICATION STATUS (RECRUITER / ADMIN)
app.patch('/api/applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    await updateApplicationStatus(req.params.id, status);
    res.json({ message: `Application status updated to ${status}` });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ADMIN MASTER DATA & DASHBOARD
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalStudents = await get('SELECT COUNT(*) AS c FROM students');
    const totalCompanies = await get('SELECT COUNT(*) AS c FROM companies');
    const totalJobs = await get('SELECT COUNT(*) AS c FROM jobs');
    const totalApplications = await get('SELECT COUNT(*) AS c FROM applications');
    const totalSelected = await get(`
      SELECT COUNT(*) AS c FROM applications a
      JOIN application_status s ON a.status_id=s.status_id
      WHERE s.status_name='Selected'`);

    const statusChart = await query(`
      SELECT s.status_name AS name, COUNT(a.application_id) AS value
      FROM application_status s LEFT JOIN applications a ON s.status_id=a.status_id
      GROUP BY s.status_id ORDER BY s.status_id`);

    const skillsChart = await query(`
      SELECT sk.skill_name AS name, COUNT(js.job_id) AS count
      FROM skills sk LEFT JOIN job_skills js ON sk.skill_id=js.skill_id
      GROUP BY sk.skill_id ORDER BY count DESC LIMIT 8`);

    const skillGap = await query(`
      SELECT sk.skill_name AS name,
             COUNT(DISTINCT js.job_id) AS jobDemand,
             COUNT(DISTINCT ss.student_id) AS studentSupply
      FROM skills sk
      LEFT JOIN job_skills js ON sk.skill_id=js.skill_id
      LEFT JOIN student_skills ss ON sk.skill_id=ss.skill_id
      GROUP BY sk.skill_id ORDER BY jobDemand DESC LIMIT 8`);

    const branchDistribution = await query(`
      SELECT s.branch AS branch,
             COUNT(DISTINCT s.student_id) AS totalStudents,
             COUNT(DISTINCT CASE WHEN st.status_name='Selected' THEN s.student_id END) AS placedStudents,
             ROUND(AVG(a.match_score), 1) AS avgMatchScore
      FROM students s
      LEFT JOIN applications a ON s.student_id = a.student_id
      LEFT JOIN application_status st ON a.status_id = st.status_id
      GROUP BY s.branch`);

    const avgCgpaPlaced = await get(`
      SELECT ROUND(AVG(s.cgpa), 2) as avgCgpa
      FROM students s
      JOIN applications a ON s.student_id = a.student_id
      JOIN application_status st ON a.status_id = st.status_id
      WHERE st.status_name='Selected'`);

    const companyReport = await query('SELECT * FROM placement_statistics');

    const rawApplications = await query(`
      SELECT a.application_id, s.branch, j.job_type, j.title AS job_title,
             c.company_name, a.match_score, st.status_name, a.applied_at
      FROM applications a
      JOIN students s ON a.student_id=s.student_id
      JOIN jobs j ON a.job_id=j.job_id
      JOIN companies c ON j.company_id=c.company_id
      JOIN application_status st ON a.status_id=st.status_id`);

    res.json({
      stats: {
        totalStudents: totalStudents.c,
        totalCompanies: totalCompanies.c,
        totalJobs: totalJobs.c,
        totalApplications: totalApplications.c,
        totalSelected: totalSelected.c,
        placementRate: totalStudents.c ? ((totalSelected.c / totalStudents.c) * 100).toFixed(1) : '0.0',
        avgCgpaPlaced: avgCgpaPlaced?.avgCgpa || '0.00'
      },
      statusChart,
      skillsChart,
      skillGap,
      branchDistribution,
      companyReport,
      rawApplications
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET ALL APPLICATIONS (FOR ADMIN)
app.get('/api/applications', async (req, res) => {
  try {
    const rows = await query(`
      SELECT a.application_id, u.name AS student_name, s.roll_no, s.branch,
             j.title AS job_title, c.company_name, a.match_score, st.status_name,
             a.applied_at
      FROM applications a
      JOIN students s ON a.student_id=s.student_id
      JOIN users u ON s.user_id=u.user_id
      JOIN jobs j ON a.job_id=j.job_id
      JOIN companies c ON j.company_id=c.company_id
      JOIN application_status st ON a.status_id=st.status_id
      ORDER BY a.applied_at DESC`);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PLACEMENT REPORTS API
app.get('/api/reports/placement', async (req, res) => {
  try {
    const totalStudentsRow = await get('SELECT COUNT(*) AS c FROM students');
    const totalStudents = totalStudentsRow ? totalStudentsRow.c : 0;

    const placedStudentsRow = await get(`
      SELECT COUNT(DISTINCT student_id) AS c
      FROM applications a JOIN application_status s ON a.status_id=s.status_id
      WHERE s.status_name='Selected'`);
    const placedStudents = placedStudentsRow ? placedStudentsRow.c : 0;

    const percentage = totalStudents > 0 ? Number(((placedStudents / totalStudents) * 100).toFixed(2)) : 0;

    const companyStats = await query('SELECT * FROM placement_statistics');

    const avgMatchRow = await get('SELECT ROUND(AVG(match_score),2) AS avg_match FROM applications');
    const avgMatchScore = avgMatchRow ? (avgMatchRow.avg_match || 0) : 0;

    res.json({
      totalStudents,
      placedStudents,
      placementPercentage: percentage,
      avgMatchScore,
      companyStats
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------
// ADVANCED PLACEMENT ANALYTICS & DECISION INTELLIGENCE ENDPOINTS
// ---------------------------------------------------------------------

// 1. FILTERED ANALYTICS OVERVIEW
app.get('/api/admin/analytics/overview', async (req, res) => {
  try {
    const { branch, jobType, status, companyId, minCgpa, minMatch, q } = req.query;

    let whereConditions = ['1=1'];
    let params = [];

    if (branch && branch !== 'ALL') {
      whereConditions.push('s.branch = ?');
      params.push(branch);
    }
    if (jobType && jobType !== 'ALL') {
      whereConditions.push('j.job_type = ?');
      params.push(jobType);
    }
    if (status && status !== 'ALL') {
      whereConditions.push('st.status_name = ?');
      params.push(status);
    }
    if (companyId && companyId !== 'ALL') {
      whereConditions.push('c.company_id = ?');
      params.push(Number(companyId));
    }
    if (minCgpa) {
      whereConditions.push('s.cgpa >= ?');
      params.push(Number(minCgpa));
    }
    if (minMatch) {
      whereConditions.push('a.match_score >= ?');
      params.push(Number(minMatch));
    }
    if (q) {
      whereConditions.push('(j.title LIKE ? OR c.company_name LIKE ? OR u.name LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Filtered applications
    const applications = await query(`
      SELECT a.application_id, a.student_id, u.name AS student_name, s.roll_no, s.branch, s.cgpa,
             j.job_id, j.title AS job_title, j.job_type, c.company_id, c.company_name,
             a.match_score, st.status_id, st.status_name, a.applied_at
      FROM applications a
      JOIN students s ON a.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      JOIN jobs j ON a.job_id = j.job_id
      JOIN companies c ON j.company_id = c.company_id
      JOIN application_status st ON a.status_id = st.status_id
      WHERE ${whereClause}
      ORDER BY a.applied_at DESC`, params);

    // Filtered KPIs
    const totalApps = applications.length;
    const uniqueStudentsApplied = new Set(applications.map(a => a.student_id)).size;
    const shortlistedCount = applications.filter(a => a.status_name === 'Shortlisted').length;
    const selectedCount = applications.filter(a => a.status_name === 'Selected').length;
    const avgMatchScore = totalApps > 0
      ? Number((applications.reduce((sum, a) => sum + a.match_score, 0) / totalApps).toFixed(1))
      : 0;

    const totalStudentsInDb = (await get('SELECT COUNT(*) AS c FROM students')).c;
    const placementRate = totalStudentsInDb > 0
      ? Number(((selectedCount / totalStudentsInDb) * 100).toFixed(1))
      : 0;

    // Match Score Distribution Buckets (0-40, 40-60, 60-70, 70-80, 80-90, 90-100)
    const matchBuckets = [
      { range: '0–40%', count: 0 },
      { range: '40–60%', count: 0 },
      { range: '60–70%', count: 0 },
      { range: '70–80%', count: 0 },
      { range: '80–90%', count: 0 },
      { range: '90–100%', count: 0 }
    ];

    applications.forEach(a => {
      const score = a.match_score;
      if (score < 40) matchBuckets[0].count++;
      else if (score < 60) matchBuckets[1].count++;
      else if (score < 70) matchBuckets[2].count++;
      else if (score < 80) matchBuckets[3].count++;
      else if (score < 90) matchBuckets[4].count++;
      else matchBuckets[5].count++;
    });

    // Recruitment Conversion Funnel
    const statusCounts = { Applied: 0, Shortlisted: 0, Interview: 0, Selected: 0, Rejected: 0 };
    applications.forEach(a => {
      if (statusCounts[a.status_name] !== undefined) {
        statusCounts[a.status_name]++;
      }
    });

    const funnel = [
      { stage: 'Applied', count: totalApps, conversionPct: 100 },
      { stage: 'Shortlisted', count: statusCounts.Shortlisted + statusCounts.Interview + statusCounts.Selected, conversionPct: totalApps ? Number((((statusCounts.Shortlisted + statusCounts.Interview + statusCounts.Selected) / totalApps) * 100).toFixed(1)) : 0 },
      { stage: 'Interview', count: statusCounts.Interview + statusCounts.Selected, conversionPct: totalApps ? Number((((statusCounts.Interview + statusCounts.Selected) / totalApps) * 100).toFixed(1)) : 0 },
      { stage: 'Selected', count: statusCounts.Selected, conversionPct: totalApps ? Number(((statusCounts.Selected / totalApps) * 100).toFixed(1)) : 0 }
    ];

    // Data Quality Metrics
    const totalStudents = totalStudentsInDb;
    const studentsWithSkills = (await get('SELECT COUNT(DISTINCT student_id) AS c FROM student_skills')).c;
    const jobsWithSkills = (await get('SELECT COUNT(DISTINCT job_id) AS c FROM job_skills')).c;
    const totalJobs = (await get('SELECT COUNT(*) AS c FROM jobs')).c;

    const dataQuality = {
      profileCompletenessPct: totalStudents ? Number(((studentsWithSkills / totalStudents) * 100).toFixed(1)) : 100,
      jobSkillCoveragePct: totalJobs ? Number(((jobsWithSkills / totalJobs) * 100).toFixed(1)) : 100,
      matchScoreIntegrityPct: 100
    };

    res.json({
      kpis: {
        totalStudents: totalStudentsInDb,
        activeJobs: totalJobs,
        totalApplications: totalApps,
        uniqueStudentsApplied,
        shortlistedCount,
        selectedCount,
        placementRate,
        avgMatchScore
      },
      matchDistribution: matchBuckets,
      funnel,
      dataQuality,
      applications
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. STUDENT PLACEMENT READINESS INDEX
app.get('/api/admin/analytics/placement-readiness', async (req, res) => {
  try {
    const students = await query(`
      SELECT s.student_id, u.name, u.email, s.roll_no, s.branch, s.cgpa,
             COUNT(DISTINCT ss.skill_id) AS skill_count,
             COUNT(DISTINCT a.application_id) AS app_count,
             ROUND(AVG(a.match_score), 1) AS avg_match,
             MAX(a.match_score) AS best_match,
             SUM(CASE WHEN st.status_name IN ('Shortlisted', 'Interview', 'Selected') THEN 1 ELSE 0 END) AS shortlist_count,
             SUM(CASE WHEN st.status_name = 'Selected' THEN 1 ELSE 0 END) AS is_selected
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN student_skills ss ON s.student_id = ss.student_id
      LEFT JOIN applications a ON s.student_id = a.student_id
      LEFT JOIN application_status st ON a.status_id = st.status_id
      GROUP BY s.student_id`);

    const readinessList = students.map(st => {
      const cgpaComp = Math.min(30, (st.cgpa / 10) * 30);
      const skillComp = Math.min(30, (st.skill_count / 5) * 30);
      const matchComp = Math.min(25, ((st.avg_match || 0) / 100) * 25);
      const activityComp = Math.min(15, (st.app_count / 3) * 15);

      const readinessScore = Number(Math.min(100, cgpaComp + skillComp + matchComp + activityComp).toFixed(1));

      let category = 'NEEDS IMPROVEMENT';
      let badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
      if (readinessScore >= 80 || st.is_selected > 0) {
        category = 'HIGH READINESS';
        badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      } else if (readinessScore >= 60) {
        category = 'MEDIUM READINESS';
        badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
      }

      const strengths = [];
      const growthAreas = [];

      if (st.cgpa >= 8.0) strengths.push('Strong CGPA Score');
      else growthAreas.push('Improve CGPA');

      if (st.skill_count >= 4) strengths.push('Good Skill Diversity');
      else growthAreas.push('Add More Technical Skills');

      if ((st.avg_match || 0) >= 80) strengths.push('High Job Match Profile');
      if (st.app_count === 0) growthAreas.push('Increase Job Application Participation');

      return {
        student_id: st.student_id,
        name: st.name,
        roll_no: st.roll_no,
        branch: st.branch,
        cgpa: st.cgpa,
        skill_count: st.skill_count,
        app_count: st.app_count,
        avg_match: st.avg_match || 0,
        best_match: st.best_match || 0,
        is_placed: st.is_selected > 0,
        readinessScore,
        category,
        badgeClass,
        strengths,
        growthAreas
      };
    });

    readinessList.sort((a, b) => b.readinessScore - a.readinessScore);
    res.json(readinessList);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3. AUTOMATED PLACEMENT INTELLIGENCE ALERTS & INSIGHTS
app.get('/api/admin/analytics/insights', async (req, res) => {
  try {
    const insights = [];

    // Insight 1: Most Demanded Skill
    const topSkill = await get(`
      SELECT sk.skill_name, COUNT(js.job_id) AS demand
      FROM skills sk JOIN job_skills js ON sk.skill_id = js.skill_id
      GROUP BY sk.skill_id ORDER BY demand DESC LIMIT 1`);

    if (topSkill) {
      insights.push({
        type: 'DEMAND',
        title: 'High Technical Skill Demand',
        message: `"${topSkill.skill_name}" is currently the most demanded skill across ${topSkill.demand} active job postings. Encourage students to feature this on profiles.`,
        priority: 'HIGH'
      });
    }

    // Insight 2: Skill Gap Alert
    const skillGap = await query(`
      SELECT sk.skill_name,
             COUNT(DISTINCT js.job_id) AS demand,
             COUNT(DISTINCT ss.student_id) AS supply
      FROM skills sk
      JOIN job_skills js ON sk.skill_id = js.skill_id
      LEFT JOIN student_skills ss ON sk.skill_id = ss.skill_id
      GROUP BY sk.skill_id
      HAVING demand > supply
      ORDER BY (demand - supply) DESC LIMIT 1`);

    if (skillGap.length > 0) {
      const gap = skillGap[0];
      insights.push({
        type: 'GAP',
        title: 'Critical Skill Supply Shortage',
        message: `Skill "${gap.skill_name}" is required by ${gap.demand} active jobs, but only ${gap.supply} students possess it. Recommended intervention: host a training workshop on ${gap.skill_name}.`,
        priority: 'WARNING'
      });
    }

    // Insight 3: High Match Unapplied Candidates Opportunity
    const highMatches = await query(`
      SELECT COUNT(*) as count
      FROM students s
      CROSS JOIN jobs j
      LEFT JOIN applications a ON s.student_id = a.student_id AND j.job_id = a.job_id
      WHERE a.application_id IS NULL AND s.cgpa >= j.min_cgpa`);

    if (highMatches.length > 0 && highMatches[0].count > 0) {
      insights.push({
        type: 'OPPORTUNITY',
        title: 'Untapped Placement Opportunities',
        message: `Found ${highMatches[0].count} eligible candidate-job combinations with no application submitted yet. Trigger automated application reminders.`,
        priority: 'INFO'
      });
    }

    res.json(insights);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 4. REPORT EXPORT GENERATOR (PDF / Excel / CSV Data with Analytical Summary)
app.post('/api/admin/reports/export', async (req, res) => {
  try {
    const { reportType, format, branch, jobType, status } = req.body;

    const totalStudents = (await get('SELECT COUNT(*) AS c FROM students')).c;
    const placedStudents = (await get(`
      SELECT COUNT(DISTINCT student_id) AS c
      FROM applications a JOIN application_status s ON a.status_id=s.status_id
      WHERE s.status_name='Selected'`)).c;
    const placementRate = totalStudents ? ((placedStudents / totalStudents) * 100).toFixed(1) : '0.0';

    const topSkillRow = await get(`
      SELECT sk.skill_name, COUNT(js.job_id) AS demand
      FROM skills sk JOIN job_skills js ON sk.skill_id = js.skill_id
      GROUP BY sk.skill_id ORDER BY demand DESC LIMIT 1`);

    const topCompanyRow = await get('SELECT company_name, total_applications FROM placement_statistics ORDER BY total_applications DESC LIMIT 1');

    const conclusion = `ANALYTICAL CONCLUSION & EXECUTIVE SUMMARY:\n` +
      `The placement analysis reflects a total of ${totalStudents} registered students across academic departments, with an overall placement selection rate of ${placementRate}%. ` +
      `The technical skill "${topSkillRow ? topSkillRow.skill_name : 'SQL'}" exhibits the highest market demand. ` +
      `Corporate recruiting is led by ${topCompanyRow ? topCompanyRow.company_name : 'TechNova Solutions'}. ` +
      `Strategic recommendations: Conduct targeted skill bootcamps for supply-gap technical skills and motivate high-match eligible candidates to apply prior to deadlines.`;

    const apps = await query(`
      SELECT a.application_id, u.name AS student_name, s.roll_no, s.branch, s.cgpa,
             j.title AS job_title, c.company_name, a.match_score, st.status_name, a.applied_at
      FROM applications a
      JOIN students s ON a.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      JOIN jobs j ON a.job_id = j.job_id
      JOIN companies c ON j.company_id = c.company_id
      JOIN application_status st ON a.status_id = st.status_id
      ORDER BY a.applied_at DESC`);

    if (format === 'CSV') {
      let csv = 'Application ID,Student Name,Roll No,Branch,CGPA,Job Title,Company,AI Match Score,Status,Applied Date\n';
      apps.forEach(a => {
        csv += `"${a.application_id}","${a.student_name}","${a.roll_no}","${a.branch}","${a.cgpa}","${a.job_title}","${a.company_name}","${a.match_score}%","${a.status_name}","${a.applied_at}"\n`;
      });
      csv += `\n"${conclusion.replace(/"/g, '""')}"\n`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=placement_report_${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({
      reportType: reportType || 'Placement Summary Report',
      generatedAt: new Date().toLocaleString(),
      filtersApplied: { branch: branch || 'ALL', jobType: jobType || 'ALL', status: status || 'ALL' },
      summary: { totalStudents, placedStudents, placementRate: `${placementRate}%` },
      conclusion,
      data: apps
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SKILLS CATALOG
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await query('SELECT skill_id, skill_name FROM skills ORDER BY skill_name');
    res.json(skills);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve static client assets for single-service deployment on Render
const clientDistPath = path.resolve(__dirname, '../client/dist');
console.log('Serving static files from:', clientDistPath, '| Exists:', fs.existsSync(clientDistPath));

app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`Frontend build not found at ${clientDistPath}. Please ensure build step ran correctly.`);
  }
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => console.log(`Backend Express Server running at http://localhost:${PORT}`));

