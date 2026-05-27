"use client";

import { useEffect, useState } from "react";

import { apiRequest } from "../lib/api";
import { clearStoredToken, getStoredToken } from "../lib/session";
import type { SessionUser } from "../lib/types";

export function useSession() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setLoading(false);
      return;
    }

    setToken(stored);
    apiRequest<SessionUser>("/api/auth/me", {}, stored)
      .then((profile) => setUser(profile))
      .catch(() => {
        clearStoredToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signOut = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  return {
    token,
    user,
    loading,
    signOut,
  };
}
