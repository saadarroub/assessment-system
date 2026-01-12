import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ExportOptions } from "../components/PdfExportModal";

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
  green: "#2ecc71",
  yellow: "#f1c40f",
  red: "#e74c3c",
  lightBlue: "#3498db",
  purple: "#9b59b6",
  orange: "#e67e22",
};

// RGB Conversions
const BRAND_RGB = {
  navy: [38, 69, 85] as [number, number, number],
  steel: [86, 118, 143] as [number, number, number],
  gray: [128, 128, 128] as [number, number, number],
  sand: [210, 201, 185] as [number, number, number],
  gold: [227, 187, 98] as [number, number, number],
  green: [46, 204, 113] as [number, number, number],
  yellow: [241, 196, 15] as [number, number, number],
  red: [231, 76, 60] as [number, number, number],
  lightBlue: [52, 152, 219] as [number, number, number],
  purple: [155, 89, 182] as [number, number, number],
  orange: [230, 126, 34] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// Chart colors for topics
const CHART_COLORS: [number, number, number][] = [
  [52, 152, 219],   // Blue
  [46, 204, 113],   // Green
  [155, 89, 182],   // Purple
  [230, 126, 34],   // Orange
  [241, 196, 15],   // Yellow
  [231, 76, 60],    // Red
  [26, 188, 156],   // Teal
  [149, 165, 166],  // Gray
];

interface Topic {
  id: string;
  name: string;
  score: number;
  completedSessions: number;
  totalSessions: number;
  sessionId?: string;
}

interface Catalog {
  id: string;
  name: string;
  date: string;
  overallScore: number;
  topics: Topic[];
}

interface EmployeeData {
  id: string;
  name: string;
  workSpaceRef?: string;
  email?: string;
}

interface SessionAnswer {
  questionId: string;
  questionText: string;
  inputType: string;
  answeredValue: string | null;
  score: number | null;
  maxScore: number;
  answeredAt: string | null;
  status: "automatic" | "manual" | "skipped" | "not_scorable";
}

interface SessionData {
  sessionId: string;
  themaName: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  questions: SessionAnswer[];
}

interface ReifegradInterval {
  name: string;
  start: number;
  end: number;
  color?: string;
}

interface ReifegradModel {
  id: string;
  name: string;
  description: string;
  intervals: ReifegradInterval[];
}

export interface PdfExportData {
  employee: EmployeeData;
  catalog: Catalog;
  sessionData?: SessionData[];
  reifegradModel?: ReifegradModel;
  options: ExportOptions;
}

/**
 * Generates a comprehensive PDF report for a catalog
 */
export async function generateCatalogPdf(data: PdfExportData): Promise<void> {
  const { employee, catalog, sessionData, reifegradModel, options } = data;
  const doc = new jsPDF();

  // =====================================================
  // DECKBLATT / COVER PAGE
  // =====================================================
  addCoverPage(doc, employee, catalog, reifegradModel);

  // =====================================================
  // EXECUTIVE SUMMARY
  // =====================================================
  doc.addPage();
  addExecutiveSummary(doc, catalog, sessionData, reifegradModel);

  // =====================================================
  // REIFEGRAD SECTION (if available - shown early for importance)
  // =====================================================
  if (reifegradModel) {
    doc.addPage();
    addReifegradSection(doc, reifegradModel, catalog.overallScore, catalog.topics);
  }

  // =====================================================
  // SCORING SECTION (if enabled)
  // =====================================================
  if (options.includeScoring) {
    doc.addPage();
    addScoringSection(doc, catalog);
  }

  // =====================================================
  // CHARTS SECTION (if enabled)
  // =====================================================
  if (options.includeCharts) {
    doc.addPage();
    addChartsSection(doc, catalog);
    
    // Add radar chart on new page
    doc.addPage();
    addRadarChartSection(doc, catalog);
  }

  // =====================================================
  // STRENGTHS & WEAKNESSES ANALYSIS
  // =====================================================
  if (options.includeScoring || options.includeCharts) {
    doc.addPage();
    addStrengthsWeaknessesSection(doc, catalog);
  }

  // =====================================================
  // ANSWERS SECTION (if enabled)
  // =====================================================
  if (options.includeAnswers && sessionData && sessionData.length > 0) {
    doc.addPage();
    addAnswersSection(doc, sessionData);
  }

  // =====================================================
  // STATISTICS OVERVIEW
  // =====================================================
  if (sessionData && sessionData.length > 0) {
    doc.addPage();
    addStatisticsSection(doc, sessionData, catalog);
  }

  // =====================================================
  // NOTIZEN SECTION (if provided)
  // =====================================================
  if (options.notes && options.notes.trim()) {
    doc.addPage();
    addNotesSection(doc, options.notes);
  }

  // =====================================================
  // Add page numbers to all pages
  // =====================================================
  addPageNumbers(doc);

  // Save PDF
  const fileName = `${employee.name}_${catalog.name}_Report_${new Date().toLocaleDateString("de-DE").replace(/\./g, "-")}.pdf`;
  doc.save(fileName);
}

/**
 * Add cover page with employee and catalog information
 */
function addCoverPage(doc: jsPDF, employee: EmployeeData, catalog: Catalog, reifegradModel?: ReifegradModel): void {
  // Background gradient effect (simulated with rectangles)
  doc.setFillColor(...BRAND_RGB.navy);
  doc.rect(0, 0, 210, 297, "F");

  // Decorative circles
  doc.setFillColor(255, 255, 255, 0.05);
  doc.circle(180, 30, 60, "F");
  doc.circle(30, 250, 40, "F");

  // Gold accent bar
  doc.setFillColor(...BRAND_RGB.gold);
  doc.rect(0, 90, 210, 8, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("ASSESSMENT", 105, 55, { align: "center" });
  doc.setFontSize(28);
  doc.text("REPORT", 105, 72, { align: "center" });

  // Catalog name in gold box
  doc.setFillColor(...BRAND_RGB.gold);
  doc.roundedRect(30, 110, 150, 30, 3, 3, "F");
  doc.setTextColor(...BRAND_RGB.navy);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const catalogTitle = catalog.name.length > 35 ? catalog.name.substring(0, 32) + "..." : catalog.name;
  doc.text(catalogTitle, 105, 128, { align: "center" });

  // Main score circle
  const scoreColor = getScoreColor(catalog.overallScore);
  const centerX = 105;
  const centerY = 175;
  const radius = 35;

  // Outer ring
  doc.setFillColor(...BRAND_RGB.steel);
  doc.circle(centerX, centerY, radius + 5, "F");
  
  // Score circle
  doc.setFillColor(...scoreColor);
  doc.circle(centerX, centerY, radius, "F");
  
  // Inner white circle
  doc.setFillColor(255, 255, 255);
  doc.circle(centerX, centerY, radius - 8, "F");

  // Score text
  doc.setTextColor(...scoreColor);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(`${catalog.overallScore}%`, centerX, centerY + 5, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_RGB.navy);
  doc.text("GESAMT-SCORE", centerX, centerY + 15, { align: "center" });

  // Reifegrad indicator if available
  if (reifegradModel) {
    const currentInterval = findCurrentInterval(reifegradModel.intervals, catalog.overallScore);
    if (currentInterval) {
      doc.setFillColor(...hexToRgb(currentInterval.color || BRAND.steel));
      doc.roundedRect(60, 220, 90, 20, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(currentInterval.name, 105, 233, { align: "center" });
    }
  }

  // Employee info box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(25, 250, 160, 35, 5, 5, "F");

  doc.setTextColor(...BRAND_RGB.navy);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MITARBEITER", 35, 262);
  doc.setFont("helvetica", "normal");
  doc.text(employee.name, 35, 272);
  
  if (employee.workSpaceRef) {
    doc.setFont("helvetica", "bold");
    doc.text("ABTEILUNG", 120, 262);
    doc.setFont("helvetica", "normal");
    doc.text(employee.workSpaceRef, 120, 272);
  }

  // Footer
  doc.setTextColor(255, 255, 255, 0.7);
  doc.setFontSize(8);
  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Erstellt am ${today}`, 105, 292, { align: "center" });
}

/**
 * Add executive summary page
 */
function addExecutiveSummary(doc: jsPDF, catalog: Catalog, _sessionData?: SessionData[], reifegradModel?: ReifegradModel): void {
  // Header
  addSectionHeader(doc, "Executive Summary", "Überblick über die Ergebnisse");

  let yPos = 55;

  // Key metrics boxes
  const metrics = [
    { label: "Gesamt-Score", value: `${catalog.overallScore}%`, color: getScoreColor(catalog.overallScore) },
    { label: "Themen", value: `${catalog.topics.length}`, color: BRAND_RGB.lightBlue },
    { label: "Abgeschlossen", value: `${catalog.topics.filter(t => t.completedSessions === t.totalSessions).length}/${catalog.topics.length}`, color: BRAND_RGB.green },
  ];

  const boxWidth = 55;
  const startX = 20;
  
  metrics.forEach((metric, index) => {
    const x = startX + (index * (boxWidth + 10));
    
    doc.setFillColor(...metric.color);
    doc.roundedRect(x, yPos, boxWidth, 40, 4, 4, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(metric.value, x + boxWidth / 2, yPos + 22, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(metric.label, x + boxWidth / 2, yPos + 34, { align: "center" });
  });

  yPos += 55;

  // Score distribution mini chart
  doc.setTextColor(...BRAND_RGB.navy);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Score-Verteilung nach Themen", 20, yPos);
  yPos += 8;

  // Mini horizontal bars for each topic
  catalog.topics.forEach((topic, _index) => {
    if (yPos > 250) return; // Prevent overflow

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND_RGB.gray);
    const topicName = topic.name.length > 25 ? topic.name.substring(0, 22) + "..." : topic.name;
    doc.text(topicName, 20, yPos + 5);

    // Background bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(80, yPos, 90, 8, 2, 2, "F");

    // Score bar
    const scoreColor = getScoreColor(topic.score);
    doc.setFillColor(...scoreColor);
    const width = (90 * topic.score) / 100;
    if (width > 0) {
      doc.roundedRect(80, yPos, width, 8, 2, 2, "F");
    }

    // Score text
    doc.setTextColor(...BRAND_RGB.navy);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${topic.score}%`, 175, yPos + 6);

    yPos += 14;
  });

  yPos += 10;

  // Quick insights
  if (yPos < 220) {
    doc.setTextColor(...BRAND_RGB.navy);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Schnelle Erkenntnisse", 20, yPos);
    yPos += 10;

    const insights = generateInsights(catalog, reifegradModel);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    insights.forEach((insight) => {
      if (yPos > 270) return;
      doc.setTextColor(...insight.color);
      doc.text("●", 22, yPos);
      doc.setTextColor(...BRAND_RGB.navy);
      const lines = doc.splitTextToSize(insight.text, 160);
      doc.text(lines, 30, yPos);
      yPos += lines.length * 5 + 5;
    });
  }
}

