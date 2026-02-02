// frontend/src/domain/bundle/bundle_validation.ts

import type { CreateBundleData, UpdateBundleData } from './bundle_types';

export type BundleErrors = Partial<Record<keyof (CreateBundleData & UpdateBundleData), string>> & {
  [key: string]: string | undefined;
};

/**
 * Valida dados de criação/atualização de bundle
 */
export function validateBundleData(
  data: Partial<CreateBundleData | UpdateBundleData>,
  isUpdate: boolean = false
): BundleErrors {
  const errors: BundleErrors = {};

  // Validações obrigatórias para criação
  if (!isUpdate || data.title !== undefined) {
    if (!data.title?.trim()) {
      errors.title = 'Título é obrigatório';
    } else if (data.title.trim().length < 3) {
      errors.title = 'Título deve ter no mínimo 3 caracteres';
    } else if (data.title.trim().length > 200) {
      errors.title = 'Título não pode ter mais de 200 caracteres';
    }
  }


// purchase_url (opcional)
  if (data.purchase_url !== undefined && data.purchase_url !== null) {
    const v = String(data.purchase_url).trim();
    if (v.length > 0 && !isValidUrl(v)) {
      errors.purchase_url = 'URL de compra inválida';
    }
  }


  if (!isUpdate || data.image !== undefined) {
    if (!data.image?.trim()) {
      errors.image = 'Imagem é obrigatória';
    } else if (!isValidUrl(data.image)) {
      errors.image = 'URL da imagem inválida';
    }
  }

  if (!isUpdate || data.price !== undefined) {
    if (data.price === undefined || data.price === null) {
      errors.price = 'Preço é obrigatório';
    } else if (data.price < 0) {
      errors.price = 'Preço não pode ser negativo';
    } else if (data.price === 0) {
      errors.price = 'Preço deve ser maior que zero';
    }
  }

  if (!isUpdate || data.original_price !== undefined) {
    if (data.original_price === undefined || data.original_price === null) {
      errors.original_price = 'Preço original é obrigatório';
    } else if (data.original_price < 0) {
      errors.original_price = 'Preço original não pode ser negativo';
    } else if (data.original_price === 0) {
      errors.original_price = 'Preço original deve ser maior que zero';
    }
  }

  // Validação de preços relativos
  if (data.price !== undefined && data.original_price !== undefined) {
    if (data.price > data.original_price) {
      errors.price = 'Preço não pode ser maior que o preço original';
    }
  }

  if (!isUpdate || data.category_id !== undefined) {
    if (!data.category_id || data.category_id === 0) {
      errors.category_id = 'Categoria é obrigatória';
    }
  }

  // Validações opcionais
  if (data.subtitle && data.subtitle.length > 500) {
    errors.subtitle = 'Subtítulo não pode ter mais de 500 caracteres';
  }

  if (data.description && data.description.length > 5000) {
    errors.description = 'Descrição não pode ter mais de 5000 caracteres';
  }

  // Validação de items se fornecidos
  if (data.items && Array.isArray(data.items)) {
    if (data.items.length === 0) {
      errors.items = 'Bundle deve ter pelo menos um item';
    }

    // Validar cada item
    const invalidItems = data.items.filter(
      item => !item.product_type || !item.product_id || item.product_id <= 0
    );

    if (invalidItems.length > 0) {
      errors.items = 'Todos os items devem ter tipo e ID válidos';
    }
  }

  return errors;
}

/**
 * Valida especificamente dados de criação
 */
export function validateCreateBundle(data: CreateBundleData): BundleErrors {
  return validateBundleData(data, false);
}

/**
 * Valida especificamente dados de atualização
 */
export function validateUpdateBundle(data: UpdateBundleData): BundleErrors {
  return validateBundleData(data, true);
}

/**
 * Verifica se há erros
 */
export function hasErrors(errors: BundleErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Obtém primeiro erro de um campo
 */
export function getFirstError(
  errors: BundleErrors,
  field: keyof (CreateBundleData & UpdateBundleData)
): string | null {
  return errors[field] || null;
}

/**
 * Valida se uma string é uma URL válida (incluindo blob: para uploads locais)
 */
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Aceita http:, https: e blob: (para uploads locais)
    return urlObj.protocol === 'http:' || 
           urlObj.protocol === 'https:' || 
           urlObj.protocol === 'blob:';
  } catch {
    return false;
  }
}

/**
 * Formata mensagens de erro para exibição
 */
export function formatErrorMessage(error: string): string {
  return error.charAt(0).toUpperCase() + error.slice(1);
}

/**
 * Obtém todos os erros como array de strings
 */
export function getErrorMessages(errors: BundleErrors): string[] {
  return Object.values(errors).filter((error): error is string => !!error);
}

/**
 * Valida campos específicos individualmente
 */
export function validateField(
  field: keyof (CreateBundleData & UpdateBundleData),
  value: any,
  allData?: Partial<CreateBundleData | UpdateBundleData>
): string | null {
  const data = { ...allData, [field]: value };
  const errors = validateBundleData(data, true);
  return errors[field] || null;
}