import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateNit } from '../validation';

// --- Generators ---

const DIGITS = '0123456789'.split('');

/** Generates a valid NIT: exactly 9 digits, hyphen, 1 verification digit. */
const validNit = fc
  .tuple(
    fc.array(fc.constantFrom(...DIGITS), { minLength: 9, maxLength: 9 }),
    fc.constantFrom(...DIGITS),
  )
  .map(([digits, check]) => `${digits.join('')}-${check}`);

/** Generates a string that does NOT match ^\d{9}-\d{1}$. */
const invalidNit = fc.oneof(
  // Empty string
  fc.constant(''),
  // Only whitespace
  fc.array(fc.constant(' '), { minLength: 1, maxLength: 5 }).map((a) => a.join('')),
  // Too few digits before hyphen (1–8 digits)
  fc.integer({ min: 1, max: 8 }).chain((len) =>
    fc.tuple(
      fc.array(fc.constantFrom(...DIGITS), { minLength: len, maxLength: len }),
      fc.constantFrom(...DIGITS),
    ).map(([d, c]) => `${d.join('')}-${c}`),
  ),
  // Too many digits before hyphen (10–15 digits)
  fc.integer({ min: 10, max: 15 }).chain((len) =>
    fc.tuple(
      fc.array(fc.constantFrom(...DIGITS), { minLength: len, maxLength: len }),
      fc.constantFrom(...DIGITS),
    ).map(([d, c]) => `${d.join('')}-${c}`),
  ),
  // Missing hyphen — 10 consecutive digits
  fc.array(fc.constantFrom(...DIGITS), { minLength: 10, maxLength: 10 }).map((d) => d.join('')),
  // Multiple verification digits after hyphen (2+)
  fc.tuple(
    fc.array(fc.constantFrom(...DIGITS), { minLength: 9, maxLength: 9 }),
    fc.array(fc.constantFrom(...DIGITS), { minLength: 2, maxLength: 4 }),
  ).map(([d, c]) => `${d.join('')}-${c.join('')}`),
  // Contains letters
  fc.tuple(
    fc.array(fc.constantFrom(...DIGITS), { minLength: 4, maxLength: 8 }),
    fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 3 }),
  ).map(([d, a]) => `${d.join('')}${a.join('')}-0`),
  // Leading/trailing spaces around valid pattern
  fc.tuple(
    fc.array(fc.constantFrom(...DIGITS), { minLength: 9, maxLength: 9 }),
    fc.constantFrom(...DIGITS),
    fc.constantFrom(' ', '  '),
  ).map(([d, c, sp]) => `${sp}${d.join('')}-${c}${sp}`),
);

describe('Feature: bolivar-api-developer-portal, Property 2: Validación de formato NIT acepta solo el patrón correcto', () => {
  /**
   * **Validates: Requirements 2.6**
   *
   * Para cualquier string, la función de validación de NIT SHALL retornar válido
   * si y solo si el string cumple el patrón ^\d{9}-\d{1}$ (9 dígitos, guión,
   * 1 dígito de verificación). Cualquier string que no cumpla este patrón debe
   * ser rechazado.
   */

  it('accepts any string matching the pattern ^\\d{9}-\\d{1}$', () => {
    fc.assert(
      fc.property(validNit, (nit) => {
        expect(validateNit(nit)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('rejects any string NOT matching the pattern ^\\d{9}-\\d{1}$', () => {
    fc.assert(
      fc.property(invalidNit, (nit) => {
        expect(validateNit(nit)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
