# Plan de Implementación: Aviso Marca Roja

## Resumen

Implementación incremental de la aplicación "Aviso Marca Roja" para radicación de siniestros de Davivienda, usando React 18+ con TypeScript, CSS Modules, react-router-dom y Vitest con fast-check. Las tareas siguen un enfoque de capas: primero tipos y tokens de diseño, luego funciones puras de validación/serialización (con PBT), después componentes UI individuales, hooks y contexto, y finalmente integración de rutas y cableado completo.

## Tareas

- [ ] 1. Configurar tipos centrales, tokens de diseño y estructura del proyecto
  - [x] 1.1 Crear la estructura de directorios y archivo de tipos centrales
    - Crear carpeta `src/components/ClaimMarcaRoja/` con subcarpetas `hooks/` y `__tests__/`
    - Crear `src/components/ClaimMarcaRoja/types.ts` con todos los tipos e interfaces: `ProductoSeguro`, `ProductoSeguroConfig`, `TipoDocumento`, `DatosTitular`, `CampoFormulario`, `CampoValidationRule`, `ClaimFormData`, `UploadedFileRef`, `ClaimFormErrors`, `AIDetectionResult`, `AIDetectionError`, `EstadoCaso`, `CaseInfo`, `ESTADO_CASO_LABELS`, `ClaimFlowStep`, `ClaimFlowState`
    - Crear `src/components/ClaimMarcaRoja/api-types.ts` con los tipos de API: `DetectProductRequest`, `DetectProductResponse`, `SubmitClaimRequest`, `SubmitClaimResponse`, `ClaimApiError`
    - _Requisitos: 7.1, 9.2, 10.2, 11.1, 11.3_

  - [-] 1.2 Extender design tokens y definir rutas de Marca Roja
    - Añadir `MARCA_ROJA_TOKENS` en `src/components/ClaimLanding/constants.ts` con colores extendidos (`accent: #ED1C24`, `success`, `warning`, `error`, `backgroundWhite`), `borderRadius` (`card: 25px`, `button: 25px`, `input: 12px`) y `spacing` — sin romper los `DESIGN_TOKENS` existentes
    - Añadir `MARCA_ROJA_ROUTES` con las rutas: `entry`, `aiInput`, `aiValidation`, `categorySelect`, `form`, `tracking`, `help`
    - Crear configuración de productos de seguro (`ProductoSeguroConfig[]`) con los 4 productos: Deudores Davivienda, Protección de Pagos, Mascotas y Bicicletas, incluyendo campos específicos y documentos requeridos por producto
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 6.2, 11.1, 11.2, 11.3_

