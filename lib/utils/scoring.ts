// ============================================
// Scoring Utility Functions
// ============================================

import {
  SeverityLevel,
  ReportStatus,
  Violation,
  SEVERITY_SCORES,
  STATUS_THRESHOLDS,
  ChunkAnalysisResult,
  ViolationsByGrade,
} from "../types";

/**
 * Calculate violation score based on severity-weighted algorithm
 * Base Score: 100
 * - CRITICAL violation: -40 points
 * - HIGH violation: -30 points
 * - MEDIUM violation: -15 points
 * - LOW violation: -5 points
 * Final Score = max(0, 100 - total_deductions)
 */
export function calculateViolationScore(violations: Violation[]): number {
  if (!violations || violations.length === 0) {
    return 100;
  }

  let totalDeductions = 0;

  for (const violation of violations) {
    const severity = violation.severity as Exclude<SeverityLevel, "NONE">;
    totalDeductions += SEVERITY_SCORES[severity] || 0;
  }

  return Math.max(0, 100 - totalDeductions);
}

/**
 * Determine severity level based on violation score
 */
export function getSeverityFromScore(score: number): SeverityLevel {
  if (score >= 90) return "NONE";
  if (score >= 70) return "LOW";
  if (score >= 50) return "MEDIUM";
  if (score >= 25) return "HIGH";
  return "CRITICAL";
}

/**
 * Determine overall report status based on score and violations
 */
export function getReportStatus(
  score: number,
  violations: Violation[]
): ReportStatus {
  const hasCritical = violations.some((v) => v.severity === "CRITICAL");
  const hasHigh = violations.some((v) => v.severity === "HIGH");

  if (hasCritical || score < STATUS_THRESHOLDS.AT_RISK_MIN_SCORE) {
    return "NON_COMPLIANT";
  }

  if (hasHigh || score < STATUS_THRESHOLDS.COMPLIANT_MIN_SCORE) {
    return "AT_RISK";
  }

  return "COMPLIANT";
}

/**
 * Calculate overall compliance score from chunk analyses
 * Uses weighted average based on chunk severity
 */
export function calculateOverallScore(
  chunkAnalysis: ChunkAnalysisResult[]
): number {
  if (!chunkAnalysis || chunkAnalysis.length === 0) {
    return 100;
  }

  const totalScore = chunkAnalysis.reduce(
    (sum, chunk) => sum + chunk.violationScore,
    0
  );
  return Math.round(totalScore / chunkAnalysis.length);
}

/**
 * Count violations by grade/severity
 */
export function countViolationsByGrade(
  chunkAnalysis: ChunkAnalysisResult[]
): ViolationsByGrade {
  const counts: ViolationsByGrade = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const chunk of chunkAnalysis) {
    for (const violation of chunk.violations) {
      switch (violation.severity) {
        case "CRITICAL":
          counts.critical++;
          break;
        case "HIGH":
          counts.high++;
          break;
        case "MEDIUM":
          counts.medium++;
          break;
        case "LOW":
          counts.low++;
          break;
      }
    }
  }

  return counts;
}

/**
 * Get all violations from chunk analyses
 */
export function getAllViolations(
  chunkAnalysis: ChunkAnalysisResult[]
): Violation[] {
  return chunkAnalysis.flatMap((chunk) => chunk.violations);
}

/**
 * Generate unique ID for violations and recommendations
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Calculate expiration date for report retention
 */
export function calculateExpirationDate(retentionDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + retentionDays);
  return date.toISOString();
}
