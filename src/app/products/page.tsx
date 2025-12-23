'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Shell } from '@/components/Shell';
import { Protected } from '@/components/Protected';
import { api } from '@/lib/api';
import type { ProductEntity } from '@/lib/models';
import { useCart } from '@/lib/cart';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<ProductEntity[]>('/products');
        if (!cancelled) setProducts(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message ?? 'Failed to load products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <Protected>
      <Shell title="Products" subtitle="Fetched via axios GET /products (cookies sent automatically).">
        <div className="card">
          {loading ? <p className="muted">Loading…</p> : null}
          {error ? <p className="err">{error}</p> : null}

          <div className="grid grid3">
            {products.map(p => (
              <div key={p.id} className="card">
                <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {/* Works if imageUrl is absolute and allowed by next config; otherwise it will show a placeholder */}
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display:'grid', placeItems:'center' }} className="muted">no image</div>
                  )}
                </div>

                <div style={{ height: 10 }} />
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{p.name}</strong>
                  <span className="badge">{p.currency.toUpperCase()} {p.price.toFixed(2)}</span>
                </div>
                <p className="muted" style={{ marginBottom: 12 }}>{p.description}</p>

                <button className="btn btnPrimary" onClick={() => add(p, 1)}>
                  Add to cart
                </button>
              </div>
            ))}
          </div>

          {!loading && !error && products.length === 0 ? (
            <p className="muted">No products yet. Seed your backend or adjust the endpoint.</p>
          ) : null}
        </div>
      </Shell>
    </Protected>
  );
}