- [ ] 2. Implementar funciones puras de validación y serialización
  - [~] 2.1 Crear `src/lib/claim-validation.ts` con funciones de validación
    - Implementar `validarDatosTitular(datos)`: valida tipo de documento (CC, CE, TI, PA, NIT) y número de documento no vacío
    - Implementar `validarCamposProducto(producto, campos)`: valida campos según la configuración del producto (required, minLength, maxLength, pattern)
    - Implementar `validarFormularioCompleto(data)`: combina validación de titular + campos + documentos, retorna `{ valido, errores }`
    - Implementar `sanitizarTexto(input)`: elimina etiquetas HTML, escapa caracteres especiales, recorta espacios
    - Seguir el patrón existente de `vida-cotizar-validation.ts`
    - _Requisitos: 7.3, 7.4, 10.1, 10.4_

  - [~] 2.2 Crear `src/lib/claim-serialization.ts` con funciones de serialización
    - Implementar `serializarFormulario(data: ClaimFormData): string` — convierte a JSON string
    - Implementar `deserializarFormulario(json: string): ClaimFormData` — parsea y valida estructura
    - _Requisitos: 10.2, 10.3_

  - [~] 2.3 Crear `src/lib/document-validation.ts` con validación de archivos
    - Implementar `validarArchivo(file, maxSizeMB)`: retorna `{ valido, error? }` verificando tamaño ≤ maxSizeMB
    - Implementar `validarListaArchivos(files, maxSizeMB)`: valida cada archivo y retorna errores agregados
    - _Requisitos: 8.2, 8.3_

  - [ ]* 2.4 Escribir test de propiedad para validación de campos obligatorios
    - **Propiedad 5: Validación de campos obligatorios**
    - Generar `ClaimFormData` con `fc.record` donde uno o más campos obligatorios estén vacíos
    - Verificar que `validarFormularioCompleto` retorna `valido: false` con un error por cada campo faltante
    - **Valida: Requisitos 7.3, 7.4**

  - [ ]* 2.5 Escribir test de propiedad para validación de tamaño de archivo
    - **Propiedad 7: Validación de tamaño de archivo**
    - Generar tamaños con `fc.nat()` y verificar que archivos > 10MB retornan `valido: false` y archivos ≤ 10MB retornan `valido: true`
    - **Valida: Requisitos 8.2, 8.3**

  - [ ]* 2.6 Escribir test de propiedad para round-trip de serialización
    - **Propiedad 13: Round-trip de serialización de formulario**
    - Generar `ClaimFormData` válidos con `fc.record` y verificar que `deserializarFormulario(serializarFormulario(data))` produce un objeto equivalente al original
    - **Valida: Requisitos 10.2, 10.3**

  - [ ]* 2.7 Escribir test de propiedad para sanitización de texto
    - **Propiedad 14: Sanitización de texto**
    - Generar cadenas con `fc.string()` y cadenas con HTML inyectado; verificar que la salida no contiene etiquetas HTML sin escapar y que texto sin HTML preserva su contenido
    - **Valida: Requisito 10.4**

  - [ ]* 2.8 Escribir tests unitarios para funciones de validación y serialización
    - Tests para `validarDatosTitular`: casos con tipo CC válido, tipo inválido, número vacío
    - Tests para `validarCamposProducto`: campos específicos por producto, campos faltantes
    - Tests para `sanitizarTexto`: cadenas con `<script>`, `<img onerror>`, texto normal
    - Tests para `serializarFormulario`/`deserializarFormulario`: caso exitoso, JSON malformado
    - Tests para `validarArchivo`: archivo de 5MB (válido), archivo de 15MB (inválido), archivo de exactamente 10MB (válido)
    - _Requisitos: 7.3, 7.4, 8.2, 8.3, 10.1, 10.2, 10.3, 10.4_

- [~] 3. Checkpoint — Verificar funciones puras y PBT
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [ ] 4. Implementar componentes de cabecera y pantalla de entrada
  - [~] 4.1 Crear `EnhancedHeaderBar` con enlaces de Ayuda y Seguir mi caso
    - Crear `src/components/ClaimMarcaRoja/EnhancedHeaderBar.tsx` y `EnhancedHeaderBar.module.css`
    - Renderizar franja roja + logo Casita Roja alineado a la izquierda (reutilizando patrón de `HeaderBar`)
    - Añadir enlaces "Ayuda" y "Seguir mi caso" alineados a la derecha con `role="navigation"`
    - Props: `logoSrc`, `logoAlt`, `onHelpClick`, `onTrackCaseClick`, `showHelpLink`, `showTrackCaseLink`
    - Aplicar `role="banner"` al header y `:focus-visible` con outline en enlaces
    - Responsivo: padding y font-size reducidos en móvil (<768px)
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 12.1_

  - [~] 4.2 Crear `EntryRouterPage` con tarjetas de flujo IA y autoservicio
    - Crear `src/components/ClaimMarcaRoja/EntryRouterPage.tsx` y `EntryRouterPage.module.css`
    - Renderizar título "¿Cómo quieres reportar lo ocurrido hoy?"
    - Renderizar dos tarjetas reutilizando el componente `ActionCard` existente con border-radius 25px
    - Tarjeta IA: título "Cuéntanos tu historia", descripción "Usa tus propias palabras para describir qué pasó. Nuestra IA te ayudará a identificar tu seguro"
    - Tarjeta Autoservicio: título "Elegir manualmente", descripción "Selecciona directamente el tipo de seguro y completa el formulario", con íconos de los 4 productos
    - Props: `onSelectAIFlow`, `onSelectSelfServiceFlow`
    - Tarjetas con `role="button"`, `tabIndex={0}`, activables con Enter/Space
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 12.1, 12.2_

  - [ ]* 4.3 Escribir tests unitarios para `EnhancedHeaderBar` y `EntryRouterPage`
    - Test de `EnhancedHeaderBar`: logo renderizado, enlaces Ayuda y Seguir mi caso visibles, navegación por Tab, click en Seguir mi caso invoca callback
    - Test de `EntryRouterPage`: título renderizado, dos tarjetas con textos correctos, click en tarjeta IA invoca `onSelectAIFlow`, click en tarjeta autoservicio invoca `onSelectSelfServiceFlow`, navegación por teclado
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_

