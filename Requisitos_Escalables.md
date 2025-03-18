# Análisis de Requisitos - Proyecto CTPGA Manager

## 1. Descripción General del Sistema

  El proyecto **CTPGA Manager** es una aplicación web integral diseñada para facilitar la gestión de guías, reportes, eventos y actividades en la institución **SENA**. Su objetivo principal es optimizar la organización académica y administrativa mediante un sistema intuitivo que permite a instructores, administradores y superadministradores coordinar eficientemente sus responsabilidades.. El sistema incluye dos paneles principales:

- **Panel de Administración**: Gestionado por administradores y superadministradores.
- **Panel de Instructores**: Para que los instructores puedan gestionar sus actividades y contenido.

## 2. Roles y Permisos

### **Super admin**

- Acceso total a todas las funcionalidades.
- Puede ver todas las actividades, reportes y eventos.
- Capacidad para crear, leer, actualizar y eliminar (CRUD) datos.
- Puede visualizar información de los administradores, incluyendo:
  - Quiénes están en línea.
  - A qué área pertenecen.

### **Administrador**

- Recibe solicitudes de registro de instructores.
- Corrobora la información de los instructores y aprueba o rechaza sus solicitudes de acceso.

### **Instructor**

- Envía una solicitud de registro que debe ser aprobada por un administrador.
- Una vez aprobado, puede:
  - Crear actividades.
  - Agregar contenido a las guías.

## 3. Flujos de Trabajo

### **Registro y Validación de Instructores**

1. El instructor se registra en la plataforma.
2. El administrador recibe la solicitud de registro.
3. El administrador revisa la información y aprueba o rechaza el acceso.
4. Si se aprueba, el instructor accede a su panel de control.

### **Gestión de Actividades y Guías**

1. El instructor crea una nueva actividad.
2. El instructor agrega contenido a la guía asociada, organizando el material en secciones claramente definidas:
   - **Introducción:** Explicación general del propósito de la guía.
   - **Objetivos:** Desglose de los objetivos de aprendizaje.
   - **Materiales Requeridos:** Listado de recursos necesarios.
   - **Desarrollo:** Explicación paso a paso del contenido práctico o teórico.
   - **Evaluación:** Criterios para evaluar el cumplimiento de la actividad.
3. Cada guía creada pasa por un proceso de aprobación automatizado que valida que todos los campos requeridos estén completos. En caso de inconsistencias, se notifica al instructor para realizar las correcciones pertinentes.
4. Una vez aprobada, la guía se publica y queda disponible para los usuarios autorizados.

1. El instructor crea una nueva actividad.
2. El instructor agrega contenido a la guía asociada.
3. Los datos se almacenan en la base de datos MongoDB.

### **Gestión de Administradores por el Superadmin**

1. El superadmin accede al panel de administración.
2. Visualiza la información de cada administrador:
   - Estado en línea.
   - Área a la que pertenece.
3. Puede realizar acciones CRUD sobre cualquier dato del sistema.

## 4. Requisitos Funcionales

- Sistema de autenticación seguro para cada rol.
- Paneles diferenciados para Superadmin, Administrador e Instructor.
- Sistema de gestión de solicitudes de registro.
- Capacidad de gestionar (crear, editar y eliminar) guías, actividades, eventos y reportes.
- Sistema de notificaciones en tiempo real para alertar sobre solicitudes, aprobaciones o cambios importantes.
- Generación de reportes automatizados en formato Excel para facilitar la gestión documental.
- Historial de actividades para registrar todas las acciones realizadas en el sistema.

- Sistema de autenticación seguro para cada rol.
- Paneles diferenciados para Superadmin, Administrador e Instructor.
- Sistema de gestión de solicitudes de registro.
- Capacidad de gestionar (crear, editar y eliminar) guías, actividades, eventos y reportes.

## 5. Requisitos No Funcionales

- Alta disponibilidad para garantizar el acceso en todo momento.
- Interfaz intuitiva y fácil de usar.
- Seguridad en la transmisión de datos con cifrado SSL.
- Sistema escalable para soportar un alto número de usuarios concurrentes.

## 6. Tecnologías Propuestas

- **Pre-optimizador:** Vite para optimizar el entorno de desarrollo y mejorar el rendimiento del frontend.
- **Backend:** Node.js con Express.js.
- **Base de Datos:** MongoDB.
- **Frontend:** React.js con Context API para la gestión del estado.
- **WebSockets:** Implementación con Socket.io para ofrecer actualizaciones en tiempo real.
- **Estilo:** Tailwind CSS para mejorar la consistencia del diseño y agilizar el desarrollo.
- **CDN:** Implementación de un CDN para optimizar la velocidad de carga de la aplicación.
- **Autenticación:** JWT (JSON Web Tokens) para la gestión segura de sesiones.
- **Despliegue:** Servicios en la nube como AWS, Vercel o DigitalOcean.

