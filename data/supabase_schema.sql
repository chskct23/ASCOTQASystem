-- =========================================================================
-- ASCOT Casiguran Campus Feasibility Study - Supabase Cloud Database Schema
-- Provider: Supabase (PostgreSQL 15+)
-- Deployable for free on: https://supabase.com
-- =========================================================================

-- 1. Create Surveys Table
CREATE TABLE IF NOT EXISTS ascot_surveys (
  id TEXT PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  local_verification_hash TEXT,
  input_method TEXT DEFAULT 'manual_entry',
  respondent_name TEXT,
  school_name TEXT NOT NULL,
  municipality TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  academic_strand TEXT NOT NULL,
  other_strand TEXT DEFAULT '',
  programs_offer_wishlist JSONB DEFAULT '[]'::jsonb,
  other_program_offer_wishlist TEXT DEFAULT '',
  preferred_program_to_enroll TEXT NOT NULL,
  would_consider_enrolling TEXT NOT NULL,
  main_reasons_for_ascot JSONB DEFAULT '[]'::jsonb,
  main_reason_for_ascot TEXT DEFAULT '',
  other_main_reason TEXT DEFAULT '',
  pursuing_bs_fisheries_degree TEXT NOT NULL,
  take_bs_fisheries_at_casiguran TEXT NOT NULL,
  if_not_casiguran_preferred_school TEXT DEFAULT '',
  if_not_casiguran_reason TEXT DEFAULT '',
  factors_encouraging_fisheries JSONB DEFAULT '[]'::jsonb,
  other_fisheries_factor TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast aggregation & analytics queries
CREATE INDEX IF NOT EXISTS idx_ascot_surveys_municipality ON ascot_surveys(municipality);
CREATE INDEX IF NOT EXISTS idx_ascot_surveys_strand ON ascot_surveys(academic_strand);
CREATE INDEX IF NOT EXISTS idx_ascot_surveys_submitted_at ON ascot_surveys(submitted_at DESC);

-- 3. Row Level Security (RLS) configuration for web and API access
ALTER TABLE ascot_surveys ENABLE ROW LEVEL SECURITY;

-- Allow public read access for analytics and database view
CREATE POLICY "Allow public read access" ON ascot_surveys
  FOR SELECT USING (true);

-- Allow public submission of survey questionnaire records
CREATE POLICY "Allow public insert access" ON ascot_surveys
  FOR INSERT WITH CHECK (true);

-- Allow authorized delete actions
CREATE POLICY "Allow public delete access" ON ascot_surveys
  FOR DELETE USING (true);

-- Allow updates
CREATE POLICY "Allow public update access" ON ascot_surveys
  FOR UPDATE USING (true);
