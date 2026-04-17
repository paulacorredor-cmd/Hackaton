/**
 * Lógica del agente AI para el playground.
 * Identifica endpoints a partir de instrucciones en lenguaje natural
 * usando keyword matching contra los campos x-ai-description del catálogo.
 *
 * Requisitos: 8.4, 8.5, 8.6
 */

import type { ApiDefinition } from './catalogo';
import type { PasoTraza } from './playground';

export interface PlaygroundChatRequest {
  instruccion: string;
  sessionId?: string;
}

export interface PlaygroundChatResponse {
  mensajeAgente: string;
  pasos: PasoTraza[];
}

/**
 * Normaliza texto para comparación: minúsculas, sin acentos.
 */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Calcula un puntaje de coincidencia entre una instrucción y una API.
 * Compara palabras de la instrucción contra el nombre, descripción semántica
 * y aiCapability de la API.
 *
 * Retorna un número >= 0 donde mayor = mejor coincidencia.
 */
export function calcularPuntaje(instruccion: string, api: ApiDefinition): number {
  const instrNorm = normalizarTexto(instruccion);
  const campos = [
    normalizarTexto(api.nombre),
    normalizarTexto(api.descripcionSemantica),
    normalizarTexto(api.aiCapability.replace(/_/g, ' ')),
    normalizarTexto(api.lineaSeguro),
  ];

  const textoApi = campos.join(' ');
  const palabrasInstruccion = instrNorm.split(/\s+/).filter((p) => p.length > 2);

  let puntaje = 0;
  for (const palabra of palabrasInstruccion) {
    if (textoApi.includes(palabra)) {
      puntaje += 1;
    }
  }

  return puntaje;
}

/**
 * Identifica la API más relevante para una instrucción en lenguaje natural.
 * Retorna la API con mayor puntaje de coincidencia, o null si ninguna coincide.
 */
export function identificarEndpoint(
  instruccion: string,
  apis: ApiDefinition[],
): ApiDefinition | null {
  if (!instruccion.trim() || apis.length === 0) {
    return null;
  }

  let mejorApi: ApiDefinition | null = null;
  let mejorPuntaje = 0;

  for (const api of apis) {
    const puntaje = calcularPuntaje(instruccion, api);
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorApi = api;
    }
  }

  return mejorApi;
}

/**
 * Genera un payload simulado para la petición al sandbox basado en la API identificada.
 */
export function generarPayloadSimulado(api: ApiDefinition, instruccion: string): Record<string, unknown> {
  const payloads: Record<string, Record<string, unknown>> = {
    'api-vida-cotizacion': { tipo: 'vida', edad: 35, montoCobertura: 100000000, instruccion },
    'api-vida-beneficiarios': { polizaId: 'POL-VIDA-001', accion: 'consultar', instruccion },
    'api-hogar-poliza': { direccion: 'Calle 100 #15-20, Bogotá', tipoInmueble: 'apartamento', instruccion },
    'api-hogar-siniestro': { polizaId: 'POL-HOGAR-001', tipoSiniestro: 'inundacion', instruccion },
    'api-autos-cotizacion': { marca: 'Toyota', modelo: 'Corolla', anio: 2024, instruccion },
    'api-autos-siniestro': { polizaId: 'POL-AUTO-001', tipoSiniestro: 'colision', instruccion },
    'api-salud-autorizacion': { tipoServicio: 'consulta_especialista', especialidad: 'cardiologia', instruccion },
    'api-salud-red-medica': { ciudad: 'Bogotá', especialidad: 'general', instruccion },
  };

  return payloads[api.id] ?? { instruccion };
}

/**
 * Genera una respuesta simulada del sandbox basada en la API identificada.
 */
