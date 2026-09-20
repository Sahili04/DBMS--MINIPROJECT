-- =====================================================================
-- AI-Based Internship & Placement Management System
-- Representative SQL Queries for Viva Demonstration
-- =====================================================================

USE placement_db;

-- ---------------------------------------------------------------------
-- 1. INNER JOIN & WHERE: Fetch open jobs with company details & required CGPA
-- ---------------------------------------------------------------------
SELECT j.job_id, j.title, c.company_name, j.location, j.job_type, j.min_cgpa, j.deadline
FROM jobs j
INNER JOIN companies c ON j.company_id = c.company_id
WHERE j.min_cgpa <= 8.00
ORDER BY j.created_at DESC;

-- ---------------------------------------------------------------------
-- 2. MANY-TO-MANY JOIN: Fetch student details along with their concatenated skills
-- ---------------------------------------------------------------------
SELECT s.student_id, u.name, u.email, s.roll_no, s.branch, s.cgpa,
       GROUP_CONCAT(sk.skill_name ORDER BY sk.skill_name SEPARATOR ', ') AS student_skills
FROM students s
JOIN users u ON s.user_id = u.user_id
LEFT JOIN student_skills ss ON s.student_id = ss.student_id
LEFT JOIN skills sk ON ss.skill_id = sk.skill_id
GROUP BY s.student_id, u.name, u.email, s.roll_no, s.branch, s.cgpa;

-- ---------------------------------------------------------------------
-- 3. AGGREGATE FUNCTIONS & GROUP BY: Count applications per job with max/avg match score
-- ---------------------------------------------------------------------
SELECT j.job_id, j.title, c.company_name,
       COUNT(a.application_id) AS total_applicants,
       MAX(a.match_score) AS highest_match_score,
       ROUND(AVG(a.match_score), 2) AS average_match_score
FROM jobs j
JOIN companies c ON j.company_id = c.company_id
LEFT JOIN applications a ON j.job_id = a.job_id
GROUP BY j.job_id, j.title, c.company_name
ORDER BY total_applicants DESC;

-- ---------------------------------------------------------------------
-- 4. HAVING CLAUSE: Find skills required in 2 or more active job postings
-- ---------------------------------------------------------------------
SELECT sk.skill_name, COUNT(js.job_id) AS job_demand
FROM skills sk
JOIN job_skills js ON sk.skill_id = js.skill_id
GROUP BY sk.skill_id, sk.skill_name
HAVING COUNT(js.job_id) >= 2
ORDER BY job_demand DESC;

-- ---------------------------------------------------------------------
-- 5. CALLING STORED FUNCTION: Compute live AI match score for Student 1 on Job 1
-- ---------------------------------------------------------------------
SELECT calculate_match_score(1, 1) AS match_percentage;

-- ---------------------------------------------------------------------
-- 6. EXECUTING STORED PROCEDURE: Apply for a job safely
-- ---------------------------------------------------------------------
-- CALL apply_for_job(2, 6);

-- ---------------------------------------------------------------------
-- 7. QUERYING SQL VIEW: Placement Statistics summary
-- ---------------------------------------------------------------------
SELECT * FROM placement_statistics;

-- ---------------------------------------------------------------------
-- 8. QUERYING TRIGGER AUDIT LOG: View Application History
-- ---------------------------------------------------------------------
SELECT ah.history_id, a.application_id, u.name AS student_name, j.title AS job_title,
       ah.old_status, ah.new_status, ah.changed_at
FROM application_history ah
JOIN applications a ON ah.application_id = a.application_id
JOIN students s ON a.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
JOIN jobs j ON a.job_id = j.job_id
ORDER BY ah.changed_at DESC;

-- ---------------------------------------------------------------------
-- 9. TRANSACTION DEMONSTRATION: Status Update with Rollback Capability
-- ---------------------------------------------------------------------
START TRANSACTION;
UPDATE applications SET status_id = 2 WHERE application_id = 1; -- Update to 'Shortlisted'
SELECT * FROM application_history WHERE application_id = 1;
COMMIT;
