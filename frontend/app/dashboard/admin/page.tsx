"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiRequest } from "../../lib/api";
import type { Role, SessionUser } from "../../lib/types";
import { ROLE_OPTIONS } from "../../lib/types";
import { useSession } from "../../components/useSession";
import { Badge, Input, Notice, Panel } from "../../components/ui";

type UserForm = {
  username: string;
  password: string;
  fullName: string;
  roles: Role[];
};

const emptyUserForm: UserForm = {
  username: "",
  password: "",
  fullName: "",
  roles: ["STAFF"],
};

export default function AdminPage() {
  const { token, user, loading: sessionLoading } = useSession();
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [userForm, setUserForm] = useState<UserForm>(emptyUserForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = user?.roles.includes("ADMIN") ?? false;

  useEffect(() => {
    if (!token || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    apiRequest<SessionUser[]>("/api/users", {}, token)
      .then((response) => setUsers(response))
      .catch((caughtError) => {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load users");
      })
      .finally(() => setLoading(false));
  }, [token, isAdmin]);

  async function handleUserSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest("/api/users", {
        method: "POST",
        body: JSON.stringify({
          username: userForm.username.trim(),
          password: userForm.password,
          fullName: userForm.fullName.trim(),
          roles: userForm.roles,
        }),
      }, token);

      setSuccess("User created");
      setUserForm(emptyUserForm);
      const response = await apiRequest<SessionUser[]>("/api/users", {}, token);
      setUsers(response);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create user");
    } finally {
      setSaving(false);
    }
  }

  function toggleRole(role: Role) {
    setUserForm((current) => {
      const nextRoles = current.roles.includes(role)
        ? current.roles.filter((currentRole) => currentRole !== role)
        : [...current.roles, role];

      return {
        ...current,
        roles: nextRoles.length ? nextRoles : current.roles,
      };
    });
  }

  if (sessionLoading || loading) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-8 py-6 text-sm text-slate-300 shadow-2xl shadow-slate-950/50 backdrop-blur">
          Loading admin data...
        </div>
      </main>
    );
  }

  if (!token || !user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <Panel title="Admin access" subtitle="You do not have permission to view this page.">
        <p className="text-sm text-slate-400">Request admin access to manage users.</p>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <Notice tone="rose" message={error} /> : null}
      {success ? <Notice tone="emerald" message={success} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Create user" subtitle="Administrator access only.">
          <form className="space-y-4" onSubmit={handleUserSubmit}>
            <Input label="Username" value={userForm.username} onChange={(value) => setUserForm((current) => ({ ...current, username: value }))} placeholder="new.user" />
            <Input label="Full name" value={userForm.fullName} onChange={(value) => setUserForm((current) => ({ ...current, fullName: value }))} placeholder="New User" />
            <Input label="Password" value={userForm.password} onChange={(value) => setUserForm((current) => ({ ...current, password: value }))} type="password" placeholder="Choose a secure password" />
            <div className="space-y-2">
              <span className="text-sm text-slate-300">Roles</span>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role}
                    className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${userForm.roles.includes(role) ? "border-amber-300/30 bg-amber-300/15 text-amber-100" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
                    onClick={() => toggleRole(role)}
                    type="button"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full rounded-2xl bg-gradient-to-r from-emerald-300 to-lime-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving} type="submit">
              Create user
            </button>
          </form>
        </Panel>

        <Panel title="Team roster" subtitle="Managed users and assigned roles.">
          <div className="space-y-3">
            {users.length ? (
              users.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{entry.fullName}</p>
                      <p className="text-sm text-slate-400">{entry.username}</p>
                    </div>
                    <Badge tone={entry.enabled ? "emerald" : "rose"}>{entry.enabled ? "Active" : "Disabled"}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.roles.map((role) => (
                      <Badge key={role} tone="slate">{role}</Badge>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No team data loaded yet.</p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
