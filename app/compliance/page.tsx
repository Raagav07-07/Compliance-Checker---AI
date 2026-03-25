"use client";

import { useState } from "react";

type Category = "IT" | "RETAIL" | "CUSTOM" | "";

interface ComplianceReport {
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
    chunkText: string;
    status: string;
    violationScore: number;
    severity: string;
    violations: Array<{
      id: string;
      description: string;
      policyClause: string;
      severity: string;
      evidence: string;
    }>;
    recommendations: Array<{ action: string }>;
    retrievedPolicies: string[];
  }>;
  timing: {
    processingTimeMs: number;
    workflowTimeMs: number;
    analyzedAt: string;
    expiresAt: string;
  };
}

export default function ComplianceCheckPage() {
  const [category, setCategory] = useState<Category>("");
  const [documentText, setDocumentText] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!documentText.trim()) {
      setError("Please enter document text");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const res = await fetch("/api/compliance/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText,
          documentName,
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.details || data.error || "Unknown error");
        return;
      }

      setReport(data.report);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze compliance"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 pb-16 pt-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Compliance workflow
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Run a compliance check
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Paste document text, select a category, and generate a full
              compliance report.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Processing mode: Mastra agents
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Input</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Document name (optional)
                </label>
                <input
                  value={documentName}
                  onChange={(event) => setDocumentName(event.target.value)}
                  placeholder="Employee handbook v2"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Category (optional)
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["IT", "RETAIL", "CUSTOM"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        category === cat
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Document text
                </label>
                <textarea
                  value={documentText}
                  onChange={(event) => setDocumentText(event.target.value)}
                  placeholder="Paste your document here. The system will chunk it and analyze against policy clauses."
                  className="mt-2 h-48 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="mt-2 text-xs text-slate-500">
                  {documentText.length} characters
                </p>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !documentText.trim()}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
                  loading || !documentText.trim()
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {loading ? "Analyzing..." : "Run compliance check"}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
            {loading && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
                <p className="text-sm text-slate-600">Running analysis...</p>
              </div>
            )}

            {!loading && report && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Report
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    {report.metadata.name || "Untitled document"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">{report.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      Score: {report.score}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      Status: {report.status}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      Category: {report.metadata.category}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      label: "Total chunks",
                      value: report.statistics.totalChunks,
                    },
                    {
                      label: "Violation chunks",
                      value: report.statistics.violationChunks,
                    },
                    {
                      label: "Compliant chunks",
                      value: report.statistics.compliantChunks,
                    },
                    {
                      label: "Needs review",
                      value: report.statistics.needsReviewChunks,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {([
                    { label: "Critical", value: report.violations.critical },
                    { label: "High", value: report.violations.high },
                    { label: "Medium", value: report.violations.medium },
                    { label: "Low", value: report.violations.low },
                  ] as const).map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-100 bg-white px-4 py-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {item.label} violations
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recommendations
                  </h3>
                  <div className="mt-3 space-y-3">
                    {report.recommendations.slice(0, 4).map((rec) => (
                      <div
                        key={rec.id}
                        className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-emerald-800">
                          {rec.action}
                        </p>
                        <p className="mt-1 text-xs text-emerald-700">
                          Priority: {rec.priority} · Effort: {rec.effort}
                        </p>
                      </div>
                    ))}
                    {report.recommendations.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No recommendations returned.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!loading && !report && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-500">
                <p className="text-sm">Submit a document to view the report.</p>
              </div>
            )}
          </section>
        </div>

        {report && (
          <section className="mt-10 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Detailed analysis
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  Chunk-by-chunk breakdown
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Workflow time: {report.timing.workflowTimeMs}ms
              </span>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {report.details.slice(0, 6).map((detail) => (
                <div
                  key={detail.chunkIndex}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Chunk {detail.chunkIndex + 1}</span>
                    <span>{detail.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">
                    {detail.chunkText.substring(0, 160)}...
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      Score: {detail.violationScore}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      Severity: {detail.severity}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      Policies: {detail.retrievedPolicies.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
