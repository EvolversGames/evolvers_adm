// src/domain/articles/mapper.ts

import type { ArticleDraft, ArticlePayload } from "./articles_model";

/**
 * Converte draft para payload que a API espera
 */
export function draftToPayload(draft: ArticleDraft): ArticlePayload {
  return {
    // ✅ Campos que o backend ESPERA (seguindo ArticleUpsertPayload)
    title: draft.title.trim(),
    slug: draft.slug?.trim() || undefined,
    excerpt: draft.description.trim() || undefined,
    image: draft.image_url.trim(),
    
    instructor_id: draft.instructor_id,
    article_category_id: draft.article_category_id,
    read_time: draft.read_time,
    published_date: draft.published_date,
    
    active: draft.active,
    featured: draft.featured,

    // Relacionados
    tag_ids: Array.isArray(draft.tag_ids) ? draft.tag_ids : [],
    sections: Array.isArray(draft.sections)
      ? draft.sections
          .map(s => ({
            heading: String(s?.heading ?? "").trim(),
            content: String(s?.content ?? "").trim(),
            image: s?.image?.trim() || undefined,
            order_index: s?.order_index ?? 0,
          }))
          .filter(s => s.heading && s.content)
      : [],
    related_article_ids: Array.isArray(draft.related_article_ids) ? draft.related_article_ids : [],
  };
}

/**
 * Gera slug a partir do título
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}