"use client";

import { useState } from "react";
import Link from "next/link";
import { GuestOnly } from "@/components/Protected";
import { Shell } from "@/components/Shell";
import { useAuth } from "@/components/providers";

export default function RegisterPage() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("Javi");
  const [lastName, setLastName] = useState("Demo");
  const [email, setEmail] = useState(`demo@example.com`);
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <GuestOnly>
      <Shell
        title="Register"
        subtitle="After register, backend should set the same cookies as login."
      >
        <div className="card">
          <div className="grid grid2">
            <div>
              <label className="label">First name</label>
              <input
                className="input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Last name</label>
              <input
                className="input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ height: 10 }} />

          <label className="label">Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div style={{ height: 10 }} />

          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ height: 14 }} />
          {error ? <div className="err">{error}</div> : null}

          <div
            className="row"
            style={{ justifyContent: "space-between", marginTop: 10 }}
          >
            <Link className="btn" href="/auth/login">
              I already have an account
            </Link>
            <button
              className="btn btnPrimary"
              disabled={busy}
              onClick={async () => {
                setError(null);
                setBusy(true);
                try {
                  await register({ firstName, lastName, email, password });
                } catch (e: any) {
                  setError(e?.response?.data?.message ?? "Register failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Creating…" : "Register"}
            </button>
          </div>
        </div>
      </Shell>
    </GuestOnly>
  );
}
