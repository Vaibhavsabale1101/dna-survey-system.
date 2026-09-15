-- ========================================================
-- DNA Survey Full MySQL Database Dump
-- Generated on: 2026-09-12T13:53:41.790Z
-- ========================================================

CREATE DATABASE IF NOT EXISTS `dna_survey_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `dna_survey_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table structure for `form_e_stops`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `form_e_stops`;
CREATE TABLE `form_e_stops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `record_id` varchar(64) NOT NULL,
  `village_code` varchar(10) NOT NULL,
  `stop_id` varchar(10) NOT NULL,
  `place_name` varchar(255) NOT NULL,
  `look_for` text,
  `actual_seen` text,
  `gps_coordinates` varchar(100) DEFAULT NULL,
  `photo_ref` varchar(255) DEFAULT NULL,
  `p_code` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `record_id` (`record_id`),
  KEY `village_code` (`village_code`),
  KEY `p_code` (`p_code`),
  CONSTRAINT `form_e_stops_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `survey_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `form_e_stops_ibfk_2` FOREIGN KEY (`village_code`) REFERENCES `villages` (`village_code`),
  CONSTRAINT `form_e_stops_ibfk_3` FOREIGN KEY (`p_code`) REFERENCES `problem_catalog` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `problem_catalog`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `problem_catalog`;
CREATE TABLE `problem_catalog` (
  `code` varchar(10) NOT NULL,
  `problem_en` varchar(255) NOT NULL,
  `problem_mr` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `problem_catalog`
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P01', 'Drinking water: quantity or timing', 'पिण्याचे पाणी — प्रमाण व वेळ', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P02', 'Drinking water: quality, muddy, smell', 'पाण्याचा दर्जा — गढूळ, वास', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P03', 'Irrigation water, well or bore drying', 'सिंचन पाणी / विहीर-बोअर आटणे', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P04', 'Pump or motor failure', 'पंप-मोटार बिघाड', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P05', 'Electricity: cuts, low voltage, damage', 'वीज — खंडित, कमी दाब, नुकसान', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P06', 'Crop pest and disease noticed too late', 'कीड-रोग उशिरा लक्षात येणे', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P07', 'Weather loss: unseasonal rain, wind', 'हवामान नुकसान — अवकाळी पाऊस, वारा', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P08', 'Soil health, fertiliser by guess', 'जमीन आरोग्य / अंदाजाने खत', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P09', 'Market price not known or low rate', 'बाजारभाव माहिती नाही / कमी दर', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P10', 'Storage, grading, transport of produce', 'साठवण, प्रतवारी, वाहतूक', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P11', 'Wild animals or stray cattle damage', 'वन्यप्राणी-मोकाट जनावरांचे नुकसान', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P12', 'Livestock disease, no vet in time', 'जनावरांचे आजार / वेळेत डॉक्टर नाही', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P13', 'Milk: quality testing, rate, collection', 'दूध — तपासणी, दर, संकलन', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P14', 'Fish pond or fishing problem', 'मत्स्य तळे / मासेमारी अडचण', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P15', 'Health: no doctor, tests, medicines', 'आरोग्य — डॉक्टर, तपासण्या, औषधे नाहीत', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P16', 'Emergency transport at night', 'रात्री रुग्णवाहिका-वाहन नाही', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P17', 'Anganwadi: meal, weighing, building', 'अंगणवाडी — आहार, वजन, इमारत', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P18', 'School: teaching, devices, building', 'शाळा — शिकवणी, साधने, इमारत', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P19', 'Waste collection, open dumping', 'कचरा संकलन / उघड्यावर टाकणे', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P20', 'Drainage, waste water standing', 'गटार / सांडपाणी साचणे', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P21', 'Street lights not working, dark lanes', 'पथदिवे बंद / अंधार', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P22', 'Roads: broken, mud in monsoon', 'रस्ते — खराब, पावसात चिखल', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P23', 'Mobile network or internet', 'मोबाईल रेंज / इंटरनेट', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P24', 'Government office work: certificates, forms', 'शासकीय कामे — दाखले, अर्ज', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P25', 'Employment, migration for work', 'रोजगार / कामासाठी स्थलांतर', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P26', 'SHG income, selling our products', 'बचत गट उत्पन्न / माल विक्री', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P27', 'Safety: theft, accidents, unsafe at night', 'सुरक्षा — चोरी, अपघात, रात्री असुरक्षित', '2026-09-11 19:52:16');
INSERT INTO `problem_catalog` (`code`, `problem_en`, `problem_mr`, `created_at`) VALUES ('P28', 'Information: notices, schemes not known', 'माहिती — सूचना-योजना कळत नाहीत', '2026-09-11 19:52:16');

-- --------------------------------------------------------
-- Table structure for `survey_images`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `survey_images`;
CREATE TABLE `survey_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `record_id` varchar(64) DEFAULT NULL,
  `village_code` varchar(10) NOT NULL,
  `stop_id` varchar(10) DEFAULT NULL,
  `image_title` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size_kb` int DEFAULT NULL,
  `mime_type` varchar(50) DEFAULT 'image/jpeg',
  `image_data` mediumblob,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `record_id` (`record_id`),
  KEY `village_code` (`village_code`),
  CONSTRAINT `survey_images_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `survey_records` (`id`) ON DELETE SET NULL,
  CONSTRAINT `survey_images_ibfk_2` FOREIGN KEY (`village_code`) REFERENCES `villages` (`village_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `survey_images`
INSERT INTO `survey_images` (`id`, `record_id`, `village_code`, `stop_id`, `image_title`, `file_path`, `file_name`, `file_size_kb`, `mime_type`, `image_data`, `uploaded_at`) VALUES (1, NULL, 'VG1', 'E1', 'Water Pump Leakage Test Image', '/uploads/VG1_E1_1789156943731_iq2fv2.png', 'VG1_E1_1789156943731_iq2fv2.png', 0, 'image/png', NULL, '2026-09-11 20:02:23');
INSERT INTO `survey_images` (`id`, `record_id`, `village_code`, `stop_id`, `image_title`, `file_path`, `file_name`, `file_size_kb`, `mime_type`, `image_data`, `uploaded_at`) VALUES (2, NULL, 'VG1', 'E1', 'Water Pump Leakage Test Image', '/uploads/VG1_E1_1789157184317_3ui43l.png', 'VG1_E1_1789157184317_3ui43l.png', 0, 'image/png', NULL, '2026-09-11 20:06:24');
INSERT INTO `survey_images` (`id`, `record_id`, `village_code`, `stop_id`, `image_title`, `file_path`, `file_name`, `file_size_kb`, `mime_type`, `image_data`, `uploaded_at`) VALUES (3, NULL, 'VG1', 'E1', 'Water Pump Leakage Test Image', '/uploads/VG1_E1_1789212233300_yzzadk.png', 'VG1_E1_1789212233300_yzzadk.png', 0, 'image/png', NULL, '2026-09-12 11:23:53');
INSERT INTO `survey_images` (`id`, `record_id`, `village_code`, `stop_id`, `image_title`, `file_path`, `file_name`, `file_size_kb`, `mime_type`, `image_data`, `uploaded_at`) VALUES (4, NULL, 'VG1', 'E1', 'Water Pump Leakage Test Image', '/uploads/VG1_E1_1789212341228_imkno8.png', 'VG1_E1_1789212341228_imkno8.png', 0, 'image/png', NULL, '2026-09-12 11:25:41');

-- --------------------------------------------------------
-- Table structure for `survey_records`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `survey_records`;
CREATE TABLE `survey_records` (
  `id` varchar(64) NOT NULL,
  `form_key` enum('form0','formA','formB','formC','formD','formE','formF') NOT NULL,
  `village_code` varchar(10) NOT NULL,
  `village_name` varchar(100) DEFAULT NULL,
  `wadi` varchar(100) DEFAULT NULL,
  `interviewer` varchar(100) DEFAULT NULL,
  `respondent` varchar(100) DEFAULT NULL,
  `survey_date` date DEFAULT NULL,
  `form_no` varchar(50) DEFAULT NULL,
  `data_json` json NOT NULL,
  `client_updated` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_village_form` (`village_code`,`form_key`),
  KEY `idx_date` (`survey_date`),
  CONSTRAINT `survey_records_ibfk_1` FOREIGN KEY (`village_code`) REFERENCES `villages` (`village_code`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `survey_records`
INSERT INTO `survey_records` (`id`, `form_key`, `village_code`, `village_name`, `wadi`, `interviewer`, `respondent`, `survey_date`, `form_no`, `data_json`, `client_updated`, `created_at`, `updated_at`) VALUES ('a1', 'formA', 'VG1', 'मांगवली', NULL, NULL, NULL, NULL, NULL, '{\"taiUse\":[{\"keep\":\"Keep\",\"long\":true,\"many\":false,\"tech\":\"Tech\",\"often\":true,\"fieldId\":\"P06\",\"problem\":\"\",\"realLoss\":false}],\"ownWords\":[{\"loss\":\"₹1000\",\"since\":\"2 years\",\"sector\":\"A\",\"problem\":\"x\"}]}', 1789212354278, '2026-09-11 20:04:06', '2026-09-12 11:25:54');
INSERT INTO `survey_records` (`id`, `form_key`, `village_code`, `village_name`, `wadi`, `interviewer`, `respondent`, `survey_date`, `form_no`, `data_json`, `client_updated`, `created_at`, `updated_at`) VALUES ('a2', 'formA', 'VG1', 'मांगवली', NULL, NULL, NULL, NULL, NULL, '{\"taiUse\":[{\"keep\":\"Keep\",\"long\":true,\"many\":false,\"tech\":\"Tech\",\"often\":true,\"fieldId\":\"P06\",\"problem\":\"\",\"realLoss\":false}],\"ownWords\":[{\"loss\":\"₹1000\",\"since\":\"2 years\",\"sector\":\"A\",\"problem\":\"x\"}]}', 1789212354292, '2026-09-11 20:04:06', '2026-09-12 11:25:54');
INSERT INTO `survey_records` (`id`, `form_key`, `village_code`, `village_name`, `wadi`, `interviewer`, `respondent`, `survey_date`, `form_no`, `data_json`, `client_updated`, `created_at`, `updated_at`) VALUES ('b1', 'formB', 'VG1', 'मांगवली', NULL, NULL, NULL, NULL, NULL, '{\"taiUse\":[{\"keep\":\"Keep\",\"long\":true,\"many\":false,\"tech\":\"Tech\",\"often\":true,\"fieldId\":\"P23\",\"problem\":\"\",\"realLoss\":false}],\"ownWords\":[{\"loss\":\"₹1000\",\"since\":\"2 years\",\"sector\":\"A\",\"problem\":\"x\"}]}', 1789212354306, '2026-09-11 20:04:06', '2026-09-12 11:25:54');
INSERT INTO `survey_records` (`id`, `form_key`, `village_code`, `village_name`, `wadi`, `interviewer`, `respondent`, `survey_date`, `form_no`, `data_json`, `client_updated`, `created_at`, `updated_at`) VALUES ('c1', 'formC', 'VG1', 'मांगवली', NULL, NULL, NULL, NULL, NULL, '{\"taiUse\":[{\"keep\":\"Drop\",\"long\":true,\"many\":false,\"tech\":\"Tech\",\"often\":true,\"fieldId\":\"P01\",\"problem\":\"\",\"realLoss\":false}],\"ownWords\":[{\"loss\":\"₹1000\",\"since\":\"2 years\",\"sector\":\"A\",\"problem\":\"x\"}]}', 1789212354316, '2026-09-11 20:04:06', '2026-09-12 11:25:54');
INSERT INTO `survey_records` (`id`, `form_key`, `village_code`, `village_name`, `wadi`, `interviewer`, `respondent`, `survey_date`, `form_no`, `data_json`, `client_updated`, `created_at`, `updated_at`) VALUES ('e1', 'formE', 'VG1', 'मांगवली', NULL, NULL, NULL, NULL, NULL, '{\"stops\":[{\"see\":\"visible damage\",\"fieldId\":\"P06\"}]}', 1789212354327, '2026-09-11 20:04:06', '2026-09-12 11:25:54');
INSERT INTO `survey_records` (`id`, `form_key`, `village_code`, `village_name`, `wadi`, `interviewer`, `respondent`, `survey_date`, `form_no`, `data_json`, `client_updated`, `created_at`, `updated_at`) VALUES ('z0', 'form0', 'VG1', 'मांगवली', NULL, NULL, NULL, NULL, NULL, '{\"occupationRank_0\":\"1-High\"}', 1789212354256, '2026-09-11 20:04:06', '2026-09-12 11:25:54');

-- --------------------------------------------------------
-- Table structure for `tai_screenings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tai_screenings`;
CREATE TABLE `tai_screenings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `record_id` varchar(64) NOT NULL,
  `village_code` varchar(10) NOT NULL,
  `form_key` enum('formA','formB','formC','formD') NOT NULL,
  `p_code` varchar(10) NOT NULL,
  `long_term` tinyint(1) DEFAULT '0',
  `often` tinyint(1) DEFAULT '0',
  `many` tinyint(1) DEFAULT '0',
  `real_loss` tinyint(1) DEFAULT '0',
  `keep_drop` enum('Keep','Drop') NOT NULL,
  `tech_type` varchar(50) DEFAULT 'Tech',
  PRIMARY KEY (`id`),
  KEY `record_id` (`record_id`),
  KEY `village_code` (`village_code`),
  KEY `idx_pcode_keep` (`p_code`,`keep_drop`),
  CONSTRAINT `tai_screenings_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `survey_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tai_screenings_ibfk_2` FOREIGN KEY (`village_code`) REFERENCES `villages` (`village_code`),
  CONSTRAINT `tai_screenings_ibfk_3` FOREIGN KEY (`p_code`) REFERENCES `problem_catalog` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `tai_screenings`
INSERT INTO `tai_screenings` (`id`, `record_id`, `village_code`, `form_key`, `p_code`, `long_term`, `often`, `many`, `real_loss`, `keep_drop`, `tech_type`) VALUES (42, 'a1', 'VG1', 'formA', 'P06', 1, 1, 0, 0, 'Keep', 'Tech');
INSERT INTO `tai_screenings` (`id`, `record_id`, `village_code`, `form_key`, `p_code`, `long_term`, `often`, `many`, `real_loss`, `keep_drop`, `tech_type`) VALUES (43, 'a2', 'VG1', 'formA', 'P06', 1, 1, 0, 0, 'Keep', 'Tech');
INSERT INTO `tai_screenings` (`id`, `record_id`, `village_code`, `form_key`, `p_code`, `long_term`, `often`, `many`, `real_loss`, `keep_drop`, `tech_type`) VALUES (44, 'b1', 'VG1', 'formB', 'P23', 1, 1, 0, 0, 'Keep', 'Tech');
INSERT INTO `tai_screenings` (`id`, `record_id`, `village_code`, `form_key`, `p_code`, `long_term`, `often`, `many`, `real_loss`, `keep_drop`, `tech_type`) VALUES (45, 'c1', 'VG1', 'formC', 'P01', 1, 1, 0, 0, 'Drop', 'Tech');

-- --------------------------------------------------------
-- Table structure for `villages`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `villages`;
CREATE TABLE `villages` (
  `village_code` varchar(10) NOT NULL,
  `village_name` varchar(100) NOT NULL,
  `taluka` varchar(50) DEFAULT 'Vaibhavwadi',
  `district` varchar(50) DEFAULT 'Sindhudurg',
  `state` varchar(50) DEFAULT 'Maharashtra',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`village_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `villages`
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG1', 'मांगवली', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG10', 'एडगाव', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG11', 'कुसूर', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG12', 'सोनाळी', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG13', 'कुंभवडे', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG14', 'लोरे नं.२', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG15', 'आचिर्णे', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG16', 'खांबाळे', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG17', 'हेत', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG18', 'मौदे', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG19', 'आखवणे भोम', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG2', 'तिरवडे तर्फ खारेपाटण', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG20', 'नेर्ले', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG21', 'उपळे', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG3', 'ऐणारी', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG4', 'भुईबावडा', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG5', 'उंबर्डे', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG6', 'कुर्ली', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG7', 'सडुरे-शिराळे', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG8', 'अरुळे', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');
INSERT INTO `villages` (`village_code`, `village_name`, `taluka`, `district`, `state`, `created_at`) VALUES ('VG9', 'निमअरुळे', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', '2026-09-11 19:52:16');

SET FOREIGN_KEY_CHECKS = 1;
