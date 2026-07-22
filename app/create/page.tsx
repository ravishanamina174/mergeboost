import Link from "next/link";

export default function CreatePage() {
  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-violet-400">Create post</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Creator workflow placeholder</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          The dashboard now routes creators through the content pipeline and exposes the approval actions for each role.
        </p>
      </div>
      <Link href="/" className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900">
        Back to dashboard
      </Link>
    </div>
  );
}
