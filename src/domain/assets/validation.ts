// src/domain/assets/validation.ts

import type { AssetDraft, AssetDraftErrors } from "./model";

/**
 * Valida o draft do Asset e retorna os erros encontrados
 */
export function validateAssetDraft(draft: AssetDraft): AssetDraftErrors {
  const errors: AssetDraftErrors = {};

  // Título obrigatório
  if (!draft.title?.trim()) {
    errors.title = "Título é obrigatório";
  } else if (draft.title.trim().length < 3) {
    errors.title = "Título deve ter pelo menos 3 caracteres";
  }

  // Slug obrigatório
  if (!draft.slug?.trim()) {
    errors.slug = "Slug é obrigatório";
  }

/*   // Descrição obrigatória
  if (!draft.description?.trim()) {
    errors.description = "Descrição é obrigatória";
  } else if (draft.description.trim().length < 10) {
    errors.description = "Descrição deve ter pelo menos 10 caracteres";
  } */

  // Imagem obrigatória
  if (!draft.image_url?.trim()) {
    errors.image_url = "Imagem de capa é obrigatória";
  }

  // Preço deve ser válido
  if (draft.price < 0) {
    errors.price = "Preço não pode ser negativo";
  }

  // Autor obrigatório
  if (!draft.author_id) {
    errors.author_id = "Autor é obrigatório";
  }

  // Categoria obrigatória
  if (!draft.asset_category_id) {
    errors.asset_category_id = "Categoria é obrigatória";
  }

  // Licença obrigatória
  if (!draft.license_id) {
    errors.license_id = "Licença é obrigatória";
  }

  return errors;
}

/**
 * Verifica se há erros no objeto de erros
 */
export function hasErrors(errors: AssetDraftErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Valida campos obrigatórios para publicação (mais rigoroso)
 */
export function validateForPublish(draft: AssetDraft): AssetDraftErrors {
  const errors = validateAssetDraft(draft);

  // Validações adicionais para publicação
  if (!draft.about_asset?.trim()) {
    errors.about_asset = "Descrição detalhada é obrigatória para publicar";
  }

  if (draft.previews.length === 0) {
    // Não bloqueia, mas pode ser usado para avisar
  }

  return errors;
}
