import Link from "next/link";

export default function CreatePage() {
  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Create post</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Creator workflow</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-500">
          The dashboard routes creators through a clear content pipeline while keeping actions contextual and simple.
        </p>
      </div>
      <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800">
        Back to dashboard
      </Link>
    </div>
  );
}
