"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiRequest } from "../../lib/api";
import { formatDate, formatMoney } from "../../lib/format";
import type { FoodOrder, MenuItem, Restaurant } from "../../lib/types";
import { useSession } from "../../components/useSession";
import { Badge, Input, Notice, Panel } from "../../components/ui";

type OrderForm = {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
};

type CartItem = {
  menuItem: MenuItem;
  quantity: number;
};

const emptyOrderForm: OrderForm = {
  customerName: "",
  customerPhone: "",
  deliveryAddress: "",
};

export default function FoodOrderingPage() {
  const { token, user, loading: sessionLoading } = useSession();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [orderForm, setOrderForm] = useState<OrderForm>(emptyOrderForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    Promise.all([
      apiRequest<Restaurant[]>("/api/restaurants", {}, token),
      apiRequest<FoodOrder[]>("/api/orders", {}, token),
    ])
      .then(([restaurantResponse, orderResponse]) => {
        setRestaurants(restaurantResponse);
        setOrders(orderResponse);
        if (!selectedRestaurantId && restaurantResponse.length) {
          setSelectedRestaurantId(restaurantResponse[0].id);
        }
      })
      .catch((caughtError) => {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load restaurants");
      })
      .finally(() => setLoading(false));
  }, [token, selectedRestaurantId]);

  useEffect(() => {
    if (!token || !selectedRestaurantId) {
      return;
    }

    apiRequest<MenuItem[]>(`/api/restaurants/${selectedRestaurantId}/menu`, {}, token)
      .then((items) => setMenuItems(items))
      .catch(() => setMenuItems([]));
  }, [selectedRestaurantId, token]);

  function resetFoodFlow() {
    setCart([]);
    setOrderForm(emptyOrderForm);
  }

  function selectRestaurant(restaurantId: number) {
    setSelectedRestaurantId(restaurantId);
    resetFoodFlow();
  }

  function addToCart(item: MenuItem) {
    setCart((current) => {
      const existing = current.find((entry) => entry.menuItem.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.menuItem.id === item.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }

      return [...current, { menuItem: item, quantity: 1 }];
    });
  }

  function updateCartQuantity(menuItemId: number, quantity: number) {
    setCart((current) =>
      current
        .map((entry) =>
          entry.menuItem.id === menuItemId ? { ...entry, quantity } : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  }

  function removeFromCart(menuItemId: number) {
    setCart((current) => current.filter((entry) => entry.menuItem.id !== menuItemId));
  }

  function cartTotal() {
    return cart.reduce((total, entry) => total + entry.menuItem.price * entry.quantity, 0);
  }

  async function refreshOrders() {
    if (!token) {
      return;
    }

    const orderResponse = await apiRequest<FoodOrder[]>("/api/orders", {}, token);
    setOrders(orderResponse);
  }

  async function handlePlaceOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedRestaurantId) {
      return;
    }

    if (!cart.length) {
      setError("Add at least one menu item to place an order");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest<FoodOrder>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          restaurantId: selectedRestaurantId,
          customerName: orderForm.customerName,
          customerPhone: orderForm.customerPhone,
          deliveryAddress: orderForm.deliveryAddress,
          items: cart.map((entry) => ({
            menuItemId: entry.menuItem.id,
            quantity: entry.quantity,
          })),
        }),
      }, token);

      setSuccess("Order placed successfully");
      resetFoodFlow();
      await refreshOrders();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to place order");
    } finally {
      setSaving(false);
    }
  }

  if (sessionLoading || loading) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-8 py-6 text-sm text-slate-300 shadow-2xl shadow-slate-950/50 backdrop-blur">
          Loading restaurants...
        </div>
      </main>
    );
  }

  if (!token || !user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <Notice tone="rose" message={error} /> : null}
      {success ? <Notice tone="emerald" message={success} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="space-y-6">
          <Panel title="Restaurants" subtitle="Browse curated kitchens and select a menu.">
            <div className="grid gap-4 md:grid-cols-2">
              {restaurants.length ? (
                restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    className={`rounded-3xl border p-4 text-left transition ${selectedRestaurantId === restaurant.id ? "border-amber-300/40 bg-amber-300/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                    onClick={() => selectRestaurant(restaurant.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-white">{restaurant.name}</p>
                        <p className="text-sm text-slate-400">{restaurant.cuisine}</p>
                      </div>
                      <Badge tone="amber">{restaurant.rating.toFixed(1)}</Badge>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{restaurant.location}</p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-400">No restaurants are available yet.</p>
              )}
            </div>
          </Panel>

          <Panel title="Menu" subtitle="Select dishes and build a cart.">
            {menuItems.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-white">{item.name}</p>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.category}</p>
                        </div>
                        <Badge tone={item.available ? "emerald" : "rose"}>{item.available ? "Available" : "Paused"}</Badge>
                      </div>
                      {item.description ? <p className="mt-3 text-sm text-slate-400">{item.description}</p> : null}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">${formatMoney(item.price)}</p>
                        <p className="text-xs text-slate-500">Prep {item.prepMinutes} min</p>
                      </div>
                      <button
                        className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
                        disabled={!item.available}
                        onClick={() => addToCart(item)}
                        type="button"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Choose a restaurant to view its menu.</p>
            )}
          </Panel>
        </section>

        <aside className="space-y-6">
          <Panel title="Cart" subtitle="Review your order before checkout.">
            {cart.length ? (
              <div className="space-y-4">
                {cart.map((entry) => (
                  <div key={entry.menuItem.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{entry.menuItem.name}</p>
                        <p className="text-xs text-slate-400">${formatMoney(entry.menuItem.price)} each</p>
                      </div>
                      <button
                        className="text-xs text-rose-200 hover:text-rose-100"
                        onClick={() => removeFromCart(entry.menuItem.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs"
                          onClick={() => updateCartQuantity(entry.menuItem.id, entry.quantity - 1)}
                          type="button"
                        >
                          -
                        </button>
                        <span className="text-sm text-slate-300">{entry.quantity}</span>
                        <button
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs"
                          onClick={() => updateCartQuantity(entry.menuItem.id, entry.quantity + 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm text-slate-200">
                        ${formatMoney(entry.menuItem.price * entry.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-200">
                  <span>Total</span>
                  <span className="text-lg font-semibold">${formatMoney(cartTotal())}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Your cart is empty.</p>
            )}
          </Panel>

          <Panel title="Checkout" subtitle="Provide delivery details to place an order.">
            <form className="space-y-4" onSubmit={handlePlaceOrder}>
              <Input label="Customer name" value={orderForm.customerName} onChange={(value) => setOrderForm((current) => ({ ...current, customerName: value }))} placeholder="Jordan Smith" />
              <Input label="Phone" value={orderForm.customerPhone} onChange={(value) => setOrderForm((current) => ({ ...current, customerPhone: value }))} placeholder="+1 555 0182" />
              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Delivery address</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
                  value={orderForm.deliveryAddress}
                  onChange={(event) => setOrderForm((current) => ({ ...current, deliveryAddress: event.target.value }))}
                />
              </label>
              <button
                className="w-full rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving || !cart.length}
                type="submit"
              >
                Place order
              </button>
            </form>
          </Panel>

          <Panel title="Order history" subtitle="Recent orders for this account.">
            <div className="space-y-4">
              {orders.length ? (
                orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{order.restaurantName}</p>
                        <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                      </div>
                      <Badge tone="emerald">{order.status}</Badge>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      {order.items.map((item) => `${item.menuItemName} x${item.quantity}`).join(", ")}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-200">
                      <span>Total</span>
                      <span className="font-semibold">${formatMoney(order.totalAmount)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No orders yet.</p>
              )}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
