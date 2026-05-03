-- ============================================
--  Traversy Media Feedback App — DB Setup
--  Run this entire file in MySQL Workbench
-- ============================================

CREATE DATABASE IF NOT EXISTS feedback_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE feedback_db;

CREATE TABLE IF NOT EXISTS feedback (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  message     TEXT          NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- Optional: seed one sample row so the feedback page isn't empty on first load
INSERT INTO feedback (name, email, message) VALUES
  ('Khaleel', 'khaleel@example.com', 'Great tutorials — really helped me level up my PHP skills!');
