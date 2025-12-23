'use client';

import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ProductEntity } from './models';

export type CartItem = {
  product: ProductEntity;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

type Action =
  | { type: 'ADD'; product: ProductEntity; quantity?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'SET_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; state: CartState };

const CART_KEY = 'demo_cart_v1';

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'ADD': {
      const qty = action.quantity ?? 1;
      const idx = state.items.findIndex(i => i.product.id === action.product.id);
      if (idx === -1) return { items: [...state.items, { product: action.product, quantity: qty }] };
      const items = state.items.slice();
      items[idx] = { ...items[idx], quantity: items[idx].quantity + qty };
      return { items };
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.product.id !== action.productId) };
    case 'SET_QTY': {
      const q = Math.max(1, Math.floor(action.quantity || 1));
      return { items: state.items.map(i => i.product.id === action.productId ? { ...i, quantity: q } : i) };
    }
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

const CartCtx = createContext<{
  items: CartItem[];
  total: number;
  currency: string;
  add: (p: ProductEntity, quantity?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, quantity: number) => void;
  clear: () => void;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartState;
      if (parsed?.items) dispatch({ type: 'HYDRATE', state: parsed });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const total = useMemo(() => state.items.reduce((sum, i) => sum + i.quantity * i.product.price, 0), [state.items]);
  const currency = state.items[0]?.product.currency ?? 'usd';

  const value = useMemo(() => ({
    items: state.items,
    total,
    currency,
    add: (p: ProductEntity, quantity?: number) => dispatch({ type: 'ADD', product: p, quantity }),
    remove: (productId: string) => dispatch({ type: 'REMOVE', productId }),
    setQty: (productId: string, quantity: number) => dispatch({ type: 'SET_QTY', productId, quantity }),
    clear: () => dispatch({ type: 'CLEAR' }),
  }), [state.items, total, currency]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