/**
 * Add section header
 */
function addSectionHeader(doc: jsPDF, title: string, subtitle?: string): void {
  doc.setFillColor(...BRAND_RGB.navy);
  doc.rect(0, 0, 210, 45, "F");

  // Gold accent line
  doc.setFillColor(...BRAND_RGB.gold);
  doc.rect(20, 38, 60, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 25);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255, 0.8);
    doc.text(subtitle, 20, 35);
  }
}

/**
 * Add scoring overview section
 */
function addScoringSection(doc: jsPDF, catalog: Catalog): void {
  addSectionHeader(doc, "Scoring & Übersicht", "Detaillierte Bewertung aller Themen");

  let yPos = 55;

  // Large score donut
  drawDonutChart(doc, 50, yPos + 35, 30, catalog.overallScore, "Gesamt");

  // Score explanation
  doc.setTextColor(...BRAND_RGB.navy);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const explanation = getScoreExplanation(catalog.overallScore);
  const explLines = doc.splitTextToSize(explanation, 100);
  doc.text(explLines, 95, yPos + 20);

  yPos += 80;

  // Topics table with visual score bars
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Bewertung pro Thema", 20, yPos);
  yPos += 10;

  const tableData = catalog.topics.map((topic) => [
    topic.name,
    `${topic.completedSessions}/${topic.totalSessions}`,
    "", // Placeholder for score bar (drawn separately)
    `${topic.score}%`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Thema", "Sessions", "Fortschritt", "Score"]],
    body: tableData,
    headStyles: {
      fillColor: BRAND_RGB.navy,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: BRAND_RGB.navy,
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 60 },
      3: { cellWidth: 25, halign: "center", fontStyle: "bold" },
    },
    margin: { left: 20, right: 20 },
    didDrawCell: (data) => {
      // Draw score bar in the "Fortschritt" column
      if (data.section === "body" && data.column.index === 2) {
        const topic = catalog.topics[data.row.index];
        const cellX = data.cell.x + 2;
        const cellY = data.cell.y + data.cell.height / 2 - 3;
        const barWidth = 56;
        const barHeight = 6;

        // Background
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(cellX, cellY, barWidth, barHeight, 1, 1, "F");

        // Score fill
        const scoreColor = getScoreColor(topic.score);
        doc.setFillColor(...scoreColor);
        const fillWidth = (barWidth * topic.score) / 100;
        if (fillWidth > 0) {
          doc.roundedRect(cellX, cellY, fillWidth, barHeight, 1, 1, "F");
        }
      }
    },
  });
}

