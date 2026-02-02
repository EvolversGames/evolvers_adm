// src/data/courses/api.ts
import type { CoursePayload, CourseResponse } from "../../domain/courses/model";
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


export const api = {


  
  async create(payload: CoursePayload): Promise<CourseResponse> {
    const res = await http.post<ApiEnvelope<CourseResponse>>("/courses", payload);
    return res.data;
  },

  async update(id: number, payload: Partial<CoursePayload>): Promise<CourseResponse> {
  console.log("📤 courseApi.update - ID:", id);
  console.log("📤 courseApi.update - PAYLOAD completo:");
  console.log(JSON.stringify(payload, null, 2));
  console.log("📤 Campos específicos:");
  console.log("  - instructor_ids:", payload.instructor_ids);
  console.log("  - modules:", payload.modules?.length ?? "undefined");
  console.log("  - requirements:", payload.requirements?.length ?? "undefined");
  console.log("  - objectives:", payload.objectives?.length ?? "undefined");
  console.log("  - target_audience:", payload.target_audience?.length ?? "undefined");


  const res = await http.put<ApiEnvelope<CourseResponse>>(`/courses/${id}`, payload);
  
  console.log("✅ courseApi.update - Resposta do servidor:", res.data);
  
  return res.data;
},

  async delete(id: number): Promise<void> {
    await http.delete<ApiEnvelope<null>>(`/courses/${id}`);
  },

  async list(): Promise<any[]> {
    const res = await http.get<ApiEnvelope<any[]>>("/courses");
    return res.data;
  },

  async getById(id: number): Promise<any> {
    const res = await http.get<ApiEnvelope<any>>(`/courses/${id}`);
    return res.data;
  },

  async uploadCourseImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    console.log('📤 Enviando:', file.name, file.size);

    const response = await fetch(`${API_BASE_URL}/uploads/courses`, {
      method: 'POST',
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
          : "Erro no upload";
      throw new Error(errorMessage);
    }

    const data = await parseResponseBody(response);
    console.log('✅ Resposta:', data);

    const rawUrl = data?.data?.url ?? data?.url;
    if (!rawUrl) throw new Error("Resposta do servidor não contém 'url'");
    return toAbsoluteUrl(rawUrl);
  },

   async uploadCourseCarouselMedia(file: File): Promise<{ url: string; thumbnail_url?: string }> {
    console.log("📤 uploadCourseCarouselMedia - arquivo:", file.name, file.size);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/uploads/course-carousel-single`, {
        method: "POST",
        body: formData,
        headers: authHeaders(),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorBody = await parseResponseBody(response);
        console.error("❌ Erro HTTP:", errorBody);
        const errorMessage = typeof errorBody === "string" && errorBody ? errorBody : `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await parseResponseBody(response);
      console.log("✅ Upload bem-sucedido:", data);

      const raw = data?.data || data;

      if (!raw?.url) {
        console.error("❌ Resposta inválida:", data);
        throw new Error("Resposta do servidor não contém 'url'");
      }

      return {
        url: toAbsoluteUrl(raw.url),
        thumbnail_url: toAbsoluteUrl(raw.thumbnail_url || raw.url),
      };

    } catch (error: any) {
      console.error("❌ Erro no upload:", error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }
  },

  /**
   * Upload MÚLTIPLO de mídias do carrossel (várias imagens de uma vez)
   */
  async uploadMultipleCarouselMedia(files: File[]): Promise<Array<{ url: string; thumbnail_url: string }>> {
    console.log("📤 uploadMultipleCarouselMedia -", files.length, "arquivos");

    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file); // ⚠️ "files" (plural)
    });

    try {
      const response = await fetch(`${API_BASE_URL}/uploads/course-carousel-multiple`, {
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
      console.log("✅ Upload múltiplo bem-sucedido:", data);

      const uploads = data?.data || [];

      return uploads.map((item: any) => ({
        url: toAbsoluteUrl(item.url),
        thumbnail_url: toAbsoluteUrl(item.thumbnail_url || item.url),
      }));

    } catch (error: any) {
      console.error("❌ Erro no upload múltiplo:", error);
      throw new Error(`Erro ao fazer upload múltiplo: ${error.message}`);
    }
  },


};

