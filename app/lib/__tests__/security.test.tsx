/**
 * Tests unitarios de seguridad — Bolívar API Developer Portal
 *
 * Suite dedicada a verificar los comportamientos de seguridad del portal:
 * 1. Enmascaramiento de Client_Secret (Requisito 10.3)
 * 2. Redirección a login por sesión expirada (Requisito 10.4)
 *
 * Requisitos: 10.3, 10.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import CopyToClipboard, {
  maskValue,
  revealValue,
} from '@/app/components/ui/CopyToClipboard';
import SessionGuard from '@/app/components/ui/SessionGuard';
import {
  isSessionExpired,
  SESSION_TIMEOUT_MS,
  LAST_ACTIVITY_KEY,
  SESSION_EXPIRED_MESSAGE,
} from '@/app/lib/session';
import { clearAuditLog } from '@/app/lib/auditLog';

// ─── Mock del clipboard ────────────────────────────────────────────────
const mockWriteText = vi.fn().mockResolvedValue(undefined);

// ═══════════════════════════════════════════════════════════════════════
// 1. ENMASCARAMIENTO DE CLIENT_SECRET
// ═══════════════════════════════════════════════════════════════════════

describe('Seguridad — Enmascaramiento de Client_Secret (Requisito 10.3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
    mockWriteText.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('el Client_Secret debe estar oculto por defecto y no visible en el DOM', () => {
    const secret = 'sk_live_a1b2c3d4e5f6g7h8i9j0';
    render(
      <CopyToClipboard
        value={secret}
        masked={true}
        ariaLabel="Client Secret"
      />,
    );

    // El secreto original NO debe aparecer en el DOM
    expect(screen.queryByText(secret)).not.toBeInTheDocument();

    // Solo deben verse caracteres de máscara
    const maskedText = maskValue(secret);
    expect(screen.getByText(maskedText)).toBeInTheDocument();
  });

  it('la longitud del valor enmascarado debe coincidir con la del secreto original', () => {
    const secret = 'my-super-secret-key-12345';
    const masked = maskValue(secret);
    expect(masked.length).toBe(secret.length);
  });

  it('el valor enmascarado no debe contener ningún carácter del secreto original', () => {
    const secret = 'ClientSecret_ABC123!@#';
    const masked = maskValue(secret);
    const maskChar = '•';

    for (const ch of secret) {
      if (ch !== maskChar) {
        expect(masked).not.toContain(ch);
      }
    }
  });

  it('todos los caracteres del valor enmascarado deben ser el carácter de máscara', () => {
    const secret = 'sk_test_xYz789';
    const masked = maskValue(secret);
    const maskChar = '•';

    for (const ch of masked) {
      expect(ch).toBe(maskChar);
    }
  });

  it('revelar el secreto debe retornar el valor original sin modificaciones', () => {
    const secret = 'sk_live_a1b2c3d4e5f6';
    expect(revealValue(secret)).toBe(secret);
  });

  it('el secreto se revela temporalmente al presionar el botón y se oculta automáticamente', async () => {
    const secret = 'sk_live_reveal_test';
    render(
      <CopyToClipboard
        value={secret}
        masked={true}
        revealDuration={5000}
        ariaLabel="Client Secret"
      />,
    );

    // Inicialmente oculto
    expect(screen.queryByText(secret)).not.toBeInTheDocument();

    // Revelar
    const revealBtn = screen.getByRole('button', { name: /revelar/i });
    await act(async () => {
      revealBtn.click();
    });

    // Ahora visible
    expect(screen.getByText(secret)).toBeInTheDocument();

    // Después de revealDuration, se oculta automáticamente
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText(secret)).not.toBeInTheDocument();
    expect(screen.getByText(maskValue(secret))).toBeInTheDocument();
  });

  it('copiar el secreto debe enviar el valor real al portapapeles, no el enmascarado', async () => {
    const secret = 'sk_live_copy_real_value';
    render(
      <CopyToClipboard
        value={secret}
        masked={true}
        ariaLabel="Client Secret"
      />,
    );

    const copyBtn = screen.getByRole('button', { name: /copiar/i });
    await act(async () => {
      copyBtn.click();
    });

    // Debe copiar el valor real, no los puntos de máscara
    expect(mockWriteText).toHaveBeenCalledWith(secret);
    expect(mockWriteText).not.toHaveBeenCalledWith(maskValue(secret));
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 2. REDIRECCIÓN A LOGIN POR SESIÓN EXPIRADA
// ═══════════════════════════════════════════════════════════════════════

describe('Seguridad — Redirección a login por sesión expirada (Requisito 10.4)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    clearAuditLog();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('isSessionExpired retorna true cuando la inactividad alcanza exactamente 15 minutos', () => {
    const lastActivity = 1_000_000;
    const now = lastActivity + SESSION_TIMEOUT_MS;
    expect(isSessionExpired(lastActivity, now)).toBe(true);
  });

  it('isSessionExpired retorna false cuando la inactividad es menor a 15 minutos', () => {
    const lastActivity = 1_000_000;
    const now = lastActivity + SESSION_TIMEOUT_MS - 1;
    expect(isSessionExpired(lastActivity, now)).toBe(false);
  });

  it('SessionGuard debe redirigir al login cuando la sesión expira por inactividad', async () => {
    const onSessionExpired = vi.fn();

    // Simular última actividad hace 16 minutos
    const sixteenMinutesAgo = Date.now() - SESSION_TIMEOUT_MS - 60_000;
    localStorage.setItem(LAST_ACTIVITY_KEY, sixteenMinutesAgo.toString());

    render(
      <SessionGuard socioId="socio-sec-01" onSessionExpired={onSessionExpired} />,
    );

    // Forzar la última actividad a hace 16 minutos (el mount registra actividad nueva)
    localStorage.setItem(LAST_ACTIVITY_KEY, sixteenMinutesAgo.toString());

    // Avanzar al intervalo de verificación (30s)
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    // Debe mostrar el mensaje de sesión expirada
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Sesión expirada')).toBeInTheDocument();
    expect(screen.getByText(SESSION_EXPIRED_MESSAGE)).toBeInTheDocument();

    // Avanzar para que se ejecute la redirección (callback)
    await act(async () => {
      vi.advanceTimersByTime(2_000);
    });

    // El callback de redirección debe haberse invocado
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('SessionGuard NO debe redirigir cuando la sesión está activa', async () => {
    const onSessionExpired = vi.fn();

    render(
      <SessionGuard socioId="socio-sec-02" onSessionExpired={onSessionExpired} />,
    );

    // Avanzar varios intervalos de verificación (la actividad es reciente)
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });

    // No debe mostrar alerta ni invocar el callback
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('SessionGuard no debe actuar cuando no hay sesión (socioId null)', () => {
    const onSessionExpired = vi.fn();
    const { container } = render(
      <SessionGuard socioId={null} onSessionExpired={onSessionExpired} />,
    );

    // No debe renderizar nada ni invocar el callback
    expect(container.innerHTML).toBe('');
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});
