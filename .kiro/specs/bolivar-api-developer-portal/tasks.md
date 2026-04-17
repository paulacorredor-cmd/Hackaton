# Plan de Implementación: Bolívar API Developer Portal

## Visión General

Implementación incremental del portal de desarrolladores de Seguros Bolívar usando Next.js 14 (App Router), TypeScript, Tailwind CSS y Vitest con fast-check para property-based testing. Cada tarea construye sobre las anteriores, integrando componentes progresivamente hasta completar los tres módulos principales: Onboarding, Catálogo de APIs y AI Playground.

## Tareas

- [x] 1. Configurar estructura del proyecto y componentes compartidos
  - [x] 1.1 Inicializar proyecto Next.js 14 con App Router, Tailwind CSS, Lucide React y configurar Vitest con fast-check
    - Crear `app/layout.tsx` raíz con providers, fuente Inter y paleta institucional (amarillo #FFD700, verde #00843D, blanco #FFFFFF)
    - Configurar `tailwind.config.ts` con colores institucionales y breakpoints (escritorio ≥1024px, móvil <768px)
    - Instalar y configurar `fast-check` como dependencia de desarrollo
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Crear componentes UI compartidos: NavBar, CopyToClipboard, ErrorMessage
    - Implementar `NavBar` con logotipo de Seguros Bolívar y enlaces a Onboarding, Catálogo y AI Playground
    - Implementar `CopyToClipboard` con enmascaramiento, revelación temporal (5s) y confirmación visual (2s)
    - Implementar `ErrorMessage` con `aria-live="polite"` y asociación a campos de formulario
    - Tamaño mínimo de fuente 14px en móvil, navegación completa por teclado
    - _Requisitos: 1.1, 1.5, 4.3, 4.4, 4.5, 11.1, 11.4_

  - [x] 1.3 Escribir tests unitarios para componentes compartidos
    - Test de renderizado de NavBar con enlaces y logotipo
    - Test de CopyToClipboard: copiar, enmascarar, revelar, confirmación visual
    - Test de ErrorMessage: renderizado, aria-live, asociación a campo
    - _Requisitos: 1.1, 4.3, 4.4, 4.5, 11.4_

  - [x] 1.4 Escribir test de propiedad para enmascaramiento de secretos
    - **Propiedad 3: Enmascaramiento round-trip de secretos**
    - **Valida: Requisitos 4.4**

- [x] 2. Checkpoint — Verificar que todos los tests pasan
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 3. Implementar módulo de Onboarding
  - [x] 3.1 Crear layout del stepper de onboarding y página de registro
    - Implementar `app/onboarding/layout.tsx` con stepper visual de 3 pasos
    - Implementar `app/onboarding/registro/page.tsx` con `RegistroForm` (NIT, razón social, representante legal, correo, documento PDF)
    - Validación de NIT con patrón `^\d{9}-\d{1}$`, validación de email, PDF máximo 10MB
    - Cada campo con etiqueta visible y `aria-label` descriptivo
    - Mensajes de error inline junto a cada campo inválido
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 11.3_

  - [x] 3.2 Escribir test de propiedad para validación de formulario de registro
    - **Propiedad 1: Validación de formulario de registro rechaza datos inválidos**
    - **Valida: Requisitos 2.5**

  - [x] 3.3 Escribir test de propiedad para validación de formato NIT
    - **Propiedad 2: Validación de formato NIT acepta solo el patrón correcto**
    - **Valida: Requisitos 2.6**

  - [x] 3.4 Crear página de aceptación de términos
    - Implementar `app/onboarding/terminos/page.tsx` con panel desplazable de texto legal
    - Casilla de verificación con texto "Acepto los términos y condiciones de Open Insurance según la Circular 005"
    - Botón "Continuar" deshabilitado mientras la casilla no esté marcada
    - Registrar aceptación con marca de tiempo al continuar
    - _Requisitos: 3.1, 3.2, 3.3, 3.4_

  - [x] 3.5 Crear página de confirmación de sandbox con credenciales
    - Implementar `app/onboarding/sandbox/page.tsx` con pantalla de confirmación
    - Mostrar Client_ID y Client_Secret usando `CopyToClipboard`
    - Client_Secret oculto por defecto con opción de revelación temporal
    - Mensaje de error con botón de reintento si la creación falla (máximo 3 reintentos)
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 10.3_

  - [x] 3.6 Escribir tests unitarios para el flujo de onboarding
    - Test de renderizado de formulario de registro: campos, labels, aria-labels
    - Test de página de términos: checkbox, botón deshabilitado, navegación
    - Test de página de sandbox: credenciales, copiar, error/reintento
    - _Requisitos: 2.1, 2.2, 3.1, 3.2, 3.3, 4.2, 4.6_

- [x] 4. Checkpoint — Verificar módulo de Onboarding
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [ ] 5. Implementar módulo de Catálogo de APIs
  - [x] 5.1 Crear tipos, utilidades de filtrado y función de generación de manifiesto AI
    - Definir interfaces `ApiDefinition`, `LineaSeguro`, `ManifiestoAI`, `ManifiestoTool`
    - Implementar función de filtrado de APIs por línea de seguro (incluyendo filtro 'todas')
    - Implementar función de generación de manifiesto AI con estructura GPT-4 Tools
    - _Requisitos: 5.1, 5.4, 7.2, 7.4_

  - [x] 5.2 Escribir test de propiedad para filtrado de APIs por línea de seguro
    - **Propiedad 4: Clasificación y filtrado de APIs por línea de seguro**
    - **Valida: Requisitos 5.1, 5.4**

  - [x] 5.3 Escribir test de propiedad para generación de manifiesto AI
    - **Propiedad 7: Generación de manifiesto AI con filtrado correcto**
    - **Valida: Requisitos 7.2, 7.4**

  - [x] 5.4 Crear página del catálogo con tarjetas de API y filtros
    - Implementar `app/catalogo/page.tsx` con secciones por línea de seguro (Vida, Hogar, Autos, Salud)
    - Implementar componente `TarjetaApi` con nombre, descripción semántica (x-ai-description) e indicador de línea
    - Pestañas/botones de filtro por línea de seguro
    - Botón "Exportar Manifiesto AI" que genera y descarga `bolivar-ai-manifest.json`
    - Encabezados semánticos h2/h3 para secciones y tarjetas
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.3, 11.5_

  - [x] 5.5 Escribir test de propiedad para contenido de TarjetaApi
    - **Propiedad 5: Tarjeta API contiene información requerida**
    - **Valida: Requisitos 5.3**

  - [~] 5.6 Escribir tests unitarios para catálogo y tarjetas
    - Test de renderizado de secciones por línea de seguro
    - Test de navegación al seleccionar tarjeta
    - Test de botón de exportar manifiesto
    - _Requisitos: 5.1, 5.2, 5.5, 7.1_

- [ ] 6. Implementar Visor de Documentación y proxy de sandbox
  - [~] 6.1 Crear visor de documentación interactivo y API Route de proxy
    - Implementar `app/catalogo/[apiId]/page.tsx` con renderizado de especificación OpenAPI 3.1
    - Mostrar lista de endpoints, métodos HTTP, parámetros y esquemas de respuesta
    - Implementar formulario de petición de prueba con credenciales sandbox precargadas
    - Implementar `app/api/proxy/route.ts` para enrutar peticiones al sandbox sin exponer credenciales
    - Mostrar código de estado, encabezados y cuerpo JSON de la respuesta
    - Manejo de errores de red/timeout con mensaje descriptivo y sugerencia de resolución
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [~] 6.2 Escribir test de propiedad para formateo de respuesta HTTP
    - **Propiedad 6: Formateo de respuesta HTTP incluye todos los campos**
    - **Valida: Requisitos 6.3**

  - [~] 6.3 Escribir tests unitarios para visor de documentación
    - Test de renderizado de especificación OpenAPI
    - Test de credenciales precargadas
    - Test de manejo de errores de red/timeout
    - _Requisitos: 6.1, 6.4, 6.5_

- [~] 7. Checkpoint — Verificar módulo de Catálogo
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 8. Implementar módulo AI Playground
  - [x] 8.1 Crear layout del AI Playground con paneles Chat y Log
    - Implementar `app/playground/page.tsx` con interfaz dividida: Panel_Chat (izquierda) y Panel_Log (derecha)
    - Implementar `PanelChat` con campo de entrada de texto, historial de mensajes (socio/agente) y estado de carga
    - Implementar `PanelLog` con pasos de traza expandibles, colores diferenciados (interpretación: #FFD700, petición: #00843D, respuesta: #FFFFFF sobre fondo oscuro)
    - Cada paso con marca de tiempo y duración en milisegundos
    - Integrar `CopyToClipboard` para copiar JSON de cualquier paso
    - Navegación completa por teclado
    - _Requisitos: 8.1, 8.2, 8.3, 8.5, 9.1, 9.2, 9.3, 9.4, 11.1_

  - [x] 8.2 Escribir test de propiedad para historial de chat
    - **Propiedad 8: Historial de chat preserva orden y contenido**
    - **Valida: Requisitos 8.3**

  - [x] 8.3 Escribir test de propiedad para renderizado de pasos de traza
    - **Propiedad 9: Renderizado de pasos de traza incluye información completa**
    - **Valida: Requisitos 8.5, 9.1**

  - [x] 8.4 Implementar API Route del agente AI y streaming de trazas
    - Implementar `app/api/ai/chat/route.ts` con endpoint para procesar instrucciones en lenguaje natural
    - Identificar endpoint correspondiente a la instrucción del socio
    - Ejecutar petición al sandbox con credenciales del socio autenticado
    - Enviar trazas al cliente vía Server-Sent Events para visualización en tiempo real
    - _Requisitos: 8.4, 8.5, 8.6_

  - [x] 8.5 Escribir tests unitarios para AI Playground
    - Test de layout de paneles (chat + log)
    - Test de campo de entrada y envío de mensajes
    - Test de expansión de pasos en Panel_Log
    - _Requisitos: 8.1, 8.2, 9.3_

- [x] 9. Checkpoint — Verificar módulo AI Playground
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 10. Implementar seguridad, autenticación y auditoría
  - [x] 10.1 Configurar autenticación OAuth 2.0 + OIDC y middleware de protección de rutas
    - Implementar `app/api/auth/[...nextauth]/route.ts` con proveedor OAuth 2.0 + OpenID Connect
    - Crear middleware para proteger rutas de catálogo y playground (requieren autenticación)
    - Implementar `app/api/sandbox/route.ts` para creación de aplicación sandbox
    - _Requisitos: 10.1, 10.2_

  - [x] 10.2 Implementar verificación de expiración de sesión y log de auditoría
    - Implementar función de verificación de sesión: expirada si inactividad ≥ 15 minutos
    - Cierre automático de sesión con redirección a login y mensaje informativo
    - Registrar acciones del socio (login, peticiones sandbox, exportación manifiesto) en log de auditoría con timestamp e ID del socio
    - _Requisitos: 10.4, 10.5_

  - [x] 10.3 Escribir test de propiedad para expiración de sesión
    - **Propiedad 10: Expiración de sesión por inactividad**
    - **Valida: Requisitos 10.4**

  - [x] 10.4 Escribir tests unitarios para seguridad
    - Test de enmascaramiento de Client_Secret
    - Test de redirección a login por sesión expirada
    - _Requisitos: 10.3, 10.4_

- [x] 11. Implementar tests de accesibilidad
  - [x] 11.1 Crear suite de tests de accesibilidad para todos los módulos
    - Verificar navegación completa por teclado en cada módulo (catálogo, playground, onboarding)
    - Verificar contraste mínimo 4.5:1 con combinaciones de colores institucionales
    - Verificar presencia de `aria-label` en todos los campos de formulario
    - Verificar `aria-live="polite"` en contenedores de mensajes de error/confirmación
    - Verificar estructura semántica con h2/h3 en catálogo
    - _Requisitos: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 12. Integración final y cableado de módulos
  - [x] 12.1 Conectar flujo completo de onboarding con autenticación y catálogo
    - Integrar registro → términos → sandbox → redirección a catálogo
    - Asegurar que credenciales sandbox se propagan al visor de documentación y AI Playground
    - Conectar middleware de autenticación con todos los módulos protegidos
    - _Requisitos: 2.4, 3.4, 4.1, 8.6, 10.1_

  - [x] 12.2 Crear página de landing/home
    - Implementar `app/page.tsx` con presentación del portal y acceso a onboarding
    - _Requisitos: 1.1_

  - [x] 12.3 Escribir tests de integración
    - Test de flujo completo de onboarding (registro → términos → sandbox)
    - Test de peticiones al sandbox desde visor de documentación
    - Test de interacción con agente AI en playground
    - _Requisitos: 2.4, 3.4, 4.1, 6.2, 8.4_

- [x] 13. Checkpoint final — Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades validan propiedades universales de correctitud definidas en el diseño
- Los tests unitarios validan ejemplos específicos y casos borde
