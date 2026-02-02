// src/domain/articles/validation.ts

import type { ArticleDraft } from "./articles_model";

export type ArticleDraftErrors = Partial<Record<keyof ArticleDraft, string>>;

/**
 * Valida um rascunho de artigo
 */
export function validateArticleDraft(draft: ArticleDraft): ArticleDraftErrors {
  const errors: ArticleDraftErrors = {};

  // Validações obrigatórias de products
  if (!draft.title?.trim()) {
    errors.title = "Título é obrigatório";
  } else if (draft.title.trim().length < 10) {
    errors.title = "Título deve ter no mínimo 10 caracteres";
  }

  if (!draft.description?.trim()) {
    errors.description = "Descrição/Excerpt é obrigatória";
  } else if (draft.description.trim().length < 20) {
    errors.description = "Descrição deve ter no mínimo 20 caracteres";
  }

  if (!draft.image_url?.trim()) {
    errors.image_url = "URL da imagem é obrigatória";
  }

  // Validações obrigatórias de articles
  if (!draft.instructor_id || draft.instructor_id === 0) {
    errors.instructor_id = "Autor é obrigatório";
  }

  if (!draft.article_category_id || draft.article_category_id === 0) {
    errors.article_category_id = "Categoria é obrigatória";
  }

  if (!draft.read_time || draft.read_time === 0) {
    errors.read_time = "Tempo de leitura é obrigatório";
  } else if (draft.read_time < 1) {
    errors.read_time = "Tempo de leitura deve ser maior que 0";
  }

  if (!draft.published_date?.trim()) {
    errors.published_date = "Data de publicação é obrigatória";
  }

  // Validar seções (pelo menos uma)
  if (!draft.sections || draft.sections.length === 0) {
    errors.sections = "Pelo menos uma seção é obrigatória";
  } else {
    // Validar cada seção
    const hasInvalidSection = draft.sections.some(
      section => !section.heading?.trim() || !section.content?.trim()
    );
    if (hasInvalidSection) {
      errors.sections = "Todas as seções devem ter título e conteúdo";
    }
  }

  return errors;
}

/**
 * Verifica se há erros
 */
export function hasErrors(errors: ArticleDraftErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Obtém primeiro erro de um campo
 */
export function getFirstError(errors: ArticleDraftErrors, field: keyof ArticleDraft): string | null {
  return errors[field] || null;
}
