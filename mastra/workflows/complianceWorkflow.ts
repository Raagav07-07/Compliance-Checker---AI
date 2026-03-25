// ============================================
// Compliance Workflow - Main Orchestrator
// ============================================

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

// Import agent logic functions
import { classifyDocument, isConfidentClassification } from "@/lib/agents/classifierAgent";
import { scoreChunk } from "@/lib/agents/scorerAgent";
import { generateRecommendations } from "@/lib/agents/recommenderAgent";
import { aggregateResults } from "@/lib/agents/aggregatorAgent";
import { chunk } from "@/lib/chunkText";
import { retreiver } from "@/app/tools/policyRetreiver";
import { DEFAULT_AGENT_CONFIG } from "@/lib/types";

// ============================================
// Step 1: Classify Document
// ============================================
const classifyStep = createStep({
  id: "classify-document",
  inputSchema: z.object({
    documentText: z.string(),
    documentName: z.string().optional(),
    category: z.string().optional(),
  }),
  outputSchema: z.object({
    documentText: z.string(),
    documentName: z.string().optional(),
    category: z.string(),
    confidence: z.number(),
    reasoning: z.string(),
    keywords: z.array(z.string()),
    requiresManualSelection: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    console.log("[Step 1] Classifying document...");

    // If category is provided, use it
    if (inputData.category) {
      return {
        documentText: inputData.documentText,
        documentName: inputData.documentName,
        category: inputData.category,
        confidence: 1.0,
        reasoning: "Category provided by user",
        keywords: [],
        requiresManualSelection: false,
      };
    }

    // Auto-classify
    const result = await classifyDocument({
      documentText: inputData.documentText,
    });

    const threshold = DEFAULT_AGENT_CONFIG.classifierConfidenceThreshold;
    const requiresManualSelection = !isConfidentClassification(result, threshold);

    console.log(`[Step 1] Classification: ${result.category} (confidence: ${result.confidence})`);

    return {
      documentText: inputData.documentText,
      documentName: inputData.documentName,
      ...result,
      requiresManualSelection,
    };
  },
});

// ============================================
// Step 2: Chunk Document
// ============================================
const chunkStep = createStep({
  id: "chunk-document",
  inputSchema: z.object({
    documentText: z.string(),
    documentName: z.string().optional(),
    category: z.string(),
    confidence: z.number(),
    reasoning: z.string(),
    keywords: z.array(z.string()),
    requiresManualSelection: z.boolean(),
  }),
  outputSchema: z.object({
    documentName: z.string().optional(),
    chunks: z.array(
      z.object({
        index: z.number(),
        text: z.string(),
      })
    ),
    category: z.string(),
    confidence: z.number(),
  }),
  execute: async ({ inputData }) => {
    console.log("[Step 2] Chunking document...");

    const chunkTexts = await chunk(
      inputData.documentText,
      DEFAULT_AGENT_CONFIG.chunkSize,
      DEFAULT_AGENT_CONFIG.chunkOverlap
    );

    const chunks = chunkTexts.map((text, index) => ({
      index,
      text,
    }));

    console.log(`[Step 2] Created ${chunks.length} chunks`);

    return {
      documentName: inputData.documentName,
      chunks,
      category: inputData.category,
      confidence: inputData.confidence,
    };
  },
});

// ============================================
// Step 3: Analyze Chunks (Retrieve, Score, Recommend)
// ============================================
const analyzeStep = createStep({
  id: "analyze-chunks",
  inputSchema: z.object({
    documentName: z.string().optional(),
    chunks: z.array(
      z.object({
        index: z.number(),
        text: z.string(),
      })
    ),
    category: z.string(),
    confidence: z.number(),
  }),
  outputSchema: z.object({
    documentName: z.string().optional(),
    chunkAnalysis: z.array(z.any()),
    category: z.string(),
    confidence: z.number(),
  }),
  execute: async ({ inputData }) => {
    console.log(`[Step 3] Analyzing ${inputData.chunks.length} chunks...`);

    const chunkAnalysis = [];

    for (const chunkData of inputData.chunks) {
      console.log(`  Processing chunk ${chunkData.index + 1}/${inputData.chunks.length}`);

      // Step 3a: Retrieve relevant policies
      const retrievalResults = await retreiver(
        chunkData.text,
        inputData.category,
        DEFAULT_AGENT_CONFIG.retrieverTopK
      );

      const policies = (retrievalResults.documents?.[0] || []).filter(
        (doc): doc is string => doc !== null
      );

      // Step 3b: Score the chunk
      const scoringResult = await scoreChunk({
        chunkText: chunkData.text,
        chunkIndex: chunkData.index,
        policies,
      });

      // Step 3c: Generate recommendations for violations
      const violationsWithChunkIndex = scoringResult.violations.map((v) => ({
        ...v,
        chunkIndex: chunkData.index,
      }));

      const recommendationResult = await generateRecommendations({
        violations: violationsWithChunkIndex,
        chunkText: chunkData.text,
        category: inputData.category,
      });

      // Compile chunk analysis
      chunkAnalysis.push({
        chunkIndex: chunkData.index,
        chunkText: chunkData.text.substring(0, 200) + "...",
        status: scoringResult.status,
        violationScore: scoringResult.violationScore,
        severity: scoringResult.severity,
        violations: scoringResult.violations,
        recommendations: recommendationResult.recommendations,
        retrievedPolicies: policies,
      });

      console.log(`  Chunk ${chunkData.index + 1}: ${scoringResult.status} (score: ${scoringResult.violationScore})`);
    }

    return {
      documentName: inputData.documentName,
      chunkAnalysis,
      category: inputData.category,
      confidence: inputData.confidence,
    };
  },
});

// ============================================
// Step 4: Aggregate Results
// ============================================
const aggregateStep = createStep({
  id: "aggregate-results",
  inputSchema: z.object({
    documentName: z.string().optional(),
    chunkAnalysis: z.array(z.any()),
    category: z.string(),
    confidence: z.number(),
  }),
  outputSchema: z.object({
    report: z.any(),
  }),
  execute: async ({ inputData }) => {
    console.log("[Step 4] Aggregating results...");

    const report = await aggregateResults({
      documentMetadata: {
        name: inputData.documentName || "Unnamed Document",
        category: inputData.category as "IT" | "RETAIL" | "CUSTOM",
        confidence: inputData.confidence,
        analyzedAt: new Date().toISOString(),
      },
      chunkAnalysis: inputData.chunkAnalysis,
    });

    console.log(`[Step 4] Report generated: ${report.status} (score: ${report.overallComplianceScore})`);

    return { report };
  },
});

// ============================================
// Create the Compliance Workflow
// ============================================
export const complianceWorkflow = createWorkflow({
  id: "compliance-workflow",
  description:
    "Complete compliance analysis workflow that classifies documents, chunks them, analyzes each chunk for policy violations, generates recommendations, and compiles a comprehensive report.",
  inputSchema: z.object({
    documentText: z.string().describe("The full document text to analyze"),
    documentName: z.string().optional().describe("Name of the document"),
    category: z.string().optional().describe("Optional category override"),
  }),
  outputSchema: z.object({
    report: z.any(),
  }),
})
  .then(classifyStep)
  .then(chunkStep)
  .then(analyzeStep)
  .then(aggregateStep)
  .commit();

// ============================================
// Workflow Execution Helper
// ============================================
export async function runComplianceCheck(
  documentText: string,
  documentName?: string,
  category?: string
) {
  const run = await complianceWorkflow.createRun();

  const result = await run.start({
    inputData: {
      documentText,
      documentName,
      category,
    },
  });

  if (result.status === "success") {
    return {
      success: true,
      report: result.result?.report,
    };
  }

  return {
    success: false,
    error: result.status === "failed" ? result.error?.message : "Workflow failed",
  };
}
