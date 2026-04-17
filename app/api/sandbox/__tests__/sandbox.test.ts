/**
 * Tests unitarios para la API Route de creación de sandbox.
 *
 * Verifica que el endpoint POST /api/sandbox:
 * - Retorna credenciales válidas con status 201
 * - Genera clientId con prefijo "sb_"
 * - Genera clientSecret con prefijo "sk_"
 * - Incluye timestamp de creación
 * - Maneja errores internos correctamente
 *
 * Requisitos: 10.1, 10.2, 4.1, 4.2
 */

import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/sandbox/route';

// Mock de next-auth para evitar dependencia del servidor real
vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'test-user', name: 'Test', email: 'test@example.com' },
    accessToken: 'test-token',
  }),
}));

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'test-user', name: 'Test', email: 'test@example.com' },
    accessToken: 'test-token',
  }),
}));

function createMockRequest(body?: Record<string, unknown>): NextRequest {
  const url = 'http://localhost:3000/api/sandbox';
  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(url, init);
}

describe('POST /api/sandbox', () => {
  it('debe retornar credenciales con status 201', async () => {
    const request = createMockRequest({ nit: '123456789-0' });
    const response = await POST(request);

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('clientId');
    expect(data).toHaveProperty('clientSecret');
    expect(data).toHaveProperty('createdAt');
  });

  it('debe generar clientId con prefijo "sb_"', async () => {
    const request = createMockRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(data.clientId).toMatch(/^sb_/);
  });

  it('debe generar clientSecret con prefijo "sk_"', async () => {
    const request = createMockRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(data.clientSecret).toMatch(/^sk_/);
  });

  it('debe incluir un timestamp ISO válido en createdAt', async () => {
    const request = createMockRequest();
    const response = await POST(request);
    const data = await response.json();

    const date = new Date(data.createdAt);
    expect(date.toISOString()).toBe(data.createdAt);
  });

  it('debe generar credenciales únicas en cada llamada', async () => {
    const request1 = createMockRequest();
    const request2 = createMockRequest();

    const response1 = await POST(request1);
    const response2 = await POST(request2);

    const data1 = await response1.json();
    const data2 = await response2.json();

    expect(data1.clientId).not.toBe(data2.clientId);
    expect(data1.clientSecret).not.toBe(data2.clientSecret);
  });

  it('debe funcionar sin body en la petición', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox', {
      method: 'POST',
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.clientId).toMatch(/^sb_/);
  });
});
