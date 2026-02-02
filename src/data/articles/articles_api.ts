// src/data/articles/api.ts
import type { ArticlePayload, ArticleResponse } from "../../domain/articles/articles_model";
import { http } from "../../services/http/index";
import { authStorage } from "../auth/authStorage";
import { appConfig } from "../../config/app.config";

type ApiEnvelope<T> = { success: boolean; data: T; error?: string };

const API_BASE_URL: string = appConfig.api.baseUrl;
const FILES_BASE_URL: string = appConfig.api.serverUrl;

const authHeaders = (): HeadersInit => {
  const token = authStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Converte o retorno da API (geralmente "/uploads/...") em URL completa,
 * sem "chumbar" localhost.
 */
function toPublicFileUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url; // já veio absoluto
  return `${FILES_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function parseUploadError(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return data?.message || data?.error || "Erro no upload";
    }
    const text = await response.text().catch(() => "");
    return text || "Erro no upload";
  } catch {
    const text = await response.text().catch(() => "");
    return text || "Erro no upload";
  }
}

async function parseUploadSuccess(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }
  return response.text().catch(() => "");
}

async function extractUploadUrl(response: Response): Promise<string> {
  const data = await parseUploadSuccess(response);
  const rawUrl = data?.data?.url ?? data?.url;
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("Resposta do servidor não contém 'url'");
  }
  return toPublicFileUrl(rawUrl);
}

export const api = {
  async create(payload: ArticlePayload): Promise<ArticleResponse> {
    try {
      console.group('📝 [API] CREATE ARTICLE');
      console.log('➡️ Endpoint:', '/articles');
      console.log('📦 Payload enviado:', payload);

      const res = await http.post<ApiEnvelope<ArticleResponse>>(
        '/articles',
        payload
      );

      console.log('✅ Status:');
      console.log('📨 Response completa:', res);
      console.log('📨 Response.data:', res.data);
      console.groupEnd();

      return res.data;

    } catch (error: any) {
      console.group('❌ [API] CREATE ARTICLE ERROR');

      if (error.response) {
        // Erro vindo do backend
        console.error('🚨 Status:', error.response.status);
        console.error('🚨 Data:', error.response.data);
        console.error('🚨 Headers:', error.response.headers);
      } else if (error.request) {
        // Request saiu, mas não teve resposta
        console.error('📡 Request enviado, sem resposta:', error.request);
      } else {
        // Erro antes de enviar
        console.error('⚠️ Erro ao configurar request:', error.message);
      }

      console.error('🧠 Error object:', error);
      console.groupEnd();

      throw error;
    }
  },



  async update(id: number, payload: Partial<ArticlePayload>): Promise<ArticleResponse> {
    console.log("📤 articleApi.update - ID:", id);
    console.log("📤 articleApi.update - PAYLOAD completo:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("📤 Campos específicos:");
    console.log("  - instructor_id:", payload.instructor_id);
    console.log("  - article_category_id:", payload.article_category_id);
    console.log("  - sections:", payload.sections?.length ?? "undefined");
    console.log("  - tag_ids:", payload.tag_ids);
    console.log("  - related_article_ids:", payload.related_article_ids);

    const res = await http.put<ApiEnvelope<ArticleResponse>>(`/articles/${id}`, payload);

    console.log("✅ articleApi.update - Resposta do servidor:", res.data);

    return res.data;
  },

  async delete(id: number): Promise<void> {
    await http.delete<ApiEnvelope<null>>(`/articles/${id}`);
  },

  async list(): Promise<any[]> {
    const res = await http.get<ApiEnvelope<any>>("/articles?limit=1000");
    // A API retorna { articles: [], total, categories, tags }
    return res.data.articles || [];
  },

  async getById(id: number): Promise<any> {
    const res = await http.get<ApiEnvelope<any>>(`/articles/${id}`);
    return res.data;
  },

  async uploadArticleImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    console.log('📤 Enviando:', file.name, file.size);

    const response = await fetch(`${API_BASE_URL}/uploads/articles`, {
      method: 'POST',
      body: formData,
      headers: authHeaders(),
    });

    if (!response.ok) {
      const error = await parseUploadError(response);
      throw new Error(error);
    }

    const url = await extractUploadUrl(response);
    console.log('✅ Resposta:', url);
    return url;
  },

  async uploadSectionImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    console.log('📤 Enviando imagem de seção:', file.name, file.size);

    const response = await fetch(`${API_BASE_URL}/uploads/article-sections`, {
      method: 'POST',
      body: formData,
      headers: authHeaders(),
    });

    if (!response.ok) {
      const error = await parseUploadError(response);
      throw new Error(error);
    }

    const url = await extractUploadUrl(response);
    console.log('✅ Resposta:', url);
    return url;
  },
};
