# Documento de Requisitos — Aviso Marca Roja

## Introducción

Este documento define los requisitos para la aplicación web responsiva "Aviso Marca Roja" de radicación de siniestros para Davivienda, basada en el documento "199-INDEMNIZACIONES-MARCA-ROJA". La aplicación centraliza todos los productos de seguros (Deudores Davivienda, Protección de Pagos, Mascotas y Bicicletas) en una única plataforma ("router rojo") para reducir la dispersión de canales y los tiempos de respuesta. Se construye sobre la base existente en `src/components/ClaimLanding/` usando Next.js, TypeScript, CSS Modules, react-router-dom y Vitest.

## Glosario

- **Sistema_MarcaRoja**: La aplicación web responsiva de radicación de siniestros Marca Roja de Davivienda.
- **Pantalla_Entrada**: La pantalla principal que actúa como router, presentando las dos opciones de flujo (IA asistida y autoservicio).
- **Flujo_IA**: El flujo asistido por inteligencia artificial donde el usuario describe su situación en texto libre y el sistema detecta el producto de seguro correspondiente.
- **Flujo_Autoservicio**: El flujo manual donde el usuario selecciona directamente la categoría de seguro y completa un formulario dinámico.
- **Motor_Detección**: El componente de IA que analiza el texto libre del usuario y determina el producto de seguro correspondiente.
- **Formulario_Dinámico**: El formulario que se ajusta dinámicamente según el producto de seguro seleccionado.
- **Cargador_Documentos**: El componente de carga de archivos que permite al usuario adjuntar documentos de soporte.
- **Panel_Seguimiento**: La sección donde el cliente puede consultar el estado de su caso y descargar cartas de respuesta.
- **Cabecera**: El componente de encabezado que incluye el logo Casita Roja y opciones de ayuda/seguimiento.
- **Producto_Seguro**: Una categoría de seguro disponible (Deudores Davivienda, Protección de Pagos, Mascotas y Bicicletas).
- **Carta_Definición**: El documento oficial de respuesta que el usuario puede descargar desde el Panel_Seguimiento.
- **Estado_Caso**: El estado actual de un siniestro radicado (En análisis, Pendiente documentos, Anulado, Cerrado).
- **Datos_Titular**: La información del titular del seguro, incluyendo tipo y número de documento.
- **Design_Tokens**: Los valores de diseño estandarizados de Davivienda (colores, border-radius, tipografía) definidos en `constants.ts`.

## Requisitos

### Requisito 1: Sistema de Diseño Davivienda

**Historia de Usuario:** Como usuario de Davivienda, quiero que la aplicación refleje la identidad visual de Davivienda, para que la experiencia sea coherente con la marca.

#### Criterios de Aceptación

