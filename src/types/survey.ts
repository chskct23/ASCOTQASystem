export type Municipality = 'Casiguran' | 'Dinalungan' | 'Dilasag';

export const MUNICIPALITY_SCHOOLS: Record<Municipality, string[]> = {
  Dinalungan: [
    'JUAN C. ANGARA MEMORIAL NATIONAL HIGH SCHOOL',
    'MARIANO D. MARQUEZ MEMORIAL NATIONAL HIGH SCHOOL',
  ],
  Casiguran: [
    'DIBACONG NATIONAL HIGH SCHOOL',
    'TINIB-CALANGCUASAN INTEGRATED SCHOOL',
    'LUAL NATIONAL HIGH SCHOOL',
    'CASIGURAN NATIONAL HIGH SCHOOL',
  ],
  Dilasag: [
    'MANGGITAHAN NATIONAL HIGH SCHOOL',
    'DIMASESET NATIONAL HIGH SCHOOL',
    'DIAGYAN NATIONAL HIGH SCHOOL',
    'DILASAG NATIONAL HIGH SCHOOL',
    'DINIOG NATIONAL HIGH SCHOOL',
  ],
};

export type GradeLevel = 'Grade 11' | 'Grade 12';

export type AcademicStrand = 'STEM' | 'ABM' | 'HUMSS' | 'GAS' | 'TVL' | 'Other';

export const ACADEMIC_PROGRAMS_OFFERED = [
  'Bachelor of Science in Biology',
  'Bachelor of Science in Information Technology',
  'Bachelor of Science in Civil Engineering',
  'Bachelor of Science in Electrical Engineering',
  'Bachelor of Science in Mechanical Engineering',
  'Bachelor of Industrial Technology – Automotive Technology',
  'Bachelor of Industrial Technology – Electrical Technology',
  'Bachelor of Industrial Technology – Civil Technology',
  'Bachelor of Industrial Technology – Culinary Technology',
] as const;

export const ENROLLMENT_REASONS = [
  'Near my residence',
  'Affordable education',
  'Preferred academic program',
  'Quality of education',
  'Scholarship opportunities',
] as const;

export const FISHERIES_ENCOURAGING_FACTORS = [
  'Affordable education',
  'Near my residence',
  'Scholarship opportunities',
  'Quality of education',
  'Adequate facilities and equipment',
] as const;

export interface SurveyResponse {
  id: string;
  submittedAt: string;
  localVerificationHash: string;
  inputMethod: 'manual_entry' | 'bulk_import' | 'sample_dataset';

  // Section I: Respondent Profile
  respondentName?: string;
  schoolName: string;
  municipality: Municipality;
  gradeLevel: GradeLevel;
  academicStrand: AcademicStrand;
  otherStrand?: string;

  // Section II: Programs to Offer (up to 3)
  programsOfferWishlist: string[];
  otherProgramOfferWishlist?: string;

  // Section III: Program You Would Enroll In
  preferredProgramToEnroll: string;
  wouldConsiderEnrolling: 'Yes' | 'No' | 'Maybe';
  mainReasonsForAscot?: string[];
  mainReasonForAscot: string;
  otherMainReason?: string;

  // Section IV: Interest in BS Fisheries
  pursuingBSFisheriesDegree: 'Yes' | 'No' | 'Maybe';
  takeBSFisheriesAtCasiguran: 'Yes' | 'No';
  ifNotCasiguranPreferredSchool?: string;
  ifNotCasiguranReason?: string;
  factorsEncouragingFisheries: string[];
  otherFisheriesFactor?: string;
}

export interface LocalDatabaseStats {
  status: 'online' | 'active';
  databaseName: string;
  engine: string;
  storageMode: string;
  totalRecords: number;
  lastSyncTime: string;
  encryption: string;
  backupStatus: 'healthy' | 'local_replica';
  storagePath: string;
  databaseDetails?: {
    isConfigured: boolean;
    isConnected: boolean;
    provider: string;
    error?: string;
  };
  cloudDetails?: {
    isConfigured: boolean;
    isConnected: boolean;
    provider: string;
    error?: string;
  };
}

export interface EmailDispatchRecord {
  id: string;
  recipientEmail: string;
  subject: string;
  sentAt: string;
  status: 'DELIVERED' | 'DISPATCHED' | 'FAILED';
  trackingCode: string;
  reportSummarySnippet: string;
  totalResponsesAnalyzed: number;
}

export interface AIReportAnalysis {
  generatedAt: string;
  executiveSummary: string;
  overallFeasibilityScore: number; // 0 - 100
  topProgramsRanking: {
    program: string;
    voteCount: number;
    percentage: number;
    viabilityScore: string;
  }[];
  geographicDemandInsights: {
    casiguran: string;
    dinalungan: string;
    dilasag: string;
  };
  bsFisheriesFeasibilityAnalysis: {
    demandLevel: 'High' | 'Moderate' | 'Low';
    interestRate: number;
    keyDrivers: string[];
    barriers: string[];
    coastalEconomyAlignment: string;
  };
  keyStrategicRecommendations: string[];
  facilitiesAndFacultyNeeds: string[];
  chedComplianceReadiness: string;
}
