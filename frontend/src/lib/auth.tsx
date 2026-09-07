import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthUser, AppRole, JobRole } from '@/lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
  saveProfile: (profile: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const SESSION_KEY = 'statcompetency_auth';

export function defaultJobRoleFor(appRole: AppRole): JobRole {
  return appRole === 'admin' ? 'ISS Officer' : 'SSO';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Timeout controller
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          
          const baseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1';
          const res = await fetch(`${baseUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (res.ok) {
            const data = await res.json();
            setUser({
              name: data.full_name || data.email,
              email: data.email,
              appRole: data.role.toLowerCase() as AppRole,
              jobRole: data.designation as JobRole || 'SSO',
              department: data.department || 'MoSPI'
            });
          } else {
            localStorage.removeItem('token');
          }
        } catch (e) {
          console.error('Auth fetch failed or timed out:', e);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = useCallback((u: AuthUser) => {
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => prev ? { ...prev, ...patch } : prev);
  }, []);

  const saveProfile = useCallback(async (profile: any) => {
    // Mock save profile
    console.log('Saved profile', profile);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
