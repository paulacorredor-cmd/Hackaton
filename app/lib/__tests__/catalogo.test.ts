import { describe, it, expect } from 'vitest';
import {
  filtrarApisPorLinea,
  generarManifiestoAI,
  type ApiDefinition,
  type LineaSeguro,
} from '../catalogo';

const sampleApis: ApiDefinition[] = [
  {
    id: 'api-vida-1',
    nombre: 'Cotización Vida',
    descripcionSemantica: 'Genera cotizaciones de seguros de vida',
    lineaSeguro: 'vida',
    aiCapability: 'quote_life_insurance',
    specUrl: '/specs/vida-cotizacion.yaml',
  },
  {
    id: 'api-hogar-1',
    nombre: 'Póliza Hogar',
    descripcionSemantica: 'Gestiona pólizas de seguros de hogar',
    lineaSeguro: 'hogar',
    aiCapability: 'manage_home_policy',
    specUrl: '/specs/hogar-poliza.yaml',
  },
  {
    id: 'api-autos-1',
    nombre: 'Siniestro Autos',
    descripcionSemantica: 'Reporta siniestros de seguros de autos',
    lineaSeguro: 'autos',
    aiCapability: 'report_auto_claim',
    specUrl: '/specs/autos-siniestro.yaml',
  },
  {
    id: 'api-salud-1',
    nombre: 'Autorización Salud',
    descripcionSemantica: 'Solicita autorizaciones de servicios de salud',
    lineaSeguro: 'salud',
    aiCapability: 'request_health_auth',
    specUrl: '/specs/salud-autorizacion.yaml',
  },
  {
    id: 'api-vida-2',
    nombre: 'Beneficiarios Vida',
    descripcionSemantica: 'Gestiona beneficiarios de pólizas de vida',
    lineaSeguro: 'vida',
    aiCapability: 'manage_life_beneficiaries',
    specUrl: '/specs/vida-beneficiarios.yaml',
  },
];

describe('filtrarApisPorLinea', () => {
  it('returns all APIs when filter is "todas"', () => {
    const result = filtrarApisPorLinea(sampleApis, 'todas');
    expect(result).toEqual(sampleApis);
    expect(result).toHaveLength(5);
  });

  it('returns only vida APIs when filter is "vida"', () => {
    const result = filtrarApisPorLinea(sampleApis, 'vida');
    expect(result).toHaveLength(2);
    expect(result.every((api) => api.lineaSeguro === 'vida')).toBe(true);
  });

  it('returns only hogar APIs when filter is "hogar"', () => {
    const result = filtrarApisPorLinea(sampleApis, 'hogar');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('api-hogar-1');
  });

  it('returns empty array when no APIs match the filter', () => {
    const vidasOnly: ApiDefinition[] = sampleApis.filter((a) => a.lineaSeguro === 'vida');
    const result = filtrarApisPorLinea(vidasOnly, 'salud');
    expect(result).toHaveLength(0);
  });

  it('returns empty array when input is empty', () => {
    const result = filtrarApisPorLinea([], 'autos');
    expect(result).toHaveLength(0);
  });

  it('filters correctly for each linea de seguro', () => {
    const lineas: LineaSeguro[] = ['vida', 'hogar', 'autos', 'salud'];
    for (const linea of lineas) {
      const result = filtrarApisPorLinea(sampleApis, linea);
      expect(result.every((api) => api.lineaSeguro === linea)).toBe(true);
    }
  });
});

describe('generarManifiestoAI', () => {
  it('generates a valid manifest with schema_version 1.0', () => {
    const manifest = generarManifiestoAI(sampleApis, 'todas');
    expect(manifest.schema_version).toBe('1.0');
  });

  it('includes all APIs when filter is "todas"', () => {
    const manifest = generarManifiestoAI(sampleApis, 'todas');
    expect(manifest.tools).toHaveLength(5);
  });

  it('includes only filtered APIs when a specific linea is selected', () => {
    const manifest = generarManifiestoAI(sampleApis, 'vida');
    expect(manifest.tools).toHaveLength(2);
    expect(manifest.tools.every((t) => t.function.ai_capability.includes('life'))).toBe(true);
  });

  it('each tool has type "function"', () => {
    const manifest = generarManifiestoAI(sampleApis, 'todas');
    expect(manifest.tools.every((t) => t.type === 'function')).toBe(true);
  });

  it('each tool function has name, description, parameters, and ai_capability', () => {
    const manifest = generarManifiestoAI(sampleApis, 'todas');
    for (const tool of manifest.tools) {
      expect(tool.function).toHaveProperty('name');
      expect(tool.function).toHaveProperty('description');
      expect(tool.function).toHaveProperty('parameters');
      expect(tool.function).toHaveProperty('ai_capability');
      expect(typeof tool.function.name).toBe('string');
      expect(typeof tool.function.description).toBe('string');
      expect(typeof tool.function.ai_capability).toBe('string');
    }
  });

  it('maps API fields correctly to tool fields', () => {
    const manifest = generarManifiestoAI([sampleApis[0]], 'todas');
    const tool = manifest.tools[0];
    expect(tool.function.name).toBe('Cotización Vida');
    expect(tool.function.description).toBe('Genera cotizaciones de seguros de vida');
    expect(tool.function.ai_capability).toBe('quote_life_insurance');
  });

  it('returns empty tools array when no APIs match filter', () => {
    const manifest = generarManifiestoAI([], 'vida');
    expect(manifest.tools).toHaveLength(0);
    expect(manifest.schema_version).toBe('1.0');
  });

  it('parameters field is a valid JSON schema object', () => {
    const manifest = generarManifiestoAI(sampleApis, 'todas');
    for (const tool of manifest.tools) {
      expect(tool.function.parameters).toEqual({ type: 'object', properties: {} });
    }
  });
});
