// src/domain/tags/tag.ts

export interface Tag {
  id: number;
  name: string;
  slug: string;
  usage_count: number;
}

export interface TagFormData {
  name: string;
  slug: string;
}

export const createEmptyTag = (): TagFormData => ({
  name: '',
  slug: '',
});

export const tagToFormData = (tag: Tag): TagFormData => ({
  name: tag.name,
  slug: tag.slug,
});
