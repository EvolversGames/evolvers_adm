// src/domain/articles/model.ts

export type Article = {
  id: number;
  title: string;
  slug: string;
  author: string;
  authorAvatar?: string;
  image: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  categoryIcon: string;
  readTime: number;
  publishedDate: string;
  featured: boolean;
  tags?: string[];
};

export type ArticleDraft = {
  draftId: string;

  // Dados do produto (products table)
  title: string;
  slug?: string;
  description: string; // usado como excerpt
  image_url: string;
  image_file?: File;

  price: number;
  original_price: number;
  active: boolean;
  featured: boolean;

  // Dados do artigo (articles table)
  instructor_id: number; // autor do artigo
  article_category_id: number;
  read_time: number; // em minutos
  published_date: string; // YYYY-MM-DD ou ISO

  status: "draft" | "published" | "archived";

  // Campos relacionados
  tag_ids: number[];
  sections: ArticleSectionDraft[];
  related_article_ids: number[];

  updatedAt: string;
};

export type ArticleSectionDraft = {
  id: string; // UUID temporário para controle no frontend
  heading: string;
  content: string;
  image?: string;
  image_file?: File; // ✅ Re-adicionado
  order_index: number;
};

// ✅ CORRIGIDO: Alinhado com ArticleUpsertPayload do backend
export type ArticlePayload = {
  // Campos do backend (ArticleUpsertPayload)
  title: string;
  slug?: string;
  excerpt?: string; // ✅ excerpt (não description)
  image: string; // ✅ image (não image_url)

  instructor_id: number;
  article_category_id: number;
  read_time: number;
  published_date: string;

  active?: boolean;
  featured?: boolean;

  // Relacionados
  tag_ids?: number[];
  sections?: ArticleSectionPayload[];
  related_article_ids?: number[];
};

export type ArticleSectionPayload = {
  heading: string;
  content: string;
  image?: string;
  order_index: number;
};

export type ArticleResponse = {
  id: number;
  title: string;
  slug: string;
  image_url: string;
};

export function createEmptyDraft(): ArticleDraft {
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

    instructor_id: 0,
    article_category_id: 0,
    read_time: 5,
    published_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    status: "draft",

    tag_ids: [],
    sections: [],
    related_article_ids: [],

    updatedAt: new Date().toISOString(),
  };
}