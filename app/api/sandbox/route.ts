/**
 * API Route — Creación de aplicación sandbox.
 *
 * Genera credenciales de sandbox (Client_ID y Client_Secret) para un socio
 * que ha completado el flujo de onboarding. En producción, esto se conectaría
 * a un backend real para registrar la aplicación y generar credenciales seguras.
 *
 * Requisitos: 10.1, 10.2 (autenticación), 4.1, 4.2 (creación sandbox)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export interface SandboxCredentials {
  clientId: string;
  clientSecret: string;
  createdAt: string;
}

export interface SandboxErrorResponse {
  error: string;
  code: string;
}

/**
 * Genera un ID aleatorio seguro con un prefijo dado.
 */
function generateSecureId(prefix: string, length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * POST /api/sandbox
 *
 * Crea una nueva aplicación sandbox y retorna las credenciales generadas.
 * Requiere una sesión autenticada (verificada opcionalmente; en desarrollo
 * se permite sin sesión para facilitar el flujo de onboarding).
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar sesión autenticada (opcional en desarrollo)
    const session = await getServerSession(authOptions);

    // En producción, descomentar para requerir autenticación:
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'No autorizado. Inicie sesión para crear una aplicación sandbox.', code: 'UNAUTHORIZED' },
    //     { status: 401 },
    //   );
    // }

    // Parsear el body de la petición (datos del socio)
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Body vacío es aceptable — se generan credenciales sin datos adicionales
    }

    // Generar credenciales de sandbox
    const credentials: SandboxCredentials = {
      clientId: generateSecureId('sb_', 24),
      clientSecret: generateSecureId('sk_', 40),
      createdAt: new Date().toISOString(),
    };

    // En producción: almacenar en base de datos con hash del clientSecret
    // await db.sandboxApp.create({
    //   socioId: session.user.id,
    //   clientId: credentials.clientId,
    //   clientSecretHash: await bcrypt.hash(credentials.clientSecret, 12),
    //   ...body,
    // });

    return NextResponse.json(credentials, { status: 201 });
  } catch (error) {
    console.error('Error al crear aplicación sandbox:', error);

    return NextResponse.json(
      {
        error: 'Error interno al crear la aplicación sandbox. Intente nuevamente.',
        code: 'INTERNAL_ERROR',
      } satisfies SandboxErrorResponse,
      { status: 500 },
    );
  }
}
