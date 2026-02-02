// src/pages/auth/PageLogin.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../data/auth/authApi";
import { authStorage } from "../../data/auth/authStorage";
import "./PageLogin.css";

export const PageLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth(); // ✅ agora usamos de verdade

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const result = await authApi.login({ email, password });

      if (!result?.success || !result.data) {
        setError(result?.message || "Erro ao fazer login");
        return;
      }

      const { user, token } = result.data;

      // ✅ só ADMIN entra no painel
      if (!user || user.role !== "admin" || !token) {
        authStorage.clear();
        setError("Acesso restrito: apenas administradores.");
        return;
      }

      // ✅ salva + atualiza estado do React (e storage dentro do setSession)
      setSession(user, token);

      // ✅ navega
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Evolvers Admin</h1>
          <p>Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};
