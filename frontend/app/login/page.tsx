"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "../lib/api";
import { getStoredToken, storeToken } from "../lib/session";
import type { AuthResponse } from "../lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin123!");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      router.replace("/dashboard/food");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      storeToken(response.token);
      router.replace("/dashboard/food");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Login failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(180deg,#07111f_0%,#0d1726_52%,#111827_100%)] px-6 py-10 text-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-amber-200/80">
            CRT Delivery Desk
          </div>
          <div className="space-y-5">
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight tracking-tight text-white md:text-7xl">
              Zomato-style ordering with RBAC powered by Spring Boot.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Sign in to browse restaurants, place orders, and manage inventory. JWT-backed roles unlock admin, manager, and staff workflows.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Starter credentials</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Credential label="Admin" value="admin / Admin123!" />
              <Credential label="Manager" value="manager / Manager123!" />
              <Credential label="Staff" value="staff / Staff123!" />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur">
          <div className="mb-6 space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">Secure sign-in</p>
            <h2 className="text-2xl font-semibold text-white">Open the dashboard</h2>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Username</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Password</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Admin123!"
              />
            </label>
            <button
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              {saving ? "Signing in..." : "Sign in"}
            </button>
          </form>
          {error ? <p className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
        </section>
      </div>
    </main>
  );
}

function Credential({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-200">{value}</p>
    </div>
  );
}
