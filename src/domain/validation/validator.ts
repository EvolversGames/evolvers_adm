// src/domain/validation/validator.ts
export type FieldErrors<T> = Partial<Record<keyof T, string[]>>;

export type Rule<T, K extends keyof T> = (value: T[K], data: T) => string | null;

export type Schema<T> = {
  [K in keyof T]?: Array<Rule<T, K>>;
};

export type ValidationResult<T> = {
  isValid: boolean;
  errors: FieldErrors<T>;
};

export function validate<T>(data: T, schema: Schema<T>): ValidationResult<T> {
  const errors: FieldErrors<T> = {};

  (Object.keys(schema) as Array<keyof T>).forEach((field) => {
    const rules = schema[field];
    if (!rules || rules.length === 0) return;

    const fieldErrors: string[] = [];
    for (const rule of rules as Array<Rule<T, any>>) {
      const msg = rule((data as any)[field], data);
      if (msg) fieldErrors.push(msg);
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Helpers de regras */
export const rules = {
  required:
    <T, K extends keyof T>(message = 'Campo obrigatório'): Rule<T, K> =>
    (value) => {
      if (value === null || value === undefined) return message;
      if (typeof value === 'string' && value.trim() === '') return message;
      return null;
    },

  minLen:
    <T, K extends keyof T>(min: number, message?: string): Rule<T, K> =>
    (value) => {
      if (typeof value !== 'string') return null;
      if (value.trim().length < min) return message ?? `Mínimo de ${min} caracteres`;
      return null;
    },

  pattern:
    <T, K extends keyof T>(re: RegExp, message = 'Formato inválido'): Rule<T, K> =>
    (value) => {
      if (typeof value !== 'string') return null;
      if (value.trim() === '') return null; // deixa o "required" cuidar disso
      if (!re.test(value)) return message;
      return null;
    },

  hexColor:
    <T, K extends keyof T>(message = 'Cor inválida. Use #RRGGBB'): Rule<T, K> =>
    (value) => {
      if (typeof value !== 'string') return message;
      const v = value.trim();
      if (v === '') return null; // deixa required cuidar
      return /^#[0-9A-Fa-f]{6}$/.test(v) ? null : message;
    },

  intMin:
    <T, K extends keyof T>(min: number, message?: string): Rule<T, K> =>
    (value) => {
      const n = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(n)) return message ?? 'Valor inválido';
      if (!Number.isInteger(n)) return message ?? 'Precisa ser um número inteiro';
      if (n < min) return message ?? `Precisa ser ≥ ${min}`;
      return null;
    },
     custom:
    <T, K extends keyof T>(
      predicate: (value: T[K], data: T) => boolean,
      message = 'Inválido'
    ): Rule<T, K> =>
    (value, data) => {
      if (value === null || value === undefined) return null;
      if (typeof value === 'string' && value.trim() === '') return null;
      return predicate(value, data) ? null : message;
    },

    
};

/** Conveniência: pega só o 1º erro de um campo */
export function firstError<T>(errors: FieldErrors<T>, field: keyof T): string | null {
  const arr = errors[field];
  return arr && arr.length > 0 ? arr[0] : null;
}
