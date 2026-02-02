// src/domain/asset-categories/assetCategory.ts

/**
 * Categoria de Asset
 */
export interface AssetCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Payload para criar/atualizar categoria de asset
 */
export interface AssetCategoryPayload {
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  sort_order?: number;
}

/**
 * Erros de validação da categoria
 */
export interface AssetCategoryErrors {
  name?: string;
  slug?: string;
}

/**
 * Valida a categoria de asset
 */
export function validateAssetCategory(category: AssetCategoryPayload): AssetCategoryErrors {
  const errors: AssetCategoryErrors = {};

  if (!category.name?.trim()) {
    errors.name = "Nome é obrigatório";
  }

  if (!category.slug?.trim()) {
    errors.slug = "Slug é obrigatório";
  }

  return errors;
}

/**
 * Verifica se há erros
 */
export function hasErrors(errors: AssetCategoryErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Gera slug a partir do nome
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
