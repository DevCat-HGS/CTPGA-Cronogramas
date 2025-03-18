# Registro de Cambios (Changelog)

Todas las modificaciones notables en el proyecto CTPGA Manager serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - En desarrollo

### Añadido
- Sistema de tickets para reportar problemas
- Documentación completa del proyecto (CONTRIBUTING.md, CHANGELOG.md, DEPLOYMENT.md, SECURITY.md, TESTING.md, API-DOCS.md)
- Sistema de versionado para guías con historial de cambios
- Implementación de sistema de respaldo y recuperación de datos

### Mejorado
- Optimización del rendimiento en la carga de guías extensas mediante lazy loading
- Refuerzo de la seguridad con protección contra ataques CSRF, XSS e inyección

### Corregido
- Problemas de compatibilidad en navegadores antiguos
- Errores en la validación de formularios

## [1.0.0] - YYYY-MM-DD (Fecha por definir)

### Añadido
- Sistema de autenticación con roles (Superadmin, Administrador, Instructor)
- Panel de administración para gestión de usuarios y contenido
- Panel de instructores para creación y gestión de guías y actividades
- Sistema de notificaciones en tiempo real
- Generación de reportes en formato Excel
- API RESTful documentada con Swagger
- Estructura de base de datos MongoDB optimizada

### Tecnologías Implementadas
- Backend: Node.js con Express.js
- Frontend: React.js con Context API
- Base de datos: MongoDB
- Autenticación: JWT
- Estilo: Tailwind CSS
- Desarrollo: Vite

---

## Guía de Versionado

Utilizamos el versionado semántico para este proyecto:

- **MAJOR (X.0.0)**: Cambios incompatibles con versiones anteriores
- **MINOR (0.X.0)**: Nuevas funcionalidades compatibles con versiones anteriores
- **PATCH (0.0.X)**: Correcciones de errores compatibles con versiones anteriores

## Convenciones para Mensajes de Commit

Seguimos la convención de [Conventional Commits](https://www.conventionalcommits.org/):

- **feat**: Nueva característica
- **fix**: Corrección de error
- **docs**: Cambios en documentación
- **style**: Cambios que no afectan el significado del código (espacios en blanco, formato, etc)
- **refactor**: Cambio de código que no corrige un error ni añade una característica
- **perf**: Cambio de código que mejora el rendimiento
- **test**: Adición o corrección de pruebas
- **build**: Cambios que afectan el sistema de construcción o dependencias externas
- **ci**: Cambios en archivos de configuración de CI
- **chore**: Otros cambios que no modifican archivos de src o test