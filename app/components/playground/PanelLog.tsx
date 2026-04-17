'use client';

import { useCallback } from 'react';
import { ChevronDown, ChevronRight, Brain, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import CopyToClipboard from '../ui/CopyToClipboard';
import type { PanelLogProps, PasoTraza } from '../../lib/playground';
import { formatearTimestamp, etiquetaTipoPaso, serializarContenidoPaso } from '../../lib/playground';

/**
 * Returns Tailwind classes for the step type color coding.
 * - interpretacion: amarillo #FFD700
 * - peticion: verde #00843D
 * - respuesta: blanco #FFFFFF sobre fondo oscuro
 */
function getStepStyles(tipo: PasoTraza['tipo']): {
  borderColor: string;
  bgColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
} {
  switch (tipo) {
    case 'interpretacion':
      return {
        borderColor: 'border-l-[#FFD700]',
        bgColor: 'bg-[#FFD700]/10',
        textColor: 'text-gray-900',
        badgeBg: 'bg-[#FFD700]',
        badgeText: 'text-gray-900',
      };
    case 'peticion':
      return {
        borderColor: 'border-l-[#00843D]',
        bgColor: 'bg-[#00843D]/10',
        textColor: 'text-gray-900',
        badgeBg: 'bg-[#00843D]',
        badgeText: 'text-white',
      };
    case 'respuesta':
      return {
        borderColor: 'border-l-white',
        bgColor: 'bg-gray-800',
        textColor: 'text-white',
        badgeBg: 'bg-white',
        badgeText: 'text-gray-900',
      };
  }
}

function getStepIcon(tipo: PasoTraza['tipo']) {
  switch (tipo) {
    case 'interpretacion':
      return <Brain size={14} aria-hidden="true" />;
    case 'peticion':
      return <ArrowUpRight size={14} aria-hidden="true" />;
    case 'respuesta':
      return <ArrowDownLeft size={14} aria-hidden="true" />;
  }
}

function renderContenidoExpandido(paso: PasoTraza) {
  const { contenido, tipo } = paso;

  if (tipo === 'interpretacion' && contenido.interpretacion) {
    return (
      <div className="text-sm font-inter">
        <p className="font-medium mb-1">Interpretación del agente:</p>
        <p className="text-gray-600">{contenido.interpretacion}</p>
      </div>
    );
  }

  if (tipo === 'peticion') {
    return (
      <div className="text-sm font-inter space-y-2">
        {contenido.method && contenido.endpoint && (
          <p>
            <span className="font-medium">Endpoint: </span>
            <code className="bg-gray-100 px-1 rounded text-xs">
              {contenido.method} {contenido.endpoint}
            </code>
          </p>
        )}
        {contenido.headers && (
          <div>
            <p className="font-medium mb-1">Headers:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(contenido.headers, null, 2)}
            </pre>
          </div>
        )}
        {contenido.payload !== undefined && (
          <div>
            <p className="font-medium mb-1">Payload:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(contenido.payload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (tipo === 'respuesta') {
    return (
      <div className="text-sm font-inter space-y-2">
        {contenido.statusCode !== undefined && (
          <p>
            <span className="font-medium">Status: </span>
            <code className="bg-gray-700 px-1 rounded text-xs text-green-300">
              {contenido.statusCode}
            </code>
          </p>
        )}
        {contenido.respuestaJson !== undefined && (
          <div>
            <p className="font-medium mb-1">Respuesta JSON:</p>
            <pre className="bg-gray-700 p-2 rounded text-xs overflow-x-auto text-green-200">
              {JSON.stringify(contenido.respuestaJson, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function PanelLog({ pasos, pasoExpandido, onExpandirPaso }: PanelLogProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, pasoId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onExpandirPaso(pasoId);
      }
    },
    [onExpandirPaso],
  );

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-900 rounded-t-lg">
        <Brain size={20} className="text-bolivar-yellow" aria-hidden="true" />
        <h2 className="text-bolivar-white font-inter font-semibold text-base">
          Trazas del Agente
        </h2>
      </div>

      {/* Steps list */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        role="log"
        aria-label="Pasos de traza del agente AI"
        aria-live="polite"
      >
        {pasos.length === 0 && (
          <p className="text-gray-400 text-center text-sm py-8">
            Las trazas de ejecución del agente aparecerán aquí cuando envíes una instrucción.
          </p>
        )}
        {pasos.map((paso) => {
          const styles = getStepStyles(paso.tipo);
          const isExpanded = pasoExpandido === paso.id;

          return (
            <div
              key={paso.id}
              className={`rounded-lg border-l-4 ${styles.borderColor} ${styles.bgColor} overflow-hidden`}
            >
              {/* Step header — clickable to expand */}
              <button
                type="button"
                onClick={() => onExpandirPaso(paso.id)}
                onKeyDown={(e) => handleKeyDown(e, paso.id)}
                aria-expanded={isExpanded}
                aria-controls={`paso-contenido-${paso.id}`}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
                  ${styles.textColor}`}
              >
                {isExpanded ? (
                  <ChevronDown size={16} aria-hidden="true" />
                ) : (
                  <ChevronRight size={16} aria-hidden="true" />
                )}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${styles.badgeBg} ${styles.badgeText}`}>
                  {getStepIcon(paso.tipo)}
                  {etiquetaTipoPaso(paso.tipo)}
                </span>
                <time
                  className="text-xs opacity-70 ml-auto"
                  dateTime={paso.timestamp}
                >
                  {formatearTimestamp(paso.timestamp)}
                </time>
                <span className="text-xs opacity-70">
                  {paso.duracionMs}ms
                </span>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div
                  id={`paso-contenido-${paso.id}`}
                  className={`px-4 pb-3 pt-1 ${styles.textColor}`}
                  role="region"
                  aria-label={`Detalle del paso ${etiquetaTipoPaso(paso.tipo)}`}
                >
                  {renderContenidoExpandido(paso)}
                  <div className="mt-3">
                    <CopyToClipboard
                      value={serializarContenidoPaso(paso)}
                      ariaLabel={`Copiar JSON del paso ${etiquetaTipoPaso(paso.tipo)}`}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
