"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { Shell } from "@/components/Shell";
import { Protected } from "@/components/Protected";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";

type CreateCheckoutResponse = {
  orderId: string;
  clientSecret: string; // from Stripe PaymentIntent
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function CheckoutInner({
  clientSecret,
  orderId,
  onPaid,
}: {
  clientSecret: string;
  orderId: string;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="badge">Order</span>
        <code>{orderId}</code>
      </div>

      <div style={{ height: 12 }} />

      <div className="card">
        <div className="muted" style={{ marginBottom: 8 }}>
          Card details
        </div>
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      <div style={{ height: 14 }} />

      {msg ? (
        <div className={msg.startsWith("✅") ? "success" : "err"}>{msg}</div>
      ) : null}

      <div style={{ height: 10 }} />

      <button
        className="btn btnPrimary"
        disabled={!stripe || !elements || busy}
        onClick={async () => {
          setMsg(null);
          if (!stripe || !elements) return;
          setBusy(true);
          try {
            const card = elements.getElement(CardElement);
            if (!card) throw new Error("Missing CardElement");

            const result = await stripe.confirmCardPayment(clientSecret, {
              payment_method: { card },
            });

            if (result.error) {
              setMsg(`❌ ${result.error.message ?? "Payment failed"}`);
              return;
            }

            if (result.paymentIntent?.status === "succeeded") {
              setMsg("✅ Payment succeeded!");
              onPaid();
            } else {
              setMsg(`❌ Payment status: ${result.paymentIntent?.status}`);
            }
          } catch (e: any) {
            setMsg(`❌ ${e?.message ?? "Payment failed"}`);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Processing…" : "Pay now"}
      </button>

      <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
        This uses Stripe Elements + <code>confirmCardPayment</code>. Your
        backend must create the PaymentIntent and return{" "}
        <code>clientSecret</code>.
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, currency, clear } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stripeKeyOk = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  const orderPayload = useMemo(
    () => ({
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
      currency,
    }),
    [items, currency]
  );

  async function createCheckout() {
    setLoading(true);
    setError(null);
    try {
      // Suggestion for backend endpoint:
      // POST /orders/checkout -> { orderId, clientSecret }
      const { data } = await api.post<CreateCheckoutResponse>(
        "/orders",
        orderPayload
      );
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to create checkout");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Auto-create checkout when arriving with items
    if (items.length > 0 && !clientSecret && !loading) createCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Protected>
      <Shell
        title="Checkout"
        subtitle="Creates an Order + Stripe PaymentIntent, then confirms payment on the client."
      >
        <div className="card">
          {!stripeKeyOk ? (
            <p className="err">
              Missing <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>. Add it in{" "}
              <code>.env.local</code>.
            </p>
          ) : null}

          {items.length === 0 ? (
            <>
              <p className="muted">Cart is empty.</p>
              <Link className="btn btnPrimary" href="/products">
                Go to products
              </Link>
            </>
          ) : (
            <>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="badge">Total</span>
                <strong>
                  {currency.toUpperCase()} {total.toFixed(2)}
                </strong>
              </div>

              <div style={{ height: 12 }} />

              {error ? <p className="err">{error}</p> : null}

              {!clientSecret || !orderId ? (
                <div
                  className="row"
                  style={{ justifyContent: "space-between" }}
                >
                  <button
                    className="btn"
                    onClick={createCheckout}
                    disabled={loading}
                  >
                    {loading ? "Creating…" : "Recreate checkout"}
                  </button>
                  <Link className="btn" href="/cart">
                    Back to cart
                  </Link>
                </div>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutInner
                    clientSecret={clientSecret}
                    orderId={orderId}
                    onPaid={() => {
                      clear();
                    }}
                  />
                </Elements>
              )}
            </>
          )}
        </div>
      </Shell>
    </Protected>
  );
}