/**
 * Add charts section with multiple visualizations
 */
function addChartsSection(doc: jsPDF, catalog: Catalog): void {
  addSectionHeader(doc, "Charts & Visualisierungen", "Grafische Darstellung der Ergebnisse");

  let yPos = 55;

  // Horizontal bar chart
  doc.setTextColor(...BRAND_RGB.navy);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Themen-Vergleich", 20, yPos);
  yPos += 12;

  const maxBarWidth = 120;
  const barHeight = 12;
  const labelWidth = 50;

  catalog.topics.forEach((topic, index) => {
    if (yPos > 240) return;

    const color = CHART_COLORS[index % CHART_COLORS.length];
    
    // Label
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND_RGB.navy);
    const topicName = topic.name.length > 18 ? topic.name.substring(0, 15) + "..." : topic.name;
    doc.text(topicName, 20, yPos + 8);

    // Background bar
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20 + labelWidth, yPos, maxBarWidth, barHeight, 2, 2, "F");

    // Score bar with gradient effect
    const scoreWidth = (maxBarWidth * topic.score) / 100;
    if (scoreWidth > 0) {
      doc.setFillColor(...color);
      doc.roundedRect(20 + labelWidth, yPos, scoreWidth, barHeight, 2, 2, "F");
      
      // Lighter overlay for 3D effect
      doc.setFillColor(255, 255, 255, 0.2);
      doc.rect(20 + labelWidth, yPos, scoreWidth, barHeight / 2, "F");
    }

    // Score value
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_RGB.navy);
    doc.text(`${topic.score}%`, 20 + labelWidth + maxBarWidth + 5, yPos + 9);

    yPos += barHeight + 8;
  });

  yPos += 15;

  // Pie chart section
  if (yPos < 200) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Score-Verteilung", 20, yPos);
    yPos += 10;

    // Draw pie chart
    const pieX = 60;
    const pieY = yPos + 35;
    const pieRadius = 30;
    
    drawPieChart(doc, pieX, pieY, pieRadius, catalog.topics);

    // Legend
    let legendY = yPos + 5;
    catalog.topics.forEach((topic, index) => {
      if (legendY > 270) return;
      
      const color = CHART_COLORS[index % CHART_COLORS.length];
      doc.setFillColor(...color);
      doc.rect(110, legendY, 8, 8, "F");
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BRAND_RGB.navy);
      const name = topic.name.length > 20 ? topic.name.substring(0, 17) + "..." : topic.name;
      doc.text(`${name} (${topic.score}%)`, 122, legendY + 6);
      
      legendY += 12;
    });
  }
}

