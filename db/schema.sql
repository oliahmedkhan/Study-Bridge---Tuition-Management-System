-- =========================================
-- STUDY BRIDGE DATABASE SCHEMA
-- =========================================

-- Drop old tables
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS class_levels CASCADE;
DROP TABLE IF EXISTS upazilas CASCADE;
DROP TABLE IF EXISTS districts CASCADE;

-- =========================================
-- DISTRICTS TABLE
-- =========================================
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(100)
);

-- =========================================
-- UPAZILAS TABLE
-- =========================================
CREATE TABLE upazilas (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(name, district_id)
);

-- =========================================
-- SUBJECTS TABLE
-- =========================================
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- =========================================
-- CLASS LEVELS TABLE
-- =========================================
CREATE TABLE class_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- =========================================
-- USERS TABLE (Students, Teachers, Admins)
-- =========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    
    -- Basic Info
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password TEXT NOT NULL,
    
    -- Role & Status
    role VARCHAR(20) NOT NULL CHECK(role IN ('student', 'teacher', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Location
    district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL,
    upazila_id INTEGER REFERENCES upazilas(id) ON DELETE SET NULL,
    address TEXT,
    
    -- Education (for students)
    class_level_id INTEGER REFERENCES class_levels(id) ON DELETE SET NULL,
    
    -- Subjects taught/interested in (int array for teachers/students)
    subjects INTEGER[],
    
    -- Profile Info
    bio TEXT,
    color VARCHAR(50),
    profile_image TEXT,
    
    -- Ratings
    rating NUMERIC(3, 2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- REVIEWS TABLE
-- =========================================
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- APPLICATIONS TABLE
-- =========================================
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'rejected')),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- MESSAGES TABLE
-- =========================================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- INDEXES
-- =========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_district ON users(district_id);
CREATE INDEX idx_users_upazila ON users(upazila_id);

CREATE INDEX idx_reviews_tutor ON reviews(tutor_id);
CREATE INDEX idx_reviews_student ON reviews(student_id);

CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_tutor ON applications(tutor_id);
CREATE INDEX idx_applications_status ON applications(status);

-- =========================================
-- DISTRICTS SEED DATA (64 Districts of Bangladesh)
-- =========================================
INSERT INTO districts (name, region) VALUES
('Dhaka', 'Central'),
('Chattogram', 'South-East'),
('Rajshahi', 'North-West'),
('Khulna', 'South-West'),
('Sylhet', 'North-East'),
('Barishal', 'South'),
('Rangpur', 'North'),
('Mymensingh', 'Central'),
('Tangail', 'Central'),
('Comilla', 'South-East'),
('Nilphamari', 'North'),
('Dinajpur', 'North'),
('Thakurgaon', 'North'),
('Pirojpur', 'South'),
('Cox Bazar', 'South-East'),
('Feni', 'South-East'),
('Noakhali', 'South-East'),
('Habiganj', 'North-East'),
('Maulvibazar', 'North-East'),
('Jessore', 'South-West'),
('Satkhira', 'South-West'),
('Jhenaidah', 'South-West'),
('Magura', 'South-West'),
('Narail', 'South-West'),
('Narayanganj', 'Central'),
('Gazipur', 'Central'),
('Munshiganj', 'Central'),
('Shariatpur', 'Central'),
('Manikganj', 'Central'),
('Kushtia', 'South-West'),
('Pabna', 'North-West'),
('Sirajganj', 'North-West'),
('Bogra', 'North-West'),
('Nawabganj', 'North-West'),
('Naogaon', 'North-West'),
('Natore', 'North-West'),
('Jamalpur', 'Central'),
('Sherpur', 'Central'),
('Netrokona', 'Central');

-- =========================================
-- UPAZILAS SEED DATA
-- =========================================
INSERT INTO upazilas (district_id, name) VALUES
-- Dhaka
(1, 'Dhanmondi'),
(1, 'Mirpur'),
(1, 'Mohakhali'),
(1, 'Gulshan'),
(1, 'Banani'),
(1, 'Motijheel'),

-- Chattogram
(2, 'Pahartali'),
(2, 'Hathazari'),
(2, 'Andermani'),
(2, 'Lakshmipur'),

-- Rajshahi
(3, 'Rajshahi Sadar'),
(3, 'Bagha'),

-- Khulna
(4, 'Khulna Sadar'),
(4, 'Batiaghata'),

-- Sylhet
(5, 'Sylhet Sadar'),
(5, 'Beanibazar'),

-- Nilphamari
(11, 'Nilphamari Sadar'),
(11, 'Domar'),
(11, 'Jaldapai'),
(11, 'Kishorganj');

-- =========================================
-- SUBJECTS SEED DATA
-- =========================================
INSERT INTO subjects (name) VALUES
('Mathematics'),
('English'),
('Physics'),
('Chemistry'),
('Biology'),
('Higher Math'),
('Bangla'),
('ICT'),
('Accounting'),
('Finance'),
('Economics'),
('Statistics'),
('General Science'),
('History'),
('Geography'),
('Religion'),
('Social Studies'),
('Computer Science'),
('Programming'),
('Calculus');

-- =========================================
-- CLASS LEVELS SEED DATA
-- =========================================
INSERT INTO class_levels (name, sort_order) VALUES
('Play', 1),
('Nursery', 2),
('KG', 3),
('Class 1', 4),
('Class 2', 5),
('Class 3', 6),
('Class 4', 7),
('Class 5', 8),
('Class 6', 9),
('Class 7', 10),
('Class 8', 11),
('Class 9', 12),
('Class 10 (SSC)', 13),
('Class 11', 14),
('Class 12 (HSC)', 15),
('University', 16);

-- =========================================
-- SAMPLE STUDENTS (10)
-- =========================================
INSERT INTO users (name, email, phone, password, role, district_id, upazila_id, class_level_id, address, is_verified, bio, subjects) VALUES
('Rahim Ahmed', 'rahim@example.com', '01700000001', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'student', 1, 1, 13, 'Dhanmondi, Dhaka', TRUE, 'Engineering student looking for Math and Physics tutors', ARRAY[1, 3, 4]),
('Nida Akter', 'nida@example.com', '01700000002', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'student', 1, 2, 13, 'Mirpur, Dhaka', TRUE, 'Need help with Chemistry and Biology', ARRAY[4, 5]),
('Karim Khan', 'karim@example.com', '01700000003', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'student', 11, 18, 13, 'Domar, Nilphamari', TRUE, 'Looking for English tutor', ARRAY[2]),
('Fatima Begum', 'fatima@example.com', '01700000004', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'student', 11, 17, 12, 'Nilphamari Sadar', TRUE, 'Need Higher Math and Programming tutor', ARRAY[6, 19]),
('Ali Hasan', 'ali@example.com', '01700000005', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'student', 2, 7, 15, 'Pahartali, Chattogram', TRUE, 'HSC student needing all subjects help', ARRAY[1, 2, 3, 4, 5]),
('Sonia Roy', 'sonia@example.com', '01700000006', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'student', 1, 3, 10, 'Mohakhali, Dhaka', TRUE, 'Need Science tutor', ARRAY[3, 4, 5]),
('Hasib Rauf', 'hasib@example.com', '01700000007', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'student', 11, 18, 13, 'Domar, Nilphamari', TRUE, 'Need Physics and Math help', ARRAY[1, 3]),
('Mina Khan', 'mina@example.com', '01700000008', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'student', 11, 17, 15, 'Nilphamari Sadar', TRUE, 'University entrance prep', ARRAY[1, 2, 6, 19]),
('Rafi Ahmed', 'rafi@example.com', '01700000009', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'student', 1, 1, 13, 'Gulshan, Dhaka', TRUE, 'Looking for Chemistry tutor', ARRAY[4]),
('Asma Nasrin', 'asma@example.com', '01700000010', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'student', 2, 8, 12, 'Hathazari, Chattogram', TRUE, 'Urgent Math tutor needed', ARRAY[1, 6]);

-- =========================================
-- SAMPLE TEACHERS (10)
-- =========================================
INSERT INTO users (name, email, phone, password, role, district_id, upazila_id, address, is_verified, bio, subjects, rating, reviews_count, color) VALUES
('Dr. Saiful Islam', 'saiful@example.com', '01900000001', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'teacher', 1, 1, 'Dhanmondi, Dhaka', TRUE, 'Experienced Mathematics and Higher Math tutor with 10 years experience', ARRAY[1, 6], 4.8, 25, '#FF6B6B'),
('Nasrin Akhtar', 'nasrin@example.com', '01900000002', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'teacher', 1, 2, 'Mirpur, Dhaka', TRUE, 'Physics and Chemistry specialist for SSC/HSC', ARRAY[3, 4], 4.7, 30, '#4ECDC4'),
('Mohammad Karim', 'karim.teacher@example.com', '01900000003', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'teacher', 11, 17, 'Nilphamari Sadar', TRUE, 'English Literature and Grammar expert', ARRAY[2, 7], 4.9, 40, '#95E1D3'),
('Rozina Sharmin', 'rozina@example.com', '01900000004', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'teacher', 11, 18, 'Domar, Nilphamari', TRUE, 'Biology and Accounting tutor', ARRAY[5, 9], 4.6, 20, '#F38181'),
('Ahmed Hassan', 'ahmed.hassan@example.com', '01900000005', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'teacher', 2, 7, 'Pahartali, Chattogram', TRUE, 'University level Physics and Higher Math', ARRAY[3, 6, 19], 4.8, 35, '#AA96DA'),
('Farhana Islam', 'farhana@example.com', '01900000006', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'teacher', 1, 3, 'Mohakhali, Dhaka', TRUE, 'ICT and Computer Science tutor', ARRAY[8, 18, 19], 4.7, 28, '#FCBAD3'),
('Rashed Ahmed', 'rashed@example.com', '01900000007', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'teacher', 1, 4, 'Banani, Dhaka', TRUE, 'All Science subjects SSC/HSC', ARRAY[1, 3, 4, 5], 4.5, 18, '#E0BBE4'),
('Sumaira Khan', 'sumaira@example.com', '01900000008', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'teacher', 11, 19, 'Jaldapai, Nilphamari', TRUE, 'English and Bangla Literature', ARRAY[2, 7], 4.8, 32, '#B5EAD7'),
('Rafiq Ahmed', 'rafiq@example.com', '01900000009', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'teacher', 1, 5, 'Motijheel, Dhaka', TRUE, 'Accounting and Finance tutor', ARRAY[9, 10], 4.6, 22, '#FFDDC1'),
('Nishat Farzana', 'nishat@example.com', '01900000010', '\\\.8O5gJLqSEVVvEsWxu3sNhxZXJi', 'teacher', 2, 8, 'Hathazari, Chattogram', TRUE, 'Mathematics specialist all levels', ARRAY[1, 6], 4.9, 45, '#C1FFD7');

-- =========================================
-- SAMPLE APPLICATIONS
-- =========================================
INSERT INTO applications (student_id, tutor_id, subject_id, message, status) VALUES
(1, 11, 1, 'I need help with algebra and calculus. My exam is in 2 weeks.', 'pending'),
(2, 12, 4, 'Can you teach Chemistry? I have my board exam next month.', 'confirmed'),
(3, 13, 2, 'I need English tutoring for my SSC exam preparation.', 'pending'),
(5, 11, 1, 'Higher Math needed for competitive exam preparation.', 'confirmed');

-- =========================================
-- SAMPLE REVIEWS
-- =========================================
INSERT INTO reviews (student_id, tutor_id, rating, comment) VALUES
(2, 12, 5, 'Excellent teacher! Very clear explanation and patient.'),
(5, 11, 5, 'Best tutor for math. Highly recommended!'),
(1, 11, 4, 'Great sessions, helping me understand concepts better.');