- [ ] 5. Implementar flujo asistido por IA
  - [~] 5.1 Crear `AIFlowTextInput` para entrada de texto libre
    - Crear `src/components/ClaimMarcaRoja/AIFlowTextInput.tsx` y `AIFlowTextInput.module.css`
    - Renderizar textarea con placeholder "Ej: Tuve una incapacidad médica que me impide trabajar..."
    - Mostrar indicador de carga (`role="status"`, `aria-live="polite"`) mientras el motor procesa
    - Mostrar mensaje de error con opciones de reintentar o cambiar a autoservicio si la detección falla
    - Props: `onSubmit`, `onBack`, `isLoading`, `error`, `onRetry`, `onSwitchToManual`
    - Botón de envío deshabilitado si el textarea está vacío
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 12.2_

  - [~] 5.2 Crear `AIValidationScreen` para confirmar producto detectado
    - Crear `src/components/ClaimMarcaRoja/AIValidationScreen.tsx` y `AIValidationScreen.module.css`
    - Renderizar mensaje "Detectamos que esto corresponde a tu seguro de [nombre del producto]" con el nombre destacado
    - Botones "Confirmar" y "Cambiar" con navegación por Tab
    - Props: `detectedProduct`, `confidenceMessage`, `onConfirm`, `onReject`, `onBack`
    - Aplicar `role="alertdialog"` al contenedor
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 12.2_

  - [ ]* 5.3 Escribir tests unitarios para `AIFlowTextInput` y `AIValidationScreen`
    - Test de `AIFlowTextInput`: textarea con placeholder, estado loading visible, mensaje de error con opciones, botón deshabilitado con textarea vacío
    - Test de `AIValidationScreen`: mensaje contiene nombre del producto, botón confirmar invoca callback, botón rechazar invoca callback
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4_

