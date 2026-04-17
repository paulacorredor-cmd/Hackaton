/**
 * API Route: POST /api/ai/chat
 *
 * Procesa instrucciones en lenguaje natural del socio, identifica el endpoint
 * correspondiente del catálogo de APIs de Seguros Bolívar, ejecuta la petición
 * simulada al sandbox y retorna la respuesta con trazas de ejecución.
 *
 * Requisitos: 8.4, 8.5, 8.6
 */

import { NextResponse } from 'next/server';
import { apiDefinitions } from '@/app/lib/api-definitions';
import { procesarInstruccion } from '@/app/lib/ai-agent';
import type { PlaygroundChatRequest, PlaygroundChatResponse } from '@/app/lib/ai-agent';

export async function POST(request: Request): Promise<NextResponse<PlaygroundChatResponse | { error: string }>> {
  try {
    const body = await request.json() as PlaygroundChatRequest;

    if (!body.instruccion || typeof body.instruccion !== 'string' || !body.instruccion.trim()) {
      return NextResponse.json(
        { error: 'El campo "instruccion" es requerido y debe ser un texto no vacío.' },
        { status: 400 },
      );
    }

    const instruccion = body.instruccion.trim();

    if (instruccion.length > 500) {
      return NextResponse.json(
        { error: 'La instrucción no puede exceder 500 caracteres.' },
        { status: 400 },
      );
    }

    const resultado: PlaygroundChatResponse = procesarInstruccion(instruccion, apiDefinitions);

    return NextResponse.json(resultado);
  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la instrucción. Intente nuevamente.' },
      { status: 500 },
    );
  }
}
