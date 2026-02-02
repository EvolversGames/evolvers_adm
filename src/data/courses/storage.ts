import type { CourseDraft } from "../../domain/courses/model";

const KEY = "courses:draft";

export const storage = {
  load(): CourseDraft | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<CourseDraft>;

      const normalizeNumber = (v: any, fallback = 0) => {
        const n = typeof v === "number" ? v : Number(v);
        return Number.isFinite(n) ? n : fallback;
      };

      const normalizeNumberArray = (v: any): number[] => {
        if (!Array.isArray(v)) return [];
        return v
          .map((n) => (typeof n === "number" ? n : Number(n)))
          .filter((n) => Number.isFinite(n));
      };

      const normalizeStringArray = (v: any): string[] => {
        if (!Array.isArray(v)) return [];
        return v.map((s) => String(s));
      };

      const normalizeModules = (v: any): CourseDraft["modules"] => {
        if (!Array.isArray(v)) return [];
        return v.map((m: any) => ({
          id: String(m?.id ?? crypto.randomUUID()),
          title: String(m?.title ?? ""),
          lessons: Array.isArray(m?.lessons)
            ? m.lessons.map((l: any) => ({
                id: String(l?.id ?? crypto.randomUUID()),
                title: String(l?.title ?? ""),
                duration: String(l?.duration ?? ""),
              }))
            : [],
        }));
      };

      const normalized: CourseDraft = {
        draftId: String(parsed.draftId ?? crypto.randomUUID()),
        title: String(parsed.title ?? ""),
        slug: parsed.slug ? String(parsed.slug) : "",
        description: String(parsed.description ?? ""),
        image_url: String(parsed.image_url ?? ""),

        // ✅ nunca reidrata arquivo pelo localStorage
        image_file: undefined,

        price: normalizeNumber(parsed.price, 0),
        original_price: normalizeNumber(parsed.original_price, 0),
        active: typeof parsed.active === "boolean" ? parsed.active : true,
        featured: typeof parsed.featured === "boolean" ? parsed.featured : false,
        purchase_url: parsed.purchase_url ?? null,

        duration_text: String(parsed.duration_text ?? ""),
        duration_minutes: normalizeNumber(parsed.duration_minutes, 0),
        category_id: normalizeNumber(parsed.category_id, 0),
        level_id: normalizeNumber(parsed.level_id, 0),
        software_id: parsed.software_id == null ? undefined : normalizeNumber(parsed.software_id, 0) || undefined,
        badge_id: parsed.badge_id == null ? undefined : normalizeNumber(parsed.badge_id, 0) || undefined,
        corner_badge_id:
          parsed.corner_badge_id == null ? undefined : normalizeNumber(parsed.corner_badge_id, 0) || undefined,
        status: (parsed.status as any) || "draft",

        subtitle: String(parsed.subtitle ?? ""),
        tag_ids: normalizeNumberArray(parsed.tag_ids),
        instructor_ids: normalizeNumberArray(parsed.instructor_ids),
        modules: normalizeModules(parsed.modules),
        requirements: normalizeStringArray(parsed.requirements),
        objectives: normalizeStringArray(parsed.objectives),
        target_audience: normalizeStringArray(parsed.target_audience),

        updatedAt: String(parsed.updatedAt ?? new Date().toISOString()),
      };

      return normalized;
    } catch {
      return null;
    }
  },

  save(draft: CourseDraft) {
    // ✅ Nunca persistir File no localStorage
    const { image_file, ...rest } = draft;
    localStorage.setItem(KEY, JSON.stringify(rest));
  },

  clear() {
    localStorage.removeItem(KEY);
  },
};
