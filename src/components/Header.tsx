import React from 'react';
import { Database, ShieldCheck, Mail, Sparkles, HardDrive, LogOut, User, Cloud } from 'lucide-react';
import { LocalDatabaseStats } from '../types/survey';
import { AuthUser } from './LoginView';

interface HeaderProps {
  activeTab: 'input' | 'database' | 'analytics' | 'report';
  setActiveTab: (tab: 'input' | 'database' | 'analytics' | 'report') => void;
  recordCount: number;
  dbStats?: LocalDatabaseStats | null;
  targetEmail: string;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  recordCount,
  dbStats,
  targetEmail,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="bg-[#0a1220] text-white border-b border-[#070b14] sticky top-0 z-40 shadow-xl">
      {/* Top Banner: Official Republic of the Philippines / ASCOT identity */}
      <div className="bg-[#070b14] px-4 py-2 border-b border-[#0a1220] text-xs text-[#94a3b8] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">

          <span className="text-[#ffc857] font-medium tracking-wide">AURORA STATE COLLEGE OF TECHNOLOGY (ASCOT)</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline text-[#94a3b8]">ASCOT QA Committee (DICADI Area)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs bg-[#0a1220] border border-[#070b14] px-2.5 py-0.5 rounded font-medium">
            {dbStats?.databaseDetails?.isConfigured ? (
              <>
                <span className={`w-2 h-2 rounded-full ${dbStats.databaseDetails.isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className={`font-mono ${dbStats.databaseDetails.isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {dbStats.databaseDetails.isConnected ? 'MySQL: Connected' : 'MySQL: Disconnected'}
                </span>
              </>
            ) : dbStats?.cloudDetails?.isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-mono">Cloud DB: Supabase PG</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-[#f5a623]" />
                <span className="text-[#ffc857]">Database: Local Disk</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-[#0a1220] border border-[#070b14] px-2.5 py-0.5 rounded">
            <Mail className="w-3.5 h-3.5 text-[#f5a623]" />
            <span className="font-mono">{targetEmail}</span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            <img src="/ascot-logo.png" alt="ASCOT logo" className="w-16 h-16 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                ASCOT Feasibility Study System
              </h1>
              <span className="bg-[#f5a623]/15 text-[#ffc857] border border-[#f5a623]/30 text-xs px-2.5 py-0.5 rounded font-semibold">
                DINALUNGAN | CASIGURAN | DILASAG
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#94a3b8] mt-0.5">
              Direct Data Intake • Local Database & PDF Export • Feasibility Analytics • Automated Report
            </p>
          </div>
        </div>

        {/* User profile & quick status cards */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {currentUser && (
            <div className="bg-[#070b14] border border-[#94a3b8]/20 px-3 py-1.5 rounded-xl flex items-center gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-[#f5a623]/20 text-[#ffc857] border border-[#f5a623]/40 flex items-center justify-center font-bold text-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] bg-[#f5a623]/20 text-[#ffc857] px-1.5 py-0.2 rounded font-semibold">
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[10px] text-[#94a3b8] font-mono truncate max-w-[150px]">
                  {currentUser.email}
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Sign out of Ascot FSS"
                  className="ml-1 p-1.5 rounded text-[#94a3b8] hover:text-rose-400 hover:bg-[#0a1220] transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="bg-[#070b14] border border-[#94a3b8]/20 px-3.5 py-1.5 rounded-xl flex items-center gap-3 shadow-sm">
            <div className="text-right">
              <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-bold">Stored Records</div>
              <div className="text-base font-bold text-[#ffc857] font-mono">{recordCount}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#0a1220] border border-[#94a3b8]/20 flex items-center justify-center text-[#f5a623]">
              <Database className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 border-t border-[#070b14] pt-2 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'input'
                ? 'bg-[#f5a623] text-[#070b14] shadow-md shadow-[#f5a623]/20 font-bold'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#070b14]'
            }`}
          >
            <Database className="w-4 h-4" />
            Survey Data Intake
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'database'
                ? 'bg-[#f5a623] text-[#070b14] shadow-md shadow-[#f5a623]/20 font-bold'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#070b14]'
            }`}
          >
            {dbStats?.cloudDetails?.isConnected ? (
              <Cloud className="w-4 h-4" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            {dbStats?.cloudDetails?.isConnected ? 'Cloud Database' : 'Database Explorer'}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                activeTab === 'database' ? 'bg-[#070b14] text-[#ffc857]' : 'bg-[#070b14] text-[#94a3b8]'
              }`}
            >
              {recordCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#f5a623] text-[#070b14] shadow-md shadow-[#f5a623]/20 font-bold'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#070b14]'
            }`}
          >
            <span className="text-base leading-none">📊</span>
            Feasibility Analytics
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'report'
                ? 'bg-[#f5a623] text-[#070b14] shadow-md shadow-[#f5a623]/20 font-bold'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#070b14]'
            }`}
          >
            <Mail className="w-4 h-4" />
            AI Report & Email Dispatch
          </button>
        </nav>
      </div>
    </header>
  );
};
