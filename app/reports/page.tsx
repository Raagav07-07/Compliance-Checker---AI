"use client";

import { useEffect, useState } from "react";

type ReportSummary = {
  id: string;
  score: number;
  status: string;
  summary: string;
  metadata: {
    name: string;
    category: string;
    confidence: number;
    analyzedAt: string;
  };
  statistics: {
    totalChunks: number;
    compliantChunks: number;
    violationChunks: number;
  };
  violations: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendationCount: number;
  analyzedAt: string;
};

type ReportDetails = {
  id: string;
  score: number;
  status: string;
  summary: string;
  metadata: {
    name: string;
    category: string;
    confidence: number;
    analyzedAt: string;
  };
  statistics: {
    totalChunks: number;
    compliantChunks: number;
    violationChunks: number;
    needsReviewChunks: number;
  };
  violations: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: Array<{
    id: string;
    action: string;
    priority: string;
    effort: string;
    expectedImpact: string;
  }>;
  details: Array<{
    chunkIndex: number;
    status: string;
    violationScore: number;
    severity: string;
    chunkText: string;
  }>;
  timing: {
    processingTimeMs: number;
    analyzedAt: string;
    expiresAt: string;
  };
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selected, setSelected] = useState<ReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports?limit=25");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load reports");
      }
      setReports(data.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const loadReport = async (id: string) => {
    const res = await fetch(`/api/reports/${id}`);
    const data = await res.json();
    if (res.ok) {
      setSelected(data.report);
    }
  };

  const deleteReport = async (id: string) => {
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    setSelected(null);
    fetchReports();
  };

  return (
    <main className="min-h-screen px-6 pb-16 pt-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Reports
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Compliance reports
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Browse reports, inspect details, and remove outdated analyses.
            </p>
          </div>
          <button
            onClick={fetchReports}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Refresh
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
            {loading && <p className="text-sm text-slate-500">Loading reports...</p>}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}
            {!loading && !error && reports.length === 0 && (
              <p className="text-sm text-slate-500">No reports found yet.</p>
            )}
            <div className="space-y-4">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => loadReport(report.id)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {report.metadata?.name || "Untitled report"}
                      </p>
                      <p className="text-xs text-slate-500">{report.id}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                      {report.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {report.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      Score: {report.score}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      Category: {report.metadata?.category}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      Recommendations: {report.recommendationCount}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
            {!selected && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-500">
                <p className="text-sm">Select a report to view details.</p>
              </div>
            )}

            {selected && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Report detail
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      {selected.metadata?.name || "Report"}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">{selected.id}</p>
                  </div>
                  <button
                    onClick={() => deleteReport(selected.id)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-sm text-slate-600">{selected.summary}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Score
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {selected.score}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Status
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {selected.status}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Recommendations
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {selected.recommendations.slice(0, 3).map((rec) => (
                      <p key={rec.id}>• {rec.action}</p>
                    ))}
                    {selected.recommendations.length === 0 && (
                      <p>No recommendations available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
