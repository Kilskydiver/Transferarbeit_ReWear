import { useSQLiteContext } from 'expo-sqlite';
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as SellerModel from '@/models/SellerModel';
import type { Seller } from '@/models/types';

interface AuthState {
  seller: Seller | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    SellerModel.restoreSession(db)
      .then(setSeller)
      .catch(() => setSeller(null))
      .finally(() => setIsReady(true));
  }, [db]);

  const login = useCallback(
    async (email: string, password: string) => {
      setSeller(await SellerModel.login(db, email, password));
    },
    [db]
  );

  const logout = useCallback(async () => {
    await SellerModel.logout();
    setSeller(null);
  }, []);

  const value = useMemo(() => ({ seller, isReady, login, logout }), [seller, isReady, login, logout]);
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthState {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth muss innerhalb von <AuthProvider> verwendet werden.');
  return context;
}
