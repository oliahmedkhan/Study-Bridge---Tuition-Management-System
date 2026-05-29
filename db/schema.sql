```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- DROP OLD TABLES
-- =========================================
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS teacher_subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS class_levels CASCADE;
DROP TABLE IF EXISTS upazilas CASCADE;
DROP TABLE IF EXISTS districts CASCADE;

-- =========================================
-- DISTRICTS
-- =========================================
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(100)
);

-- =========================================
-- UPAZILAS
-- =========================================
CREATE TABLE upazilas (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(name, district_id)
);

-- =========================================
-- SUBJECTS
-- =========================================
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- =========================================
-- CLASS LEVELS
-- =========================================
CREATE TABLE class_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    sort_order INTEGER
);

-- =========================================
-- USERS
-- =========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password TEXT NOT NULL,

    role VARCHAR(20)
    CHECK(role IN ('student','teacher')),

    gender VARCHAR(10),

    address TEXT,

    district_id INTEGER REFERENCES districts(id),
    upazila_id INTEGER REFERENCES upazilas(id),

    class_level_id INTEGER REFERENCES class_levels(id),

    bio TEXT,

    rating NUMERIC(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,

    is_verified BOOLEAN DEFAULT FALSE,

    profile_image TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- TEACHER SUBJECTS
-- =========================================
CREATE TABLE teacher_subjects (
    id SERIAL PRIMARY KEY,

    teacher_id INTEGER
    REFERENCES users(id)
    ON DELETE CASCADE,

    subject_id INTEGER
    REFERENCES subjects(id)
    ON DELETE CASCADE,

    UNIQUE(teacher_id, subject_id)
);

-- =========================================
-- REVIEWS
-- =========================================
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,

    student_id INTEGER
    REFERENCES users(id)
    ON DELETE CASCADE,

    tutor_id INTEGER
    REFERENCES users(id)
    ON DELETE CASCADE,

    rating INTEGER
    CHECK(rating >= 1 AND rating <= 5),

    comment TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- APPLICATIONS
-- =========================================
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,

    student_id INTEGER
    REFERENCES users(id)
    ON DELETE CASCADE,

    tutor_id INTEGER
    REFERENCES users(id)
    ON DELETE CASCADE,

    subject_id INTEGER
    REFERENCES subjects(id),

    message TEXT NOT NULL,

    status VARCHAR(20)
    DEFAULT 'pending'
    CHECK(status IN ('pending','confirmed','rejected')),

    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- INDEXES
-- =========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_district ON users(district_id);

CREATE INDEX idx_teacher_subjects_teacher
ON teacher_subjects(teacher_id);

CREATE INDEX idx_teacher_subjects_subject
ON teacher_subjects(subject_id);

CREATE INDEX idx_reviews_tutor
ON reviews(tutor_id);

CREATE INDEX idx_applications_student
ON applications(student_id);

CREATE INDEX idx_applications_tutor
ON applications(tutor_id);

-- =========================================
-- DISTRICTS DATA
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
('Comilla', 'South-East');

-- =========================================
-- UPAZILAS DATA
-- =========================================
INSERT INTO upazilas (district_id, name) VALUES
(1, 'Dhanmondi'),
(1, 'Mirpur'),
(1, 'Mohakhali'),
(2, 'Pahartali'),
(2, 'Hathazari'),
(3, 'Rajshahi Sadar'),
(3, 'Bagha'),
(4, 'Khulna Sadar'),
(4, 'Batiaghata'),
(5, 'Sylhet Sadar'),
(5, 'Beanibazar'),
(6, 'Barishal Sadar'),
(7, 'Rangpur Sadar'),
(8, 'Mymensingh Sadar'),
(9, 'Tangail Sadar'),
(10, 'Comilla Sadar');

-- =========================================
-- SUBJECTS DATA
-- =========================================
INSERT INTO subjects (name) VALUES
('Math'),
('Higher Math'),
('Physics'),
('Chemistry'),
('Biology'),
('English'),
('Bangla'),
('ICT'),
('Accounting'),
('Finance'),
('Economics'),
('Statistics'),
('General Science'),
('BGS'),
('Religion');

-- =========================================
-- CLASS LEVELS DATA
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
('Class 10', 13),
('Class 11', 14),
('Class 12', 15),
('University', 16);

-- =========================================
-- 100 STUDENTS
-- =========================================
INSERT INTO users (
    full_name,
    email,
    phone,
    password,
    role,
    gender,
    address,
    district_id,
    upazila_id,
    class_level_id,
    bio,
    is_verified
)
SELECT
    'Student ' || gs,
    'student' || gs || '@gmail.com',
    '0170000' || LPAD(gs::TEXT, 4, '0'),
    '123456',
    'student',
    CASE
        WHEN gs % 2 = 0 THEN 'Male'
        ELSE 'Female'
    END,
    'Student Address ' || gs,
    ((gs % 10) + 1),
    ((gs % 16) + 1),
    ((gs % 16) + 1),
    'I am a student.',
    TRUE
FROM generate_series(1,100) AS gs;

-- =========================================
-- 100 TEACHERS
-- =========================================
INSERT INTO users (
    full_name,
    email,
    phone,
    password,
    role,
    gender,
    address,
    district_id,
    upazila_id,
    bio,
    rating,
    reviews_count,
    is_verified
)
SELECT
    'Teacher ' || gs,
    'teacher' || gs || '@gmail.com',
    '0180000' || LPAD(gs::TEXT, 4, '0'),
    '123456',
    'teacher',
    CASE
        WHEN gs % 2 = 0 THEN 'Male'
        ELSE 'Female'
    END,
    'Teacher Address ' || gs,
    ((gs % 10) + 1),
    ((gs % 16) + 1),
    'Experienced tutor with excellent teaching skills.',
    ROUND((RANDOM() * 2 + 3)::numeric,2),
    (RANDOM() * 100)::INTEGER,
    TRUE
FROM generate_series(1,100) AS gs;

-- =========================================
-- TEACHER SUBJECTS
-- =========================================
INSERT INTO teacher_subjects (teacher_id, subject_id)
SELECT
    u.id,
    ((u.id % 15) + 1)
FROM users u
WHERE u.role = 'teacher';

-- =========================================
-- REVIEWS
-- =========================================
INSERT INTO reviews (
    student_id,
    tutor_id,
    rating,
    comment
)
SELECT
    ((RANDOM() * 99) + 1)::INTEGER,
    ((RANDOM() * 99) + 101)::INTEGER,
    ((RANDOM() * 4) + 1)::INTEGER,
    'Excellent teacher and very helpful.'
FROM generate_series(1,100);

-- =========================================
-- APPLICATIONS
-- =========================================
INSERT INTO applications (
    student_id,
    tutor_id,
    subject_id,
    message,
    status
)
SELECT
    ((RANDOM() * 99) + 1)::INTEGER,
    ((RANDOM() * 99) + 101)::INTEGER,
    ((RANDOM() * 14) + 1)::INTEGER,
    'I want tuition for this subject.',
    CASE
        WHEN RANDOM() < 0.33 THEN 'pending'
        WHEN RANDOM() < 0.66 THEN 'confirmed'
        ELSE 'rejected'
    END
FROM generate_series(1,100);

-- =========================================
-- DONE
-- =========================================
SELECT 'Database Setup Completed Successfully!' AS message;
```
