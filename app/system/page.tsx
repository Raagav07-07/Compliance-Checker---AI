"use client";

import { useState } from "react";

type ActionResult = {
  title: string;
  response: string;
  status: "success" | "error";
};

export default function SystemPage() {
  const [results, setResults] = useState<ActionResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runAction = async (title: string, request: () => Promise<Response>) => {
    setLoading(true);
    try {
      const res = await request();
      const data = await res.json();
      setResults((prev) => [
        {
          title,
          response: JSON.stringify(data, null, 2),
          status: res.ok ? "success" : "error",
        },
        ...prev,
      ]);
    } catch (err) {
      setResults((prev) => [
        {
          title,
          response: err instanceof Error ? err.message : "Request failed",
          status: "error",
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 pb-16 pt-10">
      <div className="mx-auto w-full max-w-5xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            System tools
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Environment & health checks
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Initialize the database, validate connectivity, and smoke test the
            API surface.
          </p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <button
            onClick={() => runAction("Init DB", () => fetch("/api/init-db"))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
            disabled={loading}
          >
            Initialize database
          </button>
          <button
            onClick={() => runAction("Test DB", () => fetch("/api/test-db"))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
            disabled={loading}
          >
            Test MongoDB
          </button>
          <button
            onClick={() => runAction("Compliance Check", () => fetch("/api/compliance/check"))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
            disabled={loading}
          >
            Compliance endpoint info
          </button>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Latest responses</h2>
          <div className="mt-4 space-y-4">
            {results.map((result, index) => (
              <div
                key={`${result.title}-${index}`}
                className={`rounded-2xl border px-4 py-3 text-xs ${
                  result.status === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-600"
                }`}
              >
                <p className="text-sm font-semibold">{result.title}</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {result.response}
                </pre>
              </div>
            ))}
            {results.length === 0 && (
              <p className="text-sm text-slate-500">No actions run yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
