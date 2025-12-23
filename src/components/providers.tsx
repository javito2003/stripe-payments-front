'use client';

import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '@/lib/auth';

const AuthCtx = createContext<ReturnType<typeof useAuthHook> | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthHook();
  return <AuthCtx.Provider value={auth}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
