/**
 * Form validation utilities
 */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number (accepts various formats)
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  // Removes common separators and checks if 10-15 digits remain
  const digitsOnly = phone.replace(/[\s\-\(\)\.]/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15 && /^\d+$/.test(digitsOnly);
};

/**
 * Validates positive number
 */
export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

/**
 * Validates non-negative number
 */
export const isNonNegativeNumber = (value: number): boolean => {
  return !isNaN(value) && value >= 0;
};

/**
 * Validates required field (not empty string)
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validates minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Validates maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Validates date is not in the past
 */
export const isNotPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

/**
 * Validates customer form
 */
export const validateCustomerForm = (data: {
  name: string;
  email: string;
  phone: string;
  totalDebt?: number;
  rating?: number;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!isRequired(data.name)) {
    errors.name = 'El nombre es requerido';
  } else if (!hasMinLength(data.name, 2)) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  } else if (!hasMaxLength(data.name, 100)) {
    errors.name = 'El nombre no puede exceder 100 caracteres';
  }

  // Email validation
  if (!isRequired(data.email)) {
    errors.email = 'El email es requerido';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Formato de email inválido';
  }

  // Phone validation
  if (!isRequired(data.phone)) {
    errors.phone = 'El teléfono es requerido';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Formato de teléfono inválido (10-15 dígitos)';
  }

  // Total debt validation (if provided)
  if (data.totalDebt !== undefined && !isNonNegativeNumber(data.totalDebt)) {
    errors.totalDebt = 'La deuda debe ser un número no negativo';
  }

  // Rating validation (if provided)
  if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
    errors.rating = 'La calificación debe estar entre 1 y 5';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates supplier form
 */
export const validateSupplierForm = (data: {
  name: string;
  email: string;
  phone: string;
  totalOwed?: number;
  rating?: number;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!isRequired(data.name)) {
    errors.name = 'El nombre es requerido';
  } else if (!hasMinLength(data.name, 2)) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  } else if (!hasMaxLength(data.name, 100)) {
    errors.name = 'El nombre no puede exceder 100 caracteres';
  }

  // Email validation
  if (!isRequired(data.email)) {
    errors.email = 'El email es requerido';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Formato de email inválido';
  }

  // Phone validation
  if (!isRequired(data.phone)) {
    errors.phone = 'El teléfono es requerido';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Formato de teléfono inválido (10-15 dígitos)';
  }

  // Total owed validation (if provided)
  if (data.totalOwed !== undefined && !isNonNegativeNumber(data.totalOwed)) {
    errors.totalOwed = 'El monto adeudado debe ser un número no negativo';
  }

  // Rating validation (if provided)
  if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
    errors.rating = 'La calificación debe estar entre 1 y 5';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates product form
 */
export const validateProductForm = (data: {
  name: string;
  price: number;
  purchasePrice: number;
  quantity: number;
  lowStockThreshold: number;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!isRequired(data.name)) {
    errors.name = 'El nombre del producto es requerido';
  } else if (!hasMinLength(data.name, 2)) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }

  // Price validation
  if (!isPositiveNumber(data.price)) {
    errors.price = 'El precio debe ser mayor a 0';
  }

  // Purchase price validation
  if (!isNonNegativeNumber(data.purchasePrice)) {
    errors.purchasePrice = 'El precio de compra debe ser mayor o igual a 0';
  }

  // Cross-field validation: price should be higher than purchase price
  if (isPositiveNumber(data.price) && isNonNegativeNumber(data.purchasePrice) && data.price <= data.purchasePrice) {
    errors.price = 'El precio de venta debe ser mayor al precio de compra';
  }

  // Quantity validation
  if (!isNonNegativeNumber(data.quantity)) {
    errors.quantity = 'La cantidad debe ser mayor o igual a 0';
  }

  // Low stock threshold validation
  if (!isNonNegativeNumber(data.lowStockThreshold)) {
    errors.lowStockThreshold = 'El umbral de stock bajo debe ser mayor o igual a 0';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates transaction form
 */
export const validateTransactionForm = (data: {
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;
  customerId?: string;
  supplierId?: string;
  type: 'receivable' | 'payable';
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Total amount validation
  if (!isPositiveNumber(data.totalAmount)) {
    errors.totalAmount = 'El monto total debe ser mayor a 0';
  }

  // Paid amount validation
  if (!isNonNegativeNumber(data.paidAmount)) {
    errors.paidAmount = 'El monto pagado debe ser mayor o igual a 0';
  }

  // Cross-field validation: paid amount should not exceed total amount
  if (isPositiveNumber(data.totalAmount) && isNonNegativeNumber(data.paidAmount) && data.paidAmount > data.totalAmount) {
    errors.paidAmount = 'El monto pagado no puede exceder el monto total';
  }

  // Customer/Supplier validation
  if (data.type === 'receivable' && !data.customerId) {
    errors.customerId = 'Debe seleccionar un cliente';
  }
  if (data.type === 'payable' && !data.supplierId) {
    errors.supplierId = 'Debe seleccionar un proveedor';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
