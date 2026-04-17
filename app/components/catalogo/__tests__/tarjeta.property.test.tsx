import { render, within, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import TarjetaApi from '../TarjetaApi';
import type { ApiDefinition, LineaSeguro } from '@/app/lib/catalogo';

afterEach(() => {
  cleanup();
});

// --- Generators ---

const LINEAS_SEGURO: LineaSeguro[] = ['vida', 'hogar', 'autos', 'salud'];

const lineaLabels: Record<LineaSeguro, string> = {
  vida: 'Vida',
  hogar: 'Hogar',
  autos: 'Autos',
  salud: 'Salud',
};

const lineaSeguroArb = fc.constantFrom<LineaSeguro>(...LINEAS_SEGURO);

/** Safe non-empty string generator: only printable ASCII, no whitespace-only */
const safeStringArb = (minLen: number, maxLen: number) =>
  fc
    .array(
      fc.constantFrom(
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '.split(''),
      ),
      { minLength: minLen, maxLength: maxLen },
    )
    .map((chars) => chars.join(''))
    .filter((s) => s.trim().length > 0);

/**
 * Generator for valid ApiDefinition objects.
 * Uses safe printable strings to ensure text is findable in the DOM.
 */
const apiDefinitionArb: fc.Arbitrary<ApiDefinition> = fc.record<ApiDefinition>({
  id: fc.uuid(),
  nombre: safeStringArb(2, 30),
  descripcionSemantica: safeStringArb(5, 80),
  lineaSeguro: lineaSeguroArb,
  aiCapability: fc.string({ minLength: 1, maxLength: 50 }),
  specUrl: fc.constant('/specs/test.yaml'),
});

describe('Feature: bolivar-api-developer-portal, Property 5: Tarjeta API contiene información requerida', () => {
  /**
   * **Validates: Requirements 5.3**
   *
   * Para cualquier ApiDefinition válida, el renderizado de TarjetaApi SHALL
   * producir un output que contenga el nombre de la API, la descripción
   * semántica (x-ai-description) y el indicador de línea de seguro.
   */

  it('rendered TarjetaApi contains the API name, semantic description, and insurance line indicator', () => {
    fc.assert(
      fc.property(apiDefinitionArb, (api) => {
        cleanup();
        const { container } = render(<TarjetaApi api={api} onClick={vi.fn()} />);
        const article = within(container).getByRole('button');

        // 1. The API name must appear as an h3 heading
        const heading = within(article).getByRole('heading', { level: 3 });
        expect(heading).toHaveTextContent(api.nombre);

        // 2. The semantic description (x-ai-description) must be visible in the paragraph
        const paragraph = article.querySelector('p');
        expect(paragraph).not.toBeNull();
        expect(paragraph!.textContent).toBe(api.descripcionSemantica);

        // 3. The insurance line indicator label must be present in the badge span
        const expectedLabel = lineaLabels[api.lineaSeguro];
        const spans = article.querySelectorAll('span');
        const badgeTexts = Array.from(spans).map((s) => s.textContent?.trim());
        expect(badgeTexts).toContain(expectedLabel);

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
