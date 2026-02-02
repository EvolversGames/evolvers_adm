// src/data/articles/storage.ts
import type { ArticleDraft } from "../../domain/articles/articles_model";

const KEY = "articles:draft";

export const storage = {
  load(): ArticleDraft | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<ArticleDraft>;

      const normalizeNumber = (v: any, fallback = 0) => {
        const n = typeof v === "number" ? v : Number(v);
        return Number.isFinite(n) ? n : fallback;
      };

      const normalized: ArticleDraft = {
        draftId: String(parsed.draftId ?? crypto.randomUUID()),
        title: String(parsed.title ?? ""),
        slug: parsed.slug ? String(parsed.slug) : "",
        description: String(parsed.description ?? ""),
        image_url: String(parsed.image_url ?? ""),
        image_file: undefined,

        price: normalizeNumber(parsed.price, 0),
        original_price: normalizeNumber(parsed.original_price, 0),
        active: typeof parsed.active === "boolean" ? parsed.active : true,
        featured: typeof parsed.featured === "boolean" ? parsed.featured : false,

        instructor_id: normalizeNumber(parsed.instructor_id, 0),
        article_category_id: normalizeNumber(parsed.article_category_id, 0),
        read_time: normalizeNumber(parsed.read_time, 5),
        published_date: String(parsed.published_date ?? new Date().toISOString().split('T')[0]),

        status: (parsed.status as any) || "draft",

        tag_ids: Array.isArray(parsed.tag_ids) ? parsed.tag_ids : [],
        sections: Array.isArray(parsed.sections) 
          ? parsed.sections.map(s => ({
              id: String(s?.id ?? crypto.randomUUID()),
              heading: String(s?.heading ?? ""),
              content: String(s?.content ?? ""),
              image: String(s?.image ?? ""),
              image_file: undefined, // nunca reidrata File
              order_index: normalizeNumber(s?.order_index, 0),
            }))
          : [],
        related_article_ids: Array.isArray(parsed.related_article_ids) ? parsed.related_article_ids : [],

        updatedAt: String(parsed.updatedAt ?? new Date().toISOString()),
      };

      return normalized;
    } catch {
      return null;
    }
  },

  save(draft: ArticleDraft) {
    // Remover image_file antes de salvar
    const { image_file, ...rest } = draft;
    
    // Remover image_file de cada seção também
    const cleanSections = rest.sections.map(({ image_file: _, ...section }) => section);
    
    localStorage.setItem(KEY, JSON.stringify({ ...rest, sections: cleanSections }));
  },

  clear() {
    localStorage.removeItem(KEY);
  },
};