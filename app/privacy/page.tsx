import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Privacy & compliance</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Consent and policy controls</h2>
      </div>
      <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800">
        Return home
      </Link>
    </div>
  );
}
