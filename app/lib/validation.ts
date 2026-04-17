/**
 * Validation utilities for the Bolívar API Developer Portal.
 * Extracted for testability with property-based tests (tasks 3.2, 3.3).
 */

const NIT_REGEX = /^\d{9}-\d{1}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface RegistroFormData {
  nit: string;
  razonSocial: string;
  representanteLegal: string;
  correoElectronico: string;
  documentoCamara: File | null;
}

export type RegistroErrors = Partial<Record<keyof RegistroFormData, string>>;

/** Validates a NIT string against the pattern: 9 digits + hyphen + 1 verification digit. */
export function validateNit(nit: string): boolean {
  return NIT_REGEX.test(nit);
}

/** Validates an email address with a standard format check. */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/** Validates that a file is a PDF and does not exceed 10 MB. */
export function validatePdf(file: File | null): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Debe cargar el documento de Cámara de Comercio en formato PDF.' };
  }
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'El documento debe estar en formato PDF.' };
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    return { valid: false, error: 'El documento no debe superar los 10 MB.' };
  }
  return { valid: true };
}

/** Validates the full registration form and returns an errors object. */
export function validateRegistroForm(data: RegistroFormData): RegistroErrors {
  const errors: RegistroErrors = {};

  if (!data.nit.trim()) {
    errors.nit = 'El NIT es obligatorio.';
  } else if (!validateNit(data.nit)) {
    errors.nit = 'El NIT debe tener el formato 123456789-0 (9 dígitos, guión, 1 dígito de verificación).';
  }

  if (!data.razonSocial.trim()) {
    errors.razonSocial = 'La razón social es obligatoria.';
  } else if (data.razonSocial.trim().length > 200) {
    errors.razonSocial = 'La razón social no debe superar los 200 caracteres.';
  }

  if (!data.representanteLegal.trim()) {
    errors.representanteLegal = 'El nombre del representante legal es obligatorio.';
  } else if (data.representanteLegal.trim().length > 150) {
    errors.representanteLegal = 'El nombre del representante legal no debe superar los 150 caracteres.';
  }

  if (!data.correoElectronico.trim()) {
    errors.correoElectronico = 'El correo electrónico es obligatorio.';
  } else if (!validateEmail(data.correoElectronico)) {
    errors.correoElectronico = 'Ingrese un correo electrónico válido.';
  }

  const pdfResult = validatePdf(data.documentoCamara);
  if (!pdfResult.valid) {
    errors.documentoCamara = pdfResult.error;
  }

  return errors;
}
