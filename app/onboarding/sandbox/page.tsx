'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import CopyToClipboard from '@/app/components/ui/CopyToClipboard';
import ErrorMessage from '@/app/components/ui/ErrorMessage';

interface SandboxCredentials {
  clientId: string;
  clientSecret: string;
  createdAt: string;
}

const MAX_RETRIES = 3;

/**
 * Simulates creating sandbox credentials via a backend API call.
 * In production this would POST to /api/sandbox.
 */
async function createSandboxCredentials(): Promise<SandboxCredentials> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Simulate occasional failure (for demo; in production this calls the real API)
  if (Math.random() < 0.15) {
    throw new Error('No se pudo crear la aplicación sandbox. Intente nuevamente.');
  }

  return {
    clientId: `sb_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
    clientSecret: `sk_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };
}

export default function SandboxPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<SandboxCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const creds = await createSandboxCredentials();
      setCredentials(creds);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error inesperado al crear la aplicación sandbox.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRetry() {
    if (retryCount >= MAX_RETRIES) return;
    setRetryCount((prev) => prev + 1);
    fetchCredentials();
  }

  const retriesExhausted = retryCount >= MAX_RETRIES;

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Loader2
          size={48}
          className="mx-auto text-bolivar-green animate-spin"
          aria-hidden="true"
        />
        <p className="mt-4 text-gray-600 font-inter text-sm" role="status" aria-live="polite">
          Creando su aplicación sandbox…
        </p>
      </div>
    );
  }

  // Error state
  if (error && !credentials) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-inter font-bold text-gray-900 mb-2">
          Aplicación Sandbox
        </h1>
        <p className="text-gray-600 font-inter mb-6">
          Ocurrió un problema al crear sus credenciales de sandbox.
        </p>

        <div
          className="bg-red-50 border border-red-200 rounded p-4 mb-6"
          role="alert"
          aria-live="assertive"
        >
          <ErrorMessage message={error} ariaLive="assertive" />

          {!retriesExhausted && (
            <button
              type="button"
              onClick={handleRetry}
              className="
                mt-4 px-6 py-2 rounded font-inter font-semibold text-sm
                bg-bolivar-green text-bolivar-white
                hover:bg-bolivar-green/90 transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
              "
            >
              Reintentar ({MAX_RETRIES - retryCount} intentos restantes)
            </button>
          )}

          {retriesExhausted && (
            <p className="mt-4 text-sm font-inter text-red-700">
              Se agotaron los reintentos. Por favor, contacte a soporte técnico o intente más tarde.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircle size={28} className="text-bolivar-green" aria-hidden="true" />
        <h1 className="text-2xl font-inter font-bold text-gray-900">
          Aplicación Sandbox Creada
        </h1>
      </div>
      <p className="text-gray-600 font-inter mb-8">
        Sus credenciales de sandbox han sido generadas exitosamente. Guárdelas en un lugar seguro.
      </p>

      <div className="space-y-6">
        {/* Client ID */}
        <div>
          <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
            Client ID
          </label>
          <CopyToClipboard
            value={credentials!.clientId}
            ariaLabel="Client ID"
          />
        </div>

        {/* Client Secret — masked by default */}
        <div>
          <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
            Client Secret
          </label>
          <CopyToClipboard
            value={credentials!.clientSecret}
            masked={true}
            ariaLabel="Client Secret"
          />
          <p className="text-xs text-gray-500 font-inter mt-1">
            El secreto se oculta automáticamente tras 5 segundos de ser revelado.
          </p>
        </div>

        {/* Created at */}
        <p className="text-xs text-gray-400 font-inter">
          Creado el: {new Date(credentials!.createdAt).toLocaleString('es-CO')}
        </p>
      </div>

      {/* Warning */}
      <div
        className="mt-8 bg-yellow-50 border border-bolivar-yellow/40 rounded p-4"
        role="note"
      >
        <p className="text-sm font-inter text-gray-700">
          <strong>Importante:</strong> El Client Secret no se mostrará de nuevo. Asegúrese de copiarlo y almacenarlo de forma segura antes de salir de esta página.
        </p>
      </div>

      {/* Continue to catalog */}
      <button
        type="button"
        onClick={() => router.push('/catalogo')}
        className="
          mt-8 w-full py-3 rounded font-inter font-semibold text-sm
          bg-bolivar-green text-bolivar-white
          hover:bg-bolivar-green/90 transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
        "
      >
        Ir al Catálogo de APIs
      </button>
    </div>
  );
}
