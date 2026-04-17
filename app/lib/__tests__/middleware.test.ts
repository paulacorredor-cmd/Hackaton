/**
 * Tests unitarios para el middleware de protección de rutas.
 *
 * Verifica que:
 * - Las rutas de catálogo y playground están protegidas
 * - Las rutas de onboarding y API son públicas
 * - Usuarios sin sesión son redirigidos a signin
 * - Usuarios con sesión pueden acceder a rutas protegidas
 *
 * Requisitos: 10.1, 10.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock de next-auth/jwt
const mockGetToken = vi.fn();
vi.mock('next-auth/jwt', () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}));

// Importar después del mock
import { middleware } from '@/middleware';

function createRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, 'http://localhost:3000'));
}

describe('Middleware de protección de rutas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rutas protegidas (requieren autenticación)', () => {
    it('debe redirigir a signin cuando no hay token en /catalogo', async () => {
      mockGetToken.mockResolvedValue(null);
      const request = createRequest('/catalogo');
      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/api/auth/signin');
      expect(location).toContain('callbackUrl');
    });

    it('debe redirigir a signin cuando no hay token en /catalogo/api-123', async () => {
      mockGetToken.mockResolvedValue(null);
      const request = createRequest('/catalogo/api-123');
      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/api/auth/signin');
    });

    it('debe redirigir a signin cuando no hay token en /playground', async () => {
      mockGetToken.mockResolvedValue(null);
      const request = createRequest('/playground');
      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/api/auth/signin');
    });

    it('debe permitir acceso a /catalogo con token válido', async () => {
      mockGetToken.mockResolvedValue({ sub: 'user-123', accessToken: 'valid-token' });
      const request = createRequest('/catalogo');
      const response = await middleware(request);

      // NextResponse.next() retorna status 200
      expect(response.status).toBe(200);
    });

    it('debe permitir acceso a /playground con token válido', async () => {
      mockGetToken.mockResolvedValue({ sub: 'user-123', accessToken: 'valid-token' });
      const request = createRequest('/playground');
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Rutas públicas (no requieren autenticación)', () => {
    it('debe permitir acceso a / sin token', async () => {
      mockGetToken.mockResolvedValue(null);
      const request = createRequest('/');
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('debe permitir acceso a /onboarding/registro sin token', async () => {
      mockGetToken.mockResolvedValue(null);
      const request = createRequest('/onboarding/registro');
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('debe permitir acceso a /onboarding/terminos sin token', async () => {
      mockGetToken.mockResolvedValue(null);
      const request = createRequest('/onboarding/terminos');
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('debe permitir acceso a /onboarding/sandbox sin token', async () => {
      mockGetToken.mockResolvedValue(null);
      const request = createRequest('/onboarding/sandbox');
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Callback URL en redirección', () => {
    it('debe incluir la URL original como callbackUrl en la redirección', async () => {
      mockGetToken.mockResolvedValue(null);
      const request = createRequest('/catalogo');
      const response = await middleware(request);

      const location = response.headers.get('location')!;
      const url = new URL(location);
      const callbackUrl = url.searchParams.get('callbackUrl');
      expect(callbackUrl).toContain('/catalogo');
    });
  });
});
