# Documentación de la API - CTPGA Manager

Este documento proporciona información detallada sobre los endpoints disponibles en la API de CTPGA Manager, incluyendo parámetros, respuestas y ejemplos de uso.

## Información General

- **URL Base**: `https://api.ctpga-manager.com` (producción) o `http://localhost:3000` (desarrollo)
- **Formato de Respuesta**: JSON
- **Autenticación**: JWT (JSON Web Tokens)

## Autenticación

Todos los endpoints protegidos requieren un token JWT válido en el encabezado de autorización:

```
Authorization: Bearer <token>
```

### Endpoints de Autenticación

#### Registro de Usuario

```
POST /api/auth/register
```

**Parámetros de Solicitud**:

```json
{
  "name": "Nombre Completo",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "role": "instructor",
  "area": "Desarrollo de Software" // Solo requerido si role es 'admin'
}
```

**Respuesta Exitosa (201 Created)**:

```json
{
  "message": "Usuario registrado exitosamente. Pendiente de aprobación.",
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Nombre Completo",
    "email": "usuario@ejemplo.com",
    "role": "instructor",
    "status": "pending",
    "createdAt": "2023-06-22T14:30:00.000Z"
  }
}
```

#### Inicio de Sesión

```
POST /api/auth/login
```

**Parámetros de Solicitud**:

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta Exitosa (200 OK)**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Nombre Completo",
    "email": "usuario@ejemplo.com",
    "role": "instructor",
    "status": "active"
  }
}
```

## Usuarios

### Obtener Perfil de Usuario

```
GET /api/users/profile
```

**Encabezados**:
- Authorization: Bearer <token>

**Respuesta Exitosa (200 OK)**:

```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "name": "Nombre Completo",
  "email": "usuario@ejemplo.com",
  "role": "instructor",
  "status": "active",
  "lastActive": "2023-06-22T15:30:00.000Z",
  "createdAt": "2023-06-22T14:30:00.000Z"
}
```

### Listar Usuarios (Solo Admin y Superadmin)

```
GET /api/users
```

**Encabezados**:
- Authorization: Bearer <token>

**Parámetros de Consulta**:
- `status`: Filtrar por estado (pending, active, rejected)
- `role`: Filtrar por rol (instructor, admin, superadmin)
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10)

**Respuesta Exitosa (200 OK)**:

```json
{
  "users": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "Nombre Completo",
      "email": "usuario@ejemplo.com",
      "role": "instructor",
      "status": "active",
      "isOnline": true,
      "lastActive": "2023-06-22T15:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3,
    "limit": 10
  }
}
```

### Aprobar/Rechazar Solicitud de Instructor (Solo Admin y Superadmin)

```
PUT /api/users/:userId/status
```

**Encabezados**:
- Authorization: Bearer <token>

**Parámetros de Solicitud**:

```json
{
  "status": "active" // o "rejected"
}
```

**Respuesta Exitosa (200 OK)**:

```json
{
  "message": "Estado del usuario actualizado exitosamente",
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Nombre Completo",
    "email": "usuario@ejemplo.com",
    "role": "instructor",
    "status": "active"
  }
}
```

## Guías

### Crear Guía

```
POST /api/guides
```

**Encabezados**:
- Authorization: Bearer <token>

**Parámetros de Solicitud**:

```json
{
  "title": "Introducción a JavaScript",
  "introduction": "Esta guía introduce los conceptos básicos de JavaScript...",
  "objectives": ["Comprender la sintaxis básica", "Aprender sobre variables y tipos de datos"],
  "materials": ["Computadora con navegador", "Editor de código"],
  "development": "JavaScript es un lenguaje de programación...",
  "evaluation": "Se evaluará mediante un proyecto práctico...",
  "resources": ["MDN Web Docs", "JavaScript.info"],
  "tags": ["javascript", "programación", "web"],
  "category": "teorica",
  "difficulty": "basica",
  "estimatedTime": 120
}
```

**Respuesta Exitosa (201 Created)**:

```json
{
  "message": "Guía creada exitosamente",
  "guide": {
    "_id": "60d21b4667d0d8992e610c86",
    "title": "Introducción a JavaScript",
    "instructor": "60d21b4667d0d8992e610c85",
    "status": "draft",
    "currentVersion": 1,
    "createdAt": "2023-06-22T16:30:00.000Z"
  }
}
```

### Listar Guías

```
GET /api/guides
```

**Encabezados**:
- Authorization: Bearer <token>

**Parámetros de Consulta**:
- `status`: Filtrar por estado (draft, published, archived)
- `category`: Filtrar por categoría
- `instructor`: Filtrar por ID del instructor
- `search`: Buscar por título o contenido
- `page`: Número de página
- `limit`: Resultados por página

**Respuesta Exitosa (200 OK)**:

```json
{
  "guides": [
    {
      "_id": "60d21b4667d0d8992e610c86",
      "title": "Introducción a JavaScript",
      "instructor": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "Nombre Completo"
      },
      "category": "teorica",
      "difficulty": "basica",
      "status": "published",
      "createdAt": "2023-06-22T16:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "pages": 2,
    "limit": 10
  }
}
```

## Actividades

### Crear Actividad

```
POST /api/activities
```

**Encabezados**:
- Authorization: Bearer <token>

**Parámetros de Solicitud**:

```json
{
  "title": "Taller de JavaScript",
  "description": "Taller práctico para aplicar conceptos de JavaScript",
  "startDate": "2023-07-15T09:00:00.000Z",
  "deadline": "2023-07-15T12:00:00.000Z",
  "reminderDate": "2023-07-14T09:00:00.000Z",
  "priority": "media",
  "category": "taller",
  "tags": ["javascript", "práctica"],
  "location": "Aula 101",
  "isRecurring": false,
  "relatedGuides": ["60d21b4667d0d8992e610c86"]
}
```

**Respuesta Exitosa (201 Created)**:

```json
{
  "message": "Actividad creada exitosamente",
  "activity": {
    "_id": "60d21b4667d0d8992e610c87",
    "title": "Taller de JavaScript",
    "instructor": "60d21b4667d0d8992e610c85",
    "status": "pendiente",
    "startDate": "2023-07-15T09:00:00.000Z",
    "createdAt": "2023-06-22T17:30:00.000Z"
  }
}
```

## Sistema de Tickets

### Crear Ticket

```
POST /api/tickets
```

**Encabezados**:
- Authorization: Bearer <token>

**Parámetros de Solicitud**:

```json
{
  "title": "Error en la carga de guías",
  "description": "Al intentar cargar una guía con imágenes, el sistema muestra un error",
  "priority": "alta",
  "category": "bug",
  "screenshots": ["url_de_la_imagen1", "url_de_la_imagen2"],
  "relatedModule": "guides"
}
```

**Respuesta Exitosa (201 Created)**:

```json
{
  "message": "Ticket creado exitosamente",
  "ticket": {
    "_id": "60d21b4667d0d8992e610c88",
    "title": "Error en la carga de guías",
    "createdBy": "60d21b4667d0d8992e610c85",
    "status": "abierto",
    "priority": "alta",
    "ticketNumber": "CTPGA-123",
    "createdAt": "2023-06-22T18:30:00.000Z"
  }
}
```

### Listar Tickets

```
GET /api/tickets
```

**Encabezados**:
- Authorization: Bearer <token>

**Parámetros de Consulta**:
- `status`: Filtrar por estado (abierto, en-progreso, resuelto, cerrado)
- `priority`: Filtrar por prioridad (baja, media, alta, crítica)
- `createdBy`: Filtrar por usuario que creó el ticket
- `page`: Número de página
- `limit`: Resultados por página

**Respuesta Exitosa (200 OK)**:

```json
{
  "tickets": [
    {
      "_id": "60d21b4667d0d8992e610c88",
      "title": "Error en la carga de guías",
      "ticketNumber": "CTPGA-123",
      "createdBy": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "Nombre Completo"
      },
      "status": "abierto",
      "priority": "alta",
      "createdAt": "2023-06-22T18:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "pages": 1,
    "limit": 10
  }
}
```

### Actualizar Estado de Ticket (Solo Admin y Superadmin)

```
PUT /api/tickets/:ticketId/status
```

**Encabezados**:
- Authorization: Bearer <token>

**Parámetros de Solicitud**:

```json
{
  "status": "en-progreso",
  "comment": "Estamos trabajando en solucionar este problema"
}
```

**Respuesta Exitosa (200 OK)**:

```json
{
  "message": "Estado del ticket actualizado exitosamente",
  "ticket": {
    "_id": "60d21b4667d0d8992e610c88",
    "title": "Error en la carga de guías",
    "status": "en-progreso",
    "updatedAt": "2023-06-23T10:30:00.000Z"
  }
}
```

## Versiones de Guías

### Crear Nueva Versión de Guía

```
POST /api/guides/:guideId/versions
```

**Encabezados**:
- Authorization: Bearer <token>

**Parámetros de Solicitud**:

```json
{
  "content": {
    "introduction": "Versión actualizada de la introducción...",
    "objectives": ["Objetivo actualizado 1", "Objetivo actualizado 2"],
    "materials": ["Material actualizado 1", "Material actualizado 2"],
    "development": "Contenido actualizado del desarrollo...",
    "evaluation": "Criterios de evaluación actualizados..."
  },
  "changes": "Actualización de objetivos y materiales requeridos"
}
```

**Respuesta Exitosa (201 Created)**:

```json
{
  "message": "Nueva versión de guía creada exitosamente",
  "version": {
    "_id": "60d21b4667d0d8992e610c89",
    "guide": "60d21b4667d0d8992e610c86",
    "versionNumber": 2,
    "createdBy": "60d21b4667d0d8992e610c85",
    "createdAt": "2023-06-24T11:30:00.000Z"
  }
}
```

### Listar Versiones de una Guía

```
GET /api/guides/:guideId/versions
```

**Encabezados**:
- Authorization: Bearer <token>

**Respuesta Exitosa (200 OK)**:

```json
{
  "versions": [
    {
      "_id": "60d21b4667d0d8992e610c89",
      "versionNumber": 2,
      "changes": "Actualización de objetivos y materiales requeridos",
      "createdBy": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "Nombre Completo"
      },
      "createdAt": "2023-06-24T11:30:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c8a",
      "versionNumber": 1,
      "changes": "Versión inicial",
      "createdBy": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "Nombre Completo"
      },
      "createdAt": "2023-06-22T16:30:00.000Z"
    }
  ]
}
```

## Códigos de Error

La API utiliza códigos de estado HTTP estándar para indicar el éxito o fracaso de una solicitud:

- **200 OK**: La solicitud se completó con éxito
- **201 Created**: El recurso se creó con éxito
- **400 Bad Request**: La solicitud contiene datos inválidos o falta información requerida
- **401 Unauthorized**: No se proporcionó un token válido o el token ha expirado
- **403 Forbidden**: El usuario no tiene permisos para acceder al recurso
- **404 Not Found**: El recurso solicitado no existe
- **409 Conflict**: La solicitud no puede ser procesada debido a un conflicto (ej. email duplicado)
- **500 Internal Server Error**: Error interno del servidor

## Paginación

Los endpoints que devuelven múltiples recursos admiten paginación mediante los siguientes parámetros de consulta:

- `page`: Número de página (default: 1)
- `limit`: Número de resultados por página (default: 10, max: 100)

La respuesta incluirá un objeto `pagination` con la siguiente información:

```json
{
  "pagination": {
    "total": 25,    // Total de registros
    "page": 1,      // Página actual
    "pages": 3,     // Total de páginas
    "limit": 10     // Registros por página
  }
}
```

## Versionado de API

La API sigue un esquema de versionado en la URL. La versión actual es v1:

```
https://api.ctpga-manager.com/v1/...
```

## Limitación de Tasa

Para proteger la API contra abusos, se implementa una limitación de tasa:

- 100 solicitudes por minuto por IP
- 1000 solicitudes por hora por usuario autenticado

Cuando se excede el límite, la API responderá con un código de estado 429 (Too Many Requests).