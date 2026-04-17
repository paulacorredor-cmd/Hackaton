# Documento de Requisitos

## Introducción

Página de aterrizaje (landing page) para la presentación de reclamaciones de seguros. Los usuarios que tienen un seguro con "Seguros Bolívar" (adquirido al obtener un crédito con "Banco Davivienda") pueden iniciar, retomar o consultar el estado de sus reclamaciones de indemnización a través de esta página. La página ofrece dos modalidades de interacción: asistida por inteligencia artificial o autoservicio manual.

## Glosario

- **Landing_Page**: Página principal de reclamaciones de seguros donde el usuario inicia, retoma o consulta sus solicitudes.
- **Usuario**: Persona asegurada por Seguros Bolívar a través de un crédito con Banco Davivienda que accede a la Landing_Page.
- **Modo_Asistido**: Modalidad de interacción donde un asistente de inteligencia artificial guía al Usuario paso a paso mediante preguntas.
- **Modo_Autoservicio**: Modalidad de interacción donde el Usuario completa los campos del formulario de reclamación por su cuenta.
- **Barra_Superior**: Componente de encabezado rojo que contiene el logotipo de Davivienda.
- **Banner_Informativo**: Componente de aviso que muestra consejos para agilizar el reporte del Usuario.
- **Selector_Modalidad**: Componente de selección tipo radio que permite al Usuario elegir entre Modo_Asistido y Modo_Autoservicio.
- **Tarjeta_Retomar**: Componente tipo tarjeta que permite al Usuario retomar una solicitud pendiente.
- **Tarjeta_Consultar**: Componente tipo tarjeta que permite al Usuario consultar el estado de una solicitud existente.
- **Boton_Iniciar**: Botón principal rojo con el texto "Iniciar proceso" que da comienzo al flujo de reclamación.

## Requisitos

### Requisito 1: Estructura general de la Landing_Page

**Historia de Usuario:** Como Usuario, quiero ver una página de reclamaciones clara y organizada, para poder entender rápidamente las opciones disponibles y comenzar mi solicitud.

#### Criterios de Aceptación

1. THE Landing_Page SHALL mostrar la Barra_Superior con el logotipo de Davivienda sobre fondo rojo en la parte superior de la página.
2. THE Landing_Page SHALL mostrar un enlace "Volver" con un ícono de flecha hacia la izquierda debajo de la Barra_Superior.
3. THE Landing_Page SHALL mostrar el título principal "Comience su solicitud" debajo del enlace "Volver".
4. THE Landing_Page SHALL mostrar el subtítulo "Vamos a resolverlo juntos, comience por elegir como desea tramitar su solicitud." debajo del título principal.

### Requisito 2: Banner informativo de consejos

**Historia de Usuario:** Como Usuario, quiero ver consejos para hacer mi reporte más rápido, para poder preparar la información necesaria antes de iniciar.

#### Criterios de Aceptación

1. THE Landing_Page SHALL mostrar el Banner_Informativo con el texto "Consejos para hacer su reporte más rápido" entre el enlace "Volver" y el título principal.
2. THE Banner_Informativo SHALL contener un enlace con el texto "Ver requisitos" que permita al Usuario consultar los requisitos previos.
3. THE Banner_Informativo SHALL contener un botón de cierre que permita al Usuario ocultar el Banner_Informativo.
4. WHEN el Usuario presiona el botón de cierre del Banner_Informativo, THE Landing_Page SHALL ocultar el Banner_Informativo de la vista.

### Requisito 3: Selección de modalidad de interacción

**Historia de Usuario:** Como Usuario, quiero elegir entre recibir ayuda de un asistente de IA o completar el reporte por mi cuenta, para poder tramitar mi reclamación de la forma que me resulte más cómoda.

#### Criterios de Aceptación

1. THE Landing_Page SHALL mostrar el Selector_Modalidad con dos opciones mutuamente excluyentes tipo radio.
2. THE Selector_Modalidad SHALL mostrar la primera opción con el título "Con ayuda de un asistente IA", la descripción "Un par de preguntas para entender lo ocurrido." y una insignia con el texto "Inteligencia artificial".
3. THE Selector_Modalidad SHALL mostrar la segunda opción con el título "Continuar sin ayuda" y la descripción "Prefiero completar el reporte por mi cuenta."
4. WHEN el Usuario selecciona una opción del Selector_Modalidad, THE Landing_Page SHALL resaltar visualmente la opción seleccionada.
5. THE Landing_Page SHALL permitir al Usuario seleccionar una sola opción del Selector_Modalidad a la vez.

