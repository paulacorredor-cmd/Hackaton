import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateRegistroForm,
  type RegistroFormData,
} from '../validation';

// --- Helpers: valid generators ---

const DIGITS = '0123456789'.split('');
const ALPHA = 'abcdefghijklmnopqrstuvwxyz'.split('');

/** Generates a valid NIT: exactly 9 digits, hyphen, 1 digit. */
const validNit = fc
  .tuple(
    fc.array(fc.constantFrom(...DIGITS), { minLength: 9, maxLength: 9 }),
    fc.constantFrom(...DIGITS),
  )
  .map(([digits, check]) => `${digits.join('')}-${check}`);

/** Generates a non-empty string within a max length. */
function validText(maxLen: number): fc.Arbitrary<string> {
  return fc
    .array(fc.constantFrom(...ALPHA), { minLength: 1, maxLength: Math.min(maxLen, 50) })
    .map((chars) => chars.join(''));
}

/** Generates a structurally valid email address. */
const validEmail = fc
  .tuple(
    fc.array(fc.constantFrom(...[...ALPHA, ...DIGITS]), { minLength: 1, maxLength: 10 }),
    fc.array(fc.constantFrom(...ALPHA), { minLength: 1, maxLength: 8 }),
    fc.array(fc.constantFrom(...ALPHA), { minLength: 2, maxLength: 4 }),
  )
  .map(([local, domain, tld]) => `${local.join('')}@${domain.join('')}.${tld.join('')}`);

/** Generates a valid PDF File (application/pdf, ≤ 10 MB). */
const validPdf = fc
  .integer({ min: 1, max: 1024 })
  .map((size) => new File([new ArrayBuffer(size)], 'camara.pdf', { type: 'application/pdf' }));

// --- Helpers: invalid generators ---

/** Generates an invalid NIT (empty or wrong format). */
const invalidNit = fc.oneof(
  fc.constant(''),
  // Too few digits (1-8)
  fc.array(fc.constantFrom(...DIGITS), { minLength: 1, maxLength: 8 }).map((d) => `${d.join('')}-0`),
  // Too many digits (10-12)
  fc.array(fc.constantFrom(...DIGITS), { minLength: 10, maxLength: 12 }).map((d) => `${d.join('')}-0`),
  // Letters only — no valid NIT pattern
  fc.array(fc.constantFrom(...ALPHA), { minLength: 1, maxLength: 5 }).map((c) => c.join('')),
);

/** Generates an invalid text field: empty, whitespace-only, or exceeds max length. */
function invalidText(maxLen: number): fc.Arbitrary<string> {
  return fc.oneof(
    fc.constant(''),
    fc.constant('   '),
    fc.array(fc.constantFrom(...ALPHA), { minLength: maxLen + 1, maxLength: maxLen + 20 }).map((c) => c.join('')),
  );
}

/** Generates an invalid email. */
const invalidEmail = fc.oneof(
  fc.constant(''),
  fc.array(fc.constantFrom(...ALPHA), { minLength: 1, maxLength: 10 }).map((c) => c.join('')), // no @
  fc.constant('@nodomain'),
);

/** Generates an invalid document (null, wrong type, or oversized). */
const invalidDoc: fc.Arbitrary<File | null> = fc.oneof(
  fc.constant(null),
  fc.constant(new File([new ArrayBuffer(1024)], 'doc.png', { type: 'image/png' })),
  fc.constant(new File([new ArrayBuffer(10 * 1024 * 1024 + 1)], 'big.pdf', { type: 'application/pdf' })),
);

// --- Field definitions for combinatorial generation ---

type FieldName = keyof RegistroFormData;

interface FieldDef {
  name: FieldName;
  valid: fc.Arbitrary<any>;
  invalid: fc.Arbitrary<any>;
}

const fieldDefs: FieldDef[] = [
  { name: 'nit', valid: validNit, invalid: invalidNit },
  { name: 'razonSocial', valid: validText(200), invalid: invalidText(200) },
  { name: 'representanteLegal', valid: validText(150), invalid: invalidText(150) },
  { name: 'correoElectronico', valid: validEmail, invalid: invalidEmail },
  { name: 'documentoCamara', valid: validPdf, invalid: invalidDoc },
];

/**
 * Generates a RegistroFormData where a specific subset of fields are invalid.
 * Returns [formData, numberOfInvalidFields].
 */
function formWithInvalidFields(invalidMask: boolean[]): fc.Arbitrary<[RegistroFormData, number]> {
  const arbs = fieldDefs.map((f, i) => (invalidMask[i] ? f.invalid : f.valid));
  const invalidCount = invalidMask.filter(Boolean).length;

  return fc.tuple(...(arbs as [fc.Arbitrary<any>, ...fc.Arbitrary<any>[]])).map(
    ([nit, razonSocial, representanteLegal, correoElectronico, documentoCamara]) => [
      { nit, razonSocial, representanteLegal, correoElectronico, documentoCamara } as RegistroFormData,
      invalidCount,
    ],
  );
}

/**
 * Generates all possible non-empty subsets of invalid field masks (at least 1 invalid field).
 * There are 2^5 - 1 = 31 possible masks.
 */
function invalidMaskArb(): fc.Arbitrary<boolean[]> {
  return fc
    .tuple(fc.boolean(), fc.boolean(), fc.boolean(), fc.boolean(), fc.boolean())
    .filter((mask) => mask.some(Boolean))
    .map((tuple) => [...tuple]);
}

describe('Feature: bolivar-api-developer-portal, Property 1: Validación de formulario de registro rechaza datos inválidos', () => {
  /**
   * **Validates: Requirements 2.5**
   *
   * Para cualquier combinación de datos de formulario de registro donde al menos un campo
   * es vacío o tiene formato inválido, la función de validación SHALL retornar un objeto
   * de errores que contenga un mensaje específico para cada campo inválido, y el número
   * de errores debe ser igual al número de campos inválidos.
   */
  it('error count equals the number of invalid fields for any combination of invalid inputs', () => {
    fc.assert(
      fc.property(
        invalidMaskArb().chain((mask) => formWithInvalidFields(mask)),
        ([formData, expectedInvalidCount]) => {
          const errors = validateRegistroForm(formData);
          const errorKeys = Object.keys(errors);

          // The number of errors must equal the number of invalid fields
          expect(errorKeys.length).toBe(expectedInvalidCount);

          // Each error must have a non-empty message string
          for (const key of errorKeys) {
            expect(typeof errors[key as FieldName]).toBe('string');
            expect((errors[key as FieldName] as string).length).toBeGreaterThan(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
