// ============================================
// Recommender Agent - Generate Fix Recommendations
// ============================================

import { generateText } from "../langchainHf";
import {
  RecommenderInput,
  RecommenderOutput,
  Recommendation,
  PriorityLevel,
  EffortLevel,
  Violation,
} from "../types";
import { generateId } from "../utils/scoring";


/**
 * Recommender Agent Logic
 * Generates actionable recommendations to fix identified violations
 */
export async function generateRecommendations(
  input: RecommenderInput
): Promise<RecommenderOutput> {
  // If no violations, return empty recommendations
  if (!input.violations || input.violations.length === 0) {
    return { recommendations: [] };
  }

  const violationsText = input.violations
    .map(
      (v, i) =>
        `Violation ${i + 1} [${v.severity}]:
    - Description: ${v.description}
    - Policy Clause: ${v.policyClause}
    - Evidence: ${v.evidence}
    - Chunk Index: ${v.chunkIndex}`
    )
    .join("\n\n");

  const prompt = `You are a compliance remediation expert. Generate specific, actionable recommendations to fix the following policy violations.

**Document Category:** ${input.category}

**Document Excerpt:**
"""
${input.chunkText.substring(0, 500)}
"""

**Identified Violations:**
${violationsText}

**Task:** For each violation, provide a specific recommendation with:
1. Clear action steps to remediate
2. Priority level based on severity
3. Estimated effort to implement
4. Expected impact of the fix
5. Risk if the violation is not addressed

Respond in the following JSON format ONLY (no markdown, no code blocks):
{
  "recommendations": [
    {
      "violationId": "Reference to which violation this fixes (e.g., 'Violation 1')",
      "action": "Specific step-by-step action to fix the violation",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "effort": "LOW" | "MEDIUM" | "HIGH",
      "expectedImpact": "What improvement this will bring",
      "policyReference": "The specific policy this helps comply with",
      "riskIfIgnored": "What could happen if this is not addressed"
    }
  ]
}

Guidelines:
- Make actions specific and actionable (not vague)
- Priority should match the violation severity
- Be realistic about effort estimates
- Consolidate similar recommendations where appropriate`;

  try {
    const responseText = await generateText(prompt);

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse recommender response as JSON");
    }

    const result = JSON.parse(jsonMatch[0]);

    // Process recommendations
    const recommendations: Recommendation[] = (result.recommendations || []).map(
      (r: Partial<Recommendation>, index: number) => ({
        id: generateId("rec"),
        violationId: input.violations[index]?.id || r.violationId || `unknown_${index}`,
        action: r.action || "Review and address the identified violation",
        priority: validatePriority(r.priority),
        effort: validateEffort(r.effort),
        expectedImpact: r.expectedImpact || "Improved compliance posture",
        policyReference: r.policyReference || input.violations[index]?.policyClause || "General policy",
        riskIfIgnored: r.riskIfIgnored || "Potential compliance issues",
      })
    );

    // Sort by priority (CRITICAL first)
    recommendations.sort((a, b) => {
      const priorityOrder: Record<PriorityLevel, number> = {
        CRITICAL: 0,
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return { recommendations };
  } catch (error) {
    console.error("Recommender Agent Error:", error);
    // Generate basic recommendations on error
    return {
      recommendations: input.violations.map((v) => ({
        id: generateId("rec"),
        violationId: v.id,
        action: `Review and address: ${v.description}`,
        priority: mapSeverityToPriority(v.severity),
        effort: "MEDIUM" as EffortLevel,
        expectedImpact: "Address identified compliance gap",
        policyReference: v.policyClause,
        riskIfIgnored: "Continued non-compliance with policies",
      })),
    };
  }
}

/**
 * Validate priority level
 */
function validatePriority(priority: string | undefined): PriorityLevel {
  const validPriorities: PriorityLevel[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  if (priority && validPriorities.includes(priority.toUpperCase() as PriorityLevel)) {
    return priority.toUpperCase() as PriorityLevel;
  }
  return "MEDIUM";
}

/**
 * Validate effort level
 */
function validateEffort(effort: string | undefined): EffortLevel {
  const validEfforts: EffortLevel[] = ["LOW", "MEDIUM", "HIGH"];
  if (effort && validEfforts.includes(effort.toUpperCase() as EffortLevel)) {
    return effort.toUpperCase() as EffortLevel;
  }
  return "MEDIUM";
}

/**
 * Map violation severity to recommendation priority
 */
function mapSeverityToPriority(severity: string): PriorityLevel {
  const mapping: Record<string, PriorityLevel> = {
    CRITICAL: "CRITICAL",
    HIGH: "HIGH",
    MEDIUM: "MEDIUM",
    LOW: "LOW",
  };
  return mapping[severity] || "MEDIUM";
}

/**
 * Consolidate recommendations from multiple chunks
 */
export function consolidateRecommendations(
  allRecommendations: Recommendation[]
): Recommendation[] {
  // Deduplicate similar recommendations
  const seen = new Map<string, Recommendation>();

  for (const rec of allRecommendations) {
    // Create a key based on action content similarity
    const key = rec.action.toLowerCase().substring(0, 50);
    
    if (!seen.has(key)) {
      seen.set(key, rec);
    } else {
      // If duplicate exists and new one is higher priority, replace
      const existing = seen.get(key)!;
      const priorityOrder: Record<PriorityLevel, number> = {
        CRITICAL: 0,
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
      };
      if (priorityOrder[rec.priority] < priorityOrder[existing.priority]) {
        seen.set(key, rec);
      }
    }
  }

  // Return sorted by priority
  return Array.from(seen.values()).sort((a, b) => {
    const priorityOrder: Record<PriorityLevel, number> = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
