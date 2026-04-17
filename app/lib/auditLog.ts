/**
 * Sistema de log de auditoría para el portal de desarrolladores.
 *
 * Registra acciones del socio con timestamp e identificador:
 * - Inicio de sesión (login)
 * - Peticiones al sandbox
 * - Exportación de manifiesto AI
 *
 * En producción, estos registros se enviarían a un backend/base de datos.
 * En esta implementación, se almacenan en memoria y se exponen para testing.
 *
 * Requisitos: 10.5
 */

/** Tipos de acciones auditables */
export type AuditAction =
  | 'login'
  | 'sandbox_request'
  | 'manifest_export'
  | 'session_expired'
  | 'logout';

/** Entrada individual del log de auditoría */
export interface AuditLogEntry {
  id: string;
  socioId: string;
  action: AuditAction;
  details: Record<string, unknown>;
  timestamp: string;
  ip?: string;
}

/** Almacén en memoria del log de auditoría */
let auditLog: AuditLogEntry[] = [];

/** Contador incremental para IDs únicos */
let entryCounter = 0;

/**
 * Genera un ID único para una entrada de auditoría.
 */
function generateAuditId(): string {
  entryCounter += 1;
  return `audit_${Date.now()}_${entryCounter}`;
}

/**
 * Registra una acción del socio en el log de auditoría.
 *
 * @param socioId - Identificador del socio que realiza la acción
 * @param action - Tipo de acción realizada
 * @param details - Detalles adicionales de la acción (endpoint, método, etc.)
 * @param ip - Dirección IP del socio (opcional)
 * @returns La entrada de auditoría creada
 */
export function logAuditAction(
  socioId: string,
  action: AuditAction,
  details: Record<string, unknown> = {},
  ip?: string,
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: generateAuditId(),
    socioId,
    action,
    details,
    timestamp: new Date().toISOString(),
    ip,
  };

  auditLog.push(entry);

  // En producción: enviar a backend/base de datos
  // await db.auditLog.create(entry);

  return entry;
}

/**
 * Obtiene todas las entradas del log de auditoría.
 * Útil para testing y depuración.
 */
export function getAuditLog(): ReadonlyArray<AuditLogEntry> {
  return [...auditLog];
}

/**
 * Obtiene las entradas del log de auditoría filtradas por socio.
 *
 * @param socioId - Identificador del socio
 * @returns Entradas de auditoría del socio especificado
 */
export function getAuditLogBySocio(socioId: string): AuditLogEntry[] {
  return auditLog.filter((entry) => entry.socioId === socioId);
}

/**
 * Limpia el log de auditoría. Solo para uso en tests.
 */
export function clearAuditLog(): void {
  auditLog = [];
  entryCounter = 0;
}