- [ ] 6. Implementar flujo de autoservicio y formulario dinámico
  - [~] 6.1 Crear `SelfServiceCategorySelector` para selección de categoría
    - Crear `src/components/ClaimMarcaRoja/SelfServiceCategorySelector.tsx` y `SelfServiceCategorySelector.module.css`
    - Renderizar 4 tarjetas seleccionables (Deudores Davivienda, Protección de Pagos, Mascotas, Bicicletas) con íconos
    - Reutilizar patrón visual de `ActionCard` con border-radius 25px
    - Props: `categories`, `onSelectCategory`, `onBack`
    - Navegación por teclado con flechas + Enter/Space
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 12.2_

  - [~] 6.2 Crear `DynamicClaimForm` con campos dinámicos por producto
    - Crear `src/components/ClaimMarcaRoja/DynamicClaimForm.tsx` y `DynamicClaimForm.module.css`
    - Renderizar sección de `DatosTitular` (tipo documento como select, número documento como text) siempre presente
    - Renderizar campos dinámicos según `ProductoSeguroConfig.campos` del producto seleccionado
    - Integrar `DocumentUploader` antes de campos complejos
    - Mostrar mensajes de error inline junto a cada campo inválido con `aria-describedby`
    - Botón de envío habilitado solo cuando todos los campos obligatorios están completos y hay al menos un documento
    - Props: `product`, `onSubmit`, `onBack`, `isSubmitting`
    - Usar el hook `useClaimForm` para estado y validación
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 12.2, 12.3_

  - [~] 6.3 Crear `DocumentUploader` con drag & drop y barra de progreso
    - Crear `src/components/ClaimMarcaRoja/DocumentUploader.tsx` y `DocumentUploader.module.css`
    - Implementar botón de carga y zona de drag & drop
    - Mostrar nombre, tamaño formateado y estado de cada archivo
    - Mostrar barra de progreso para archivos en estado `uploading`
    - Botón de eliminar archivo con confirmación por teclado (Enter/Space/Delete)
    - Validar tamaño máximo 10MB por archivo usando `validarArchivo`
    - Props: `files`, `onAddFiles`, `onRemoveFile`, `maxFileSizeMB`, `acceptedTypes`
    - Completamente operable por teclado
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 12.4_

  - [ ]* 6.4 Escribir test de propiedad para eliminación de archivo
    - **Propiedad 9: Eliminación de archivo**
    - Generar listas de `UploadedFile` con `fc.array(uploadedFileArb)` y un índice con `fc.nat()`; verificar que al eliminar un archivo la lista tiene longitud reducida en uno y no contiene el archivo eliminado
    - **Valida: Requisito 8.5**

  - [ ]* 6.5 Escribir tests unitarios para `SelfServiceCategorySelector`, `DynamicClaimForm` y `DocumentUploader`
    - Test de `SelfServiceCategorySelector`: 4 categorías renderizadas, click selecciona categoría, navegación por teclado
    - Test de `DynamicClaimForm`: campos de titular siempre presentes, campos dinámicos por producto, errores inline, botón envío habilitado/deshabilitado
    - Test de `DocumentUploader`: botón de carga, drag & drop, barra de progreso, eliminar archivo, error por archivo > 10MB, operable por teclado
    - _Requisitos: 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [~] 7. Checkpoint — Verificar componentes UI y flujos
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [ ] 8. Implementar panel de seguimiento de casos
  - [~] 8.1 Crear `CaseTrackingPanel` con lista de casos y descarga de cartas
    - Crear `src/components/ClaimMarcaRoja/CaseTrackingPanel.tsx` y `CaseTrackingPanel.module.css`
    - Renderizar lista de casos con producto, estado (usando `ESTADO_CASO_LABELS`), fecha de radicación
    - Mostrar razón de estado para casos "anulado" o "cerrado" que tengan `razonEstado`
    - Mostrar botón de descarga de carta PDF solo si `tieneCartaDefinicion` es `true`
    - Mostrar mensaje "No se encontraron casos registrados" si la lista está vacía
    - Mostrar estado de carga y error con botón de reintento
    - Props: `cases`, `isLoading`, `error`, `onDownloadLetter`, `onBack`
    - Navegación por teclado entre filas y botones de descarga
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 12.2_

  - [ ]* 8.2 Escribir test de propiedad para mapeo de etiquetas de estado
    - **Propiedad 10: Mapeo de etiquetas de estado de caso**
    - Generar `EstadoCaso` con `fc.constantFrom('en-analisis', 'pendiente-documentos', 'anulado', 'cerrado')` y verificar que `ESTADO_CASO_LABELS` retorna la etiqueta en español correspondiente
    - **Valida: Requisito 9.2**

  - [ ]* 8.3 Escribir tests unitarios para `CaseTrackingPanel`
    - Test de renderizado de lista de casos con estados correctos
    - Test de razón de estado visible para casos anulados/cerrados
    - Test de botón de descarga visible solo cuando `tieneCartaDefinicion` es true
    - Test de mensaje vacío cuando no hay casos
    - Test de estado de carga y error con reintento
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 9. Implementar hooks personalizados y contexto de flujo
  - [~] 9.1 Crear `ClaimFlowContext` y `ClaimFlowProvider`
    - Crear `src/components/ClaimMarcaRoja/ClaimFlowContext.tsx`
    - Implementar `ClaimFlowState` con `flowType`, `selectedProduct`, `aiInputText`, `step`
    - Implementar acciones: `setFlowType`, `setSelectedProduct`, `setAiInputText`, `setStep`, `reset`
    - Envolver todas las rutas de Marca Roja en el provider
    - _Requisitos: 3.6, 3.7, 5.3, 5.4, 6.3, 11.2_

  - [~] 9.2 Crear hooks `useClaimForm`, `useDocumentUpload`, `useCaseTracking` y `useAIDetection`
    - Crear `src/components/ClaimMarcaRoja/hooks/useClaimForm.ts`: gestión de estado del formulario, validación con funciones puras, serialización
    - Crear `src/components/ClaimMarcaRoja/hooks/useDocumentUpload.ts`: gestión de archivos, validación de tamaño, add/remove
    - Crear `src/components/ClaimMarcaRoja/hooks/useCaseTracking.ts`: fetch de casos, descarga de carta PDF, refresh
    - Crear `src/components/ClaimMarcaRoja/hooks/useAIDetection.ts`: llamada a `/api/claims/detect`, gestión de loading/error/result
    - _Requisitos: 4.3, 7.1, 7.6, 8.1, 8.5, 9.1, 9.4, 9.5, 10.1, 10.2_

  - [ ]* 9.3 Escribir tests unitarios para hooks y contexto
    - Test de `ClaimFlowContext`: estado inicial, setFlowType, setSelectedProduct, reset
    - Test de `useClaimForm`: updateField, validate con campos vacíos, serialize
    - Test de `useDocumentUpload`: addFiles, removeFile, validación de tamaño
    - Test de `useCaseTracking`: fetch exitoso, error, refresh
    - Test de `useAIDetection`: detect exitoso, error, reset
    - _Requisitos: 3.6, 4.3, 7.1, 8.1, 9.1, 10.1_

