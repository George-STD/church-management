import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Quick demo credentials for testing all 5 roles seamlessly
export const DEMO_ACCOUNTS: Record<string, { identifier: string; label: string; roleName: string }> = {
  GENERAL_SECRETARY: {
    identifier: '01000000001',
    label: 'أ/ نبيل كامل (أمين عام)',
    roleName: 'امين عام',
  },
  SECTOR_SECRETARY: {
    identifier: '01000000002',
    label: 'م/ سامح يوسف (أمين قطاع)',
    roleName: 'امين قطاع إعدادي',
  },
  STAGE_SECRETARY: {
    identifier: '01000000003',
    label: 'أ/ مينا موريس (أمين الخدمة)',
    roleName: 'امين إعدادي بنين',
  },
  ASSISTANT_SECRETARY: {
    identifier: '01000000004',
    label: 'أ/ بيتر سمير (مساعد أمين)',
    roleName: 'مساعد إعدادي بنين',
  },
  SERVANT: {
    identifier: '01000000005',
    label: 'د/ فادي كمال (خادم)',
    roleName: 'خادم فصل',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const switchDemoRole = async (roleKey: string) => {
    const account = DEMO_ACCOUNTS[roleKey];
    if (account) {
      setLoading(true);
      await login(account.identifier, 'Church@2026!');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchDemoRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
