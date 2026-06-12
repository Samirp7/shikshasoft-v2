-- ============================================
-- ShikshaSoft Nepal - Complete Database Schema
-- Run this in MySQL Workbench
-- ============================================

CREATE DATABASE IF NOT EXISTS shikshasoft;
USE shikshasoft;

-- Schools (multi-tenant: one DB, multiple schools)
CREATE TABLE schools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  address VARCHAR(300),
  phone VARCHAR(20),
  email VARCHAR(100),
  logo_url VARCHAR(300),
  subscription_plan ENUM('basic','standard','premium') DEFAULT 'standard',
  subscription_status ENUM('active','expired','trial') DEFAULT 'trial',
  trial_ends_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users (admin, teacher roles)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','teacher','accountant') DEFAULT 'teacher',
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- Classes (e.g. Class 1, Class 10, Grade XI)
CREATE TABLE classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  section VARCHAR(10) DEFAULT 'A',
  class_teacher_id INT,
  academic_year VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- Students
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  class_id INT NOT NULL,
  roll_number VARCHAR(20),
  name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male','female','other'),
  address VARCHAR(300),
  guardian_name VARCHAR(100),
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(100),
  photo_url VARCHAR(300),
  admission_date DATE DEFAULT (CURDATE()),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Fee structure per class
CREATE TABLE fee_structure (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  class_id INT NOT NULL,
  fee_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency ENUM('monthly','quarterly','annually','once') DEFAULT 'monthly',
  academic_year VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Fee payments
CREATE TABLE fee_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  student_id INT NOT NULL,
  fee_structure_id INT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date DATE DEFAULT (CURDATE()),
  payment_method ENUM('cash','esewa','khalti','bank') DEFAULT 'cash',
  receipt_number VARCHAR(50) UNIQUE,
  month_year VARCHAR(10),
  remarks VARCHAR(300),
  collected_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (fee_structure_id) REFERENCES fee_structure(id)
);

-- Attendance
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present','absent','late','holiday') DEFAULT 'present',
  remarks VARCHAR(200),
  marked_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance (student_id, date),
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Subjects
CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  class_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  full_marks INT DEFAULT 100,
  pass_marks INT DEFAULT 40,
  subject_teacher_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Exams
CREATE TABLE exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  class_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  exam_type ENUM('terminal','half_yearly','final','unit_test') DEFAULT 'terminal',
  start_date DATE,
  end_date DATE,
  academic_year VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- Results / Marks
CREATE TABLE results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  student_id INT NOT NULL,
  exam_id INT NOT NULL,
  subject_id INT NOT NULL,
  marks_obtained DECIMAL(5,2),
  full_marks INT DEFAULT 100,
  grade VARCHAR(5),
  grade_point DECIMAL(3,2),
  remarks VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_result (student_id, exam_id, subject_id),
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Notices
CREATE TABLE notices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  target_audience ENUM('all','students','teachers','parents') DEFAULT 'all',
  published_by INT,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- ============================================
-- Insert demo school and admin for testing
-- ============================================
INSERT INTO schools (name, address, phone, email, subscription_plan, subscription_status, trial_ends_at)
VALUES ('Demo School Kathmandu', 'Bagbazar, Kathmandu', '01-4XXXXXX', 'admin@demoschool.edu.np', 'standard', 'trial', DATE_ADD(CURDATE(), INTERVAL 30 DAY));

-- Password is: Admin@123 (bcrypt hashed)
INSERT INTO users (school_id, name, email, password, role)
VALUES (1, 'School Admin', 'admin@shikshasoft.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
