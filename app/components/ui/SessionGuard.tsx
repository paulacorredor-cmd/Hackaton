'use client';

/**
 * SessionGuard — Componente de verificación de sesión por inactividad.
 *
 * Monitorea la actividad del usuario y cierra la sesión automáticamente
 * cuando la inactividad alcanza o supera 15 minutos. Al expirar, redirige
 * al login con un mensaje informativo.
 *
 * Se integra en el layout raíz para proteger toda la aplicación.
 *
 * Requisitos: 10.4
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import {
  isSessionExpired,
  recordActivity,
  getLastActivity,
  clearActivity,
  SESSION_TIMEOUT_MS,
  SESSION_EXPIRED_MESSAGE,
} from '@/app/lib/session';
import { logAuditAction } from '@/app/lib/auditLog';

/** Intervalo de verificación de sesión (cada 30 segundos) */
const CHECK_INTERVAL_MS = 30 * 1000;

/** Eventos del DOM que indican actividad del usuario */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
];

interface SessionGuardProps {
  /** ID del socio autenticado (null si no hay sesión) */
  socioId: string | null;
  /** Callback para cerrar sesión (signOut de NextAuth) */
  onSessionExpired: () => void;
}

export default function SessionGuard({
  socioId,
  onSessionExpired,
}: SessionGuardProps) {
  const [showExpiredMessage, setShowExpiredMessage] = useState(false);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasExpiredRef = useRef(false);

  /**
   * Maneja la expiración de sesión: registra en auditoría,
   * limpia la actividad y redirige al login.
   */
  const handleExpiration = useCallback(() => {
    if (hasExpiredRef.current) return;
    hasExpiredRef.current = true;

    // Registrar expiración en log de auditoría
    if (socioId) {
      logAuditAction(socioId, 'session_expired', {
        reason: 'inactivity_timeout',
      });
    }

    clearActivity();
    setShowExpiredMessage(true);

    // Dar tiempo para que el usuario vea el mensaje antes de redirigir
    setTimeout(() => {
      onSessionExpired();
    }, 2000);
  }, [socioId, onSessionExpired]);

  /**
   * Verifica si la sesión ha expirado comparando la última actividad
   * con el momento actual.
   */
  const checkSession = useCallback(() => {
    if (!socioId || hasExpiredRef.current) return;

    const lastActivity = getLastActivity();
    if (lastActivity === null) {
      // Si no hay registro de actividad, registrar ahora
      recordActivity();
      return;
    }

    if (isSessionExpired(lastActivity, Date.now())) {
      handleExpiration();
    }
  }, [socioId, handleExpiration]);

  /**
   * Registra actividad del usuario al detectar eventos de interacción.
   */
  const handleActivity = useCallback(() => {
    if (!socioId || hasExpiredRef.current) return;
    recordActivity();
  }, [socioId]);

  useEffect(() => {
    if (!socioId) return;

    // Registrar actividad inicial
    recordActivity();
    hasExpiredRef.current = false;

    // Configurar verificación periódica
    checkIntervalRef.current = setInterval(checkSession, CHECK_INTERVAL_MS);

    // Escuchar eventos de actividad del usuario
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      // Limpiar intervalo y listeners
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [socioId, checkSession, handleActivity]);

  if (!showExpiredMessage) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-bolivar-white rounded-lg shadow-xl p-6 mx-4 max-w-md text-center">
        <div className="text-bolivar-yellow mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-inter font-bold text-gray-900 mb-2">
          Sesión expirada
        </h2>
        <p className="text-sm font-inter text-gray-600">
          {SESSION_EXPIRED_MESSAGE}
        </p>
        <p className="text-xs font-inter text-gray-400 mt-3">
          Redirigiendo al inicio de sesión...
        </p>
      </div>
    </div>
  );
}
