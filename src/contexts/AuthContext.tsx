// src/contexts/AuthContext.tsx
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authStorage } from "../data/auth/authStorage";
import { appConfig } from "../config/app.config";
import type { User } from "../domain/auth";

// Tempo de inatividade para logout automático (30 minutos)
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: User, token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authStorage.getUser());
  const [token, setToken] = useState<string | null>(() => authStorage.getToken());
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
    setToken(null);
  }, []);

  // Timer de inatividade — só ativo quando autenticado
  useEffect(() => {
    if (!token) return;

    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        console.log('Sessão expirada por inatividade');
        logout();
        window.location.href = "/login";
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ["mousedown", "keydown", "mousemove", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer(); // inicia o timer

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [token, logout]);

  // Validar token ao carregar a aplicação
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = authStorage.getToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${appConfig.api.baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          console.log('Token inválido, fazendo logout...');
          authStorage.clear();
          setUser(null);
          setToken(null);
        } else {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            authStorage.setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Erro ao validar token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const setSession = (nextUser: User, nextToken: string) => {
    authStorage.setUser(nextUser);
    authStorage.setToken(nextToken);
    setUser(nextUser);
    setToken(nextToken);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      setSession,
      logout,
    }),
    [user, token, isLoading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
