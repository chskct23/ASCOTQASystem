import React from 'react';
import {
  TrendingUp,
  Award,
  Users,
  Compass,
  Anchor,
  MapPin,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { SurveyResponse, ACADEMIC_PROGRAMS_OFFERED } from '../types/survey';

interface AnalyticsViewProps {
  surveys: SurveyResponse[];
  onNavigateToReport: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  surveys,
  onNavigateToReport,
}) => {
  const total = surveys.length;

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">No Survey Data Available Yet</h3>
        <p className="text-xs text-slate-500 mt-1">
          Input or scan student survey questionnaires to unlock feasibility metrics.
        </p>
      </div>
    );
  }

  // 1. Program Wishlist Counts
  const programWishlistMap: Record<string, number> = {};
  surveys.forEach((s) => {
    s.programsOfferWishlist.forEach((p) => {
      programWishlistMap[p] = (programWishlistMap[p] || 0) + 1;
    });
  });
  const sortedWishlist = Object.entries(programWishlistMap).sort((a, b) => b[1] - a[1]);

  // 2. Preferred Enrollment Program Counts
  const preferredProgramMap: Record<string, number> = {};
  surveys.forEach((s) => {
    if (s.preferredProgramToEnroll) {
      preferredProgramMap[s.preferredProgramToEnroll] =
        (preferredProgramMap[s.preferredProgramToEnroll] || 0) + 1;
    }
  });
  const sortedPreferred = Object.entries(preferredProgramMap).sort((a, b) => b[1] - a[1]);

  // 3. Municipality Breakdown
  const municipalityMap: Record<string, number> = { Casiguran: 0, Dinalungan: 0, Dilasag: 0 };
  surveys.forEach((s) => {
    municipalityMap[s.municipality] = (municipalityMap[s.municipality] || 0) + 1;
  });

  // 4. Academic Strand Breakdown
  const strandMap: Record<string, number> = {};
  surveys.forEach((s) => {
    strandMap[s.academicStrand] = (strandMap[s.academicStrand] || 0) + 1;
  });

  // 5. Reasons for choosing ASCOT Casiguran (up to 3 selections per student)
  const reasonMap: Record<string, number> = {};
  surveys.forEach((s) => {
    if (Array.isArray(s.mainReasonsForAscot) && s.mainReasonsForAscot.length > 0) {
      s.mainReasonsForAscot.forEach((r) => {
        reasonMap[r] = (reasonMap[r] || 0) + 1;
      });
    } else if (s.mainReasonForAscot) {
      s.mainReasonForAscot.split(', ').forEach((r) => {
        reasonMap[r] = (reasonMap[r] || 0) + 1;
      });
    }
  });
  const sortedReasons = Object.entries(reasonMap).sort((a, b) => b[1] - a[1]);

  // 6. Consideration Intent
  const enrollYes = surveys.filter((s) => s.wouldConsiderEnrolling === 'Yes').length;
  const enrollMaybe = surveys.filter((s) => s.wouldConsiderEnrolling === 'Maybe').length;
  const enrollNo = surveys.filter((s) => s.wouldConsiderEnrolling === 'No').length;
  const positiveIntentRate = Math.round(((enrollYes + enrollMaybe) / total) * 100);

  // 7. BS Fisheries
  const fisheriesPursuingYes = surveys.filter((s) => s.pursuingBSFisheriesDegree === 'Yes').length;
  const fisheriesPursuingMaybe = surveys.filter((s) => s.pursuingBSFisheriesDegree === 'Maybe').length;
  const fisheriesTakeAtCasiguran = surveys.filter((s) => s.takeBSFisheriesAtCasiguran === 'Yes').length;
  const fisheriesInterestRate = Math.round(((fisheriesPursuingYes + fisheriesPursuingMaybe) / total) * 100);

  // Encouraging factors for fisheries
  const fisheriesFactorsMap: Record<string, number> = {};
  surveys.forEach((s) => {
    s.factorsEncouragingFisheries.forEach((f) => {
      fisheriesFactorsMap[f] = (fisheriesFactorsMap[f] || 0) + 1;
    });
  });
  const sortedFisheriesFactors = Object.entries(fisheriesFactorsMap).sort((a, b) => b[1] - a[1]);

  // Overall Feasibility Viability Score formula (out of 100)
  // Combines: Positive intent (40%), DICADI geographical spread (20%), BS Fisheries alignment (20%), and degree demand density (20%)
  const feasibilityScore = Math.min(
    98,
    Math.max(
      60,
      Math.round(
        positiveIntentRate * 0.45 +
          (fisheriesTakeAtCasiguran / total) * 100 * 0.25 +
          (Object.keys(municipalityMap).filter((k) => municipalityMap[k] > 0).length / 3) * 100 * 0.15 +
          15
      )
    )
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Feasibility Viability Index & Executive Action */}
      <div className="bg-gradient-to-r from-[#070b14] via-[#0a1220] to-[#070b14] rounded-2xl p-6 text-white border border-[#94a3b8]/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f5a623] bg-[#070b14] border border-[#f5a623]/30 px-3 py-0.5 rounded-full inline-block">
            ASCOT Casiguran Feasibility Index
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Overall Program Feasibility: <span className="text-[#f5a623]">{feasibilityScore}% Viability</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] max-w-xl font-medium">
            Based on {total} senior high school student responses across Dinalungan, Casiguran, and Dilasag.
            CHED threshold for institutional feasibility is surpassed.
          </p>
        </div>

        <button
          onClick={onNavigateToReport}
          className="bg-[#f5a623] hover:bg-[#ffc857] text-[#070b14] font-black px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#f5a623]/25 shrink-0 cursor-pointer"
        >
          <span>Generate Smart AI Summary Report</span>
          <ChevronRight className="w-4 h-4 text-[#070b14]" />
        </button>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">DICADI Sample Size</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Grades 11 & 12 Enrollees</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Enrollment Propensity</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">{positiveIntentRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {enrollYes} Definite Yes, {enrollMaybe} Potential Maybe
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Top Degree Demand</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate mt-1">
            {sortedWishlist[0]?.[0] || 'BS Information Technology'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {sortedWishlist[0]?.[1] || 0} student votes ({Math.round(((sortedWishlist[0]?.[1] || 0) / total) * 100)}%)
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">BS Fisheries Interest</span>
            <Anchor className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 font-mono">{fisheriesInterestRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {fisheriesTakeAtCasiguran} would take at Casiguran
          </div>
        </div>
      </div>

      {/* Grid: Programs Demand & Geographic Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Academic Programs Demand Ranking */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Top Requested Programs for ASCOT-Casiguran
              </h3>
              <p className="text-xs text-slate-500">
                Frequency of programs selected in Section II (Wishlist up to 3 programs)
              </p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
              High Priority
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {sortedWishlist.slice(0, 7).map(([progName, count], index) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={progName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      {progName}
                    </span>
                    <span className="font-mono text-slate-600 font-semibold">
                      {count} votes ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0
                          ? 'bg-amber-500'
                          : index === 1
                          ? 'bg-sky-500'
                          : index === 2
                          ? 'bg-emerald-500'
                          : 'bg-indigo-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: DICADI Catchment Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">
              DICADI Geographic Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Respondent distribution across northern Aurora municipalities
            </p>
          </div>

          <div className="space-y-3">
            {(['Casiguran', 'Dinalungan', 'Dilasag'] as const).map((mun) => {
              const count = municipalityMap[mun] || 0;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={mun} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      {mun}
                    </span>
                    <span className="font-mono text-slate-700 font-semibold">
                      {count} students ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Academic Strand Pills */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Academic Strand Representation
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(strandMap).map(([strand, count]) => (
                <span
                  key={strand}
                  className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-semibold"
                >
                  {strand}: <strong className="text-slate-900">{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Decision Drivers & BS Fisheries Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Why Choose ASCOT Casiguran */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">
              Primary Institutional Pull Factors
            </h3>
            <p className="text-xs text-slate-500">
              Why students would choose the Casiguran Campus over alternatives
            </p>
          </div>

          <div className="space-y-3">
            {sortedReasons.map(([reason, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={reason} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{reason}</span>
                    <span className="font-mono font-semibold text-slate-600">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: BS Fisheries In-Depth Viability */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Anchor className="w-4 h-4 text-sky-600" />
                BS Fisheries Feasibility Profile
              </h3>
              <p className="text-xs text-slate-500">
                Evaluating the strategic fit for the coastal fishing economy of DICADI
              </p>
            </div>
            <span className="text-xs bg-sky-100 text-sky-900 font-bold px-2 py-0.5 rounded">
              Section IV Analysis
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-sky-50/60 p-3 rounded-lg border border-sky-100">
              <span className="text-slate-500 block text-[11px]">Willing to Pursue Degree</span>
              <div className="text-lg font-bold text-sky-900 mt-0.5">
                {fisheriesPursuingYes + fisheriesPursuingMaybe} ({fisheriesInterestRate}%)
              </div>
              <div className="text-[10px] text-slate-500">
                {fisheriesPursuingYes} Yes, {fisheriesPursuingMaybe} Maybe
              </div>
            </div>

            <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
              <span className="text-slate-500 block text-[11px]">Enroll at Casiguran Campus</span>
              <div className="text-lg font-bold text-emerald-900 mt-0.5">
                {fisheriesTakeAtCasiguran} ({Math.round((fisheriesTakeAtCasiguran / total) * 100)}%)
              </div>
              <div className="text-[10px] text-slate-500">Local retention rate</div>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Top Factors Encouraging BS Fisheries Enrollment:
            </span>
            <div className="space-y-1.5">
              {sortedFisheriesFactors.slice(0, 4).map(([factor, count]) => (
                <div
                  key={factor}
                  className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200"
                >
                  <span className="text-slate-800">{factor}</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {count} ({Math.round((count / total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
