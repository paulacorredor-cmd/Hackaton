import { describe, it, expect } from 'vitest';
import {
  normalizarTexto,
  calcularPuntaje,
  identificarEndpoint,
  procesarInstruccion,
  generarPayloadSimulado,
  generarRespuestaSimulada,
} from '../ai-agent';
import { apiDefinitions } from '../api-definitions';
import type { ApiDefinition } from '../catalogo';

describe('normalizarTexto', () => {
  it('convierte a minúsculas', () => {
    expect(normalizarTexto('HOLA MUNDO')).toBe('hola mundo');
  });

  it('elimina acentos', () => {
    expect(normalizarTexto('cotización')).toBe('cotizacion');
    expect(normalizarTexto('póliza')).toBe('poliza');
    expect(normalizarTexto('autorización')).toBe('autorizacion');
  });

  it('maneja texto vacío', () => {
    expect(normalizarTexto('')).toBe('');
  });
});

describe('calcularPuntaje', () => {
  const apiVida: ApiDefinition = {
    id: 'api-vida-cotizacion',
    nombre: 'Cotización Vida',
    descripcionSemantica: 'Genera cotizaciones personalizadas de seguros de vida',
    lineaSeguro: 'vida',
    aiCapability: 'quote_life_insurance',
    specUrl: '/specs/vida-cotizacion.yaml',
  };

  it('retorna puntaje > 0 para instrucción relevante', () => {
    expect(calcularPuntaje('cotizar seguro de vida', apiVida)).toBeGreaterThan(0);
  });

  it('retorna 0 para instrucción sin coincidencia', () => {
    expect(calcularPuntaje('xyz abc', apiVida)).toBe(0);
  });

  it('ignora palabras cortas (≤2 caracteres)', () => {
    expect(calcularPuntaje('de la en', apiVida)).toBe(0);
  });
});

describe('identificarEndpoint', () => {
  it('identifica cotización de vida', () => {
    const resultado = identificarEndpoint('Quiero cotizar un seguro de vida', apiDefinitions);
    expect(resultado).not.toBeNull();
    expect(resultado!.id).toBe('api-vida-cotizacion');
  });

  it('identifica siniestro de autos', () => {
    const resultado = identificarEndpoint('Reportar un siniestro de auto', apiDefinitions);
    expect(resultado).not.toBeNull();
    expect(resultado!.lineaSeguro).toBe('autos');
  });

  it('identifica autorización de salud', () => {
    const resultado = identificarEndpoint('Solicitar autorización de salud', apiDefinitions);
    expect(resultado).not.toBeNull();
    expect(resultado!.id).toBe('api-salud-autorizacion');
  });

  it('identifica póliza de hogar', () => {
    const resultado = identificarEndpoint('Consultar póliza de hogar', apiDefinitions);
    expect(resultado).not.toBeNull();
    expect(resultado!.lineaSeguro).toBe('hogar');
  });

  it('retorna null para instrucción vacía', () => {
    expect(identificarEndpoint('', apiDefinitions)).toBeNull();
    expect(identificarEndpoint('   ', apiDefinitions)).toBeNull();
  });

  it('retorna null para array de APIs vacío', () => {
    expect(identificarEndpoint('cotizar vida', [])).toBeNull();
  });

  it('retorna null cuando no hay coincidencia', () => {
    expect(identificarEndpoint('xyz abc def', apiDefinitions)).toBeNull();
  });
});

describe('generarPayloadSimulado', () => {
  it('genera payload para API conocida', () => {
    const api = apiDefinitions[0]; // vida-cotizacion
    const payload = generarPayloadSimulado(api, 'cotizar vida');
    expect(payload).toHaveProperty('instruccion', 'cotizar vida');
    expect(typeof payload).toBe('object');
  });

  it('genera payload genérico para API desconocida', () => {
    const apiDesconocida: ApiDefinition = {
      id: 'api-desconocida',
      nombre: 'Test',
      descripcionSemantica: 'Test',
      lineaSeguro: 'vida',
      aiCapability: 'test',
      specUrl: '/test',
    };
    const payload = generarPayloadSimulado(apiDesconocida, 'test');
    expect(payload).toEqual({ instruccion: 'test' });
  });
});

describe('generarRespuestaSimulada', () => {
  it('genera respuesta con statusCode 200', () => {
    const api = apiDefinitions[0];
    const respuesta = generarRespuestaSimulada(api);
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toBeDefined();
  });
});

describe('procesarInstruccion', () => {
  it('retorna respuesta con 3 pasos cuando se identifica endpoint', () => {
    const resultado = procesarInstruccion('Cotizar seguro de vida', apiDefinitions);
    expect(resultado.mensajeAgente).toBeTruthy();
    expect(resultado.pasos).toHaveLength(3);
    expect(resultado.pasos[0].tipo).toBe('interpretacion');
    expect(resultado.pasos[1].tipo).toBe('peticion');
    expect(resultado.pasos[2].tipo).toBe('respuesta');
  });

  it('retorna mensaje de contacto #773 cuando no se identifica endpoint', () => {
    const resultado = procesarInstruccion('xyz abc def', apiDefinitions);
    expect(resultado.mensajeAgente).toContain('Por favor comuníquese con el # 773');
    expect(resultado.pasos).toHaveLength(1);
    expect(resultado.pasos[0].tipo).toBe('interpretacion');
  });

  it('usa tono de usted en respuesta exitosa', () => {
    const resultado = procesarInstruccion('Cotizar seguro de vida', apiDefinitions);
    expect(resultado.mensajeAgente).toContain('le');
    expect(resultado.mensajeAgente).not.toMatch(/\btú\b/i);
    expect(resultado.mensajeAgente).not.toMatch(/\btu\b/i);
  });

  it('cada paso tiene id, timestamp y duracionMs', () => {
    const resultado = procesarInstruccion('Cotizar seguro de vida', apiDefinitions);
    for (const paso of resultado.pasos) {
      expect(paso.id).toBeTruthy();
      expect(paso.timestamp).toBeTruthy();
      expect(typeof paso.duracionMs).toBe('number');
    }
  });

  it('paso de petición incluye endpoint, method y headers', () => {
    const resultado = procesarInstruccion('Cotizar seguro de vida', apiDefinitions);
    const pasoPeticion = resultado.pasos.find((p) => p.tipo === 'peticion');
    expect(pasoPeticion).toBeDefined();
    expect(pasoPeticion!.contenido.endpoint).toBeTruthy();
    expect(pasoPeticion!.contenido.method).toBe('POST');
    expect(pasoPeticion!.contenido.headers).toBeDefined();
    expect(pasoPeticion!.contenido.payload).toBeDefined();
  });

  it('paso de respuesta incluye statusCode y respuestaJson', () => {
    const resultado = procesarInstruccion('Cotizar seguro de vida', apiDefinitions);
    const pasoRespuesta = resultado.pasos.find((p) => p.tipo === 'respuesta');
    expect(pasoRespuesta).toBeDefined();
    expect(pasoRespuesta!.contenido.statusCode).toBe(200);
    expect(pasoRespuesta!.contenido.respuestaJson).toBeDefined();
  });

  it('paso de interpretación incluye texto descriptivo', () => {
    const resultado = procesarInstruccion('Cotizar seguro de vida', apiDefinitions);
    const pasoInterp = resultado.pasos.find((p) => p.tipo === 'interpretacion');
    expect(pasoInterp).toBeDefined();
    expect(pasoInterp!.contenido.interpretacion).toBeTruthy();
  });
});
