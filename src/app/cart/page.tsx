'use client';

import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { Protected } from '@/components/Protected';
import { useCart } from '@/lib/cart';

export default function CartPage() {
  const { items, total, currency, remove, setQty, clear } = useCart();

  return (
    <Protected>
      <Shell title="Cart" subtitle="Stored locally (localStorage). Checkout will send items to backend to create an Order/PaymentIntent.">
        <div className="card">
          {items.length === 0 ? (
            <>
              <p className="muted">Your cart is empty.</p>
              <Link className="btn btnPrimary" href="/products">Go shopping</Link>
            </>
          ) : (
            <>
              <div className="grid" style={{ gap: 10 }}>
                {items.map(i => (
                  <div key={i.product.id} className="card">
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <div>
                        <strong>{i.product.name}</strong>
                        <div className="muted">{i.product.currency.toUpperCase()} {i.product.price.toFixed(2)} each</div>
                      </div>

                      <div className="row">
                        <input
                          className="input"
                          style={{ width: 90 }}
                          type="number"
                          min={1}
                          value={i.quantity}
                          onChange={e => setQty(i.product.id, Number(e.target.value))}
                        />
                        <button className="btn" onClick={() => remove(i.product.id)}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sep" />

              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="badge">Total</span>
                <strong>{currency.toUpperCase()} {total.toFixed(2)}</strong>
              </div>

              <div style={{ height: 12 }} />

              <div className="row" style={{ justifyContent: 'space-between' }}>
                <button className="btn btnDanger" onClick={clear}>Clear cart</button>
                <Link className="btn btnPrimary" href="/checkout">Proceed to checkout</Link>
              </div>
            </>
          )}
        </div>
      </Shell>
    </Protected>
  );
}
