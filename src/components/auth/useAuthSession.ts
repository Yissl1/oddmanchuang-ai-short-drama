import { useCallback, useEffect, useState } from 'react';

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
  role?: string;
  status?: string;
};

export interface AuthSessionContextValue {
  user: AuthUser | null;
  checking: boolean;
  refresh: () => Promise<void>;
}

export const AUTH_SESSION_CHANGED_EVENT = 'oddmanchuang-auth-session-changed';

async function readCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    if (!response.ok) return null;
    const payload = await response.json() as { user?: AuthUser | null };
    return payload.user ?? null;
  } catch {
    return null;
  }
}

export function useAuthSession(): AuthSessionContextValue {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    setChecking(true);
    setUser(await readCurrentUser());
    setChecking(false);
  }, []);

  useEffect(() => {
    void refresh();
    const handleChange = () => void refresh();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleChange);
  }, [refresh]);

  return { user, checking, refresh };
}

export async function logoutAuthSession(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } finally {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
}
