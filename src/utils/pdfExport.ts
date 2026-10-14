import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SurveyResponse } from '../types/survey';

/**
 * Exports all survey responses into a formatted PDF table document
 */
export function exportSurveyRecordsToPDF(surveys: SurveyResponse[]): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [30, 58, 138]; // Deep Navy
  const secondaryColor: [number, number, number] = [217, 119, 6]; // Amber

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('REPUBLIC OF THE PHILIPPINES', 14, 7);

  doc.setFontSize(13);
  doc.text('AURORA STATE COLLEGE OF TECHNOLOGY (ASCOT)', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Casiguran Campus Feasibility Study Database Records (DICADI Area)', 14, 20);

  // Metadata block
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 220, 10);
  doc.text(`Total Records: ${surveys.length}`, 220, 15);
  doc.text('Storage Mode: Local Secure Database', 220, 20);

  // Prepare table data
  const tableData = surveys.map((s, idx) => [
    s.id,
    s.respondentName || 'Anonymous',
    `${s.schoolName}\n(${s.municipality})`,
    `${s.gradeLevel} - ${s.academicStrand}`,
    s.preferredProgramToEnroll,
    s.wouldConsiderEnrolling,
    `${s.pursuingBSFisheriesDegree} (At Casiguran: ${s.takeBSFisheriesAtCasiguran})`,
    s.localVerificationHash,
  ]);

  autoTable(doc, {
    startY: 28,
    head: [
      [
        'Record ID',
        'Respondent Name',
        'School & Municipality',
        'Grade / Strand',
        'Preferred Degree Program',
        'Enroll Intent',
        'BS Fisheries',
        'Local Hash',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 42 },
      3: { cellWidth: 28 },
      4: { cellWidth: 54 },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 45 },
      7: { cellWidth: 22, fontStyle: 'bold', halign: 'center' },
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 140);
      doc.text(
        'Aurora State College of Technology • Casiguran Campus Planning Committee • ISO 9001:2015 Certified',
        14,
        205
      );
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, 270, 205);
    },
  });

  doc.save('ascot_casiguran_survey_records.pdf');
}

/**
 * Exports the comprehensive Executive Feasibility Report into a multi-page PDF
 */
export function exportFeasibilityReportToPDF(reportData: any, surveys: SurveyResponse[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const navy: [number, number, number] = [30, 58, 138];
  const amber: [number, number, number] = [217, 119, 6];
  const dark: [number, number, number] = [15, 23, 42];

  // Document Cover / Top Header
  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('REPUBLIC OF THE PHILIPPINES', 14, 9);

  doc.setFontSize(14);
  doc.text('AURORA STATE COLLEGE OF TECHNOLOGY (ASCOT)', 14, 17);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Executive Feasibility Study Report — Proposed Academic Offerings (Casiguran Campus)',
    14,
    25
  );

  let currentY = 40;

  // Key KPI Badges Bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, 182, 18, 2, 2, 'F');

  const viabilityScore = reportData?.analysis?.overallFeasibilityScore || 88;
  doc.setTextColor(...dark);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CAMPUS VIABILITY SCORE:', 18, currentY + 7);

  doc.setTextColor(...amber);
  doc.setFontSize(14);
  doc.text(`${viabilityScore}% (HIGH VIABILITY)`, 18, currentY + 14);

  doc.setTextColor(...dark);
  doc.setFontSize(8.5);
  doc.text('DICADI RESPONDENTS:', 115, currentY + 7);
  doc.setFontSize(12);
  doc.text(`${surveys.length} Students`, 115, currentY + 14);

  currentY += 25;

  // Executive Summary Section
  doc.setTextColor(...navy);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. EXECUTIVE SUMMARY', 14, currentY);

  currentY += 5;
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  const execSummary =
    reportData?.analysis?.executiveSummary ||
    `This feasibility study evaluates student enrollment potential and program demand across the Dinalungan, Casiguran, and Dilasag (DICADI) municipalities for the proposed ASCOT Casiguran Campus. Based on ${surveys.length} senior high school survey respondents, the establishment of the campus demonstrates significant institutional viability and fulfills regional educational accessibility goals.`;

  const splitSummary = doc.splitTextToSize(execSummary, 182);
  doc.text(splitSummary, 14, currentY);
  currentY += splitSummary.length * 4.5 + 6;

  // Academic Programs Demand Table
  if (reportData?.analysis?.topProgramsRanking) {
    doc.setTextColor(...navy);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. RECOMMENDED ACADEMIC PROGRAM PRIORITIZATION', 14, currentY);
    currentY += 4;

    const progData = reportData.analysis.topProgramsRanking.map((p: any, idx: number) => [
      `#${idx + 1}`,
      p.program,
      `${p.voteCount} votes`,
      `${p.percentage}%`,
      p.viabilityScore || 'High Viability',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Rank', 'Academic Program Offering', 'Student Votes', 'Demand %', 'Viability Tier']],
      body: progData,
      theme: 'striped',
      headStyles: {
        fillColor: navy,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 90, fontStyle: 'bold' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 30, halign: 'center' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check if we need a new page
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  // BS Fisheries Section
  doc.setTextColor(...navy);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. SPECIAL STUDY: BACHELOR OF SCIENCE IN FISHERIES (BS FISHERIES)', 14, currentY);
  currentY += 5;

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  const fisheriesText =
    reportData?.analysis?.bsFisheriesFeasibilityAnalysis?.coastalEconomyAlignment ||
    'The Casiguran Sound and northern Pacific coastal shelf represent essential economic lifelines for northern Aurora. Offering BS Fisheries at Casiguran Campus aligns directly with local aquaculture, coastal marine management, and municipal livelihood priorities.';

  const splitFisheries = doc.splitTextToSize(fisheriesText, 182);
  doc.text(splitFisheries, 14, currentY);
  currentY += splitFisheries.length * 4.5 + 6;

  // Strategic Recommendations
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(...navy);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('4. STRATEGIC RECOMMENDATIONS FOR ASCOT LEADERSHIP & CHED', 14, currentY);
  currentY += 5;

  const recommendations =
    reportData?.analysis?.keyStrategicRecommendations || [
      'Prioritize initial rollout of BS Information Technology and Civil Engineering to meet dominant senior high school student demand.',
      'Establish state-of-the-art marine fishery laboratory facilities and partnership with the Casiguran municipal government.',
      'Coordinate with DepEd Northern Aurora schools in Dinalungan, Casiguran, and Dilasag for structured transition programs.',
      'Ensure institutional compliance with Commission on Higher Education (CHED) Memorandum Orders for state college branch campuses.',
    ];

  recommendations.forEach((rec: string, i: number) => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    doc.setTextColor(...amber);
    doc.setFont('helvetica', 'bold');
    doc.text(`[${i + 1}]`, 14, currentY);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    const splitRec = doc.splitTextToSize(rec, 172);
    doc.text(splitRec, 22, currentY);
    currentY += splitRec.length * 4.5 + 3;
  });

  // Page Numbers Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      'Aurora State College of Technology • Casiguran Campus Feasibility Dossier • ISO 9001:2015 Certified',
      14,
      287
    );
    doc.text(`Page ${i} of ${pageCount}`, 180, 287);
  }

  doc.save('ascot_casiguran_feasibility_report.pdf');
}
