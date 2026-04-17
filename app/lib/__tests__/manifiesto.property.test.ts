import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  generarManifiestoAI,
  filtrarApisPorLinea,
  type ApiDefinition,
  type LineaSeguro,
} from '../catalogo';

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

describe('Feature: bolivar-api-developer-portal, Property 7: Generación de manifiesto AI con filtrado correcto', () => {
  /**
   * **Validates: Requirements 7.2, 7.4**
   *
   * Para cualquier array de ApiDefinition y para cualquier filtro de línea activo,
   * la función de generación de manifiesto SHALL producir un JSON con estructura
   * válida de GPT-4 Tools (cada tool con type, function.name, function.description,
   * function.parameters y function.ai_capability) que incluya únicamente las APIs
   * que pasan el filtro activo.
   */

  it('manifest has schema_version "1.0"', () => {
    fc.assert(
      fc.property(apiArrayArb, filtroArb, (apis, filtro) => {
        const manifest = generarManifiestoAI(apis, filtro);
        expect(manifest.schema_version).toBe('1.0');
      }),
      { numRuns: 100 },
    );
  });

  it('each tool has type "function" with function.name, function.description, function.parameters and function.ai_capability', () => {
    fc.assert(
      fc.property(apiArrayArb, filtroArb, (apis, filtro) => {
        const manifest = generarManifiestoAI(apis, filtro);

        for (const tool of manifest.tools) {
          expect(tool.type).toBe('function');
          expect(tool.function).toBeDefined();
          expect(typeof tool.function.name).toBe('string');
          expect(typeof tool.function.description).toBe('string');
          expect(tool.function.parameters).toBeDefined();
          expect(typeof tool.function.parameters).toBe('object');
          expect(typeof tool.function.ai_capability).toBe('string');
        }
      }),
      { numRuns: 100 },
    );
  });

  it('number of tools equals the number of APIs that pass the filter', () => {
    fc.assert(
      fc.property(apiArrayArb, filtroArb, (apis, filtro) => {
        const manifest = generarManifiestoAI(apis, filtro);
        const expectedApis = filtrarApisPorLinea(apis, filtro);
        expect(manifest.tools).toHaveLength(expectedApis.length);
      }),
      { numRuns: 100 },
    );
  });

  it('only filtered APIs appear in the manifest, preserving order and content', () => {
    fc.assert(
      fc.property(apiArrayArb, filtroArb, (apis, filtro) => {
        const manifest = generarManifiestoAI(apis, filtro);
        const expectedApis = filtrarApisPorLinea(apis, filtro);

        expect(manifest.tools).toHaveLength(expectedApis.length);

        for (let i = 0; i < expectedApis.length; i++) {
          const tool = manifest.tools[i];
          const api = expectedApis[i];

          expect(tool.function.name).toBe(api.nombre);
          expect(tool.function.description).toBe(api.descripcionSemantica);
          expect(tool.function.ai_capability).toBe(api.aiCapability);
        }
      }),
      { numRuns: 100 },
    );
  });
});
