import React, { useState } from 'react';
import {
  Database,
  Download,
  Search,
  Filter,
  ShieldCheck,
  Trash2,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
  FileJson,
  FileText,
  X,
  School,
  HardDrive,
  Cloud,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';
import { SurveyResponse, LocalDatabaseStats } from '../types/survey';
import { exportSurveyRecordsToPDF } from '../utils/pdfExport';

const SUPABASE_SCHEMA_SQL = `-- =========================================================================
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

CREATE POLICY "Allow public read access" ON ascot_surveys
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON ascot_surveys
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access" ON ascot_surveys
  FOR DELETE USING (true);

CREATE POLICY "Allow public update access" ON ascot_surveys
  FOR UPDATE USING (true);`;

interface CloudDatabaseViewProps {
  surveys: SurveyResponse[];
  dbStats?: LocalDatabaseStats | null;
  onDeleteSurvey: (id: string) => void;
  onClearAllSurveys?: () => void;
  onRefresh: () => void;
}

export const CloudDatabaseView: React.FC<CloudDatabaseViewProps> = ({
  surveys,
  dbStats,
  onDeleteSurvey,
  onClearAllSurveys,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('all');
  const [strandFilter, setStrandFilter] = useState<string>('all');
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyResponse | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCloudSetupModal, setShowCloudSetupModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncingToCloud, setIsSyncingToCloud] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isCloudConnected = Boolean(dbStats?.cloudDetails?.isConnected);
  const isCloudConfigured = Boolean(dbStats?.cloudDetails?.isConfigured);
  const isMySqlConfigured = Boolean(dbStats?.databaseDetails?.isConfigured);
  const isMySqlConnected = Boolean(dbStats?.databaseDetails?.isConnected);
  const isDatabaseConnected = isCloudConnected || isMySqlConnected;

  // Filtered surveys
  const filteredSurveys = surveys.filter((item) => {
    const matchesSearch =
      (item.respondentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      item.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.preferredProgramToEnroll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMun =
      municipalityFilter === 'all' || item.municipality === municipalityFilter;

    const matchesStrand =
      strandFilter === 'all' || item.academicStrand === strandFilter;

    return matchesSearch && matchesMun && matchesStrand;
  });

  const handleDownload = (format: 'csv' | 'json' | 'sql') => {
    window.location.href = `/api/database/export?format=${format}`;
  };

  const handleExportPDF = () => {
    exportSurveyRecordsToPDF(surveys);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncToCloud = async () => {
    setIsSyncingToCloud(true);
    setSyncStatusMsg(null);
    try {
      const res = await fetch('/api/database/sync-to-cloud', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatusMsg({
          type: 'success',
          text: `Successfully synced ${data.syncedCount} survey questionnaire records to Supabase Cloud!`,
        });
        onRefresh();
      } else {
        setSyncStatusMsg({
          type: 'error',
          text: data.error || 'Failed to sync with Supabase Cloud.',
        });
      }
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        text: err.message || 'Network error syncing with Supabase Cloud.',
      });
    } finally {
      setIsSyncingToCloud(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Health & Security Hero Card */}
      <div className="bg-gradient-to-r from-[#070b14] via-[#0a1220] to-[#070b14] rounded-2xl p-6 text-white border border-[#94a3b8]/20 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isDatabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-[#f5a623] animate-pulse'
                }`}
              />
              <span
                className={`text-xs uppercase font-mono tracking-wider font-bold ${
                  isDatabaseConnected ? 'text-emerald-400' : 'text-[#ffc857]'
                }`}
              >
                {isMySqlConfigured
                  ? isMySqlConnected ? 'Local MySQL Database Connected' : 'Local MySQL Database Disconnected'
                  : isCloudConnected ? 'Supabase Cloud PostgreSQL Active' : 'Local JSON Storage Active'}
              </span>
              <span className="text-xs bg-[#070b14] text-[#94a3b8] px-2.5 py-0.5 rounded font-mono border border-[#94a3b8]/20 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#f5a623]" />
                {isMySqlConfigured
                  ? `Engine: ${dbStats?.engine || 'MySQL / MariaDB'}`
                  : isCloudConnected ? 'Engine: Supabase Serverless PG' : 'Engine: Local Disk JSON'}
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              ASCOT QA Survey Records
            </h2>
            <p className="text-xs sm:text-sm text-[#94a3b8] max-w-2xl">
              {isMySqlConfigured
                ? `Survey responses are stored in the configured local MySQL database (${dbStats?.databaseName || 'ascot_surveys'}).`
                : isCloudConnected
                ? 'Survey responses from senior high school respondents in the DICADI catchment are permanently persisted in Supabase Cloud PostgreSQL with cryptographic verification. Zero data loss across Vercel deployments.'
                : 'Survey responses are stored locally in ./data/surveys.json with cryptographic SHA-256 signatures. To retain all data permanently when hosting on Vercel, connect your free Supabase database.'}
            </p>
            {isMySqlConfigured && dbStats?.databaseDetails?.error && (
              <p className="text-xs text-rose-400">
                MySQL connection error: {dbStats.databaseDetails.error}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Supabase Cloud Connection & Setup Button */}
            {isMySqlConfigured ? (
              <div className="bg-[#0a1220] text-emerald-400 border border-emerald-500/40 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                <span>{isMySqlConnected ? 'Local MySQL Active' : 'Local MySQL Offline'}</span>
              </div>
            ) : (
              <button
                onClick={() => setShowCloudSetupModal(true)}
                className={`${
                  isCloudConnected
                    ? 'bg-[#0a1220] hover:bg-[#070b14] text-emerald-400 border border-emerald-500/40 shadow-xs'
                    : 'bg-[#f5a623] hover:bg-[#ffc857] text-[#070b14] shadow-md shadow-[#f5a623]/20'
                } font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer`}
              >
                <Cloud className={`w-4 h-4 ${isCloudConnected ? 'text-emerald-400' : 'text-[#070b14]'}`} />
                <span>{isCloudConnected ? 'Cloud DB Active (Settings)' : 'Connect Free Cloud DB'}</span>
              </button>
            )}

            {/* Prominent PDF Export Button */}
            <button
              onClick={handleExportPDF}
              className="bg-[#0a1220] hover:bg-[#070b14] text-white border border-[#94a3b8]/30 font-semibold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#ffc857]" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => handleDownload('csv')}
              className="bg-[#0a1220] hover:bg-[#070b14] text-white border border-[#94a3b8]/30 font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#ffc857]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleDownload('json')}
              className="bg-[#0a1220] hover:bg-[#070b14] text-white border border-[#94a3b8]/30 font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <FileJson className="w-4 h-4 text-[#94a3b8]" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => handleDownload('sql')}
              className="bg-[#0a1220] hover:bg-[#070b14] text-white border border-[#94a3b8]/30 font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-[#94a3b8]" />
              <span>Export SQL Dump</span>
            </button>
            {onClearAllSurveys && surveys.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#94a3b8]/20 text-xs">
          <div className="bg-[#070b14]/80 p-3 rounded-xl border border-[#94a3b8]/20">
            <span className="text-[#94a3b8] block text-[10px] uppercase font-bold">Total Records</span>
            <span className="text-lg font-bold text-[#f5a623] font-mono">{surveys.length}</span>
          </div>
          <div className="bg-[#070b14]/80 p-3 rounded-xl border border-[#94a3b8]/20">
            <span className="text-[#94a3b8] block text-[10px] uppercase font-bold">Storage Provider</span>
            <span className="text-slate-200 font-semibold font-mono truncate block">
              {isMySqlConfigured
                ? `MySQL: ${dbStats?.databaseName || 'ascot_fss'}`
                : isCloudConnected ? 'Supabase (PostgreSQL 15)' : './data/surveys.json'}
            </span>
          </div>
          <div className="bg-[#070b14]/80 p-3 rounded-xl border border-[#94a3b8]/20">
            <span className="text-[#94a3b8] block text-[10px] uppercase font-bold">Data Integrity</span>
            <span className="text-[#ffc857] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#f5a623]" /> 100% Cryptographic Hash
            </span>
          </div>
          <div className="bg-[#070b14]/80 p-3 rounded-xl border border-[#94a3b8]/20">
            <span className="text-[#94a3b8] block text-[10px] uppercase font-bold">Hosting Resilience</span>
            <span className="text-slate-200 font-semibold font-mono truncate block">
              {isMySqlConfigured
                ? isMySqlConnected ? 'Local MySQL Connected' : 'MySQL Connection Error'
                : isCloudConnected ? 'Vercel Permanent Storage' : 'Local JSON Storage'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search respondent, school, program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Municipality:</span>
            <select
              value={municipalityFilter}
              onChange={(e) => setMunicipalityFilter(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
            >
              <option value="all">All (DICADI)</option>
              <option value="Casiguran">Casiguran</option>
              <option value="Dinalungan">Dinalungan</option>
              <option value="Dilasag">Dilasag</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Strand:</span>
            <select
              value={strandFilter}
              onChange={(e) => setStrandFilter(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
            >
              <option value="all">All Strands</option>
              <option value="STEM">STEM</option>
              <option value="ABM">ABM</option>
              <option value="HUMSS">HUMSS</option>
              <option value="GAS">GAS</option>
              <option value="TVL">TVL</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 ml-auto font-medium">
            Showing <strong className="text-slate-800">{filteredSurveys.length}</strong> of{' '}
            <strong className="text-slate-800">{surveys.length}</strong> records
          </div>
        </div>
      </div>

      {/* Main Local Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Record ID & Hash</th>
                <th className="py-3 px-4">Respondent / School</th>
                <th className="py-3 px-4">Municipality</th>
                <th className="py-3 px-4">Strand</th>
                <th className="py-3 px-4">Preferred Degree Program</th>
                <th className="py-3 px-4">Enroll Intent</th>
                <th className="py-3 px-4">BS Fisheries</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSurveys.length > 0 ? (
                filteredSurveys.map((survey) => (
                  <tr
                    key={survey.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedSurvey(survey)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800">{survey.id}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        {survey.localVerificationHash}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {survey.respondentName || 'Anonymous Respondent'}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate max-w-[200px]">
                        {survey.schoolName} ({survey.gradeLevel})
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          survey.municipality === 'Casiguran'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : survey.municipality === 'Dinalungan'
                            ? 'bg-sky-100 text-sky-900 border border-sky-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {survey.municipality}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-800 font-mono font-semibold px-2 py-0.5 rounded border border-slate-200">
                        {survey.academicStrand}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 truncate max-w-[220px]">
                        {survey.preferredProgramToEnroll}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[220px]">
                        Reason: {survey.mainReasonForAscot}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          survey.wouldConsiderEnrolling === 'Yes'
                            ? 'bg-emerald-100 text-emerald-800'
                            : survey.wouldConsiderEnrolling === 'Maybe'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {survey.wouldConsiderEnrolling}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            survey.pursuingBSFisheriesDegree === 'Yes'
                              ? 'bg-emerald-500'
                              : survey.pursuingBSFisheriesDegree === 'Maybe'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="text-slate-700 font-medium">
                          {survey.pursuingBSFisheriesDegree} (At Casiguran: {survey.takeBSFisheriesAtCasiguran})
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedSurvey(survey)}
                          title="View Full Questionnaire"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSurvey(survey.id)}
                          title="Delete Record from Local Database"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-600">No matching survey records found in local database.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing search filters or add a new survey via the Input tab.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspector Modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="sticky top-0 bg-slate-900 text-white p-5 rounded-t-2xl flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">ASCOT Survey Record Dossier</h3>
                    <span className="text-[10px] bg-slate-800 text-amber-400 font-mono px-2 py-0.5 rounded border border-slate-700">
                      {selectedSurvey.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Local Hash: {selectedSurvey.localVerificationHash}</span>
                    <span>•</span>
                    <span>Storage: Local Database</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSurvey(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-700">
              {/* Section I */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                  I. RESPONDENT PROFILE
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Respondent Name:</span>
                    <strong className="text-slate-900">{selectedSurvey.respondentName || 'Anonymous'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">School Name:</span>
                    <strong className="text-slate-900">{selectedSurvey.schoolName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Municipality:</span>
                    <strong className="text-indigo-700">{selectedSurvey.municipality} (DICADI Area)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Grade Level:</span>
                    <strong className="text-slate-900">{selectedSurvey.gradeLevel}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Academic Strand:</span>
                    <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                      {selectedSurvey.academicStrand}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section II */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                  II. PROGRAMS YOU WOULD LIKE ASCOT–CASIGURAN CAMPUS TO OFFER
                </h4>
                <div className="space-y-1.5">
                  {selectedSurvey.programsOfferWishlist.map((prog, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2 rounded border border-slate-200 text-slate-900 font-medium flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{prog}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section III */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                  III. PROGRAM YOU WOULD ENROLL IN
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Program Most Likely To Enroll In:</span>
                    <strong className="text-slate-900 text-sm">{selectedSurvey.preferredProgramToEnroll}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Consider Enrolling at Casiguran Campus:</span>
                    <span
                      className={`inline-block font-bold px-2 py-0.5 rounded mt-0.5 ${
                        selectedSurvey.wouldConsiderEnrolling === 'Yes'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedSurvey.wouldConsiderEnrolling === 'Maybe'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedSurvey.wouldConsiderEnrolling}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block mb-1">Reasons For Choosing ASCOT (Selected up to 3):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedSurvey.mainReasonsForAscot && selectedSurvey.mainReasonsForAscot.length > 0
                        ? selectedSurvey.mainReasonsForAscot
                        : selectedSurvey.mainReasonForAscot.split(', ')
                      ).map((reason, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-100 text-amber-900 font-semibold px-2.5 py-1 rounded text-xs border border-amber-200"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section IV */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                  IV. INTEREST IN BACHELOR OF SCIENCE IN FISHERIES
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Pursue BS Fisheries Degree:</span>
                    <strong className="text-slate-900">{selectedSurvey.pursuingBSFisheriesDegree}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Take at ASCOT-Casiguran:</span>
                    <strong className="text-slate-900">{selectedSurvey.takeBSFisheriesAtCasiguran}</strong>
                  </div>
                </div>
                {selectedSurvey.ifNotCasiguranPreferredSchool && (
                  <div className="p-2.5 bg-white border border-slate-200 rounded">
                    <span className="text-slate-500 block text-[10px]">Alternative Preference & Reason:</span>
                    <div>
                      {selectedSurvey.ifNotCasiguranPreferredSchool} — {selectedSurvey.ifNotCasiguranReason}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block mb-1">Encouraging Factors for Enrollment:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSurvey.factorsEncouragingFisheries.map((f, i) => (
                      <span
                        key={i}
                        className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-medium"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedSurvey(null)}
                  className="bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Cloud Database & Vercel Setup Modal */}
      {showCloudSetupModal && (
        <div className="fixed inset-0 z-50 bg-[#070b14]/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0a1220] border border-[#94a3b8]/30 rounded-2xl max-w-3xl w-full text-slate-100 shadow-2xl my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#070b14] to-[#0a1220] border-b border-[#94a3b8]/20 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCloudConnected ? 'bg-emerald-400' : 'bg-[#f5a623]'
                    }`}
                  />
                  <span
                    className={`text-xs font-mono font-bold uppercase tracking-wider ${
                      isCloudConnected ? 'text-emerald-400' : 'text-[#ffc857]'
                    }`}
                  >
                    {isCloudConnected
                      ? 'Supabase Cloud PostgreSQL Connected'
                      : 'Dual-Mode Active: Local Disk Fallback'}
                  </span>
                  <span className="text-[10px] bg-[#070b14] text-[#f5a623] px-2 py-0.5 rounded font-mono border border-[#f5a623]/30">
                    100% Free PostgreSQL
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Supabase Cloud Database & Vercel Hosting Guide
                </h3>
                <p className="text-xs text-[#94a3b8]">
                  Zero-cost persistent storage for ASCOT Casiguran Feasibility Survey questionnaires.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCloudSetupModal(false);
                  setSyncStatusMsg(null);
                }}
                className="text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              {/* Context Callout: Why Supabase for Vercel? */}
              <div className="bg-[#070b14]/90 p-4 rounded-xl border border-[#94a3b8]/20 space-y-2">
                <div className="flex items-center gap-2 text-[#ffc857] font-bold text-xs uppercase tracking-wide">
                  <Server className="w-4 h-4 text-[#f5a623]" />
                  Why Supabase is Recommended for Vercel Hosting
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  When hosting applications on <strong>Vercel</strong>, serverless disks (like <code className="text-[#ffc857]">./data/surveys.json</code>) are ephemeral: any data saved locally is erased whenever Vercel instances sleep or redeploy.
                </p>
                <p className="text-[#94a3b8] text-[11px]">
                  Connecting <strong>Supabase</strong> (Free Tier: 500MB PostgreSQL, unlimited API requests, automated backups) permanently persists all DICADI senior high school survey responses in the cloud with zero downtime and zero cost.
                </p>
              </div>

              {/* 3-Step Setup Instructions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#f5a623] text-[#070b14] flex items-center justify-center text-[10px] font-black">1</span>
                  3-Step Quick Setup Guide (2 Minutes)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-[#070b14] p-3.5 rounded-xl border border-[#94a3b8]/20 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#ffc857]">Step 1 • Create Project</span>
                    <h5 className="font-bold text-white text-xs">Sign up at Supabase</h5>
                    <p className="text-[11px] text-[#94a3b8]">
                      Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#ffc857] underline hover:text-white">supabase.com</a>, create a free account, and click <strong>New Project</strong>. No credit card required.
                    </p>
                  </div>

                  <div className="bg-[#070b14] p-3.5 rounded-xl border border-[#94a3b8]/20 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#ffc857]">Step 2 • Run Schema</span>
                    <h5 className="font-bold text-white text-xs">Execute SQL Script</h5>
                    <p className="text-[11px] text-[#94a3b8]">
                      In your Supabase project dashboard, open the <strong>SQL Editor</strong>, paste the SQL schema below, and click <strong>Run</strong>.
                    </p>
                  </div>

                  <div className="bg-[#070b14] p-3.5 rounded-xl border border-[#94a3b8]/20 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#ffc857]">Step 3 • Add Env Vars</span>
                    <h5 className="font-bold text-white text-xs">Configure in Vercel</h5>
                    <p className="text-[11px] text-[#94a3b8]">
                      In your Vercel Project Settings &gt; <strong>Environment Variables</strong>, add <code className="text-[#ffc857]">SUPABASE_URL</code> and <code className="text-[#ffc857]">SUPABASE_ANON_KEY</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* SQL Schema Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-[#f5a623]" />
                    PostgreSQL Schema Script (<code className="text-[#ffc857] font-mono">ascot_surveys</code>)
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="bg-[#f5a623] hover:bg-[#ffc857] text-[#070b14] font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-900" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#070b14]" />
                          <span>Copy SQL Script</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload('sql')}
                      className="bg-[#070b14] hover:bg-slate-800 text-slate-300 border border-[#94a3b8]/30 text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#ffc857]" />
                      <span>Download .sql</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#070b14] border border-[#94a3b8]/20 rounded-xl p-3 font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed selection:bg-[#f5a623] selection:text-[#070b14]">
                  <pre className="whitespace-pre-wrap">{SUPABASE_SCHEMA_SQL}</pre>
                </div>
              </div>

              {/* Cloud Sync Tool: Upload Existing Local Records */}
              {isCloudConfigured && (
                <div className="p-4 bg-[#070b14] rounded-xl border border-[#94a3b8]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-[#f5a623]" />
                        Sync Local Survey Records to Supabase Cloud
                      </h5>
                      <p className="text-[11px] text-[#94a3b8]">
                        Batch upload {surveys.length} survey questionnaires from local storage into your connected Supabase PostgreSQL database.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncToCloud}
                      disabled={isSyncingToCloud || surveys.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
                    >
                      {isSyncingToCloud ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="w-3.5 h-3.5" />
                          <span>Sync to Supabase</span>
                        </>
                      )}
                    </button>
                  </div>

                  {syncStatusMsg && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                        syncStatusMsg.type === 'success'
                          ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                          : 'bg-rose-950/80 border border-rose-800 text-rose-300'
                      }`}
                    >
                      {syncStatusMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{syncStatusMsg.text}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#070b14] border-t border-[#94a3b8]/20 flex items-center justify-between text-xs">
              <span className="text-[#94a3b8] text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#f5a623]" />
                Dual-mode auto-switch enabled: Zero risk of data interruption.
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowCloudSetupModal(false);
                  setSyncStatusMsg(null);
                }}
                className="bg-[#0a1220] hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-xs border border-[#94a3b8]/30 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Database Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-[#070b14]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1220] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#94a3b8]/30 space-y-4 text-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-400 flex items-center justify-center mx-auto border border-rose-800/80">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Clear All Database Records?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete all {surveys.length} survey responses? This action will remove all respondent records from the active database.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowClearConfirm(false);
                  if (onClearAllSurveys) {
                    onClearAllSurveys();
                  }
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Clear All Records</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
