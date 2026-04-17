import { describe, it, expect } from 'vitest';
import { POST } from '../route';

function createRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/ai/chat', () => {
  it('retorna 400 cuando falta instruccion', async () => {
    const response = await POST(createRequest({}));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('instruccion');
  });

  it('retorna 400 cuando instruccion está vacía', async () => {
    const response = await POST(createRequest({ instruccion: '   ' }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('instruccion');
  });

  it('retorna 400 cuando instruccion no es string', async () => {
    const response = await POST(createRequest({ instruccion: 123 }));
    expect(response.status).toBe(400);
  });

  it('retorna 400 cuando instruccion excede 500 caracteres', async () => {
    const instruccionLarga = 'a'.repeat(501);
    const response = await POST(createRequest({ instruccion: instruccionLarga }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('500');
  });

  it('retorna 200 con respuesta válida para instrucción de cotización vida', async () => {
    const response = await POST(createRequest({ instruccion: 'Cotizar seguro de vida' }));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.mensajeAgente).toBeTruthy();
    expect(data.pasos).toBeInstanceOf(Array);
    expect(data.pasos.length).toBe(3);
  });

  it('retorna 200 con pasos de traza correctos', async () => {
    const response = await POST(createRequest({ instruccion: 'Reportar siniestro de auto' }));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.pasos[0].tipo).toBe('interpretacion');
    expect(data.pasos[1].tipo).toBe('peticion');
    expect(data.pasos[2].tipo).toBe('respuesta');
  });

  it('retorna 200 con 1 paso cuando no se identifica endpoint', async () => {
    const response = await POST(createRequest({ instruccion: 'xyz abc def ghi' }));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.pasos.length).toBe(1);
    expect(data.mensajeAgente).toContain('No encontré');
  });

  it('acepta sessionId opcional', async () => {
    const response = await POST(createRequest({
      instruccion: 'Cotizar seguro de vida',
      sessionId: 'session-123',
    }));
    expect(response.status).toBe(200);
  });

  it('retorna 500 para JSON inválido', async () => {
    const request = new Request('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
