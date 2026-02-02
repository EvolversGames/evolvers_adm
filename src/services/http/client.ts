export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpClientOptions = {
  baseUrl?: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
};

export class HttpError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export function createHttpClient(options: HttpClientOptions = {}) {
  const baseUrl = options.baseUrl ?? "";

  async function request<T>(method: HttpMethod, url: string, data?: unknown): Promise<T> {
    const token = options.getToken?.();

    // ✅ DEBUG (request)
    const fullUrl = baseUrl + url;
    console.log("➡️ HTTP REQUEST");
    console.log("METHOD:", method);
    console.log("URL:", fullUrl);
    console.log("HAS TOKEN:", !!token);
    console.log("BODY RAW:", data);
    try {
      console.log("BODY JSON:", data ? JSON.stringify(data, null, 2) : undefined);
    } catch {
      console.log("BODY JSON: (não serializável)");
    }

    const fetchInit: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    };

    // Avoid 304/ETag caching issues in admin screens where data must be fresh.
    if (method === "GET") fetchInit.cache = "no-store";

    const res = await fetch(fullUrl, fetchInit);

    const contentType = res.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    // ✅ DEBUG (response)
    console.log("⬅️ HTTP RESPONSE");
    console.log("STATUS:", res.status);
    console.log("URL:", fullUrl);
    console.log("BODY:", body);

    if (!res.ok) {
      // Token expirado ou inválido — dispara logout automático
      if (res.status === 401 && options.onUnauthorized) {
        options.onUnauthorized();
      }

      const message =
        typeof body === "object" && body && "message" in (body as any)
          ? String((body as any).message)
          : `HTTP ${res.status}`;
      throw new HttpError(res.status, message, body);
    }

    return body as T;
  }

  return {
    get: <T>(url: string) => request<T>("GET", url),
    post: <T>(url: string, data?: unknown) => request<T>("POST", url, data),
    put: <T>(url: string, data?: unknown) => request<T>("PUT", url, data),
    patch: <T>(url: string, data?: unknown) => request<T>("PATCH", url, data),
    delete: <T>(url: string) => request<T>("DELETE", url),
  };
}
