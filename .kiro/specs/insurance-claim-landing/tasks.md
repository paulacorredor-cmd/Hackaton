# Plan de Implementación: Insurance Claim Landing

## Resumen

Implementación de la página de aterrizaje para reclamaciones de seguros utilizando React 18+ con TypeScript, CSS Modules y React Router v6. Las tareas siguen un enfoque incremental: primero la estructura base y tokens de diseño, luego los componentes individuales, después la integración en la página principal, y finalmente los tests.

## Tareas

- [x] 1. Configurar estructura del proyecto y tokens de diseño
  - [x] 1.1 Crear la estructura de directorios para los componentes y estilos
    - Crear carpeta `src/components/ClaimLanding/` con subcarpetas por componente
    - Crear archivo de tipos compartidos `src/components/ClaimLanding/types.ts` con las interfaces `ClaimMode`, `RadioOptionConfig`, `LandingPageState`
    - Crear archivo de constantes `src/components/ClaimLanding/constants.ts` con `DESIGN_TOKENS`, `MODE_OPTIONS` y `ROUTES`
    - _Requisitos: 1.1, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4_

  - [x] 1.2 Crear los archivos base de CSS Modules con tokens de diseño
    - Crear `tokens.module.css` con variables CSS para colores (`--color-primary: #ED1C27`), breakpoints, tipografía y layout
    - Definir media queries reutilizables para desktop (≥1024px) y móvil (<768px)
    - _Requisitos: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Implementar componentes de cabecera y navegación
  - [x] 2.1 Implementar el componente `HeaderBar`
    - Crear `HeaderBar.tsx` y `HeaderBar.module.css`
    - Renderizar barra superior con fondo rojo (#ED1C27) y logotipo de Davivienda
    - Props: `logoSrc`, `logoAlt`
    - _Requisitos: 1.1_

  - [x] 2.2 Implementar el componente `BackLink`
    - Crear `BackLink.tsx` y `BackLink.module.css`
    - Renderizar enlace "Volver" con ícono de flecha hacia la izquierda
    - Usar React Router `Link` o `useNavigate` para la navegación
    - Props: `href`, `label` (default: "Volver")
    - _Requisitos: 1.2_

  - [x] 2.3 Escribir tests unitarios para `HeaderBar` y `BackLink`
    - Verificar que `HeaderBar` renderiza el logotipo con `alt` correcto y fondo rojo
    - Verificar que `BackLink` renderiza "Volver" con ícono y navega correctamente
    - _Requisitos: 1.1, 1.2_

- [x] 3. Implementar el componente `InfoBanner`
  - [x] 3.1 Crear `InfoBanner.tsx` y `InfoBanner.module.css`
    - Renderizar texto "Consejos para hacer su reporte más rápido"
    - Incluir enlace "Ver requisitos" que invoca `onViewRequirements`
    - Incluir botón de cierre que invoca `onClose`
    - Aplicar `role="alert"` o `role="status"` al contenedor
    - Renderizar condicionalmente según prop `isVisible`
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 7.4_

  - [x] 3.2 Escribir tests unitarios para `InfoBanner`
    - Verificar renderizado de texto, enlace "Ver requisitos" y botón de cierre
    - Verificar que se oculta al presionar el botón de cierre
    - Verificar atributo `role` para accesibilidad
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 7.4_

- [x] 4. Implementar el componente `ModeSelector`
  - [x] 4.1 Crear `ModeSelector.tsx` y `ModeSelector.module.css`
    - Renderizar dos opciones tipo radio con título, descripción y badge opcional
    - Implementar `role="radiogroup"` en el contenedor con `aria-labelledby`
    - Implementar `role="radio"` y `aria-checked` en cada opción
    - Implementar navegación por teclado (Tab, flechas arriba/abajo, Enter/Space)
    - Resaltar visualmente la opción seleccionada con borde o fondo diferenciado
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2_

  - [x] 4.2 Escribir tests unitarios para `ModeSelector`
    - Verificar renderizado de ambas opciones con títulos, descripciones e insignia
    - Verificar selección exclusiva (solo una opción a la vez)
    - Verificar atributos ARIA (`role="radiogroup"`, `role="radio"`, `aria-checked`)
    - Verificar navegación por teclado
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2_

- [x] 5. Implementar componentes `StartButton` y `ActionCard`
  - [x] 5.1 Crear `StartButton.tsx` y `StartButton.module.css`
    - Renderizar botón "Iniciar proceso" con fondo rojo
    - Implementar estado deshabilitado visual y funcional cuando `isEnabled` es `false`
    - Aplicar `aria-disabled` según el estado
    - Prevenir click cuando está deshabilitado
    - _Requisitos: 4.1, 4.2, 4.3, 7.3_

  - [x] 5.2 Crear `ActionCard.tsx` y `ActionCard.module.css`
    - Renderizar tarjeta con título, descripción, ícono ilustrativo y flecha de navegación
    - Hacer la tarjeta clickeable e invocable por teclado (Enter/Space)
    - Props: `title`, `description`, `iconSrc`, `iconAlt`, `onClick`
    - _Requisitos: 5.2, 5.3, 7.1_

  - [x] 5.3 Escribir tests unitarios para `StartButton` y `ActionCard`
    - Verificar texto "Iniciar proceso", estados habilitado/deshabilitado y `aria-disabled`
    - Verificar que `ActionCard` renderiza título, descripción, ícono y es activable por teclado
    - _Requisitos: 4.1, 4.2, 4.3, 5.2, 5.3, 7.1, 7.3_

- [x] 6. Checkpoint - Verificar componentes individuales
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 7. Integrar componentes en `ClaimLandingPage`
  - [x] 7.1 Crear `ClaimLandingPage.tsx` y `ClaimLandingPage.module.css`
    - Gestionar estado con `useState`: `selectedMode` (null | 'assisted' | 'self-service') y `isBannerVisible` (true)
    - Componer todos los componentes en el orden correcto: HeaderBar → BackLink → InfoBanner → Título → Subtítulo → ModeSelector → StartButton → Texto solicitudes existentes → ActionCards
    - Implementar navegación con React Router al presionar StartButton según el modo seleccionado
    - Implementar navegación de ActionCards a rutas de retomar y consultar
    - Aplicar estilos responsivos: contenedor centrado con ancho máximo para desktop, layout fluido para móvil
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 2.4, 4.4, 4.5, 5.1, 5.4, 5.5, 6.2, 6.4_

  - [x] 7.2 Escribir tests de integración para `ClaimLandingPage`
    - Verificar renderizado de todos los componentes en orden correcto
    - Verificar flujo completo: seleccionar modo asistido → click "Iniciar proceso" → navegación correcta
    - Verificar flujo completo: seleccionar modo autoservicio → click "Iniciar proceso" → navegación correcta
    - Verificar cierre de banner sin afectar el resto de la página
    - Verificar que botón deshabilitado no navega
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 2.4, 3.4, 4.2, 4.3, 4.4, 4.5, 5.4, 5.5_

- [x] 8. Estilos responsivos y accesibilidad final
  - [x] 8.1 Revisar y ajustar estilos responsivos en todos los componentes
    - Verificar layout en desktop (≥1024px) y móvil (<768px)
    - Asegurar tamaño mínimo de fuente de 14px en móvil
    - Verificar contraste de colores 4.5:1 entre texto y fondo
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 7.5_

  - [x] 8.2 Escribir tests de accesibilidad y responsividad
    - Verificar navegación completa por teclado sin trampas de foco
    - Verificar que todos los elementos interactivos tienen nombres accesibles
    - Verificar adaptación de layout a diferentes viewports
    - _Requisitos: 6.2, 6.3, 7.1, 7.5_

- [x] 9. Checkpoint final - Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido.
- Cada tarea referencia requisitos específicos para trazabilidad.
- Los checkpoints aseguran validación incremental.
- No se incluyen property-based tests dado que la página tiene un espacio de entrada mínimo y comportamiento determinista.
