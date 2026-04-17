import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import PanelChat from '../../components/playground/PanelChat';
import type { MensajeChat } from '../playground';

afterEach(() => {
  cleanup();
});

// --- Generators ---

const rolArb = fc.constantFrom<MensajeChat['rol']>('socio', 'agente');

/** Safe printable string generator to ensure text is findable in the DOM. */
const safeStringArb = (minLen: number, maxLen: number) =>
  fc
    .array(
      fc.constantFrom(
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split(''),
      ),
      { minLength: minLen, maxLength: maxLen },
    )
    .map((chars) => chars.join(''));

/**
 * Generator for MensajeChat with unique content per message to allow
 * unambiguous DOM lookup.
 */
const mensajeChatArb = (index: number): fc.Arbitrary<MensajeChat> =>
  fc.record<MensajeChat>({
    id: fc.constant(`msg-${index}`),
    rol: rolArb,
    contenido: safeStringArb(5, 40).map((s) => `${s}IDX${index}`),
    timestamp: fc.constant(new Date(2024, 0, 15, 10, 30, index).toISOString()),
  });

/**
 * Generates an array of MensajeChat with unique IDs and unique content suffixes
 * so each message can be individually located in the rendered output.
 */
const mensajesArrayArb = fc
  .integer({ min: 1, max: 15 })
  .chain((len) =>
    fc.tuple(...Array.from({ length: len }, (_, i) => mensajeChatArb(i))),
  );

describe('Feature: bolivar-api-developer-portal, Property 8: Historial de chat preserva orden y contenido', () => {
  /**
   * **Validates: Requirements 8.3**
   *
   * Para cualquier array de MensajeChat, el renderizado del Panel_Chat SHALL
   * mostrar todos los mensajes en el mismo orden en que fueron proporcionados,
   * con el rol y contenido correctos para cada mensaje.
   */

  it('all messages are rendered in the same order with correct role and content', () => {
    fc.assert(
      fc.property(mensajesArrayArb, (mensajes) => {
        cleanup();

        const { container } = render(
          <PanelChat
            mensajes={mensajes}
            onEnviarMensaje={vi.fn().mockResolvedValue(undefined)}
            cargando={false}
          />,
        );

        // Each message renders as an article with aria-label indicating the role
        const articles = container.querySelectorAll('[role="article"]');

        // 1. All messages must be rendered — same count
        expect(articles.length).toBe(mensajes.length);

        // 2. Order and content: iterate in order and verify each article
        mensajes.forEach((mensaje, idx) => {
          const article = articles[idx];

          // Verify role via aria-label
          const expectedLabel =
            mensaje.rol === 'socio' ? 'Mensaje de socio' : 'Mensaje de agente';
          expect(article.getAttribute('aria-label')).toBe(expectedLabel);

          // Verify content text is present inside the article
          const paragraph = article.querySelector('p');
          expect(paragraph).not.toBeNull();
          expect(paragraph!.textContent).toBe(mensaje.contenido);
        });

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
