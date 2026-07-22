"use client";

import Link from "next/link";
import { BarChart3, Compass, LayoutDashboard, Lock, PlusCircle, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/src/context/AuthContext";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "Create Post", icon: PlusCircle },
  { href: "/campaigns", label: "Campaigns", icon: Compass },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/strategy", label: "Strategy", icon: Sparkles },
  { href: "/privacy", label: "Privacy & Compliance", icon: ShieldCheck },
];

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    CONTENT_CREATOR: "bg-violet-100 text-violet-700",
    CONTENT_APPROVER: "bg-amber-100 text-amber-700",
    ADMIN: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${styles[role]}`}>
      {role.replace("CONTENT_", "").replace("_", " ")}
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { currentUser, users, switchUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-slate-900/80 p-6 lg:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">MergeBoost</p>
              <p className="text-sm text-slate-400">Content command center</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-violet-400" />
              <p className="text-sm font-medium">RBAC enabled</p>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Each role sees the actions appropriate to their workflow.
            </p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-white/10 bg-slate-900/80 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Workflow overview</p>
                <h1 className="text-2xl font-semibold text-white">MergeBoost • Social Content Command Center</h1>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  Active role
                  <RoleBadge role={currentUser.role} />
                </div>

                <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                  <span className="text-slate-400">Switch</span>
                  <select
                    className="bg-transparent outline-none"
                    value={currentUser.email}
                    onChange={(event) => switchUser(event.target.value)}
                  >
                    {users.map((user) => (
                      <option key={user.email} value={user.email} className="bg-slate-900 text-white">
                        {user.email}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
