# Guía de Despliegue - CTPGA Manager

Este documento proporciona instrucciones detalladas para desplegar el proyecto CTPGA Manager en diferentes entornos.

## Requisitos Previos

- Node.js (v14.x o superior)
- MongoDB (v4.4 o superior)
- npm (v6.x o superior)
- Git

## Estructura del Proyecto

El proyecto CTPGA Manager está compuesto por tres componentes principales:

1. **API**: Backend desarrollado con Node.js y Express
2. **AdminPanel**: Frontend para administradores desarrollado con React y Vite
3. **InstructorPanel**: Frontend para instructores desarrollado con React y Vite

## Entornos de Despliegue

### 1. Entorno de Desarrollo Local

#### Configuración del Backend (API)

1. Clonar el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd CTPGA-Cronogramas
   ```

2. Instalar dependencias:
   ```bash
   cd API
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar el archivo `.env.example` a `.env`
   - Ajustar las variables según sea necesario

4. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

#### Configuración del Frontend (AdminPanel e InstructorPanel)

1. Instalar dependencias:
   ```bash
   # Para el panel de administración
   cd ../AdminPanel
   npm install

   # Para el panel de instructores
   cd ../InstructorPanel
   npm install
   ```

2. Iniciar los servidores de desarrollo:
   ```bash
   # Para el panel de administración
   cd ../AdminPanel
   npm run dev

   # Para el panel de instructores
   cd ../InstructorPanel
   npm run dev
   ```

### 2. Entorno de Producción

#### Despliegue del Backend (API)

1. Configurar variables de entorno para producción:
   - Asegurarse de que `NODE_ENV=production`
   - Configurar una URI de MongoDB segura
   - Establecer un JWT_SECRET fuerte y único

2. Construir la aplicación:
   ```bash
   cd API
   npm run build
   ```

3. Iniciar el servidor:
   ```bash
   npm start
   ```

#### Despliegue del Frontend

1. Construir las aplicaciones para producción:
   ```bash
   # Para el panel de administración
   cd AdminPanel
   npm run build

   # Para el panel de instructores
   cd ../InstructorPanel
   npm run build
   ```

2. Desplegar los archivos estáticos generados en la carpeta `dist` a un servicio de hosting como Vercel, Netlify, o un servidor web tradicional.

### 3. Despliegue en la Nube

#### AWS

1. **Backend (API)**:
   - Desplegar en AWS Elastic Beanstalk o EC2
   - Configurar un balanceador de carga para alta disponibilidad
   - Utilizar Amazon RDS o MongoDB Atlas para la base de datos

2. **Frontend**:
   - Alojar archivos estáticos en S3
   - Configurar CloudFront como CDN
   - Configurar Route 53 para gestión de DNS

#### Vercel/Netlify

1. **Backend (API)**:
   - Desplegar en Vercel Serverless Functions o Netlify Functions
   - Configurar variables de entorno en el panel de control

2. **Frontend**:
   - Conectar el repositorio a Vercel o Netlify
   - Configurar comandos de construcción y directorio de salida
   - Configurar variables de entorno para la URL de la API

## Configuración de Base de Datos

### MongoDB Local

1. Instalar MongoDB Community Edition
2. Iniciar el servicio de MongoDB
3. Crear la base de datos `ctpga-manager`

### MongoDB Atlas (Nube)

1. Crear una cuenta en MongoDB Atlas
2. Configurar un nuevo cluster
3. Crear un usuario de base de datos
4. Obtener la URI de conexión y actualizarla en las variables de entorno

## Respaldo y Recuperación

### Respaldo Automatizado

1. Configurar respaldos diarios incrementales:
   ```bash
   mongodump --uri="mongodb://localhost:27017/ctpga-manager" --out=/path/to/backup/$(date +"%Y-%m-%d")
   ```

2. Configurar respaldos completos semanales:
   ```bash
   mongodump --uri="mongodb://localhost:27017/ctpga-manager" --out=/path/to/backup/weekly/$(date +"%Y-%m-%d")
   ```

3. Implementar rotación de respaldos para mantener solo los últimos 30 días y 12 semanas.

### Recuperación

```bash
mongorestore --uri="mongodb://localhost:27017/ctpga-manager" --dir=/path/to/backup/YYYY-MM-DD
```

## Monitoreo y Mantenimiento

1. Configurar monitoreo de salud del servidor con herramientas como PM2 o Prometheus
2. Implementar alertas para errores críticos y problemas de rendimiento
3. Establecer un cronograma de mantenimiento regular para actualizaciones de seguridad

## Escalabilidad

1. **Escalamiento Horizontal**:
   - Configurar múltiples instancias de la API detrás de un balanceador de carga
   - Implementar caché distribuida con Redis

2. **Optimización de Base de Datos**:
   - Configurar índices para consultas frecuentes
   - Implementar sharding para conjuntos de datos grandes

## Solución de Problemas Comunes

1. **Problemas de Conexión a la Base de Datos**:
   - Verificar credenciales y URI de conexión
   - Comprobar reglas de firewall y configuración de red

2. **Errores en el Despliegue del Frontend**:
   - Revisar logs de construcción
   - Verificar configuración de variables de entorno
   - Comprobar compatibilidad del navegador

3. **Problemas de Rendimiento**:
   - Analizar logs del servidor
   - Revisar consultas lentas en MongoDB
   - Implementar profiling y optimización