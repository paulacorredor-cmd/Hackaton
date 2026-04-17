'use client';

/**
 * Contexto global para credenciales de sandbox.
 *
 * Permite que las credenciales generadas durante el onboarding se propaguen
 * al Visor de Documentación y al AI Playground sin necesidad de re-fetch.
 *
 * Las credenciales se persisten en sessionStorage para sobrevivir a
 * navegaciones dentro de la misma sesión del navegador.
 *
 * Requisitos: 4.1, 6.4, 8.6
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

export interface SandboxCredentials {
  clientId: string;
  clientSecret: string;
  createdAt: string;
}

interface SandboxContextValue {
  /** Credenciales sandbox actuales (null si no se han generado) */
  credentials: SandboxCredentials | null;
  /** Almacena nuevas credenciales en el contexto y sessionStorage */
  setCredentials: (creds: SandboxCredentials) => void;
  /** Limpia las credenciales (al cerrar sesión) */
  clearCredentials: () => void;
}

const STORAGE_KEY = 'bolivar_sandbox_credentials';

const SandboxContext = createContext<SandboxContextValue>({
  credentials: null,
  setCredentials: () => {},
  clearCredentials: () => {},
});

/**
 * Hook para acceder a las credenciales sandbox desde cualquier componente.
 */
export function useSandboxCredentials(): SandboxContextValue {
  return useContext(SandboxContext);
}

/**
 * Provider que envuelve la aplicación y gestiona las credenciales sandbox.
 */
export function SandboxProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentialsState] = useState<SandboxCredentials | null>(null);

  // Hidratar desde sessionStorage al montar
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SandboxCredentials;
        if (parsed.clientId && parsed.clientSecret && parsed.createdAt) {
          setCredentialsState(parsed);
        }
      }
    } catch {
      // sessionStorage no disponible o datos corruptos — ignorar
    }
  }, []);

  const setCredentials = useCallback((creds: SandboxCredentials) => {
    setCredentialsState(creds);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    } catch {
      // sessionStorage no disponible — solo mantener en memoria
    }
  }, []);

  const clearCredentials = useCallback(() => {
    setCredentialsState(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignorar
    }
  }, []);

  return (
    <SandboxContext.Provider value={{ credentials, setCredentials, clearCredentials }}>
      {children}
    </SandboxContext.Provider>
  );
}
