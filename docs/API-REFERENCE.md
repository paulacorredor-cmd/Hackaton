# Documentación de APIs — Portal de Desarrolladores Seguros Bolívar (SIOP)

## Información General

| Campo | Valor |
|---|---|
| Base URL (Sandbox) | `https://sandbox.segurosbolivar.com` |
| Base URL (Portal) | `https://{host}` |
| Autenticación | OAuth 2.0 + OpenID Connect (sesión NextAuth) |
| Formato | JSON (`application/json`) |
| Timeout global | 15 000 ms |

---

## Autenticación

Todas las APIs del portal requieren una sesión autenticada vía OAuth 2.0 / OpenID Connect con el proveedor `bolivar-oidc`.

### Flujo de autenticación

1. El socio inicia sesión a través del endpoint de NextAuth (`/api/auth/signin`).
2. Se obtiene un `accessToken` del proveedor OIDC.
3. La sesión se gestiona con JWT (estrategia `jwt`).
4. La sesión expira tras 15 minutos de inactividad.

### Credenciales de Sandbox

Cada socio recibe credenciales de sandbox al completar el onboarding:

| Campo | Descripción |
|---|---|
| `Client_ID` | Identificador único de la aplicación sandbox (prefijo `sb_`) |
| `Client_Secret` | Secreto de la aplicación sandbox (prefijo `sk_`) |

Estas credenciales se inyectan automáticamente en las peticiones al backend a través del proxy.

---

## Cabeceras Comunes

### Cabeceras de petición (inyectadas por el proxy)

| Cabecera | Valor | Descripción |
|---|---|---|
| `Content-Type` | `application/json` | Tipo de contenido |
| `X-Client-Id` | `{Client_ID}` | ID de sandbox del socio |
| `Authorization` | `Bearer {Client_Secret}` | Secreto de sandbox del socio |

### Cabeceras personalizadas

El socio puede enviar cabeceras adicionales en el campo `headers` de la petición al proxy; estas se fusionan con las cabeceras base.

---

## Códigos de Error Globales

| Código HTTP | Código Error | Mensaje | Reintentable |
|---|---|---|---|
| 400 | — | Cuerpo de la petición inválido / campos faltantes | No |
| 401 | `NO_AUTORIZADO` | Se requiere autenticación | No |
| 401 | `UNAUTHORIZED` | Credenciales de sandbox no válidas | No |
| 429 | `RATE_LIMITED` | Límite de peticiones excedido | Sí |
| 502 | `BACKEND_ERROR` | Error del servicio backend (5xx) | Sí |
| 502 | `AUTH_ERROR` | Problema de autenticación con servicio interno | No |
| 504 | `TIMEOUT` | Petición excedió tiempo de espera (15s) | Sí |
| 500 | `INTERNAL_ERROR` | Error interno del sandbox | Sí |

---

## API 1: Proxy de Sandbox

Proxy central que enruta las peticiones de prueba al sandbox sin exponer credenciales del socio.

### `POST /api/proxy`

#### Request Body (`PeticionPrueba`)

