-- =====================================================================
-- AI-Based Internship & Placement Management System
-- DBMS Mini-Project Database Schema (MySQL 8.0+)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS placement_db;
USE placement_db;

DROP VIEW IF EXISTS placement_statistics;
DROP TABLE IF EXISTS application_history;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS job_skills;
DROP TABLE IF EXISTS student_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS application_status;

-- 1. USERS (Base Entity - Generalization for Student, Recruiter, Admin)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash CHAR(64) NOT NULL,
    role ENUM('STUDENT','RECRUITER','ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. STUDENTS (Specialization of User)
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    roll_no VARCHAR(30) NOT NULL UNIQUE,
    branch VARCHAR(80) NOT NULL,
    cgpa DECIMAL(3,2) NOT NULL CHECK (cgpa BETWEEN 0 AND 10),
    graduation_year INT NOT NULL,
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. COMPANIES (Owned by Recruiter User)
CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    recruiter_user_id INT NOT NULL,
    company_name VARCHAR(150) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    FOREIGN KEY (recruiter_user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 4. JOBS (Master Data, posted by Company)
CREATE TABLE jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    job_type ENUM('INTERNSHIP','FULL_TIME') NOT NULL,
    location VARCHAR(100) NOT NULL,
    min_cgpa DECIMAL(3,2) DEFAULT 0 CHECK (min_cgpa BETWEEN 0 AND 10),
    openings INT NOT NULL DEFAULT 1 CHECK (openings > 0),
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- 5. SKILLS (Master Skill Catalog)
CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(80) NOT NULL UNIQUE
);

-- 6. STUDENT_SKILLS (Bridge Table: M:M between Student and Skill)
CREATE TABLE student_skills (
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (student_id, skill_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

-- 7. JOB_SKILLS (Bridge Table: M:M between Job and Required Skill)
CREATE TABLE job_skills (
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

-- 8. APPLICATION_STATUS (Status Lookup Table)
CREATE TABLE application_status (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(30) NOT NULL UNIQUE
);

-- 9. APPLICATIONS (Transaction Table: Student applies for Job)
CREATE TABLE applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    match_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (match_score BETWEEN 0 AND 100),
    status_id INT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (student_id, job_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES application_status(status_id)
);

-- 10. APPLICATION_HISTORY (Weak Entity: Logs status transition events)
CREATE TABLE application_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
);

-- INDEXES for Search & Join Performance
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_students_cgpa ON students(cgpa);
CREATE INDEX idx_applications_status ON applications(status_id);

-- =====================================================================
-- SQL FUNCTION: calculate_match_score(student_id, job_id)
-- Skill Match = 70% max, CGPA Match = 30% max
-- =====================================================================
DELIMITER $$

CREATE FUNCTION calculate_match_score(p_student_id INT, p_job_id INT)
RETURNS DECIMAL(5,2)
READS SQL DATA
BEGIN
    DECLARE total_job_skills INT DEFAULT 0;
    DECLARE matched_skills INT DEFAULT 0;
    DECLARE student_cgpa DECIMAL(3,2) DEFAULT 0;
    DECLARE required_cgpa DECIMAL(3,2) DEFAULT 0;
    DECLARE skill_score DECIMAL(5,2) DEFAULT 0;
    DECLARE cgpa_score DECIMAL(5,2) DEFAULT 0;

    SELECT cgpa INTO student_cgpa FROM students WHERE student_id = p_student_id;
    SELECT min_cgpa INTO required_cgpa FROM jobs WHERE job_id = p_job_id;

    SELECT COUNT(*) INTO total_job_skills
    FROM job_skills WHERE job_id = p_job_id;

    SELECT COUNT(*) INTO matched_skills
    FROM job_skills js
    JOIN student_skills ss ON ss.skill_id = js.skill_id
    WHERE js.job_id = p_job_id AND ss.student_id = p_student_id;

    IF total_job_skills = 0 THEN
        SET skill_score = 70;
    ELSE
        SET skill_score = (matched_skills / total_job_skills) * 70;
    END IF;

    IF student_cgpa >= required_cgpa THEN
        SET cgpa_score = 30;
    ELSE
        SET cgpa_score = GREATEST(0, 30 - ((required_cgpa - student_cgpa) * 20));
    END IF;

    RETURN ROUND(LEAST(100, skill_score + cgpa_score), 2);
END$$

-- =====================================================================
-- STORED PROCEDURE: apply_for_job(student_id, job_id)
-- =====================================================================
CREATE PROCEDURE apply_for_job(
    IN p_student_id INT,
    IN p_job_id INT
)
BEGIN
    DECLARE v_status INT;
    DECLARE v_score DECIMAL(5,2);
    DECLARE v_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO v_exists
    FROM applications
    WHERE student_id = p_student_id AND job_id = p_job_id;

    IF v_exists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student has already applied for this job';
    END IF;

    SELECT status_id INTO v_status
    FROM application_status
    WHERE status_name = 'Applied'
    LIMIT 1;

    SET v_score = calculate_match_score(p_student_id, p_job_id);

    INSERT INTO applications(student_id, job_id, match_score, status_id)
    VALUES(p_student_id, p_job_id, v_score, v_status);
END$$

-- =====================================================================
-- TRIGGER: trg_application_status_history
-- =====================================================================
CREATE TRIGGER trg_application_status_history
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    IF OLD.status_id <> NEW.status_id THEN
        INSERT INTO application_history(application_id, old_status, new_status)
        SELECT NEW.application_id, old_s.status_name, new_s.status_name
        FROM application_status old_s, application_status new_s
        WHERE old_s.status_id = OLD.status_id
          AND new_s.status_id = NEW.status_id;
    END IF;
END$$

DELIMITER ;

-- =====================================================================
-- VIEW: placement_statistics
-- =====================================================================
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
