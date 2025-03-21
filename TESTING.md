# Guía de Pruebas - CTPGA Manager

Este documento describe las estrategias, herramientas y procedimientos para realizar pruebas efectivas en el proyecto CTPGA Manager.

## Estrategia de Pruebas

La estrategia de pruebas de CTPGA Manager sigue un enfoque de múltiples niveles:

1. **Pruebas Unitarias**: Verifican el funcionamiento correcto de componentes individuales.
2. **Pruebas de Integración**: Comprueban la interacción entre diferentes módulos.
3. **Pruebas End-to-End**: Validan flujos completos desde la perspectiva del usuario.
4. **Pruebas de Rendimiento**: Evalúan el comportamiento del sistema bajo carga.
5. **Pruebas de Seguridad**: Identifican vulnerabilidades potenciales.

## Herramientas de Prueba

### Backend (API)

- **Jest**: Framework principal para pruebas unitarias y de integración
- **Supertest**: Para pruebas de API
- **MongoDB Memory Server**: Para pruebas con base de datos aislada

### Frontend (AdminPanel e InstructorPanel)

- **Jest**: Para pruebas unitarias de componentes y utilidades
- **React Testing Library**: Para pruebas de componentes React
- **Cypress**: Para pruebas end-to-end
- **Lighthouse**: Para pruebas de rendimiento y accesibilidad

## Tipos de Pruebas

### 1. Pruebas Unitarias

#### Backend

- **Controladores**: Verificar que cada controlador maneje correctamente las solicitudes y respuestas.
- **Servicios**: Probar la lógica de negocio aislada de la base de datos y otros servicios.
- **Modelos**: Validar que los esquemas de Mongoose funcionen correctamente.
- **Utilidades**: Probar funciones auxiliares y helpers.

Ejemplo de prueba unitaria para un controlador:

```javascript
describe('UserController', () => {
  test('should create a new user with valid data', async () => {
    // Arrange
    const mockUserService = { createUser: jest.fn().mockResolvedValue({ id: '123', name: 'Test User' }) };
    const controller = new UserController(mockUserService);
    const req = { body: { name: 'Test User', email: 'test@example.com', password: 'password123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    // Act
    await controller.createUser(req, res);
    
    // Assert
    expect(mockUserService.createUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: '123' }));
  });
});
```

#### Frontend

- **Componentes**: Verificar que los componentes se rendericen correctamente y respondan a las interacciones del usuario.
- **Hooks**: Probar hooks personalizados de React.
- **Utilidades**: Validar funciones auxiliares y helpers.

