# Documento de Requisitos

## Introducción

Portal de desarrolladores para APIs de Seguros Bolívar orientado a la integración de socios (partners) bajo el estándar de Open Insurance colombiano (Circular 005). El portal permite a los socios registrarse de forma digital, explorar un catálogo interactivo de APIs agrupadas por líneas de seguros, probar endpoints en un sandbox en tiempo real y experimentar con un playground de inteligencia artificial que demuestra la capacidad de agentes autónomos para operar las APIs mediante lenguaje natural. El stack técnico utiliza Next.js 14 (App Router), Tailwind CSS, Lucide React, OpenAPI 3.1 y OpenTelemetry.

## Glosario

- **Portal**: Aplicación web principal del Developer Portal de Seguros Bolívar donde los socios se registran, exploran APIs y prueban integraciones.
- **Socio**: Empresa o desarrollador externo que desea integrarse con las APIs de Seguros Bolívar.
- **Formulario_Registro**: Formulario de onboarding donde el Socio ingresa datos de identidad empresarial (NIT, Cámara de Comercio).
- **Términos_Open_Insurance**: Documento legal de aceptación obligatoria que establece las condiciones de uso bajo la normativa colombiana de Open Insurance.
- **Aplicación_Sandbox**: Entorno de pruebas creado automáticamente para el Socio tras completar el registro, que incluye Client_ID y Client_Secret.
- **Componente_Copiar**: Componente seguro de tipo "Copy-to-Clipboard" que permite al Socio copiar credenciales sin exponerlas en texto plano prolongadamente.
- **Catálogo_API**: Vista principal del módulo de documentación que muestra las APIs agrupadas por líneas de seguros.
- **Tarjeta_API**: Componente tipo tarjeta que muestra el nombre, descripción semántica y línea de seguro de una API individual.
- **Visor_Documentación**: Componente interactivo estilo Swagger que permite visualizar y probar endpoints de una API seleccionada contra el sandbox.
- **Manifiesto_AI**: Archivo JSON exportable compatible con GPT-4 Tools que describe las capacidades semánticas de las APIs.
- **AI_Playground**: Consola dividida "Bolívar AI Sandbox" donde el Socio interactúa con las APIs mediante lenguaje natural.
- **Panel_Chat**: Panel izquierdo del AI_Playground donde el Socio escribe instrucciones en lenguaje natural.
- **Panel_Log**: Panel derecho del AI_Playground que muestra la interpretación del agente AI, el endpoint invocado y la respuesta JSON recibida.
- **Línea_Seguro**: Categoría de producto de seguros (Vida, Hogar, Autos, Salud) utilizada para agrupar APIs en el Catálogo_API.

## Requisitos

### Requisito 1: Estructura general del Portal

**Historia de Usuario:** Como Socio, quiero acceder a un portal con navegación clara entre los módulos de onboarding, catálogo de APIs y AI Playground, para poder encontrar rápidamente la funcionalidad que necesito.

#### Criterios de Aceptación