export function generarRespuestaSimulada(api: ApiDefinition): { statusCode: number; body: Record<string, unknown> } {
  const respuestas: Record<string, Record<string, unknown>> = {
    'api-vida-cotizacion': { cotizacionId: 'COT-VIDA-2024-001', primaAnual: 1250000, moneda: 'COP', vigencia: '1 año' },
    'api-vida-beneficiarios': { beneficiarios: [{ nombre: 'María García', porcentaje: 100 }] },
    'api-hogar-poliza': { polizaId: 'POL-HOGAR-2024-001', estado: 'activa', cobertura: 'integral' },
    'api-hogar-siniestro': { siniestroId: 'SIN-HOGAR-2024-001', estado: 'registrado', fechaEstimada: '2024-02-15' },
    'api-autos-cotizacion': { cotizacionId: 'COT-AUTO-2024-001', primaAnual: 2800000, moneda: 'COP' },
    'api-autos-siniestro': { siniestroId: 'SIN-AUTO-2024-001', estado: 'en_revision', numeroRadicado: 'RAD-001' },
    'api-salud-autorizacion': { autorizacionId: 'AUT-SALUD-2024-001', estado: 'aprobada', vigencia: '30 días' },
    'api-salud-red-medica': { prestadores: [{ nombre: 'Clínica Bolívar', direccion: 'Cra 7 #72-13', telefono: '601-555-0100' }] },
  };

  return {
    statusCode: 200,
    body: respuestas[api.id] ?? { mensaje: 'Operación completada exitosamente' },
  };
}

/**
 * Genera un mensaje de soporte amable y de usted, basado en la documentación
 * de API-REFERENCE.md, siguiendo las reglas del steering agente-soporte-aliados.
 */
function generarMensajeSoporte(api: ApiDefinition, endpointPath: string, statusCode: number): string {
  const infoApi = DOCUMENTACION_APIS[api.id];
  if (!infoApi) {
    return `Se ha ejecutado la operación "${api.nombre}" en el sandbox. El endpoint ${endpointPath} respondió con código ${statusCode}. Puede revisar el panel de trazas para ver los detalles técnicos completos.`;
  }

  return `${infoApi}\n\nSe ha ejecutado la operación en el sandbox y el endpoint respondió con código ${statusCode}. Puede revisar el panel de trazas para consultar los detalles técnicos completos. Si tiene alguna otra consulta, quedo atento para ayudarle.`;
}

/**
 * Documentación de cada API extraída de docs/API-REFERENCE.md.
 * Tono: usted, amable, profesional. Fuente de verdad: API-REFERENCE.md.
 */
const DOCUMENTACION_APIS: Record<string, string> = {
  'api-vida-cotizacion': `Con gusto le explico. Para cotizar un seguro de vida, debe enviar una petición POST a través del proxy /api/proxy con path /api/vida/cotizar. Los campos obligatorios son: "edad" (entero, 18 a 70), "genero" ("M" o "F"), "sumaAsegurada" (entre 10.000.000 y 2.000.000.000 COP) y "plan" ("basico", "plus" o "premium"). La respuesta incluirá el número de cotización, prima mensual, coberturas, vigencia y fecha de cotización.`,
  'api-vida-beneficiarios': `Con gusto le informo. La API de Beneficiarios Vida le permite gestionar los beneficiarios de pólizas de vida, incluyendo alta, baja y modificación. Puede consultar la especificación completa en /specs/vida-beneficiarios.yaml desde el visor de documentación del portal.`,
  'api-hogar-poliza': `Con gusto le asisto. La API de Póliza Hogar le permite gestionar pólizas de seguros de hogar, consultar coberturas y verificar el estado de la póliza. Puede acceder a la especificación completa en /specs/hogar-poliza.yaml.`,
  'api-hogar-siniestro': `Con gusto le ayudo. La API de Siniestro Hogar le permite reportar y dar seguimiento a siniestros de seguros de hogar. La especificación completa está disponible en /specs/hogar-siniestro.yaml.`,
  'api-autos-cotizacion': `Con gusto le explico. La API de Cotización Autos genera cotizaciones de seguros de autos según modelo, año y perfil del conductor. Puede consultar la especificación en /specs/autos-cotizacion.yaml.`,
  'api-autos-siniestro': `Con gusto le informo. La API de Siniestro Autos le permite reportar siniestros de seguros de autos con documentación fotográfica. La especificación está en /specs/autos-siniestro.yaml.`,
  'api-salud-autorizacion': `Con gusto le asisto. La API de Autorización Salud le permite solicitar autorizaciones de servicios de salud y consultar el estado de aprobación. Puede revisar la especificación en /specs/salud-autorizacion.yaml.`,
  'api-salud-red-medica': `Con gusto le ayudo. La API de Red Médica Salud le permite consultar la red de prestadores médicos disponibles por ubicación y especialidad. La especificación está en /specs/salud-red-medica.yaml.`,
};

