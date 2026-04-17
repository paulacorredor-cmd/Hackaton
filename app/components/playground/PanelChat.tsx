'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import type { PanelChatProps } from '../../lib/playground';
import { formatearTimestamp } from '../../lib/playground';

export default function PanelChat({ mensajes, onEnviarMensaje, cargando }: PanelChatProps) {
  const [textoInput, setTextoInput] = useState('');
  const historialRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (historialRef.current) {
      historialRef.current.scrollTop = historialRef.current.scrollHeight;
    }
  }, [mensajes]);

  const handleEnviar = useCallback(async () => {
    const texto = textoInput.trim();
    if (!texto || cargando) return;
    setTextoInput('');
    await onEnviarMensaje(texto);
    inputRef.current?.focus();
  }, [textoInput, cargando, onEnviarMensaje]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleEnviar();
      }
    },
    [handleEnviar],
  );

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-bolivar-green rounded-t-lg">
        <Bot size={20} className="text-bolivar-yellow" aria-hidden="true" />
        <h2 className="text-bolivar-white font-inter font-semibold text-base">
          Bolívar AI Chat
        </h2>
      </div>

      {/* Message history */}
      <div
        ref={historialRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        role="log"
        aria-label="Historial de mensajes"
        aria-live="polite"
      >
        {mensajes.length === 0 && (
          <p className="text-gray-400 text-center text-sm py-8">
            Escribe una instrucción en lenguaje natural para interactuar con las APIs de Seguros Bolívar.
          </p>
        )}
        {mensajes.map((mensaje) => (
          <div
            key={mensaje.id}
            className={`flex gap-3 ${mensaje.rol === 'socio' ? 'justify-end' : 'justify-start'}`}
          >
            {mensaje.rol === 'agente' && (
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full bg-bolivar-green flex items-center justify-center"
                aria-hidden="true"
              >
                <Bot size={16} className="text-bolivar-yellow" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2 text-sm font-inter ${
                mensaje.rol === 'socio'
                  ? 'bg-bolivar-green text-bolivar-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
              role="article"
              aria-label={`Mensaje de ${mensaje.rol === 'socio' ? 'socio' : 'agente'}`}
            >
              <p>{mensaje.contenido}</p>
              <time
                className={`block text-xs mt-1 ${
                  mensaje.rol === 'socio' ? 'text-bolivar-yellow/70' : 'text-gray-400'
                }`}
                dateTime={mensaje.timestamp}
              >
                {formatearTimestamp(mensaje.timestamp)}
              </time>
            </div>
            {mensaje.rol === 'socio' && (
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full bg-bolivar-yellow flex items-center justify-center"
                aria-hidden="true"
              >
                <User size={16} className="text-bolivar-green" />
              </div>
            )}
          </div>
        ))}
        {cargando && (
          <div className="flex items-center gap-2 text-gray-400 text-sm" role="status">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            <span>El agente está procesando...</span>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Escribe tu instrucción
          </label>
          <textarea
            ref={inputRef}
            id="chat-input"
            value={textoInput}
            onChange={(e) => setTextoInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una instrucción en lenguaje natural..."
            disabled={cargando}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm font-inter
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-bolivar-green
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Campo de entrada de instrucciones"
          />
          <button
            type="button"
            onClick={handleEnviar}
            disabled={cargando || !textoInput.trim()}
            className="flex-shrink-0 p-2 rounded-lg bg-bolivar-green text-bolivar-white
              hover:bg-bolivar-green/90 transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Enviar mensaje"
          >
            <Send size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
