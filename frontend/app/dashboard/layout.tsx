"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Badge } from "../components/ui";
import { useSession } from "../components/useSession";

const navItems = [
  { href: "/dashboard/food", label: "Food ordering" },
  { href: "/dashboard/inventory", label: "Inventory" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, loading, signOut } = useSession();

  useEffect(() => {
    if (!loading && (!token || !user)) {
      router.replace("/login");
    }
  }, [loading, token, user, router]);

  if (loading || !token || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-8 py-6 text-sm text-slate-300 shadow-2xl shadow-slate-950/50 backdrop-blur">
          Checking session...
        </div>
      </main>
    );
  }

  const links = user.roles.includes("ADMIN")
    ? [...navItems, { href: "/dashboard/admin", label: "Admin" }]
    : navItems;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1524_58%,#111827_100%)] px-4 py-6 text-slate-100 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-white/10 bg-slate-900/80 px-6 py-5 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">CRT Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Welcome, {user.fullName}</h1>
              <p className="mt-2 text-sm text-slate-400">{user.roles.join(", ")} access</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="sky">Signed in</Badge>
              <button
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                onClick={() => {
                  signOut();
                  router.replace("/login");
                }}
                type="button"
              >
                Log out
              </button>
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-2 text-sm transition ${pathname === item.href ? "bg-white/10 text-white" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
