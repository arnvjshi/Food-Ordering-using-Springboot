"use client";

import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
      <div className="mb-5 space-y-2">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle ? <p className="text-sm leading-6 text-slate-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{note}</p>
    </div>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
        min={min}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

export function Badge({
  tone,
  children,
}: {
  tone: "emerald" | "amber" | "rose" | "slate" | "sky";
  children: ReactNode;
}) {
  const styles = {
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-300/20 bg-amber-500/10 text-amber-100",
    rose: "border-rose-400/20 bg-rose-500/10 text-rose-100",
    slate: "border-white/10 bg-white/5 text-slate-300",
    sky: "border-sky-300/20 bg-sky-500/10 text-sky-100",
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${styles[tone]}`}>{children}</span>;
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "IN_STOCK"
      ? "emerald"
      : status === "LOW_STOCK"
        ? "amber"
        : "rose";

  return <Badge tone={tone}>{status.replaceAll("_", " ")}</Badge>;
}

export function Notice({ tone, message }: { tone: "emerald" | "rose"; message: string }) {
  const styles =
    tone === "emerald"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
      : "border-rose-400/20 bg-rose-500/10 text-rose-100";

  return <div className={`rounded-3xl border px-5 py-4 text-sm ${styles}`}>{message}</div>;
}
