'use client';

import { useState, useCallback } from 'react';
import NavBar from '../components/ui/NavBar';
import PanelChat from '../components/playground/PanelChat';
import PanelLog from '../components/playground/PanelLog';
import type { MensajeChat, PasoTraza } from '../lib/playground';

export default function PlaygroundPage() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [pasos, setPasos] = useState<PasoTraza[]>([]);
  const [pasoExpandido, setPasoExpandido] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleEnviarMensaje = useCallback(async (texto: string) => {
    const mensajeSocio: MensajeChat = {
      id: `msg-${Date.now()}-socio`,
      rol: 'socio',
      contenido: texto,
      timestamp: new Date().toISOString(),
    };
    setMensajes((prev) => [...prev, mensajeSocio]);
    setCargando(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruccion: texto }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error de conexión' }));
        const mensajeError: MensajeChat = {
          id: `msg-${Date.now()}-agente`,
          rol: 'agente',
          contenido: errorData.error || 'Ocurrió un error al procesar tu instrucción. Intenta nuevamente.',
          timestamp: new Date().toISOString(),
        };
        setMensajes((prev) => [...prev, mensajeError]);
        return;
      }

      const resultado = await response.json() as { mensajeAgente: string; pasos: PasoTraza[] };

      setPasos((prev) => [...prev, ...resultado.pasos]);

      const mensajeAgente: MensajeChat = {
        id: `msg-${Date.now()}-agente`,
        rol: 'agente',
        contenido: resultado.mensajeAgente,
        timestamp: new Date().toISOString(),
      };
      setMensajes((prev) => [...prev, mensajeAgente]);
    } catch {
      const mensajeError: MensajeChat = {
        id: `msg-${Date.now()}-agente`,
        rol: 'agente',
        contenido: 'No se pudo conectar con el agente AI. Verifica tu conexión e intenta nuevamente.',
        timestamp: new Date().toISOString(),
      };
      setMensajes((prev) => [...prev, mensajeError]);
    } finally {
      setCargando(false);
    }
  }, []);

  const handleExpandirPaso = useCallback((pasoId: string) => {
    setPasoExpandido((prev) => (prev === pasoId ? null : pasoId));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar currentModule="playground" />
      <main className="flex-1 flex flex-col desktop:flex-row gap-4 p-4 desktop:p-6">
        <section
          className="flex-1 min-w-0"
          aria-label="Panel de chat"
        >
          <PanelChat
            mensajes={mensajes}
            onEnviarMensaje={handleEnviarMensaje}
            cargando={cargando}
          />
        </section>
        <section
          className="flex-1 min-w-0"
          aria-label="Panel de trazas"
        >
          <PanelLog
            pasos={pasos}
            pasoExpandido={pasoExpandido}
            onExpandirPaso={handleExpandirPaso}
          />
        </section>
      </main>
    </div>
  );
}
