// src/domain/courses/model.ts

export type Course = {
  id: number;
  title: string;
  slug: string;
  instructor: string;
  image: string;
  price: number;
  originalPrice: number;
  duration: string;
  level: string;
  levelColor?: string;
  softwareColor: string;
  softwareIcon: string;
  category: string;
  software: string;
  badge?: string;
  cornerBadge?: string;
  rating: number;
};

export type CourseDraft = {
  draftId: string;

  title: string;
  slug?: string;
  description: string;
  image_url: string;

  image_file?: File;

  price: number;
  original_price: number;
  active: boolean;
  featured: boolean;
    purchase_url?: string | null;

  duration_text: string;
  duration_minutes: number;
  category_id: number;
  level_id: number;
  software_id?: number;
  badge_id?: number;
  corner_badge_id?: number;
  status: "draft" | "published" | "archived";

  // ✅ ADICIONAR
  subtitle?: string;
  tag_ids: number[];
  instructor_ids: number[];
  modules: { id: string; title: string; lessons: { id: string; title: string; duration: string }[] }[];
  requirements: string[];
  objectives: string[];
  target_audience: string[];

  updatedAt: string;
};

export type CoursePayload = {
  title: string;
  slug?: string;
  description?: string;
  image_url: string;
  price: number;
  original_price?: number;
  active?: boolean;
  featured?: boolean;
  purchase_url?: string | null;
  duration_text?: string;
  duration_minutes?: number;
  category_id: number;
  level_id: number;
  software_id?: number;
  badge_id?: number;
  corner_badge_id?: number;
  status?: "draft" | "published" | "archived";

  // ✅ ADICIONAR (o que vai pro backend)
  subtitle?: string;
  tag_ids?: number[];
  instructor_ids?: number[];
  modules?: { title: string; lessons: { title: string; duration?: string }[] }[];
  requirements?: string[];
  objectives?: string[];
  target_audience?: string[];
};

export type CourseResponse = {
  id: number;
  title: string;
  slug: string;
  price: number;
  purchase_url: string;
};

export function createEmptyDraft(): CourseDraft {
  return {
    draftId: crypto.randomUUID(),
    title: "",
    slug: "",
    description: "",
    image_url: "",
    image_file: undefined,
    price: 0,
    original_price: 0,
    active: true,
    featured: false,
    duration_text: "",
    duration_minutes: 0,
    category_id: 0,
    level_id: 0,
    software_id: undefined,
    badge_id: undefined,
    corner_badge_id: undefined,
    status: "draft",
    purchase_url: null,

    // ✅ defaults
    subtitle: "",
    tag_ids: [],
    instructor_ids: [],
    modules: [],
    requirements: [],
    objectives: [],
    target_audience: [],

    updatedAt: new Date().toISOString(),
  }
}