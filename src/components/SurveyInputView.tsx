import React, { useState } from 'react';
import {
  FileText,
  Database,
  ArrowRight,
  RefreshCw,
  Info,
  ShieldCheck,
  Check,
  CheckCircle2,
  HardDrive,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import {
  SurveyResponse,
  ACADEMIC_PROGRAMS_OFFERED,
  ENROLLMENT_REASONS,
  FISHERIES_ENCOURAGING_FACTORS,
  Municipality,
  GradeLevel,
  AcademicStrand,
  MUNICIPALITY_SCHOOLS,
} from '../types/survey';

interface SurveyInputViewProps {
  onSurveyAdded: (survey: SurveyResponse) => void;
  onBulkAdded?: (count: number) => void;
  onClearAllSurveys?: () => void;
  totalRecords?: number;
}

export const SurveyInputView: React.FC<SurveyInputViewProps> = ({
  onSurveyAdded,
  onBulkAdded,
  onClearAllSurveys,
  totalRecords = 0,
}) => {
  // Digital Form State - starts clean with no pre-checked answers
  const [respondentName, setRespondentName] = useState('');
  const [municipality, setMunicipality] = useState<Municipality>('Casiguran');
  const [schoolName, setSchoolName] = useState('CASIGURAN NATIONAL HIGH SCHOOL');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('Grade 12');
  const [academicStrand, setAcademicStrand] = useState<AcademicStrand>('STEM');
  const [otherStrand, setOtherStrand] = useState('');

  // Section II: Programs to offer (select up to 3) - start empty
  const [programsWishlist, setProgramsWishlist] = useState<string[]>([]);
  const [otherProgramWishlist, setOtherProgramWishlist] = useState('');

  // Section III: Program to enroll
  const [preferredProgram, setPreferredProgram] = useState('');
  const [wouldConsiderEnrolling, setWouldConsiderEnrolling] = useState<'Yes' | 'No' | 'Maybe'>('Yes');

  // Question 8: Reasons (select up to 3) - start empty
  const [mainReasons, setMainReasons] = useState<string[]>([]);
  const [otherMainReason, setOtherMainReason] = useState('');

  // Section IV: Fisheries
  const [pursuingFisheries, setPursuingFisheries] = useState<'Yes' | 'No' | 'Maybe'>('Maybe');
  const [takeFisheriesAtCasiguran, setTakeFisheriesAtCasiguran] = useState<'Yes' | 'No'>('Yes');
  const [preferredSchoolIfNotCasiguran, setPreferredSchoolIfNotCasiguran] = useState('');
  const [reasonIfNotCasiguran, setReasonIfNotCasiguran] = useState('');
  const [fisheriesFactors, setFisheriesFactors] = useState<string[]>([]);
  const [otherFisheriesFactor, setOtherFisheriesFactor] = useState('');

  const [isExporting, setIsExporting] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [showClearDbConfirm, setShowClearDbConfirm] = useState(false);

  // Clear all data input fields (resets the entire form)
  const handleClearAllFormInputs = () => {
    setRespondentName('');
    setSchoolName(MUNICIPALITY_SCHOOLS[municipality][0] || '');
    setOtherStrand('');
    setProgramsWishlist([]);
    setOtherProgramWishlist('');
    setPreferredProgram('');
    setWouldConsiderEnrolling('Yes');
    setMainReasons([]);
    setOtherMainReason('');
    setPursuingFisheries('Maybe');
    setTakeFisheriesAtCasiguran('Yes');
    setPreferredSchoolIfNotCasiguran('');
    setReasonIfNotCasiguran('');
    setFisheriesFactors([]);
    setOtherFisheriesFactor('');
    setSaveSuccessMessage('All form data inputs have been completely cleared.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle up to 3 programs for Section II
  const toggleProgramWishlist = (program: string) => {
    if (programsWishlist.includes(program)) {
      setProgramsWishlist(programsWishlist.filter((p) => p !== program));
    } else {
      if (programsWishlist.length < 3) {
        setProgramsWishlist([...programsWishlist, program]);
      }
    }
  };

  // Number 8: User can select up to 3 reasons and unselect freely
  const toggleMainReason = (reason: string) => {
    if (mainReasons.includes(reason)) {
      setMainReasons(mainReasons.filter((r) => r !== reason));
    } else {
      if (mainReasons.length < 3) {
        setMainReasons([...mainReasons, reason]);
      }
    }
  };

  const toggleFisheriesFactor = (factor: string) => {
    if (fisheriesFactors.includes(factor)) {
      setFisheriesFactors(fisheriesFactors.filter((f) => f !== factor));
    } else {
      setFisheriesFactors([...fisheriesFactors, factor]);
    }
  };

  // When municipality changes, show official schools for that municipality and set first school
  const handleMunicipalityChange = (mun: Municipality) => {
    setMunicipality(mun);
    const schools = MUNICIPALITY_SCHOOLS[mun];
    if (schools && schools.length > 0) {
      setSchoolName(schools[0]);
    } else {
      setSchoolName('');
    }
  };

  // Submit manual digital form
  const handleDigitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);
    setSaveSuccessMessage(null);

    const payload: Partial<SurveyResponse> = {
      respondentName,
      schoolName,
      municipality,
      gradeLevel,
      academicStrand,
      otherStrand,
      programsOfferWishlist: programsWishlist,
      otherProgramOfferWishlist: otherProgramWishlist,
      preferredProgramToEnroll: preferredProgram || 'Bachelor of Science in Information Technology',
      wouldConsiderEnrolling,
      mainReasonsForAscot: mainReasons,
      mainReasonForAscot: mainReasons.join(', ') || 'Near my residence',
      otherMainReason,
      pursuingBSFisheriesDegree: pursuingFisheries,
      takeBSFisheriesAtCasiguran: takeFisheriesAtCasiguran,
      ifNotCasiguranPreferredSchool: preferredSchoolIfNotCasiguran,
      ifNotCasiguranReason: reasonIfNotCasiguran,
      factorsEncouragingFisheries: fisheriesFactors,
      otherFisheriesFactor,
      inputMethod: 'manual_entry',
    };

    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onSurveyAdded(data.data);
        setSaveSuccessMessage(
          `Record saved into Local Database with hash [${data.localVerificationHash}]. Storage updated successfully.`
        );
        // Clear respondent name and fields for next entry
        setRespondentName('');
        setProgramsWishlist([]);
        setMainReasons([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Local Storage Mode Active
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              Offline-Capable
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            ASCOT Survey Questionnaire Data Entry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Directly record student responses from senior high schools in Casiguran, Dinalungan, and Dilasag.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Clear Form Data Input Button */}
          <button
            type="button"
            onClick={handleClearAllFormInputs}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Clear all fields in this questionnaire form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form Inputs</span>
          </button>

          {/* Clear Database Records Button */}
          {onClearAllSurveys && totalRecords > 0 && (
            <button
              type="button"
              onClick={() => setShowClearDbConfirm(true)}
              className="bg-slate-100 hover:bg-rose-900 hover:text-white text-slate-600 font-medium px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all"
              title="Wipe all stored survey records from local database"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear Database ({totalRecords})</span>
            </button>
          )}
        </div>
      </div>

      {/* Clear Database Confirmation Modal */}
      {showClearDbConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Clear All Stored Records?</h3>
              <p className="text-xs text-slate-600 mt-1">
                This will delete all {totalRecords} survey records from the local database. You can reload sample data or enter fresh questionnaires anytime.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearDbConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowClearDbConfirm(false);
                  if (onClearAllSurveys) onClearAllSurveys();
                  handleClearAllFormInputs();
                  setSaveSuccessMessage('All survey records in the local database have been cleared.');
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Clear All Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {saveSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start gap-3 text-emerald-900 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Action Complete</h4>
            <p className="text-xs text-emerald-800 mt-0.5">{saveSuccessMessage}</p>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* DIGITAL QUESTIONNAIRE FORM */}
      <form
        onSubmit={handleDigitalSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#0a1220] p-6 text-white border-b border-[#070b14]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[#f5a623] font-bold text-xs uppercase tracking-wider">
                Aurora State College of Technology (ASCOT)
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                Feasibility Study Questionnaire Form
              </h3>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-0.5">
                Proposed Academic Program Offerings of ASCOT – Casiguran Campus (DICADI Area)
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#ffc857] bg-[#070b14] border border-[#f5a623]/30 px-3 py-1 rounded-lg font-mono">
              <HardDrive className="w-3.5 h-3.5 text-[#f5a623]" />
              <span>Saves Directly to Local Storage</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* SECTION I: RESPONDENT PROFILE */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#f5a623] text-[#070b14] font-black text-xs flex items-center justify-center shadow-xs">
                  I
                </span>
                RESPONDENT PROFILE
              </h4>
              <span className="text-xs text-[#94a3b8]">DICADI Catchment Area</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Name (Optional)
                </label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz (or leave blank for anonymous)"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Municipality Selection Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    2. Select Municipality:
                  </label>
                  <span className="text-[11px] text-amber-700 font-semibold">
                    Selecting a municipality immediately loads its official secondary schools
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl">
                  {(['Dinalungan', 'Casiguran', 'Dilasag'] as Municipality[]).map((mun) => {
                    const count = MUNICIPALITY_SCHOOLS[mun]?.length || 0;
                    const isSelected = municipality === mun;
                    return (
                      <button
                        key={mun}
                        type="button"
                        onClick={() => handleMunicipalityChange(mun)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-400/40'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                        }`}
                      >
                        <span className="text-xs font-extrabold uppercase tracking-wide">{mun}</span>
                        <span
                          className={`text-[10px] ${
                            isSelected ? 'text-slate-950 font-bold' : 'text-slate-500'
                          }`}
                        >
                          {count} {count === 1 ? 'School' : 'Schools'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic School List Based on Selected Municipality */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Official Senior High Schools in {municipality.toUpperCase()}
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded">
                      {MUNICIPALITY_SCHOOLS[municipality]?.length} Schools Listed
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Click a school card or select from the dropdown below
                  </span>
                </div>

                {/* Numbered School Cards as Specified by User */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MUNICIPALITY_SCHOOLS[municipality]?.map((sch, idx) => {
                    const isSelected = schoolName === sch;
                    return (
                      <button
                        key={sch}
                        type="button"
                        onClick={() => setSchoolName(sch)}
                        className={`p-3 rounded-lg border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 border-amber-500 text-slate-950 font-bold shadow-xs ring-2 ring-amber-400/50'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <span className="leading-snug block font-mono font-bold tracking-tight text-[11px]">
                            {sch}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown Selector for Secondary Schools */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                  <span className="text-slate-600 shrink-0 font-bold">Selected School:</span>
                  <select
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="flex-1 font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {MUNICIPALITY_SCHOOLS[municipality]?.map((sch, idx) => (
                      <option key={sch} value={sch}>
                        {idx + 1}. {sch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Grade Level & Strand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Grade Level
                </label>
                <div className="flex gap-4 mt-1.5">
                  {(['Grade 11', 'Grade 12'] as GradeLevel[]).map((lvl) => (
                    <label
                      key={lvl}
                      className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="gradeLevel"
                        checked={gradeLevel === lvl}
                        onChange={() => setGradeLevel(lvl)}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span>{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Academic Strand
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'Other'] as AcademicStrand[]).map(
                    (strand) => (
                      <button
                        key={strand}
                        type="button"
                        onClick={() => setAcademicStrand(strand)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          academicStrand === strand
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {strand}
                      </button>
                    )
                  )}
                </div>
                {academicStrand === 'Other' && (
                  <input
                    type="text"
                    placeholder="Specify other strand..."
                    value={otherStrand}
                    onChange={(e) => setOtherStrand(e.target.value)}
                    className="mt-2 w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* SECTION II: PROGRAMS YOU WOULD LIKE TO OFFER */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  II
                </span>
                5. PROGRAMS YOU WOULD LIKE ASCOT–CASIGURAN CAMPUS TO OFFER
              </h4>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                programsWishlist.length === 3
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                Selected: {programsWishlist.length}/3 (Select up to 3)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              You may select up to three (3) programs that ASCOT should establish at the Casiguran Campus:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ACADEMIC_PROGRAMS_OFFERED.map((prog) => {
                const isChecked = programsWishlist.includes(prog);
                const isMaxReached = !isChecked && programsWishlist.length >= 3;
                return (
                  <div
                    key={prog}
                    onClick={() => !isMaxReached && toggleProgramWishlist(prog)}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-amber-50 border-amber-500 text-slate-950 font-bold ring-1 ring-amber-400 cursor-pointer shadow-xs'
                        : isMaxReached
                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <span className="text-xs">{prog}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-2 ${
                        isChecked ? 'bg-amber-500 border-amber-600 text-slate-950' : 'border-slate-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION III: PROGRAM YOU WOULD ENROLL IN */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  III
                </span>
                PROGRAM YOU WOULD ENROLL IN
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6. If your preferred program is offered, which would you most likely enroll in?
                </label>
                <select
                  value={preferredProgram}
                  onChange={(e) => setPreferredProgram(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Select Preferred Academic Program --</option>
                  {ACADEMIC_PROGRAMS_OFFERED.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                  <option value="Bachelor of Science in Fisheries">Bachelor of Science in Fisheries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  7. Would you consider enrolling?
                </label>
                <div className="flex gap-4 mt-2">
                  {(['Yes', 'No', 'Maybe'] as const).map((choice) => (
                    <label key={choice} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="wouldConsider"
                        checked={wouldConsiderEnrolling === choice}
                        onChange={() => setWouldConsiderEnrolling(choice)}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* QUESTION NUMBER 8: ABLE TO SELECT UP TO 3 */}
            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block text-xs font-bold text-slate-900">
                  8. What is the main reason you would choose ASCOT–Casiguran Campus?
                </label>
                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-md transition-all self-start sm:self-auto ${
                    mainReasons.length === 3
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : mainReasons.length > 0
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Selected: {mainReasons.length}/3 (Select up to 3)
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                You can select up to three (3) reasons from the options below. Click any item to select or unselect:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                {ENROLLMENT_REASONS.map((r) => {
                  const isChecked = mainReasons.includes(r);
                  const isMaxReached = !isChecked && mainReasons.length >= 3;
                  return (
                    <div
                      key={r}
                      onClick={() => !isMaxReached && toggleMainReason(r)}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-amber-100 border-amber-500 text-slate-950 font-bold shadow-sm ring-2 ring-amber-400/50 cursor-pointer'
                          : isMaxReached
                          ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <span className="pr-1">{r}</span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-1.5 ${
                          isChecked ? 'bg-amber-500 border-amber-600 text-slate-950' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {mainReasons.length === 3 && (
                <p className="text-[11px] text-emerald-800 font-medium pt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Maximum 3 reasons selected. To select a different reason, click a selected reason to uncheck it first.</span>
                </p>
              )}
            </div>
          </div>

          {/* SECTION IV: BS FISHERIES INTEREST */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  IV
                </span>
                INTEREST IN BACHELOR OF SCIENCE IN FISHERIES
              </h4>
              <span className="text-xs text-slate-400">Coastal Community Focus</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  9. Pursuing BS Fisheries as college degree?
                </label>
                <div className="flex gap-4 mt-2">
                  {(['Yes', 'No', 'Maybe'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="pursuingFisheries"
                        checked={pursuingFisheries === opt}
                        onChange={() => setPursuingFisheries(opt)}
                        className="text-amber-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  10. Consider taking BS Fisheries at ASCOT-Casiguran?
                </label>
                <div className="flex gap-4 mt-2">
                  {(['Yes', 'No'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="takeAtCasiguran"
                        checked={takeFisheriesAtCasiguran === opt}
                        onChange={() => setTakeFisheriesAtCasiguran(opt)}
                        className="text-amber-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {takeFisheriesAtCasiguran === 'No' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    11. Preferred alternative school:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ASCOT Baler / CLSU"
                    value={preferredSchoolIfNotCasiguran}
                    onChange={(e) => setPreferredSchoolIfNotCasiguran(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason:</label>
                  <input
                    type="text"
                    placeholder="e.g. More specialized equipment"
                    value={reasonIfNotCasiguran}
                    onChange={(e) => setReasonIfNotCasiguran(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                12. Factors that would encourage you to enroll in BS Fisheries at Casiguran Campus:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {FISHERIES_ENCOURAGING_FACTORS.map((fac) => {
                  const isChecked = fisheriesFactors.includes(fac);
                  return (
                    <div
                      key={fac}
                      onClick={() => toggleFisheriesFactor(fac)}
                      className={`p-2.5 rounded-lg border cursor-pointer text-xs flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{fac}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ml-1 ${
                          isChecked ? 'bg-emerald-600 border-emerald-700 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearAllFormInputs}
                className="bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Form Inputs</span>
              </button>
              <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Local SHA-256 integrity tag</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isExporting}
              className="w-full sm:w-auto bg-[#f5a623] hover:bg-[#ffc857] text-[#070b14] font-black px-7 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#f5a623]/25 transition-all text-sm cursor-pointer"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#070b14]" />
                  <span>Saving to Local Database...</span>
                </>
              ) : (
                <>
                  <span>Save Record to Local Database</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