### Requisito 4: Botón de inicio del proceso

**Historia de Usuario:** Como Usuario, quiero iniciar el proceso de reclamación después de elegir mi modalidad preferida, para poder proceder con mi solicitud.

#### Criterios de Aceptación

1. THE Landing_Page SHALL mostrar el Boton_Iniciar con el texto "Iniciar proceso" y fondo rojo debajo del Selector_Modalidad.
2. WHILE ninguna opción del Selector_Modalidad está seleccionada, THE Boton_Iniciar SHALL permanecer en estado deshabilitado visualmente.
3. WHEN el Usuario selecciona una opción del Selector_Modalidad, THE Boton_Iniciar SHALL cambiar a estado habilitado.
4. WHEN el Usuario presiona el Boton_Iniciar con el Modo_Asistido seleccionado, THE Landing_Page SHALL dirigir al Usuario al flujo de reclamación asistido por inteligencia artificial.
5. WHEN el Usuario presiona el Boton_Iniciar con el Modo_Autoservicio seleccionado, THE Landing_Page SHALL dirigir al Usuario al flujo de reclamación de autoservicio.

### Requisito 5: Sección de solicitudes existentes

**Historia de Usuario:** Como Usuario, quiero retomar una solicitud pendiente o consultar el estado de una solicitud existente, para poder dar seguimiento a mis reclamaciones sin perder el progreso.

#### Criterios de Aceptación

1. THE Landing_Page SHALL mostrar el texto "Continúe su solicitud o verifique el estado de su caso de reclamación." debajo del Boton_Iniciar.
2. THE Landing_Page SHALL mostrar la Tarjeta_Retomar con el título "Retome su solicitud", la descripción "¿Dejó algo pendiente? Finalice aquí el envío de su información.", un ícono ilustrativo y una flecha de navegación.
3. THE Landing_Page SHALL mostrar la Tarjeta_Consultar con el título "Consulte su solicitud", la descripción "Revise aquí el avance y los detalles de su solicitud.", un ícono ilustrativo y una flecha de navegación.
4. WHEN el Usuario presiona la Tarjeta_Retomar, THE Landing_Page SHALL dirigir al Usuario a la pantalla de retomar solicitud pendiente.
5. WHEN el Usuario presiona la Tarjeta_Consultar, THE Landing_Page SHALL dirigir al Usuario a la pantalla de consulta de estado de solicitud.

### Requisito 6: Diseño visual y responsividad

**Historia de Usuario:** Como Usuario, quiero que la página se vea correctamente en diferentes dispositivos, para poder acceder a la reclamación desde mi computador o teléfono móvil.

#### Criterios de Aceptación

1. THE Landing_Page SHALL utilizar la paleta de colores corporativa de Davivienda con rojo (#ED1C27) como color principal.
2. THE Landing_Page SHALL adaptar su disposición de elementos para pantallas de escritorio (ancho mayor o igual a 1024 píxeles) y pantallas móviles (ancho menor a 768 píxeles).
3. THE Landing_Page SHALL mantener todos los textos legibles con un tamaño mínimo de fuente de 14 píxeles en dispositivos móviles.
4. THE Landing_Page SHALL centrar el contenido principal con un ancho máximo de contenedor para pantallas de escritorio.

### Requisito 7: Accesibilidad

**Historia de Usuario:** Como Usuario con necesidades de accesibilidad, quiero que la página sea navegable y comprensible mediante tecnologías de asistencia, para poder completar mi reclamación de forma autónoma.

#### Criterios de Aceptación

1. THE Landing_Page SHALL permitir la navegación completa mediante teclado, incluyendo la selección de modalidad y la activación de botones y tarjetas.
2. THE Selector_Modalidad SHALL utilizar atributos ARIA apropiados (role="radiogroup" y role="radio") para comunicar su función a lectores de pantalla.
3. THE Boton_Iniciar SHALL comunicar su estado (habilitado o deshabilitado) a tecnologías de asistencia mediante el atributo aria-disabled.
4. THE Banner_Informativo SHALL utilizar el atributo role="alert" o role="status" para comunicar su presencia a lectores de pantalla.
5. THE Landing_Page SHALL cumplir con un contraste mínimo de 4.5:1 entre texto y fondo según las pautas WCAG 2.1 nivel AA.
