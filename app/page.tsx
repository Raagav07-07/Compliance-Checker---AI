import Link from "next/link";

const quickLinks = [
  {
    title: "Upload Policies",
    description: "Add PDF/DOCX policies and prepare the vector store.",
    href: "/api/upload",
  },
  {
    title: "Compliance Check",
    description: "Run the full Mastra workflow on a document.",
    href: "/compliance",
  },
  {
    title: "Policy Library",
    description: "Review, index, and deactivate existing policies.",
    href: "/policies",
  },
  {
    title: "Reports",
    description: "Browse compliance reports and drill into details.",
    href: "/reports",
  },
  {
    title: "History",
    description: "Inspect analysis history with live stats.",
    href: "/history",
  },
  {
    title: "System Tools",
    description: "Initialize DB, test connections, and validate RAG.",
    href: "/system",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 pb-16 pt-12">
      <section className="mx-auto w-full max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
              SaaS-ready compliance intelligence
            </span>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              AI Compliance Checker
            </h1>
            <p className="max-w-xl text-base text-slate-600">
              Upload policy documents, index them in the vector store, and run
              multi-agent compliance checks with executive summaries,
              recommendations, and full audit trails.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/compliance"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/70 transition hover:bg-emerald-700"
              >
                Run compliance check
              </Link>
              <Link
                href="/api/upload"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
              >
                Upload policies
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "6 AI Agents",
                  value: "Classifier, chunker, retriever, scorer, recommender, aggregator",
                },
                {
                  title: "Scores + Evidence",
                  value: "Severity-weighted scoring with traceable violations",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-slate-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Live workflow
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Compliance Pipeline
                </h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Online
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {[
                "Upload policies",
                "Index with Chroma",
                "Run compliance analysis",
                "Review executive report",
                "Export findings",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Quick access
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Product surfaces for every endpoint
              </h3>
            </div>
            <span className="hidden text-sm text-slate-500 md:inline">
              Built for audit-ready workflows
            </span>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="group rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
              >
                <h4 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
                  {link.title}
                </h4>
                <p className="mt-2 text-sm text-slate-600">{link.description}</p>
                <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Open
                </span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
