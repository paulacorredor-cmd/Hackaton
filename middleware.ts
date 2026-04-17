/**
 * Middleware de Next.js para protección de rutas.
 *
 * Las rutas de catálogo (/catalogo) y AI Playground (/playground) requieren
 * autenticación OAuth 2.0 + OIDC. Si el usuario no tiene una sesión activa,
 * se redirige a la página de inicio de sesión.
 *
 * Las rutas de onboarding y la API de autenticación son públicas.
 *
 * Requisitos: 10.1, 10.2
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/** Rutas que requieren autenticación */
const PROTECTED_PATHS = ['/catalogo', '/playground'];

/** Verifica si la ruta solicitada requiere autenticación */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo verificar autenticación en rutas protegidas
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Verificar si existe un token JWT válido (sesión activa)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-in-production',
  });

  if (!token) {
    // Redirigir a la página de login con la URL de retorno
    const signInUrl = new URL('/api/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

/**
 * Configuración del matcher: solo ejecutar el middleware en rutas
 * de catálogo y playground. Excluir archivos estáticos y API routes.
 */
export const config = {
  matcher: ['/catalogo/:path*', '/playground/:path*'],
};
