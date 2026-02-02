// src/data/tags/tagMapper.ts
import type { Tag, TagFormData } from '../../domain/tags/tag';

/**
 * Mapper de tags
 * Transformações entre diferentes representações de dados
 */

/**
 * Transforma Tag do banco para TagFormData (para edição)
 */
export function tagToFormData(tag: Tag): TagFormData {
  return {
    name: tag.name,
    slug: tag.slug,
  };
}

/**
 * Cria um TagFormData vazio (para criação)
 */
export function createEmptyTag(): TagFormData {
  return {
    name: '',
    slug: '',
  };
}
