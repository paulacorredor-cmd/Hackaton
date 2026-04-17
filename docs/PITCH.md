# 🏆 PITCH — Portal de Desarrolladores Open Insurance
## Seguros Bolívar × Davivienda | Hackathon 2026

---

## 🎯 El Problema

Colombia adoptó el estándar **Open Insurance** (Circular 005 — Superintendencia Financiera), que obliga a las aseguradoras a exponer sus servicios mediante APIs abiertas. Hoy, integrar APIs de seguros es un proceso **lento, fragmentado y sin estándares**, lo que genera:

- ⏳ **Semanas de onboarding** para que un socio tecnológico pueda consumir una sola API.
- 📄 Documentación dispersa, sin catálogo unificado ni descripciones semánticas.
- 🤖 Cero preparación para que agentes de IA puedan operar sobre productos de seguros.
- 🔐 Procesos manuales de registro, credenciales y aceptación de términos regulatorios.

---

## 💡 La Solución: SIOP — Portal de Desarrolladores

Una **plataforma self-service** que permite a socios tecnológicos registrarse, obtener credenciales y consumir APIs de seguros en minutos, no semanas. Con dos módulos principales:

### Módulo 1 — Developer Portal (Next.js)
El portal completo de onboarding y catálogo de APIs.

### Módulo 2 — Reclamaciones Inteligentes (Vite + React)
Landing de reclamaciones con asistente IA integrado para clientes finales.

---

## ⚙️ Funcionalidades Construidas

### 🔹 1. Onboarding Digital de Socios (3 pasos)

| Paso | Pantalla | Qué hace |
|------|----------|----------|
| **1** | Registro | Formulario con validación de NIT colombiano (formato `123456789-0`), razón social, representante legal, correo corporativo y carga de documento de Cámara de Comercio (PDF ≤ 10MB) |
| **2** | Términos y Condiciones | Texto legal completo de Open Insurance según Circular 005. Aceptación con timestamp registrado |
| **3** | Sandbox | Generación automática de credenciales (`client_id` + `client_secret`), enmascaramiento de secretos con auto-ocultamiento a los 5 segundos, botón de copiar al portapapeles |

**Stepper visual** que muestra el progreso del onboarding en tiempo real.

### 🔹 2. Catálogo de APIs por Línea de Seguro

- **8 APIs** organizadas en 4 líneas: Vida, Hogar, Autos, Salud
- Filtrado por tabs con estado activo visual
- Tarjetas con **descripción semántica** (campo `x-ai-description` del OpenAPI)
- Cada API incluye `ai_capability` para integración directa con modelos de lenguaje

### 🔹 3. Exportación de Manifiesto AI (GPT-4 Tools Compatible)

- Botón "Exportar Manifiesto AI" genera un JSON descargable
- Formato compatible con **GPT-4 Function Calling / Tools**
- Estructura: `{ schema_version, tools: [{ type: "function", function: { name, description, parameters, ai_capability } }] }`
- Permite que un agente de IA sepa qué APIs puede invocar y para qué sirven

### 🔹 4. Landing de Reclamaciones con IA

- Selector de modalidad: **"Con asistente IA"** vs **"Sin ayuda"**
- Banner informativo con requisitos del reporte
- Acceso rápido a retomar solicitudes pendientes o consultar estado
- Diseño responsive con tokens de diseño de Davivienda

### 🔹 5. Componentes UI Reutilizables

| Componente | Función |
|------------|---------|
| `NavBar` | Navegación entre Onboarding, Catálogo y AI Playground |
| `TarjetaApi` | Card accesible con badge de línea de seguro |
| `CopyToClipboard` | Copiar con feedback visual + enmascaramiento temporal |
| `ErrorMessage` | Mensajes de error accesibles con `aria-live` |
| `ModeSelector` | Radio group con navegación por teclado (WCAG compliant) |

---

## 🏗️ Arquitectura Técnica

```
┌─────────────────────────────────────────────┐
│           Frontend (2 apps)                 │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │  Next.js 14  │  │  Vite + React 18   │   │
│  │  (Portal)    │  │  (Reclamaciones)   │   │
│  └──────────────┘  └────────────────────┘   │
├─────────────────────────────────────────────┤
│  TypeScript · Tailwind CSS · Lucide Icons   │
│  Design System: @seguros-bolivar/ui-bundle  │
├─────────────────────────────────────────────┤
│  Testing: Vitest + Testing Library          │
│  + Property-Based Testing (fast-check)      │
└─────────────────────────────────────────────┘
```

