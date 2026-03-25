// ============================================
// Reports API - List Reports
// ============================================

import { NextResponse } from "next/server";
import mongoClient from "@/lib/mongodb";
import { StoredComplianceReport } from "@/lib/types";

const DB_NAME = "ComplianceChecker";
const REPORTS_COLLECTION = "compliance_reports";

/**
 * GET /api/reports
 * List all compliance reports with pagination and filtering
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Build query
    const query: Record<string, unknown> = {};
    if (category) {
      query["documentMetadata.category"] = category;
    }
    if (status) {
      query.status = status;
    }

    const client = await mongoClient;
    const db = client.db(DB_NAME);
    const collection = db.collection<StoredComplianceReport>(REPORTS_COLLECTION);

    // Get total count
    const total = await collection.countDocuments(query);

    // Get reports (excluding detailed analysis for list view)
    const reports = await collection
      .find(query, {
        projection: {
          detailedAnalysis: 0, // Exclude for performance
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format response
    const formattedReports = reports.map((report) => ({
      id: report.reportId,
      score: report.overallComplianceScore,
      status: report.status,
      summary: report.executiveSummary,
      metadata: report.documentMetadata,
      statistics: {
        totalChunks: report.totalChunks,
        compliantChunks: report.compliantChunks,
        violationChunks: report.violationChunks,
      },
      violations: report.violationsByGrade,
      recommendationCount: report.recommendations?.length || 0,
      analyzedAt: report.analyzedAt,
      createdAt: report.createdAt,
    }));

    return NextResponse.json({
      success: true,
      reports: formattedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + reports.length < total,
      },
    });
  } catch (error) {
    console.error("Error listing reports:", error);
    return NextResponse.json(
      {
        error: "Failed to list reports",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
