'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';

export function Protected({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status === 'guest') router.replace('/auth/login');
  }, [state.status, router]);

  if (state.status === 'loading') return <div className="card">Loading...</div>;
  if (state.status !== 'authed') return null;
  return <>{children}</>;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status === 'authed') router.replace('/products');
  }, [state.status, router]);

  if (state.status === 'loading') return <div className="card">Loading...</div>;
  if (state.status !== 'guest') return null;
  return <>{children}</>;
}
