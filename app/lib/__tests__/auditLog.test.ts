/**
 * Tests unitarios para el sistema de log de auditoría.
 *
 * Verifica que:
 * - Se registran acciones del socio con timestamp e ID
 * - Se registran los tipos de acción correctos (login, sandbox_request, manifest_export)
 * - Se pueden filtrar entradas por socio
 * - Cada entrada tiene los campos requeridos
 *
 * Requisitos: 10.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  logAuditAction,
  getAuditLog,
  getAuditLogBySocio,
  clearAuditLog,
  type AuditLogEntry,
  type AuditAction,
} from '@/app/lib/auditLog';

describe('logAuditAction — Registro de acciones en log de auditoría', () => {
  beforeEach(() => {
    clearAuditLog();
  });

  it('debe registrar una acción de login con timestamp e ID del socio', () => {
    const entry = logAuditAction('socio-123', 'login', { method: 'oauth' });

    expect(entry.socioId).toBe('socio-123');
    expect(entry.action).toBe('login');
    expect(entry.details).toEqual({ method: 'oauth' });
    expect(entry.timestamp).toBeTruthy();
    expect(entry.id).toMatch(/^audit_/);
  });

  it('debe registrar una acción de petición sandbox', () => {
    const entry = logAuditAction('socio-456', 'sandbox_request', {
      endpoint: '/api/vida/cotizacion',
      method: 'POST',
    });

    expect(entry.socioId).toBe('socio-456');
    expect(entry.action).toBe('sandbox_request');
    expect(entry.details.endpoint).toBe('/api/vida/cotizacion');
    expect(entry.details.method).toBe('POST');
  });

  it('debe registrar una acción de exportación de manifiesto', () => {
    const entry = logAuditAction('socio-789', 'manifest_export', {
      filtro: 'vida',
      apisCount: 3,
    });

    expect(entry.socioId).toBe('socio-789');
    expect(entry.action).toBe('manifest_export');
    expect(entry.details.filtro).toBe('vida');
  });

  it('debe incluir IP cuando se proporciona', () => {
    const entry = logAuditAction(
      'socio-123',
      'login',
      {},
      '192.168.1.100',
    );

    expect(entry.ip).toBe('192.168.1.100');
  });

  it('debe generar IDs únicos para cada entrada', () => {
    const entry1 = logAuditAction('socio-1', 'login');
    const entry2 = logAuditAction('socio-2', 'login');
    const entry3 = logAuditAction('socio-1', 'sandbox_request');

    expect(entry1.id).not.toBe(entry2.id);
    expect(entry2.id).not.toBe(entry3.id);
    expect(entry1.id).not.toBe(entry3.id);
  });

  it('debe generar timestamps en formato ISO 8601', () => {
    const entry = logAuditAction('socio-123', 'login');
    // Verificar que es un ISO string válido
    const parsed = new Date(entry.timestamp);
    expect(parsed.toISOString()).toBe(entry.timestamp);
  });

  it('debe aceptar details vacío por defecto', () => {
    const entry = logAuditAction('socio-123', 'logout');
    expect(entry.details).toEqual({});
  });
});

describe('getAuditLog — Consulta del log completo', () => {
  beforeEach(() => {
    clearAuditLog();
  });

  it('debe retornar un array vacío cuando no hay entradas', () => {
    expect(getAuditLog()).toEqual([]);
  });

  it('debe retornar todas las entradas registradas', () => {
    logAuditAction('socio-1', 'login');
    logAuditAction('socio-2', 'sandbox_request');
    logAuditAction('socio-1', 'manifest_export');

    const log = getAuditLog();
    expect(log).toHaveLength(3);
  });

  it('debe retornar una copia del log (no la referencia interna)', () => {
    logAuditAction('socio-1', 'login');
    const log1 = getAuditLog();
    const log2 = getAuditLog();
    expect(log1).not.toBe(log2);
    expect(log1).toEqual(log2);
  });
});

describe('getAuditLogBySocio — Filtrado por socio', () => {
  beforeEach(() => {
    clearAuditLog();
  });

  it('debe retornar solo las entradas del socio especificado', () => {
    logAuditAction('socio-1', 'login');
    logAuditAction('socio-2', 'login');
    logAuditAction('socio-1', 'sandbox_request');
    logAuditAction('socio-2', 'manifest_export');
    logAuditAction('socio-1', 'logout');

    const socio1Log = getAuditLogBySocio('socio-1');
    expect(socio1Log).toHaveLength(3);
    expect(socio1Log.every((e) => e.socioId === 'socio-1')).toBe(true);

    const socio2Log = getAuditLogBySocio('socio-2');
    expect(socio2Log).toHaveLength(2);
    expect(socio2Log.every((e) => e.socioId === 'socio-2')).toBe(true);
  });

  it('debe retornar array vacío si el socio no tiene entradas', () => {
    logAuditAction('socio-1', 'login');
    expect(getAuditLogBySocio('socio-inexistente')).toEqual([]);
  });
});

describe('clearAuditLog — Limpieza del log', () => {
  beforeEach(() => {
    clearAuditLog();
  });

  it('debe eliminar todas las entradas del log', () => {
    logAuditAction('socio-1', 'login');
    logAuditAction('socio-2', 'sandbox_request');
    expect(getAuditLog()).toHaveLength(2);

    clearAuditLog();
    expect(getAuditLog()).toHaveLength(0);
  });
});
