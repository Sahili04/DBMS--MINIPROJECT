const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const dbPath = path.join(__dirname, 'placement_db.sqlite');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function initDb() {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON;");

    db.run(`
      CREATE TABLE users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('STUDENT','RECRUITER','ADMIN')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.run(`
      CREATE TABLE students (
        student_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        roll_no TEXT NOT NULL UNIQUE,
        branch TEXT NOT NULL,
        cgpa REAL NOT NULL CHECK (cgpa BETWEEN 0 AND 10),
        graduation_year INTEGER NOT NULL,
        phone TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE TABLE companies (
        company_id INTEGER PRIMARY KEY AUTOINCREMENT,
        recruiter_user_id INTEGER NOT NULL,
        company_name TEXT NOT NULL UNIQUE,
        location TEXT NOT NULL,
        website TEXT,
        FOREIGN KEY (recruiter_user_id) REFERENCES users(user_id) ON DELETE RESTRICT
      );
    `);

    db.run(`
      CREATE TABLE jobs (
        job_id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        job_type TEXT NOT NULL CHECK (job_type IN ('INTERNSHIP','FULL_TIME')),
        location TEXT NOT NULL,
        min_cgpa REAL DEFAULT 0 CHECK (min_cgpa BETWEEN 0 AND 10),
        openings INTEGER NOT NULL DEFAULT 1 CHECK (openings > 0),
        deadline DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE TABLE skills (
        skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill_name TEXT NOT NULL UNIQUE
      );
    `);

    db.run(`
      CREATE TABLE student_skills (
        student_id INTEGER NOT NULL,
        skill_id INTEGER NOT NULL,
        PRIMARY KEY (student_id, skill_id),
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE TABLE job_skills (
        job_id INTEGER NOT NULL,
        skill_id INTEGER NOT NULL,
        PRIMARY KEY (job_id, skill_id),
        FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE TABLE application_status (
        status_id INTEGER PRIMARY KEY AUTOINCREMENT,
        status_name TEXT NOT NULL UNIQUE
      );
    `);

    db.run(`
      CREATE TABLE applications (
        application_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        job_id INTEGER NOT NULL,
        match_score REAL NOT NULL DEFAULT 0 CHECK (match_score BETWEEN 0 AND 100),
        status_id INTEGER NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (student_id, job_id),
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
        FOREIGN KEY (status_id) REFERENCES application_status(status_id)
      );
    `);

    db.run(`
      CREATE TABLE application_history (
        history_id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        old_status TEXT,
        new_status TEXT NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE VIEW placement_statistics AS
      SELECT
        c.company_name,
        COUNT(a.application_id) AS total_applications,
        SUM(CASE WHEN s.status_name = 'Selected' THEN 1 ELSE 0 END) AS selected_students,
        ROUND(AVG(a.match_score), 2) AS average_match_score
      FROM companies c
      JOIN jobs j ON c.company_id = j.company_id
      LEFT JOIN applications a ON j.job_id = a.job_id
      LEFT JOIN application_status s ON a.status_id = s.status_id
      GROUP BY c.company_id, c.company_name;
    `);

    db.run(`
      CREATE TRIGGER trg_application_status_history
      AFTER UPDATE ON applications
      FOR EACH ROW
      WHEN OLD.status_id <> NEW.status_id
      BEGIN
        INSERT INTO application_history(application_id, old_status, new_status)
        SELECT NEW.application_id, old_s.status_name, new_s.status_name
        FROM application_status old_s, application_status new_s
        WHERE old_s.status_id = OLD.status_id
          AND new_s.status_id = NEW.status_id;
      END;
    `);

    // Seed Data
    const statuses = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
    statuses.forEach(s => db.run("INSERT INTO application_status(status_name) VALUES (?)", [s]));

    const skillsList = ['Python', 'SQL', 'Machine Learning', 'C++', 'Power BI', 'Java', 'Data Analysis', 'React', 'Communication', 'Node.js'];
    skillsList.forEach(sk => db.run("INSERT INTO skills(skill_name) VALUES (?)", [sk]));

    db.run("INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)",
      ['System Admin','admin@placement.local', hashPassword('admin123'), 'ADMIN']);
    db.run("INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)",
      ['Sahili Balpande','sahili@college.edu', hashPassword('student123'), 'STUDENT']);
    db.run("INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)",
      ['Rahul Deshmukh','rahul@college.edu', hashPassword('student123'), 'STUDENT']);
    db.run("INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)",
      ['Meera Joshi','meera@college.edu', hashPassword('student123'), 'STUDENT']);
    db.run("INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)",
      ['Aarav Mehta','aarav@college.edu', hashPassword('student123'), 'STUDENT']);
    db.run("INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)",
      ['Priya Sharma','priya@college.edu', hashPassword('student123'), 'STUDENT']);

    db.run("INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)",
      ['TechNova Recruiter','recruiter@technova.local', hashPassword('recruiter123'), 'RECRUITER']);
    db.run("INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)",
      ['DataSphere Hiring','hr@datasphere.local', hashPassword('recruiter123'), 'RECRUITER']);
    db.run("INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)",
      ['CloudScale HR','talent@cloudscale.local', hashPassword('recruiter123'), 'RECRUITER']);

    // Students
    db.run("INSERT INTO students(user_id,roll_no,branch,cgpa,graduation_year,phone) VALUES (?,?,?,?,?,?)",
      [2, 'AIDSU24015', 'AI & DS', 8.70, 2027, '9876543210']);
    db.run("INSERT INTO students(user_id,roll_no,branch,cgpa,graduation_year,phone) VALUES (?,?,?,?,?,?)",
      [3, 'CSEU24022', 'CSE', 7.90, 2027, '9876543211']);
    db.run("INSERT INTO students(user_id,roll_no,branch,cgpa,graduation_year,phone) VALUES (?,?,?,?,?,?)",
      [4, 'AIDSU24008', 'AI & DS', 9.10, 2026, '9876543212']);
    db.run("INSERT INTO students(user_id,roll_no,branch,cgpa,graduation_year,phone) VALUES (?,?,?,?,?,?)",
      [5, 'ITU24045', 'IT', 8.15, 2027, '9876543213']);
    db.run("INSERT INTO students(user_id,roll_no,branch,cgpa,graduation_year,phone) VALUES (?,?,?,?,?,?)",
      [6, 'AIDSU24031', 'AI & DS', 8.50, 2026, '9876543214']);

    // Companies
    db.run("INSERT INTO companies(recruiter_user_id,company_name,location,website) VALUES (?,?,?,?)",
      [7, 'TechNova Solutions', 'Pune', 'https://technova.example.com']);
    db.run("INSERT INTO companies(recruiter_user_id,company_name,location,website) VALUES (?,?,?,?)",
      [8, 'DataSphere Analytics', 'Bengaluru', 'https://datasphere.example.com']);
    db.run("INSERT INTO companies(recruiter_user_id,company_name,location,website) VALUES (?,?,?,?)",
      [9, 'CloudScale Systems', 'Mumbai', 'https://cloudscale.example.com']);

    // Jobs
    db.run(`INSERT INTO jobs(company_id,title,description,job_type,location,min_cgpa,openings,deadline) VALUES
      (1, 'Python Data Analyst Intern', 'Work on Python, SQL, and data processing workflows for real-time analytics.', 'INTERNSHIP', 'Pune', 7.00, 3, '2026-12-31'),
      (1, 'Junior ML Engineer', 'Entry-level role involving machine learning model tuning, Python, and C++.', 'FULL_TIME', 'Pune', 7.50, 2, '2027-02-28'),
      (2, 'Data Science Intern', 'Analyze datasets using Python, Power BI, and Machine Learning models.', 'INTERNSHIP', 'Bengaluru', 8.00, 4, '2026-11-30'),
      (2, 'BI & Analytics Associate', 'Build dashboards using Power BI and SQL for business intelligence reporting.', 'FULL_TIME', 'Bengaluru', 7.00, 2, '2026-12-15'),
      (3, 'Full Stack Web Intern', 'Develop modern web applications using React, Node.js, SQL, and REST APIs.', 'INTERNSHIP', 'Mumbai', 7.00, 3, '2026-12-20'),
      (3, 'Backend Engineer', 'Scale cloud backend APIs using Node.js, Java, and SQL databases.', 'FULL_TIME', 'Mumbai', 7.50, 2, '2027-01-31')`);

    // Student Skills
    db.run("INSERT INTO student_skills(student_id,skill_id) VALUES (1,1),(1,2),(1,3),(1,7)");
    db.run("INSERT INTO student_skills(student_id,skill_id) VALUES (2,6),(2,4),(2,2),(2,8)");
    db.run("INSERT INTO student_skills(student_id,skill_id) VALUES (3,1),(3,3),(3,7),(3,5),(3,2)");
    db.run("INSERT INTO student_skills(student_id,skill_id) VALUES (4,8),(4,10),(4,2),(4,9)");
    db.run("INSERT INTO student_skills(student_id,skill_id) VALUES (5,1),(5,2),(5,4),(5,3),(5,5)");

    // Job Skills
    db.run("INSERT INTO job_skills(job_id,skill_id) VALUES (1,1),(1,2),(1,7)");
    db.run("INSERT INTO job_skills(job_id,skill_id) VALUES (2,1),(2,3),(2,4)");
    db.run("INSERT INTO job_skills(job_id,skill_id) VALUES (3,1),(3,3),(3,7),(3,5)");
    db.run("INSERT INTO job_skills(job_id,skill_id) VALUES (4,5),(4,2),(4,7)");
    db.run("INSERT INTO job_skills(job_id,skill_id) VALUES (5,8),(5,10),(5,2)");
    db.run("INSERT INTO job_skills(job_id,skill_id) VALUES (6,10),(6,6),(6,2)");

    // Initial Applications
    db.run("INSERT INTO applications(student_id, job_id, match_score, status_id) VALUES (1, 1, 100.00, 1)");
    db.run("INSERT INTO applications(student_id, job_id, match_score, status_id) VALUES (1, 3, 82.50, 2)");
    db.run("INSERT INTO applications(student_id, job_id, match_score, status_id) VALUES (3, 3, 100.00, 3)");
    db.run("INSERT INTO applications(student_id, job_id, match_score, status_id) VALUES (2, 5, 82.50, 1)");
    db.run("INSERT INTO applications(student_id, job_id, match_score, status_id) VALUES (4, 5, 100.00, 4)");
    db.run("INSERT INTO applications(student_id, job_id, match_score, status_id) VALUES (5, 2, 100.00, 1)");
  });

  db.close();
}

module.exports = { initDb, dbPath };
