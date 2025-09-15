import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AdminAuthContextType = {
  isAdmin: boolean;
  adminKey: string | null;
  login: (key: string) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const LS_KEY = 'admin:key';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminKey, setAdminKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setAdminKey(saved);
    } catch {
      // ignore
    }
  }, []);

  const login = (key: string) => {
    setAdminKey(key);
    try { localStorage.setItem(LS_KEY, key); } catch { /* ignore */ }
  };

  const logout = () => {
    setAdminKey(null);
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  };

  const value = useMemo<AdminAuthContextType>(() => ({ isAdmin: !!adminKey, adminKey, login, logout }), [adminKey]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

