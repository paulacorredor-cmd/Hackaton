/**
 * HTTP utilities for the documentation viewer and sandbox proxy.
 * Provides response formatting, error handling, and sandbox error codes.
 *
 * Requisitos: 6.3, 6.5
 */

// --- Interfaces ---

export interface PeticionPrueba {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface RespuestaPrueba {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  durationMs: number;
}

// --- Sandbox Error Codes ---

export enum SandboxErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface SandboxError {
  code: SandboxErrorCode;
  message: string;
  suggestion: string;
  retryable: boolean;
}

export const ERROR_MESSAGES: Record<SandboxErrorCode, SandboxError> = {
  [SandboxErrorCode.NETWORK_ERROR]: {
    code: SandboxErrorCode.NETWORK_ERROR,
    message: 'No se pudo conectar con el sandbox',
    suggestion: 'Verifique su conexión a internet e intente nuevamente',
    retryable: true,
  },
  [SandboxErrorCode.TIMEOUT]: {
    code: SandboxErrorCode.TIMEOUT,
    message: 'La petición al sandbox excedió el tiempo de espera',
    suggestion: 'Intente con una petición más simple o reintente en unos momentos',
    retryable: true,
  },
  [SandboxErrorCode.UNAUTHORIZED]: {
    code: SandboxErrorCode.UNAUTHORIZED,
    message: 'Las credenciales del sandbox no son válidas',
    suggestion: 'Verifique sus credenciales o genere nuevas desde el panel de onboarding',
    retryable: false,
  },
  [SandboxErrorCode.RATE_LIMITED]: {
    code: SandboxErrorCode.RATE_LIMITED,
    message: 'Se ha excedido el límite de peticiones al sandbox',
    suggestion: 'Espere unos minutos antes de realizar más peticiones',
    retryable: true,
  },
  [SandboxErrorCode.INTERNAL_ERROR]: {
    code: SandboxErrorCode.INTERNAL_ERROR,
    message: 'Error interno del sandbox',
    suggestion: 'Intente nuevamente. Si el problema persiste, contacte soporte',
    retryable: true,
  },
};

// --- Response Formatting ---

/**
 * Formats an HTTP response for display in the documentation viewer.
 * Includes status code, headers, and JSON body.
 */
export function formatHttpResponse(response: RespuestaPrueba): string {
  const statusLine = `HTTP ${response.statusCode}`;
  const headersBlock = Object.entries(response.headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const bodyBlock = typeof response.body === 'string'
    ? response.body
    : JSON.stringify(response.body, null, 2);

  return `${statusLine}\n${headersBlock}\n\n${bodyBlock}`;
}

/**
 * Maps an error status code or network failure to a SandboxError.
 */
export function classifySandboxError(
  statusCode?: number,
  isTimeout?: boolean,
  isNetworkError?: boolean,
): SandboxError {
  if (isNetworkError) return ERROR_MESSAGES[SandboxErrorCode.NETWORK_ERROR];
  if (isTimeout) return ERROR_MESSAGES[SandboxErrorCode.TIMEOUT];
  if (statusCode === 401) return ERROR_MESSAGES[SandboxErrorCode.UNAUTHORIZED];
  if (statusCode === 429) return ERROR_MESSAGES[SandboxErrorCode.RATE_LIMITED];
  return ERROR_MESSAGES[SandboxErrorCode.INTERNAL_ERROR];
}
