# Estructura del Sistema - CTPGA Manager

Este documento detalla la arquitectura y estructura del sistema CTPGA Manager, explicando cómo están organizados los diferentes componentes y cómo interactúan entre sí.

## Arquitectura General

CTPGA Manager sigue una arquitectura cliente-servidor con separación clara entre frontend y backend:

```
+-------------------+       +-------------------+       +-------------------+
|                   |       |                   |       |                   |
|  AdminPanel       | <---> |  API (Backend)    | <---> |  Base de Datos    |
|  (React.js)       |       |  (Node.js/Express)|       |  (MongoDB)        |
|                   |       |                   |       |                   |
+-------------------+       +-------------------+       +-------------------+
         ^                           ^                           
         |                           |                           
         v                           v                           
+-------------------+       +-------------------+                 
|                   |       |                   |                 
|  InstructorPanel  | <---> |  WebSockets      |                 
|  (React.js)       |       |  (Socket.io)     |                 
|                   |       |                   |                 
+-------------------+       +-------------------+                 
```

## Estructura de Directorios

El proyecto está organizado en los siguientes directorios principales:

### 1. API (Backend)

Contiene toda la lógica del servidor, incluyendo rutas, modelos, middleware y configuración.

```
API/
├── middleware/       # Middleware para autenticación y Swagger
├── models/           # Modelos de datos MongoDB/Mongoose
├── routes/           # Rutas de la API REST
├── utils/            # Utilidades (logger, búsqueda, etc.)
├── .env.example      # Ejemplo de variables de entorno
├── package.json      # Dependencias del backend
└── server.js         # Punto de entrada del servidor
```

#### Modelos de Datos

Los modelos definen la estructura de los documentos en MongoDB:

- **User.js**: Define el esquema de usuarios con roles (superadmin, admin, instructor)
- **Guide.js**: Estructura de las guías académicas
- **GuideVersion.js**: Sistema de versionado para las guías
- **Activity.js**: Actividades académicas
- **Event.js**: Eventos programados
- **Report.js**: Reportes generados por el sistema
- **Feedback.js**: Retroalimentación sobre guías y actividades
- **Badge.js** y **UserBadge.js**: Sistema de insignias y logros
- **Template.js**: Plantillas para guías y reportes
- **Analytics.js**: Datos analíticos del sistema

#### Rutas API

Las rutas definen los endpoints disponibles:

- **auth.js**: Autenticación y gestión de sesiones
- **users.js**: Gestión de usuarios
- **guides.js**: CRUD para guías académicas
- **guideVersions.js**: Control de versiones de guías
- **activities.js**: Gestión de actividades
- **events.js**: Administración de eventos
- **reports.js**: Generación y descarga de reportes
- **templates.js**: Gestión de plantillas
- **badges.js**: Sistema de insignias
- **feedback.js**: Sistema de retroalimentación
- **analytics.js**: Estadísticas y análisis
- **calendar.js**: Gestión del calendario
- **backup.js**: Sistema de respaldo de datos

### 2. AdminPanel (Frontend)

Panel de administración para administradores y superadministradores.

```
AdminPanel/
├── src/
│   ├── components/   # Componentes reutilizables
│   ├── context/      # Contextos de React (Auth, etc.)
│   ├── layouts/      # Layouts de la aplicación
│   ├── pages/        # Páginas principales
│   ├── App.jsx       # Componente principal
│   └── main.jsx      # Punto de entrada
├── package.json      # Dependencias del frontend
├── tailwind.config.js # Configuración de Tailwind CSS
└── vite.config.js    # Configuración de Vite
```

### 3. InstructorPanel (Frontend)

Panel específico para instructores con funcionalidades adaptadas a sus necesidades.

```
InstructorPanel/
├── src/
│   ├── components/   # Componentes reutilizables
│   ├── context/      # Contextos de React
│   ├── layouts/      # Layouts de la aplicación
│   ├── pages/        # Páginas principales
│   ├── App.jsx       # Componente principal
│   └── main.jsx      # Punto de entrada
├── package.json      # Dependencias del frontend
├── tailwind.config.js # Configuración de Tailwind CSS
└── vite.config.js    # Configuración de Vite
```

## Flujo de Datos

### Autenticación

1. El usuario inicia sesión a través del frontend (AdminPanel o InstructorPanel)
2. La solicitud se envía al endpoint `/api/auth` en el backend
3. El servidor valida las credenciales y genera un token JWT
4. El token se almacena en el cliente y se utiliza para autenticar solicitudes posteriores

### Comunicación en Tiempo Real

El sistema utiliza Socket.io para proporcionar actualizaciones en tiempo real:

1. El servidor establece conexiones WebSocket con los clientes
2. Cuando ocurren eventos importantes (nueva solicitud, actualización de guía, etc.), el servidor emite eventos a los clientes conectados
3. Los clientes reciben estos eventos y actualizan la interfaz de usuario en consecuencia

## Base de Datos

El sistema utiliza MongoDB como base de datos NoSQL:

- **Colecciones**: Cada modelo tiene su propia colección en MongoDB
- **Relaciones**: Se utilizan referencias entre documentos (ObjectId) para establecer relaciones
- **Índices**: Se implementan índices para optimizar consultas frecuentes

## Seguridad

- **Autenticación**: JWT (JSON Web Tokens)
- **Autorización**: Middleware que verifica roles y permisos
- **Validación**: Express-validator para validar entradas
- **Encriptación**: Bcrypt para el hash de contraseñas

## Integración y Despliegue

- El sistema está diseñado para ser desplegado en servicios en la nube como AWS, Vercel o DigitalOcean
- Se utiliza un enfoque modular que permite escalar componentes individualmente según la demanda
- La arquitectura facilita la implementación de CI/CD para actualizaciones continuas