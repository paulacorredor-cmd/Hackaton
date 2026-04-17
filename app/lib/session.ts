/**
 * Utilidades de verificación de sesión.
 *
 * Implementa la lógica de expiración de sesión por inactividad:
 * una sesión se considera expirada si la inactividad es ≥ 15 minutos.
 *
 * Requisitos: 10.4
 */

/** Tiempo máximo de inactividad en milisegundos (15 minutos) */
export const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

/** Clave de localStorage para almacenar la última actividad */
export const LAST_ACTIVITY_KEY = 'bolivar_last_activity';

/** Mensaje informativo mostrado al expirar la sesión */
export const SESSION_EXPIRED_MESSAGE =
  'Su sesión ha expirado por inactividad. Por favor, inicie sesión nuevamente.';

/**
 * Verifica si la sesión ha expirado por inactividad.
 *
 * @param lastActivityTimestamp - Timestamp (ms) de la última actividad registrada
 * @param currentTimestamp - Timestamp (ms) del momento actual
 * @returns `true` si la sesión está expirada (inactividad ≥ 15 minutos), `false` si está activa
 */
export function isSessionExpired(
  lastActivityTimestamp: number,
  currentTimestamp: number,
): boolean {
  const inactivityMs = currentTimestamp - lastActivityTimestamp;
  return inactivityMs >= SESSION_TIMEOUT_MS;
}

/**
 * Registra la actividad actual del usuario en localStorage.
 */
export function recordActivity(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }
}

/**
 * Obtiene el timestamp de la última actividad registrada.
 *
 * @returns Timestamp en ms de la última actividad, o `null` si no hay registro
 */
export function getLastActivity(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!stored) return null;
  const parsed = parseInt(stored, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Limpia el registro de actividad (usado al cerrar sesión).
 */
export function clearActivity(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  }
}
