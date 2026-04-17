/**
 * Tipos e interfaces para el módulo AI Playground.
 * Requisitos: 8.1, 8.2, 8.3, 8.5, 9.1, 9.2, 9.3, 9.4
 */

export interface MensajeChat {
  id: string;
  rol: 'socio' | 'agente';
  contenido: string;
  timestamp: string;
}

export interface PasoTraza {
  id: string;
  tipo: 'interpretacion' | 'peticion' | 'respuesta';
  timestamp: string;
  duracionMs: number;
  contenido: {
    interpretacion?: string;
    endpoint?: string;
    method?: string;
    headers?: Record<string, string>;
    payload?: unknown;
    respuestaJson?: unknown;
    statusCode?: number;
  };
}

export interface PanelChatProps {
  mensajes: MensajeChat[];
  onEnviarMensaje: (texto: string) => Promise<void>;
  cargando: boolean;
}

export interface PanelLogProps {
  pasos: PasoTraza[];
  pasoExpandido: string | null;
  onExpandirPaso: (pasoId: string) => void;
}

/**
 * Formatea un timestamp ISO a hora legible (HH:MM:SS).
 */
export function formatearTimestamp(isoTimestamp: string): string {
  try {
    const date = new Date(isoTimestamp);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoTimestamp;
  }
}

/**
 * Retorna la etiqueta legible para un tipo de paso de traza.
 */
export function etiquetaTipoPaso(tipo: PasoTraza['tipo']): string {
  const etiquetas: Record<PasoTraza['tipo'], string> = {
    interpretacion: 'Interpretación',
    peticion: 'Petición',
    respuesta: 'Respuesta',
  };
  return etiquetas[tipo];
}

/**
 * Serializa el contenido de un paso de traza a JSON formateado para copiar.
 */
export function serializarContenidoPaso(paso: PasoTraza): string {
  return JSON.stringify(paso.contenido, null, 2);
}
