/**
 * Catálogo de APIs — tipos, utilidades de filtrado y generación de manifiesto AI.
 * Implementa las interfaces y funciones necesarias para el módulo de Catálogo de APIs
 * y la exportación de manifiesto compatible con GPT-4 Tools.
 *
 * Requisitos: 5.1, 5.4, 7.2, 7.4
 */

// --- Tipos ---

export type LineaSeguro = 'vida' | 'hogar' | 'autos' | 'salud';

export interface ApiDefinition {
  id: string;
  nombre: string;
  descripcionSemantica: string;  // Extraída de x-ai-description
  lineaSeguro: LineaSeguro;
  aiCapability: string;          // Extraída de x-ai-capability
  specUrl: string;               // URL a la especificación OpenAPI 3.1
}

export interface ManifiestoAI {
  schema_version: '1.0';
  tools: ManifiestoTool[];
}

export interface ManifiestoTool {
  type: 'function';
  function: {
    name: string;
    description: string;       // De x-ai-description
    parameters: Record<string, unknown>; // JSON Schema placeholder
    ai_capability: string;     // De x-ai-capability
  };
}

// --- Filtrado ---

/**
 * Filtra un array de ApiDefinition por línea de seguro.
 * Cuando el filtro es 'todas', retorna todas las APIs sin modificar.
 * Cuando el filtro es una LineaSeguro específica, retorna solo las APIs que coinciden.
 */
export function filtrarApisPorLinea(
  apis: ApiDefinition[],
  filtro: LineaSeguro | 'todas',
): ApiDefinition[] {
  if (filtro === 'todas') {
    return apis;
  }
  return apis.filter((api) => api.lineaSeguro === filtro);
}

// --- Generación de Manifiesto AI ---

/**
 * Genera un manifiesto AI compatible con GPT-4 Tools a partir de un array de APIs
 * y un filtro de línea de seguro activo.
 *
 * Aplica el filtro primero, luego transforma cada API en una tool con la estructura:
 * { type: 'function', function: { name, description, parameters, ai_capability } }
 */
export function generarManifiestoAI(
  apis: ApiDefinition[],
  filtro: LineaSeguro | 'todas',
): ManifiestoAI {
  const apisFiltradas = filtrarApisPorLinea(apis, filtro);

  const tools: ManifiestoTool[] = apisFiltradas.map((api) => ({
    type: 'function' as const,
    function: {
      name: api.nombre,
      description: api.descripcionSemantica,
      parameters: { type: 'object', properties: {} },
      ai_capability: api.aiCapability,
    },
  }));

  return {
    schema_version: '1.0',
    tools,
  };
}