/**
 * Procesa una instrucción en lenguaje natural y genera la respuesta completa
 * con pasos de traza (interpretación, petición, respuesta).
 *
 * Comportamiento de soporte (steering agente-soporte-aliados.md):
 * - Trato de usted, tono amable y profesional
 * - Consulta docs/API-REFERENCE.md como fuente de verdad
 * - Si no hay coincidencia: "Por favor comuníquese con el # 773."
 */
export function procesarInstruccion(
  instruccion: string,
  apis: ApiDefinition[],
): PlaygroundChatResponse {
  const inicio = Date.now();

  const apiIdentificada = identificarEndpoint(instruccion, apis);

  if (!apiIdentificada) {
    const pasoInterpretacion: PasoTraza = {
      id: `paso-${Date.now()}-interp`,
      tipo: 'interpretacion',
      timestamp: new Date().toISOString(),
      duracionMs: Date.now() - inicio,
      contenido: {
        interpretacion: `No se identificó un endpoint específico para: "${instruccion}".`,
      },
    };

    return {
      mensajeAgente: `Por favor comuníquese con el # 773.`,
      pasos: [pasoInterpretacion],
    };
  }

  const tiempoInterpretacion = Date.now();
  const pasoInterpretacion: PasoTraza = {
    id: `paso-${Date.now()}-interp`,
    tipo: 'interpretacion',
    timestamp: new Date().toISOString(),
    duracionMs: tiempoInterpretacion - inicio,
    contenido: {
      interpretacion: `Instrucción interpretada: "${instruccion}". Endpoint identificado: ${apiIdentificada.nombre} (${apiIdentificada.aiCapability}). ${apiIdentificada.descripcionSemantica}.`,
    },
  };

  const payload = generarPayloadSimulado(apiIdentificada, instruccion);
  const endpointPath = `/api/seguros/${apiIdentificada.lineaSeguro}/${apiIdentificada.id.split('-').slice(2).join('-')}`;

  const tiempoPeticion = Date.now();
  const pasoPeticion: PasoTraza = {
    id: `paso-${tiempoPeticion}-pet`,
    tipo: 'peticion',
    timestamp: new Date().toISOString(),
    duracionMs: tiempoPeticion - tiempoInterpretacion,
    contenido: {
      endpoint: endpointPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sandbox-token-***',
        'X-Sandbox-Mode': 'true',
      },
      payload,
    },
  };

  const respuesta = generarRespuestaSimulada(apiIdentificada);
  const tiempoRespuesta = Date.now();
  const pasoRespuesta: PasoTraza = {
    id: `paso-${tiempoRespuesta}-resp`,
    tipo: 'respuesta',
    timestamp: new Date().toISOString(),
    duracionMs: tiempoRespuesta - tiempoPeticion,
    contenido: {
      statusCode: respuesta.statusCode,
      respuestaJson: respuesta.body,
    },
  };

  const mensajeAgente = generarMensajeSoporte(apiIdentificada, endpointPath, respuesta.statusCode);

  return {
    mensajeAgente,
    pasos: [pasoInterpretacion, pasoPeticion, pasoRespuesta],
  };
}
