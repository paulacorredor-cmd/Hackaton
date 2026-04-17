/**
 * Tests unitarios para la configuración de autenticación OAuth 2.0 + OIDC.
 *
 * Verifica que authOptions está correctamente configurada con:
 * - Proveedor OAuth 2.0 + OIDC (bolivar-oidc)
 * - Estrategia de sesión JWT con expiración de 15 minutos
 * - Callbacks de JWT y session
 * - Páginas personalizadas de login
 *
 * Requisitos: 10.1, 10.2
 */

import { describe, it, expect } from 'vitest';
import { authOptions } from '@/app/lib/auth';

describe('authOptions — Configuración OAuth 2.0 + OIDC', () => {
  it('debe tener un proveedor con id "bolivar-oidc"', () => {
    expect(authOptions.providers).toHaveLength(1);
    const provider = authOptions.providers[0];
    expect(provider.id).toBe('bolivar-oidc');
    expect(provider.name).toBe('Seguros Bolívar');
    expect(provider.type).toBe('oauth');
  });

  it('debe usar estrategia de sesión JWT', () => {
    expect(authOptions.session?.strategy).toBe('jwt');
  });

  it('debe configurar expiración de sesión a 15 minutos (900 segundos)', () => {
    expect(authOptions.session?.maxAge).toBe(15 * 60);
  });

  it('debe tener páginas personalizadas de signIn y error', () => {
    expect(authOptions.pages?.signIn).toBe('/onboarding/registro');
    expect(authOptions.pages?.error).toBe('/onboarding/registro');
  });

  it('debe tener callbacks de jwt y session definidos', () => {
    expect(authOptions.callbacks?.jwt).toBeDefined();
    expect(typeof authOptions.callbacks?.jwt).toBe('function');
    expect(authOptions.callbacks?.session).toBeDefined();
    expect(typeof authOptions.callbacks?.session).toBe('function');
  });

  it('el callback jwt debe persistir el accessToken del account', async () => {
    const jwtCallback = authOptions.callbacks!.jwt!;
    const result = await (jwtCallback as Function)({
      token: { sub: 'user-123' },
      account: { access_token: 'test-access-token', provider: 'bolivar-oidc', type: 'oauth', providerAccountId: '123' },
      user: { id: 'user-123' },
    });
    expect(result.accessToken).toBe('test-access-token');
  });

  it('el callback jwt debe mantener el token sin cambios si no hay account', async () => {
    const jwtCallback = authOptions.callbacks!.jwt!;
    const result = await (jwtCallback as Function)({
      token: { sub: 'user-123', accessToken: 'existing-token' },
      account: null,
      user: { id: 'user-123' },
    });
    expect(result.accessToken).toBe('existing-token');
  });

  it('el callback session debe exponer accessToken e id del usuario', async () => {
    const sessionCallback = authOptions.callbacks!.session!;
    const result = await (sessionCallback as Function)({
      session: { user: { name: 'Test', email: 'test@example.com' }, expires: '' },
      token: { sub: 'user-123', accessToken: 'my-token' },
    });
    expect(result.accessToken).toBe('my-token');
    expect(result.user.id).toBe('user-123');
  });

  it('debe tener un secret configurado', () => {
    expect(authOptions.secret).toBeDefined();
    expect(typeof authOptions.secret).toBe('string');
  });
});