- **Next.js 14** para el portal (SSR, routing, layouts anidados)
- **Vite + React** para el módulo de reclamaciones (SPA rápida)
- **TypeScript** end-to-end con tipado estricto
- **Tailwind CSS** con tokens personalizados de Seguros Bolívar
- **Accesibilidad WCAG**: `aria-labels`, `aria-live`, navegación por teclado, roles semánticos

---

## 🧪 Calidad y Testing

| Tipo de Test | Cobertura |
|-------------|-----------|
| **Unitarios** | Validación NIT, email, PDF, filtrado de catálogo, manifiesto AI |
| **Componentes** | Todas las pantallas y componentes UI con Testing Library |
| **Property-Based** | NIT, filtrado, manifiesto, enmascaramiento, registro (fast-check) |
| **Accesibilidad** | Tests dedicados para el módulo de reclamaciones |

Los **property-based tests** con `fast-check` garantizan que las validaciones funcionan con cualquier entrada posible, no solo con casos hardcodeados.

---

## 📊 Beneficios de Negocio

### Para Seguros Bolívar
| Beneficio | Impacto |
|-----------|---------|
| **Reducción de tiempo de onboarding** | De semanas → minutos (autoservicio) |
| **Cumplimiento regulatorio** | Circular 005 con trazabilidad de aceptación |
| **Ecosistema de socios** | Más integradores = más distribución de productos |
| **AI-Ready** | Manifiesto exportable para agentes inteligentes |

### Para los Socios Tecnológicos
| Beneficio | Impacto |
|-----------|---------|
| **Time-to-first-call** | Credenciales sandbox en < 2 minutos |
| **Documentación semántica** | Cada API describe qué hace en lenguaje natural |
| **Catálogo filtrable** | Encuentran la API correcta en segundos |
| **Integración con IA** | Pueden alimentar sus agentes con el manifiesto |

### Para los Clientes Finales
| Beneficio | Impacto |
|-----------|---------|
| **Reclamaciones más rápidas** | Asistente IA guía el proceso |
| **Dos modalidades** | Eligen si quieren ayuda o hacerlo solos |
| **Experiencia accesible** | Cumple estándares de accesibilidad web |

---

## 💰 Análisis de Costos

### Costos de Desarrollo (ya invertidos en el hackathon)
| Concepto | Detalle |
|----------|---------|
| **Stack** | 100% open source (React, Next.js, Vite, Tailwind) |
| **Design System** | Reutiliza `@seguros-bolivar/ui-bundle` existente |
| **Testing** | Vitest + fast-check (sin licencias adicionales) |
| **Infraestructura dev** | JFrog Artifactory ya configurado |

### Costos de Producción (estimados)
| Recurso | Costo mensual estimado |
|---------|----------------------|
| Hosting frontend (Vercel/AWS) | ~$50 - $200 USD |
| Backend Node.js (AWS ECS/Lambda) | ~$100 - $500 USD |
| PostgreSQL (RDS) | ~$50 - $200 USD |
| **Total estimado** | **~$200 - $900 USD/mes** |

### ROI Esperado
- **Ahorro por onboarding automatizado**: ~40 horas/socio × costo hora analista
- **Reducción de tickets de soporte**: -60% consultas de documentación
- **Aceleración de integraciones**: 5x más socios onboarded por trimestre

---

## 🚀 Roadmap — Próximos Pasos

| Fase | Entregable | Timeline |
|------|-----------|----------|
| **MVP** ✅ | Onboarding + Catálogo + Manifiesto AI + Reclamaciones | Hackathon |
| **v1.1** | AI Playground (probar APIs con lenguaje natural) | +2 semanas |
| **v1.2** | Backend real con OAuth 2.0 + OIDC | +4 semanas |
| **v2.0** | Migración a Angular 19 + Design System completo | +8 semanas |
| **v2.1** | Dashboard de métricas de consumo por socio | +10 semanas |

---

## 🎤 Frase de Cierre

> **"No solo estamos cumpliendo con Open Insurance. Estamos construyendo el puente entre las APIs de seguros y la inteligencia artificial, para que cualquier socio tecnológico pueda integrar y cualquier agente de IA pueda operar — en minutos, no en semanas."**

---

*Equipo: Squad Agentes IA 2 | Hackathon Seguros Bolívar — Abril 2026*
