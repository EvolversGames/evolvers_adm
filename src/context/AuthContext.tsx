// src/contexts/AuthContext.tsx
import { createContext, useEffect, useState } from "react";
import { authStorage } from "../data/auth/authStorage";

export type AuthContextType = {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (user: any, token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = authStorage.getUser();
    const storedToken = authStorage.getToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const setSession = (user: any, token: string) => {
    authStorage.setUser(user);
    authStorage.setToken(token);
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
