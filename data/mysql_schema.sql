CREATE DATABASE IF NOT EXISTS ascot_fss
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ascot_fss;

CREATE TABLE IF NOT EXISTS ascot_surveys (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  submitted_at VARCHAR(40) NOT NULL,
  local_verification_hash VARCHAR(64) NOT NULL DEFAULT '',
  input_method VARCHAR(30) NOT NULL DEFAULT 'manual_entry',
  respondent_name TEXT NULL,
  school_name TEXT NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  grade_level VARCHAR(30) NOT NULL,
  academic_strand VARCHAR(30) NOT NULL,
  other_strand TEXT NULL,
  programs_offer_wishlist LONGTEXT NOT NULL,
  other_program_offer_wishlist TEXT NULL,
  preferred_program_to_enroll TEXT NOT NULL,
  would_consider_enrolling VARCHAR(20) NOT NULL,
  main_reasons_for_ascot LONGTEXT NOT NULL,
  main_reason_for_ascot TEXT NOT NULL,
  other_main_reason TEXT NULL,
  pursuing_bs_fisheries_degree VARCHAR(20) NOT NULL,
  take_bs_fisheries_at_casiguran VARCHAR(20) NOT NULL,
  if_not_casiguran_preferred_school TEXT NULL,
  if_not_casiguran_reason TEXT NULL,
  factors_encouraging_fisheries LONGTEXT NOT NULL,
  other_fisheries_factor TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ascot_surveys_municipality (municipality),
  INDEX idx_ascot_surveys_strand (academic_strand),
  INDEX idx_ascot_surveys_submitted_at (submitted_at)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
