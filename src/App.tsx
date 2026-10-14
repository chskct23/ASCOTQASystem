/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SurveyInputView } from './components/SurveyInputView';
import { CloudDatabaseView } from './components/CloudDatabaseView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReportAndEmailView } from './components/ReportAndEmailView';
import { LoginView, AuthUser } from './components/LoginView';
import { SurveyResponse, LocalDatabaseStats } from './types/survey';
import { School, Mail, HardDrive } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'input' | 'database' | 'analytics' | 'report'>('input');
  const [surveys, setSurveys] = useState<SurveyResponse[]>([]);
  const [dbStats, setDbStats] = useState<LocalDatabaseStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Restore saved session if present
  useEffect(() => {
    try {
      const savedLocal = localStorage.getItem('ascot_fss_session');
      const savedSession = sessionStorage.getItem('ascot_fss_session');
      const sessionString = savedLocal || savedSession;

      if (sessionString) {
        const parsed = JSON.parse(sessionString);
        if (parsed && parsed.email) {
          if (parsed.email === 'cheskacate18@gmail.com' || parsed.email === 'admin@ascot.edu.ph') {
            parsed.name = 'QA Admin';
            parsed.role = 'QA Admin';
            parsed.title = 'Quality Assurance Administrator';
            parsed.email = 'admin@ascot.edu.ph';
          }
          setCurrentUser(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to parse saved session:', err);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  // Fetch surveys and db telemetry from backend once authenticated
  const fetchSurveysAndStats = async () => {
    try {
      const [surveysRes, statsRes] = await Promise.all([
        fetch('/api/surveys'),
        fetch('/api/database/status'),
      ]);

      const surveysData = await surveysRes.json();
      if (surveysData.success && Array.isArray(surveysData.data)) {
        setSurveys(surveysData.data);
      }

      const statsData = await statsRes.json();
      if (statsData.success && statsData.stats) {
        setDbStats(statsData.stats);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchSurveysAndStats();
    }
  }, [currentUser]);

  const handleSurveyAdded = (newSurvey: SurveyResponse) => {
    setSurveys((prev) => [newSurvey, ...prev]);
    fetchSurveysAndStats();
  };

  const handleBulkAdded = (count: number) => {
    fetchSurveysAndStats();
  };

  const handleDeleteSurvey = async (id: string) => {
    try {
      const res = await fetch(`/api/surveys/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSurveys((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete survey:', err);
    }
  };

  const handleClearAllSurveys = async () => {
    try {
      const res = await fetch('/api/surveys/clear', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSurveys([]);
        fetchSurveysAndStats();
      }
    } catch (err) {
      console.error('Failed to clear surveys:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ascot_fss_session');
    sessionStorage.removeItem('ascot_fss_session');
    setCurrentUser(null);
  };

  // Checking initial auth status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-[#94a3b8] space-y-3">
        <div className="w-10 h-10 border-4 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono tracking-wider">Verifying Ascot FSS Session...</p>
      </div>
    );
  }

  // Not logged in -> Show Login View
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  // Logged In -> Show Main Ascot FSS Portal
  const activeUserEmail = currentUser.email || 'admin@ascot.edu.ph';

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex flex-col font-sans text-[#070b14] selection:bg-[#f5a623] selection:text-[#070b14]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recordCount={surveys.length}
        dbStats={dbStats}
        targetEmail={activeUserEmail}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-[#94a3b8]">
            <div className="w-10 h-10 border-4 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Connecting to ASCOT Database Engine...</p>
          </div>
        ) : (
          <>
            {activeTab === 'input' && (
              <SurveyInputView
                onSurveyAdded={handleSurveyAdded}
                onBulkAdded={handleBulkAdded}
                onClearAllSurveys={handleClearAllSurveys}
                totalRecords={surveys.length}
              />
            )}

            {activeTab === 'database' && (
              <CloudDatabaseView
                surveys={surveys}
                dbStats={dbStats}
                onDeleteSurvey={handleDeleteSurvey}
                onClearAllSurveys={handleClearAllSurveys}
                onRefresh={fetchSurveysAndStats}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                surveys={surveys}
                onNavigateToReport={() => setActiveTab('report')}
              />
            )}

            {activeTab === 'report' && (
              <ReportAndEmailView
                surveys={surveys}
                targetEmail={activeUserEmail}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#070b14] text-[#94a3b8] text-xs py-8 border-t border-[#0a1220] print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f5a623] text-[#070b14] flex items-center justify-center font-bold shadow-md shadow-[#f5a623]/20">
              <School className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                Aurora State College of Technology (ASCOT)
              </div>
              <div className="text-[#94a3b8] text-xs">
                ASCOT QA Committee • Feasibility Study System (FSS)
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[#94a3b8]">
            <span className="flex items-center gap-1 text-[#ffc857]">
              <HardDrive className="w-3.5 h-3.5" /> Local Database Active
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#94a3b8]">
              <Mail className="w-3.5 h-3.5 text-[#f5a623]" /> Authenticated: {currentUser.name} ({activeUserEmail})
            </span>
            <span>•</span>
            <span>ISO 9001:2015 Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
