"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { AuthUser } from "./models";

type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authed"; user: AuthUser };

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refreshMe = useCallback(async () => {
    try {
      // Try /auth/me; if access expired, interceptor will attempt refresh once.
      const { data } = await api.get<AuthUser>("/users/me");
      setState({ status: "authed", user: data });
    } catch {
      setState({ status: "guest" });
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      // Backend should set both cookies here
      await api.post("/auth/login", { email, password });
      await refreshMe();
    },
    [refreshMe]
  );

  const register = useCallback(
    async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      await api.post("/auth/register", payload);
      await refreshMe();
    },
    [refreshMe]
  );

  const logout = useCallback(async () => {
    // Backend should clear cookies
    try {
      await api.post("/auth/logout", {});
    } catch {}
    setState({ status: "guest" });
  }, []);

  return useMemo(
    () => ({
      state,
      isLoading: state.status === "loading",
      isAuthed: state.status === "authed",
      user: state.status === "authed" ? state.user : null,
      refreshMe,
      login,
      register,
      logout,
    }),
    [state, refreshMe, login, register, logout]
  );
}
