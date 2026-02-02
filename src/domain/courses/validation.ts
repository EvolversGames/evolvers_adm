// src/domain/courses/validation.ts

import type { CourseDraft } from "./model";

export type CourseDraftErrors = Partial<Record<keyof CourseDraft, string>>;

/**
 * Valida um rascunho de curso
 */
export function validateCourseDraft(draft: CourseDraft): CourseDraftErrors {
  const errors: CourseDraftErrors = {};

  // Validações obrigatórias de products
  if (!draft.title?.trim()) {
    errors.title = "Título é obrigatório";
  } else if (draft.title.trim().length < 3) {
    errors.title = "Título deve ter no mínimo 3 caracteres";
  }

  if (!draft.description?.trim()) {
    errors.description = "Descrição é obrigatória";
  } else if (draft.description.trim().length < 10) {
    errors.description = "Descrição deve ter no mínimo 10 caracteres";
  }

  if (!draft.image_url?.trim()) {
    errors.image_url = "URL da imagem é obrigatória";
  }

  if (draft.price === undefined || draft.price === null || draft.price === 0) {
    errors.price = "Preço é obrigatório";
  } else if (draft.price < 0) {
    errors.price = "Preço não pode ser negativo";
  }

  // Validações obrigatórias de courses
  if (!draft.category_id || draft.category_id === 0) {
    errors.category_id = "Categoria é obrigatória";
  }

  if (!draft.level_id || draft.level_id === 0) {
    errors.level_id = "Nível é obrigatório";
  }

  // Validar preço original se fornecido
  if (draft.original_price && draft.original_price < draft.price) {
    errors.original_price = "Preço original deve ser maior que o preço atual";
  }

  // description, duration_text, software_id, etc são opcionais

  return errors;
}

/**
 * Verifica se há erros
 */
export function hasErrors(errors: CourseDraftErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Obtém primeiro erro de um campo
 */
export function getFirstError(errors: CourseDraftErrors, field: keyof CourseDraft): string | null {
  return errors[field] || null;
}