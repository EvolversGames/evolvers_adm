// src/utils/uploadCarouselAndReplace.ts
import type { MediaCarouselItem } from "../domain/courses/courseCarousel.types";
import { api as courseApi } from "../data/courses/api";

const isHttpUrl = (v: any) => typeof v === "string" && /^https?:\/\//i.test(v);
const isBlobUrl = (v: any) => typeof v === "string" && v.startsWith("blob:");

export async function uploadCarouselAndReplace(items: MediaCarouselItem[]): Promise<MediaCarouselItem[]> {
  console.log("🔧 uploadCarouselAndReplace - INÍCIO");
  console.log("📥 Recebeu", items.length, "items");

  const out: MediaCarouselItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`\n--- Item ${i + 1}/${items.length} ---`);
    console.log("📋 ID:", item.id);
    console.log("📋 Type:", item.type);
    console.log("📋 Title:", item.title);
    console.log("📋 URL:", item.url?.substring(0, 60));
    console.log("📋 Thumbnail:", item.thumbnail_url?.substring(0, 60));
    console.log("📋 Tem _file?", !!item._file);
    console.log("📋 Tem _thumbFile?", !!item._thumbFile);

    // ✅ Já tem URLs HTTP reais
    if (isHttpUrl(item.url) && isHttpUrl(item.thumbnail_url)) {
      console.log("✅ URLs já são HTTP, mantendo item...");
      out.push({
        ...item,
        _file: null,
        _thumbFile: null,
      });
      continue;
    }

    // ✅ IMAGEM: precisa fazer upload
    if (item.type === "image") {
      console.log("🖼️ É uma IMAGEM");

      if (!item._file) {
        console.error("❌ Item._file está vazio!");
        console.error("❌ Item completo:", item);
        throw new Error(
          `Item de carrossel "${item.title || "(sem título)"}" está com blob mas sem File. 
          Verifique se você está salvando o File no campo _file ao fazer upload.`
        );
      }

      console.log("📤 Fazendo upload do arquivo:", item._file.name);
      console.log("📤 Tamanho:", (item._file.size / 1024).toFixed(2), "KB");

      try {
        const uploaded = await courseApi.uploadCourseCarouselMedia(item._file);
        console.log("✅ Upload concluído!");
        console.log("✅ URL recebida:", uploaded.url);
        console.log("✅ Thumbnail recebida:", uploaded.thumbnail_url);

        out.push({
          ...item,
          url: uploaded.url,
          thumbnail_url: uploaded.thumbnail_url ?? uploaded.url,
          _file: null,
          _thumbFile: null,
        });

      } catch (uploadError: any) {
        console.error("❌ Erro no upload:", uploadError);
        throw new Error(`Erro ao fazer upload de "${item.title}": ${uploadError.message}`);
      }

      continue;
    }

    // ✅ VÍDEO
    if (item.type === "video") {
      console.log("🎥 É um VÍDEO");

      // Se thumbnail for blob, precisa fazer upload
      if (isBlobUrl(item.thumbnail_url)) {
        console.log("📤 Thumbnail é blob, precisa fazer upload...");

        if (!item._thumbFile) {
          console.error("❌ _thumbFile está vazio!");
          throw new Error(
            `Vídeo "${item.title}" tem thumbnail em blob mas sem File (_thumbFile).`
          );
        }

        console.log("📤 Fazendo upload da thumbnail:", item._thumbFile.name);

        try {
          const uploaded = await courseApi.uploadCourseCarouselMedia(item._thumbFile);
          console.log("✅ Upload da thumbnail concluído:", uploaded.url);

          out.push({
            ...item,
            thumbnail_url: uploaded.url,
            _file: null,
            _thumbFile: null,
          });

        } catch (uploadError: any) {
          console.error("❌ Erro no upload da thumbnail:", uploadError);
          throw new Error(`Erro ao fazer upload da thumbnail de "${item.title}": ${uploadError.message}`);
        }

        continue;
      }

      // URL do vídeo deve ser HTTP
      if (!isHttpUrl(item.url)) {
        console.error("❌ URL do vídeo não é HTTP:", item.url);
        throw new Error(
          `Vídeo "${item.title}" precisa ter URL real (YouTube/Vimeo/etc), não blob.`
        );
      }

      console.log("✅ Vídeo com URLs válidas, mantendo...");
      out.push({
        ...item,
        _file: null,
        _thumbFile: null,
      });

      continue;
    }

    // Tipo desconhecido
    console.warn("⚠️ Tipo desconhecido:", item.type);
  }

  console.log("\n✅ uploadCarouselAndReplace - CONCLUÍDO");
  console.log("📤 Retornando", out.length, "items processados");

  return out;
}