"use client";

import { useEffect, useState } from "react";

type Policy = {
  _id: string;
  name: string;
  category: string;
  status: string;
  indexed: boolean;
  createdAt: string;
};

export default function PoliciesPage() {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [error, setError] = useState("");

  const fetchPolicies = async () => {
    try {
      const res = await fetch("/api/policy");
      const data = await res.json();
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const deactivatePolicy = async (id: string) => {
    setLoading(true);
    await fetch(`/api/policy/${id}/deactivate`, {
      method: "PATCH",
    });
    await fetchPolicies();
  };

  const indexPolicy = async (id: string) => {
    setLoading(true);
    await fetch(`/api/policy/${id}/index`, {
      method: "POST",
    });
    await fetchPolicies();
  };

  return (
    <main className="min-h-screen px-6 pb-16 pt-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Policy management
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Policies library
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Upload policies, index them for retrieval, and manage lifecycle
              state.
            </p>
          </div>
          <a
            href="/api/upload"
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/70 transition hover:bg-emerald-700"
          >
            Upload new policy
          </a>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
          {loading && <p className="text-sm text-slate-500">Loading policies...</p>}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Indexed</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy) => (
                    <tr key={policy._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {policy.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {policy.category}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            policy.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {policy.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            policy.indexed
                              ? "bg-sky-100 text-sky-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {policy.indexed ? "Indexed" : "Not indexed"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {!policy.indexed && (
                            <button
                              onClick={() => indexPolicy(policy._id)}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              Index
                            </button>
                          )}
                          {policy.status === "ACTIVE" && (
                            <button
                              onClick={() => deactivatePolicy(policy._id)}
                              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
