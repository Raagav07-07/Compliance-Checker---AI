"use client";

import { useState } from "react";

type Domain = "IT" | "RETAIL" | "CUSTOM" | "";

export default function UploadPage() {
  const [domain, setDomain] = useState<Domain>("");
  const [file, setFile] = useState<File | null>(null);
  const [policyName, setPolicyName] = useState("");
  const [region, setRegion] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!file || !domain) return;

    setIsSubmitting(true);
    setStatus("");

    const formdata = new FormData();
    formdata.append("file", file);
    formdata.append("name", policyName || region || customDomain);

    if (domain === "IT") {
      formdata.append("Category", "IT");
    } else if (domain === "RETAIL") {
      formdata.append("Category", "RETAIL");
    } else if (domain === "CUSTOM") {
      formdata.append("Category", "CUSTOM");
    }

    const res = await fetch("/api/policy", {
      method: "POST",
      body: formdata,
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error || "Upload failed");
    } else {
      setStatus("Policy uploaded successfully.");
      setFile(null);
      setPolicyName("");
      setRegion("");
      setCustomDomain("");
    }

    setIsSubmitting(false);
  };

  const canSubmit =
    domain &&
    file &&
    ((domain === "IT" && policyName) ||
      (domain === "RETAIL" && region) ||
      (domain === "CUSTOM" && customDomain));

  return (
    <main className="min-h-screen px-6 pb-16 pt-10">
      <div className="mx-auto w-full max-w-4xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Policy upload
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Upload policy documents
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Add policies, label the domain, and prepare them for indexing.
          </p>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Select domain</h2>
              <p className="mt-2 text-sm text-slate-600">
                Choose the policy category for accurate retrieval and scoring.
              </p>
              <div className="mt-4 space-y-2">
                {["IT", "RETAIL", "CUSTOM"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDomain(d as Domain)}
                    className={`w-full rounded-xl border px-4 py-2 text-left text-sm font-semibold transition ${
                      domain === d
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Policy file
                </label>
                <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-10 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50">
                  <span className="text-sm font-semibold text-slate-700">
                    Drop PDF/DOCX or click to upload
                  </span>
                  <span className="mt-2 text-xs text-slate-500">
                    Max 10MB · PDF or DOCX
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    hidden
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                {file && (
                  <p className="mt-2 text-xs text-slate-500">{file.name}</p>
                )}
              </div>

              {domain === "IT" && (
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Policy name"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                />
              )}

              {domain === "RETAIL" && (
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Region (e.g., India)"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              )}

              {domain === "CUSTOM" && (
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Custom domain name"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                />
              )}

              {status && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    status.includes("failed") || status.includes("Upload failed")
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {status}
                </div>
              )}

              <button
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  canSubmit && !isSubmitting
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                }`}
              >
                {isSubmitting ? "Uploading..." : "Upload policy"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
