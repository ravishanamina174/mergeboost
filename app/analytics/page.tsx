import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-violet-400">Analytics</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Performance insights, reach, and engagement</h2>
      </div>
      <Link href="/" className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900">
        Return home
      </Link>
    </div>
  );
}
