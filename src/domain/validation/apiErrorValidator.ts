// src/domain/validation/apiErrorValidator.ts
import { HttpError } from '../../services/http/client';

/**
 * Tipo de erro da API
 */
export interface ApiErrorResult {
  hasError: boolean;
  message: string;
  field?: string;
  code?: string;
}

/**
 * Extrai e valida erros da API seguindo o padrão do validator
 */
export function validateApiError(error: unknown): ApiErrorResult {
  // Erro do HttpClient
  if (error instanceof HttpError) {
    const body = error.body as any;
    
    // Extrai mensagem do backend
    const message = 
      body?.error || 
      body?.message || 
      `Erro ${error.status}`;
    
    return {
      hasError: true,
      message,
      code: String(error.status),
    };
  }

  // Erro genérico
  if (error instanceof Error) {
    return {
      hasError: true,
      message: error.message,
    };
  }

  // Erro desconhecido
  return {
    hasError: true,
    message: 'Erro desconhecido',
  };
}

/**
 * Mapeia códigos de erro HTTP para mensagens amigáveis
 */
export const apiErrorMessages: Record<number, string> = {
  400: 'Requisição inválida',
  401: 'Não autorizado',
  403: 'Acesso negado',
  404: 'Não encontrado',
  409: 'Conflito de dados',
  422: 'Dados inválidos',
  500: 'Erro interno do servidor',
};

/**
 * Obtém mensagem amigável baseada no código de erro
 */
export function getApiErrorMessage(code: number, defaultMessage?: string): string {
  return apiErrorMessages[code] || defaultMessage || 'Erro desconhecido';
}