```json
{
  "method": "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  "path": "/ruta/del/endpoint",
  "headers": { "X-Custom": "valor" },
  "body": { ... }
}
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `method` | `string` | Sí | Método HTTP: `GET`, `POST`, `PUT`, `DELETE`, `PATCH` |
| `path` | `string` | Sí | Ruta relativa del endpoint en el sandbox (ej: `/api/vida/cotizar`) |
| `headers` | `Record<string, string>` | No | Cabeceras adicionales a enviar |
| `body` | `any` | No | Cuerpo de la petición (ignorado para `GET`) |

#### Response Body (`RespuestaPrueba`)

```json
{
  "statusCode": 200,
  "headers": { "content-type": "application/json" },
  "body": { ... },
  "durationMs": 342
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `statusCode` | `number` | Código de estado HTTP de la respuesta del sandbox |
| `headers` | `Record<string, string>` | Cabeceras de la respuesta |
| `body` | `any` | Cuerpo de la respuesta (JSON o texto) |
| `durationMs` | `number` | Duración de la petición en milisegundos |

#### Errores específicos

| Código | Escenario | Respuesta |
|---|---|---|
| 400 | Body inválido o campos `method`/`path` faltantes | `{ "error": "..." }` |
| 504 | Timeout (>15s) | `{ statusCode: 504, body: { error: "TIMEOUT", ... } }` |
| 502 | Error de red | `{ statusCode: 0, body: { error: "NETWORK_ERROR", ... } }` |

---

## API 2: Creación de Sandbox

Genera credenciales de sandbox para un socio que completó el onboarding.

### `POST /api/sandbox`

#### Request Body

Cuerpo JSON opcional con datos adicionales del socio. Puede enviarse vacío.

```json
{}
```

#### Response Body — Éxito (201)

```json
{
  "clientId": "sb_abc123def456ghi789jkl012",
  "clientSecret": "sk_abc123def456ghi789jkl012mno345pqr678stu901",
  "createdAt": "2026-04-17T10:30:00.000Z"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `clientId` | `string` | ID de la aplicación sandbox (prefijo `sb_`, 27 caracteres) |
| `clientSecret` | `string` | Secreto de la aplicación (prefijo `sk_`, 43 caracteres) |
| `createdAt` | `string` | Fecha de creación en formato ISO 8601 |

#### Errores específicos

| Código | Código Error | Mensaje |
|---|---|---|
| 401 | `UNAUTHORIZED` | No autorizado (requiere sesión) |
| 500 | `INTERNAL_ERROR` | Error interno al crear la aplicación sandbox |

---

## API 3: Chat AI Playground

Procesa instrucciones en lenguaje natural, identifica el endpoint correspondiente del catálogo, ejecuta la petición simulada y retorna la respuesta con trazas de ejecución.

### `POST /api/ai/chat`

#### Request Body (`PlaygroundChatRequest`)

```json
{
  "instruccion": "Cotiza un seguro de vida para una persona de 35 años"
}
```

| Campo | Tipo | Obligatorio | Validación | Descripción |
|---|---|---|---|---|
| `instruccion` | `string` | Sí | No vacío, máx 500 caracteres | Instrucción en lenguaje natural |

#### Response Body (`PlaygroundChatResponse`)

La respuesta incluye la interpretación del agente AI, el endpoint identificado, la petición ejecutada y la respuesta del sandbox, junto con trazas de ejecución.

Estructura de trazas (`PasoTraza`):

```json
{
  "id": "paso-1",
  "tipo": "interpretacion" | "peticion" | "respuesta",
  "timestamp": "2026-04-17T10:30:00.000Z",
  "duracionMs": 150,
  "contenido": {
    "interpretacion": "El socio quiere cotizar un seguro de vida...",
    "endpoint": "/api/vida/cotizar",
    "method": "POST",
    "headers": { ... },
    "payload": { ... },
    "respuestaJson": { ... },
    "statusCode": 200
  }
}
```

#### Errores específicos

| Código | Mensaje |
|---|---|
| 400 | `El campo "instruccion" es requerido y debe ser un texto no vacío.` |
| 400 | `La instrucción no puede exceder 500 caracteres.` |
| 500 | `Error interno al procesar la instrucción. Intente nuevamente.` |

---

## API 4: Cotización Vida (Endpoint de Negocio)

Genera cotizaciones personalizadas de seguros de vida basadas en el perfil del asegurado.

### `POST /api/vida/cotizar`

#### Request Body (`Solicitud_Cotización`)

```json
{
  "edad": 35,
  "genero": "M",
  "sumaAsegurada": 100000000,
  "plan": "plus"
}
```

| Campo | Tipo | Obligatorio | Validación | Descripción |
|---|---|---|---|---|
| `edad` | `integer` | Sí | 18 – 70 inclusive | Edad del asegurado en años |
| `genero` | `string` | Sí | `"M"` o `"F"` | Género del asegurado |
| `sumaAsegurada` | `number` | Sí | 10 000 000 – 2 000 000 000 COP | Monto máximo de cobertura en COP |
| `plan` | `string` | Sí | `"basico"`, `"plus"`, `"premium"` | Tipo de plan de seguro de vida |

#### Response Body — Éxito (200) (`Respuesta_Cotización`)

```json
{
  "numeroCotizacion": "VID-2026-ABC123",
  "primaMensual": 85000,
  "coberturas": [
    "Muerte natural",
    "Muerte accidental",
    "Incapacidad total y permanente"
  ],
  "vigenciaMeses": 12,
  "plan": "plus",
  "sumaAsegurada": 100000000,
  "fechaCotizacion": "2026-04-17T10:30:00.000Z"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `numeroCotizacion` | `string` | Identificador alfanumérico único de la cotización |
| `primaMensual` | `number` | Prima mensual calculada en COP |
| `coberturas` | `string[]` | Lista de coberturas incluidas en el plan |
| `vigenciaMeses` | `integer` | Meses de vigencia de la cotización |
| `plan` | `string` | Plan solicitado (`basico`, `plus`, `premium`) |
| `sumaAsegurada` | `number` | Suma asegurada solicitada en COP |
| `fechaCotizacion` | `string` | Fecha/hora de generación (ISO 8601) |

#### Errores específicos

| Código HTTP | Código Error | Mensaje | Reintentable |
|---|---|---|---|
| 400 | — | Campos inválidos o faltantes | No |
| 401 | `NO_AUTORIZADO` | Se requiere autenticación | No |
| 502 | `BACKEND_ERROR` | Error del servicio backend de cotización | Sí |
| 502 | `AUTH_ERROR` | Problema de autenticación con servicio interno | No |
| 504 | `TIMEOUT` | Servicio de cotización no respondió en 15s | Sí |

#### Ejemplo de error 400 (validación)

```json
{
  "error": "Datos de cotización inválidos",
  "detalles": ["edad debe estar entre 18 y 70", "plan debe ser basico, plus o premium"]
}
```

#### Ejemplo de error 504 (timeout)

```json
{
  "error": "TIMEOUT",
  "mensaje": "El servicio de cotización no respondió dentro del tiempo esperado",
  "reintentable": true
}
```

---

## Catálogo de APIs Disponibles

El portal expone las siguientes APIs de negocio organizadas por línea de seguro. Cada una cuenta con una especificación OpenAPI 3.1 accesible desde el visor de documentación.

### Línea: Vida

| ID | Nombre | Descripción | AI Capability | Spec |
|---|---|---|---|---|
| `api-vida-cotizacion` | Cotización Vida | Genera cotizaciones personalizadas de seguros de vida basadas en perfil del asegurado | `quote_life_insurance` | `/specs/vida-cotizacion.yaml` |
| `api-vida-beneficiarios` | Beneficiarios Vida | Gestiona beneficiarios de pólizas de vida (alta, baja, modificación) | `manage_life_beneficiaries` | `/specs/vida-beneficiarios.yaml` |

### Línea: Hogar

| ID | Nombre | Descripción | AI Capability | Spec |
|---|---|---|---|---|
| `api-hogar-poliza` | Póliza Hogar | Gestiona pólizas de seguros de hogar, consulta coberturas y estado | `manage_home_policy` | `/specs/hogar-poliza.yaml` |
| `api-hogar-siniestro` | Siniestro Hogar | Reporta y da seguimiento a siniestros de seguros de hogar | `report_home_claim` | `/specs/hogar-siniestro.yaml` |

### Línea: Autos

| ID | Nombre | Descripción | AI Capability | Spec |
|---|---|---|---|---|
| `api-autos-cotizacion` | Cotización Autos | Genera cotizaciones de seguros de autos según modelo, año y perfil del conductor | `quote_auto_insurance` | `/specs/autos-cotizacion.yaml` |
| `api-autos-siniestro` | Siniestro Autos | Reporta siniestros de seguros de autos con documentación fotográfica | `report_auto_claim` | `/specs/autos-siniestro.yaml` |

### Línea: Salud

| ID | Nombre | Descripción | AI Capability | Spec |
|---|---|---|---|---|
| `api-salud-autorizacion` | Autorización Salud | Solicita autorizaciones de servicios de salud y consulta estado de aprobación | `request_health_auth` | `/specs/salud-autorizacion.yaml` |
| `api-salud-red-medica` | Red Médica Salud | Consulta la red de prestadores médicos disponibles por ubicación y especialidad | `query_health_network` | `/specs/salud-red-medica.yaml` |

---

## Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `SANDBOX_BASE_URL` | URL base del sandbox de Seguros Bolívar | `https://sandbox.segurosbolivar.com` |
| `OIDC_WELL_KNOWN_URL` | URL de descubrimiento OIDC del proveedor | `https://auth.segurosbolivar.com/.well-known/openid-configuration` |
| `OIDC_CLIENT_ID` | Client ID del proveedor OAuth | `portal-client-id` |
| `OIDC_CLIENT_SECRET` | Client Secret del proveedor OAuth | `portal-client-secret` |
| `NEXTAUTH_SECRET` | Secreto para firmar tokens JWT de sesión | `mi-secreto-seguro` |

---

## Guía Rápida de Integración

### 1. Obtener credenciales de sandbox

```bash
POST /api/sandbox
Content-Type: application/json

{}
```

Respuesta: `clientId` y `clientSecret` para usar en peticiones al sandbox.

### 2. Cotizar un seguro de vida (vía proxy)

```bash
POST /api/proxy
Content-Type: application/json

{
  "method": "POST",
  "path": "/api/vida/cotizar",
  "headers": {},
  "body": {
    "edad": 35,
    "genero": "M",
    "sumaAsegurada": 100000000,
    "plan": "plus"
  }
}
```

### 3. Usar el AI Playground

```bash
POST /api/ai/chat
Content-Type: application/json

{
  "instruccion": "Cotiza un seguro de vida para una mujer de 28 años, plan premium, suma asegurada de 500 millones"
}
```

El agente AI interpreta la instrucción, identifica el endpoint `api-vida-cotizacion`, ejecuta la petición y retorna la respuesta con trazas completas.

---

## Notas para el Aliado

- Todas las peticiones a endpoints de negocio deben pasar por el proxy (`/api/proxy`) que inyecta automáticamente las credenciales de sandbox.
- La sesión expira tras 15 minutos de inactividad. Si recibe un 401, el socio debe re-autenticarse.
- Los errores con `reintentable: true` pueden reintentarse con backoff exponencial.
- Las especificaciones OpenAPI 3.1 de cada endpoint incluyen campos `x-ai-description` y `x-ai-capability` para integración con agentes AI.
- El campo `durationMs` en las respuestas del proxy permite monitorear la latencia de cada petición.
