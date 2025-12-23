"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { Protected } from "@/components/Protected";
import { api } from "@/lib/api";
import type { OrderEntity, OrderStatus } from "@/lib/models";

const statusColors: Record<OrderStatus, string> = {
  PENDING: "#f59e0b",
  PAID: "#10b981",
  FAILED: "#ef4444",
  CANCELLED: "#6b7280",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<OrderEntity[]>("/orders");
        if (!cancelled) setOrders(data);
      } catch (e: any) {
        if (!cancelled)
          setError(e?.response?.data?.message ?? "Failed to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Protected>
      <Shell
        title="Orders"
        subtitle="Your order history fetched via GET /orders."
      >
        <div className="card">
          {loading ? <p className="muted">Loading…</p> : null}
          {error ? <p className="err">{error}</p> : null}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {orders.map((order) => (
              <div key={order.id} className="card" style={{ padding: 16 }}>
                <div
                  className="row"
                  style={{ justifyContent: "space-between", marginBottom: 12 }}
                >
                  <div>
                    <strong>Order #{order.id.slice(0, 8)}</strong>
                    <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: statusColors[order.status],
                        color: "white",
                      }}
                    >
                      {order.status}
                    </span>
                    <p style={{ margin: "4px 0 0", fontWeight: 600 }}>
                      {order.currency.toUpperCase()}{" "}
                      {order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 12,
                  }}
                >
                  <p
                    className="muted"
                    style={{ margin: "0 0 8px", fontSize: 12 }}
                  >
                    Items:
                  </p>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="row"
                      style={{
                        justifyContent: "space-between",
                        padding: "4px 0",
                      }}
                    >
                      <span>
                        {item.productName}{" "}
                        <span className="muted">×{item.quantity}</span>
                      </span>
                      <span>
                        {order.currency.toUpperCase()}{" "}
                        {(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.paidAt && (
                  <p
                    className="muted"
                    style={{ margin: "12px 0 0", fontSize: 12 }}
                  >
                    Paid on {formatDate(order.paidAt)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!loading && !error && orders.length === 0 ? (
            <p className="muted">
              No orders yet. Complete a checkout to see your orders here.
            </p>
          ) : null}
        </div>
      </Shell>
    </Protected>
  );
}
