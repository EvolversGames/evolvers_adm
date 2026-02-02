// frontend/src/domain/bundle/apiErrorValidator.ts

import type { BundleErrors } from './bundle_validation';

/**
 * Extrai erros de validação da resposta da API
 */
export function extractApiErrors(error: any): BundleErrors {
  const errors: BundleErrors = {};

  // Se houver erros de validação específicos do backend
  if (error?.response?.data?.errors) {
    const apiErrors = error.response.data.errors;
    
    // Mapeia erros do backend para os campos do formulário
    Object.keys(apiErrors).forEach((field) => {
      const key = field as keyof BundleErrors;
      errors[key] = Array.isArray(apiErrors[field]) 
        ? apiErrors[field][0] 
        : apiErrors[field];
    });
  }

  return errors;
}

/**
 * Obtém mensagem de erro geral da API
 */
export function getApiErrorMessage(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Erro desconhecido ao processar a requisição';
}

/**
 * Verifica se é um erro de validação
 */
export function isValidationError(error: any): boolean {
  return error?.response?.status === 400 || error?.response?.status === 422;
}

/**
 * Verifica se é um erro de autenticação
 */
export function isAuthError(error: any): boolean {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

/**
 * Verifica se é um erro de não encontrado
 */
export function isNotFoundError(error: any): boolean {
  return error?.response?.status === 404;
}

/**
 * Verifica se é um erro de servidor
 */
export function isServerError(error: any): boolean {
  return error?.response?.status >= 500;
}

/**
 * Trata erro da API e retorna objeto com informações estruturadas
 */
export function handleApiError(error: any): {
  message: string;
  errors: BundleErrors;
  status?: number;
  isValidation: boolean;
  isAuth: boolean;
  isNotFound: boolean;
  isServer: boolean;
} {
  return {
    message: getApiErrorMessage(error),
    errors: extractApiErrors(error),
    status: error?.response?.status,
    isValidation: isValidationError(error),
    isAuth: isAuthError(error),
    isNotFound: isNotFoundError(error),
    isServer: isServerError(error)
  };
}
