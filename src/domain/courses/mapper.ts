// src/domain/courses/mapper.ts

import type { CourseDraft, CoursePayload } from "./model";

/**
 * Converte draft para payload que a API espera
 */
export function draftToPayload(draft: CourseDraft): CoursePayload {
  return {
    // Products
    title: draft.title.trim(),
    slug: draft.slug?.trim() || undefined,
    description: draft.description.trim() || undefined,
    image_url: draft.image_url.trim(),
    price: draft.price,
    original_price: draft.original_price > 0 ? draft.original_price : undefined,
    active: draft.active,
    featured: draft.featured,
    purchase_url: draft.purchase_url?.trim() || undefined,
    // Courses
    duration_text: draft.duration_text.trim() || undefined,
    duration_minutes: draft.duration_minutes > 0 ? draft.duration_minutes : undefined,
    category_id: draft.category_id,
    level_id: draft.level_id,
    software_id: draft.software_id || undefined,
    badge_id: draft.badge_id || undefined,
    corner_badge_id: draft.corner_badge_id || undefined,
    status: draft.status,

    // ✅ LISTAS E CAMPOS
    subtitle: (draft.subtitle ?? "").trim() || undefined,
    tag_ids: Array.isArray(draft.tag_ids) ? draft.tag_ids : [],
    instructor_ids: Array.isArray(draft.instructor_ids) ? draft.instructor_ids : [],
    requirements: Array.isArray(draft.requirements)
      ? draft.requirements.map(x => String(x ?? "").trim()).filter(Boolean)
      : [],
    objectives: Array.isArray(draft.objectives)
      ? draft.objectives.map(x => String(x ?? "").trim()).filter(Boolean)
      : [],
    target_audience: Array.isArray(draft.target_audience)
      ? draft.target_audience.map(x => String(x ?? "").trim()).filter(Boolean)
      : [],
    modules: Array.isArray(draft.modules)
      ? draft.modules
          .map(m => ({
            title: String(m?.title ?? "").trim(),
            lessons: Array.isArray(m?.lessons)
              ? m.lessons
                  .map(l => ({
                    title: String(l?.title ?? "").trim(),
                    duration: String(l?.duration ?? "00:00").trim() || "00:00",
                  }))
                  .filter(l => l.title)
              : [],
          }))
          .filter(m => m.title)
      : [],
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