// ============================================
// Compliance Workflow - LangChain Native Orchestrator
// ============================================

import { classifyDocument, isConfidentClassification } from "@/lib/agents/classifierAgent";
import { scoreChunk } from "@/lib/agents/scorerAgent";
import { generateRecommendations } from "@/lib/agents/recommenderAgent";
import { aggregateResults } from "@/lib/agents/aggregatorAgent";
import { chunk } from "@/lib/chunkText";
import { retreiver } from "@/app/tools/policyRetreiver";
import { DEFAULT_AGENT_CONFIG } from "@/lib/types";

export async function runComplianceWorkflow(
  documentText: string,
  documentName?: string,
  category?: string
) {
  const startTime = Date.now();

  let resolvedCategory = category;
  let classificationConfidence = 1;

  if (!resolvedCategory) {
    const classification = await classifyDocument({ documentText });
    resolvedCategory = classification.category;
    classificationConfidence = classification.confidence;

    const threshold = DEFAULT_AGENT_CONFIG.classifierConfidenceThreshold;
    if (!isConfidentClassification(classification, threshold)) {
      console.warn(
        `[Classifier] Low confidence (${classification.confidence}), proceeding with suggested category ${classification.category}`
      );
    }
  }

  const chunkTexts = await chunk(
    documentText,
    DEFAULT_AGENT_CONFIG.chunkSize,
    DEFAULT_AGENT_CONFIG.chunkOverlap
  );

  const chunkAnalysis = [];

  for (let i = 0; i < chunkTexts.length; i += 1) {
    const chunkText = chunkTexts[i];

    const retrievalResults = await retreiver(
      chunkText,
      resolvedCategory || "CUSTOM",
      DEFAULT_AGENT_CONFIG.retrieverTopK
    );

    const policies = (retrievalResults.documents?.[0] || []).filter(
      (doc): doc is string => doc !== null
    );

    const scoringResult = await scoreChunk({
      chunkText,
      chunkIndex: i,
      policies,
    });

    const violationsWithChunkIndex = scoringResult.violations.map((v) => ({
      ...v,
      chunkIndex: i,
    }));

    const recommendationResult = await generateRecommendations({
      violations: violationsWithChunkIndex,
      chunkText,
      category: resolvedCategory || "CUSTOM",
    });

    chunkAnalysis.push({
      chunkIndex: i,
      chunkText: `${chunkText.substring(0, 200)}...`,
      status: scoringResult.status,
      violationScore: scoringResult.violationScore,
      severity: scoringResult.severity,
      violations: scoringResult.violations,
      recommendations: recommendationResult.recommendations,
      retrievedPolicies: policies,
    });
  }

  const report = await aggregateResults({
    documentMetadata: {
      name: documentName || "Unnamed Document",
      category: (resolvedCategory || "CUSTOM") as "IT" | "RETAIL" | "CUSTOM",
      confidence: classificationConfidence,
      analyzedAt: new Date().toISOString(),
    },
    chunkAnalysis,
  });

  return {
    success: true,
    report: {
      ...report,
      processingTimeMs: Date.now() - startTime,
    },
  };
}
