import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { filtrarApisPorLinea, type ApiDefinition, type LineaSeguro } from '../catalogo';

// --- Generators ---

const LINEAS_SEGURO: LineaSeguro[] = ['vida', 'hogar', 'autos', 'salud'];

const lineaSeguroArb = fc.constantFrom<LineaSeguro>(...LINEAS_SEGURO);

const apiDefinitionArb = fc.record<ApiDefinition>({
  id: fc.uuid(),
  nombre: fc.string({ minLength: 1, maxLength: 50 }),
  descripcionSemantica: fc.string({ minLength: 1, maxLength: 200 }),
  lineaSeguro: lineaSeguroArb,
  aiCapability: fc.string({ minLength: 1, maxLength: 50 }),
  specUrl: fc.webUrl(),
});

const apiArrayArb = fc.array(apiDefinitionArb, { minLength: 0, maxLength: 30 });

const filtroArb = fc.oneof(
  fc.constant('todas' as const),
  lineaSeguroArb,
);

describe('Feature: bolivar-api-developer-portal, Property 4: Clasificación y filtrado de APIs por línea de seguro', () => {
  /**
   * **Validates: Requirements 5.1, 5.4**
   *
   * Para cualquier array de ApiDefinition con líneas de seguro asignadas y
   * para cualquier filtro de línea seleccionado, la función de filtrado SHALL
   * retornar exactamente las APIs cuya lineaSeguro coincide con el filtro,
   * sin omitir ninguna y sin incluir APIs de otras líneas. Cuando el filtro
   * es 'todas', SHALL retornar todas las APIs.
   */

  it('returns all APIs when filter is "todas"', () => {
    fc.assert(
      fc.property(apiArrayArb, (apis) => {
        const result = filtrarApisPorLinea(apis, 'todas');
        expect(result).toHaveLength(apis.length);
        expect(result).toEqual(apis);
      }),
      { numRuns: 100 },
    );
  });

  it('returns only APIs matching the selected LineaSeguro, with no omissions and no extras', () => {
    fc.assert(
      fc.property(apiArrayArb, lineaSeguroArb, (apis, filtro) => {
        const result = filtrarApisPorLinea(apis, filtro);

        // No extras: every returned API must match the filter
        for (const api of result) {
          expect(api.lineaSeguro).toBe(filtro);
        }

        // No omissions: every API in the input that matches must be in the result
        const expected = apis.filter((a) => a.lineaSeguro === filtro);
        expect(result).toHaveLength(expected.length);
        expect(result).toEqual(expected);
      }),
      { numRuns: 100 },
    );
  });
});
