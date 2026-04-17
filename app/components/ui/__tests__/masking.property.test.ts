import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { maskValue, revealValue } from '../CopyToClipboard';

describe('Feature: bolivar-api-developer-portal, Property 3: Enmascaramiento round-trip de secretos', () => {
  /**
   * **Validates: Requirements 4.4**
   *
   * Para cualquier string secreto, aplicar la función de enmascaramiento SHALL producir
   * un resultado que no contenga ningún carácter del string original (excepto el carácter
   * de máscara), y aplicar la función de revelación al mismo string SHALL retornar el
   * valor original sin modificaciones.
   */
  it('masked output contains no characters from the original string (except the mask character)', () => {
    const maskChar = '•';

    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s !== maskChar.repeat(s.length)),
        (secret) => {
          const masked = maskValue(secret, maskChar);

          // Every character in the masked output must be the mask character
          for (const ch of masked) {
            expect(ch).toBe(maskChar);
          }

          // The masked output must not contain any original character
          // (unless that character happens to be the mask character itself)
          for (const ch of secret) {
            if (ch !== maskChar) {
              expect(masked).not.toContain(ch);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('revealValue returns the original value unchanged', () => {
    fc.assert(
      fc.property(fc.string(), (secret) => {
        expect(revealValue(secret)).toBe(secret);
      }),
      { numRuns: 100 },
    );
  });
});
