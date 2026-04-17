/**
 * Tests unitarios para la verificación de expiración de sesión.
 *
 * Verifica que:
 * - La sesión expira cuando la inactividad es ≥ 15 minutos
 * - La sesión permanece activa cuando la inactividad es < 15 minutos
 * - Las funciones de registro y lectura de actividad funcionan correctamente
 *
 * Requisitos: 10.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isSessionExpired,
  SESSION_TIMEOUT_MS,
  recordActivity,
  getLastActivity,
  clearActivity,
  LAST_ACTIVITY_KEY,
  SESSION_EXPIRED_MESSAGE,
} from '@/app/lib/session';

describe('isSessionExpired — Verificación de expiración de sesión', () => {
  it('debe retornar true cuando la inactividad es exactamente 15 minutos', () => {
    const lastActivity = 1000000;
    const now = lastActivity + SESSION_TIMEOUT_MS; // exactamente 15 min
    expect(isSessionExpired(lastActivity, now)).toBe(true);
  });

  it('debe retornar true cuando la inactividad supera 15 minutos', () => {
    const lastActivity = 1000000;
    const now = lastActivity + SESSION_TIMEOUT_MS + 60000; // 16 min
    expect(isSessionExpired(lastActivity, now)).toBe(true);
  });

  it('debe retornar false cuando la inactividad es menor a 15 minutos', () => {
    const lastActivity = 1000000;
    const now = lastActivity + SESSION_TIMEOUT_MS - 1; // 14 min 59.999s
    expect(isSessionExpired(lastActivity, now)).toBe(false);
  });

  it('debe retornar false cuando no ha pasado tiempo (inactividad = 0)', () => {
    const now = Date.now();
    expect(isSessionExpired(now, now)).toBe(false);
  });

  it('debe retornar true cuando la inactividad es muy grande (1 hora)', () => {
    const lastActivity = 1000000;
    const now = lastActivity + 60 * 60 * 1000; // 1 hora
    expect(isSessionExpired(lastActivity, now)).toBe(true);
  });

  it('SESSION_TIMEOUT_MS debe ser 900000 ms (15 minutos)', () => {
    expect(SESSION_TIMEOUT_MS).toBe(15 * 60 * 1000);
    expect(SESSION_TIMEOUT_MS).toBe(900000);
  });

  it('SESSION_EXPIRED_MESSAGE debe contener mensaje informativo', () => {
    expect(SESSION_EXPIRED_MESSAGE).toContain('sesión');
    expect(SESSION_EXPIRED_MESSAGE).toContain('expirado');
    expect(SESSION_EXPIRED_MESSAGE.length).toBeGreaterThan(0);
  });
});

describe('recordActivity / getLastActivity / clearActivity — Gestión de actividad', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('recordActivity debe guardar un timestamp en localStorage', () => {
    const before = Date.now();
    recordActivity();
    const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
    expect(stored).not.toBeNull();
    const timestamp = parseInt(stored!, 10);
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('getLastActivity debe retornar el timestamp almacenado', () => {
    const now = Date.now();
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    expect(getLastActivity()).toBe(now);
  });

  it('getLastActivity debe retornar null si no hay registro', () => {
    expect(getLastActivity()).toBeNull();
  });

  it('getLastActivity debe retornar null si el valor almacenado no es un número', () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, 'not-a-number');
    expect(getLastActivity()).toBeNull();
  });

  it('clearActivity debe eliminar el registro de localStorage', () => {
    recordActivity();
    expect(getLastActivity()).not.toBeNull();
    clearActivity();
    expect(getLastActivity()).toBeNull();
  });
});