- **Pre-optimizador:** Vite para optimizar el entorno de desarrollo y mejorar el rendimiento del frontend.
- **Backend:** Node.js con Express.js.
- **Base de Datos:** MongoDB.
- **Frontend:** React.js con Context API para la gestión del estado.
- **Autenticación:** JWT (JSON Web Tokens) para la gestión segura de sesiones.
- **Despliegue:** Servicios en la nube como AWS, Vercel o DigitalOcean. 

## 7. Diagrama de Flujo

El siguiente diagrama de flujo representa el proceso de registro, aprobación de instructores y gestión de actividades por parte de cada rol (se incluirá el diagrama visual).

## 8. Recomendaciones sobre el Contenido y Requisitos del Proyecto CTPGA Manager

Basado en el análisis del proyecto, se ofrecen las siguientes recomendaciones específicas sobre el contenido y los requisitos:

### Contenido y Estructura

1. **Refina la estructura de las guías:**
   - Considera añadir una sección de "Recursos adicionales" o "Material complementario"
   - Implementa un sistema de etiquetado para facilitar la búsqueda y categorización

2. **Mejora el sistema de actividades:**
   - Añade la posibilidad de establecer fechas límite y recordatorios
   - Implementa un sistema de seguimiento de progreso para los instructores

3. **Amplía las capacidades de reportes:**
   - Define claramente qué tipos de reportes serán generados (asistencia, rendimiento, etc.)
   - Considera añadir visualizaciones gráficas además de los reportes en Excel

### Requisitos Funcionales Adicionales

1. **Fortalece el sistema de notificaciones:**
   - Implementa diferentes canales (email, notificaciones push, dentro de la plataforma)
   - Permite a los usuarios configurar sus preferencias de notificación

2. **Mejora el proceso de aprobación:**
   - Considera un sistema de aprobación en etapas para guías complejas
   - Implementa comentarios específicos en el proceso de revisión

3. **Añade funcionalidades colaborativas:**
   - Permite que varios instructores trabajen en la misma guía
   - Implementa un sistema de comentarios y sugerencias

4. **Considera un sistema de plantillas:**
   - Crea plantillas predefinidas para diferentes tipos de guías y actividades
   - Permite a los superadministradores definir nuevas plantillas

### Mejoras en Requisitos No Funcionales

1. **Mejora la accesibilidad:**
   - Asegúrate de que la plataforma cumpla con estándares WCAG 2.1
   - Implementa diseño responsivo para diferentes dispositivos

2. **Optimiza el rendimiento:**
   - Implementa estrategias de carga perezosa (lazy loading) para contenido extenso
   - Considera la compresión de imágenes y otros recursos multimedia

3. **Refuerza la seguridad:**
   - Implementa protección contra ataques comunes (CSRF, XSS, inyección SQL)
   - Considera auditorías de seguridad periódicas

4. **Mejora la resiliencia:**
   - Implementa un sistema de respaldo y recuperación de datos
   - Considera estrategias de manejo de fallos y alta disponibilidad

### Tecnologías y Arquitectura

1. **Considera una arquitectura de microservicios:**
   - Separa funcionalidades como autenticación, notificaciones y generación de reportes
   - Facilita el mantenimiento y la escalabilidad independiente

2. **Implementa una API bien documentada:**
   - Utiliza Swagger o similar para documentar endpoints
   - Facilita la integración futura con otros sistemas del SENA

### Nuevas Recomendaciones Técnicas

1. **Sistema de Respaldo y Recuperación:**
   - Implementa un sistema automatizado de respaldo de la base de datos
   - Establece políticas de retención y recuperación de datos
   - Programa respaldos incrementales diarios y completos semanales

2. **Sistema de Logging Detallado:**
   - Implementa un sistema de logging estructurado para todas las operaciones críticas
   - Registra información detallada sobre errores, accesos y modificaciones
   - Establece diferentes niveles de logging (debug, info, warning, error)
   - Implementa rotación de logs para evitar archivos demasiado grandes

3. **Documentación API con Swagger:**
   - Documenta todos los endpoints de la API con Swagger/OpenAPI
   - Incluye descripciones detalladas, parámetros requeridos y respuestas esperadas
   - Proporciona ejemplos de uso para cada endpoint
   - Implementa una interfaz interactiva para probar los endpoints

4. **Sistema de Feedback para Usuarios:**
   - Implementa un sistema para que los usuarios puedan enviar comentarios y sugerencias
   - Permite calificar las guías y actividades
   - Facilita la comunicación entre instructores y administradores
   - Incluye un sistema de tickets para reportar problemas

5. **Control de Versiones para Guías:**
   - Implementa un sistema de versionado para las guías
   - Mantén un historial de cambios con fechas y autores
   - Permite comparar diferentes versiones de una misma guía
   - Facilita la restauración de versiones anteriores

