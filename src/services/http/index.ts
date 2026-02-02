// frontend/src/services/http/index.ts
import { createHttpClient } from "./client";
import { authStorage } from "../../data/auth/authStorage";
import { appConfig } from "../../config/app.config";

// Cliente HTTP com suporte a autenticacao e logout automático
export const http = createHttpClient({
  baseUrl: appConfig.api.baseUrl,
  getToken: () => authStorage.getToken(),
  onUnauthorized: () => {
    authStorage.clear();
    window.location.href = "/login";
  },
});
