/**
 * API Route — NextAuth.js handler para OAuth 2.0 + OpenID Connect.
 *
 * Expone los endpoints GET y POST necesarios para el flujo de autenticación:
 * - GET  /api/auth/signin      → Página de inicio de sesión
 * - POST /api/auth/callback/*  → Callback del proveedor OAuth
 * - GET  /api/auth/session     → Sesión actual del usuario
 * - POST /api/auth/signout     → Cierre de sesión
 *
 * Requisitos: 10.1, 10.2
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/app/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
