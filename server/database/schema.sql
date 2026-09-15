-- =====================================================================
-- DNA Stakeholder Questionnaire Set (Smart Village Project)
-- MySQL Database Schema
-- TAI: Government Polytechnic, Kolhapur · Vaibhavwadi, Sindhudurg
-- =====================================================================

CREATE DATABASE IF NOT EXISTS dna_survey_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE dna_survey_db;

-- ---------------------------------------------------------------------
-- 1. VILLAGES MASTER TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS villages (
    village_code VARCHAR(10) PRIMARY KEY,     -- e.g. 'VG1', 'VG2'
    village_name VARCHAR(100) NOT NULL,       -- e.g. 'मांगवली'
    taluka VARCHAR(50) DEFAULT 'Vaibhavwadi',
    district VARCHAR(50) DEFAULT 'Sindhudurg',
    state VARCHAR(50) DEFAULT 'Maharashtra',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed all 21 project villages
INSERT INTO villages (village_code, village_name) VALUES
('VG1', 'मांगवली'),
('VG2', 'तिरवडे तर्फ खारेपाटण'),
('VG3', 'ऐणारी'),
('VG4', 'भुईबावडा'),
('VG5', 'उंबर्डे'),
('VG6', 'कुर्ली'),
('VG7', 'सडुरे-शिराळे'),
('VG8', 'अरुळे'),
('VG9', 'निमअरुळे'),
('VG10', 'एडगाव'),
('VG11', 'कुसूर'),
('VG12', 'सोनाळी'),
('VG13', 'कुंभवडे'),
('VG14', 'लोरे नं.२'),
('VG15', 'आचिर्णे'),
('VG16', 'खांबाळे'),
('VG17', 'हेत'),
('VG18', 'मौदे'),
('VG19', 'आखवणे भोम'),
('VG20', 'नेर्ले'),
('VG21', 'उपळे')
ON DUPLICATE KEY UPDATE village_name = VALUES(village_name);


-- ---------------------------------------------------------------------
-- 2. PROBLEM CATALOG MASTER TABLE (P01 - P28 from pos.xlsx)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problem_catalog (
    code VARCHAR(10) PRIMARY KEY,             -- e.g. 'P01', 'P02'
    problem_en VARCHAR(255) NOT NULL,         -- Short description in English
    problem_mr VARCHAR(255) NOT NULL,         -- Marathi description
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed P01 - P28 problem codes
INSERT INTO problem_catalog (code, problem_en, problem_mr) VALUES
('P01', 'Drinking water: quantity or timing', 'पिण्याचे पाणी — प्रमाण व वेळ'),
('P02', 'Drinking water: quality, muddy, smell', 'पाण्याचा दर्जा — गढूळ, वास'),
('P03', 'Irrigation water, well or bore drying', 'सिंचन पाणी / विहीर-बोअर आटणे'),
('P04', 'Pump or motor failure', 'पंप-मोटार बिघाड'),
('P05', 'Electricity: cuts, low voltage, damage', 'वीज — खंडित, कमी दाब, नुकसान'),
('P06', 'Crop pest and disease noticed too late', 'कीड-रोग उशिरा लक्षात येणे'),
('P07', 'Weather loss: unseasonal rain, wind', 'हवामान नुकसान — अवकाळी पाऊस, वारा'),
('P08', 'Soil health, fertiliser by guess', 'जमीन आरोग्य / अंदाजाने खत'),
('P09', 'Market price not known or low rate', 'बाजारभाव माहिती नाही / कमी दर'),
('P10', 'Storage, grading, transport of produce', 'साठवण, प्रतवारी, वाहतूक'),
('P11', 'Wild animals or stray cattle damage', 'वन्यप्राणी-मोकाट जनावरांचे नुकसान'),
('P12', 'Livestock disease, no vet in time', 'जनावरांचे आजार / वेळेत डॉक्टर नाही'),
('P13', 'Milk: quality testing, rate, collection', 'दूध — तपासणी, दर, संकलन'),
('P14', 'Fish pond or fishing problem', 'मत्स्य तळे / मासेमारी अडचण'),
('P15', 'Health: no doctor, tests, medicines', 'आरोग्य — डॉक्टर, तपासण्या, औषधे नाहीत'),
('P16', 'Emergency transport at night', 'रात्री रुग्णवाहिका-वाहन नाही'),
('P17', 'Anganwadi: meal, weighing, building', 'अंगणवाडी — आहार, वजन, इमारत'),
('P18', 'School: teaching, devices, building', 'शाळा — शिकवणी, साधने, इमारत'),
('P19', 'Waste collection, open dumping', 'कचरा संकलन / उघड्यावर टाकणे'),
('P20', 'Drainage, waste water standing', 'गटार / सांडपाणी साचणे'),
('P21', 'Street lights not working, dark lanes', 'पथदिवे बंद / अंधार'),
('P22', 'Roads: broken, mud in monsoon', 'रस्ते — खराब, पावसात चिखल'),
('P23', 'Mobile network or internet', 'मोबाईल रेंज / इंटरनेट'),
('P24', 'Government office work: certificates, forms', 'शासकीय कामे — दाखले, अर्ज'),
('P25', 'Employment, migration for work', 'रोजगार / कामासाठी स्थलांतर'),
('P26', 'SHG income, selling our products', 'बचत गट उत्पन्न / माल विक्री'),
('P27', 'Safety: theft, accidents, unsafe at night', 'सुरक्षा — चोरी, अपघात, रात्री असुरक्षित'),
('P28', 'Information: notices, schemes not known', 'माहिती — सूचना-योजना कळत नाहीत')
ON DUPLICATE KEY UPDATE problem_en = VALUES(problem_en), problem_mr = VALUES(problem_mr);


-- ---------------------------------------------------------------------
-- 3. CORE SURVEY RECORDS TABLE
-- Accommodates Form 0, Form A, Form B, Form C, Form D, Form E, Form F.
-- Stores full response payload in data_json for 100% frontend compatibility.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS survey_records (
    id VARCHAR(64) PRIMARY KEY,               -- e.g. client record ID or UUID
    form_key ENUM('form0', 'formA', 'formB', 'formC', 'formD', 'formE', 'formF') NOT NULL,
    village_code VARCHAR(10) NOT NULL,
    village_name VARCHAR(100),
    wadi VARCHAR(100),
    interviewer VARCHAR(100),
    respondent VARCHAR(100),
    survey_date DATE,
    form_no VARCHAR(50),
    data_json JSON NOT NULL,                  -- Complete form data payload
    client_updated BIGINT,                    -- Timestamp sent by frontend
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (village_code) REFERENCES villages(village_code) ON DELETE RESTRICT,
    INDEX idx_village_form (village_code, form_key),
    INDEX idx_date (survey_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------------------------------------------------------------------
-- 4. TAI SCREENINGS BREAKDOWN (Normalized Table for Forms A-D)
-- Populated automatically during save for direct SQL analytics & Form F.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tai_screenings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id VARCHAR(64) NOT NULL,
    village_code VARCHAR(10) NOT NULL,
    form_key ENUM('formA', 'formB', 'formC', 'formD') NOT NULL,
    p_code VARCHAR(10) NOT NULL,
    long_term BOOLEAN DEFAULT FALSE,          -- > 1 year
    often BOOLEAN DEFAULT FALSE,              -- frequent issue
    many BOOLEAN DEFAULT FALSE,               -- affects many households
    real_loss BOOLEAN DEFAULT FALSE,          -- caused financial/physical loss
    keep_drop ENUM('Keep', 'Drop') NOT NULL,  -- >=2 criteria = Keep
    tech_type VARCHAR(50) DEFAULT 'Tech',
    FOREIGN KEY (record_id) REFERENCES survey_records(id) ON DELETE CASCADE,
    FOREIGN KEY (village_code) REFERENCES villages(village_code),
    FOREIGN KEY (p_code) REFERENCES problem_catalog(code),
    INDEX idx_pcode_keep (p_code, keep_drop)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------------------------------------------------------------------
-- 5. VILLAGE WALK OBSERVATIONS TABLE (Form E Stops E1 - E16)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS form_e_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id VARCHAR(64) NOT NULL,
    village_code VARCHAR(10) NOT NULL,
    stop_id VARCHAR(10) NOT NULL,             -- 'E1' to 'E16'
    place_name VARCHAR(255) NOT NULL,         -- e.g. 'Water source — well'
    look_for TEXT,                            -- Inspection checklist
    actual_seen TEXT,                         -- Notes written by surveyor
    gps_coordinates VARCHAR(100),             -- e.g. '16.5123, 73.6543'
    photo_ref VARCHAR(255),                   -- Photo number or filename
    p_code VARCHAR(10),                       -- Linked P-code (P01-P28)
    FOREIGN KEY (record_id) REFERENCES survey_records(id) ON DELETE CASCADE,
    FOREIGN KEY (village_code) REFERENCES villages(village_code),
    FOREIGN KEY (p_code) REFERENCES problem_catalog(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------------------------------------------------------------------
-- 6. IMAGE STORAGE IN MYSQL
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS survey_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id VARCHAR(64) NULL,               -- Belongs to which survey record (nullable if uploaded before save)
    village_code VARCHAR(10) NOT NULL,
    stop_id VARCHAR(10) NULL,                 -- Optional: 'E1', 'E2', etc. if from Form E
    image_title VARCHAR(255) NULL,
    file_path VARCHAR(500) NOT NULL,          -- e.g. '/uploads/VG1_E1_1741234567.jpg'
    file_name VARCHAR(255) NOT NULL,          -- e.g. 'E1_1741234567.jpg'
    file_size_kb INT NULL,                    -- e.g. 1520
    mime_type VARCHAR(50) DEFAULT 'image/jpeg',
    image_data MEDIUMBLOB NULL,               -- Optional raw binary (supports up to 16MB)
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES survey_records(id) ON DELETE SET NULL,
    FOREIGN KEY (village_code) REFERENCES villages(village_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Normalized mirror of every submitted survey field.
-- Keeps JSON source-of-truth intact while making each stored answer independently queryable/exportable.
CREATE TABLE IF NOT EXISTS survey_answers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  record_id VARCHAR(64) NOT NULL,
  form_key ENUM('form0','formA','formB','formC','formD','formE','formF') NOT NULL,
  village_code VARCHAR(10) NOT NULL,
  form_version VARCHAR(64) NOT NULL DEFAULT 'DNA Forms 2026-09 Final',
  display_order INT NOT NULL DEFAULT 0,
  section_name VARCHAR(128) NULL,
  question_no VARCHAR(64) NULL,
  question_text TEXT NULL,
  field_path VARCHAR(255) NOT NULL,
  answer_value LONGTEXT NULL,
  answer_json JSON NULL,
  answer_status ENUM('ANSWERED','NOT_ANSWERED') NOT NULL DEFAULT 'NOT_ANSWERED',
  is_mapped TINYINT(1) NOT NULL DEFAULT 1,
  is_blank TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_survey_answer (record_id, field_path),
  KEY idx_answer_form_village (form_key, village_code),
  KEY idx_answer_field_path (field_path),
  KEY idx_answer_question_no (question_no),
  CONSTRAINT fk_answer_record FOREIGN KEY (record_id) REFERENCES survey_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_answer_village FOREIGN KEY (village_code) REFERENCES villages(village_code) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
