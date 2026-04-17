/**
 * Proxy API Route — forwards sandbox requests without exposing credentials.
 * Accepts POST with PeticionPrueba payload, adds sandbox credentials from
 * session/cookies (mocked for now), and returns RespuestaPrueba.
 *
 * Requisitos: 6.2, 6.4, 6.5
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  type PeticionPrueba,
  type RespuestaPrueba,
  SandboxErrorCode,
  ERROR_MESSAGES,
} from '@/app/lib/http-utils';

const SANDBOX_BASE_URL = process.env.SANDBOX_BASE_URL ?? 'https://sandbox.segurosbolivar.com';
const SANDBOX_TIMEOUT_MS = 15_000;

/**
 * Reads sandbox credentials from session/cookies.
 * Mocked for now — returns demo credentials.
 */
function getSandboxCredentials(): { clientId: string; clientSecret: string } {
  return {
    clientId: 'sandbox-demo-client-id',
    clientSecret: 'sandbox-demo-client-secret',
  };
}

export async function POST(request: NextRequest) {
  let petition: PeticionPrueba;

  try {
    petition = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido' },
      { status: 400 },
    );
  }

  if (!petition.method || !petition.path) {
    return NextResponse.json(
      { error: 'Se requieren los campos method y path' },
      { status: 400 },
    );
  }

  const credentials = getSandboxCredentials();
  const targetUrl = `${SANDBOX_BASE_URL}${petition.path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Id': credentials.clientId,
    'Authorization': `Bearer ${credentials.clientSecret}`,
    ...petition.headers,
  };

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SANDBOX_TIMEOUT_MS);

    const fetchOptions: RequestInit = {
      method: petition.method,
      headers,
      signal: controller.signal,
    };

    if (petition.body && petition.method !== 'GET') {
      fetchOptions.body = JSON.stringify(petition.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeoutId);

    const durationMs = Date.now() - startTime;
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let responseBody: unknown;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    const result: RespuestaPrueba = {
      statusCode: response.status,
      headers: responseHeaders,
      body: responseBody,
      durationMs,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const isTimeout = err instanceof DOMException && err.name === 'AbortError';

    const errorCode = isTimeout
      ? SandboxErrorCode.TIMEOUT
      : SandboxErrorCode.NETWORK_ERROR;

    const sandboxError = ERROR_MESSAGES[errorCode];

    return NextResponse.json(
      {
        statusCode: isTimeout ? 504 : 0,
        headers: {},
        body: {
          error: sandboxError.code,
          message: sandboxError.message,
          suggestion: sandboxError.suggestion,
          retryable: sandboxError.retryable,
        },
        durationMs,
      } satisfies RespuestaPrueba,
      { status: isTimeout ? 504 : 502 },
    );
  }
}
