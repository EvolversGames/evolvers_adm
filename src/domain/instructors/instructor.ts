// src/domain/instructors/instructor.ts

export interface Instructor {
  id: number;
  name: string;
  slug: string;
  bio_short: string | null;
  bio_long: string | null;
  avatar_url: string | null;
  website_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
  avg_rating: number | null;
  total_courses: number | null;
  total_students: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InstructorFormData {
  name: string;
  slug: string;
  bio_short: string;
  bio_long: string;
  avatar_url: string;
  website_url: string;
  youtube_url: string;
  linkedin_url: string;
  twitter_handle: string;
}

export const createEmptyInstructor = (): InstructorFormData => ({
  name: '',
  slug: '',
  bio_short: '',
  bio_long: '',
  avatar_url: '',
  website_url: '',
  youtube_url: '',
  linkedin_url: '',
  twitter_handle: '',
});

export const instructorToFormData = (instructor: Instructor): InstructorFormData => ({
  name: instructor.name,
  slug: instructor.slug,
  bio_short: instructor.bio_short || '',
  bio_long: instructor.bio_long || '',
  avatar_url: instructor.avatar_url || '',
  website_url: instructor.website_url || '',
  youtube_url: instructor.youtube_url || '',
  linkedin_url: instructor.linkedin_url || '',
  twitter_handle: instructor.twitter_handle || '',
});