// src/config/app.config.ts
// Configuracao centralizada - todas as URLs e valores configuraveis

export const appConfig = {
  // ========== API ==========
  api: {
    // VITE_API_URL pode vir como "https://dominio" ou "https://dominio/api" (com ou sem barra no final)
    // Aqui normalizamos para:
    // - baseUrl: sempre termina com "/api"
    // - serverUrl: origem sem "/api" (usado para uploads estáticos)
    baseUrl: (() => {
      const raw = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
      const trimmed = raw.replace(/\/+$/, "");
      return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
    })(),
    serverUrl: (() => {
      const raw = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
      const trimmed = raw.replace(/\/+$/, "");
      const withApi = trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
      return withApi.replace(/\/api$/, "");
    })(),
  },

  // ========== SITE ==========
  site: {
    name: import.meta.env.VITE_SITE_NAME || 'Evolvers Admin',
    url: import.meta.env.VITE_SITE_URL || 'http://localhost:5174',
  },

  // ========== RECAPTCHA ==========
  recaptcha: {
    siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
  },

  // ========== UPLOADS ==========
  uploads: {
    maxSize: parseInt(import.meta.env.VITE_UPLOADS_MAX_SIZE || '10485760', 10), // 10MB
  },
};

// Helper para construir URL de upload
export function getUploadUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const serverUrl = appConfig.api.serverUrl;
  return `${serverUrl}/uploads/${path}`.replace(/\/+/g, '/').replace(':/', '://');
}

// Helper para construir URL da API
export function getApiUrl(endpoint: string): string {
  const baseUrl = appConfig.api.baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

export default appConfig;
