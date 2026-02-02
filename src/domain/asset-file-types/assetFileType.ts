// src/domain/asset-file-types/assetFileType.ts

/**
 * Tipo de arquivo de Asset
 */
export interface AssetFileType {
  id: number;
  name: string;
  extension: string;
  icon?: string | null;
  color?: string | null;
  created_at?: string;
}

/**
 * Payload para criar/atualizar tipo de arquivo
 */
export interface AssetFileTypePayload {
  name: string;
  extension: string;
  icon?: string | null;
  color?: string | null;
}

/**
 * Erros de validação do tipo de arquivo
 */
export interface AssetFileTypeErrors {
  name?: string;
  extension?: string;
}

/**
 * Valida o tipo de arquivo de asset
 */
export function validateAssetFileType(fileType: AssetFileTypePayload): AssetFileTypeErrors {
  const errors: AssetFileTypeErrors = {};

  if (!fileType.name?.trim()) {
    errors.name = "Nome é obrigatório";
  }

  if (!fileType.extension?.trim()) {
    errors.extension = "Extensão é obrigatória";
  }

  return errors;
}

/**
 * Verifica se há erros
 */
export function hasErrors(errors: AssetFileTypeErrors): boolean {
  return Object.keys(errors).length > 0;
}
