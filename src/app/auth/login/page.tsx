'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GuestOnly } from '@/components/Protected';
import { Shell } from '@/components/Shell';
import { useAuth } from '@/components/providers';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <GuestOnly>
      <Shell title="Login" subtitle="Access + refresh tokens are httpOnly cookies. Axios uses withCredentials.">
        <div className="card">
          <label className="label">Email</label>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} />

          <div style={{ height: 10 }} />

          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />

          <div style={{ height: 14 }} />

          {error ? <div className="err">{error}</div> : null}

          <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <Link className="btn" href="/auth/register">Create account</Link>
            <button
              className="btn btnPrimary"
              disabled={busy}
              onClick={async () => {
                setError(null);
                setBusy(true);
                try {
                  await login(email, password);
                } catch (e: any) {
                  setError(e?.response?.data?.message ?? 'Login failed');
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? 'Signing in…' : 'Login'}
            </button>
          </div>

          <div className="sep" />
          <p className="muted" style={{ margin: 0 }}>
            Tip: if you hit 401 on any request, the axios interceptor calls <code>/auth/refresh</code> once and retries.
          </p>
        </div>
      </Shell>
    </GuestOnly>
  );
}
