// src/data/instructors/instructorMapper.ts
import type { Instructor, InstructorFormData } from '../../domain/instructors/instructor';

/**
 * Mapper de instructors
 * Transformações entre diferentes representações de dados
 */

/**
 * Transforma Instructor do banco para InstructorFormData (para edição)
 */
export function instructorToFormData(instructor: Instructor): InstructorFormData {
  return {
    name: instructor.name,
    slug: instructor.slug,
    bio_short: instructor.bio_short || '',
    bio_long: instructor.bio_long || '',
    avatar_url: instructor.avatar_url || '',
    website_url: instructor.website_url || '',
    youtube_url: instructor.youtube_url || '',
    linkedin_url: instructor.linkedin_url || '',
    twitter_handle: instructor.twitter_handle || '',
  };
}

/**
 * Cria um InstructorFormData vazio (para criação)
 */
export function createEmptyInstructor(): InstructorFormData {
  return {
    name: '',
    slug: '',
    bio_short: '',
    bio_long: '',
    avatar_url: '',
    website_url: '',
    youtube_url: '',
    linkedin_url: '',
    twitter_handle: '',
  };
}