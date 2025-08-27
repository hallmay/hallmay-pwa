# Tests para el Proyecto Harvester

Este directorio contiene tests comprehensivos para todo el proyecto Harvester.

## Estructura de Tests

```
src/test/
├── setup.ts                 # Configuración global de tests
├── mocks/                  # Mocks reutilizables
│   ├── authMock.tsx       # Mock del contexto de autenticación
│   ├── syncMock.tsx       # Mock del contexto de sincronización
│   └── TestWrapper.tsx    # Wrapper para providers en tests
├── components/            # Tests de componentes comunes
│   ├── Button.test.tsx
│   ├── Card.test.tsx
│   ├── Input.test.tsx
│   └── Select.test.tsx
├── features/             # Tests de features específicas
│   ├── auth/
│   │   ├── LoginPage.test.tsx
│   │   ├── ProtectedRoute.test.tsx
│   │   └── WithRole.test.tsx
│   ├── harvest/
│   │   ├── Tabs.test.tsx
│   │   └── Filters.test.tsx
│   └── logistics/
│       └── TruckCard.test.tsx
├── hooks/               # Tests de custom hooks
│   └── useDeviceType.test.ts
├── services/           # Tests de servicios
│   └── export.test.ts
├── utils/             # Tests de utilidades
│   └── utils.test.ts
└── App.test.tsx       # Test del componente principal
```

## Comandos Disponibles

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests con interfaz visual
npm run test:ui

# Ejecutar tests una sola vez (CI)
npm run test:run

# Ejecutar tests con coverage
npm run test:coverage
```

## Tecnologías Utilizadas

- **Vitest**: Test runner moderno y rápido
- **@testing-library/react**: Testing utilities para React
- **@testing-library/user-event**: Simulación de eventos de usuario
- **@testing-library/jest-dom**: Matchers adicionales para DOM

## Configuración

Los tests están configurados para:

- Usar `jsdom` como entorno de navegador
- Cargar automáticamente mocks globales
- Soporte para TypeScript
- Integración con VS Code

## Mocks Globales

- **Firebase**: Mock completo de auth, firestore y storage
- **React Router**: Mock de navegación y hooks de routing
- **matchMedia**: Mock para tests de responsive design
- **IntersectionObserver**: Mock para componentes con observadores
- **ResizeObserver**: Mock para componentes que responden a cambios de tamaño

## Cobertura de Tests

Los tests cubren:

### Componentes UI
- [x] Button - Estados, variantes, eventos
- [x] Card - Renderizado, props, estilos
- [x] Input - Validación, eventos, estados de error
- [x] Select - Opciones, selección, estados especiales

### Autenticación
- [x] LoginPage - Formulario, validación, estados
- [x] ProtectedRoute - Redirecciones, autenticación
- [x] WithRole - Control de acceso basado en roles

### Features
- [x] Tabs - Navegación, estados activos
- [x] Filters - Filtrado, opciones dinámicas
- [x] TruckCard - Visualización, interacciones

### Hooks
- [x] useDeviceType - Detección de dispositivos

### Servicios
- [x] Export - Generación CSV/XLSX, formateo de datos

### Utilidades
- [x] formatNumber - Formateo numérico
- [x] getSessionWithRecalculatedYields - Cálculos de rendimiento

## Mejores Prácticas

1. **Aislamiento**: Cada test es independiente y no afecta a otros
2. **Mocks**: Uso de mocks para dependencias externas
3. **Cobertura**: Tests cubren casos felices, edge cases y errores
4. **Legibilidad**: Tests descriptivos con nombres claros
5. **Performance**: Tests rápidos y eficientes

## Ejecutar Tests Específicos

```bash
# Tests de un archivo específico
npm run test Button.test.tsx

# Tests de un directorio
npm run test features/auth

# Tests que coincidan con un patrón
npm run test -- --grep="Login"
```

## Debugging Tests

Para debuggear tests en VS Code:
1. Usar la extensión "Vitest"
2. Configurar breakpoints
3. Ejecutar tests en modo debug

## CI/CD

Los tests están configurados para ejecutarse automáticamente en:
- Pre-commit hooks
- Pull requests
- Builds de producción
