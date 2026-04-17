import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import PanelLog from '../../components/playground/PanelLog';
import type { PasoTraza } from '../playground';
import { formatearTimestamp, etiquetaTipoPaso } from '../playground';

afterEach(() => {
  cleanup();
});

// --- Generators ---

const tipoArb = fc.constantFrom<PasoTraza['tipo']>('interpretacion', 'peticion', 'respuesta');

/** Safe printable string generator for unambiguous DOM lookup. */
const safeStringArb = (minLen: number, maxLen: number) =>
  fc
    .array(
      fc.constantFrom(
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split(''),
      ),
      { minLength: minLen, maxLength: maxLen },
    )
    .map((chars) => chars.join(''));

const httpMethodArb = fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH');

const statusCodeArb = fc.integer({ min: 100, max: 599 });

/** Generates contenido matching the given tipo so the expanded section has relevant data. */
const contenidoArb = (tipo: PasoTraza['tipo']) => {
  switch (tipo) {
    case 'interpretacion':
      return safeStringArb(5, 40).map((text) => ({
        interpretacion: text,
      }));
    case 'peticion':
      return fc
        .record({
          endpoint: safeStringArb(3, 20).map((s) => `/api/${s}`),
          method: httpMethodArb,
          headers: fc.constant({ 'Content-Type': 'application/json' }),
          payload: fc.constant({ key: 'value' }),
        })
        .map(({ endpoint, method, headers, payload }) => ({
          endpoint,
          method,
          headers,
          payload,
        }));
    case 'respuesta':
      return fc
        .record({
          statusCode: statusCodeArb,
          respuestaJson: fc.constant({ result: 'ok' }),
        })
        .map(({ statusCode, respuestaJson }) => ({
          statusCode,
          respuestaJson,
        }));
  }
};

/** Generates a valid ISO timestamp string. */
const timestampArb = fc
  .date({
    min: new Date(2020, 0, 1),
    max: new Date(2030, 11, 31),
    noInvalidDate: true,
  })
  .map((d) => d.toISOString());

const duracionMsArb = fc.integer({ min: 0, max: 10000 });

/**
 * Generates a PasoTraza with content matching its tipo.
 * The index parameter ensures unique IDs across generated arrays.
 */
const pasoTrazaArb = (index: number): fc.Arbitrary<PasoTraza> =>
  tipoArb.chain((tipo) =>
    fc
      .record({
        timestamp: timestampArb,
        duracionMs: duracionMsArb,
        contenido: contenidoArb(tipo),
      })
      .map(({ timestamp, duracionMs, contenido }) => ({
        id: `paso-${index}`,
        tipo,
        timestamp,
        duracionMs,
        contenido,
      })),
  );

describe('Feature: bolivar-api-developer-portal, Property 9: Renderizado de pasos de traza incluye información completa', () => {
  /**
   * **Validates: Requirements 8.5, 9.1**
   *
   * Para cualquier PasoTraza con tipo, timestamp, duración y contenido arbitrarios,
   * el renderizado del Panel_Log SHALL incluir la marca de tiempo, la duración en
   * milisegundos y las secciones de contenido correspondientes al tipo de paso
   * (interpretación, petición o respuesta).
   */

  it('each trace step renders timestamp, duration in ms, and type-specific content sections', () => {
    fc.assert(
      fc.property(pasoTrazaArb(0), (paso) => {
        cleanup();

        // Render with the step expanded so content sections are visible
        const { container } = render(
          <PanelLog
            pasos={[paso]}
            pasoExpandido={paso.id}
            onExpandirPaso={vi.fn()}
          />,
        );

        const button = container.querySelector('button');
        expect(button).not.toBeNull();
        const buttonText = button!.textContent ?? '';

        // 1. Timestamp must be present in the header
        const expectedTimestamp = formatearTimestamp(paso.timestamp);
        expect(buttonText).toContain(expectedTimestamp);

        // 2. Duration in ms must be present in the header
        expect(buttonText).toContain(`${paso.duracionMs}ms`);

        // 3. Step type badge must be present
        const expectedBadge = etiquetaTipoPaso(paso.tipo);
        expect(buttonText).toContain(expectedBadge);

        // 4. Expanded content sections must match the step type
        const expandedRegion = container.querySelector(`#paso-contenido-${paso.id}`);
        expect(expandedRegion).not.toBeNull();
        const expandedText = expandedRegion!.textContent ?? '';

        if (paso.tipo === 'interpretacion' && paso.contenido.interpretacion) {
          expect(expandedText).toContain(paso.contenido.interpretacion);
        }

        if (paso.tipo === 'peticion') {
          if (paso.contenido.method && paso.contenido.endpoint) {
            expect(expandedText).toContain(paso.contenido.method);
            expect(expandedText).toContain(paso.contenido.endpoint);
          }
          if (paso.contenido.headers) {
            // Headers are rendered as JSON
            expect(expandedText).toContain('Headers');
          }
          if (paso.contenido.payload !== undefined) {
            expect(expandedText).toContain('Payload');
          }
        }

        if (paso.tipo === 'respuesta') {
          if (paso.contenido.statusCode !== undefined) {
            expect(expandedText).toContain(String(paso.contenido.statusCode));
          }
          if (paso.contenido.respuestaJson !== undefined) {
            expect(expandedText).toContain('Respuesta JSON');
          }
        }

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
