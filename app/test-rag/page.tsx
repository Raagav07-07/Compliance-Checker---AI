"use client";

import { useState } from "react";

export default function RagTestPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!query.trim()) return;

    setLoading(true);
    setResponse("");
    const formData = new FormData();
    formData.append("query", query);

    const resp = await fetch("/api/test-rag", {
      method: "POST",
      body: formData,
    });

    const data = await resp.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  }

  return (
    <main className="min-h-screen px-6 pb-16 pt-10">
      <div className="mx-auto w-full max-w-4xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Retrieval test
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            RAG policy lookup
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Validate semantic retrieval against indexed policies.
          </p>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Query
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. password rotation policy"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || loading}
            className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              query.trim() && !loading
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            {loading ? "Running..." : "Run retrieval"}
          </button>

          {response && (
            <pre className="mt-4 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              {response}
            </pre>
          )}
        </section>
      </div>
    </main>
  );
}
