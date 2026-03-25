// ============================================
// Aggregator Agent - Compile Final Compliance Report
// ============================================

import { generateText } from "../langchainHf";
import {
  AggregatorInput,
  ComplianceReport,
  ReportStatus,
  ChunkAnalysisResult,
  Recommendation,
} from "../types";
import {
  calculateOverallScore,
  countViolationsByGrade,
  getAllViolations,
  getReportStatus,
  generateId,
  calculateExpirationDate,
} from "../utils/scoring";
import { consolidateRecommendations } from "./recommenderAgent";
import { DEFAULT_AGENT_CONFIG } from "../types";


/**
 * Aggregator Agent Logic
 * Compiles all chunk analysis results into a comprehensive compliance report
 */
export async function aggregateResults(
  input: AggregatorInput
): Promise<ComplianceReport> {
  const startTime = Date.now();

  // Calculate statistics
  const totalChunks = input.chunkAnalysis.length;
  const compliantChunks = input.chunkAnalysis.filter(
    (c) => c.status === "COMPLIANT"
  ).length;
  const violationChunks = input.chunkAnalysis.filter(
    (c) => c.status === "VIOLATION"
  ).length;
  const needsReviewChunks = input.chunkAnalysis.filter(
    (c) => c.status === "NEEDS_REVIEW"
  ).length;

  // Calculate overall score
  const overallComplianceScore = calculateOverallScore(input.chunkAnalysis);

  // Count violations by grade
  const violationsByGrade = countViolationsByGrade(input.chunkAnalysis);

  // Get all violations for status determination
  const allViolations = getAllViolations(input.chunkAnalysis);

  // Determine overall status
  const status = getReportStatus(overallComplianceScore, allViolations);

  // Consolidate all recommendations
  const allRecommendations = input.chunkAnalysis.flatMap(
    (c) => c.recommendations
  );
  const recommendations = consolidateRecommendations(allRecommendations);

  // Generate executive summary using LLM
  const executiveSummary = await generateExecutiveSummary(
    input,
    overallComplianceScore,
    status,
    violationsByGrade,
    recommendations.length
  );

  // Calculate processing time
  const processingTimeMs = Date.now() - startTime;

  // Generate report
  const report: ComplianceReport = {
    reportId: generateId("rpt"),
    documentMetadata: input.documentMetadata,
    overallComplianceScore,
    status,
    executiveSummary,
    totalChunks,
    compliantChunks,
    violationChunks,
    needsReviewChunks,
    violationsByGrade,
    recommendations,
    detailedAnalysis: input.chunkAnalysis,
    processingTimeMs,
    analyzedAt: new Date().toISOString(),
    expiresAt: calculateExpirationDate(DEFAULT_AGENT_CONFIG.reportRetentionDays),
  };

  return report;
}

/**
 * Generate executive summary using LLM
 */
async function generateExecutiveSummary(
  input: AggregatorInput,
  score: number,
  status: ReportStatus,
  violations: { critical: number; high: number; medium: number; low: number },
  recommendationCount: number
): Promise<string> {
  try {
    const prompt = `Generate a concise executive summary (2-3 sentences) for a compliance report with the following metrics:

Document: ${input.documentMetadata.name || "Unnamed Document"}
Category: ${input.documentMetadata.category}
Overall Compliance Score: ${score}/100
Status: ${status}
Total Sections Analyzed: ${input.chunkAnalysis.length}

Violations Found:
- Critical: ${violations.critical}
- High: ${violations.high}
- Medium: ${violations.medium}
- Low: ${violations.low}

Total Recommendations: ${recommendationCount}

Write a professional executive summary that:
1. States the overall compliance status
2. Highlights key concerns (if any)
3. Provides a brief action recommendation

Respond with ONLY the summary text (no JSON, no formatting).`;

    const responseText = await generateText(prompt);
    return responseText.trim();
  } catch (error) {
    console.error("Executive Summary Generation Error:", error);
    // Fallback summary
    return generateFallbackSummary(score, status, violations);
  }
}

/**
 * Generate fallback summary without LLM
 */
function generateFallbackSummary(
  score: number,
  status: ReportStatus,
  violations: { critical: number; high: number; medium: number; low: number }
): string {
  const totalViolations =
    violations.critical + violations.high + violations.medium + violations.low;

  if (status === "COMPLIANT") {
    return `The document analysis indicates full compliance with a score of ${score}/100. No significant policy violations were detected. Regular monitoring is recommended to maintain compliance.`;
  }

  if (status === "AT_RISK") {
    return `The document shows moderate compliance risk with a score of ${score}/100. ${totalViolations} violation(s) were identified, including ${violations.high} high-priority issue(s). Immediate review and remediation of flagged items is recommended.`;
  }

  return `Critical compliance issues detected with a score of ${score}/100. ${violations.critical} critical and ${violations.high} high-severity violation(s) require immediate attention. Urgent remediation is strongly advised to mitigate compliance risks.`;
}

/**
 * Format report for API response
 */
export function formatReportResponse(report: ComplianceReport): object {
  return {
    success: true,
    report: {
      id: report.reportId,
      score: report.overallComplianceScore,
      status: report.status,
      summary: report.executiveSummary,
      metadata: report.documentMetadata,
      statistics: {
        totalChunks: report.totalChunks,
        compliantChunks: report.compliantChunks,
        violationChunks: report.violationChunks,
        needsReviewChunks: report.needsReviewChunks,
      },
      violations: report.violationsByGrade,
      recommendations: report.recommendations,
      details: report.detailedAnalysis,
      timing: {
        processingTimeMs: report.processingTimeMs,
        analyzedAt: report.analyzedAt,
        expiresAt: report.expiresAt,
      },
    },
  };
}
