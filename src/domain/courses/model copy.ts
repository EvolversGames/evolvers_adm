// src/domain/courses/model.ts

/**
 * Curso como entidade do sistema (já criado/publicado)
 * Retornado pela API GET /api/courses
 */
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

/**
 * Curso em edição (formulário / rascunho)
 */
export type CourseDraft = {
  draftId: string;
  
  // Campos de products
  title: string;
  slug?: string;
  description: string;
  image_url: string;
  price: number;
  original_price: number;
  active: boolean;
  featured: boolean;
  
  // Campos de courses
  duration_text: string;
  duration_minutes: number;
  category_id: number;
  level_id: number;
  software_id?: number;
  badge_id?: number;
  corner_badge_id?: number;
  status: "draft" | "published" | "archived";
  
  updatedAt: string;
};

/**
 * JSON que a API POST /api/courses espera receber
 */
export type CoursePayload = {
  // Products
  title: string;
  slug?: string;
  description?: string;
  image_url: string;
  price: number;
  original_price?: number;
  active?: boolean;
  featured?: boolean;
  
  // Courses
  duration_text?: string;
  duration_minutes?: number;
  category_id: number;
  level_id: number;
  software_id?: number;
  badge_id?: number;
  corner_badge_id?: number;
  status?: "draft" | "published" | "archived";
};

/**
 * Resposta da API ao criar curso
 */
export type CourseResponse = {
  id: number;
  title: string;
  slug: string;
  price: number;
  // ... outros campos
};

/**
 * Factory para rascunho vazio
 */
export function createEmptyDraft(): CourseDraft {
  return {
    draftId: crypto.randomUUID(),
    
    // Products
    title: "",
    slug: "",
    description: "",
    image_url: "",
    price: 0,
    original_price: 0,
    active: true,
    featured: false,
    
    // Courses
    duration_text: "",
    duration_minutes: 0,
    category_id: 0,
    level_id: 0,
    software_id: undefined,
    badge_id: undefined,
    corner_badge_id: undefined,
    status: "draft",
    
    updatedAt: new Date().toISOString(),
  };
}