// src/utils/uploadAssetCarouselAndReplace.ts
import type { AssetPreviewItem } from "../domain/assets/model";
import { assetApi } from "../data/assets/api";

const isHttpUrl = (v: any) => typeof v === "string" && /^https?:\/\//i.test(v);
const isBlobUrl = (v: any) => typeof v === "string" && v.startsWith("blob:");

export async function uploadAssetCarouselAndReplace(items: AssetPreviewItem[]): Promise<AssetPreviewItem[]> {
  console.log("🔧 uploadAssetCarouselAndReplace - INÍCIO");
  console.log("📥 Recebeu", items.length, "items");

  const out: AssetPreviewItem[] = [];

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

      // Se a URL é blob e tem arquivo, faz upload
      if (isBlobUrl(item.url) && item._file) {
        console.log("📤 Fazendo upload do arquivo:", item._file.name);
        console.log("📤 Tamanho:", (item._file.size / 1024).toFixed(2), "KB");

        try {
          const uploaded = await assetApi.uploadAssetCarouselMedia(item._file);
          console.log("✅ Upload concluído!");
          console.log("✅ URL recebida:", uploaded.url);
          console.log("✅ Thumbnail recebida:", uploaded.thumbnail_url);

          out.push({
            ...item,
            type: "image", // Garantir que o tipo está definido
            url: uploaded.url,
            thumbnail_url: uploaded.thumbnail_url ?? uploaded.url,
            _file: null,
            _thumbFile: null,
          });
          continue;
        } catch (uploadError: any) {
          console.error("❌ Erro no upload:", uploadError);
          throw new Error(`Erro ao fazer upload de "${item.title}": ${uploadError.message}`);
        }
      }

      // Se tem URL HTTP mas thumbnail é blob, upload só da thumb
      if (isHttpUrl(item.url) && isBlobUrl(item.thumbnail_url) && item._thumbFile) {
        console.log("📤 Fazendo upload apenas da thumbnail...");

        try {
          const uploaded = await assetApi.uploadAssetCarouselMedia(item._thumbFile);
          out.push({
            ...item,
            type: "image", // Garantir que o tipo está definido
            thumbnail_url: uploaded.url,
            _file: null,
            _thumbFile: null,
          });
          continue;
        } catch (uploadError: any) {
          console.error("❌ Erro no upload da thumbnail:", uploadError);
          throw new Error(`Erro ao fazer upload da thumbnail de "${item.title}": ${uploadError.message}`);
        }
      }

      // Se ainda é blob sem arquivo, erro
      if (isBlobUrl(item.url) && !item._file) {
        console.error("❌ Item._file está vazio!");
        throw new Error(
          `Item de carrossel "${item.title || "(sem título)"}" está com blob mas sem File.
          Verifique se você está salvando o File no campo _file ao fazer upload.`
        );
      }

      // URL normal, mantém
      console.log("✅ Imagem com URLs válidas, mantendo...");
      out.push({
        ...item,
        type: "image", // Garantir que o tipo está definido
        _file: null,
        _thumbFile: null,
      });
      continue;
    }

    // ✅ VÍDEO
    if (item.type === "video") {
      console.log("🎥 É um VÍDEO");

      let finalThumbnailUrl = item.thumbnail_url || "";

      // Se thumbnail for blob, precisa fazer upload
      if (isBlobUrl(item.thumbnail_url) && item._thumbFile) {
        console.log("📤 Fazendo upload da thumbnail:", item._thumbFile.name);

        try {
          const uploaded = await assetApi.uploadAssetCarouselMedia(item._thumbFile);
          console.log("✅ Upload da thumbnail concluído:", uploaded.url);
          finalThumbnailUrl = uploaded.url;
        } catch (uploadError: any) {
          console.error("❌ Erro no upload da thumbnail:", uploadError);
          throw new Error(`Erro ao fazer upload da thumbnail de "${item.title}": ${uploadError.message}`);
        }
      }

      // URL do vídeo pode estar vazia (usuário adiciona depois) ou ser HTTP
      // Não bloquear se estiver vazia, apenas avisar se for blob
      if (isBlobUrl(item.url)) {
        console.error("❌ URL do vídeo é blob:", item.url);
        throw new Error(
          `Vídeo "${item.title}" não pode ter URL blob. Use uma URL real (YouTube/Vimeo/etc).`
        );
      }

      console.log("✅ Vídeo processado - URL:", item.url || "(vazia)", "Thumb:", finalThumbnailUrl);
      out.push({
        ...item,
        type: "video", // Garantir que o tipo está definido
        thumbnail_url: finalThumbnailUrl,
        _file: null,
        _thumbFile: null,
      });
      continue;
    }

    // Tipo desconhecido - mantém mas limpa _file
    console.warn("⚠️ Tipo desconhecido:", item.type);
    out.push({
      ...item,
      _file: null,
      _thumbFile: null,
    });
  }

  console.log("\n✅ uploadAssetCarouselAndReplace - CONCLUÍDO");
  console.log("📤 Retornando", out.length, "items processados");

  return out;
}