- [ ] 10. Implementar API Routes del backend
  - [~] 10.1 Crear endpoint `POST /api/claims/detect` para detección IA
    - Crear `app/api/claims/detect/route.ts`
    - Validar entrada (`texto` no vacío, sanitizado)
    - Implementar módulo `app/lib/claim-detection.ts` con interfaz clara y mock inicial que mapea palabras clave a productos
    - Retornar `DetectProductResponse` con producto, confianza y mensaje
    - Manejar errores con `ClaimApiError`
    - _Requisitos: 4.3, 5.1_

  - [~] 10.2 Crear endpoint `POST /api/claims/submit` para envío de reclamación
    - Crear `app/api/claims/submit/route.ts`
    - Validar entrada completa con `validarFormularioCompleto`
    - Retornar `SubmitClaimResponse` con caseId, mensaje y estado inicial
    - Mock de persistencia en desarrollo
    - _Requisitos: 7.6, 10.1, 10.2_

  - [~] 10.3 Crear endpoints `GET /api/claims/cases` y `GET /api/claims/cases/:id/letter`
    - Crear `app/api/claims/cases/route.ts` para listar casos del usuario
    - Crear `app/api/claims/cases/[id]/letter/route.ts` para descarga de carta PDF
    - Retornar `CaseInfo[]` y `Blob (application/pdf)` respectivamente
    - Mock de datos en desarrollo
    - _Requisitos: 9.1, 9.4, 9.5_

  - [ ]* 10.4 Escribir tests unitarios para API Routes
    - Test de `/api/claims/detect`: texto válido retorna producto, texto vacío retorna 400
    - Test de `/api/claims/submit`: formulario válido retorna caseId, formulario inválido retorna 400 con errores
    - Test de `/api/claims/cases`: retorna lista de casos mock
    - Usar mocks estrictos sin conexiones reales a BD o APIs externas
    - _Requisitos: 4.3, 7.6, 9.1, 10.1_

