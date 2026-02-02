// src/domain/asset-licenses/assetLicense.ts

/**
 * Licença de Asset
 */
export interface AssetLicense {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  allows_commercial_use: boolean;
  allows_redistribution: boolean;
  requires_attribution: boolean;
  created_at?: string;
}

/**
 * Payload para criar/atualizar licença
 */
export interface AssetLicensePayload {
  name: string;
  slug: string;
  description?: string | null;
  allows_commercial_use?: boolean;
  allows_redistribution?: boolean;
  requires_attribution?: boolean;
}

/**
 * Erros de validação da licença
 */
export interface AssetLicenseErrors {
  name?: string;
  slug?: string;
}

/**
 * Valida a licença de asset
 */
export function validateAssetLicense(license: AssetLicensePayload): AssetLicenseErrors {
  const errors: AssetLicenseErrors = {};

  if (!license.name?.trim()) {
    errors.name = "Nome é obrigatório";
  }

  if (!license.slug?.trim()) {
    errors.slug = "Slug é obrigatório";
  }

  return errors;
}

/**
 * Verifica se há erros
 */
export function hasErrors(errors: AssetLicenseErrors): boolean {
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
