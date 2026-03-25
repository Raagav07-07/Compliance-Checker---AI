// ============================================
// Compliance History API
// ============================================

import { NextResponse } from "next/server";
import mongoClient from "@/lib/mongodb";
import { StoredComplianceReport } from "@/lib/types";

const DB_NAME = "ComplianceChecker";
const REPORTS_COLLECTION = "compliance_reports";

/**
 * GET /api/compliance/history
 * Get compliance analysis history
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Query parameters
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const days = parseInt(searchParams.get("days") || "30");

    // Build query
    const query: Record<string, unknown> = {};
    
    if (category) {
      query["documentMetadata.category"] = category;
    }
    if (status) {
      query.status = status;
    }

    // Date filter
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    query.createdAt = { $gte: cutoffDate };

    const client = await mongoClient;
    const db = client.db(DB_NAME);
    const collection = db.collection<StoredComplianceReport>(REPORTS_COLLECTION);

    // Get reports
    const reports = await collection
      .find(query, {
        projection: {
          reportId: 1,
          overallComplianceScore: 1,
          status: 1,
          executiveSummary: 1,
          documentMetadata: 1,
          violationsByGrade: 1,
          totalChunks: 1,
          analyzedAt: 1,
          createdAt: 1,
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Calculate statistics
    const stats = {
      totalAnalyses: reports.length,
      averageScore: reports.length > 0
        ? Math.round(
            reports.reduce((sum, r) => sum + r.overallComplianceScore, 0) /
              reports.length
          )
        : 0,
      statusBreakdown: {
        compliant: reports.filter((r) => r.status === "COMPLIANT").length,
        atRisk: reports.filter((r) => r.status === "AT_RISK").length,
        nonCompliant: reports.filter((r) => r.status === "NON_COMPLIANT").length,
      },
      categoryBreakdown: {
        IT: reports.filter((r) => r.documentMetadata.category === "IT").length,
        RETAIL: reports.filter((r) => r.documentMetadata.category === "RETAIL").length,
        CUSTOM: reports.filter((r) => r.documentMetadata.category === "CUSTOM").length,
      },
    };

    // Format response
    const formattedReports = reports.map((report) => ({
      id: report.reportId,
      score: report.overallComplianceScore,
      status: report.status,
      summary: report.executiveSummary?.substring(0, 150) + "...",
      category: report.documentMetadata.category,
      documentName: report.documentMetadata.name,
      violations: report.violationsByGrade,
      chunksAnalyzed: report.totalChunks,
      analyzedAt: report.analyzedAt,
    }));

    return NextResponse.json({
      success: true,
      history: formattedReports,
      statistics: stats,
      query: {
        category,
        status,
        limit,
        days,
      },
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch compliance history",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
