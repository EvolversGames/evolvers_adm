// src/domain/auth/auth.ts
// Authentication domain types

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'instructor';
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

/* export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T; 
}; */


export type ApiResponse<T> =
  | { success: true; message?: string; data: T }
  | { success: false; message?: string; error?: string };