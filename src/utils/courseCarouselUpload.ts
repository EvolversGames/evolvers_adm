import { appConfig } from "../config/app.config";

type MediaType = "image" | "video";

type InputItem = {
  id?: string; // opcional, mas ajuda
  type: MediaType;
  title: string;
  url: string;
  thumbnail_url?: string;
  duration?: string | null;

  file?: File;        // imagem
  thumbFile?: File;   // thumb do vídeo
};

type UploadedItem = { originalName: string; url: string; filename: string };

const API_BASE_URL = appConfig.api.baseUrl;
const API_ORIGIN = appConfig.api.serverUrl;

const authHeaders = (): HeadersInit => {
  try {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
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

// ✅ pega File a partir de blob: (caso _file tenha se perdido)
async function blobUrlToFile(blobUrl: string, filename: string): Promise<File> {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

async function uploadFiles(files: File[]): Promise<UploadedItem[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));

  const res = await fetch(`${API_BASE_URL}/uploads/course-carousel`, {
    method: "POST",
    body: fd,
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errorBody = await parseResponseBody(res);
    const errorMessage = typeof errorBody === "string" && errorBody ? errorBody : "Falha no upload do carrossel";
    throw new Error(errorMessage);
  }

  const json: any = await parseResponseBody(res);
  if (!json?.success || !Array.isArray(json?.data)) {
    throw new Error(json?.message || "Falha no upload do carrossel");
  }
  return (json.data as UploadedItem[]).map((item) => ({
    ...item,
    url: toAbsoluteUrl(item.url),
  }));
}

export async function buildMediaCarouselForSave(items: InputItem[]) {
  // 1) Coletar tudo que precisa upload (imagens + thumbs de vídeo)
  const toUpload: File[] = [];
  const nameToReplace = new Map<string, { kind: "imageUrl" | "thumbUrl"; index: number }>();

  for (let i = 0; i < items.length; i++) {
    const it = items[i];

    // -------------------------
    // IMAGEM do carrossel
    // -------------------------
    if (it.type === "image") {
      // Se já é URL real (http/https), ok.
      if (it.url && !it.url.startsWith("blob:")) continue;

      // Se é blob, preciso de um File (do state ou recuperando via fetch)
      let file = it.file;
      if (!file && it.url?.startsWith("blob:")) {
        // recupera do blob
        file = await blobUrlToFile(it.url, `carousel-image-${i}.jpg`);
      }

      if (!file) {
        throw new Error("Item de imagem do carrossel está sem arquivo. Faça upload novamente.");
      }

      // Renomeia pra garantir map único
      const renamed = new File([file], `carousel-image-${i}-${file.name}`, { type: file.type });
      toUpload.push(renamed);

      // Esse nome tem que bater com originalName do backend
      nameToReplace.set(renamed.name, { kind: "imageUrl", index: i });
      continue;
    }

    // -------------------------
    // VÍDEO: thumb pode ser upload
    // -------------------------
    if (it.type === "video") {
      const thumb = it.thumbnail_url || "";

      // Se thumb é blob, preciso subir
      if (thumb.startsWith("blob:")) {
        let tf = it.thumbFile;
        if (!tf) {
          tf = await blobUrlToFile(thumb, `carousel-thumb-${i}.jpg`);
        }

        const renamed = new File([tf], `carousel-thumb-${i}-${tf.name}`, { type: tf.type });
        toUpload.push(renamed);
        nameToReplace.set(renamed.name, { kind: "thumbUrl", index: i });
      }

      // Se url do vídeo vier blob, isso é erro de UX (vídeo tem que ser URL real)
      if (it.url?.startsWith("blob:")) {
        throw new Error("URL de vídeo não pode ser blob. Cole um link real (YouTube/Vimeo).");
      }
    }
  }

  // 2) Faz upload se necessário
  let uploadedMap = new Map<string, string>();
  if (toUpload.length > 0) {
    const uploaded = await uploadFiles(toUpload);
    uploadedMap = new Map(uploaded.map((u) => [u.originalName, u.url]));
  }

  // 3) Monta payload final SEM blob
  return items.map((it, idx) => {
    let url = it.url;
    let thumb = it.thumbnail_url || "";

    // se imagem era blob, substitui pelo retorno do upload
    if (it.type === "image" && url.startsWith("blob:")) {
      // procuramos a entrada no map pelo padrão de nome que criamos
      const key = Array.from(nameToReplace.entries()).find(
        ([, info]) => info.index === idx && info.kind === "imageUrl"
      )?.[0];

      if (!key) throw new Error("Falha ao mapear upload da imagem do carrossel.");
      const realUrl = uploadedMap.get(key);
      if (!realUrl) throw new Error("Upload não retornou URL da imagem do carrossel.");

      url = realUrl;
      thumb = realUrl; // imagem usa a própria como thumb
    }

    // se thumb do vídeo era blob, substitui
    if (it.type === "video" && thumb.startsWith("blob:")) {
      const key = Array.from(nameToReplace.entries()).find(
        ([, info]) => info.index === idx && info.kind === "thumbUrl"
      )?.[0];

      if (!key) throw new Error("Falha ao mapear upload da thumbnail do vídeo.");
      const realThumb = uploadedMap.get(key);
      if (!realThumb) throw new Error("Upload não retornou URL da thumbnail do vídeo.");

      thumb = realThumb;
    }

    // ✅ trava final: NUNCA deixa blob escapar
    if (url.startsWith("blob:") || thumb.startsWith("blob:")) {
      throw new Error("Ainda existe blob no carrossel. Upload não foi aplicado.");
    }

    return {
      type: it.type,
      url,
      thumbnail_url: thumb || (it.type === "image" ? url : ""),
      title: it.title || "",
      duration: it.type === "video" ? (it.duration ?? null) : null,
      sort_order: idx + 1,
    };
  });
}
