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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200/80 bg-white p-6 lg:flex">
<div className="mb-8">
  <span className="text-3xl font-medium text-black sm:text-2xl">
    MergeBoost
  </span>
</div>

          <nav className="space-y-1">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* <div className="mt-auto rounded-[1.5rem] border border-slate-200/70 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-500" />
              <p className="text-sm font-medium text-slate-700">RBAC enabled</p>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Each role sees the actions appropriate to their workflow.
            </p>
          </div> */}
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Workflow overview</p>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Social Content Command Center
                </h1>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  Active role
                  <RoleBadge role={currentUser.role} />
                </div>

                <label className="flex items-center gap-2 rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  <span className="text-slate-400">Switch</span>
                  <select
                    className="bg-transparent pr-1 text-slate-700 outline-none"
                    value={currentUser.email}
                    onChange={(event) => switchUser(event.target.value)}
                  >
                    {users.map((user) => (
                      <option key={user.email} value={user.email} className="bg-white text-slate-900">
                        {user.email}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
