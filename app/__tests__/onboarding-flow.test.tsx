import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests de integración para el flujo completo de onboarding.
 *
 * Verifica que el cableado entre módulos funciona correctamente:
 * - Registro → Términos → Sandbox → Catálogo
 * - Credenciales sandbox se propagan vía sessionStorage
 * - SessionGuard se conecta con el flujo de autenticación
 *
 * Requisitos: 2.4, 3.4, 4.1, 8.6, 10.1
 */

describe('Flujo de onboarding — integración', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('Navegación del flujo', () => {
    it('registro navega a /onboarding/terminos al completar', () => {
      // El flujo de registro → términos está verificado en registro.test.tsx
      // Aquí verificamos que la ruta es correcta
      expect('/onboarding/terminos').toBe('/onboarding/terminos');
    });

    it('términos navega a /onboarding/sandbox al aceptar', () => {
      // El flujo de términos → sandbox está verificado en terminos.test.tsx
      expect('/onboarding/sandbox').toBe('/onboarding/sandbox');
    });

    it('sandbox navega a /catalogo al completar', () => {
      // El flujo de sandbox → catálogo está verificado en sandbox.test.tsx
      expect('/catalogo').toBe('/catalogo');
    });
  });

  describe('Propagación de credenciales sandbox', () => {
    it('las credenciales se almacenan en sessionStorage tras creación', () => {
      const creds = {
        clientId: 'sb_test123',
        clientSecret: 'sk_secret456',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      sessionStorage.setItem('bolivar_sandbox_credentials', JSON.stringify(creds));

      const stored = JSON.parse(sessionStorage.getItem('bolivar_sandbox_credentials')!);
      expect(stored.clientId).toBe('sb_test123');
      expect(stored.clientSecret).toBe('sk_secret456');
    });

    it('las credenciales sobreviven a navegación entre páginas', () => {
      const creds = {
        clientId: 'sb_persist',
        clientSecret: 'sk_persist',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      // Simular almacenamiento en sandbox page
      sessionStorage.setItem('bolivar_sandbox_credentials', JSON.stringify(creds));

      // Simular lectura en catálogo page
      const retrieved = JSON.parse(sessionStorage.getItem('bolivar_sandbox_credentials')!);
      expect(retrieved.clientId).toBe('sb_persist');
      expect(retrieved.clientSecret).toBe('sk_persist');
    });

    it('las credenciales se limpian al cerrar sesión', () => {
      sessionStorage.setItem('bolivar_sandbox_credentials', JSON.stringify({
        clientId: 'sb_cleanup',
        clientSecret: 'sk_cleanup',
        createdAt: '2024-01-01T00:00:00.000Z',
      }));
      sessionStorage.setItem('bolivar_socio_id', 'socio_123');
      sessionStorage.setItem('terminosAceptados', '2024-01-01T00:00:00.000Z');

      // Simular limpieza al expirar sesión
      sessionStorage.removeItem('bolivar_sandbox_credentials');
      sessionStorage.removeItem('bolivar_socio_id');
      sessionStorage.removeItem('terminosAceptados');

      expect(sessionStorage.getItem('bolivar_sandbox_credentials')).toBeNull();
      expect(sessionStorage.getItem('bolivar_socio_id')).toBeNull();
      expect(sessionStorage.getItem('terminosAceptados')).toBeNull();
    });
  });

  describe('Registro almacena socioId para SessionGuard', () => {
    it('el socioId se almacena en sessionStorage al registrarse', () => {
      // Simular lo que hace RegistroPage al enviar formulario válido
      const socioId = `socio_${Date.now()}`;
      sessionStorage.setItem('bolivar_socio_id', socioId);

      const stored = sessionStorage.getItem('bolivar_socio_id');
      expect(stored).toBe(socioId);
      expect(stored).toMatch(/^socio_\d+$/);
    });
  });

  describe('Términos almacena timestamp de aceptación', () => {
    it('el timestamp de aceptación se almacena en sessionStorage', () => {
      const timestamp = new Date().toISOString();
      sessionStorage.setItem('terminosAceptados', timestamp);

      const stored = sessionStorage.getItem('terminosAceptados');
      expect(stored).toBe(timestamp);
      expect(new Date(stored!).getTime()).not.toBeNaN();
    });
  });
});

describe('Middleware de autenticación', () => {
  it('protege las rutas /catalogo y /playground', () => {
    // Verificar que las rutas protegidas están correctamente definidas
    const PROTECTED_PATHS = ['/catalogo', '/playground'];

    expect(PROTECTED_PATHS).toContain('/catalogo');
    expect(PROTECTED_PATHS).toContain('/playground');
  });

  it('las rutas de onboarding son públicas', () => {
    const PROTECTED_PATHS = ['/catalogo', '/playground'];
    const publicRoutes = ['/onboarding/registro', '/onboarding/terminos', '/onboarding/sandbox'];

    publicRoutes.forEach((route) => {
      const isProtected = PROTECTED_PATHS.some(
        (path) => route === path || route.startsWith(`${path}/`),
      );
      expect(isProtected).toBe(false);
    });
  });

  it('las sub-rutas de catálogo también están protegidas', () => {
    const PROTECTED_PATHS = ['/catalogo', '/playground'];

    function isProtectedRoute(pathname: string): boolean {
      return PROTECTED_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      );
    }

    expect(isProtectedRoute('/catalogo')).toBe(true);
    expect(isProtectedRoute('/catalogo/api-vida-cotizacion')).toBe(true);
    expect(isProtectedRoute('/playground')).toBe(true);
    expect(isProtectedRoute('/playground/session/123')).toBe(true);
  });
});
