// ============================================
// Reports API - Get Report by ID
// ============================================

import { NextResponse } from "next/server";
import mongoClient from "@/lib/mongodb";
import { StoredComplianceReport } from "@/lib/types";

const DB_NAME = "ComplianceChecker";
const REPORTS_COLLECTION = "compliance_reports";

/**
 * GET /api/reports/[id]
 * Retrieve a specific compliance report by ID
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const client = await mongoClient;
    const db = client.db(DB_NAME);
    const collection = db.collection<StoredComplianceReport>(REPORTS_COLLECTION);

    const report = await collection.findOne({ reportId: id });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

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
          processingTimeMs: report.processingTimeMs,
          analyzedAt: report.analyzedAt,
          expiresAt: report.expiresAt,
        },
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/[id]
 * Delete a specific compliance report
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const client = await mongoClient;
    const db = client.db(DB_NAME);
    const collection = db.collection<StoredComplianceReport>(REPORTS_COLLECTION);

    const result = await collection.deleteOne({ reportId: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      {
        error: "Failed to delete report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
