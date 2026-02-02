// src/domain/assets/mapper.ts

import type { AssetDraft, AssetPayload } from "./model";

/**
 * Gera slug a partir do título
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .replace(/^-|-$/g, ""); // Remove hífens no início e fim
}

/**
 * Converte Draft para Payload (para enviar à API)
 */
export function draftToPayload(draft: AssetDraft): AssetPayload {
  // Não enviar URLs de blob para a API - são temporárias e inválidas
  const imageUrl = draft.image_url?.startsWith("blob:") ? "" : draft.image_url;

  return {
    // Produto
    title: draft.title.trim(),
    slug: draft.slug.trim() || generateSlug(draft.title),
    description: draft.description.trim(),
    image_url: imageUrl,
    price: Number(draft.price) || 0,
    original_price: Number(draft.original_price) || 0,
    active: draft.active,
    featured: draft.featured,
    purchase_url: draft.purchase_url?.trim() || null,

    // Asset específico
    author_id: draft.author_id!,
    asset_category_id: draft.asset_category_id!,
    software_id: draft.software_id || null,
    license_id: draft.license_id!,
    file_size_mb: draft.file_size_mb || null,
    polygon_count: draft.polygon_count || null,
    texture_resolution: draft.texture_resolution?.trim() || null,
    render_engine: draft.render_engine?.trim() || null,
    is_rigged: draft.is_rigged,
    is_animated: draft.is_animated,
    is_game_ready: draft.is_game_ready,
    is_pbr: draft.is_pbr,
    compatible_software:
      draft.compatible_software.length > 0
        ? JSON.stringify(draft.compatible_software)
        : null,
    format_included:
      draft.format_included.length > 0
        ? JSON.stringify(draft.format_included)
        : null,
    version: draft.version?.trim() || null,
    status: draft.status,

    // Detalhes
    subtitle: draft.subtitle?.trim() || null,
    about_asset: draft.about_asset?.trim() || null,
    technical_details: draft.technical_details?.trim() || null,
    whats_included: draft.whats_included?.trim() || null,
    terms_of_use: draft.terms_of_use?.trim() || null,

    // Relacionamentos
    tag_ids: draft.tag_ids,
    previews: draft.previews,
    files: draft.files,
    related_asset_ids: draft.related_asset_ids,
  };
}

/**
 * Converte Asset do banco para Draft (para edição)
 * Suporta tanto o formato do banco (snake_case) quanto o formato da API (camelCase)
 */
export function assetToDraft(asset: any): AssetDraft {
  // Parse dos campos JSON
  let compatibleSoftware: string[] = [];
  let formatIncluded: string[] = [];

  const compatSoftware = asset.compatible_software;
  const formatInc = asset.format_included;

  try {
    if (compatSoftware) {
      compatibleSoftware = typeof compatSoftware === "string" ? JSON.parse(compatSoftware) : compatSoftware;
    }
  } catch {
    compatibleSoftware = [];
  }

  try {
    if (formatInc) {
      formatIncluded = typeof formatInc === "string" ? JSON.parse(formatInc) : formatInc;
    }
  } catch {
    formatIncluded = [];
  }

  // Suporta formato do _internal (API) ou direto do banco
  const internal = asset._internal || {};

  return {
    // Produto
    title: asset.title || "",
    slug: asset.slug || "",
    description: asset.description || "",
    // Suporta tanto image_url quanto image
    image_url: asset.image_url || asset.image || "",
    price: asset.price || 0,
    // Suporta tanto original_price quanto originalPrice
    original_price: asset.original_price ?? asset.originalPrice ?? 0,
    active: asset.active ?? true,
    featured: asset.featured ?? false,
    purchase_url: asset.purchase_url || "",

    // Asset específico - suporta tanto formato interno (_internal) quanto direto
    author_id: internal.authorId ?? asset.author_id ?? null,
    asset_category_id: internal.assetCategoryId ?? asset.asset_category_id ?? null,
    software_id: internal.softwareId ?? asset.software_id ?? null,
    license_id: internal.licenseId ?? asset.license_id ?? null,
    // Suporta tanto snake_case quanto camelCase
    file_size_mb: asset.file_size_mb ?? asset.fileSizeMb ?? null,
    polygon_count: asset.polygon_count ?? asset.polygonCount ?? null,
    texture_resolution: asset.texture_resolution ?? asset.textureResolution ?? "",
    render_engine: asset.render_engine ?? asset.renderEngine ?? "",
    // Suporta is_rigged, rigged, etc.
    is_rigged: asset.is_rigged ?? asset.rigged ?? false,
    is_animated: asset.is_animated ?? asset.animated ?? false,
    is_game_ready: asset.is_game_ready ?? asset.gameReady ?? false,
    is_pbr: asset.is_pbr ?? asset.pbrReady ?? false,
    compatible_software: compatibleSoftware,
    format_included: formatIncluded,
    version: asset.version || "",
    status: internal.status ?? asset.status ?? "draft",

    // Detalhes - suporta tanto formato aninhado (details) quanto flat
    subtitle: asset.details?.subtitle ?? asset.subtitle ?? "",
    about_asset: asset.details?.about_asset ?? asset.aboutAsset ?? "",
    technical_details: asset.details?.technical_details ?? asset.technicalDetails ?? "",
    whats_included: asset.details?.whats_included ?? asset.whatsIncluded ?? "",
    terms_of_use: asset.details?.terms_of_use ?? asset.termsOfUse ?? "",

    // Relacionamentos
    // tags pode ser array de IDs ou array de objetos {id, name, slug}
    tag_ids: Array.isArray(asset.tags)
      ? asset.tags.map((t: any) => (typeof t === "object" ? t.id : t))
      : asset.tag_ids || [],
    // previews pode estar em previewImages, previewVideos ou previews
    previews: asset.previews || [
      // Imagens
      ...(asset.previewImages?.map((p: any) => ({
        id: p.id,
        type: "image" as const,
        url: p.imageUrl || p.image_url || p.url || "",
        thumbnail_url: p.thumbnailUrl || p.thumbnail_url || "",
        caption: p.caption || "",
        sort_order: p.sortOrder ?? p.sort_order ?? 0,
      })) || []),
      // Vídeos
      ...(asset.previewVideos?.map((v: any) => ({
        id: v.id,
        type: "video" as const,
        url: v.videoUrl || v.video_url || v.url || "",
        thumbnail_url: v.thumbnailUrl || v.thumbnail_url || "",
        title: v.title || "",
        duration: v.duration || "",
        sort_order: v.sortOrder ?? v.sort_order ?? 0,
      })) || []),
    ],
    files: asset.files?.map((f: any) => ({
      id: f.id,
      file_type_id: f.fileTypeId ?? f.file_type_id ?? 0,
      file_name: f.fileName ?? f.file_name ?? "",
      file_path: f.filePath ?? f.file_path ?? "",
      file_size_mb: parseFloat(f.fileSizeMb ?? f.file_size_mb) || 0,
      description: f.description ?? "",
    })) || [],
    related_asset_ids: asset.related_assets?.map((r: any) => r.related_asset_id ?? r.id) || asset.related_asset_ids || [],
  };
}
