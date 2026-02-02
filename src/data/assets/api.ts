// src/data/assets/api.ts

import type { Asset, AssetPayload } from "../../domain/assets/model";
import { http } from "../../services/http/index";
import { authStorage } from "../auth/authStorage";
import { appConfig } from "../../config/app.config";

type ApiEnvelope<T> = { success: boolean; data: T; error?: string };

const API_BASE_URL = appConfig.api.baseUrl;
const API_ORIGIN = appConfig.api.serverUrl;

const authHeaders = (): HeadersInit => {
  const token = authStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseResponseBody = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }
  return response.text().catch(() => "");
};

const toAbsoluteUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) return url;
  const prefix = url.startsWith("/") ? "" : "/";
  return `${API_ORIGIN}${prefix}${url}`;
};

export const assetApi = {
  /**
   * Cria um novo asset
   */
  async create(payload: AssetPayload): Promise<Asset> {
    console.log("📤 assetApi.create - Payload:", JSON.stringify(payload, null, 2));
    const res = await http.post<ApiEnvelope<Asset>>("/assets", payload);
    console.log("✅ assetApi.create - Resposta:", res.data);
    return res.data;
  },

  /**
   * Atualiza um asset existente
   */
  async update(id: number, payload: Partial<AssetPayload>): Promise<Asset> {
    console.log("📤 assetApi.update - ID:", id);
    console.log("📤 assetApi.update - Payload:", JSON.stringify(payload, null, 2));
    const res = await http.put<ApiEnvelope<Asset>>(`/assets/${id}`, payload);
    console.log("✅ assetApi.update - Resposta:", res.data);
    return res.data;
  },

  /**
   * Deleta um asset
   */
  async delete(id: number): Promise<void> {
    console.log("🗑️ assetApi.delete - ID:", id);
    await http.delete<ApiEnvelope<null>>(`/assets/${id}`);
    console.log("✅ assetApi.delete - Sucesso");
  },

  /**
   * Lista todos os assets
   */
  async list(): Promise<Asset[]> {
    console.log("📥 assetApi.list - Buscando assets...");
    const res = await http.get<ApiEnvelope<Asset[]>>("/assets");
    console.log("✅ assetApi.list -", res.data.length ?? 0, "assets encontrados");
    return res.data;
  },

  /**
   * Busca um asset por ID
   */
  async getById(id: number): Promise<Asset> {
    console.log("📥 assetApi.getById - ID:", id);
    const res = await http.get<ApiEnvelope<Asset>>(`/assets/${id}`);
    console.log("✅ assetApi.getById - Asset encontrado:", res.data?.title);
    return res.data;
  },

  /**
   * Upload de imagem principal do asset
   */
  async uploadAssetImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    console.log("📤 uploadAssetImage - Arquivo:", file.name, file.size);

    const response = await fetch(`${API_BASE_URL}/uploads/assets`, {
      method: "POST",
      body: formData,
      headers: authHeaders(),
    });

    if (!response.ok) {
      const errorBody: any = await parseResponseBody(response);
      const errorMessage =
        typeof errorBody === "object" && errorBody && "message" in errorBody
          ? String((errorBody as any).message)
          : typeof errorBody === "string" && errorBody
          ? errorBody
          : "Erro no upload da imagem";
      throw new Error(errorMessage);
    }

    const data = await parseResponseBody(response);
    console.log("✅ uploadAssetImage - Resposta:", data);

    const rawUrl = data?.data?.url ?? data?.url;
    if (!rawUrl) throw new Error("Resposta do servidor não contém 'url'");
    return toAbsoluteUrl(rawUrl);
  },

  /**
   * Upload de mídia do carrossel (imagem única)
   */
  async uploadAssetCarouselMedia(file: File): Promise<{ url: string; thumbnail_url?: string }> {
    console.log("📤 uploadAssetCarouselMedia - Arquivo:", file.name, file.size);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/uploads/asset-carousel-single`, {
      method: "POST",
      body: formData,
      headers: authHeaders(),
    });

    if (!response.ok) {
      const errorBody = await parseResponseBody(response);
      console.error("❌ Erro HTTP:", errorBody);
      const errorMessage = typeof errorBody === "string" && errorBody ? errorBody : `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await parseResponseBody(response);
    console.log("✅ uploadAssetCarouselMedia - Sucesso:", data);

    const raw = data?.data || data;

    if (!raw?.url) {
      throw new Error("Resposta do servidor não contém 'url'");
    }

    return {
      url: toAbsoluteUrl(raw.url),
      thumbnail_url: toAbsoluteUrl(raw.thumbnail_url || raw.url),
    };
  },

  /**
   * Upload múltiplo de mídias do carrossel
   */
  async uploadMultipleCarouselMedia(files: File[]): Promise<Array<{ url: string; thumbnail_url: string }>> {
    console.log("📤 uploadMultipleCarouselMedia -", files.length, "arquivos");

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${API_BASE_URL}/uploads/asset-carousel-multiple`, {
      method: "POST",
      body: formData,
      headers: authHeaders(),
    });

    if (!response.ok) {
      const errorBody = await parseResponseBody(response);
      console.error("❌ Erro HTTP:", errorBody);
      const errorMessage = typeof errorBody === "string" && errorBody ? errorBody : `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await parseResponseBody(response);
    console.log("✅ uploadMultipleCarouselMedia - Sucesso:", data);

    const uploads = data?.data || [];

    return uploads.map((item: any) => ({
      url: toAbsoluteUrl(item.url),
      thumbnail_url: toAbsoluteUrl(item.thumbnail_url || item.url),
    }));
  },

  /**
   * Upload de arquivo do asset (FBX, OBJ, etc.)
   */
  async uploadAssetFile(file: File): Promise<{ file_path: string; file_size_mb: number }> {
    console.log("📤 uploadAssetFile - Arquivo:", file.name, file.size);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/uploads/asset-files`, {
      method: "POST",
      body: formData,
      headers: authHeaders(),
    });

    if (!response.ok) {
      const errorBody = await parseResponseBody(response);
      console.error("❌ Erro HTTP:", errorBody);
      const errorMessage = typeof errorBody === "string" && errorBody ? errorBody : `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await parseResponseBody(response);
    console.log("✅ uploadAssetFile - Sucesso:", data);

    const raw = data?.data || data;

    return {
      file_path: raw.url ? toAbsoluteUrl(raw.url) : raw.file_path,
      file_size_mb: raw.file_size_mb || (file.size / (1024 * 1024)),
    };
  },
};

export { assetApi as api };