/**
 * Add radar chart section
 */
function addRadarChartSection(doc: jsPDF, catalog: Catalog): void {
  addSectionHeader(doc, "Kompetenz-Radar", "Stärken und Schwächen auf einen Blick");

  const centerX = 105;
  const centerY = 150;
  const maxRadius = 55;

  // Draw radar chart
  drawRadarChart(doc, centerX, centerY, maxRadius, catalog.topics);

  // Legend below
  let legendY = 220;
  const cols = 2;
  const colWidth = 85;

  catalog.topics.forEach((topic, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = 25 + col * colWidth;
    const y = legendY + row * 14;

    if (y > 275) return;

    const color = CHART_COLORS[index % CHART_COLORS.length];
    doc.setFillColor(...color);
    doc.circle(x + 3, y - 2, 3, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND_RGB.navy);
    const name = topic.name.length > 25 ? topic.name.substring(0, 22) + "..." : topic.name;
    doc.text(`${name}: ${topic.score}%`, x + 10, y);
  });
}

/**
 * Add strengths and weaknesses analysis
 */
function addStrengthsWeaknessesSection(doc: jsPDF, catalog: Catalog): void {
  addSectionHeader(doc, "Stärken & Schwächen", "Analyse der Ergebnisse");

  let yPos = 55;

  // Sort topics by score
  const sortedTopics = [...catalog.topics].sort((a, b) => b.score - a.score);
  const strengths = sortedTopics.filter(t => t.score >= 70).slice(0, 3);
  const weaknesses = sortedTopics.filter(t => t.score < 70).sort((a, b) => a.score - b.score).slice(0, 3);

  // Strengths section
  doc.setFillColor(...BRAND_RGB.green);
  doc.roundedRect(20, yPos, 80, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("STÄRKEN", 25, yPos + 6);
  yPos += 15;

  if (strengths.length === 0) {
    doc.setTextColor(...BRAND_RGB.gray);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Keine Stärken identifiziert (Score ≥ 70%)", 25, yPos);
    yPos += 15;
  } else {
    strengths.forEach((topic) => {
      doc.setFillColor(232, 245, 233);
      doc.roundedRect(20, yPos - 3, 170, 18, 3, 3, "F");

      doc.setTextColor(...BRAND_RGB.green);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("✓", 25, yPos + 6);

      doc.setTextColor(...BRAND_RGB.navy);
      doc.setFont("helvetica", "normal");
      doc.text(topic.name, 35, yPos + 6);

      doc.setFont("helvetica", "bold");
      doc.text(`${topic.score}%`, 175, yPos + 6, { align: "right" });

      yPos += 22;
    });
  }

  yPos += 15;

  // Weaknesses section
  doc.setFillColor(...BRAND_RGB.red);
  doc.roundedRect(20, yPos, 100, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("VERBESSERUNGSPOTENZIAL", 25, yPos + 6);
  yPos += 15;

  if (weaknesses.length === 0) {
    doc.setTextColor(...BRAND_RGB.gray);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Keine Schwächen identifiziert (alle Scores ≥ 70%)", 25, yPos);
    yPos += 15;
  } else {
    weaknesses.forEach((topic) => {
      doc.setFillColor(255, 235, 238);
      doc.roundedRect(20, yPos - 3, 170, 18, 3, 3, "F");

      doc.setTextColor(...BRAND_RGB.red);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("!", 27, yPos + 6);

      doc.setTextColor(...BRAND_RGB.navy);
      doc.setFont("helvetica", "normal");
      doc.text(topic.name, 35, yPos + 6);

      doc.setFont("helvetica", "bold");
      doc.text(`${topic.score}%`, 175, yPos + 6, { align: "right" });

      yPos += 22;
    });
  }

  yPos += 20;

  // Recommendations
  if (weaknesses.length > 0 && yPos < 230) {
    doc.setTextColor(...BRAND_RGB.navy);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Empfehlungen", 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const recommendations = [
      `Fokussieren Sie auf die Verbesserung in "${weaknesses[0]?.name || 'Schwachstellen'}"`,
      "Regelmäßige Schulungen und Nachbesprechungen durchführen",
      "Fortschritte in den nächsten Assessments überprüfen",
    ];

    recommendations.forEach((rec, index) => {
      if (yPos > 270) return;
      doc.setTextColor(...BRAND_RGB.gold);
      doc.text(`${index + 1}.`, 22, yPos);
      doc.setTextColor(...BRAND_RGB.navy);
      doc.text(rec, 30, yPos);
      yPos += 10;
    });
  }
}

/**
 * Add detailed answers section
 */
function addAnswersSection(doc: jsPDF, sessionData: SessionData[]): void {
  addSectionHeader(doc, "Detaillierte Antworten", "Alle Fragen und Antworten im Überblick");

  let yPos = 55;
  let isFirstSession = true;

  sessionData.forEach((session) => {
    if (!isFirstSession) {
      doc.addPage();
      yPos = 20;
    }
    isFirstSession = false;

    // Session header card
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(20, yPos - 5, 170, 25, 4, 4, "F");
    
    doc.setTextColor(...BRAND_RGB.navy);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(session.themaName, 25, yPos + 5);

    // Score badge
    const scoreColor = getScoreColor(session.percentageScore);
    doc.setFillColor(...scoreColor);
    doc.roundedRect(155, yPos - 2, 30, 15, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`${Math.round(session.percentageScore)}%`, 170, yPos + 7, { align: "center" });

    yPos += 28;

    // Questions table
    const tableData = session.questions.map((q, index) => {
      const answer = q.answeredValue || "–";
      const scoreText = q.score !== null ? `${q.score}/${q.maxScore}` : "–";
      const statusIcon = q.status === "automatic" ? "✓" : q.status === "manual" ? "◉" : q.status === "skipped" ? "○" : "–";
      
      return [
        `${index + 1}`,
        q.questionText.length > 50 ? q.questionText.substring(0, 47) + "..." : q.questionText,
        answer.length > 35 ? answer.substring(0, 32) + "..." : answer,
        scoreText,
        statusIcon,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [["#", "Frage", "Antwort", "Punkte", ""]],
      body: tableData,
      headStyles: {
        fillColor: BRAND_RGB.steel,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: BRAND_RGB.navy,
        fontSize: 8,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252],
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 55 },
        2: { cellWidth: 70 },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 12, halign: "center" },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Summary row
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(20, yPos, 170, 12, 2, 2, "F");
    doc.setTextColor(...BRAND_RGB.navy);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Gesamt: ${session.totalScore}/${session.maxPossibleScore} Punkte`, 25, yPos + 8);
    doc.text(`${session.questions.length} Fragen`, 165, yPos + 8, { align: "right" });
  });
}

/**
 * Add statistics overview section
 */
function addStatisticsSection(doc: jsPDF, sessionData: SessionData[], catalog: Catalog): void {
  addSectionHeader(doc, "Statistiken", "Zusammenfassung und Kennzahlen");

  let yPos = 55;

  // Calculate statistics
  const totalQuestions = sessionData.reduce((sum, s) => sum + s.questions.length, 0);
  const totalAnswered = sessionData.reduce((sum, s) => sum + s.questions.filter(q => q.answeredValue).length, 0);
  const totalSkipped = sessionData.reduce((sum, s) => sum + s.questions.filter(q => q.status === "skipped").length, 0);
  const totalAutomatic = sessionData.reduce((sum, s) => sum + s.questions.filter(q => q.status === "automatic").length, 0);
  const totalManual = sessionData.reduce((sum, s) => sum + s.questions.filter(q => q.status === "manual").length, 0);
  const avgScore = catalog.topics.length > 0 
    ? Math.round(catalog.topics.reduce((sum, t) => sum + t.score, 0) / catalog.topics.length) 
    : 0;

  // Stats grid
  const statsBoxes = [
    { label: "Fragen gesamt", value: totalQuestions.toString(), color: BRAND_RGB.navy },
    { label: "Beantwortet", value: totalAnswered.toString(), color: BRAND_RGB.green },
    { label: "Übersprungen", value: totalSkipped.toString(), color: BRAND_RGB.yellow },
    { label: "Durchschnitt", value: `${avgScore}%`, color: BRAND_RGB.lightBlue },
  ];

  const boxWidth = 40;
  const boxHeight = 50;
  const startX = 20;

  statsBoxes.forEach((stat, index) => {
    const x = startX + index * (boxWidth + 5);
    
    doc.setFillColor(...stat.color);
    doc.roundedRect(x, yPos, boxWidth, boxHeight, 4, 4, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(stat.value, x + boxWidth / 2, yPos + 25, { align: "center" });
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(stat.label, x + boxWidth / 2, yPos + 40, { align: "center" });
  });

  yPos += 70;

  // Answer type distribution
  doc.setTextColor(...BRAND_RGB.navy);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Antwort-Verteilung", 20, yPos);
  yPos += 10;

  const distribution = [
    { label: "Automatisch bewertet", value: totalAutomatic, color: BRAND_RGB.green },
    { label: "Manuell bewertet", value: totalManual, color: BRAND_RGB.orange },
    { label: "Übersprungen", value: totalSkipped, color: BRAND_RGB.gray },
  ];

  distribution.forEach((item) => {
    const percentage = totalQuestions > 0 ? Math.round((item.value / totalQuestions) * 100) : 0;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND_RGB.navy);
    doc.text(item.label, 20, yPos + 5);

    // Bar background
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(90, yPos, 80, 8, 2, 2, "F");

    // Bar fill
    doc.setFillColor(...item.color);
    const barWidth = (80 * percentage) / 100;
    if (barWidth > 0) {
      doc.roundedRect(90, yPos, barWidth, 8, 2, 2, "F");
    }

    // Value
    doc.setFont("helvetica", "bold");
    doc.text(`${item.value} (${percentage}%)`, 175, yPos + 6);

    yPos += 14;
  });

  yPos += 20;

  // Score distribution chart
  if (yPos < 200) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Score-Verteilung nach Kategorie", 20, yPos);
    yPos += 15;

    const scoreRanges = [
      { label: "Exzellent (80-100%)", min: 80, max: 100, color: BRAND_RGB.green },
      { label: "Gut (60-79%)", min: 60, max: 79, color: BRAND_RGB.yellow },
      { label: "Verbesserungswürdig (0-59%)", min: 0, max: 59, color: BRAND_RGB.red },
    ];

    scoreRanges.forEach((range) => {
      const count = catalog.topics.filter(t => t.score >= range.min && t.score <= range.max).length;
      
      doc.setFillColor(...range.color);
      doc.circle(25, yPos - 2, 4, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BRAND_RGB.navy);
      doc.text(range.label, 35, yPos);

      doc.setFont("helvetica", "bold");
      doc.text(`${count} Themen`, 175, yPos, { align: "right" });

      yPos += 12;
    });
  }
}

/**
 * Add Reifegrad model section with detailed visualization
 */
function addReifegradSection(doc: jsPDF, model: ReifegradModel, currentScore: number, topics: Topic[]): void {
  addSectionHeader(doc, "Reifegrad-Analyse", model.name);

  let yPos = 55;

  // Current level highlight
  const currentInterval = findCurrentInterval(model.intervals, currentScore);
  
  if (currentInterval) {
    // Large highlight box for current level
    doc.setFillColor(...hexToRgb(currentInterval.color || BRAND.steel));
    doc.roundedRect(20, yPos, 170, 50, 6, 6, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("AKTUELLER REIFEGRAD", 30, yPos + 15);

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(currentInterval.name, 30, yPos + 38);

    // Score circle
    doc.setFillColor(255, 255, 255);
    doc.circle(165, yPos + 25, 18, "F");
    doc.setTextColor(...hexToRgb(currentInterval.color || BRAND.steel));
    doc.setFontSize(16);
    doc.text(`${currentScore}%`, 165, yPos + 29, { align: "center" });

    yPos += 65;
  }

  // Model description
  doc.setTextColor(...BRAND_RGB.navy);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const descLines = doc.splitTextToSize(model.description, 170);
  doc.text(descLines, 20, yPos);
  yPos += descLines.length * 5 + 15;

  // Draw the maturity scale
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Reifegrad-Skala", 20, yPos);
  yPos += 10;

  const scaleWidth = 170;
  const scaleHeight = 35;
  const scaleX = 20;
  const scaleY = yPos;

  // Sort intervals
  const sortedIntervals = [...model.intervals].sort((a, b) => a.start - b.start);

  // Draw scale segments
  sortedIntervals.forEach((interval) => {
    const startX = scaleX + (scaleWidth * interval.start) / 100;
    const width = (scaleWidth * (interval.end - interval.start)) / 100;
    const rgb = hexToRgb(interval.color || BRAND.steel);

    doc.setFillColor(...rgb);
    doc.rect(startX, scaleY, width, scaleHeight, "F");

    // Interval name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    if (width > 20) {
      doc.text(interval.name, startX + width / 2, scaleY + 15, { align: "center" });
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(`${interval.start}-${interval.end}%`, startX + width / 2, scaleY + 25, { align: "center" });
    }
  });

  // Draw current score marker (triangle pointer)
  const markerX = scaleX + (scaleWidth * currentScore) / 100;
  
  // Draw pointer triangle above scale
  doc.setFillColor(...BRAND_RGB.gold);
  doc.triangle(
    markerX, scaleY - 2,
    markerX - 6, scaleY - 12,
    markerX + 6, scaleY - 12,
    "F"
  );
  
  // Score label above pointer
  doc.setFillColor(...BRAND_RGB.gold);
  doc.roundedRect(markerX - 15, scaleY - 28, 30, 14, 3, 3, "F");
  doc.setTextColor(...BRAND_RGB.navy);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`${currentScore}%`, markerX, scaleY - 18, { align: "center" });

  // Vertical line through scale
  doc.setDrawColor(...BRAND_RGB.gold);
  doc.setLineWidth(2);
  doc.line(markerX, scaleY, markerX, scaleY + scaleHeight);

  yPos += scaleHeight + 25;

  // Interval details table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND_RGB.navy);
  doc.text("Stufen-Übersicht", 20, yPos);
  yPos += 10;

  sortedIntervals.forEach((interval) => {
    const isCurrent = currentScore >= interval.start && currentScore <= interval.end;
    const rgb = hexToRgb(interval.color || BRAND.steel);

    // Highlight current interval
    if (isCurrent) {
      doc.setFillColor(255, 248, 225);
      doc.roundedRect(20, yPos - 3, 170, 18, 3, 3, "F");
      doc.setDrawColor(...BRAND_RGB.gold);
      doc.setLineWidth(1);
      doc.roundedRect(20, yPos - 3, 170, 18, 3, 3, "S");
    }

    // Color indicator
    doc.setFillColor(...rgb);
    doc.roundedRect(25, yPos, 12, 12, 2, 2, "F");

    // Interval info
    doc.setTextColor(...BRAND_RGB.navy);
    doc.setFontSize(10);
    doc.setFont("helvetica", isCurrent ? "bold" : "normal");
    doc.text(interval.name, 45, yPos + 8);

    doc.setFont("helvetica", "normal");
    doc.text(`${interval.start}% - ${interval.end}%`, 130, yPos + 8);

    if (isCurrent) {
      doc.setTextColor(...BRAND_RGB.gold);
      doc.setFont("helvetica", "bold");
      doc.text("← SIE SIND HIER", 165, yPos + 8);
    }

    yPos += 20;
  });

  // Topic breakdown by maturity level
  if (yPos < 230) {
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_RGB.navy);
    doc.text("Themen nach Reifegrad", 20, yPos);
    yPos += 10;

    sortedIntervals.forEach((interval) => {
      const topicsInInterval = topics.filter(t => t.score >= interval.start && t.score <= interval.end);
      if (topicsInInterval.length > 0 && yPos < 270) {
        const rgb = hexToRgb(interval.color || BRAND.steel);
        
        doc.setFillColor(...rgb);
        doc.circle(25, yPos + 2, 3, "F");
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BRAND_RGB.navy);
        doc.text(`${interval.name}:`, 32, yPos + 4);
        
        doc.setFont("helvetica", "normal");
        const topicNames = topicsInInterval.map(t => t.name).join(", ");
        const truncated = topicNames.length > 80 ? topicNames.substring(0, 77) + "..." : topicNames;
        doc.text(truncated, 70, yPos + 4);
        
        yPos += 12;
      }
    });
  }
}

/**
 * Add notes section
 */
function addNotesSection(doc: jsPDF, notes: string): void {
  addSectionHeader(doc, "Notizen & Kommentare", "Zusätzliche Anmerkungen");

  let yPos = 55;

  // Notes box with decorative border
  doc.setFillColor(255, 253, 245);
  doc.setDrawColor(...BRAND_RGB.gold);
  doc.setLineWidth(1);
  doc.roundedRect(20, yPos, 170, 200, 5, 5, "FD");

  // Quote marks decoration
  doc.setTextColor(...BRAND_RGB.gold);
  doc.setFontSize(40);
  doc.text("\"", 25, yPos + 20);

  // Notes text
  doc.setTextColor(...BRAND_RGB.navy);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const notesLines = doc.splitTextToSize(notes, 155);
  doc.text(notesLines, 30, yPos + 30);
}

/**
 * Add page numbers to all pages
 */
function addPageNumbers(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(...BRAND_RGB.sand);
    doc.setLineWidth(0.5);
    doc.line(20, 285, 190, 285);
    
    // Page number
    doc.setTextColor(...BRAND_RGB.gray);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Seite ${i} von ${pageCount}`, 105, 292, { align: "center" });
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Draw a donut chart
 */
function drawDonutChart(doc: jsPDF, x: number, y: number, radius: number, score: number, label: string): void {
  const scoreColor = getScoreColor(score);
  
  // Background circle (gray)
  doc.setFillColor(230, 230, 230);
  doc.circle(x, y, radius, "F");
  
  // Score arc (simplified as filled circle with white center)
  doc.setFillColor(...scoreColor);
  doc.circle(x, y, radius, "F");
  
  // White center for donut effect
  doc.setFillColor(255, 255, 255);
  doc.circle(x, y, radius - 8, "F");
  
  // Score text
  doc.setTextColor(...scoreColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${score}%`, x, y + 3, { align: "center" });
  
  // Label
  doc.setTextColor(...BRAND_RGB.gray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(label, x, y + 12, { align: "center" });
}

/**
 * Draw a simple pie chart
 */
function drawPieChart(doc: jsPDF, x: number, y: number, radius: number, topics: Topic[]): void {
  const total = topics.reduce((sum, t) => sum + t.score, 0);
  let currentAngle = -Math.PI / 2; // Start from top
  
  topics.forEach((topic, index) => {
    const color = CHART_COLORS[index % CHART_COLORS.length];
    const sliceAngle = (topic.score / total) * 2 * Math.PI;
    
    // Draw slice
    doc.setFillColor(...color);
    
    // Approximate arc with polygon
    const segments = 20;
    const points: [number, number][] = [[x, y]];
    
    for (let i = 0; i <= segments; i++) {
      const angle = currentAngle + (sliceAngle * i) / segments;
      points.push([
        x + radius * Math.cos(angle),
        y + radius * Math.sin(angle)
      ]);
    }
    
    // Draw as filled polygon (simplified)
    if (points.length >= 3) {
      const [first, ...rest] = points;
      doc.moveTo(first[0], first[1]);
      rest.forEach(([px, py]) => {
        doc.lineTo(px, py);
      });
      doc.fill();
    }
    
    currentAngle += sliceAngle;
  });
  
  // White center for donut effect
  doc.setFillColor(255, 255, 255);
  doc.circle(x, y, radius * 0.5, "F");
}

/**
 * Draw a radar/spider chart
 */
function drawRadarChart(doc: jsPDF, centerX: number, centerY: number, maxRadius: number, topics: Topic[]): void {
  const numPoints = topics.length;
  if (numPoints < 3) return;

  const angleStep = (2 * Math.PI) / numPoints;

  // Draw background circles
  [0.25, 0.5, 0.75, 1].forEach((factor) => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.circle(centerX, centerY, maxRadius * factor, "S");
  });

  // Draw axis lines and labels
  topics.forEach((topic, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const endX = centerX + maxRadius * Math.cos(angle);
    const endY = centerY + maxRadius * Math.sin(angle);

    // Axis line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(centerX, centerY, endX, endY);

    // Label
    const labelRadius = maxRadius + 12;
    const labelX = centerX + labelRadius * Math.cos(angle);
    const labelY = centerY + labelRadius * Math.sin(angle);
    
    doc.setTextColor(...BRAND_RGB.navy);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    
    const name = topic.name.length > 12 ? topic.name.substring(0, 10) + ".." : topic.name;
    doc.text(name, labelX, labelY + 2, { align: "center" });
  });

  // Draw data polygon
  const points: [number, number][] = [];
  topics.forEach((topic, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const radius = (maxRadius * topic.score) / 100;
    points.push([
      centerX + radius * Math.cos(angle),
      centerY + radius * Math.sin(angle)
    ]);
  });

  // Fill polygon
  if (points.length >= 3) {
    doc.setFillColor(52, 152, 219, 0.3);
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(2);
    
    // Draw polygon
    doc.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([px, py]) => doc.lineTo(px, py));
    doc.lineTo(points[0][0], points[0][1]);
    doc.fillStroke();
  }

  // Draw data points
  points.forEach((point, index) => {
    const color = CHART_COLORS[index % CHART_COLORS.length];
    doc.setFillColor(...color);
    doc.circle(point[0], point[1], 3, "F");
  });

  // Center score
  doc.setFillColor(255, 255, 255);
  doc.circle(centerX, centerY, 15, "F");
  
  const avgScore = Math.round(topics.reduce((sum, t) => sum + t.score, 0) / topics.length);
  doc.setTextColor(...BRAND_RGB.navy);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`${avgScore}%`, centerX, centerY + 4, { align: "center" });
}

/**
 * Get color based on score (green, yellow, red)
 */
function getScoreColor(score: number): [number, number, number] {
  if (score >= 80) return BRAND_RGB.green;
  if (score >= 60) return BRAND_RGB.yellow;
  return BRAND_RGB.red;
}

/**
 * Get explanation text based on score
 */
function getScoreExplanation(score: number): string {
  if (score >= 80) {
    return "Exzellentes Ergebnis! Die Leistung liegt deutlich über dem Durchschnitt und zeigt eine starke Kompetenz in den geprüften Bereichen.";
  } else if (score >= 60) {
    return "Gutes Ergebnis mit Verbesserungspotenzial. Die Grundlagen sind solide, einzelne Bereiche können noch optimiert werden.";
  } else {
    return "Es besteht erhebliches Verbesserungspotenzial. Gezielte Schulungsmaßnahmen werden empfohlen.";
  }
}

/**
 * Generate insights based on catalog data
 */
function generateInsights(catalog: Catalog, reifegradModel?: ReifegradModel): Array<{ text: string; color: [number, number, number] }> {
  const insights: Array<{ text: string; color: [number, number, number] }> = [];
  
  const sortedTopics = [...catalog.topics].sort((a, b) => b.score - a.score);
  const best = sortedTopics[0];
  const worst = sortedTopics[sortedTopics.length - 1];
  
  if (best && best.score >= 70) {
    insights.push({
      text: `Stärkstes Thema: "${best.name}" mit ${best.score}%`,
      color: BRAND_RGB.green
    });
  }
  
  if (worst && worst.score < 60) {
    insights.push({
      text: `Verbesserungsbedarf: "${worst.name}" mit nur ${worst.score}%`,
      color: BRAND_RGB.red
    });
  }
  
  const avgScore = Math.round(catalog.topics.reduce((s, t) => s + t.score, 0) / catalog.topics.length);
  if (avgScore >= catalog.overallScore) {
    insights.push({
      text: `Durchschnittliche Themen-Performance: ${avgScore}%`,
      color: BRAND_RGB.lightBlue
    });
  }
  
  if (reifegradModel) {
    const currentInterval = findCurrentInterval(reifegradModel.intervals, catalog.overallScore);
    if (currentInterval) {
      insights.push({
        text: `Aktueller Reifegrad: ${currentInterval.name}`,
        color: hexToRgb(currentInterval.color || BRAND.gold)
      });
    }
  }
  
  return insights;
}

/**
 * Find the interval that contains the current score
 */
function findCurrentInterval(intervals: ReifegradInterval[], score: number): ReifegradInterval | undefined {
  return intervals.find(i => score >= i.start && score <= i.end);
}

/**
 * Convert hex color to RGB tuple
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [128, 128, 128];
}