Ejemplo de prueba unitaria para un componente React:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  test('should call onSubmit with email and password when form is submitted', () => {
    // Arrange
    const mockOnSubmit = jest.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    // Act
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    // Assert
    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### 2. Pruebas de Integración

- **API Endpoints**: Verificar que los endpoints de la API funcionen correctamente de extremo a extremo.
- **Flujos de Datos**: Probar la interacción entre diferentes capas de la aplicación.

Ejemplo de prueba de integración para un endpoint de API:

```javascript
describe('Auth API', () => {
  let app;
  let mongoServer;
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    app = require('../app');
  });
  
  afterAll(async () => {
    await mongoServer.stop();
  });
  
  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'instructor'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });
});
```

### 3. Pruebas End-to-End

- **Flujos de Usuario**: Probar flujos completos desde la perspectiva del usuario.
- **Integración Frontend-Backend**: Verificar que el frontend y el backend funcionen correctamente juntos.

Ejemplo de prueba end-to-end con Cypress:

```javascript
describe('Instructor Registration', () => {
  it('should allow an instructor to register and wait for approval', () => {
    cy.visit('/register');
    
    // Completar formulario de registro
    cy.get('[data-testid=name-input]').type('Nuevo Instructor');
    cy.get('[data-testid=email-input]').type('instructor@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=role-select]').select('instructor');
    cy.get('[data-testid=register-button]').click();
    
    // Verificar mensaje de éxito
    cy.contains('Registro exitoso. Tu solicitud está pendiente de aprobación.').should('be.visible');
    
    // Verificar redirección a página de espera
    cy.url().should('include', '/pending-approval');
  });
});
```

### 4. Pruebas de Rendimiento

- **Carga**: Verificar el comportamiento del sistema bajo carga normal y pico.
- **Estrés**: Probar los límites del sistema.
- **Escalabilidad**: Validar que el sistema pueda escalar horizontalmente.

Herramientas recomendadas:
- **k6**: Para pruebas de carga y estrés
- **Lighthouse**: Para rendimiento del frontend

### 5. Pruebas de Seguridad

- **Autenticación y Autorización**: Verificar que los mecanismos de seguridad funcionen correctamente.
- **Validación de Entradas**: Probar la resistencia a ataques de inyección.
- **Protección contra Ataques Comunes**: XSS, CSRF, etc.

Herramientas recomendadas:
- **OWASP ZAP**: Para análisis de vulnerabilidades
- **SonarQube**: Para análisis estático de código

## Configuración del Entorno de Pruebas

### Backend

```bash
# Instalar dependencias de desarrollo
npm install --save-dev jest supertest mongodb-memory-server

# Configurar Jest
npx jest --init
```

Archivo `jest.config.js` recomendado:

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['./jest.setup.js']
};
```

### Frontend

```bash
# Instalar dependencias de desarrollo
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Para pruebas end-to-end
npm install --save-dev cypress
```

## Ejecución de Pruebas

### Comandos Principales

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con cobertura
npm test -- --coverage

# Ejecutar pruebas en modo watch
npm test -- --watch

# Ejecutar pruebas end-to-end
npm run cypress:open
```

## Integración Continua

Se recomienda configurar un pipeline de CI/CD que ejecute automáticamente las pruebas en cada push o pull request. Herramientas recomendadas:

- **GitHub Actions**: Para repositorios alojados en GitHub
- **GitLab CI/CD**: Para repositorios alojados en GitLab
- **Jenkins**: Para entornos auto-hospedados

## Mejores Prácticas

1. **Escribir pruebas antes o durante el desarrollo** (TDD o desarrollo guiado por pruebas).
2. **Mantener las pruebas independientes** entre sí.
3. **Usar datos de prueba consistentes** y fáciles de entender.
4. **Nombrar las pruebas de manera descriptiva** para facilitar la depuración.
5. **Establecer un objetivo de cobertura** (recomendado: 80% o más).
6. **Revisar y refactorizar las pruebas** regularmente.
7. **Incluir pruebas para casos de error** y casos límite, no solo para el camino feliz.
8. **Documentar los casos de prueba** para facilitar su mantenimiento y comprensión.
9. **Automatizar las pruebas** siempre que sea posible para ahorrar tiempo y recursos.

## Estrategias de Mocking

### Mocks vs Stubs vs Spies

- **Mocks**: Reemplazan completamente la funcionalidad de un objeto o módulo.
- **Stubs**: Proporcionan respuestas predefinidas a llamadas específicas.
- **Spies**: Registran información sobre las llamadas a funciones sin alterar su comportamiento.

### Ejemplos de Mocking

#### Backend

```javascript
// Mockear un servicio externo
const mockPaymentService = {
  processPayment: jest.fn().mockResolvedValue({ success: true, transactionId: '123456' })
};

// Mockear una respuesta de base de datos
jest.mock('../models/User', () => ({
  findById: jest.fn().mockResolvedValue({
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'instructor'
  })
}));
```

#### Frontend

```javascript
// Mockear una llamada a API
jest.mock('../api/auth', () => ({
  login: jest.fn().mockResolvedValue({
    user: { id: '123', name: 'Test User', role: 'admin' },
    token: 'fake-jwt-token'
  })
}));

// Mockear un hook de React
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ id: '123' })
}));
```

## Análisis de Cobertura

El análisis de cobertura de código ayuda a identificar partes del código que no están siendo probadas adecuadamente.

### Métricas de Cobertura

- **Cobertura de líneas**: Porcentaje de líneas de código ejecutadas durante las pruebas.
- **Cobertura de ramas**: Porcentaje de ramas de decisión (if/else, switch) ejecutadas.
- **Cobertura de funciones**: Porcentaje de funciones llamadas durante las pruebas.
- **Cobertura de declaraciones**: Porcentaje de declaraciones ejecutadas.

### Generación de Informes

```bash
# Generar informe de cobertura
npm test -- --coverage

# Generar informe HTML detallado
npm test -- --coverage --coverageReporters="html"
```

## Solución de Problemas Comunes

### Pruebas Asíncronas

- Usar `async/await` para manejar código asíncrono.
- Asegurarse de que las promesas se resuelvan antes de finalizar la prueba.
- Utilizar `jest.useFakeTimers()` para controlar temporizadores.

### Pruebas Flaky (Inestables)

- Identificar y eliminar dependencias entre pruebas.
- Evitar dependencias de tiempo real usando mocks de tiempo.
- Asegurarse de que el entorno de prueba se reinicie completamente entre pruebas.

### Rendimiento de las Pruebas

- Agrupar pruebas relacionadas para reducir la configuración repetitiva.
- Usar `--runInBand` para pruebas que comparten recursos.
- Considerar el uso de paralelización para conjuntos de pruebas independientes.

## Recursos Adicionales

- [Documentación oficial de Jest](https://jestjs.io/docs/getting-started)
- [Documentación de React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Guía de Cypress](https://docs.cypress.io/guides/overview/why-cypress)
- [Mejores prácticas de OWASP para pruebas de seguridad](https://owasp.org/www-project-web-security-testing-guide/)

---

Este documento es una guía viva que debe actualizarse regularmente a medida que evoluciona el proyecto CTPGA Manager y sus necesidades de prueba.
