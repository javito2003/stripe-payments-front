"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export function Navbar() {
  const { state, logout } = useAuth();
  const { items } = useCart();

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="nav">
      <div className="navLeft">
        <Link className="btn btnPrimary" href="/products">
          Products
        </Link>
        <Link className="btn" href="/cart">
          Cart <span className="badge">{count}</span>
        </Link>
        <Link className="btn" href="/checkout">
          Checkout
        </Link>
        <Link className="btn" href="/orders">
          Orders
        </Link>
        <span className="badge">cookies auth + refresh</span>
      </div>

      <div className="row">
        {state.status === "authed" ? (
          <>
            <span className="badge">{state.user.email}</span>
            <button className="btn btnDanger" onClick={logout}>
              Logout
            </button>
          </>
        ) : state.status === "guest" ? (
          <>
            <Link className="btn" href="/auth/login">
              Login
            </Link>
            <Link className="btn" href="/auth/register">
              Register
            </Link>
          </>
        ) : (
          <span className="badge">Loading...</span>
        )}
      </div>
    </div>
  );
}
