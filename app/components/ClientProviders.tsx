'use client';

/**
 * ClientProviders — Envuelve la aplicación con providers del lado del cliente.
 *
 * Integra:
 * - SandboxProvider: propaga credenciales sandbox entre módulos
 * - SessionGuard: monitorea inactividad y cierra sesión automáticamente
 *
 * Se usa en el layout raíz para que todos los módulos tengan acceso
 * a las credenciales y la protección de sesión.
 *
 * Requisitos: 4.1, 8.6, 10.1, 10.4
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { SandboxProvider, useSandboxCredentials } from '@/app/lib/sandboxContext';
import SessionGuard from '@/app/components/ui/SessionGuard';

/**
 * Componente interno que conecta SessionGuard con el contexto de sandbox.
 * Necesita estar dentro del SandboxProvider para acceder a clearCredentials.
 */
function SessionManager({ children }: { children: ReactNode }) {
  const { clearCredentials } = useSandboxCredentials();
  const [socioId, setSocioId] = useState<string | null>(null);

  // Intentar obtener el socioId de sessionStorage (establecido durante onboarding)
  useEffect(() => {
    try {
      const storedSocioId = sessionStorage.getItem('bolivar_socio_id');
      if (storedSocioId) {
        setSocioId(storedSocioId);
      }
    } catch {
      // sessionStorage no disponible
    }
  }, []);

  const handleSessionExpired = useCallback(() => {
    clearCredentials();
    try {
      sessionStorage.removeItem('bolivar_socio_id');
      sessionStorage.removeItem('terminosAceptados');
    } catch {
      // ignorar
    }
    // Redirigir al login
    window.location.href = '/onboarding/registro';
  }, [clearCredentials]);

  return (
    <>
      <SessionGuard socioId={socioId} onSessionExpired={handleSessionExpired} />
      {children}
    </>
  );
}

/**
 * Provider raíz que combina todos los providers del cliente.
 */
export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SandboxProvider>
      <SessionManager>{children}</SessionManager>
    </SandboxProvider>
  );
}
