"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiRequest } from "../../lib/api";
import { formatDate, formatNumber } from "../../lib/format";
import type { InventoryItem, InventorySummary } from "../../lib/types";
import { useSession } from "../../components/useSession";
import { Badge, Input, MetricCard, Notice, Panel, StatusPill } from "../../components/ui";

type ItemForm = {
  sku: string;
  name: string;
  category: string;
  location: string;
  supplier: string;
  quantity: string;
  reorderLevel: string;
  notes: string;
};

type AdjustForm = {
  delta: string;
  reason: string;
};

const emptyItemForm: ItemForm = {
  sku: "",
  name: "",
  category: "",
  location: "",
  supplier: "",
  quantity: "0",
  reorderLevel: "0",
  notes: "",
};

const emptyAdjustForm: AdjustForm = {
  delta: "1",
  reason: "Inventory adjustment",
};

export default function InventoryPage() {
  const { token, user, loading: sessionLoading } = useSession();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItemForm);
  const [adjustForm, setAdjustForm] = useState<AdjustForm>(emptyAdjustForm);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = user?.roles.includes("ADMIN") ?? false;
  const canEditItems = user?.roles.some((role) => role === "ADMIN" || role === "MANAGER") ?? false;
  const canAdjustStock = Boolean(user?.roles.length);

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    Promise.all([
      apiRequest<InventoryItem[]>("/api/inventory", {}, token),
      apiRequest<InventorySummary>("/api/inventory/summary", {}, token),
    ])
      .then(([items, summaryResponse]) => {
        setInventory(items);
        setSummary(summaryResponse);
      })
      .catch((caughtError) => {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load inventory");
      })
      .finally(() => setLoading(false));
  }, [token]);

  function resetForms() {
    setItemForm(emptyItemForm);
    setAdjustForm(emptyAdjustForm);
    setEditingItemId(null);
    setAdjustTarget(null);
  }

  async function refresh() {
    if (!token) {
      return;
    }

    const [items, summaryResponse] = await Promise.all([
      apiRequest<InventoryItem[]>("/api/inventory", {}, token),
      apiRequest<InventorySummary>("/api/inventory/summary", {}, token),
    ]);
    setInventory(items);
    setSummary(summaryResponse);
  }

  async function handleItemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const quantity = Number(itemForm.quantity);
    const reorderLevel = Number(itemForm.reorderLevel);

    if (Number.isNaN(quantity) || Number.isNaN(reorderLevel)) {
      setError("Quantity and reorder level must be valid numbers");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        sku: itemForm.sku.trim(),
        name: itemForm.name.trim(),
        category: itemForm.category.trim(),
        location: itemForm.location.trim(),
        supplier: itemForm.supplier.trim(),
        quantity,
        reorderLevel,
        notes: itemForm.notes.trim(),
      };

      if (editingItemId) {
        await apiRequest(`/api/inventory/${editingItemId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        }, token);
        setSuccess("Inventory item updated");
      } else {
        await apiRequest("/api/inventory", {
          method: "POST",
          body: JSON.stringify(payload),
        }, token);
        setSuccess("Inventory item created");
      }

      resetForms();
      await refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save item");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item: InventoryItem) {
    setEditingItemId(item.id);
    setItemForm({
      sku: item.sku,
      name: item.name,
      category: item.category,
      location: item.location ?? "",
      supplier: item.supplier ?? "",
      quantity: String(item.quantity),
      reorderLevel: String(item.reorderLevel),
      notes: item.notes ?? "",
    });
    setAdjustTarget(null);
    setSuccess(null);
    setError(null);
  }

  function startAdjust(item: InventoryItem) {
    setAdjustTarget(item);
    setAdjustForm(emptyAdjustForm);
    setSuccess(null);
    setError(null);
  }

  async function handleAdjustSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !adjustTarget) {
      return;
    }

    const delta = Number(adjustForm.delta);
    if (Number.isNaN(delta)) {
      setError("Adjustment amount must be a number");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest(`/api/inventory/${adjustTarget.id}/adjust`, {
        method: "PATCH",
        body: JSON.stringify({
          delta,
          reason: adjustForm.reason,
        }),
      }, token);

      setSuccess(`Adjusted ${adjustTarget.name}`);
      setAdjustTarget(null);
      setAdjustForm(emptyAdjustForm);
      await refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to adjust stock");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(itemId: number) {
    if (!token || !window.confirm("Delete this inventory item?")) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest(`/api/inventory/${itemId}`, { method: "DELETE" }, token);
      setSuccess("Inventory item deleted");
      await refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to delete item");
    } finally {
      setSaving(false);
    }
  }

  if (sessionLoading || loading) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-8 py-6 text-sm text-slate-300 shadow-2xl shadow-slate-950/50 backdrop-blur">
          Loading inventory...
        </div>
      </main>
    );
  }

  if (!token || !user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total items" value={summary ? formatNumber(summary.totalItems) : "0"} note="Tracked inventory records" />
        <MetricCard label="Low stock" value={summary ? formatNumber(summary.lowStockItems) : "0"} note="Needs replenishment" />
        <MetricCard label="Out of stock" value={summary ? formatNumber(summary.outOfStockItems) : "0"} note="Zero quantity items" />
        <MetricCard label="Units on hand" value={summary ? formatNumber(summary.totalUnits) : "0"} note="Current inventory quantity" />
      </div>

      {error ? <Notice tone="rose" message={error} /> : null}
      {success ? <Notice tone="emerald" message={success} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="space-y-6">
          <Panel title={editingItemId ? "Edit inventory item" : "Add inventory item"} subtitle="Admins and managers can create or edit items. Delete is admin-only.">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleItemSubmit}>
              <Input label="SKU" value={itemForm.sku} onChange={(value) => setItemForm((current) => ({ ...current, sku: value }))} placeholder="SKU-2001" />
              <Input label="Name" value={itemForm.name} onChange={(value) => setItemForm((current) => ({ ...current, name: value }))} placeholder="Packing tape" />
              <Input label="Category" value={itemForm.category} onChange={(value) => setItemForm((current) => ({ ...current, category: value }))} placeholder="Packaging" />
              <Input label="Location" value={itemForm.location} onChange={(value) => setItemForm((current) => ({ ...current, location: value }))} placeholder="Shelf C4" />
              <Input label="Supplier" value={itemForm.supplier} onChange={(value) => setItemForm((current) => ({ ...current, supplier: value }))} placeholder="Global Supply Co." />
              <Input label="Quantity" value={itemForm.quantity} onChange={(value) => setItemForm((current) => ({ ...current, quantity: value }))} type="number" min="0" />
              <Input label="Reorder level" value={itemForm.reorderLevel} onChange={(value) => setItemForm((current) => ({ ...current, reorderLevel: value }))} type="number" min="0" />
              <label className="md:col-span-2 block space-y-2">
                <span className="text-sm text-slate-300">Notes</span>
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
                  value={itemForm.notes}
                  onChange={(event) => setItemForm((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Handling instructions, inspection notes, or storage details"
                />
              </label>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <button
                  className="rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving || !canEditItems}
                  type="submit"
                >
                  {editingItemId ? "Update item" : "Create item"}
                </button>
                <button
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
                  onClick={() => {
                    resetForms();
                    setError(null);
                    setSuccess(null);
                  }}
                  type="button"
                >
                  Clear form
                </button>
              </div>
            </form>
          </Panel>

          <Panel title="Inventory ledger" subtitle="Current stock levels and operational status.">
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/35">
                  {inventory.length ? (
                    inventory.map((item) => (
                      <tr key={item.id} className="align-top hover:bg-white/[0.03]">
                        <td className="px-4 py-4">
                          <div className="font-medium text-white">{item.name}</div>
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.sku}</div>
                          <div className="mt-2 text-xs text-slate-400">{item.category}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-300">{item.location ?? "Unassigned"}</td>
                        <td className="px-4 py-4 text-slate-200">{formatNumber(item.quantity)}</td>
                        <td className="px-4 py-4"><StatusPill status={item.status} /></td>
                        <td className="px-4 py-4 text-slate-400">{formatDate(item.updatedAt)}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10" onClick={() => startAdjust(item)} type="button" disabled={!canAdjustStock}>
                              Adjust
                            </button>
                            <button className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-300/20" onClick={() => startEdit(item)} type="button" disabled={!canEditItems}>
                              Edit
                            </button>
                            {isAdmin ? (
                              <button className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/20" onClick={() => handleDelete(item.id)} type="button" disabled={saving}>
                                Delete
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-10 text-center text-slate-400" colSpan={6}>
                        No inventory items yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </section>

        <aside className="space-y-6">
          <Panel title="Adjust stock" subtitle="Any authenticated role can adjust quantities.">
            {adjustTarget ? (
              <form className="space-y-4" onSubmit={handleAdjustSubmit}>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Target item</p>
                  <p className="mt-2 text-base font-medium text-white">{adjustTarget.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{adjustTarget.sku} · current {adjustTarget.quantity}</p>
                </div>
                <Input label="Delta" value={adjustForm.delta} onChange={(value) => setAdjustForm((current) => ({ ...current, delta: value }))} type="number" placeholder="1" />
                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Reason</span>
                  <textarea
                    className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
                    value={adjustForm.reason}
                    onChange={(event) => setAdjustForm((current) => ({ ...current, reason: event.target.value }))}
                  />
                </label>
                <button className="w-full rounded-2xl bg-gradient-to-r from-sky-300 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving} type="submit">
                  Apply adjustment
                </button>
              </form>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-6 text-sm text-slate-400">
                Choose an inventory item to open the adjustment form.
              </p>
            )}
          </Panel>

          <Panel title="Role access" subtitle="Current user session details.">
            <div className="space-y-3 text-sm text-slate-300">
              <p><span className="text-slate-500">User:</span> {user.username}</p>
              <p><span className="text-slate-500">Roles:</span> {user.roles.join(", ")}</p>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge key={role} tone="slate">{role}</Badge>
                ))}
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
