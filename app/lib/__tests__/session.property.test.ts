/**
 * Test de propiedad para expiración de sesión por inactividad.
 *
 * Feature: bolivar-api-developer-portal, Property 10: Expiración de sesión por inactividad
 *
 * Verifica que para cualquier par de timestamps (última actividad, momento actual),
 * isSessionExpired retorna true si la inactividad es ≥ 15 minutos, y false si es < 15 minutos.
 *
 * **Validates: Requirements 10.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isSessionExpired, SESSION_TIMEOUT_MS } from '@/app/lib/session';

describe('Propiedad 10: Expiración de sesión por inactividad', () => {
  /**
   * **Validates: Requirements 10.4**
   *
   * Para cualquier lastActivity y currentTime donde (currentTime - lastActivity) >= SESSION_TIMEOUT_MS,
   * isSessionExpired debe retornar true.
   */
  it('debe retornar true cuando la inactividad es >= 15 minutos', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 1_000_000_000_000 }),
        fc.nat({ max: 86_400_000 }),
        (lastActivity, extraMs) => {
          const currentTime = lastActivity + SESSION_TIMEOUT_MS + extraMs;
          expect(isSessionExpired(lastActivity, currentTime)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 10.4**
   *
   * Para cualquier lastActivity y currentTime donde (currentTime - lastActivity) < SESSION_TIMEOUT_MS,
   * isSessionExpired debe retornar false.
   */
  it('debe retornar false cuando la inactividad es < 15 minutos', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 1_000_000_000_000 }),
        fc.nat({ max: SESSION_TIMEOUT_MS - 1 }),
        (lastActivity, inactivityMs) => {
          const currentTime = lastActivity + inactivityMs;
          expect(isSessionExpired(lastActivity, currentTime)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});
