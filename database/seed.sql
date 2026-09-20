USE placement_db;

-- 1. Populate Application Status
INSERT INTO application_status(status_name) VALUES
('Applied'), ('Shortlisted'), ('Interview'), ('Selected'), ('Rejected');

-- 2. Populate Skills Catalog
INSERT INTO skills(skill_name) VALUES
('Python'), ('SQL'), ('Machine Learning'), ('C++'), ('Power BI'),
('Java'), ('Data Analysis'), ('React'), ('Communication'), ('Node.js');

-- 3. Populate Users
-- Passwords hash for SHA256('admin123'), SHA256('student123'), SHA256('recruiter123')
-- SHA256('admin123') = 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- SHA256('student123') = 952a20272c72b83eb14995f590a9ccdd59103c81e5927845f94d93d7e7c8ec17
-- SHA256('recruiter123') = c2171ff7647209930f789d2d46e9dfd807662c4314c46f1ec01c741490214a1c
INSERT INTO users(name, email, password_hash, role) VALUES
('System Admin',          'admin@placement.local',     SHA2('admin123', 256),     'ADMIN'),
('Sahili Balpande',      'sahili@college.edu',        SHA2('student123', 256),   'STUDENT'),
('Rahul Deshmukh',       'rahul@college.edu',         SHA2('student123', 256),   'STUDENT'),
('Meera Joshi',          'meera@college.edu',         SHA2('student123', 256),   'STUDENT'),
('Aarav Mehta',          'aarav@college.edu',         SHA2('student123', 256),   'STUDENT'),
('Priya Sharma',         'priya@college.edu',         SHA2('student123', 256),   'STUDENT'),
('TechNova Recruiter',   'recruiter@technova.local',  SHA2('recruiter123', 256), 'RECRUITER'),
('DataSphere Hiring',    'hr@datasphere.local',       SHA2('recruiter123', 256), 'RECRUITER'),
('CloudScale HR',        'talent@cloudscale.local',   SHA2('recruiter123', 256), 'RECRUITER');

-- 4. Populate Students
INSERT INTO students(user_id, roll_no, branch, cgpa, graduation_year, phone) VALUES
(2, 'AIDSU24015', 'AI & DS', 8.70, 2027, '9876543210'),
(3, 'CSEU24022',  'CSE',     7.90, 2027, '9876543211'),
(4, 'AIDSU24008', 'AI & DS', 9.10, 2026, '9876543212'),
(5, 'ITU24045',   'IT',      8.15, 2027, '9876543213'),
(6, 'AIDSU24031', 'AI & DS', 8.50, 2026, '9876543214');

-- 5. Populate Companies
INSERT INTO companies(recruiter_user_id, company_name, location, website) VALUES
(7, 'TechNova Solutions', 'Pune',      'https://technova.example.com'),
(8, 'DataSphere Analytics','Bengaluru', 'https://datasphere.example.com'),
(9, 'CloudScale Systems', 'Mumbai',    'https://cloudscale.example.com');

-- 6. Populate Jobs
INSERT INTO jobs(company_id, title, description, job_type, location, min_cgpa, openings, deadline) VALUES
(1, 'Python Data Analyst Intern', 'Work on Python, SQL, and data processing workflows for real-time analytics.', 'INTERNSHIP', 'Pune', 7.00, 3, '2026-12-31'),
(1, 'Junior ML Engineer',        'Entry-level role involving machine learning model tuning, Python, and C++.',     'FULL_TIME',  'Pune', 7.50, 2, '2027-02-28'),
(2, 'Data Science Intern',       'Analyze datasets using Python, Power BI, and Machine Learning models.',           'INTERNSHIP', 'Bengaluru', 8.00, 4, '2026-11-30'),
(2, 'BI & Analytics Associate',  'Build dashboards using Power BI and SQL for business intelligence reporting.',   'FULL_TIME',  'Bengaluru', 7.00, 2, '2026-12-15'),
(3, 'Full Stack Web Intern',     'Develop modern web applications using React, Node.js, SQL, and REST APIs.',       'INTERNSHIP', 'Mumbai', 7.00, 3, '2026-12-20'),
(3, 'Backend Engineer',          'Scale cloud backend APIs using Node.js, Java, and SQL databases.',                'FULL_TIME',  'Mumbai', 7.50, 2, '2027-01-31');

-- 7. Populate Student Skills
-- Student 1 (Sahili): Python, SQL, Machine Learning, Data Analysis
INSERT INTO student_skills(student_id, skill_id) VALUES (1,1),(1,2),(1,3),(1,7);
-- Student 2 (Rahul): Java, C++, SQL, React
INSERT INTO student_skills(student_id, skill_id) VALUES (2,6),(2,4),(2,2),(2,8);
-- Student 3 (Meera): Python, Machine Learning, Data Analysis, Power BI, SQL
INSERT INTO student_skills(student_id, skill_id) VALUES (3,1),(3,3),(3,7),(3,5),(3,2);
-- Student 4 (Aarav): React, Node.js, SQL, Communication
INSERT INTO student_skills(student_id, skill_id) VALUES (4,8),(4,10),(4,2),(4,9);
-- Student 5 (Priya): Python, SQL, C++, Machine Learning, Power BI
INSERT INTO student_skills(student_id, skill_id) VALUES (5,1),(5,2),(5,4),(5,3),(5,5);

-- 8. Populate Job Required Skills
-- Job 1 (Python Data Analyst): Python, SQL, Data Analysis
INSERT INTO job_skills(job_id, skill_id) VALUES (1,1),(1,2),(1,7);
-- Job 2 (Junior ML Engineer): Python, Machine Learning, C++
INSERT INTO job_skills(job_id, skill_id) VALUES (2,1),(2,3),(2,4);
-- Job 3 (Data Science Intern): Python, Machine Learning, Data Analysis, Power BI
INSERT INTO job_skills(job_id, skill_id) VALUES (3,1),(3,3),(3,7),(3,5);
-- Job 4 (BI Associate): Power BI, SQL, Data Analysis
INSERT INTO job_skills(job_id, skill_id) VALUES (4,5),(4,2),(4,7);
-- Job 5 (Full Stack Intern): React, Node.js, SQL
INSERT INTO job_skills(job_id, skill_id) VALUES (5,8),(5,10),(5,2);
-- Job 6 (Backend Engineer): Node.js, Java, SQL
INSERT INTO job_skills(job_id, skill_id) VALUES (6,10),(6,6),(6,2);

-- 9. Initial Applications (using apply_for_job procedure)
CALL apply_for_job(1, 1); -- Sahili -> Python Data Analyst (Score 100%)
CALL apply_for_job(1, 3); -- Sahili -> Data Science Intern (Score 82.5%)
CALL apply_for_job(3, 3); -- Meera  -> Data Science Intern (Score 100%)
CALL apply_for_job(2, 5); -- Rahul  -> Full Stack Web Intern (Score 82.5%)
CALL apply_for_job(4, 5); -- Aarav  -> Full Stack Web Intern (Score 100%)
CALL apply_for_job(5, 2); -- Priya  -> Junior ML Engineer (Score 100%)