- [~] 11. Checkpoint — Verificar hooks, contexto y API Routes
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [ ] 12. Integración de rutas y cableado completo
  - [~] 12.1 Configurar rutas de react-router-dom con `ClaimFlowProvider`
    - Registrar todas las rutas de `MARCA_ROJA_ROUTES` en la configuración de react-router-dom
    - Envolver rutas en `ClaimFlowProvider` para compartir estado entre pantallas
    - Conectar `EntryRouterPage` → `AIFlowTextInput` / `SelfServiceCategorySelector`
    - Conectar `AIFlowTextInput` → `AIValidationScreen` → `DynamicClaimForm`
    - Conectar `SelfServiceCategorySelector` → `DynamicClaimForm`
    - Conectar `EnhancedHeaderBar` → `CaseTrackingPanel` vía "Seguir mi caso"
    - _Requisitos: 3.6, 3.7, 5.3, 5.4, 6.3, 11.2_

  - [ ]* 12.2 Escribir test de propiedad para convergencia de enrutamiento
    - **Propiedad 15: Convergencia de enrutamiento por producto**
    - Generar combinaciones de `ProductoSeguro` × tipo de flujo (`ai`, `self-service`) con `fc.constantFrom` y verificar que ambos flujos enrutan al mismo `DynamicClaimForm` con la misma configuración de campos
    - **Valida: Requisitos 11.1, 11.2**

  - [ ]* 12.3 Escribir tests de integración para flujos completos
    - Test de flujo IA completo: entrada → texto → detección → validación → formulario → envío
    - Test de flujo autoservicio completo: entrada → categoría → formulario → envío
    - Test de navegación a seguimiento desde cabecera
    - Test de cambio de flujo IA a autoservicio cuando la detección falla
    - _Requisitos: 3.6, 3.7, 4.3, 5.3, 5.4, 6.3, 7.6, 11.2_

- [ ] 13. Accesibilidad y responsividad final
  - [~] 13.1 Revisar y ajustar accesibilidad en todos los componentes
    - Verificar roles ARIA en todos los componentes según la tabla del diseño (`banner`, `navigation`, `form`, `radiogroup`, `alertdialog`, `status`, `button`, `list`)
    - Verificar navegación completa por teclado (Tab, Enter, Space, Escape, flechas) en todos los flujos
    - Verificar orden de foco lógico y visible en formularios y pantallas
    - Verificar que `DocumentUploader` es completamente operable por teclado
    - Verificar `aria-live="polite"` en indicadores de carga y mensajes de error
    - _Requisitos: 12.1, 12.2, 12.3, 12.4_

  - [~] 13.2 Revisar responsividad en todos los componentes
    - Verificar layout en desktop (≥768px) y móvil (<768px)
    - Verificar border-radius de 25px en tarjetas y botones
    - Verificar que los design tokens de `MARCA_ROJA_TOKENS` se aplican correctamente
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 13.3 Escribir tests de accesibilidad
    - Verificar navegación completa por teclado sin trampas de foco en cada flujo
    - Verificar que todos los elementos interactivos tienen nombres accesibles
    - Verificar roles ARIA por componente
    - _Requisitos: 12.1, 12.2, 12.3, 12.4_

- [~] 14. Checkpoint final — Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades (P5, P7, P9, P10, P13, P14, P15) validan propiedades universales de correctitud definidas en el diseño
- Los tests unitarios validan ejemplos específicos y casos borde
- Todos los tests usan mocks estrictos — prohibido conectar a BD o APIs reales (CONECTA)
