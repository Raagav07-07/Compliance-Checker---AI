import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Compliance Checker",
  description: "Upload and analyze policy documents"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {/* Animated AI background */}
        <div
          className="
            fixed inset-0 -z-10
            bg-gradient-to-br
            from-indigo-500/20 via-sky-500/20 to-purple-500/20
            bg-[length:400%_400%]
            animate-[aiGradient_15s_ease_infinite]
          "
        />

        {children}
      </body>
    </html>
  );
}
