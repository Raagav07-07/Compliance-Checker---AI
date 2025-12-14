"use client";

import { useState } from "react";

type Domain = "IT" | "RETAIL" | "CUSTOM" | "";

export default function UploadPage() {
  const [domain, setDomain] = useState<Domain>("");
  const [file, setFile] = useState<File | null>(null);

  const [policyName, setPolicyName] = useState("");
  const [region, setRegion] = useState("");
  const [customDomain, setCustomDomain] = useState("");

  const canSubmit =
    domain &&
    file &&
    ((domain === "IT" && policyName) ||
      (domain === "RETAIL" && region) ||
      (domain === "CUSTOM" && customDomain));

  return (
    <div
      className="
        min-h-screen flex items-center justify-center relative overflow-hidden
        bg-gradient-to-br from-slate-500/20 via-teal-500/20 to-indigo-500/20
        bg-[length:400%_400%]
        animate-[aiGradient_18s_ease_infinite]
      "
    >
      {/* Subtle AI glow */}
      <div
        className="
          absolute inset-0 -z-10 blur-3xl opacity-25
          bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400
        "
      />

      {/* Glass Card */}
      <div
        className="
          w-[600px] max-w-[92%]
          rounded-2xl bg-indigo-50/90
          border border-indigo-200
          shadow-2xl p-8
        "
      >
        <h1 className="text-2xl text-center font-semibold text-slate-800 mb-6">
          Upload Document
        </h1>

        {/* Domain Selector */}
        <div className="mb-6">
          <div className="flex justify-between gap-3">
            {["IT", "RETAIL", "CUSTOM"].map((d) => (
              <button
                key={d}
                onClick={() => setDomain(d as Domain)}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition
                  ${
                    domain === d
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white/70 text-slate-700 border-slate-300 hover:bg-white"
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        {domain && (
          <div className="mb-6">
            <label
              className="
                flex flex-col items-center justify-center
                border-2 border-dashed border-indigo-300
                rounded-xl p-8 text-slate-600
                cursor-pointer bg-white/50
                hover:bg-indigo-100/50 transition
              "
            >
              <span className="text-lg mb-1">📄 Upload PDF</span>
              <span className="text-xs text-slate-500">
                Click to select PDF / DOCX
              </span>
              <input
                type="file"
                accept=".pdf,.docx"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            {file && (
              <p className="mt-2 text-sm text-slate-600 truncate">
                {file.name}
              </p>
            )}
          </div>
        )}

        {/* Domain Inputs */}
        {domain === "IT" && (
          <input
            className="
              w-full mb-4 px-3 py-2
              bg-white/60 border border-indigo-200
              rounded-lg text-sm text-slate-700
              focus:outline-none focus:ring-2 focus:ring-teal-500
            "
            placeholder="Policy Name"
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
          />
        )}

        {domain === "RETAIL" && (
          <input
            className="
              w-full mb-4 px-3 py-2
              bg-white/60 border border-indigo-200
              rounded-lg text-sm text-slate-700
              focus:outline-none focus:ring-2 focus:ring-teal-500
            "
            placeholder="Region (e.g. India)"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        )}

        {domain === "CUSTOM" && (
          <input
            className="
              w-full mb-4 px-3 py-2
              bg-white/60 border border-indigo-200
              rounded-lg text-sm text-slate-700
              focus:outline-none focus:ring-2 focus:ring-teal-500
            "
            placeholder="Domain Name"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
          />
        )}

        {/* Submit */}
        <button
          disabled={!canSubmit}
          onClick={() => {
            console.log({ domain, file, policyName, region, customDomain });
            alert("Ready for backend!");
          }}
          className={`w-full py-3 rounded-xl text-sm font-medium transition
            ${
              canSubmit
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "bg-teal-500 text-white cursor-not-allowed"
            }`}
        >
          Upload Document
        </button>
      </div>
    </div>
  );
}
