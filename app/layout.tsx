import type { Metadata } from "next";
import { AppShell } from "@/src/components/layout/AppShell";
import { AuthProvider } from "@/src/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MergeBoost | Content Command Center",
  description: "RBAC-driven social content workflow for MergeBoost campaigns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
