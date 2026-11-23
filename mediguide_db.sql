-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 09, 2026 at 07:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mediguide_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `healthcare_services`
--

CREATE TABLE `healthcare_services` (
  `service_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `service_type` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `healthcare_services`
--

INSERT INTO `healthcare_services` (`service_id`, `name`, `service_type`, `address`, `phone`, `description`, `created_at`) VALUES
(1, 'Demo General Hospital', 'Hospital', 'Demo Address, Khulna, Bangladesh', '01XXXXXXXXX', 'Sample hospital record for testing the MediGuide BD application.', '2026-10-16 19:41:00'),
(2, 'Demo Medical Clinic', 'Clinic', 'Demo Address, Dhaka, Bangladesh', '01XXXXXXXXX', 'Sample clinic record for testing healthcare service search.', '2026-10-16 19:41:00'),
(3, 'Demo Diagnostic Center', 'Diagnostic Center', 'Demo Address, Chattogram, Bangladesh', '01XXXXXXXXX', 'Sample diagnostic center record for project demonstration.', '2026-10-16 19:41:00');

-- --------------------------------------------------------

--
-- Table structure for table `health_conditions`
--

CREATE TABLE `health_conditions` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `symptoms` text DEFAULT NULL,
  `prevention` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `health_conditions`
--

INSERT INTO `health_conditions` (`id`, `name`, `description`, `symptoms`, `prevention`, `created_at`) VALUES
(1, 'Fever', 'Fever is a temporary rise in body temperature and can have many causes.', 'High body temperature, chills, sweating, headache', 'Maintain hygiene, drink safe water, and seek medical advice when needed.', '2026-10-16 04:56:08'),
(2, 'Common Cold', 'The common cold is a viral infection affecting the upper respiratory tract.', 'Runny nose, sneezing, sore throat, cough', 'Wash hands regularly, avoid close contact with sick people, and maintain good hygiene.', '2026-10-16 05:14:40'),
(3, 'Migraine', 'Migraine is a neurological condition that can cause recurring headaches.', 'Headache, sensitivity to light, sensitivity to sound, nausea', 'Identify personal triggers, maintain regular sleep, and keep a consistent daily routine.', '2026-10-16 05:14:40'),
(4, 'Diarrhea', 'Diarrhea involves frequent loose or watery stools and can have several causes.', 'Loose stools, abdominal cramps, urgency to use the toilet', 'Wash hands, use safe drinking water, and maintain food hygiene.', '2026-10-16 05:14:40'),
(5, 'Chickenpox', 'Chickenpox is a contagious viral infection.', 'Itchy rash, fluid-filled blisters, fever, tiredness', 'Vaccination is an effective way to help prevent chickenpox. Avoid contact with infected people.', '2026-10-16 05:14:40'),
(6, 'Common Cold', 'The common cold is a viral infection affecting the upper respiratory tract.', 'Runny nose, sneezing, sore throat, cough', 'Wash hands regularly, avoid close contact with sick people, and maintain good hygiene.', '2026-10-16 06:12:08'),
(7, 'Migraine', 'Migraine is a neurological condition that can cause recurring headaches.', 'Headache, sensitivity to light, sensitivity to sound, nausea', 'Identify personal triggers, maintain regular sleep, and keep a consistent daily routine.', '2026-10-16 06:12:08'),
(8, 'Diarrhea', 'Diarrhea involves frequent loose or watery stools and can have several causes.', 'Loose stools, abdominal cramps, urgency to use the toilet', 'Wash hands, use safe drinking water, and maintain food hygiene.', '2026-10-16 06:12:08'),
(9, 'Chickenpox', 'Chickenpox is a contagious viral infection.', 'Itchy rash, fluid-filled blisters, fever, tiredness', 'Vaccination is an effective way to help prevent chickenpox. Avoid contact with infected people.', '2026-10-16 06:12:08'),
(10, 'Admin Test Condition', 'This is a test record', 'Test Symptom', 'Test Prevention', '2026-11-08 20:55:10');

-- --------------------------------------------------------

--
-- Table structure for table `medicines`
--

CREATE TABLE `medicines` (
  `medicine_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `generic_name` varchar(150) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `uses` text DEFAULT NULL,
  `precautions` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `medicines`
--

INSERT INTO `medicines` (`medicine_id`, `name`, `generic_name`, `category`, `uses`, `precautions`, `created_at`) VALUES
(1, 'Paracetamol', 'Paracetamol', 'Pain reliever and fever reducer', 'Generally used for relief of mild to moderate pain and fever.', 'Taking too much can cause serious liver damage. Follow the product label and consult a qualified healthcare professional.', '2026-10-16 13:29:25'),
(2, 'Cetirizine', 'Cetirizine', 'Antihistamine', 'Generally used to relieve allergy symptoms.', 'May cause drowsiness. Check the product label and ask a healthcare professional if it is suitable for you.', '2026-10-16 13:29:25'),
(3, 'Oral Rehydration Salts (ORS)', 'Oral Rehydration Salts', 'Oral rehydration solution', 'Used to help replace water and electrolytes lost through diarrhea or vomiting.', 'Mix with the exact amount of safe water stated on the packet. Seek medical care for severe dehydration or worsening symptoms.', '2026-10-16 13:29:25'),
(4, 'Omeprazole', 'Omeprazole', 'Proton pump inhibitor', 'Reduces stomach acid and is used for certain acid-related conditions.', 'Not suitable for every type of stomach problem. Consult a healthcare professional if symptoms persist.', '2026-10-16 13:29:25'),
(5, 'Update Test medicine', 'Test Generic', 'General', 'Test Medicine Information for demonstration', 'Follow professional medical adivice', '2026-11-08 21:30:39');

-- --------------------------------------------------------

--
-- Table structure for table `saved_health_info`
--

CREATE TABLE `saved_health_info` (
  `saved_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_type` varchar(50) NOT NULL,
  `item_id` int(11) NOT NULL,
  `item_name` varchar(150) NOT NULL,
  `saved_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `saved_health_info`
--

INSERT INTO `saved_health_info` (`saved_id`, `user_id`, `item_type`, `item_id`, `item_name`, `saved_at`) VALUES
(1, 1, 'conditions', 1, 'Fever', '2026-11-08 20:07:20');

-- --------------------------------------------------------

--
-- Table structure for table `search_history`
--

CREATE TABLE `search_history` (
  `history_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `search_query` varchar(255) NOT NULL,
  `search_type` varchar(50) NOT NULL,
  `searched_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `search_history`
--

INSERT INTO `search_history` (`history_id`, `user_id`, `search_query`, `search_type`, `searched_at`) VALUES
(1, 1, 'fever', 'all', '2026-11-08 20:25:03'),
(3, 2, 'fever', 'conditions', '2026-11-09 18:31:35'),
(4, 2, 'fever', 'symptoms', '2026-11-09 18:31:42'),
(5, 2, 'fever', 'medicines', '2026-11-09 18:31:47'),
(6, 2, 'fever', 'services', '2026-11-09 18:31:51'),
(7, 2, 'paracetamol', 'all', '2026-11-09 18:32:46'),
(8, 2, 'paracetamol', 'conditions', '2026-11-09 18:32:51'),
(9, 2, 'paracetamol', 'medicines', '2026-11-09 18:33:05'),
(10, 2, 'paracetamol', 'symptoms', '2026-11-09 18:33:18'),
(11, 2, 'paracetamol', 'conditions', '2026-11-09 18:33:30'),
(13, 2, 'fever', 'symptoms', '2026-11-09 18:37:29');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `symptoms`
--

CREATE TABLE `symptoms` (
  `symptom_id` int(11) NOT NULL,
  `symptom_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `related_conditions` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `symptoms`
--

INSERT INTO `symptoms` (`symptom_id`, `symptom_name`, `description`, `related_conditions`, `created_at`) VALUES
(1, 'Headache', 'Pain or discomfort in the head.', 'Migraine, Fever', '2026-10-16 12:50:05'),
(2, 'Sneezing', 'A sudden expulsion of air through the nose and mouth.', 'Common Cold, Allergies', '2026-10-16 12:50:05'),
(3, 'Cough', 'A reflex that helps clear the airways.', 'Common Cold, Respiratory infections', '2026-10-16 12:50:05'),
(4, 'Nausea', 'An uncomfortable feeling that you may vomit.', 'Migraine, Digestive problems', '2026-10-16 12:50:05'),
(5, 'Fever', 'An increase in body temperature.', 'Viral infections, Other infections', '2026-10-16 12:50:05');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `role`, `created_at`) VALUES
(1, 'Test User', 'testuser@example.com', '$2b$12$VHsR.Qd009u.gdnppjA4veTVIP42vJjrHFJyWrW8LheU5xA1gviiO', 'admin', '2026-11-08 19:47:29'),
(2, 'Arpon Das', 'arpondas@gmail.com', '$2b$12$n6IhJl6eFuNgcgAHzTSElORHuB8haeYlQ7tL6cKdGVV2c8Ij71.xG', 'user', '2026-11-08 21:54:06'),
(4, 'Hossain Jobaerr', 'jobaer@gmail.com', '$2b$12$F7l4UhaMcN7j0O/.A3909eOQZMNWzHbA82o4DvWal3UA1VfM2RWK.', 'user', '2026-11-09 18:27:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `healthcare_services`
--
ALTER TABLE `healthcare_services`
  ADD PRIMARY KEY (`service_id`);

--
-- Indexes for table `health_conditions`
--
ALTER TABLE `health_conditions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `medicines`
--
ALTER TABLE `medicines`
  ADD PRIMARY KEY (`medicine_id`);

--
-- Indexes for table `saved_health_info`
--
ALTER TABLE `saved_health_info`
  ADD PRIMARY KEY (`saved_id`),
  ADD UNIQUE KEY `unique_saved_item` (`user_id`,`item_type`,`item_id`);

--
-- Indexes for table `search_history`
--
ALTER TABLE `search_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `symptoms`
--
ALTER TABLE `symptoms`
  ADD PRIMARY KEY (`symptom_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `healthcare_services`
--
ALTER TABLE `healthcare_services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `health_conditions`
--
ALTER TABLE `health_conditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `medicines`
--
ALTER TABLE `medicines`
  MODIFY `medicine_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `saved_health_info`
--
ALTER TABLE `saved_health_info`
  MODIFY `saved_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `search_history`
--
ALTER TABLE `search_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `symptoms`
--
ALTER TABLE `symptoms`
  MODIFY `symptom_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `saved_health_info`
--
ALTER TABLE `saved_health_info`
  ADD CONSTRAINT `saved_health_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `search_history`
--
ALTER TABLE `search_history`
  ADD CONSTRAINT `search_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
