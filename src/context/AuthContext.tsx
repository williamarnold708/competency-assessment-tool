import { User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuditorName, onAuthChange } from '../services/auth';

interface AuthState {
  user: User | null;
  auditorName: string;
  initializing: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, auditorName: '', initializing: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [auditorName, setAuditorName] = useState('');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        const name = await getAuditorName(u.uid);
        setAuditorName(name);
      } else {
        setAuditorName('');
      }
      setInitializing(false);
    });
  }, []);

  return <AuthContext.Provider value={{ user, auditorName, initializing }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
