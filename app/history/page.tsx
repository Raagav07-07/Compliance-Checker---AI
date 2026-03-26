"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  id: string;
  score: number;
  status: string;
  summary: string;
  category: string;
  documentName: string;
  violations: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  chunksAnalyzed: number;
  analyzedAt: string;
};

type HistoryStats = {
  totalAnalyses: number;
  averageScore: number;
  statusBreakdown: {
    compliant: number;
    atRisk: number;
    nonCompliant: number;
  };
  categoryBreakdown: {
    IT: number;
    RETAIL: number;
    CUSTOM: number;
  };
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/compliance/history?limit=15");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load history");
      }
      setHistory(data.history || []);
      setStats(data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen px-6 pb-16 pt-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              History
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Compliance activity
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Track recent analyses and overall compliance trends.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Refresh
          </button>
        </div>

        {loading && <p className="mt-6 text-sm text-slate-500">Loading history...</p>}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        {stats && (
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Total analyses
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {stats.totalAnalyses}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Average score
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {stats.averageScore}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Status mix
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {stats.statusBreakdown.compliant} compliant · {stats.statusBreakdown.atRisk} at risk · {stats.statusBreakdown.nonCompliant} non-compliant
              </p>
            </div>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recent checks</h2>
          <div className="mt-4 space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.documentName || "Untitled document"}
                    </p>
                    <p className="text-xs text-slate-500">{item.id}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                    Score: {item.score}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                    Category: {item.category}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                    Chunks: {item.chunksAnalyzed}
                  </span>
                </div>
              </div>
            ))}
            {!loading && history.length === 0 && (
              <p className="text-sm text-slate-500">No history available yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
