/**
 * Tests unitarios para el componente SessionGuard.
 *
 * Verifica que:
 * - No renderiza nada cuando no hay sesión activa
 * - No renderiza nada cuando la sesión está activa
 * - Muestra mensaje de expiración y llama onSessionExpired cuando la sesión expira
 * - Registra actividad del usuario al interactuar
 *
 * Requisitos: 10.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SessionGuard from '@/app/components/ui/SessionGuard';
import {
  LAST_ACTIVITY_KEY,
  SESSION_TIMEOUT_MS,
  SESSION_EXPIRED_MESSAGE,
} from '@/app/lib/session';
import { clearAuditLog, getAuditLog } from '@/app/lib/auditLog';

describe('SessionGuard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    clearAuditLog();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no debe renderizar nada cuando socioId es null', () => {
    const onExpired = vi.fn();
    const { container } = render(
      <SessionGuard socioId={null} onSessionExpired={onExpired} />,
    );
    expect(container.innerHTML).toBe('');
    expect(onExpired).not.toHaveBeenCalled();
  });

  it('debe registrar actividad inicial cuando hay socioId', () => {
    const onExpired = vi.fn();
    render(
      <SessionGuard socioId="socio-123" onSessionExpired={onExpired} />,
    );

    const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
    expect(stored).not.toBeNull();
  });

  it('debe mostrar mensaje de expiración cuando la sesión expira por inactividad', async () => {
    const onExpired = vi.fn();

    // Establecer última actividad hace 16 minutos
    const sixteenMinutesAgo = Date.now() - SESSION_TIMEOUT_MS - 60000;
    localStorage.setItem(LAST_ACTIVITY_KEY, sixteenMinutesAgo.toString());

    render(
      <SessionGuard socioId="socio-123" onSessionExpired={onExpired} />,
    );

    // El componente registra actividad inicial, así que necesitamos
    // simular que la actividad fue hace mucho tiempo después del mount
    localStorage.setItem(LAST_ACTIVITY_KEY, sixteenMinutesAgo.toString());

    // Avanzar el timer para que se ejecute la verificación periódica
    await act(async () => {
      vi.advanceTimersByTime(30000); // 30 segundos (intervalo de verificación)
    });

    // Debe mostrar el mensaje de sesión expirada
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Sesión expirada')).toBeTruthy();
    expect(screen.getByText(SESSION_EXPIRED_MESSAGE)).toBeTruthy();

    // Avanzar para que se ejecute el callback de redirección
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('debe registrar la expiración en el log de auditoría', async () => {
    const onExpired = vi.fn();

    const sixteenMinutesAgo = Date.now() - SESSION_TIMEOUT_MS - 60000;
    localStorage.setItem(LAST_ACTIVITY_KEY, sixteenMinutesAgo.toString());

    render(
      <SessionGuard socioId="socio-audit" onSessionExpired={onExpired} />,
    );

    // Forzar la última actividad a hace 16 minutos
    localStorage.setItem(LAST_ACTIVITY_KEY, sixteenMinutesAgo.toString());

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    const log = getAuditLog();
    const expirationEntry = log.find(
      (e) => e.action === 'session_expired' && e.socioId === 'socio-audit',
    );
    expect(expirationEntry).toBeDefined();
    expect(expirationEntry!.details.reason).toBe('inactivity_timeout');
  });

  it('no debe mostrar mensaje cuando la sesión está activa', async () => {
    const onExpired = vi.fn();

    render(
      <SessionGuard socioId="socio-123" onSessionExpired={onExpired} />,
    );

    // Avanzar el timer pero la actividad fue registrada recientemente
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.queryByRole('alert')).toBeNull();
    expect(onExpired).not.toHaveBeenCalled();
  });
});