1. THE Sistema_MarcaRoja SHALL utilizar blanco (#FFFFFF) como color base de fondo en todas las pantallas.
2. THE Sistema_MarcaRoja SHALL utilizar Rojo Davivienda (#ED1C24) como color para elementos de acción y acentos visuales.
3. THE Sistema_MarcaRoja SHALL aplicar un border-radius de 25px a todos los bordes de tarjetas y botones.
4. THE Sistema_MarcaRoja SHALL extender los Design_Tokens existentes en `constants.ts` para incluir los nuevos valores de diseño sin romper los componentes actuales.
5. THE Sistema_MarcaRoja SHALL ser completamente responsivo, adaptándose a dispositivos móviles (ancho menor a 768px) y escritorio (ancho mayor o igual a 768px).

### Requisito 2: Cabecera Mejorada

**Historia de Usuario:** Como usuario, quiero ver el logo de Davivienda y tener acceso rápido a ayuda y seguimiento de casos desde el encabezado, para poder navegar fácilmente.

#### Criterios de Aceptación

1. THE Cabecera SHALL mostrar el logo Casita Roja de Davivienda alineado a la izquierda.
2. THE Cabecera SHALL mostrar una opción de "Ayuda" alineada a la derecha.
3. THE Cabecera SHALL mostrar una opción de "Seguir mi caso" alineada a la derecha junto a la opción de "Ayuda".
4. WHEN el usuario activa la opción "Seguir mi caso", THE Cabecera SHALL navegar al Panel_Seguimiento.
5. THE Cabecera SHALL extender el componente HeaderBar existente manteniendo compatibilidad con las props actuales (logoSrc, logoAlt).

### Requisito 3: Pantalla de Entrada (Router)

**Historia de Usuario:** Como usuario, quiero elegir cómo reportar mi siniestro (con IA o manualmente), para que pueda usar el método que me resulte más cómodo.

#### Criterios de Aceptación

1. THE Pantalla_Entrada SHALL mostrar el título principal "¿Cómo quieres reportar lo ocurrido hoy?".
2. THE Pantalla_Entrada SHALL presentar dos opciones principales como tarjetas: la opción del Flujo_IA y la opción del Flujo_Autoservicio.
3. THE Pantalla_Entrada SHALL mostrar en la tarjeta del Flujo_IA el título "Cuéntanos tu historia" y la descripción "Usa tus propias palabras para describir qué pasó. Nuestra IA te ayudará a identificar tu seguro".
4. THE Pantalla_Entrada SHALL mostrar en la tarjeta del Flujo_Autoservicio el título "Elegir manualmente" y la descripción "Selecciona directamente el tipo de seguro y completa el formulario".
5. THE Pantalla_Entrada SHALL mostrar íconos representativos para las categorías de Producto_Seguro (Deudores Davivienda, Protección de Pagos, Mascotas y Bicicletas) dentro de la tarjeta del Flujo_Autoservicio.
6. WHEN el usuario selecciona la tarjeta del Flujo_IA, THE Pantalla_Entrada SHALL navegar a la pantalla de entrada de texto libre del Flujo_IA.
7. WHEN el usuario selecciona la tarjeta del Flujo_Autoservicio, THE Pantalla_Entrada SHALL navegar a la pantalla de selección de categoría del Flujo_Autoservicio.

### Requisito 4: Flujo Asistido por IA — Entrada de Texto

**Historia de Usuario:** Como usuario, quiero describir mi situación con mis propias palabras, para que el sistema identifique automáticamente mi tipo de seguro.

#### Criterios de Aceptación

1. THE Flujo_IA SHALL presentar un área de texto libre para que el usuario describa su situación.
2. THE Flujo_IA SHALL mostrar un texto placeholder en el área de texto: "Ej: Tuve una incapacidad médica que me impide trabajar...".
3. WHEN el usuario envía el texto, THE Motor_Detección SHALL analizar el contenido y determinar el Producto_Seguro correspondiente.
4. WHILE el Motor_Detección procesa el texto del usuario, THE Flujo_IA SHALL mostrar un indicador de carga visible al usuario.
5. IF el Motor_Detección no logra determinar un Producto_Seguro a partir del texto, THEN THE Flujo_IA SHALL mostrar un mensaje informativo y ofrecer la opción de reintentar o cambiar al Flujo_Autoservicio.

### Requisito 5: Flujo Asistido por IA — Pantalla de Validación

**Historia de Usuario:** Como usuario, quiero confirmar que el sistema identificó correctamente mi tipo de seguro, para asegurarme de que mi siniestro se radique en la categoría correcta.

#### Criterios de Aceptación

1. WHEN el Motor_Detección identifica un Producto_Seguro, THE Flujo_IA SHALL mostrar una pantalla de validación con el mensaje "Detectamos que esto corresponde a tu seguro de [nombre del Producto_Seguro]. ¿Deseas continuar?".
2. THE Flujo_IA SHALL mostrar en la pantalla de validación el nombre del Producto_Seguro detectado de forma destacada.
3. WHEN el usuario confirma el Producto_Seguro detectado, THE Flujo_IA SHALL navegar al Formulario_Dinámico correspondiente a ese Producto_Seguro.
4. WHEN el usuario rechaza el Producto_Seguro detectado, THE Flujo_IA SHALL permitir al usuario regresar a la entrada de texto o cambiar al Flujo_Autoservicio.

### Requisito 6: Flujo Autoservicio — Selección de Categoría

**Historia de Usuario:** Como usuario, quiero seleccionar manualmente mi tipo de seguro, para completar el formulario directamente sin asistencia de IA.

#### Criterios de Aceptación

1. THE Flujo_Autoservicio SHALL presentar las categorías de Producto_Seguro disponibles como tarjetas seleccionables con íconos representativos.
2. THE Flujo_Autoservicio SHALL incluir las categorías: Deudores Davivienda, Protección de Pagos, Mascotas y Bicicletas.
3. WHEN el usuario selecciona una categoría de Producto_Seguro, THE Flujo_Autoservicio SHALL navegar al Formulario_Dinámico correspondiente a ese Producto_Seguro.
4. THE Flujo_Autoservicio SHALL reutilizar el patrón visual del componente ActionCard existente, aplicando el border-radius de 25px.

### Requisito 7: Formulario Dinámico

**Historia de Usuario:** Como usuario, quiero completar un formulario adaptado a mi tipo de seguro, para proporcionar la información necesaria para radicar mi siniestro.

#### Criterios de Aceptación

1. THE Formulario_Dinámico SHALL ajustar sus campos según el Producto_Seguro seleccionado.
2. THE Formulario_Dinámico SHALL incluir una sección de Datos_Titular con campos para tipo de documento (lista desplegable) y número de documento (campo de texto).
3. THE Formulario_Dinámico SHALL validar que el tipo de documento y el número de documento sean proporcionados antes de permitir el envío.
4. IF el usuario intenta enviar el Formulario_Dinámico con campos obligatorios vacíos, THEN THE Formulario_Dinámico SHALL mostrar mensajes de error específicos junto a cada campo incompleto.
5. THE Formulario_Dinámico SHALL presentar el Cargador_Documentos antes de solicitar datos complejos como nombres o categorías adicionales.
6. WHEN el usuario completa todos los campos obligatorios y adjunta los documentos requeridos, THE Formulario_Dinámico SHALL habilitar el botón de envío.

### Requisito 8: Carga de Documentos

**Historia de Usuario:** Como usuario, quiero adjuntar documentos de soporte de forma intuitiva, para completar la radicación de mi siniestro sin confusión.

#### Criterios de Aceptación

1. THE Cargador_Documentos SHALL permitir al usuario seleccionar archivos mediante un botón de carga o arrastrando archivos al área designada (drag and drop).
2. THE Cargador_Documentos SHALL limitar el tamaño máximo de cada archivo a 10 MB.
3. IF el usuario intenta cargar un archivo que excede 10 MB, THEN THE Cargador_Documentos SHALL mostrar un mensaje de error indicando que el archivo excede el límite de tamaño permitido.
4. THE Cargador_Documentos SHALL mostrar el nombre, tamaño y estado de carga de cada archivo adjuntado.
5. THE Cargador_Documentos SHALL permitir al usuario eliminar un archivo adjuntado antes del envío del formulario.
6. WHILE un archivo se está cargando, THE Cargador_Documentos SHALL mostrar una barra de progreso para ese archivo.

### Requisito 9: Panel de Seguimiento de Casos

**Historia de Usuario:** Como usuario, quiero consultar el estado de mi caso y descargar cartas de respuesta, para estar informado sobre el avance de mi siniestro.

#### Criterios de Aceptación

1. THE Panel_Seguimiento SHALL mostrar una lista de los casos del usuario con su Estado_Caso actual.
2. THE Panel_Seguimiento SHALL mostrar los estados posibles: "En análisis", "Pendiente documentos", "Anulado" y "Cerrado".
3. WHEN un caso tiene Estado_Caso "Anulado" o "Cerrado", THE Panel_Seguimiento SHALL mostrar la razón del estado junto al caso.
4. THE Panel_Seguimiento SHALL proporcionar un botón de descarga para la Carta_Definición asociada a cada caso que tenga una carta disponible.
5. WHEN el usuario activa el botón de descarga, THE Panel_Seguimiento SHALL iniciar la descarga de la Carta_Definición en formato PDF.
6. IF el Panel_Seguimiento no encuentra casos asociados al usuario, THEN THE Panel_Seguimiento SHALL mostrar un mensaje indicando que no se encontraron casos registrados.

### Requisito 10: Validación de Formulario y Serialización

**Historia de Usuario:** Como desarrollador, quiero que los datos del formulario se validen y serialicen correctamente, para garantizar la integridad de la información enviada.

#### Criterios de Aceptación

1. THE Formulario_Dinámico SHALL validar todos los campos de entrada según las reglas de negocio del Producto_Seguro seleccionado.
2. THE Formulario_Dinámico SHALL serializar los datos del formulario a formato JSON antes del envío.
3. FOR ALL objetos JSON válidos de formulario, serializar y luego deserializar SHALL producir un objeto equivalente al original (propiedad round-trip).
4. THE Formulario_Dinámico SHALL sanitizar las entradas de texto del usuario para prevenir inyección de código.

### Requisito 11: Centralización de Productos

**Historia de Usuario:** Como negocio, quiero que todos los productos de seguros se gestionen a través de una única plataforma, para reducir la dispersión de canales y los tiempos de respuesta.

#### Criterios de Aceptación

1. THE Sistema_MarcaRoja SHALL soportar la radicación de siniestros para todos los Producto_Seguro disponibles: Deudores Davivienda, Protección de Pagos, Mascotas y Bicicletas.
2. THE Sistema_MarcaRoja SHALL enrutar cada radicación al Formulario_Dinámico correcto según el Producto_Seguro, independientemente de si el usuario llegó por el Flujo_IA o el Flujo_Autoservicio.
3. THE Sistema_MarcaRoja SHALL mantener una configuración centralizada de Producto_Seguro que permita agregar nuevos productos sin modificar la lógica de enrutamiento.

### Requisito 12: Accesibilidad y Navegación por Teclado

**Historia de Usuario:** Como usuario con discapacidad, quiero que la aplicación sea accesible mediante teclado y lectores de pantalla, para poder radicar mi siniestro sin barreras.

#### Criterios de Aceptación

1. THE Sistema_MarcaRoja SHALL cumplir con los roles ARIA apropiados en todos los componentes interactivos.
2. THE Sistema_MarcaRoja SHALL permitir la navegación completa mediante teclado (Tab, Enter, Escape, flechas) en todos los flujos.
3. THE Sistema_MarcaRoja SHALL mantener un orden de foco lógico y visible en todos los formularios y pantallas.
4. THE Cargador_Documentos SHALL ser operable completamente mediante teclado, incluyendo la selección y eliminación de archivos.