1. THE Portal SHALL mostrar una barra de navegación superior con el logotipo de Seguros Bolívar y enlaces a los módulos de Onboarding, Catálogo de APIs y AI Playground.
2. THE Portal SHALL utilizar la paleta de colores institucional de Seguros Bolívar: amarillo (#FFD700), verde (#00843D) y blanco (#FFFFFF).
3. THE Portal SHALL utilizar la tipografía Inter como fuente principal para todos los textos.
4. THE Portal SHALL adaptar su disposición de elementos para pantallas de escritorio (ancho mayor o igual a 1024 píxeles) y pantallas móviles (ancho menor a 768 píxeles).
5. THE Portal SHALL mantener todos los textos legibles con un tamaño mínimo de fuente de 14 píxeles en dispositivos móviles.

### Requisito 2: Validación de identidad del Socio

**Historia de Usuario:** Como Socio, quiero registrar los datos de mi empresa en el portal, para poder iniciar el proceso de integración con las APIs de Seguros Bolívar.

#### Criterios de Aceptación

1. THE Portal SHALL mostrar el Formulario_Registro como primer paso del flujo de onboarding.
2. THE Formulario_Registro SHALL solicitar al Socio los campos: NIT de la empresa, razón social, nombre del representante legal y correo electrónico corporativo.
3. THE Formulario_Registro SHALL solicitar al Socio la carga de un documento de Cámara de Comercio en formato PDF.
4. WHEN el Socio envía el Formulario_Registro con todos los campos completos y válidos, THE Portal SHALL avanzar al paso de aceptación de Términos_Open_Insurance.
5. IF el Socio envía el Formulario_Registro con campos vacíos o con formato inválido, THEN THE Portal SHALL mostrar mensajes de error específicos junto a cada campo incorrecto.
6. IF el Socio ingresa un NIT con formato diferente a 9 dígitos seguidos de un dígito de verificación, THEN THE Formulario_Registro SHALL mostrar un mensaje de error indicando el formato esperado.

### Requisito 3: Aceptación de términos de Open Insurance

**Historia de Usuario:** Como Socio, quiero revisar y aceptar los términos de Open Insurance, para poder cumplir con la normativa colombiana y continuar con el registro.

#### Criterios de Aceptación

1. WHEN el Socio completa la validación de identidad, THE Portal SHALL mostrar los Términos_Open_Insurance en un panel desplazable con el texto completo del acuerdo.
2. THE Portal SHALL mostrar una casilla de verificación con el texto "Acepto los términos y condiciones de Open Insurance según la Circular 005" debajo del panel de términos.
3. WHILE la casilla de verificación de Términos_Open_Insurance no está marcada, THE Portal SHALL mantener deshabilitado el botón "Continuar".
4. WHEN el Socio marca la casilla de verificación y presiona el botón "Continuar", THE Portal SHALL registrar la aceptación con marca de tiempo y avanzar al paso de creación de Aplicación_Sandbox.

### Requisito 4: Creación automática de Aplicación Sandbox

**Historia de Usuario:** Como Socio, quiero recibir credenciales de sandbox automáticamente al completar el registro, para poder comenzar a probar las APIs de inmediato.

#### Criterios de Aceptación

1. WHEN el Socio completa la aceptación de Términos_Open_Insurance, THE Portal SHALL crear automáticamente una Aplicación_Sandbox asociada al Socio.
2. WHEN la Aplicación_Sandbox se crea con éxito, THE Portal SHALL mostrar el Client_ID y el Client_Secret generados en una pantalla de confirmación.
3. THE Portal SHALL mostrar el Client_ID mediante el Componente_Copiar que permita al Socio copiar el valor al portapapeles con un solo clic.
4. THE Portal SHALL mostrar el Client_Secret mediante el Componente_Copiar, manteniendo el valor oculto por defecto con opción de revelarlo temporalmente.
5. WHEN el Socio presiona el botón de copiar del Componente_Copiar, THE Portal SHALL copiar el valor al portapapeles y mostrar una confirmación visual durante 2 segundos.
6. IF la creación de la Aplicación_Sandbox falla, THEN THE Portal SHALL mostrar un mensaje de error con la opción de reintentar la operación.

### Requisito 5: Catálogo de APIs agrupado por líneas de seguros

**Historia de Usuario:** Como Socio, quiero explorar las APIs disponibles organizadas por tipo de seguro, para poder identificar rápidamente las APIs relevantes para mi integración.

#### Criterios de Aceptación

1. THE Catálogo_API SHALL mostrar las APIs agrupadas en cuatro secciones correspondientes a las líneas de seguros: Vida, Hogar, Autos y Salud.
2. THE Catálogo_API SHALL mostrar cada API como una Tarjeta_API dentro de su sección correspondiente.
3. THE Tarjeta_API SHALL mostrar el nombre de la API, una descripción semántica extraída del campo x-ai-description de la especificación OpenAPI y un indicador de la Línea_Seguro a la que pertenece.
4. THE Catálogo_API SHALL permitir al Socio filtrar las APIs por Línea_Seguro mediante pestañas o botones de filtro.
5. WHEN el Socio selecciona una Tarjeta_API, THE Portal SHALL navegar al Visor_Documentación de la API seleccionada.

### Requisito 6: Documentación interactiva de APIs

**Historia de Usuario:** Como Socio, quiero visualizar la documentación detallada de cada API y probar los endpoints en el sandbox, para poder entender la estructura de las peticiones y respuestas antes de integrar.

#### Criterios de Aceptación

1. THE Visor_Documentación SHALL mostrar la especificación OpenAPI 3.1 de la API seleccionada con la lista de endpoints, métodos HTTP, parámetros y esquemas de respuesta.
2. THE Visor_Documentación SHALL permitir al Socio enviar peticiones de prueba a los endpoints del sandbox directamente desde la interfaz.
3. WHEN el Socio envía una petición de prueba, THE Visor_Documentación SHALL mostrar el código de estado HTTP, los encabezados de respuesta y el cuerpo JSON de la respuesta.
4. THE Visor_Documentación SHALL precargar las credenciales de la Aplicación_Sandbox del Socio autenticado para las peticiones de prueba.
5. IF una petición de prueba al sandbox falla por error de red o timeout, THEN THE Visor_Documentación SHALL mostrar un mensaje de error descriptivo con el código de error y una sugerencia de resolución.

### Requisito 7: Exportación de Manifiesto AI

**Historia de Usuario:** Como Socio, quiero exportar un manifiesto JSON compatible con GPT-4 Tools, para poder integrar las APIs de Seguros Bolívar como herramientas en mis agentes de inteligencia artificial.

#### Criterios de Aceptación

1. THE Catálogo_API SHALL mostrar un botón "Exportar Manifiesto AI" visible en la vista principal del catálogo.
2. WHEN el Socio presiona el botón "Exportar Manifiesto AI", THE Portal SHALL generar un archivo JSON con la estructura compatible con GPT-4 Tools que incluya nombre, descripción semántica (x-ai-description), parámetros y capacidad AI (x-ai-capability) de cada API.
3. WHEN el archivo Manifiesto_AI se genera con éxito, THE Portal SHALL iniciar la descarga automática del archivo con el nombre "bolivar-ai-manifest.json".
4. THE Portal SHALL generar el Manifiesto_AI incluyendo únicamente las APIs visibles según los filtros activos en el Catálogo_API.

### Requisito 8: Consola del AI Playground

**Historia de Usuario:** Como Socio, quiero interactuar con las APIs de Seguros Bolívar mediante lenguaje natural en un playground de AI, para poder evaluar la capacidad de integración con agentes autónomos.

#### Criterios de Aceptación

1. THE AI_Playground SHALL mostrar una interfaz dividida en dos paneles: el Panel_Chat a la izquierda y el Panel_Log a la derecha.
2. THE Panel_Chat SHALL mostrar un campo de entrada de texto donde el Socio escribe instrucciones en lenguaje natural en español.
3. THE Panel_Chat SHALL mostrar el historial de mensajes del Socio y las respuestas del agente AI en formato de conversación.
4. WHEN el Socio envía una instrucción en el Panel_Chat, THE AI_Playground SHALL procesar la instrucción e identificar el endpoint de Seguros Bolívar correspondiente.
5. WHEN el AI_Playground procesa una instrucción, THE Panel_Log SHALL mostrar tres secciones: la interpretación de la instrucción por el agente AI, el endpoint y payload enviado, y la respuesta JSON recibida del sandbox.
6. THE AI_Playground SHALL utilizar las credenciales de la Aplicación_Sandbox del Socio autenticado para ejecutar las peticiones a los endpoints.

### Requisito 9: Visualización de trazas en el AI Playground

**Historia de Usuario:** Como Socio, quiero ver el detalle técnico de cada interacción del agente AI con las APIs, para poder entender cómo un agente autónomo operaría mis integraciones.

#### Criterios de Aceptación

1. THE Panel_Log SHALL mostrar cada paso de la interacción con marca de tiempo y duración en milisegundos.
2. THE Panel_Log SHALL resaltar con colores diferenciados los pasos de interpretación (amarillo #FFD700), petición enviada (verde #00843D) y respuesta recibida (blanco #FFFFFF sobre fondo oscuro).
3. WHEN el Socio selecciona una entrada en el Panel_Log, THE AI_Playground SHALL expandir el detalle mostrando los encabezados HTTP, el cuerpo completo de la petición y la respuesta.
4. THE Panel_Log SHALL permitir al Socio copiar el contenido JSON de cualquier paso al portapapeles mediante el Componente_Copiar.

### Requisito 10: Seguridad y autenticación

**Historia de Usuario:** Como Socio, quiero que mis credenciales y datos estén protegidos según estándares de seguridad financiera, para poder confiar en la plataforma para mi integración.

#### Criterios de Aceptación

1. THE Portal SHALL autenticar al Socio mediante el protocolo OAuth 2.0 con OpenID Connect antes de permitir el acceso a los módulos de Catálogo de APIs y AI Playground.
2. THE Portal SHALL transmitir todas las comunicaciones mediante HTTPS con TLS 1.2 o superior.
3. THE Portal SHALL ocultar el Client_Secret en la interfaz por defecto, mostrando únicamente caracteres enmascarados hasta que el Socio solicite revelarlo.
4. WHEN la sesión del Socio permanece inactiva durante 15 minutos, THE Portal SHALL cerrar la sesión automáticamente y redirigir al Socio a la pantalla de inicio de sesión.
5. THE Portal SHALL registrar cada acción del Socio (inicio de sesión, peticiones al sandbox, exportación de manifiesto) en un log de auditoría con marca de tiempo e identificador del Socio.

### Requisito 11: Accesibilidad del Portal

**Historia de Usuario:** Como Socio con necesidades de accesibilidad, quiero que el portal sea navegable y comprensible mediante tecnologías de asistencia, para poder completar el onboarding y explorar las APIs de forma autónoma.

#### Criterios de Aceptación

1. THE Portal SHALL permitir la navegación completa mediante teclado, incluyendo la selección de pestañas del catálogo, la interacción con el Visor_Documentación y el envío de mensajes en el AI_Playground.
2. THE Portal SHALL cumplir con un contraste mínimo de 4.5:1 entre texto y fondo según las pautas WCAG 2.1 nivel AA.
3. THE Formulario_Registro SHALL asociar cada campo de entrada con una etiqueta visible y un atributo aria-label descriptivo.
4. THE Portal SHALL comunicar los mensajes de error y confirmación a tecnologías de asistencia mediante atributos aria-live="polite".
5. THE Catálogo_API SHALL utilizar encabezados semánticos (h2, h3) para estructurar las secciones de líneas de seguros y las tarjetas de APIs.
