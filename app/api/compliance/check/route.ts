// ============================================
// Compliance Check API - Refactored with Mastra
// ============================================

import { NextResponse } from "next/server";
import { runComplianceWorkflow } from "@/lib/workflows/complianceWorkflow";
import mongoClient from "@/lib/mongodb";
import { ComplianceReport, StoredComplianceReport } from "@/lib/types";

const DB_NAME = "ComplianceChecker";
const REPORTS_COLLECTION = "compliance_reports";

/**
 * POST /api/compliance/check
 * Runs the full compliance analysis workflow using LangChain-powered agents
 */
export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // Validate environment
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not set");
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Parse request
    const body = await req.json();
    const { documentText, documentName, category } = body;

    if (!documentText) {
      return NextResponse.json(
        { error: "Missing documentText in request body" },
        { status: 400 }
      );
    }

    console.log("\n========== COMPLIANCE CHECK INITIATED ==========");
    console.log(`Document: ${documentName || "Unnamed"}`);
    console.log(`Category: ${category || "Auto-detect"}`);
    console.log(`Document length: ${documentText.length} characters`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log("=================================================\n");

    // Run compliance analysis workflow
    console.log("Starting LangChain compliance workflow...");
    const result = await runComplianceWorkflow(
      documentText,
      documentName,
      category
    );

    if (!result.success || !result.report) {
      return NextResponse.json(
        {
          success: false,
          error: "Compliance analysis failed",
          details: "Workflow returned no report",
        },
        { status: 500 }
      );
    }

    // Extract report from result
    const report = result.report as ComplianceReport;

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: "No report generated",
        },
        { status: 500 }
      );
    }

    // Store report in MongoDB
    try {
      await storeReport(report);
      console.log(`Report stored with ID: ${report.reportId}`);
    } catch (storageError) {
      console.error("Failed to store report:", storageError);
      // Continue without failing - report was generated successfully
    }

    const processingTime = Date.now() - startTime;

    console.log("\n========== COMPLIANCE CHECK COMPLETE ==========");
    console.log(`Status: ${report.status}`);
    console.log(`Score: ${report.overallComplianceScore}/100`);
    console.log(`Violations: ${report.violationsByGrade.critical} critical, ${report.violationsByGrade.high} high`);
    console.log(`Recommendations: ${report.recommendations.length}`);
    console.log(`Total processing time: ${processingTime}ms`);
    console.log("================================================\n");

    // Return response
    return NextResponse.json({
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
          processingTimeMs: processingTime,
          workflowTimeMs: report.processingTimeMs,
          analyzedAt: report.analyzedAt,
          expiresAt: report.expiresAt,
        },
      },
    });
  } catch (error) {
    console.error("Compliance check error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Compliance check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Store compliance report in MongoDB
 */
async function storeReport(report: ComplianceReport): Promise<void> {
  const client = await mongoClient;
  const db = client.db(DB_NAME);
  const collection = db.collection<StoredComplianceReport>(REPORTS_COLLECTION);

  // Ensure indexes exist
  await collection.createIndex({ reportId: 1 }, { unique: true });
  await collection.createIndex({ "documentMetadata.category": 1 });
  await collection.createIndex({ status: 1 });
  await collection.createIndex({ analyzedAt: -1 });
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // Insert report
  await collection.insertOne({
    ...report,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * GET /api/compliance/check
 * Returns API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/compliance/check",
    method: "POST",
    description: "Run compliance analysis on a document",
    body: {
      documentText: "string (required) - The document text to analyze",
      documentName: "string (optional) - Name of the document",
      category: "string (optional) - IT | RETAIL | CUSTOM (auto-detected if not provided)",
    },
    response: {
      success: "boolean",
      report: {
        id: "string - Unique report identifier",
        score: "number - Overall compliance score (0-100)",
        status: "string - COMPLIANT | AT_RISK | NON_COMPLIANT",
        summary: "string - Executive summary",
        metadata: "object - Document metadata",
        statistics: "object - Chunk statistics",
        violations: "object - Violation counts by severity",
        recommendations: "array - Prioritized recommendations",
        details: "array - Per-chunk analysis",
        timing: "object - Processing times",
      },
    },
    agents: [
      "Classifier Agent - Auto-detects document category",
      "Chunker Agent - Splits document into analyzable segments",
      "Retriever Agent - Finds relevant policies using RAG",
      "Scorer Agent - Identifies violations and calculates scores",
      "Recommender Agent - Generates fix recommendations",
      "Aggregator Agent - Compiles final report",
    ],
  });
}
