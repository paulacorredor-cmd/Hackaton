/**
 * Configuración centralizada de NextAuth.js para OAuth 2.0 + OpenID Connect.
 * Exporta las opciones de autenticación para ser reutilizadas en la API Route
 * y en utilidades del servidor.
 *
 * Requisitos: 10.1, 10.2
 */

import type { NextAuthOptions, Session } from 'next-auth';

/**
 * Extensión del tipo Session para incluir el accessToken y el id del usuario.
 */
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    sub?: string;
  }
}

/**
 * Opciones de configuración de NextAuth.
 *
 * Utiliza un proveedor genérico OAuth 2.0 + OpenID Connect configurable
 * mediante variables de entorno. Si las variables no están definidas,
 * se usan valores placeholder para desarrollo local.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'bolivar-oidc',
      name: 'Seguros Bolívar',
      type: 'oauth',
      wellKnown: process.env.OIDC_WELL_KNOWN_URL,
      clientId: process.env.OIDC_CLIENT_ID ?? 'dev-client-id',
      clientSecret: process.env.OIDC_CLIENT_SECRET ?? 'dev-client-secret',
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
      idToken: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture ?? null,
        };
      },
    },
  ],

  session: {
    strategy: 'jwt',
    // Sesión expira tras 15 minutos de inactividad (Requisito 10.4)
    maxAge: 15 * 60,
  },

  pages: {
    signIn: '/onboarding/registro',
    error: '/onboarding/registro',
  },

  callbacks: {
    async jwt({ token, account }) {
      // Persistir el access_token del proveedor OAuth en el JWT
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      // Exponer accessToken e id del usuario en la sesión del cliente
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-in-production',
};
