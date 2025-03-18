# Guía de Contribución - CTPGA Manager

Gracias por tu interés en contribuir al proyecto CTPGA Manager. Este documento proporciona las pautas y mejores prácticas para contribuir efectivamente al desarrollo del proyecto.

## Código de Conducta

Al participar en este proyecto, te comprometes a mantener un entorno respetuoso y colaborativo. Esperamos que todos los contribuyentes:

- Utilicen un lenguaje inclusivo y respetuoso
- Respeten diferentes puntos de vista y experiencias
- Acepten críticas constructivas de manera profesional
- Se enfoquen en lo mejor para la comunidad del proyecto

## Proceso de Contribución

### 1. Configuración del Entorno de Desarrollo

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd CTPGA-Cronogramas
   ```

2. Instala las dependencias:
   ```bash
   # Para el backend (API)
   cd API
   npm install

   # Para el panel de administración
   cd ../AdminPanel
   npm install

   # Para el panel de instructores
   cd ../InstructorPanel
   npm install
   ```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env` en el directorio API
   - Ajusta las variables según tu entorno local

### 2. Flujo de Trabajo con Git

1. Crea una rama para tu contribución:
   ```bash
   git checkout -b feature/nombre-de-la-caracteristica
   ```
   Utiliza prefijos como `feature/`, `bugfix/`, `docs/` según corresponda.

2. Realiza tus cambios siguiendo las convenciones de código.

3. Confirma tus cambios con mensajes descriptivos:
   ```bash
   git commit -m "feat: añade sistema de tickets para reportar problemas"
   ```
   Seguimos la convención de [Conventional Commits](https://www.conventionalcommits.org/).

4. Envía tus cambios al repositorio remoto:
   ```bash
   git push origin feature/nombre-de-la-caracteristica
   ```

5. Crea un Pull Request detallando los cambios realizados.

### 3. Pull Requests

Cada Pull Request debe:

- Tener un título claro y descriptivo
- Incluir una descripción detallada de los cambios realizados
- Estar vinculado a un issue existente cuando sea posible
- Pasar todas las pruebas automatizadas
- Ser revisado por al menos un mantenedor del proyecto

## Estándares de Código

### JavaScript/Node.js

- Utilizamos ESLint con la configuración estándar de Airbnb
- Indentación de 2 espacios
- Punto y coma al final de cada declaración
- Comillas simples para strings
- Nombres de variables y funciones en camelCase
- Nombres de clases en PascalCase
- Comentarios descriptivos para funciones complejas

### React

- Componentes funcionales con hooks preferidos sobre componentes de clase
- Utiliza PropTypes o TypeScript para la validación de props
- Organiza los componentes en carpetas por funcionalidad
- Utiliza Context API para el estado global según lo definido en la arquitectura

### MongoDB/Mongoose

- Sigue los esquemas definidos en el archivo MongoDB.md
- Utiliza validación de esquemas para garantizar la integridad de los datos
- Implementa índices para optimizar consultas frecuentes

## Pruebas

Todas las contribuciones deben incluir pruebas adecuadas:

- **Pruebas unitarias** para funciones y componentes individuales
- **Pruebas de integración** para API endpoints
- **Pruebas end-to-end** para flujos de trabajo críticos

Ejecutar pruebas:
```bash
npm test
```

## Documentación

La documentación es crucial para el proyecto:

- Documenta todas las nuevas funcionalidades y cambios en la API
- Actualiza el README.md cuando sea necesario
- Añade comentarios JSDoc para funciones y clases importantes
- Mantén actualizada la documentación de Swagger para endpoints de API

## Proceso de Revisión

El proceso de revisión de código sigue estos pasos:

1. Verificación automatizada (linting, pruebas)
2. Revisión por pares (al menos un revisor)
3. Aprobación final por un mantenedor principal
4. Fusión a la rama principal

## Informar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Utiliza el sistema de issues de GitHub
2. Proporciona pasos detallados para reproducir el problema
3. Incluye capturas de pantalla si es posible
4. Menciona la versión del sistema y el entorno

## Contacto

Si tienes preguntas sobre el proceso de contribución, puedes contactar al equipo de desarrollo en:

- Email: devsoportectpga@gmail.com

---

Gracias por contribuir a mejorar CTPGA Manager. Tu esfuerzo ayuda a crear una herramienta más robusta y útil para la comunidad SENA.