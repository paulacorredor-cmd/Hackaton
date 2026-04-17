import { describe, it, expect } from 'vitest';
import {
  validateNit,
  validateEmail,
  validatePdf,
  validateRegistroForm,
  type RegistroFormData,
} from '../validation';

function makePdf(size = 1024, type = 'application/pdf'): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], 'camara.pdf', { type });
}

describe('validateNit', () => {
  it('accepts valid NIT format', () => {
    expect(validateNit('123456789-0')).toBe(true);
    expect(validateNit('000000000-0')).toBe(true);
    expect(validateNit('999999999-9')).toBe(true);
  });

  it('rejects invalid NIT formats', () => {
    expect(validateNit('')).toBe(false);
    expect(validateNit('12345678-0')).toBe(false);   // 8 digits
    expect(validateNit('1234567890-0')).toBe(false);  // 10 digits
    expect(validateNit('123456789-00')).toBe(false);  // 2 verification digits
    expect(validateNit('12345678a-0')).toBe(false);   // letter in digits
    expect(validateNit('1234567890')).toBe(false);    // no hyphen
  });
});

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('a@b.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('noatsign')).toBe(false);
    expect(validateEmail('@nodomain')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
  });
});

describe('validatePdf', () => {
  it('accepts a valid PDF under 10 MB', () => {
    expect(validatePdf(makePdf()).valid).toBe(true);
  });

  it('rejects null file', () => {
    const result = validatePdf(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects non-PDF file', () => {
    const result = validatePdf(makePdf(1024, 'image/png'));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('PDF');
  });

  it('rejects PDF over 10 MB', () => {
    const result = validatePdf(makePdf(10 * 1024 * 1024 + 1));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10 MB');
  });
});

describe('validateRegistroForm', () => {
  const validData: RegistroFormData = {
    nit: '123456789-0',
    razonSocial: 'Empresa S.A.',
    representanteLegal: 'Juan Pérez',
    correoElectronico: 'juan@empresa.com',
    documentoCamara: makePdf(),
  };

  it('returns no errors for valid data', () => {
    expect(Object.keys(validateRegistroForm(validData))).toHaveLength(0);
  });

  it('returns errors for all empty fields', () => {
    const errors = validateRegistroForm({
      nit: '',
      razonSocial: '',
      representanteLegal: '',
      correoElectronico: '',
      documentoCamara: null,
    });
    expect(Object.keys(errors)).toHaveLength(5);
  });

  it('returns error count matching number of invalid fields', () => {
    const errors = validateRegistroForm({
      ...validData,
      nit: 'bad',
      correoElectronico: 'bad',
    });
    expect(Object.keys(errors)).toHaveLength(2);
    expect(errors.nit).toBeDefined();
    expect(errors.correoElectronico).toBeDefined();
  });
});
