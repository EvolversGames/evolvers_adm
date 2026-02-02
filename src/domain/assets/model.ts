// src/domain/assets/model.ts

/**
 * Status do Asset
 */
export type AssetStatus = "draft" | "published" | "archived";

/**
 * Tipo de Preview (imagem ou vídeo)
 */
export type PreviewType = "image" | "video";

/**
 * Item de preview do carrossel (imagens/vídeos)
 * Inclui campos _file e _thumbFile para upload local no front
 */
export interface AssetPreviewItem {
  id?: number | string;
  type: PreviewType;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  title?: string;
  duration?: string | number | null;
  sort_order: number;
  // Campos internos do front para upload
  _file?: File | null;
  _thumbFile?: File | null;
}

/**
 * Arquivo do Asset
 */
export interface AssetFile {
  id?: number;
  file_type_id: number;
  file_name: string;
  file_path: string;
  file_size_mb?: number;
  description?: string;
}

/**
 * Asset relacionado
 */
export interface AssetRelated {
  id?: number;
  related_asset_id: number;
  relation_type: "similar" | "same_author" | "bundle" | "alternative";
  sort_order: number;
}

/**
 * Detalhes do Asset
 */
export interface AssetDetails {
  subtitle?: string;
  about_asset?: string;
  technical_details?: string;
  whats_included?: string;
  terms_of_use?: string;
}

/**
 * Asset - Modelo completo do banco de dados
 */
export interface Asset {
  id: number;
  product_id: number;
  author_id: number;
  asset_category_id: number;
  software_id?: number | null;
  license_id: number;
  file_size_mb?: number | null;
  polygon_count?: number | null;
  texture_resolution?: string | null;
  render_engine?: string | null;
  is_rigged?: boolean;
  is_animated?: boolean;
  is_game_ready?: boolean;
  is_pbr?: boolean;
  compatible_software?: string | null; // JSON string com lista de softwares
  format_included?: string | null; // JSON string com lista de formatos
  version?: string | null;
  status: AssetStatus;
  created_at: string;
  updated_at: string;

  // Campos do produto (products)
  title: string;
  slug: string;
  description?: string | null;
  image_url: string;
  price: number;
  original_price: number;
  discount_percentage?: number;
  active: boolean;
  featured: boolean;
  purchase_url?: string | null;

  // Relacionamentos
  details?: AssetDetails;
  previews?: AssetPreviewItem[];
  files?: AssetFile[];
  tags?: number[];
  related_assets?: AssetRelated[];
}

/**
 * Draft do Asset - usado no formulário (campos opcionais)
 */
export interface AssetDraft {
  // Dados do produto
  title: string;
  slug: string;
  description: string;
  image_url: string;
  price: number;
  original_price: number;
  active: boolean;
  featured: boolean;
  purchase_url: string;

  // Dados específicos do asset
  author_id: number | null;
  asset_category_id: number | null;
  software_id: number | null;
  license_id: number | null;
  file_size_mb: number | null;
  polygon_count: number | null;
  texture_resolution: string;
  render_engine: string;
  is_rigged: boolean;
  is_animated: boolean;
  is_game_ready: boolean;
  is_pbr: boolean;
  compatible_software: string[]; // Array para formulário
  format_included: string[]; // Array para formulário
  version: string;
  status: AssetStatus;

  // Detalhes
  subtitle: string;
  about_asset: string;
  technical_details: string;
  whats_included: string;
  terms_of_use: string;

  // Relacionamentos
  tag_ids: number[];
  previews: AssetPreviewItem[];
  files: AssetFile[];
  related_asset_ids: number[];

  // Metadados do draft
  updatedAt?: string;
}

/**
 * Payload para criar/atualizar Asset na API
 */
export interface AssetPayload {
  // Dados do produto
  title: string;
  slug: string;
  description: string;
  image_url: string;
  price: number;
  original_price: number;
  active: boolean;
  featured: boolean;
  purchase_url?: string | null;

  // Dados específicos do asset
  author_id: number;
  asset_category_id: number;
  software_id?: number | null;
  license_id: number;
  file_size_mb?: number | null;
  polygon_count?: number | null;
  texture_resolution?: string | null;
  render_engine?: string | null;
  is_rigged: boolean;
  is_animated: boolean;
  is_game_ready: boolean;
  is_pbr: boolean;
  compatible_software?: string | null; // JSON string
  format_included?: string | null; // JSON string
  version?: string | null;
  status: AssetStatus;

  // Detalhes
  subtitle?: string | null;
  about_asset?: string | null;
  technical_details?: string | null;
  whats_included?: string | null;
  terms_of_use?: string | null;

  // Relacionamentos
  tag_ids: number[];
  previews: AssetPreviewItem[];
  files: AssetFile[];
  related_asset_ids: number[];
}

/**
 * Erros de validação do draft
 */
export interface AssetDraftErrors {
  title?: string;
  slug?: string;
  description?: string;
  image_url?: string;
  price?: string;
  author_id?: string;
  asset_category_id?: string;
  license_id?: string;
  about_asset?: string;
}

/**
 * Cria um draft vazio
 */
export function createEmptyAssetDraft(): AssetDraft {
  return {
    // Produto
    title: "",
    slug: "",
    description: "",
    image_url: "",
    price: 0,
    original_price: 0,
    active: true,
    featured: false,
    purchase_url: "",

    // Asset específico
    author_id: null,
    asset_category_id: null,
    software_id: null,
    license_id: null,
    file_size_mb: null,
    polygon_count: null,
    texture_resolution: "",
    render_engine: "",
    is_rigged: false,
    is_animated: false,
    is_game_ready: false,
    is_pbr: false,
    compatible_software: [],
    format_included: [],
    version: "",
    status: "draft",

    // Detalhes
    subtitle: "",
    about_asset: "",
    technical_details: "",
    whats_included: "",
    terms_of_use: "",

    // Relacionamentos
    tag_ids: [],
    previews: [],
    files: [],
    related_asset_ids: [],
  };
}
