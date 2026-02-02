// src/domain/instructors/instructorValidator.ts
import type { InstructorFormData } from './instructor';
import { validate, rules, type FieldErrors } from '../validation/validator';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_RE = /^https?:\/\/.+/;
const TWITTER_RE = /^@?[A-Za-z0-9_]{1,15}$/;

export function validateInstructorForm(data: InstructorFormData) {
  return validate<InstructorFormData>(data, {
    name: [
      rules.required<InstructorFormData, 'name'>('Nome é obrigatório'),
      rules.minLen<InstructorFormData, 'name'>(2, 'Nome precisa ter pelo menos 2 caracteres'),
    ],
    slug: [
      rules.required<InstructorFormData, 'slug'>('Slug é obrigatório'),
      rules.pattern<InstructorFormData, 'slug'>(SLUG_RE, 'Slug inválido (use letras minúsculas, números e hífen)'),
    ],
    bio_short: [
      // Opcional
    ],
    bio_long: [
      // Opcional
    ],
    avatar_url: [
      // Opcional, mas se preenchido valida URL
      (value) => {
        if (value && value.trim() && !URL_RE.test(value.trim())) {
          return 'URL inválida (deve começar com http:// ou https://)';
        }
        return null;
      }
    ],
    website_url: [
      (value) => {
        if (value && value.trim() && !URL_RE.test(value.trim())) {
          return 'URL inválida (deve começar com http:// ou https://)';
        }
        return null;
      }
    ],
    youtube_url: [
      (value) => {
        if (value && value.trim() && !URL_RE.test(value.trim())) {
          return 'URL inválida (deve começar com http:// ou https://)';
        }
        return null;
      }
    ],
    linkedin_url: [
      (value) => {
        if (value && value.trim() && !URL_RE.test(value.trim())) {
          return 'URL inválida (deve começar com http:// ou https://)';
        }
        return null;
      }
    ],
    twitter_handle: [
      (value) => {
        if (value && value.trim() && !TWITTER_RE.test(value.trim())) {
          return 'Twitter handle inválido (ex: @username ou username)';
        }
        return null;
      }
    ],
  });
}

export type InstructorFieldErrors = FieldErrors<InstructorFormData>;