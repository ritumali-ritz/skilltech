-- ============================================
-- SkillHire Database Schema
-- Complete MySQL Database Structure
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS skillhire_db;
USE skillhire_db;

-- ============================================
-- USERS TABLE
-- Stores all users: Job Seekers, Employers, Admins
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('job_seeker', 'employer', 'admin') NOT NULL DEFAULT 'job_seeker',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_photo VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- COMPANIES TABLE
-- Stores company information for employers
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    company_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_description TEXT,
    industry VARCHAR(100),
    website VARCHAR(255),
    logo VARCHAR(255),
    location VARCHAR(255),
    employee_count VARCHAR(50),
    founded_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- JOB_SEEKERS TABLE
-- Extended profile for job seekers
-- ============================================
CREATE TABLE IF NOT EXISTS job_seekers (
    seeker_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    resume_path VARCHAR(255),
    bio TEXT,
    current_position VARCHAR(255),
    experience_years INT DEFAULT 0,
    education_level VARCHAR(100),
    location VARCHAR(255),
    availability_status ENUM('available', 'not_available', 'open_to_offers') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- SKILLS TABLE
-- Master list of all skills in the system
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
    skill_id INT PRIMARY KEY AUTO_INCREMENT,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_skill_name (skill_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- USER_SKILLS TABLE
-- Many-to-many: Users and their skills
-- ============================================
CREATE TABLE IF NOT EXISTS user_skills (
    user_skill_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    years_of_experience INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    INDEX idx_user_id (user_id),
    INDEX idx_skill_id (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- JOBS TABLE
-- All job postings by employers
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
    job_id INT PRIMARY KEY AUTO_INCREMENT,
    employer_id INT NOT NULL,
    company_id INT,
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    job_type ENUM('full_time', 'part_time', 'contract', 'internship', 'remote') NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    salary_currency VARCHAR(10) DEFAULT 'INR',
    experience_required INT DEFAULT 0,
    education_required VARCHAR(100),
    status ENUM('pending', 'active', 'closed', 'rejected') DEFAULT 'pending',
    views_count INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE SET NULL,
    INDEX idx_employer_id (employer_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_posted_at (posted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- JOB_SKILLS TABLE
-- Many-to-many: Jobs and required skills
-- ============================================
CREATE TABLE IF NOT EXISTS job_skills (
    job_skill_id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_skill (job_id, skill_id),
    INDEX idx_job_id (job_id),
    INDEX idx_skill_id (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- APPLICATIONS TABLE
-- Job applications by job seekers
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    job_seeker_id INT NOT NULL,
    cover_letter TEXT,
    status ENUM('pending', 'reviewing', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (job_seeker_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, job_seeker_id),
    INDEX idx_job_id (job_id),
    INDEX idx_job_seeker_id (job_seeker_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- SAVED_JOBS TABLE
-- Jobs saved by job seekers for later
-- ============================================
CREATE TABLE IF NOT EXISTS saved_jobs (
    saved_job_id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    job_seeker_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (job_seeker_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved_job (job_id, job_seeker_id),
    INDEX idx_job_seeker_id (job_seeker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- ADMIN_LOGS TABLE
-- Track admin actions for audit
-- ============================================
CREATE TABLE IF NOT EXISTS admin_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- Password hash for 'admin123' using bcrypt (salt rounds: 10)
-- To generate a new hash, use: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_password', 10).then(h => console.log(h));"
INSERT INTO users (email, password, role, first_name, last_name, is_verified, is_active) 
VALUES ('admin@skillhire.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', 'Admin', 'User', TRUE, TRUE)
ON DUPLICATE KEY UPDATE email=email;

-- Insert default skills
INSERT INTO skills (skill_name, category) VALUES
('JavaScript', 'IT'),
('Python', 'IT'),
('Java', 'IT'),
('React', 'IT'),
('Node.js', 'IT'),
('PHP', 'IT'),
('MySQL', 'IT'),
('HTML/CSS', 'IT'),
('UI/UX Design', 'Design'),
('Graphic Design', 'Design'),
('Adobe Photoshop', 'Design'),
('Figma', 'Design'),
('Digital Marketing', 'Marketing'),
('SEO', 'Marketing'),
('Content Writing', 'Marketing'),
('Social Media Marketing', 'Marketing'),
('AutoCAD', 'Mechanical'),
('SolidWorks', 'Mechanical'),
('CNC Programming', 'Mechanical'),
('Nursing', 'Healthcare'),
('Pharmacy', 'Healthcare'),
('Medical Coding', 'Healthcare'),
('Crop Management', 'Agriculture'),
('Livestock Management', 'Agriculture'),
('Agricultural Engineering', 'Agriculture')
ON DUPLICATE KEY UPDATE skill_name=skill_name;

