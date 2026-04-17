import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatHttpResponse, type RespuestaPrueba } from '../http-utils';

// --- Generators ---

const statusCodeArb = fc.integer({ min: 100, max: 599 });

const headerKeyArb = fc.stringMatching(/^[A-Za-z][A-Za-z0-9-]{0,30}$/);
const headerValueArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => !s.includes('\n') && !s.includes('\r'));

const headersArb = fc.dictionary(headerKeyArb, headerValueArb, { minKeys: 0, maxKeys: 10 });

const jsonPrimitiveArb = fc.oneof(
  fc.string({ maxLength: 50 }),
  fc.integer(),
  fc.double({ noNaN: true, noDefaultInfinity: true }),
  fc.boolean(),
  fc.constant(null),
);

const bodyArb = fc.oneof(
  jsonPrimitiveArb,
  fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), jsonPrimitiveArb, { maxKeys: 5 }),
  fc.array(jsonPrimitiveArb, { maxLength: 5 }),
);

const durationMsArb = fc.integer({ min: 0, max: 30000 });

const respuestaPruebaArb = fc.record<RespuestaPrueba>({
  statusCode: statusCodeArb,
  headers: headersArb,
  body: bodyArb,
  durationMs: durationMsArb,
});

describe('Feature: bolivar-api-developer-portal, Property 6: Formateo de respuesta HTTP incluye todos los campos', () => {
  /**
   * **Validates: Requirements 6.3**
   *
   * Para cualquier RespuestaPrueba con statusCode, headers y body arbitrarios,
   * la función de formateo SHALL producir un output que incluya el código de
   * estado HTTP, los encabezados de respuesta y el cuerpo JSON.
   */

  it('formatted output contains the HTTP status code', () => {
    fc.assert(
      fc.property(respuestaPruebaArb, (response) => {
        const output = formatHttpResponse(response);
        expect(output).toContain(`HTTP ${response.statusCode}`);
      }),
      { numRuns: 100 },
    );
  });

  it('formatted output contains all header key-value pairs', () => {
    fc.assert(
      fc.property(respuestaPruebaArb, (response) => {
        const output = formatHttpResponse(response);
        for (const [key, value] of Object.entries(response.headers)) {
          expect(output).toContain(`${key}: ${value}`);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('formatted output contains the body content', () => {
    fc.assert(
      fc.property(respuestaPruebaArb, (response) => {
        const output = formatHttpResponse(response);
        const expectedBody = typeof response.body === 'string'
          ? response.body
          : JSON.stringify(response.body, null, 2);
        expect(output).toContain(expectedBody);
      }),
      { numRuns: 100 },
    );
  });
});
