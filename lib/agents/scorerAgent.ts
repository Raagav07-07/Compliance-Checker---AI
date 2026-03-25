// ============================================
// Scorer Agent - Analyze Violations and Calculate Scores
// ============================================

import { generateText } from "../langchainHf";
import {
  ScorerInput,
  ScorerOutput,
  Violation,
  ComplianceStatus,
  SeverityLevel,
} from "../types";
import { calculateViolationScore, getSeverityFromScore, generateId } from "../utils/scoring";


/**
 * Scorer Agent Logic
 * Analyzes document chunk against policies to identify violations
 * Calculates severity-weighted violation score (0-100)
 */
export async function scoreChunk(input: ScorerInput): Promise<ScorerOutput> {
  const policiesText = input.policies
    .map((policy, i) => `Policy ${i + 1}: ${policy}`)
    .join("\n\n");

  const prompt = `You are a compliance expert analyzing document content for policy violations.

**Document Chunk (Chunk #${input.chunkIndex}):**
"""
${input.chunkText}
"""

**Relevant Company Policies:**
${policiesText}

**Task:** Analyze the document chunk and identify any policy violations.

For each violation found, determine its severity:
- CRITICAL: Severe breach that could cause significant legal/financial damage
- HIGH: Serious violation requiring immediate attention
- MEDIUM: Notable concern that should be addressed
- LOW: Minor issue for improvement

Respond in the following JSON format ONLY (no markdown, no code blocks):
{
  "status": "COMPLIANT" | "VIOLATION" | "NEEDS_REVIEW",
  "violations": [
    {
      "description": "Brief description of the violation",
      "policyClause": "The specific policy clause that is violated",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "evidence": "Specific text from the document that demonstrates the violation"
    }
  ],
  "reasoning": "Overall assessment explaining the compliance status"
}

If the chunk is compliant, return an empty violations array.
If you cannot determine compliance definitively, use "NEEDS_REVIEW".`;

  try {
    const responseText = await generateText(prompt);

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse scorer response as JSON");
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate status
    const validStatuses: ComplianceStatus[] = ["COMPLIANT", "VIOLATION", "NEEDS_REVIEW"];
    const status: ComplianceStatus = validStatuses.includes(result.status)
      ? result.status
      : "NEEDS_REVIEW";

    // Process violations
    const violations: Violation[] = (result.violations || []).map(
      (v: Partial<Violation>) => ({
        id: generateId("viol"),
        description: v.description || "Unspecified violation",
        policyClause: v.policyClause || "Policy reference unavailable",
        severity: validateSeverity(v.severity),
        evidence: v.evidence || "No specific evidence cited",
      })
    );

    // Calculate violation score
    const violationScore = calculateViolationScore(violations);
    const overallSeverity = getSeverityFromScore(violationScore);

    return {
      status,
      violationScore,
      severity: overallSeverity,
      violations,
      reasoning: result.reasoning || "Compliance assessment complete",
    };
  } catch (error) {
    console.error("Scorer Agent Error:", error);
    // Return needs review status on error
    return {
      status: "NEEDS_REVIEW",
      violationScore: 50,
      severity: "MEDIUM",
      violations: [],
      reasoning: `Error during analysis: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Validate and normalize severity level
 */
function validateSeverity(severity: string | undefined): Exclude<SeverityLevel, "NONE"> {
  const validSeverities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  if (severity && validSeverities.includes(severity.toUpperCase())) {
    return severity.toUpperCase() as Exclude<SeverityLevel, "NONE">;
  }
  return "MEDIUM";
}

/**
 * Batch process multiple chunks
 */
export async function scoreChunks(
  chunks: Array<{ text: string; index: number; policies: string[] }>
): Promise<ScorerOutput[]> {
  const results: ScorerOutput[] = [];

  for (const chunk of chunks) {
    const result = await scoreChunk({
      chunkText: chunk.text,
      chunkIndex: chunk.index,
      policies: chunk.policies,
    });
    results.push(result);
  }

  return results;
}
