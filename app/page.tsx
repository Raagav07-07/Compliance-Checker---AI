import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          AI Compliance Checker
        </h1>

        <p className="text-slate-600 mb-8">
          Upload policy documents and analyze compliance using AI-powered
          document intelligence.
        </p>

        <Link
          href="/api/upload"
          className="
            inline-flex items-center justify-center
            px-6 py-3
            rounded-xl
            bg-blue-600 text-white
            font-medium
            hover:bg-blue-700
            transition
          "
        >
          Upload Document
        </Link>
      </div>
    </main>
  );
}
